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
};

export type Team = {
  id: string;
  torneio_id: string;
  nome: string;
  escudo_url: string;
  ativo_pelo_admin: boolean;
  ocupado: boolean;
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
  time_mandante_id: string;
  time_visitante_id: string;
  gols_mandante: number | null;
  gols_visitante: number | null;
  penaltis_mandante: number | null;
  penaltis_visitante: number | null;
  status: "pendente" | "concluido" | "wo";
};

const TOURNAMENT_ID = "t1";

const teamsSeed: Array<{ nome: string; escudo: string }> = [
  { nome: "Brasil", escudo: "🇧🇷" },
  { nome: "Argentina", escudo: "🇦🇷" },
  { nome: "França", escudo: "🇫🇷" },
  { nome: "Alemanha", escudo: "🇩🇪" },
  { nome: "Espanha", escudo: "🇪🇸" },
  { nome: "Portugal", escudo: "🇵🇹" },
  { nome: "Inglaterra", escudo: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { nome: "Itália", escudo: "🇮🇹" },
  { nome: "Real Madrid", escudo: "⚪" },
  { nome: "Barcelona", escudo: "🔵" },
  { nome: "Manchester City", escudo: "🩵" },
  { nome: "Liverpool", escudo: "🔴" },
  { nome: "Bayern Munich", escudo: "🅱️" },
  { nome: "PSG", escudo: "🅿️" },
  { nome: "Flamengo", escudo: "🔴⚫" },
  { nome: "Palmeiras", escudo: "🟢" },
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
};

const initialTeams: Team[] = teamsSeed.map((t, i) => ({
  id: `team-${i + 1}`,
  torneio_id: TOURNAMENT_ID,
  nome: t.nome,
  escudo_url: t.escudo,
  ativo_pelo_admin: true,
  ocupado: true,
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