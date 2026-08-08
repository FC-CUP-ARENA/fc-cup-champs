import { supabase } from "./supabase";

// ============================================================
// Types
// ============================================================

export type Tournament = {
  id: string;
  nome: string;
  codigo_unico: string;
  chave_mestra_admin: string;
  regulamento_texto: string;
  max_jogadores: number;
  formato_mata_mata: "jogo_unico" | "ida_e_volta";
  status: "inscricoes_abertas" | "em_andamento" | "finalizado";
  data_limite_inscricoes?: string | null;
  num_grupos?: number | null;
  chaveamento_config?: BracketConfig | null;
};

export type Team = {
  id: string;
  torneio_id: string;
  nome: string;
  escudo_url: string;
  ativo_pelo_admin: boolean;
  ocupado: boolean;
  grupo?: Grupo | null;
};

export type Player = {
  id: string;
  torneio_id: string;
  nome_completo: string;
  gamertag_nick: string;
  mes_ano_nascimento: string;
  celular?: string | null;
  time_id: string;
};

export type Match = {
  id: string;
  torneio_id: string;
  fase: "grupos" | "quartas" | "semi" | "final" | "terceiro";
  grupo?: Grupo | null;
  ordem: number;
  chave?: string | null;
  perna?: 1 | 2 | null;
  time_mandante_id: string;
  time_visitante_id: string;
  gols_mandante: number | null;
  gols_visitante: number | null;
  penaltis_mandante: number | null;
  penaltis_visitante: number | null;
  status: "pendente" | "concluido" | "wo";
  data_jogo?: string | null;
};

export type Standing = {
  time_id: string;
  P: number; J: number; V: number; E: number; D: number;
  GP: number; GC: number; SG: number;
};

export const GRUPOS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;
export type Grupo = (typeof GRUPOS)[number];

/** Uma vaga do chaveamento: posição `pos` (1 = 1º colocado) do grupo `grupo`. */
export type Seed = { grupo: Grupo; pos: number };
export type BracketPair = { a: Seed; b: Seed };
export type BracketConfig = {
  pares: BracketPair[];
  terceiro_lugar: boolean;
};

/** Grupos efetivamente usados pelo torneio. */
export function groupsOf(tournament: Pick<Tournament, "num_grupos">): Grupo[] {
  const n = Math.min(Math.max(tournament.num_grupos ?? 4, 1), GRUPOS.length);
  return GRUPOS.slice(0, n) as Grupo[];
}

/** Chaveamento padrão: 1º de um grupo x 2º do grupo seguinte (cruzado). */
export function defaultBracketConfig(
  numGrupos: number,
  terceiro_lugar = true,
): BracketConfig {
  const gs = GRUPOS.slice(0, Math.min(Math.max(numGrupos, 1), GRUPOS.length)) as Grupo[];
  const pares: BracketPair[] = [];
  if (gs.length === 1) {
    pares.push({ a: { grupo: gs[0], pos: 1 }, b: { grupo: gs[0], pos: 2 } });
  } else {
    for (let i = 0; i < gs.length; i++) {
      const other = gs[(i + 1) % gs.length];
      pares.push({ a: { grupo: gs[i], pos: 1 }, b: { grupo: other, pos: 2 } });
    }
  }
  return { pares, terceiro_lugar };
}

/** Embaralha os confrontos mantendo as mesmas vagas (1º nunca enfrenta o 2º do próprio grupo quando possível). */
export function randomizeBracketConfig(config: BracketConfig): BracketConfig {
  const seeds: Seed[] = config.pares.flatMap((p) => [p.a, p.b]);
  for (let attempt = 0; attempt < 40; attempt++) {
    const pool = [...seeds].sort(() => Math.random() - 0.5);
    const pares: BracketPair[] = [];
    let ok = true;
    for (let i = 0; i < pool.length; i += 2) {
      const a = pool[i];
      const b = pool[i + 1];
      if (!b) { ok = false; break; }
      if (a.grupo === b.grupo) { ok = false; break; }
      pares.push({ a, b });
    }
    if (ok) return { ...config, pares };
  }
  return config;
}

export function seedLabel(s: Seed): string {
  return `${s.pos}º ${s.grupo}`;
}

