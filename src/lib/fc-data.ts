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
  fase: string;
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
  formato_mata_mata: "ida_e_volta",
  status: "inscricoes_abertas",
};

const initialTeams: Team[] = teamsSeed.map((t, i) => ({
  id: `team-${i + 1}`,
  torneio_id: TOURNAMENT_ID,
  nome: t.nome,
  escudo_url: t.escudo,
  ativo_pelo_admin: true,
  ocupado: [0, 3, 7, 10].includes(i),
}));

const initialPlayers: Player[] = [
  {
    id: "p1", torneio_id: TOURNAMENT_ID, nome_completo: "Lucas Almeida",
    gamertag_nick: "LucasGOAT10", mes_ano_nascimento: "06/1998", time_id: "team-1",
  },
  {
    id: "p2", torneio_id: TOURNAMENT_ID, nome_completo: "Rafael Souza",
    gamertag_nick: "RafaKing", mes_ano_nascimento: "11/2001", time_id: "team-4",
  },
  {
    id: "p3", torneio_id: TOURNAMENT_ID, nome_completo: "Pedro Martins",
    gamertag_nick: "P3dr0M", mes_ano_nascimento: "03/1995", time_id: "team-8",
  },
  {
    id: "p4", torneio_id: TOURNAMENT_ID, nome_completo: "Bruno Costa",
    gamertag_nick: "BrunoC7", mes_ano_nascimento: "09/2000", time_id: "team-11",
  },
];

type State = {
  tournaments: Tournament[];
  teams: Team[];
  players: Player[];
  matches: Match[];
};

let state: State = {
  tournaments: [initialTournament],
  teams: initialTeams,
  players: initialPlayers,
  matches: [],
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