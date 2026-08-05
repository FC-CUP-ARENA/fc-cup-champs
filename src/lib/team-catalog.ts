export type CatalogTeam = {
  nome: string;
  escudo: string;
};

export type CompetitionGroup = {
  id: string;
  nome: string;
  descricao: string;
  continentes: ContinenteGroup[];
};

export type ContinenteGroup = {
  nome: string;
  times: CatalogTeam[];
};

export const COMPETITIONS: CompetitionGroup[] = [
  {
    id: "copa_do_mundo",
    nome: "Copa do Mundo",
    descricao: "Seleções nacionais organizadas por continente",
    continentes: [
      {
        nome: "América do Sul",
        times: [
          { nome: "Brasil", escudo: "🇧🇷" },
          { nome: "Argentina", escudo: "🇦🇷" },
          { nome: "Uruguai", escudo: "🇺🇾" },
          { nome: "Colômbia", escudo: "🇨🇴" },
          { nome: "Chile", escudo: "🇨🇱" },
          { nome: "Peru", escudo: "🇵🇪" },
          { nome: "Equador", escudo: "🇪🇨" },
          { nome: "Paraguai", escudo: "🇵🇾" },
          { nome: "Venezuela", escudo: "🇻🇪" },
          { nome: "Bolívia", escudo: "🇧🇴" },
        ],
      },
      {
        nome: "Europa",
        times: [
          { nome: "França", escudo: "🇫🇷" },
          { nome: "Alemanha", escudo: "🇩🇪" },
          { nome: "Espanha", escudo: "🇪🇸" },
          { nome: "Portugal", escudo: "🇵🇹" },
          { nome: "Inglaterra", escudo: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
          { nome: "Itália", escudo: "🇮🇹" },
          { nome: "Holanda", escudo: "🇳🇱" },
          { nome: "Bélgica", escudo: "🇧🇪" },
          { nome: "Croácia", escudo: "🇭🇷" },
          { nome: "Suíça", escudo: "🇨🇭" },
          { nome: "Dinamarca", escudo: "🇩🇰" },
          { nome: "Suécia", escudo: "🇸🇪" },
          { nome: "Polônia", escudo: "🇵🇱" },
          { nome: "Áustria", escudo: "🇦🇹" },
          { nome: "Sérvia", escudo: "🇷🇸" },
          { nome: "Ucrânia", escudo: "🇺🇦" },
          { nome: "Turquia", escudo: "🇹🇷" },
          { nome: "Noruega", escudo: "🇳🇴" },
          { nome: "Escócia", escudo: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
          { nome: "País de Gales", escudo: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
        ],
      },
      {
        nome: "América do Norte e Central",
        times: [
          { nome: "México", escudo: "🇲🇽" },
          { nome: "Estados Unidos", escudo: "🇺🇸" },
          { nome: "Canadá", escudo: "🇨🇦" },
          { nome: "Costa Rica", escudo: "🇨🇷" },
          { nome: "Panamá", escudo: "🇵🇦" },
          { nome: "Honduras", escudo: "🇭🇳" },
          { nome: "Jamaica", escudo: "🇯🇲" },
          { nome: "El Salvador", escudo: "🇸🇻" },
        ],
      },
      {
        nome: "Ásia",
        times: [
          { nome: "Japão", escudo: "🇯🇵" },
          { nome: "Coreia do Sul", escudo: "🇰🇷" },
          { nome: "Irã", escudo: "🇮🇷" },
          { nome: "Arábia Saudita", escudo: "🇸🇦" },
          { nome: "Austrália", escudo: "🇦🇺" },
          { nome: "Catar", escudo: "🇶🇦" },
          { nome: "Iraque", escudo: "🇮🇶" },
          { nome: "Emirados Árabes", escudo: "🇦🇪" },
        ],
      },
      {
        nome: "África",
        times: [
          { nome: "Senegal", escudo: "🇸🇳" },
          { nome: "Marrocos", escudo: "🇲🇦" },
          { nome: "Nigéria", escudo: "🇳🇬" },
          { nome: "Egito", escudo: "🇪🇬" },
          { nome: "Gana", escudo: "🇬🇭" },
          { nome: "Camarões", escudo: "🇨🇲" },
          { nome: "Argélia", escudo: "🇩🇿" },
          { nome: "Tunísia", escudo: "🇹🇳" },
          { nome: "Costa do Marfim", escudo: "🇨🇮" },
          { nome: "África do Sul", escudo: "🇿🇦" },
        ],
      },
    ],
  },
  {
    id: "libertadores",
    nome: "Libertadores",
    descricao: "Principais clubes da América do Sul",
    continentes: [
      {
        nome: "Brasil",
        times: [
          { nome: "Flamengo", escudo: "🔴⚫" },
          { nome: "Palmeiras", escudo: "🟢" },
          { nome: "Corinthians", escudo: "⚫⚪" },
          { nome: "São Paulo", escudo: "🔴⚫⚪" },
          { nome: "Santos", escudo: "⚪⚫" },
          { nome: "Grêmio", escudo: "🔵⚫" },
          { nome: "Internacional", escudo: "🔴" },
          { nome: "Atlético-MG", escudo: "⚫⚪" },
          { nome: "Cruzeiro", escudo: "🔵" },
          { nome: "Fluminense", escudo: "🟢🔴⚪" },
          { nome: "Botafogo", escudo: "⚫⚪" },
          { nome: "Vasco", escudo: "⚫⚪" },
          { nome: "Athletico-PR", escudo: "🔴⚫" },
          { nome: "Bahia", escudo: "🔵⚪🔴" },
          { nome: "Fortaleza", escudo: "🔵🔴" },
          { nome: "Red Bull Bragantino", escudo: "🔴⚪" },
        ],
      },
      {
        nome: "Argentina",
        times: [
          { nome: "River Plate", escudo: "⚪🔴" },
          { nome: "Boca Juniors", escudo: "🔵🟡" },
          { nome: "Racing", escudo: "🔵⚪" },
          { nome: "Independiente", escudo: "🔴" },
          { nome: "San Lorenzo", escudo: "🔵🔴" },
          { nome: "Estudiantes", escudo: "🔴⚪" },
          { nome: "Vélez Sarsfield", escudo: "🔵⚪" },
          { nome: "Rosario Central", escudo: "🟡🔵" },
        ],
      },
      {
        nome: "Uruguai",
        times: [
          { nome: "Peñarol", escudo: "🟡⚫" },
          { nome: "Nacional", escudo: "🔵⚪" },
          { nome: "Defensor Sporting", escudo: "🟣" },
        ],
      },
      {
        nome: "Outros Sul-Americanos",
        times: [
          { nome: "Colo-Colo", escudo: "⚪" },
          { nome: "Universidad Católica", escudo: "🔵⚪" },
          { nome: "Nacional (PAR)", escudo: "🔵⚪" },
          { nome: "Olimpia", escudo: "⚪⚫" },
          { nome: "Atlético Nacional", escudo: "🟢⚪" },
          { nome: "Millonarios", escudo: "🔵" },
          { nome: "Emelec", escudo: "🔵🔴" },
          { nome: "Barcelona SC", escudo: "🟡⚫" },
          { nome: "Liga de Quito", escudo: "🔵⚪" },
          { nome: "Caracas", escudo: "🔴" },
        ],
      },
    ],
  },
  {
    id: "champions_league",
    nome: "Champions League",
    descricao: "Principais clubes da Europa",
    continentes: [
      {
        nome: "Inglaterra",
        times: [
          { nome: "Manchester City", escudo: "🩵" },
          { nome: "Liverpool", escudo: "🔴" },
          { nome: "Chelsea", escudo: "🔵" },
          { nome: "Arsenal", escudo: "🔴⚪" },
          { nome: "Manchester United", escudo: "🔴" },
          { nome: "Tottenham", escudo: "⚪" },
          { nome: "Newcastle", escudo: "⚫⚪" },
          { nome: "Aston Villa", escudo: "🟣" },
        ],
      },
      {
        nome: "Espanha",
        times: [
          { nome: "Real Madrid", escudo: "⚪" },
          { nome: "Barcelona", escudo: "🔵🔴" },
          { nome: "Atlético de Madrid", escudo: "🔴⚪" },
          { nome: "Sevilla", escudo: "⚪🔴" },
          { nome: "Valência", escudo: "⚪⚫" },
          { nome: "Villarreal", escudo: "🟡" },
          { nome: "Real Sociedad", escudo: "🔵⚪" },
          { nome: "Athletic Bilbao", escudo: "🔴⚪" },
        ],
      },
      {
        nome: "Itália",
        times: [
          { nome: "Inter de Milão", escudo: "🔵⚫" },
          { nome: "Milan", escudo: "🔴⚫" },
          { nome: "Juventus", escudo: "⚫⚪" },
          { nome: "Napoli", escudo: "🔵" },
          { nome: "Roma", escudo: "🟡🔴" },
          { nome: "Lazio", escudo: "🔵⚪" },
          { nome: "Atalanta", escudo: "🔵⚫" },
          { nome: "Fiorentina", escudo: "🟣" },
        ],
      },
      {
        nome: "Alemanha",
        times: [
          { nome: "Bayern Munich", escudo: "🅱️" },
          { nome: "Borussia Dortmund", escudo: "🟡⚫" },
          { nome: "RB Leipzig", escudo: "🔴⚪" },
          { nome: "Bayer Leverkusen", escudo: "🔴⚫" },
          { nome: "Eintracht Frankfurt", escudo: "🔴⚫" },
          { nome: "Wolfsburg", escudo: "🟢" },
          { nome: "Stuttgart", escudo: "⚪🔴" },
          { nome: "Freiburg", escudo: "🔴⚫" },
        ],
      },
      {
        nome: "França",
        times: [
          { nome: "PSG", escudo: "🅿️" },
          { nome: "Marseille", escudo: "🔵⚪" },
          { nome: "Monaco", escudo: "🔴⚪" },
          { nome: "Lyon", escudo: "🔵🔴" },
          { nome: "Lille", escudo: "🔴" },
          { nome: "Nice", escudo: "🔴⚫" },
          { nome: "Rennes", escudo: "🔴⚫" },
          { nome: "Lens", escudo: "🟡🔴" },
        ],
      },
      {
        nome: "Portugal",
        times: [
          { nome: "Benfica", escudo: "🦅" },
          { nome: "Porto", escudo: "🔵" },
          { nome: "Sporting CP", escudo: "🟢" },
          { nome: "Braga", escudo: "🔴" },
          { nome: "Vitória SC", escudo: "🟢⚪" },
          { nome: "Boavista", escudo: "⚫⚪" },
        ],
      },
      {
        nome: "Holanda",
        times: [
          { nome: "Ajax", escudo: "🔴⚪" },
          { nome: "PSV", escudo: "🔴⚪" },
          { nome: "Feyenoord", escudo: "🔴⚪" },
          { nome: "AZ Alkmaar", escudo: "🔴⚪" },
        ],
      },
      {
        nome: "Outros Europeus",
        times: [
          { nome: "Celtic", escudo: "🟢⚪" },
          { nome: "Rangers", escudo: "🔵🔴" },
          { nome: "Shakhtar Donetsk", escudo: "🟠⚫" },
          { nome: "Dinamo Zagreb", escudo: "🔵" },
          { nome: "Copenhagen", escudo: "⚪" },
          { nome: "RB Salzburg", escudo: "🔴⚪" },
          { nome: "Basaksehir", escudo: "🟠🔵" },
          { nome: "Galatasaray", escudo: "🟡🔴" },
        ],
      },
    ],
  },
  {
    id: "brasileirao",
    nome: "Brasileirão",
    descricao: "Clubes das principais divisões do Brasil",
    continentes: [
      {
        nome: "Série A",
        times: [
          { nome: "Flamengo", escudo: "🔴⚫" },
          { nome: "Palmeiras", escudo: "🟢" },
          { nome: "Corinthians", escudo: "⚫⚪" },
          { nome: "São Paulo", escudo: "🔴⚫⚪" },
          { nome: "Santos", escudo: "⚪⚫" },
          { nome: "Grêmio", escudo: "🔵⚫" },
          { nome: "Internacional", escudo: "🔴" },
          { nome: "Atlético-MG", escudo: "⚫⚪" },
          { nome: "Cruzeiro", escudo: "🔵" },
          { nome: "Fluminense", escudo: "🟢🔴⚪" },
          { nome: "Botafogo", escudo: "⚫⚪" },
          { nome: "Vasco", escudo: "⚫⚪" },
          { nome: "Athletico-PR", escudo: "🔴⚫" },
          { nome: "Bahia", escudo: "🔵⚪🔴" },
          { nome: "Fortaleza", escudo: "🔵🔴" },
          { nome: "Red Bull Bragantino", escudo: "🔴⚪" },
          { nome: "Cuiabá", escudo: "🟢🟡" },
          { nome: "Juventude", escudo: "🟢" },
          { nome: "Criciúma", escudo: "🟡⚫" },
          { nome: "Atlético-GO", escudo: "🔴⚫" },
        ],
      },
      {
        nome: "Série B",
        times: [
          { nome: "Coritiba", escudo: "🟢⚪" },
          { nome: "Goiás", escudo: "🟢" },
          { nome: "Vitória", escudo: "🔴⚫" },
          { nome: "Chapecoense", escudo: "🟢⚪" },
          { nome: "Sport Recife", escudo: "🔴⚫" },
          { nome: "América-MG", escudo: "🟢" },
          { nome: "CRB", escudo: "🔴🔵" },
          { nome: "Botafogo-SP", escudo: "🔴⚫" },
        ],
      },
    ],
  },
  {
    id: "premier_league",
    nome: "Premier League",
    descricao: "Clubes da liga inglesa",
    continentes: [
      {
        nome: "Inglaterra",
        times: [
          { nome: "Manchester City", escudo: "🩵" },
          { nome: "Liverpool", escudo: "🔴" },
          { nome: "Chelsea", escudo: "🔵" },
          { nome: "Arsenal", escudo: "🔴⚪" },
          { nome: "Manchester United", escudo: "🔴" },
          { nome: "Tottenham", escudo: "⚪" },
          { nome: "Newcastle", escudo: "⚫⚪" },
          { nome: "Aston Villa", escudo: "🟣" },
          { nome: "West Ham", escudo: "🟣🔵" },
          { nome: "Brighton", escudo: "🔵⚪" },
          { nome: "Crystal Palace", escudo: "🔵🔴" },
          { nome: "Everton", escudo: "🔵" },
          { nome: "Fulham", escudo: "⚪⚫" },
          { nome: "Wolves", escudo: "🟠⚫" },
          { nome: "Brentford", escudo: "🔴⚪" },
          { nome: "Nottingham Forest", escudo: "🔴" },
          { nome: "Bournemouth", escudo: "🔴⚫" },
          { nome: "Burnley", escudo: "🟣" },
          { nome: "Luton Town", escudo: "🟠🔵" },
          { nome: "Sheffield United", escudo: "🔴⚪" },
        ],
      },
    ],
  },
  {
    id: "la_liga",
    nome: "La Liga",
    descricao: "Clubes da liga espanhola",
    continentes: [
      {
        nome: "Espanha",
        times: [
          { nome: "Real Madrid", escudo: "⚪" },
          { nome: "Barcelona", escudo: "🔵🔴" },
          { nome: "Atlético de Madrid", escudo: "🔴⚪" },
          { nome: "Sevilla", escudo: "⚪🔴" },
          { nome: "Valência", escudo: "⚪⚫" },
          { nome: "Villarreal", escudo: "🟡" },
          { nome: "Real Sociedad", escudo: "🔵⚪" },
          { nome: "Athletic Bilbao", escudo: "🔴⚪" },
          { nome: "Real Betis", escudo: "🟢⚪" },
          { nome: "Girona", escudo: "🔴⚪" },
          { nome: "Osasuna", escudo: "🔴🔵" },
          { nome: "Getafe", escudo: "🔵" },
          { nome: "Celta Vigo", escudo: "🔵⚪" },
          { nome: "Mallorca", escudo: "🔴⚫" },
          { nome: "Rayo Vallecano", escudo: "🔴⚪" },
          { nome: "Alavés", escudo: "🔵" },
          { nome: "Las Palmas", escudo: "🟡🔵" },
          { nome: "Cádiz", escudo: "🟡" },
        ],
      },
    ],
  },
  {
    id: "serie_a_italia",
    nome: "Serie A (Itália)",
    descricao: "Clubes da liga italiana",
    continentes: [
      {
        nome: "Itália",
        times: [
          { nome: "Inter de Milão", escudo: "🔵⚫" },
          { nome: "Milan", escudo: "🔴⚫" },
          { nome: "Juventus", escudo: "⚫⚪" },
          { nome: "Napoli", escudo: "🔵" },
          { nome: "Roma", escudo: "🟡🔴" },
          { nome: "Lazio", escudo: "🔵⚪" },
          { nome: "Atalanta", escudo: "🔵⚫" },
          { nome: "Fiorentina", escudo: "🟣" },
          { nome: "Bologna", escudo: "🔴🔵" },
          { nome: "Torino", escudo: "🟤" },
          { nome: "Monza", escudo: "🔴⚪" },
          { nome: "Genoa", escudo: "🔴🔵" },
          { nome: "Lecce", escudo: "🟡🔴" },
          { nome: "Udinese", escudo: "⚫⚪" },
          { nome: "Empoli", escudo: "🔵" },
          { nome: "Verona", escudo: "🟡🔵" },
          { nome: "Cagliari", escudo: "🔴🔵" },
          { nome: "Frosinone", escudo: "🟡🔵" },
        ],
      },
    ],
  },
  {
    id: "bundesliga",
    nome: "Bundesliga",
    descricao: "Clubes da liga alemã",
    continentes: [
      {
        nome: "Alemanha",
        times: [
          { nome: "Bayern Munich", escudo: "🅱️" },
          { nome: "Borussia Dortmund", escudo: "🟡⚫" },
          { nome: "RB Leipzig", escudo: "🔴⚪" },
          { nome: "Bayer Leverkusen", escudo: "🔴⚫" },
          { nome: "Eintracht Frankfurt", escudo: "🔴⚫" },
          { nome: "Wolfsburg", escudo: "🟢" },
          { nome: "Stuttgart", escudo: "⚪🔴" },
          { nome: "Freiburg", escudo: "🔴⚫" },
          { nome: "Hoffenheim", escudo: "🔵" },
          { nome: "Mainz", escudo: "🔴⚪" },
          { nome: "Union Berlin", escudo: "🔴⚪" },
          { nome: "Werder Bremen", escudo: "🟢⚪" },
          { nome: "Augsburg", escudo: "🟢🔴" },
          { nome: "Bochum", escudo: "🔵" },
          { nome: "Darmstadt", escudo: "🔵" },
          { nome: "Heidenheim", escudo: "🔴🔵" },
        ],
      },
    ],
  },
  {
    id: "ligue1",
    nome: "Ligue 1 (França)",
    descricao: "Clubes da liga francesa",
    continentes: [
      {
        nome: "França",
        times: [
          { nome: "PSG", escudo: "🅿️" },
          { nome: "Marseille", escudo: "🔵⚪" },
          { nome: "Monaco", escudo: "🔴⚪" },
          { nome: "Lyon", escudo: "🔵🔴" },
          { nome: "Lille", escudo: "🔴" },
          { nome: "Nice", escudo: "🔴⚫" },
          { nome: "Rennes", escudo: "🔴⚫" },
          { nome: "Lens", escudo: "🟡🔴" },
          { nome: "Toulouse", escudo: "🟣" },
          { nome: "Nantes", escudo: "🟡🟢" },
          { nome: "Reims", escudo: "🔴" },
          { nome: "Strasbourg", escudo: "🔵⚪" },
          { nome: "Brest", escudo: "🔴⚪" },
          { nome: "Le Havre", escudo: "🔵" },
          { nome: "Metz", escudo: "🟤" },
          { nome: "Lorient", escudo: "🟠⚫" },
        ],
      },
    ],
  },
  {
    id: "era_selecoes",
    nome: "Seleções Históricas",
    descricao: "Seleções lendárias de todas as épocas",
    continentes: [
      {
        nome: "América do Sul",
        times: [
          { nome: "Brasil 1970", escudo: "🇧🇷" },
          { nome: "Brasil 2002", escudo: "🇧🇷" },
          { nome: "Argentina 1986", escudo: "🇦🇷" },
          { nome: "Uruguai 1950", escudo: "🇺🇾" },
          { nome: "Argentina 2022", escudo: "🇦🇷" },
          { nome: "Brasil 1994", escudo: "🇧🇷" },
        ],
      },
      {
        nome: "Europa",
        times: [
          { nome: "Holanda 1974", escudo: "🇳🇱" },
          { nome: "Alemanha 1974", escudo: "🇩🇪" },
          { nome: "Itália 1982", escudo: "🇮🇹" },
          { nome: "França 1998", escudo: "🇫🇷" },
          { nome: "Espanha 2010", escudo: "🇪🇸" },
          { nome: "Alemanha 2014", escudo: "🇩🇪" },
        ],
      },
    ],
  },
];

export function getAllTeamsFlat(): CatalogTeam[] {
  const seen = new Set<string>();
  const result: CatalogTeam[] = [];
  for (const comp of COMPETITIONS) {
    for (const cont of comp.continentes) {
      for (const t of cont.times) {
        if (!seen.has(t.nome)) {
          seen.add(t.nome);
          result.push(t);
        }
      }
    }
  }
  return result;
}
