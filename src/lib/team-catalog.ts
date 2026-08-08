import catalogJson from "@/data/team-crests.json";

export type CatalogTeam = {
  nome: string;
  escudo: string;
};

export type CompetitionGroup = {
  id: string;
  nome: string;
  descricao: string;
  grupos: ContinenteGroup[];
};

export type ContinenteGroup = {
  nome: string;
  times: CatalogTeam[];
};

const BASE_COMPETITIONS = catalogJson.competitions as CompetitionGroup[];

function allCatalogTeams(): CatalogTeam[] {
  const seen = new Set<string>();
  const result: CatalogTeam[] = [];
  for (const comp of BASE_COMPETITIONS) {
    for (const grp of comp.grupos) {
      for (const t of grp.times) {
        if (!seen.has(t.nome)) {
          seen.add(t.nome);
          result.push(t);
        }
      }
    }
  }
  return result;
}

export const FC_CUP_ARENA_COMPETITION: CompetitionGroup = {
  id: "fc_cup_arena",
  nome: "FC CUP ARENA",
  descricao: "Todos os times disponíveis na plataforma FC Cup Arena.",
  grupos: [{ nome: "Todos os Times", times: allCatalogTeams() }],
};

export const COMPETITIONS: CompetitionGroup[] = [FC_CUP_ARENA_COMPETITION, ...BASE_COMPETITIONS];

export function getAllTeamsFlat(): CatalogTeam[] {
  const seen = new Set<string>();
  const result: CatalogTeam[] = [];
  for (const comp of COMPETITIONS) {
    for (const grp of comp.grupos) {
      for (const t of grp.times) {
        if (!seen.has(t.nome)) {
          seen.add(t.nome);
          result.push(t);
        }
      }
    }
  }
  return result;
}
