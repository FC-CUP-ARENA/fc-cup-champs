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

export const COMPETITIONS: CompetitionGroup[] = catalogJson.competitions as CompetitionGroup[];

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
