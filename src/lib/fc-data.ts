import { useSyncExternalStore } from "react";

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
};

export type Team = {
  id: string;
  torneio_id: string;
  nome: string;
  escudo_url: string;
  ativo_pelo_admin: boolean;
  ocupado: boolean;
  grupo?: "A" | "B" | "C" | "D" | null;
};

export type Player = {
  id: string;
  torneio_id: string;
  nome_completo: string;
  gamertag_nick: string;
  mes_ano_nascimento: string;
  celular?: string;
  time_id: string;
};

export type Match = {
  id: string;
  torneio_id: string;
  fase: "grupos" | "quartas" | "semi" | "final";
  grupo?: "A" | "B" | "C" | "D";
  ordem: number;
  /** Identificador do confronto (usado para ida e volta). */
  chave?: string;
  /** 1 = jogo de ida, 2 = jogo de volta. */
  perna?: 1 | 2;
  time_mandante_id: string;
  time_visitante_id: string;
  gols_mandante: number | null;
  gols_visitante: number | null;
  penaltis_mandante: number | null;
  penaltis_visitante: number | null;
  status: "pendente" | "concluido" | "wo";
  data_jogo?: string | null;
};

const TOURNAMENT_ID = "t1";

const teamsSeed: Array<{ nome: string; escudo: string }> = [
  { nome: "Brasil", escudo: "https://flagcdn.com/h40/br.png" },
  { nome: "Argentina", escudo: "https://flagcdn.com/h40/ar.png" },
  { nome: "França", escudo: "https://flagcdn.com/h40/fr.png" },
  { nome: "Alemanha", escudo: "https://flagcdn.com/h40/de.png" },
  { nome: "Espanha", escudo: "https://flagcdn.com/h40/es.png" },
  { nome: "Portugal", escudo: "https://flagcdn.com/h40/pt.png" },
  { nome: "Inglaterra", escudo: "https://flagcdn.com/h40/gb-eng.png" },
  { nome: "Itália", escudo: "https://flagcdn.com/h40/it.png" },
  { nome: "Real Madrid", escudo: "https://media.api-sports.io/football/teams/541.png" },
  { nome: "Barcelona", escudo: "https://media.api-sports.io/football/teams/529.png" },
  { nome: "Manchester City", escudo: "https://media.api-sports.io/football/teams/50.png" },
  { nome: "Liverpool", escudo: "https://media.api-sports.io/football/teams/40.png" },
  { nome: "Bayern Munich", escudo: "https://media.api-sports.io/football/teams/157.png" },
  { nome: "PSG", escudo: "https://media.api-sports.io/football/teams/85.png" },
  { nome: "Flamengo", escudo: "https://escudosfc.com.br/images/fla.png" },
  { nome: "Palmeiras", escudo: "https://upload.wikimedia.org/wikipedia/commons/6/60/SE_Palmeiras_2025_crest.png?utm_source=pt.wikipedia.org&utm_campaign=index&utm_content=thumbnail_unscaled" },
];

const initialTournament: Tournament = {
  id: TOURNAMENT_ID,
  nome: "I Copa Piracicaba de FC 26",
  codigo_unico: "FC26-2026",
  chave_mestra_admin: "ADM-8891",
  regulamento_texto:
    "Regulamento oficial da I Copa Piracicaba de FC 26.\n\n1. Formato: Fase de grupos + mata-mata estilo Copa do Mundo.\n2. Jogos em EA Sports FC 26, dificuldade Lendário, 6 min por tempo.\n3. Cada jogador escolhe um único time no ato da inscrição.\n4. WO após 10 min de atraso.\n5. Em caso de empate no mata-mata: prorrogação + pênaltis.",
  max_jogadores: 16,
  formato_mata_mata: "jogo_unico",
  status: "em_andamento",
  data_limite_inscricoes: null,
};