export function faseLabel(fase: Match["fase"]): string {
  switch (fase) {
    case "grupos": return "Fase de Grupos";
    case "quartas": return "Quartas de Final";
    case "semi": return "Semifinal";
    case "final": return "Final";
    case "terceiro": return "Disputa de 3º Lugar";
  }
}


// ============================================================
// Pure helpers (sem IO — usados em memória após fetch)
// ============================================================

export function isRegistrationOpen(tournament: Tournament): { open: boolean; reason?: string } {
  if (tournament.status !== "inscricoes_abertas") {
    return { open: false, reason: "As inscrições estão fechadas para este torneio." };
  }
  if (tournament.data_limite_inscricoes) {
    const limite = new Date(tournament.data_limite_inscricoes);
    if (!isNaN(limite.getTime()) && Date.now() > limite.getTime()) {
      return { open: false, reason: "O prazo de inscrição encerrou-se." };
    }
  }
  return { open: true };
}

export function formatMatchDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function calcularIdade(mesAno: string): number | null {
  const [mes, ano] = mesAno.split("/").map(Number);
  if (!mes || !ano) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - ano;
  if (hoje.getMonth() + 1 < mes) idade--;
  return idade;
}

export type CategoriaIdade = "sub10" | "sub12" | "sub15" | "pro";

export function calcularCategoria(mesAno: string): CategoriaIdade | null {
  const idade = calcularIdade(mesAno);
  if (idade === null) return null;
  if (idade <= 10) return "sub10";
  if (idade <= 12) return "sub12";
  if (idade <= 15) return "sub15";
  return "pro";
}

function winnerOf(m: Match): string | null {
  if (m.status !== "concluido" && m.status !== "wo") return null;
  const gm = m.gols_mandante ?? 0;
  const gv = m.gols_visitante ?? 0;
  if (gm > gv) return m.time_mandante_id;
  if (gv > gm) return m.time_visitante_id;
  const pm = m.penaltis_mandante ?? 0;
  const pv = m.penaltis_visitante ?? 0;
  if (pm > pv) return m.time_mandante_id;
  if (pv > pm) return m.time_visitante_id;
  return null;
}

export function getMatchWinner(m: Match) {
  return winnerOf(m);
}

function winnerOfTie(legs: Match[]): string | null {
  if (legs.length === 0) return null;
  if (legs.some((m) => m.status === "pendente")) return null;
  if (legs.length === 1) return winnerOf(legs[0]);
  const ordered = [...legs].sort((a, b) => (a.perna ?? 1) - (b.perna ?? 1));
  const teamA = ordered[0].time_mandante_id;
  const teamB = ordered[0].time_visitante_id;
  let ga = 0; let gb = 0;
  ordered.forEach((m) => {
    const gm = m.gols_mandante ?? 0;
    const gv = m.gols_visitante ?? 0;
    if (m.time_mandante_id === teamA) { ga += gm; gb += gv; }
    else { gb += gm; ga += gv; }
  });
  if (ga > gb) return teamA;
  if (gb > ga) return teamB;
  const last = ordered[ordered.length - 1];
  const pm = last.penaltis_mandante ?? 0;
  const pv = last.penaltis_visitante ?? 0;
  if (pm > pv) return last.time_mandante_id;
  if (pv > pm) return last.time_visitante_id;
  return null;
}

export function getTieWinner(legs: Match[]) {
  return winnerOfTie(legs);
}

export function getPhaseTies(matches: Match[], fase: Match["fase"]): Match[][] {
  const ms = matches
    .filter((m) => m.fase === fase)
    .sort((a, b) => a.ordem - b.ordem);
  const map = new Map<string, Match[]>();
  ms.forEach((m) => {
    const k = m.chave ?? m.id;
    map.set(k, [...(map.get(k) ?? []), m]);
  });
  return Array.from(map.values());
}

