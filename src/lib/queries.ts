import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { Tournament, Team, Player, Match } from "./fc-data";

// ============================================================
// Query Keys
// ============================================================
export const qk = {
  tournaments: () => ["tournaments"] as const,
  tournament: (id: string) => ["tournaments", id] as const,
  tournamentByCode: (codigo: string) => ["tournaments", "code", codigo] as const,
  teams: (torneio_id: string) => ["teams", torneio_id] as const,
  players: (torneio_id: string) => ["players", torneio_id] as const,
  matches: (torneio_id: string) => ["matches", torneio_id] as const,
};

// ============================================================
// Fetchers
// ============================================================
async function fetchTournaments(): Promise<Tournament[]> {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Tournament[];
}

async function fetchTournamentByCode(codigo: string): Promise<Tournament | null> {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .ilike("codigo_unico", codigo)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Tournament | null;
}

async function fetchTeams(torneio_id: string): Promise<Team[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("torneio_id", torneio_id)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Team[];
}

async function fetchPlayers(torneio_id: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("torneio_id", torneio_id)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Player[];
}

async function fetchMatches(torneio_id: string): Promise<Match[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("torneio_id", torneio_id)
    .order("ordem", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Match[];
}


// ============================================================
// Hooks — Leitura
// ============================================================

export function useTournaments() {
  return useQuery({
    queryKey: qk.tournaments(),
    queryFn: fetchTournaments,
  });
}

export function useTournamentByCode(codigo: string) {
  return useQuery({
    queryKey: qk.tournamentByCode(codigo),
    queryFn: () => fetchTournamentByCode(codigo),
    enabled: !!codigo,
  });
}

export function useTeams(torneio_id: string) {
  return useQuery({
    queryKey: qk.teams(torneio_id),
    queryFn: () => fetchTeams(torneio_id),
    enabled: !!torneio_id,
  });
}

export function usePlayers(torneio_id: string) {
  return useQuery({
    queryKey: qk.players(torneio_id),
    queryFn: () => fetchPlayers(torneio_id),
    enabled: !!torneio_id,
  });
}

export function useMatches(torneio_id: string) {
  return useQuery({
    queryKey: qk.matches(torneio_id),
    queryFn: () => fetchMatches(torneio_id),
    enabled: !!torneio_id,
  });
}

// ============================================================
// Hooks — Invalidação helpers
// ============================================================

/** Invalida todas as queries relacionadas a um torneio. */
export function useInvalidateTournament() {
  const qc = useQueryClient();
  return (torneio_id: string, codigo?: string) => {
    qc.invalidateQueries({ queryKey: qk.tournaments() });
    qc.invalidateQueries({ queryKey: qk.teams(torneio_id) });
    qc.invalidateQueries({ queryKey: qk.players(torneio_id) });
    qc.invalidateQueries({ queryKey: qk.matches(torneio_id) });
    if (codigo) qc.invalidateQueries({ queryKey: qk.tournamentByCode(codigo) });
  };
}

// ============================================================
// Hooks — Mutações prontas para uso nos componentes
// ============================================================

import {
  createTournament,
  registerPlayer,
  deletePlayer,
  fillWithBots,
  toggleTeamAtivo,
  setTeamGroup,
  setTournamentStatus,
  updateRegulamento,
  setRegistrationDeadline,
  deleteTournament,
  saveMatchScore,
  launchWO,
  setMatchDate,
  drawGroups,
  drawDirectKnockout,
  clearGroups,
  generateGroupMatches,
  addTeams,
  setNumGrupos,
  setBracketConfig,
  generateKnockoutFromGroups,
  type BracketConfig,
  type Tournament as TournamentType,
  type Team as TeamType,
  type Match as MatchType,
  type Player as PlayerType,
  type CreateTournamentInput,
} from "./fc-data";

export function useCreateTournament() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTournamentInput) => createTournament(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tournaments() }),
  });
}

export function useRegisterPlayer(torneio_id: string, codigo: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof registerPlayer>[0]) => registerPlayer(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.players(torneio_id) });
      qc.invalidateQueries({ queryKey: qk.teams(torneio_id) });
      qc.invalidateQueries({ queryKey: qk.tournamentByCode(codigo) });
    },
  });
}

export function useDeletePlayer(torneio_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (playerId: string) => deletePlayer(playerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.players(torneio_id) });
      qc.invalidateQueries({ queryKey: qk.teams(torneio_id) });
    },
  });
}