const initialTeams: Team[] = teamsSeed.map((t, i) => ({
  id: `team-${i + 1}`,
  torneio_id: TOURNAMENT_ID,
  nome: t.nome,
  escudo_url: t.escudo,
  ativo_pelo_admin: true,
  ocupado: true,
  grupo: (["A", "B", "C", "D"] as const)[Math.floor(i / 4)],
}));

const realPlayers: Player[] = [
  { id: "p1", torneio_id: TOURNAMENT_ID, nome_completo: "Lucas Almeida", gamertag_nick: "LucasGOAT10", mes_ano_nascimento: "06/1998", time_id: "team-1" },
  { id: "p2", torneio_id: TOURNAMENT_ID, nome_completo: "Rafael Souza", gamertag_nick: "RafaKing", mes_ano_nascimento: "11/2001", time_id: "team-4" },
  { id: "p3", torneio_id: TOURNAMENT_ID, nome_completo: "Pedro Martins", gamertag_nick: "P3dr0M", mes_ano_nascimento: "03/1995", time_id: "team-8" },
  { id: "p4", torneio_id: TOURNAMENT_ID, nome_completo: "Bruno Costa", gamertag_nick: "BrunoC7", mes_ano_nascimento: "09/2000", time_id: "team-11" },
];
const botPlayers: Player[] = initialTeams
  .filter((t) => !realPlayers.some((p) => p.time_id === t.id))
  .map((t, i) => ({
    id: `pb-${i + 1}`,
    torneio_id: TOURNAMENT_ID,
    nome_completo: `Jogador ${i + 5}`,
    gamertag_nick: `Player${i + 5}`,
    mes_ano_nascimento: "01/2000",
    time_id: t.id,
  }));
const initialPlayers: Player[] = [...realPlayers, ...botPlayers];

type State = {
  tournaments: Tournament[];
  teams: Team[];
  players: Player[];
  matches: Match[];
};