export function computeGroupStandings(
  matches: Match[],
  teams: Team[],
  torneio_id: string,
  grupo: Grupo,
): Standing[] {
  const groupMatches = matches.filter(
    (m) => m.torneio_id === torneio_id && m.fase === "grupos" && m.grupo === grupo,
  );
  const teamIds = new Set<string>();
  teams
    .filter((t) => t.torneio_id === torneio_id && t.grupo === grupo && t.ocupado)
    .forEach((t) => teamIds.add(t.id));
  groupMatches.forEach((m) => {
    teamIds.add(m.time_mandante_id);
    teamIds.add(m.time_visitante_id);
  });
  const table = new Map<string, Standing>();
  teamIds.forEach((id) =>
    table.set(id, { time_id: id, P: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0 }),
  );
  groupMatches.forEach((m) => {
    if (m.status === "pendente") return;
    const gm = m.gols_mandante ?? 0;
    const gv = m.gols_visitante ?? 0;
    const a = table.get(m.time_mandante_id)!;
    const b = table.get(m.time_visitante_id)!;
    a.J++; b.J++;
    a.GP += gm; a.GC += gv; a.SG = a.GP - a.GC;
    b.GP += gv; b.GC += gm; b.SG = b.GP - b.GC;
    if (gm > gv) { a.V++; a.P += 3; b.D++; }
    else if (gv > gm) { b.V++; b.P += 3; a.D++; }
    else { a.E++; b.E++; a.P++; b.P++; }
  });
  return Array.from(table.values()).sort((x, y) =>
    y.P - x.P || y.V - x.V || y.SG - x.SG || y.GP - x.GP,
  );
}

export function hasTournamentStarted(matches: Match[], torneio_id: string): boolean {
  return matches.some(
    (m) => m.torneio_id === torneio_id && (m.status === "concluido" || m.status === "wo"),
  );
}

export function isDirectKnockout(max_jogadores: number): boolean {
  return max_jogadores <= 4;
}


// ============================================================
// Bracket helpers (puro, opera sobre arrays já carregados)
// ============================================================

function isTwoLegged(tournament: Tournament): boolean {
  return tournament.formato_mata_mata === "ida_e_volta";
}