export function useFillWithBots(torneio_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      tournament,
      players,
      teams,
    }: {
      tournament: TournamentType;
      players: PlayerType[];
      teams: TeamType[];
    }) => fillWithBots(tournament, players, teams),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.players(torneio_id) });
      qc.invalidateQueries({ queryKey: qk.teams(torneio_id) });
    },
  });
}

export function useToggleTeamAtivo(torneio_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, ativo }: { teamId: string; ativo: boolean }) =>
      toggleTeamAtivo(teamId, ativo),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.teams(torneio_id) }),
  });
}

export function useSetTeamGroup(torneio_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, grupo }: { teamId: string; grupo: import("./fc-data").Grupo | null }) =>
      setTeamGroup(teamId, grupo),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.teams(torneio_id) }),
  });
}

export function useSetTournamentStatus(torneio_id: string, codigo: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: TournamentType["status"]) => setTournamentStatus(torneio_id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.tournamentByCode(codigo) });
      qc.invalidateQueries({ queryKey: qk.tournaments() });
    },
  });
}

export function useUpdateRegulamento(torneio_id: string, codigo: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (regulamento_texto: string) => updateRegulamento(torneio_id, regulamento_texto),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tournamentByCode(codigo) }),
  });
}

export function useSetRegistrationDeadline(torneio_id: string, codigo: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data_limite: string | null) => setRegistrationDeadline(torneio_id, data_limite),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tournamentByCode(codigo) }),
  });
}

export function useDeleteTournament() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTournament(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tournaments() }),
  });
}

export function useSaveMatchScore(torneio_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      match, allMatches, tournament, gm, gv, pm, pv,
    }: {
      match: MatchType;
      allMatches: MatchType[];
      tournament: TournamentType;
      gm: number; gv: number;
      pm?: number | null; pv?: number | null;
    }) => saveMatchScore(match, allMatches, tournament, gm, gv, pm, pv),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.matches(torneio_id) }),
  });
}

export function useLaunchWO(torneio_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      match, allMatches, tournament, vencedor,
    }: {
      match: MatchType;
      allMatches: MatchType[];
      tournament: TournamentType;
      vencedor: "mandante" | "visitante";
    }) => launchWO(match, allMatches, tournament, vencedor),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.matches(torneio_id) }),
  });
}

export function useSetMatchDate(torneio_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId, data_jogo }: { matchId: string; data_jogo: string | null }) =>
      setMatchDate(matchId, data_jogo),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.matches(torneio_id) }),
  });
}

export function useDrawGroups(torneio_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tournament, teams }: { tournament: TournamentType; teams: TeamType[] }) =>
      drawGroups(tournament, teams),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.teams(torneio_id) });
      qc.invalidateQueries({ queryKey: qk.matches(torneio_id) });
    },
  });
}

export function useDrawDirectKnockout(torneio_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tournament, teams }: { tournament: TournamentType; teams: TeamType[] }) =>
      drawDirectKnockout(tournament, teams),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.teams(torneio_id) });
      qc.invalidateQueries({ queryKey: qk.matches(torneio_id) });
    },
  });
}

export function useClearGroups(torneio_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => clearGroups(torneio_id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.teams(torneio_id) });
      qc.invalidateQueries({ queryKey: qk.matches(torneio_id) });
    },
  });
}

export function useGenerateGroupMatches(torneio_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tournament, teams }: { tournament: TournamentType; teams: TeamType[] }) =>
      generateGroupMatches(tournament, teams),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.matches(torneio_id) }),
  });
}

export function useAddTeams(torneio_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ newTeams }: { newTeams: Array<{ nome: string; escudo_url: string }> }) =>
      addTeams(torneio_id, newTeams),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.teams(torneio_id) });
      qc.invalidateQueries({ queryKey: qk.tournament(torneio_id) });
    },
  });
}

export function useSetNumGrupos(torneio_id: string, codigo: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (num_grupos: number) => setNumGrupos(torneio_id, num_grupos),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.tournamentByCode(codigo) });
      qc.invalidateQueries({ queryKey: qk.tournaments() });
    },
  });
}

export function useSetBracketConfig(torneio_id: string, codigo: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: BracketConfig) => setBracketConfig(torneio_id, config),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.tournamentByCode(codigo) });
      qc.invalidateQueries({ queryKey: qk.tournaments() });
    },
  });
}

export function useGenerateKnockout(torneio_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tournament, matches, teams }: { tournament: TournamentType; matches: MatchType[]; teams: TeamType[] }) =>
      generateKnockoutFromGroups(tournament, matches, teams),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.matches(torneio_id) }),
  });
}