function buildInitialMatches(): Match[] {
  // 4 groups of 4 by team id order
  const groups: Record<"A" | "B" | "C" | "D", string[]> = {
    A: ["team-1", "team-2", "team-3", "team-4"],
    B: ["team-5", "team-6", "team-7", "team-8"],
    C: ["team-9", "team-10", "team-11", "team-12"],
    D: ["team-13", "team-14", "team-15", "team-16"],
  };
  const matches: Match[] = [];
  let ordem = 0;
  (["A", "B", "C", "D"] as const).forEach((g) => {
    const ids = groups[g];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        matches.push({
          id: `m-g${g}-${i}${j}`,
          torneio_id: TOURNAMENT_ID,
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
  // Pre-complete most group matches with deterministic scores; leave a few pending
  const completedIdx = new Set([0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22]);
  matches.forEach((m, idx) => {
    if (completedIdx.has(idx)) {
      const gm = (idx * 3) % 4;
      const gv = (idx * 2 + 1) % 4;
      m.gols_mandante = gm;
      m.gols_visitante = gv;
      m.status = "concluido";
    }
  });
  return matches;
}

let state: State = {
  tournaments: [initialTournament],
  teams: initialTeams,
  players: initialPlayers,
  matches: buildInitialMatches(),
};

const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function getSnapshot() {
  return state;
}

export function useFcState<T>(selector: (s: State) => T): T {
  const getSelected = () => selector(getSnapshot());
  const state = useSyncExternalStore(subscribe, getStateSnapshot, getStateSnapshot);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = state;
  return getSelected();
}

function getStateSnapshot() {
  return state;
}

export function getTournamentByCode(codigo: string): Tournament | undefined {
  return state.tournaments.find(
    (t) => t.codigo_unico.toLowerCase() === codigo.toLowerCase(),
  );
}

export type RegisterResult =
  | { ok: true; player: Player; team: Team }
  | { ok: false; error: string };

export function registerPlayer(input: {
  torneio_id: string;
  nome_completo: string;
  gamertag_nick: string;
  mes_ano_nascimento: string;
  celular?: string;
  time_id: string;
}): RegisterResult {
  const team = state.teams.find(
    (t) => t.id === input.time_id && t.torneio_id === input.torneio_id,
  );
  if (!team) return { ok: false, error: "Time não encontrado." };
  if (team.ocupado)
    return { ok: false, error: "Este time acaba de ser escolhido por outro jogador." };

  const duplicate = state.players.find(
    (p) =>
      p.torneio_id === input.torneio_id &&
      p.gamertag_nick.trim().toLowerCase() === input.gamertag_nick.trim().toLowerCase(),
  );
  if (duplicate)
    return { ok: false, error: "Esta Gamertag já está inscrita neste torneio." };

  const player: Player = {
    id: `p-${Date.now()}`,
    ...input,
  };

  state = {
    ...state,
    players: [...state.players, player],
    teams: state.teams.map((t) =>
      t.id === team.id ? { ...t, ocupado: true } : t,
    ),
  };
  emit();
  const updatedTeam = state.teams.find((t) => t.id === team.id)!;
  return { ok: true, player, team: updatedTeam };
}

/* ============= Admin actions ============= */

function setState(next: State) {
  state = next;
  emit();
}

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

export function createTournament(input: CreateTournamentInput): CreateTournamentResult {
  if (!input.nome.trim()) return { ok: false, error: "Informe o nome do torneio." };
  if (!input.codigo_unico.trim()) return { ok: false, error: "Informe um código único." };
  if (!input.chave_mestra_admin.trim()) return { ok: false, error: "Informe a chave mestra." };
  if (input.max_jogadores < 4 || input.max_jogadores % 2 !== 0) {
    return { ok: false, error: "O número de times deve ser par e no mínimo 4." };
  }
  if (input.teams.length !== input.max_jogadores) {
    return { ok: false, error: `Selecione exatamente ${input.max_jogadores} times.` };
  }
  const exists = state.tournaments.some(
    (t) => t.codigo_unico.toLowerCase() === input.codigo_unico.toLowerCase(),
  );
  if (exists) return { ok: false, error: "Já existe um torneio com este código." };

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
  const teams: Team[] = input.teams.map((t, i) => ({
    id: `${id}-team-${i + 1}`,
    torneio_id: id,
    nome: t.nome,
    escudo_url: t.escudo_url,
    ativo_pelo_admin: true,
    ocupado: false,
    grupo: null,
  }));
  setState({
    ...state,
    tournaments: [...state.tournaments, tournament],
    teams: [...state.teams, ...teams],
    players: [...state.players],
    matches: [...state.matches],
  });
  return { ok: true, tournament };
}

export function setRegistrationDeadline(id: string, data_limite: string | null) {
  setState({
    ...state,
    tournaments: state.tournaments.map((t) =>
      t.id === id ? { ...t, data_limite_inscricoes: data_limite } : t,
    ),
  });
}

export function isRegistrationOpen(tournament: Tournament): { open: boolean; reason?: string } {
  if (tournament.status !== "inscricoes_abertas") {
    return { open: false, reason: "As inscrições estão fechadas para este torneio." };
  }
  if (hasTournamentStarted(tournament.id)) {
    return { open: false, reason: "O torneio já começou. Não é mais possível se inscrever." };
  }
  if (tournament.data_limite_inscricoes) {
    const limite = new Date(tournament.data_limite_inscricoes);
    if (!isNaN(limite.getTime()) && Date.now() > limite.getTime()) {
      return { open: false, reason: "O prazo de inscrição encerrou-se." };
    }
  }
  return { open: true };
}

export function setTournamentStatus(id: string, status: Tournament["status"]) {
  setState({
    ...state,
    tournaments: state.tournaments.map((t) => (t.id === id ? { ...t, status } : t)),
  });
  if (status === "em_andamento") {
    // regenerate group matches if empty
    const has = state.matches.some((m) => m.torneio_id === id);
    if (!has) {
      setState({ ...state, matches: buildInitialMatches() });
    }
  }
}

export function updateRegulamento(id: string, regulamento_texto: string) {
  setState({
    ...state,
    tournaments: state.tournaments.map((t) =>
      t.id === id ? { ...t, regulamento_texto } : t,
    ),
  });
}

export function deleteTournament(id: string) {
  setState({
    ...state,
    tournaments: state.tournaments.filter((t) => t.id !== id),
    teams: state.teams.filter((t) => t.torneio_id !== id),
    players: state.players.filter((p) => p.torneio_id !== id),
    matches: state.matches.filter((m) => m.torneio_id !== id),
  });
}

export function toggleTeamAtivo(teamId: string, ativo: boolean) {
  setState({
    ...state,
    teams: state.teams.map((t) =>
      t.id === teamId ? { ...t, ativo_pelo_admin: ativo } : t,
    ),
  });
}

export function deletePlayer(playerId: string) {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return;
  setState({
    ...state,
    players: state.players.filter((p) => p.id !== playerId),
    teams: state.teams.map((t) =>
      t.id === player.time_id ? { ...t, ocupado: false } : t,
    ),
  });
}

export function fillWithBots(torneio_id: string) {
  const tour = state.tournaments.find((t) => t.id === torneio_id);
  if (!tour) return;
  const players = state.players.filter((p) => p.torneio_id === torneio_id);
  const need = tour.max_jogadores - players.length;
  if (need <= 0) return;
  const freeTeams = state.teams.filter(
    (t) => t.torneio_id === torneio_id && t.ativo_pelo_admin && !t.ocupado,
  );
  const toFill = Math.min(need, freeTeams.length);
  const newPlayers: Player[] = [];
  const usedTeamIds = new Set<string>();
  for (let i = 0; i < toFill; i++) {
    const team = freeTeams[i];
    usedTeamIds.add(team.id);
    newPlayers.push({
      id: `bot-${Date.now()}-${i}`,
      torneio_id,
      nome_completo: `BOT ${players.length + i + 1}`,
      gamertag_nick: `BOT_${players.length + i + 1}`,
      mes_ano_nascimento: "01/2000",
      time_id: team.id,
    });
  }
  setState({
    ...state,
    players: [...state.players, ...newPlayers],
    teams: state.teams.map((t) => (usedTeamIds.has(t.id) ? { ...t, ocupado: true } : t)),
  });
}

/* ============= Match logic ============= */

export const GRUPOS = ["A", "B", "C", "D"] as const;
export type Grupo = (typeof GRUPOS)[number];

/** Define manualmente o grupo de um time. */
export function setTeamGroup(teamId: string, grupo: Grupo | null) {
  setState({
    ...state,
    teams: state.teams.map((t) => (t.id === teamId ? { ...t, grupo } : t)),
  });
}

/** Torneios com 4 times não têm fase de grupos: vão direto ao mata-mata. */
export function isDirectKnockout(torneio_id: string): boolean {
  const t = state.tournaments.find((x) => x.id === torneio_id);
  return !!t && t.max_jogadores <= 4;
}

/** Sorteia aleatoriamente os times ocupados em 4 grupos. */
export function drawGroups(torneio_id: string) {
  if (isDirectKnockout(torneio_id)) {
    drawDirectKnockout(torneio_id);
    return;
  }
  const pool = state.teams.filter(
    (t) => t.torneio_id === torneio_id && t.ativo_pelo_admin && t.ocupado,
  );
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const assign = new Map<string, Grupo>();
  shuffled.forEach((t, i) => assign.set(t.id, GRUPOS[i % 4]));
  setState({
    ...state,
    teams: state.teams.map((t) =>
      t.torneio_id === torneio_id
        ? { ...t, grupo: assign.get(t.id) ?? null }
        : t,
    ),
  });
  generateGroupMatches(torneio_id);
}

export function clearGroups(torneio_id: string) {
  setState({
    ...state,
    teams: state.teams.map((t) =>
      t.torneio_id === torneio_id ? { ...t, grupo: null } : t,
    ),
    matches: state.matches.filter((m) => m.torneio_id !== torneio_id),
  });
}

/** (Re)gera as partidas da fase de grupos a partir dos grupos definidos. */
export function generateGroupMatches(torneio_id: string): {
  ok: boolean;
  error?: string;
} {
  if (isDirectKnockout(torneio_id)) return drawDirectKnockout(torneio_id);
  const matches: Match[] = [];
  let ordem = 0;
  let total = 0;
  GRUPOS.forEach((g) => {
    const ids = state.teams
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
  setState({
    ...state,
    matches: [
      ...state.matches.filter((m) => m.torneio_id !== torneio_id),
      ...matches,
    ],
  });
  return { ok: true };
}

function isKnockoutPhase(f: Match["fase"]) {
  return f === "quartas" || f === "semi" || f === "final";
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

export function saveMatchScore(
  matchId: string,
  gm: number,
  gv: number,
  pm?: number | null,
  pv?: number | null,
): { ok: boolean; error?: string } {
  const match = state.matches.find((m) => m.id === matchId);
  if (!match) return { ok: false, error: "Partida não encontrada." };
  const tied = gm === gv;
  const ko = isKnockoutPhase(match.fase);
  if (ko && tied) {
    if (pm == null || pv == null) return { ok: false, error: "Informe os pênaltis." };
    if (pm === pv) return { ok: false, error: "Pênaltis não podem empatar." };
  }
  setState({
    ...state,
    matches: state.matches.map((m) =>
      m.id === matchId
        ? {
            ...m,
            gols_mandante: gm,
            gols_visitante: gv,
            penaltis_mandante: ko && tied ? pm ?? null : null,
            penaltis_visitante: ko && tied ? pv ?? null : null,
            status: "concluido",
          }
        : m,
    ),
  });
  advanceBracketIfReady(match.torneio_id);
  return { ok: true };
}

export function launchWO(
  matchId: string,
  vencedor: "mandante" | "visitante",
): { ok: boolean; error?: string } {
  const match = state.matches.find((m) => m.id === matchId);
  if (!match) return { ok: false, error: "Partida não encontrada." };
  const gm = vencedor === "mandante" ? 3 : 0;
  const gv = vencedor === "visitante" ? 3 : 0;
  setState({
    ...state,
    matches: state.matches.map((m) =>
      m.id === matchId
        ? {
            ...m,
            gols_mandante: gm,
            gols_visitante: gv,
            penaltis_mandante: null,
            penaltis_visitante: null,
            status: "wo",
          }
        : m,
    ),
  });
  advanceBracketIfReady(match.torneio_id);
  return { ok: true };
}

/* ============= Standings ============= */

export type Standing = {
  time_id: string;
  P: number; J: number; V: number; E: number; D: number;
  GP: number; GC: number; SG: number;
};

export function computeGroupStandings(
  torneio_id: string,
  grupo: "A" | "B" | "C" | "D",
): Standing[] {
  const matches = state.matches.filter(
    (m) => m.torneio_id === torneio_id && m.fase === "grupos" && m.grupo === grupo,
  );
  const teamIds = new Set<string>();
  state.teams
    .filter((t) => t.torneio_id === torneio_id && t.grupo === grupo && t.ocupado)
    .forEach((t) => teamIds.add(t.id));
  matches.forEach((m) => {
    teamIds.add(m.time_mandante_id);
    teamIds.add(m.time_visitante_id);
  });
  const table = new Map<string, Standing>();
  teamIds.forEach((id) =>
    table.set(id, { time_id: id, P: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0 }),
  );
  matches.forEach((m) => {
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

/* ============= Bracket ============= */

// QF slot map (World Cup style with 4 groups A/B/C/D):
// QF1: 1A vs 2B, QF2: 1C vs 2D, QF3: 1B vs 2A, QF4: 1D vs 2C
// SF1: W(QF1) vs W(QF2), SF2: W(QF3) vs W(QF4)
// Final: W(SF1) vs W(SF2)

function allGroupsFinished(torneio_id: string): boolean {
  const groupMatches = state.matches.filter(
    (m) => m.torneio_id === torneio_id && m.fase === "grupos",
  );
  return groupMatches.length > 0 && groupMatches.every((m) => m.status !== "pendente");
}

function advanceBracketIfReady(torneio_id: string) {
  // Ensure QF exists once groups done
  const hasQF = state.matches.some((m) => m.torneio_id === torneio_id && m.fase === "quartas");
  if (!hasQF && allGroupsFinished(torneio_id)) {
    const A = computeGroupStandings(torneio_id, "A");
    const B = computeGroupStandings(torneio_id, "B");
    const C = computeGroupStandings(torneio_id, "C");
    const D = computeGroupStandings(torneio_id, "D");
    const qf: Match[] = [
      makeKO("quartas", 0, A[0].time_id, B[1].time_id),
      makeKO("quartas", 1, C[0].time_id, D[1].time_id),
      makeKO("quartas", 2, B[0].time_id, A[1].time_id),
      makeKO("quartas", 3, D[0].time_id, C[1].time_id),
    ];
    state = { ...state, matches: [...state.matches, ...qf] };
  }
  // SF
  const qfMatches = state.matches
    .filter((m) => m.torneio_id === torneio_id && m.fase === "quartas")
    .sort((a, b) => a.ordem - b.ordem);
  const hasSF = state.matches.some((m) => m.torneio_id === torneio_id && m.fase === "semi");
  if (!hasSF && qfMatches.length === 4 && qfMatches.every((m) => winnerOf(m))) {
    const sf: Match[] = [
      makeKO("semi", 0, winnerOf(qfMatches[0])!, winnerOf(qfMatches[1])!),
      makeKO("semi", 1, winnerOf(qfMatches[2])!, winnerOf(qfMatches[3])!),
    ];
    state = { ...state, matches: [...state.matches, ...sf] };
  }
  // Final
  const sfMatches = state.matches
    .filter((m) => m.torneio_id === torneio_id && m.fase === "semi")
    .sort((a, b) => a.ordem - b.ordem);
  const hasFinal = state.matches.some((m) => m.torneio_id === torneio_id && m.fase === "final");
  if (!hasFinal && sfMatches.length === 2 && sfMatches.every((m) => winnerOf(m))) {
    const fin = makeKO("final", 0, winnerOf(sfMatches[0])!, winnerOf(sfMatches[1])!);
    state = { ...state, matches: [...state.matches, fin] };
  }
  emit();
}

function makeKO(
  fase: "quartas" | "semi" | "final",
  ordem: number,
  mandante: string,
  visitante: string,
): Match {
  return {
    id: `m-${fase}-${ordem}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    torneio_id: TOURNAMENT_ID,
    fase,
    ordem,
    time_mandante_id: mandante,
    time_visitante_id: visitante,
    gols_mandante: null,
    gols_visitante: null,
    penaltis_mandante: null,
    penaltis_visitante: null,
    status: "pendente",
  };
}

export function getMatchWinner(m: Match) {
  return winnerOf(m);
}

export function hasTournamentStarted(torneio_id: string): boolean {
  return state.matches.some(
    (m) => m.torneio_id === torneio_id && (m.status === "concluido" || m.status === "wo"),
  );
}

export function setMatchDate(matchId: string, data_jogo: string | null) {
  setState({
    ...state,
    matches: state.matches.map((m) =>
      m.id === matchId ? { ...m, data_jogo } : m,
    ),
  });
}

export function formatMatchDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