function makeTie(
  tournament: Tournament,
  fase: "quartas" | "semi" | "final" | "terceiro",
  ordem: number,
  a: string,
  b: string,
): Match[] {
  const chave = `${fase}-${ordem}`;
  const base = (perna: 1 | 2, mandante: string, visitante: string): Match => ({
    id: `m-${chave}-p${perna}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    torneio_id: tournament.id,
    fase,
    ordem: ordem * 2 + (perna - 1),
    chave,
    perna,
    time_mandante_id: mandante,
    time_visitante_id: visitante,
    gols_mandante: null,
    gols_visitante: null,
    penaltis_mandante: null,
    penaltis_visitante: null,
    status: "pendente",
  });
  const twoLegs = isTwoLegged(tournament) && fase !== "terceiro";
  return twoLegs ? [base(1, a, b), base(2, b, a)] : [base(1, a, b)];
}

function loserOfTie(legs: Match[]): string | null {
  const w = winnerOfTie(legs);
  if (!w) return null;
  const first = legs[0];
  if (!first) return null;
  return first.time_mandante_id === w ? first.time_visitante_id : first.time_mandante_id;
}

/** Configuração de chaveamento efetiva do torneio (com fallback para o padrão). */
export function bracketConfigOf(tournament: Tournament): BracketConfig {
  const cfg = tournament.chaveamento_config;
  if (cfg && Array.isArray(cfg.pares) && cfg.pares.length > 0) {
    return { pares: cfg.pares, terceiro_lugar: !!cfg.terceiro_lugar };
  }
  return defaultBracketConfig(tournament.num_grupos ?? 4, true);
}

/** Resolve as vagas do chaveamento em ids de times, a partir das classificações atuais. */
export function resolveBracketSeeds(
  tournament: Tournament,
  matches: Match[],
  teams?: Team[],
): Array<{ pair: BracketPair; aId: string | null; bId: string | null }> {
  const torneio_id = tournament.id;
  const groupMatches = matches.filter((m) => m.torneio_id === torneio_id && m.fase === "grupos");
  const cfg = bracketConfigOf(tournament);
  const cache = new Map<Grupo, ReturnType<typeof computeGroupStandings>>();

  const standingsOf = (g: Grupo) => {
    if (cache.has(g)) return cache.get(g)!;
    let stTeams: Team[] = (teams ?? []).filter((t) => t.torneio_id === torneio_id && t.grupo === g);
    if (stTeams.length === 0) {
      const ids = new Set<string>();
      groupMatches.filter((m) => m.grupo === g).forEach((m) => {
        ids.add(m.time_mandante_id);
        ids.add(m.time_visitante_id);
      });
      stTeams = [...ids].map((id) => ({
        id, torneio_id, nome: "", escudo_url: "", ativo_pelo_admin: true, ocupado: true, grupo: g,
      }));
    }
    const st = computeGroupStandings(groupMatches, stTeams, torneio_id, g);
    cache.set(g, st);
    return st;
  };

  const resolve = (s: Seed) => standingsOf(s.grupo)[s.pos - 1]?.time_id ?? null;
  return cfg.pares.map((pair) => ({ pair, aId: resolve(pair.a), bId: resolve(pair.b) }));
}

function firstKnockoutFase(nPares: number): "quartas" | "semi" | "final" {
  if (nPares >= 4) return "quartas";
  if (nPares === 2) return "semi";
  return "final";
}

/** Calcula as partidas de avanço de chave que precisam ser inseridas no Supabase. */
export function computeBracketAdvances(
  tournament: Tournament,
  matches: Match[],
): Match[] {
  const torneio_id = tournament.id;
  const directKO = isDirectKnockout(tournament.max_jogadores);

  function tiesOf(fase: Match["fase"]): Match[][] {
    return getPhaseTies(matches.filter((m) => m.torneio_id === torneio_id), fase);
  }

  const newMatches: Match[] = [];
  const cfg = bracketConfigOf(tournament);

  if (directKO) {
    const semis = tiesOf("semi");
    const hasFinal = matches.some((m) => m.torneio_id === torneio_id && m.fase === "final");
    if (!hasFinal && semis.length === 2 && semis.every((t) => winnerOfTie(t))) {
      newMatches.push(
        ...makeTie(tournament, "final", 0, winnerOfTie(semis[0])!, winnerOfTie(semis[1])!),
      );
      if (cfg.terceiro_lugar) {
        const l1 = loserOfTie(semis[0]);
        const l2 = loserOfTie(semis[1]);
        if (l1 && l2) newMatches.push(...makeTie(tournament, "terceiro", 1, l1, l2));
      }
    }
    return newMatches;
  }

  const koStarted = matches.some((m) => m.torneio_id === torneio_id && m.fase !== "grupos");
  const groupMatches = matches.filter((m) => m.torneio_id === torneio_id && m.fase === "grupos");
  const allGroupsDone =
    groupMatches.length > 0 && groupMatches.every((m) => m.status !== "pendente");

  if (!koStarted && allGroupsDone) {
    const resolved = resolveBracketSeeds(tournament, matches);
    const fase = firstKnockoutFase(resolved.length);
    resolved.forEach((r, i) => {
      if (r.aId && r.bId) newMatches.push(...makeTie(tournament, fase, i, r.aId, r.bId));
    });
    return newMatches;
  }

  const qfTies = tiesOf("quartas");
  const hasSF = matches.some((m) => m.torneio_id === torneio_id && m.fase === "semi");
  if (!hasSF && qfTies.length >= 2 && qfTies.every((t) => winnerOfTie(t))) {
    for (let i = 0; i + 1 < qfTies.length; i += 2) {
      newMatches.push(
        ...makeTie(tournament, "semi", i / 2, winnerOfTie(qfTies[i])!, winnerOfTie(qfTies[i + 1])!),
      );
    }
    return newMatches;
  }

  const sfTies = tiesOf("semi");
  const hasFinal = matches.some((m) => m.torneio_id === torneio_id && m.fase === "final");
  if (!hasFinal && sfTies.length === 2 && sfTies.every((t) => winnerOfTie(t))) {
    newMatches.push(
      ...makeTie(tournament, "final", 0, winnerOfTie(sfTies[0])!, winnerOfTie(sfTies[1])!),
    );
    if (cfg.terceiro_lugar) {
      const l1 = loserOfTie(sfTies[0]);
      const l2 = loserOfTie(sfTies[1]);
      if (l1 && l2) newMatches.push(...makeTie(tournament, "terceiro", 1, l1, l2));
    }
  }
  return newMatches;
}


// ============================================================
// Supabase — Tournament mutations
// ============================================================

export type CreateTournamentInput = {
  nome: string;
  codigo_unico: string;
  chave_mestra_admin: string;
  regulamento_texto: string;
  max_jogadores: number;
  formato_mata_mata: "jogo_unico" | "ida_e_volta";
  data_limite_inscricoes?: string | null;
  teams: Array<{ nome: string; escudo_url: string }>;
};

export type CreateTournamentResult =
  | { ok: true; tournament: Tournament }
  | { ok: false; error: string };

export async function createTournament(
  input: CreateTournamentInput,
): Promise<CreateTournamentResult> {
  if (!input.nome.trim()) return { ok: false, error: "Informe o nome do torneio." };
  if (!input.codigo_unico.trim()) return { ok: false, error: "Informe um código único." };
  if (!input.chave_mestra_admin.trim()) return { ok: false, error: "Informe a chave mestra." };
  if (input.max_jogadores < 4 || input.max_jogadores % 2 !== 0)
    return { ok: false, error: "O número de times deve ser par e no mínimo 4." };
  if (input.teams.length !== input.max_jogadores)
    return { ok: false, error: `Selecione exatamente ${input.max_jogadores} times.` };

  const id = `t-${Date.now()}`;
  const tournament: Tournament = {
    id,
    nome: input.nome.trim(),
    codigo_unico: input.codigo_unico.trim().toUpperCase(),
    chave_mestra_admin: input.chave_mestra_admin.trim().toUpperCase(),
    regulamento_texto: input.regulamento_texto,
    max_jogadores: input.max_jogadores,
    formato_mata_mata: input.formato_mata_mata,
    status: "inscricoes_abertas",
    data_limite_inscricoes: input.data_limite_inscricoes ?? null,
  };

  const { error: tErr } = await supabase.from("tournaments").insert(tournament);
  if (tErr) {
    if (tErr.code === "23505") return { ok: false, error: "Já existe um torneio com este código." };
    return { ok: false, error: tErr.message };
  }

  const teams: Team[] = input.teams.map((t, i) => ({
    id: `${id}-team-${i + 1}`,
    torneio_id: id,
    nome: t.nome,
    escudo_url: t.escudo_url,
    ativo_pelo_admin: true,
    ocupado: false,
    grupo: null,
  }));

  const { error: teErr } = await supabase.from("teams").insert(teams);
  if (teErr) return { ok: false, error: teErr.message };

  return { ok: true, tournament };
}

export async function addTeams(
  torneio_id: string,
  newTeams: Array<{ nome: string; escudo_url: string }>,
): Promise<{ ok: true; added: number } | { ok: false; error: string }> {
  if (newTeams.length === 0) return { ok: false, error: "Selecione ao menos um time." };

  const { data: existing, error: fetchErr } = await supabase
    .from("teams")
    .select("nome")
    .eq("torneio_id", torneio_id);
  if (fetchErr) return { ok: false, error: fetchErr.message };

  const existingNames = new Set((existing ?? []).map((t) => t.nome));
  const filtered = newTeams.filter((t) => !existingNames.has(t.nome));
  if (filtered.length === 0) return { ok: false, error: "Todos os times selecionados já estão no torneio." };

  const teams: Team[] = filtered.map((t, i) => ({
    id: `${torneio_id}-team-${Date.now()}-${i}`,
    torneio_id,
    nome: t.nome,
    escudo_url: t.escudo_url,
    ativo_pelo_admin: true,
    ocupado: false,
    grupo: null,
  }));

  const { error: teErr } = await supabase.from("teams").insert(teams);
  if (teErr) return { ok: false, error: teErr.message };

  const { data: tourney, error: tErr } = await supabase
    .from("tournaments")
    .select("max_jogadores")
    .eq("id", torneio_id)
    .single();
  if (!tErr && tourney) {
    const newMax = tourney.max_jogadores + filtered.length;
    await supabase.from("tournaments").update({ max_jogadores: newMax }).eq("id", torneio_id);
  }

  return { ok: true, added: filtered.length };
}

export async function setTournamentStatus(
  id: string,
  status: Tournament["status"],
): Promise<void> {
  await supabase.from("tournaments").update({ status }).eq("id", id);
}

export async function updateRegulamento(
  id: string,
  regulamento_texto: string,
): Promise<void> {
  await supabase.from("tournaments").update({ regulamento_texto }).eq("id", id);
}

export async function setRegistrationDeadline(
  id: string,
  data_limite: string | null,
): Promise<void> {
  await supabase
    .from("tournaments")
    .update({ data_limite_inscricoes: data_limite })
    .eq("id", id);
}

export async function deleteTournament(id: string): Promise<void> {
  await supabase.from("tournaments").delete().eq("id", id);
}

export async function setNumGrupos(id: string, num_grupos: number): Promise<void> {
  await supabase.from("tournaments").update({ num_grupos }).eq("id", id);
}

export async function setBracketConfig(id: string, config: BracketConfig): Promise<void> {
  await supabase
    .from("tournaments")
    .update({ chaveamento_config: config as unknown as Json })
    .eq("id", id);
}

/** Gera (ou regenera) o mata-mata a partir das classificações atuais dos grupos. */
export async function generateKnockoutFromGroups(
  tournament: Tournament,
  matches: Match[],
  teams: Team[],
): Promise<{ ok: boolean; error?: string }> {
  const resolved = resolveBracketSeeds(tournament, matches, teams);
  const pending = resolved.filter((r) => !r.aId || !r.bId);
  if (resolved.length === 0) return { ok: false, error: "Chaveamento não configurado." };
  if (pending.length > 0)
    return { ok: false, error: "Ainda não há classificação suficiente nos grupos para definir todos os confrontos." };

  const fase = firstKnockoutFase(resolved.length);
  const novos: Match[] = [];
  resolved.forEach((r, i) => novos.push(...makeTie(tournament, fase, i, r.aId!, r.bId!)));

  await supabase
    .from("matches")
    .delete()
    .eq("torneio_id", tournament.id)
    .neq("fase", "grupos");
  const { error } = await supabase.from("matches").insert(novos);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}


// ============================================================
// Supabase — Team mutations
// ============================================================

export async function toggleTeamAtivo(teamId: string, ativo: boolean): Promise<void> {
  await supabase.from("teams").update({ ativo_pelo_admin: ativo }).eq("id", teamId);
}

export async function setTeamGroup(teamId: string, grupo: Grupo | null): Promise<void> {
  await supabase.from("teams").update({ grupo }).eq("id", teamId);
}

// ============================================================
// Supabase — Player mutations
// ============================================================

export type RegisterResult =
  | { ok: true; player: Player; team: Team }
  | { ok: false; error: string };

export async function registerPlayer(input: {
  torneio_id: string;
  nome_completo: string;
  gamertag_nick: string;
  mes_ano_nascimento: string;
  celular?: string;
  time_id: string;
}): Promise<RegisterResult> {
  // Fetch team with lock check
  const { data: teamData, error: teamErr } = await supabase
    .from("teams")
    .select("*")
    .eq("id", input.time_id)
    .eq("torneio_id", input.torneio_id)
    .single();

  if (teamErr || !teamData) return { ok: false, error: "Time não encontrado." };
  if (teamData.ocupado) return { ok: false, error: "Este time acaba de ser escolhido por outro jogador." };

  // Check gamertag uniqueness
  const { data: dupData } = await supabase
    .from("players")
    .select("id")
    .eq("torneio_id", input.torneio_id)
    .ilike("gamertag_nick", input.gamertag_nick.trim())
    .maybeSingle();

  if (dupData) return { ok: false, error: "Esta Gamertag já está inscrita neste torneio." };

  const player: Player = {
    id: `p-${Date.now()}`,
    torneio_id: input.torneio_id,
    nome_completo: input.nome_completo,
    gamertag_nick: input.gamertag_nick,
    mes_ano_nascimento: input.mes_ano_nascimento,
    celular: input.celular ?? null,
    time_id: input.time_id,
  };

  const { error: pErr } = await supabase.from("players").insert(player);
  if (pErr) return { ok: false, error: pErr.message };

  const { error: tErr } = await supabase
    .from("teams")
    .update({ ocupado: true })
    .eq("id", input.time_id);
  if (tErr) return { ok: false, error: tErr.message };

  const updatedTeam: Team = { ...teamData, ocupado: true };
  return { ok: true, player, team: updatedTeam };
}

export async function deletePlayer(playerId: string): Promise<void> {
  const { data: player } = await supabase
    .from("players")
    .select("time_id")
    .eq("id", playerId)
    .single();

  await supabase.from("players").delete().eq("id", playerId);

  if (player?.time_id) {
    await supabase.from("teams").update({ ocupado: false }).eq("id", player.time_id);
  }
}

export async function fillWithBots(
  tournament: Tournament,
  players: Player[],
  teams: Team[],
): Promise<void> {
  const need = tournament.max_jogadores - players.length;
  if (need <= 0) return;

  const freeTeams = teams.filter(
    (t) => t.torneio_id === tournament.id && t.ativo_pelo_admin && !t.ocupado,
  );
  const toFill = Math.min(need, freeTeams.length);
  const newPlayers: Player[] = [];
  const usedTeamIds: string[] = [];

  for (let i = 0; i < toFill; i++) {
    const team = freeTeams[i];
    usedTeamIds.push(team.id);
    newPlayers.push({
      id: `bot-${Date.now()}-${i}`,
      torneio_id: tournament.id,
      nome_completo: `BOT ${players.length + i + 1}`,
      gamertag_nick: `BOT_${players.length + i + 1}`,
      mes_ano_nascimento: "01/2000",
      time_id: team.id,
    });
  }

  if (newPlayers.length > 0) {
    await supabase.from("players").insert(newPlayers);
    for (const tid of usedTeamIds) {
      await supabase.from("teams").update({ ocupado: true }).eq("id", tid);
    }
  }
}


// ============================================================
// Supabase — Match mutations
// ============================================================

export async function saveMatchScore(
  match: Match,
  allMatches: Match[],
  tournament: Tournament,
  gm: number,
  gv: number,
  pm?: number | null,
  pv?: number | null,
): Promise<{ ok: boolean; error?: string }> {
  const tied = gm === gv;
  const ko = match.fase !== "grupos";
  const twoLeg = ko && match.perna != null && tournament.formato_mata_mata === "ida_e_volta";
  let needsPen = ko && tied && !twoLeg;

  if (twoLeg && match.perna === 2) {
    const legs = allMatches.filter(
      (m) => m.torneio_id === match.torneio_id && m.chave === match.chave,
    );
    const first = legs.find((m) => m.perna === 1);
    if (first && first.status !== "pendente") {
      const aggHome = gm + (first.gols_visitante ?? 0);
      const aggAway = gv + (first.gols_mandante ?? 0);
      needsPen = aggHome === aggAway;
    }
  }

  if (needsPen) {
    if (pm == null || pv == null) return { ok: false, error: "Informe os pênaltis." };
    if (pm === pv) return { ok: false, error: "Pênaltis não podem empatar." };
  }

  const { error } = await supabase.from("matches").update({
    gols_mandante: gm,
    gols_visitante: gv,
    penaltis_mandante: needsPen ? (pm ?? null) : null,
    penaltis_visitante: needsPen ? (pv ?? null) : null,
    status: "concluido",
  }).eq("id", match.id);

  if (error) return { ok: false, error: error.message };

  // Recalculate bracket advances
  const updatedMatches = allMatches.map((m) =>
    m.id === match.id
      ? { ...m, gols_mandante: gm, gols_visitante: gv,
          penaltis_mandante: needsPen ? (pm ?? null) : null,
          penaltis_visitante: needsPen ? (pv ?? null) : null,
          status: "concluido" as const }
      : m,
  );
  const advances = computeBracketAdvances(tournament, updatedMatches);
  if (advances.length > 0) {
    await supabase.from("matches").insert(advances);
  }

  return { ok: true };
}

export async function launchWO(
  match: Match,
  allMatches: Match[],
  tournament: Tournament,
  vencedor: "mandante" | "visitante",
): Promise<{ ok: boolean; error?: string }> {
  const gm = vencedor === "mandante" ? 3 : 0;
  const gv = vencedor === "visitante" ? 3 : 0;

  const { error } = await supabase.from("matches").update({
    gols_mandante: gm,
    gols_visitante: gv,
    penaltis_mandante: null,
    penaltis_visitante: null,
    status: "wo",
  }).eq("id", match.id);

  if (error) return { ok: false, error: error.message };

  const updatedMatches = allMatches.map((m) =>
    m.id === match.id
      ? { ...m, gols_mandante: gm, gols_visitante: gv,
          penaltis_mandante: null, penaltis_visitante: null, status: "wo" as const }
      : m,
  );
  const advances = computeBracketAdvances(tournament, updatedMatches);
  if (advances.length > 0) {
    await supabase.from("matches").insert(advances);
  }

  return { ok: true };
}

export async function setMatchDate(matchId: string, data_jogo: string | null): Promise<void> {
  await supabase.from("matches").update({ data_jogo }).eq("id", matchId);
}


// ============================================================
// Supabase — Group draw mutations
// ============================================================

export async function drawGroups(
  tournament: Tournament,
  teams: Team[],
): Promise<{ ok: boolean; error?: string }> {
  if (isDirectKnockout(tournament.max_jogadores)) {
    return drawDirectKnockout(tournament, teams);
  }

  const pool = teams.filter(
    (t) => t.torneio_id === tournament.id && t.ativo_pelo_admin && t.ocupado,
  );
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const assign = new Map<string, Grupo>();
  shuffled.forEach((t, i) => assign.set(t.id, GRUPOS[i % 4]));

  for (const [teamId, grupo] of assign.entries()) {
    await supabase.from("teams").update({ grupo }).eq("id", teamId);
  }

  // Generate group matches
  const updatedTeams = teams.map((t) =>
    assign.has(t.id) ? { ...t, grupo: assign.get(t.id)! } : t,
  );
  return generateGroupMatches(tournament, updatedTeams);
}

export async function clearGroups(torneio_id: string): Promise<void> {
  await supabase.from("teams").update({ grupo: null }).eq("torneio_id", torneio_id);
  await supabase.from("matches").delete().eq("torneio_id", torneio_id);
}

export async function generateGroupMatches(
  tournament: Tournament,
  teams: Team[],
): Promise<{ ok: boolean; error?: string }> {
  if (isDirectKnockout(tournament.max_jogadores)) {
    return drawDirectKnockout(tournament, teams);
  }

  const torneio_id = tournament.id;
  const matches: Match[] = [];
  let ordem = 0;
  let total = 0;

  GRUPOS.forEach((g) => {
    const ids = teams
      .filter((t) => t.torneio_id === torneio_id && t.grupo === g && t.ocupado)
      .map((t) => t.id);
    total += ids.length;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        matches.push({
          id: `m-g${g}-${ids[i]}-${ids[j]}`,
          torneio_id,
          fase: "grupos",
          grupo: g,
          ordem: ordem++,
          time_mandante_id: ids[i],
          time_visitante_id: ids[j],
          gols_mandante: null,
          gols_visitante: null,
          penaltis_mandante: null,
          penaltis_visitante: null,
          status: "pendente",
        });
      }
    }
  });

  if (total === 0) return { ok: false, error: "Nenhum time foi alocado em grupos." };

  // Delete old matches for this tournament first, then insert new ones
  await supabase.from("matches").delete().eq("torneio_id", torneio_id);
  const { error } = await supabase.from("matches").insert(matches);
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

export async function drawDirectKnockout(
  tournament: Tournament,
  teams: Team[],
): Promise<{ ok: boolean; error?: string }> {
  const pool = teams.filter(
    (t) => t.torneio_id === tournament.id && t.ativo_pelo_admin && t.ocupado,
  );
  if (pool.length < 4)
    return { ok: false, error: "São necessários 4 times inscritos para sortear o mata-mata." };

  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 4);
  const semis: Match[] = [
    ...makeTie(tournament, "semi", 0, shuffled[0].id, shuffled[3].id),
    ...makeTie(tournament, "semi", 1, shuffled[1].id, shuffled[2].id),
  ];

  // Clear groups on teams
  await supabase.from("teams").update({ grupo: null }).eq("torneio_id", tournament.id);
  await supabase.from("matches").delete().eq("torneio_id", tournament.id);
  const { error } = await supabase.from("matches").insert(semis);
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}
