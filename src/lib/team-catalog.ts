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

const FLAG = (code: string) => `https://flagcdn.com/h40/${code}.png`;
const CLUB = (id: number) => `https://media.api-sports.io/football/teams/${id}.png`;

export const COMPETITIONS: CompetitionGroup[] = [
  {
    id: "copa_do_mundo",
    nome: "Copa do Mundo",
    descricao: "Seleções nacionais organizadas por continente",
    continentes: [
      {
        nome: "América do Sul",
        times: [
          { nome: "Brasil", escudo: FLAG("br") },
          { nome: "Argentina", escudo: FLAG("ar") },
          { nome: "Uruguai", escudo: FLAG("uy") },
          { nome: "Colômbia", escudo: FLAG("co") },
          { nome: "Chile", escudo: FLAG("cl") },
          { nome: "Peru", escudo: FLAG("pe") },
          { nome: "Equador", escudo: FLAG("ec") },
          { nome: "Paraguai", escudo: FLAG("py") },
          { nome: "Venezuela", escudo: FLAG("ve") },
          { nome: "Bolívia", escudo: FLAG("bo") },
        ],
      },
      {
        nome: "Europa",
        times: [
          { nome: "França", escudo: FLAG("fr") },
          { nome: "Alemanha", escudo: FLAG("de") },
          { nome: "Espanha", escudo: FLAG("es") },
          { nome: "Portugal", escudo: FLAG("pt") },
          { nome: "Inglaterra", escudo: FLAG("gb-eng") },
          { nome: "Itália", escudo: FLAG("it") },
          { nome: "Holanda", escudo: FLAG("nl") },
          { nome: "Bélgica", escudo: FLAG("be") },
          { nome: "Croácia", escudo: FLAG("hr") },
          { nome: "Suíça", escudo: FLAG("ch") },
          { nome: "Dinamarca", escudo: FLAG("dk") },
          { nome: "Suécia", escudo: FLAG("se") },
          { nome: "Polônia", escudo: FLAG("pl") },
          { nome: "Áustria", escudo: FLAG("at") },
          { nome: "Sérvia", escudo: FLAG("rs") },
          { nome: "Ucrânia", escudo: FLAG("ua") },
          { nome: "Turquia", escudo: FLAG("tr") },
          { nome: "Noruega", escudo: FLAG("no") },
          { nome: "Escócia", escudo: FLAG("gb-sct") },
          { nome: "País de Gales", escudo: FLAG("gb-wls") },
        ],
      },
      {
        nome: "América do Norte e Central",
        times: [
          { nome: "México", escudo: FLAG("mx") },
          { nome: "Estados Unidos", escudo: FLAG("us") },
          { nome: "Canadá", escudo: FLAG("ca") },
          { nome: "Costa Rica", escudo: FLAG("cr") },
          { nome: "Panamá", escudo: FLAG("pa") },
          { nome: "Honduras", escudo: FLAG("hn") },
          { nome: "Jamaica", escudo: FLAG("jm") },
          { nome: "El Salvador", escudo: FLAG("sv") },
        ],
      },
      {
        nome: "Ásia",
        times: [
          { nome: "Japão", escudo: FLAG("jp") },
          { nome: "Coreia do Sul", escudo: FLAG("kr") },
          { nome: "Irã", escudo: FLAG("ir") },
          { nome: "Arábia Saudita", escudo: FLAG("sa") },
          { nome: "Austrália", escudo: FLAG("au") },
          { nome: "Catar", escudo: FLAG("qa") },
          { nome: "Iraque", escudo: FLAG("iq") },
          { nome: "Emirados Árabes", escudo: FLAG("ae") },
        ],
      },
      {
        nome: "África",
        times: [
          { nome: "Senegal", escudo: FLAG("sn") },
          { nome: "Marrocos", escudo: FLAG("ma") },
          { nome: "Nigéria", escudo: FLAG("ng") },
          { nome: "Egito", escudo: FLAG("eg") },
          { nome: "Gana", escudo: FLAG("gh") },
          { nome: "Camarões", escudo: FLAG("cm") },
          { nome: "Argélia", escudo: FLAG("dz") },
          { nome: "Tunísia", escudo: FLAG("tn") },
          { nome: "Costa do Marfim", escudo: FLAG("ci") },
          { nome: "África do Sul", escudo: FLAG("za") },
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
          { nome: "Flamengo", escudo: CLUB(834) },
          { nome: "Palmeiras", escudo: CLUB(222) },
          { nome: "Corinthians", escudo: CLUB(65) },
          { nome: "São Paulo", escudo: CLUB(66) },
          { nome: "Santos", escudo: CLUB(67) },
          { nome: "Grêmio", escudo: CLUB(68) },
          { nome: "Internacional", escudo: CLUB(69) },
          { nome: "Atlético-MG", escudo: CLUB(70) },
          { nome: "Cruzeiro", escudo: CLUB(71) },
          { nome: "Fluminense", escudo: CLUB(72) },
          { nome: "Botafogo", escudo: CLUB(73) },
          { nome: "Vasco", escudo: CLUB(74) },
          { nome: "Athletico-PR", escudo: CLUB(75) },
          { nome: "Bahia", escudo: CLUB(76) },
          { nome: "Fortaleza", escudo: CLUB(77) },
          { nome: "Red Bull Bragantino", escudo: CLUB(78) },
        ],
      },
      {
        nome: "Argentina",
        times: [
          { nome: "River Plate", escudo: CLUB(435) },
          { nome: "Boca Juniors", escudo: CLUB(437) },
          { nome: "Racing", escudo: CLUB(434) },
          { nome: "Independiente", escudo: CLUB(432) },
          { nome: "San Lorenzo", escudo: CLUB(431) },
          { nome: "Estudiantes", escudo: CLUB(436) },
          { nome: "Vélez Sarsfield", escudo: CLUB(429) },
          { nome: "Rosario Central", escudo: CLUB(427) },
        ],
      },
      {
        nome: "Uruguai",
        times: [
          { nome: "Peñarol", escudo: CLUB(475) },
          { nome: "Nacional", escudo: CLUB(474) },
          { nome: "Defensor Sporting", escudo: CLUB(476) },
        ],
      },
      {
        nome: "Outros Sul-Americanos",
        times: [
          { nome: "Colo-Colo", escudo: CLUB(571) },
          { nome: "Universidad Católica", escudo: CLUB(573) },
          { nome: "Olimpia", escudo: CLUB(577) },
          { nome: "Atlético Nacional", escudo: CLUB(449) },
          { nome: "Millonarios", escudo: CLUB(448) },
          { nome: "Emelec", escudo: CLUB(580) },
          { nome: "Barcelona SC", escudo: CLUB(579) },
          { nome: "Liga de Quito", escudo: CLUB(578) },
          { nome: "Caracas", escudo: CLUB(582) },
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
          { nome: "Manchester City", escudo: CLUB(50) },
          { nome: "Liverpool", escudo: CLUB(40) },
          { nome: "Chelsea", escudo: CLUB(49) },
          { nome: "Arsenal", escudo: CLUB(42) },
          { nome: "Manchester United", escudo: CLUB(33) },
          { nome: "Tottenham", escudo: CLUB(47) },
          { nome: "Newcastle", escudo: CLUB(34) },
          { nome: "Aston Villa", escudo: CLUB(63) },
        ],
      },
      {
        nome: "Espanha",
        times: [
          { nome: "Real Madrid", escudo: CLUB(541) },
          { nome: "Barcelona", escudo: CLUB(529) },
          { nome: "Atlético de Madrid", escudo: CLUB(530) },
          { nome: "Sevilla", escudo: CLUB(535) },
          { nome: "Valência", escudo: CLUB(532) },
          { nome: "Villarreal", escudo: CLUB(538) },
          { nome: "Real Sociedad", escudo: CLUB(539) },
          { nome: "Athletic Bilbao", escudo: CLUB(540) },
        ],
      },
      {
        nome: "Itália",
        times: [
          { nome: "Inter de Milão", escudo: CLUB(533) },
          { nome: "Milan", escudo: CLUB(489) },
          { nome: "Juventus", escudo: CLUB(496) },
          { nome: "Napoli", escudo: CLUB(492) },
          { nome: "Roma", escudo: CLUB(497) },
          { nome: "Lazio", escudo: CLUB(488) },
          { nome: "Atalanta", escudo: CLUB(499) },
          { nome: "Fiorentina", escudo: CLUB(502) },
        ],
      },
      {
        nome: "Alemanha",
        times: [
          { nome: "Bayern Munich", escudo: CLUB(157) },
          { nome: "Borussia Dortmund", escudo: CLUB(165) },
          { nome: "RB Leipzig", escudo: CLUB(173) },
          { nome: "Bayer Leverkusen", escudo: CLUB(169) },
          { nome: "Eintracht Frankfurt", escudo: CLUB(161) },
          { nome: "Wolfsburg", escudo: CLUB(175) },
          { nome: "Stuttgart", escudo: CLUB(172) },
          { nome: "Freiburg", escudo: CLUB(167) },
        ],
      },
      {
        nome: "França",
        times: [
          { nome: "PSG", escudo: CLUB(85) },
          { nome: "Marseille", escudo: CLUB(81) },
          { nome: "Monaco", escudo: CLUB(91) },
          { nome: "Lyon", escudo: CLUB(80) },
          { nome: "Lille", escudo: CLUB(79) },
          { nome: "Nice", escudo: CLUB(84) },
          { nome: "Rennes", escudo: CLUB(83) },
          { nome: "Lens", escudo: CLUB(82) },
        ],
      },
      {
        nome: "Portugal",
        times: [
          { nome: "Benfica", escudo: CLUB(211) },
          { nome: "Porto", escudo: CLUB(212) },
          { nome: "Sporting CP", escudo: CLUB(213) },
          { nome: "Braga", escudo: CLUB(214) },
          { nome: "Vitória SC", escudo: CLUB(215) },
          { nome: "Boavista", escudo: CLUB(216) },
        ],
      },
      {
        nome: "Holanda",
        times: [
          { nome: "Ajax", escudo: CLUB(194) },
          { nome: "PSV", escudo: CLUB(197) },
          { nome: "Feyenoord", escudo: CLUB(191) },
          { nome: "AZ Alkmaar", escudo: CLUB(200) },
        ],
      },
      {
        nome: "Outros Europeus",
        times: [
          { nome: "Celtic", escudo: CLUB(247) },
          { nome: "Rangers", escudo: CLUB(248) },
          { nome: "Shakhtar Donetsk", escudo: CLUB(223) },
          { nome: "Dinamo Zagreb", escudo: CLUB(224) },
          { nome: "Copenhagen", escudo: CLUB(225) },
          { nome: "RB Salzburg", escudo: CLUB(226) },
          { nome: "Galatasaray", escudo: CLUB(610) },
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
          { nome: "Flamengo", escudo: CLUB(834) },
          { nome: "Palmeiras", escudo: CLUB(222) },
          { nome: "Corinthians", escudo: CLUB(65) },
          { nome: "São Paulo", escudo: CLUB(66) },
          { nome: "Santos", escudo: CLUB(67) },
          { nome: "Grêmio", escudo: CLUB(68) },
          { nome: "Internacional", escudo: CLUB(69) },
          { nome: "Atlético-MG", escudo: CLUB(70) },
          { nome: "Cruzeiro", escudo: CLUB(71) },
          { nome: "Fluminense", escudo: CLUB(72) },
          { nome: "Botafogo", escudo: CLUB(73) },
          { nome: "Vasco", escudo: CLUB(74) },
          { nome: "Athletico-PR", escudo: CLUB(75) },
          { nome: "Bahia", escudo: CLUB(76) },
          { nome: "Fortaleza", escudo: CLUB(77) },
          { nome: "Red Bull Bragantino", escudo: CLUB(78) },
          { nome: "Cuiabá", escudo: CLUB(79) },
          { nome: "Juventude", escudo: CLUB(80) },
          { nome: "Criciúma", escudo: CLUB(81) },
          { nome: "Atlético-GO", escudo: CLUB(82) },
        ],
      },
      {
        nome: "Série B",
        times: [
          { nome: "Coritiba", escudo: CLUB(83) },
          { nome: "Goiás", escudo: CLUB(84) },
          { nome: "Vitória", escudo: CLUB(85) },
          { nome: "Chapecoense", escudo: CLUB(86) },
          { nome: "Sport Recife", escudo: CLUB(87) },
          { nome: "América-MG", escudo: CLUB(88) },
          { nome: "CRB", escudo: CLUB(89) },
          { nome: "Botafogo-SP", escudo: CLUB(90) },
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
          { nome: "Manchester City", escudo: CLUB(50) },
          { nome: "Liverpool", escudo: CLUB(40) },
          { nome: "Chelsea", escudo: CLUB(49) },
          { nome: "Arsenal", escudo: CLUB(42) },
          { nome: "Manchester United", escudo: CLUB(33) },
          { nome: "Tottenham", escudo: CLUB(47) },
          { nome: "Newcastle", escudo: CLUB(34) },
          { nome: "Aston Villa", escudo: CLUB(63) },
          { nome: "West Ham", escudo: CLUB(48) },
          { nome: "Brighton", escudo: CLUB(51) },
          { nome: "Crystal Palace", escudo: CLUB(7) },
          { nome: "Everton", escudo: CLUB(45) },
          { nome: "Fulham", escudo: CLUB(36) },
          { nome: "Wolves", escudo: CLUB(39) },
          { nome: "Brentford", escudo: CLUB(55) },
          { nome: "Nottingham Forest", escudo: CLUB(65) },
          { nome: "Bournemouth", escudo: CLUB(35) },
          { nome: "Burnley", escudo: CLUB(44) },
          { nome: "Luton Town", escudo: CLUB(41) },
          { nome: "Sheffield United", escudo: CLUB(62) },
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
          { nome: "Real Madrid", escudo: CLUB(541) },
          { nome: "Barcelona", escudo: CLUB(529) },
          { nome: "Atlético de Madrid", escudo: CLUB(530) },
          { nome: "Sevilla", escudo: CLUB(535) },
          { nome: "Valência", escudo: CLUB(532) },
          { nome: "Villarreal", escudo: CLUB(538) },
          { nome: "Real Sociedad", escudo: CLUB(539) },
          { nome: "Athletic Bilbao", escudo: CLUB(540) },
          { nome: "Real Betis", escudo: CLUB(543) },
          { nome: "Girona", escudo: CLUB(542) },
          { nome: "Osasuna", escudo: CLUB(544) },
          { nome: "Getafe", escudo: CLUB(545) },
          { nome: "Celta Vigo", escudo: CLUB(546) },
          { nome: "Mallorca", escudo: CLUB(547) },
          { nome: "Rayo Vallecano", escudo: CLUB(548) },
          { nome: "Alavés", escudo: CLUB(549) },
          { nome: "Las Palmas", escudo: CLUB(550) },
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
          { nome: "Inter de Milão", escudo: CLUB(533) },
          { nome: "Milan", escudo: CLUB(489) },
          { nome: "Juventus", escudo: CLUB(496) },
          { nome: "Napoli", escudo: CLUB(492) },
          { nome: "Roma", escudo: CLUB(497) },
          { nome: "Lazio", escudo: CLUB(488) },
          { nome: "Atalanta", escudo: CLUB(499) },
          { nome: "Fiorentina", escudo: CLUB(502) },
          { nome: "Bologna", escudo: CLUB(510) },
          { nome: "Torino", escudo: CLUB(511) },
          { nome: "Monza", escudo: CLUB(515) },
          { nome: "Genoa", escudo: CLUB(516) },
          { nome: "Lecce", escudo: CLUB(517) },
          { nome: "Udinese", escudo: CLUB(518) },
          { nome: "Empoli", escudo: CLUB(519) },
          { nome: "Verona", escudo: CLUB(520) },
          { nome: "Cagliari", escudo: CLUB(521) },
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
          { nome: "Bayern Munich", escudo: CLUB(157) },
          { nome: "Borussia Dortmund", escudo: CLUB(165) },
          { nome: "RB Leipzig", escudo: CLUB(173) },
          { nome: "Bayer Leverkusen", escudo: CLUB(169) },
          { nome: "Eintracht Frankfurt", escudo: CLUB(161) },
          { nome: "Wolfsburg", escudo: CLUB(175) },
          { nome: "Stuttgart", escudo: CLUB(172) },
          { nome: "Freiburg", escudo: CLUB(167) },
          { nome: "Hoffenheim", escudo: CLUB(179) },
          { nome: "Mainz", escudo: CLUB(180) },
          { nome: "Union Berlin", escudo: CLUB(181) },
          { nome: "Werder Bremen", escudo: CLUB(182) },
          { nome: "Augsburg", escudo: CLUB(183) },
          { nome: "Bochum", escudo: CLUB(184) },
          { nome: "Heidenheim", escudo: CLUB(186) },
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
          { nome: "PSG", escudo: CLUB(85) },
          { nome: "Marseille", escudo: CLUB(81) },
          { nome: "Monaco", escudo: CLUB(91) },
          { nome: "Lyon", escudo: CLUB(80) },
          { nome: "Lille", escudo: CLUB(79) },
          { nome: "Nice", escudo: CLUB(84) },
          { nome: "Rennes", escudo: CLUB(83) },
          { nome: "Lens", escudo: CLUB(82) },
          { nome: "Toulouse", escudo: CLUB(78) },
          { nome: "Nantes", escudo: CLUB(77) },
          { nome: "Reims", escudo: CLUB(76) },
          { nome: "Strasbourg", escudo: CLUB(75) },
          { nome: "Brest", escudo: CLUB(74) },
          { nome: "Le Havre", escudo: CLUB(73) },
          { nome: "Metz", escudo: CLUB(72) },
          { nome: "Lorient", escudo: CLUB(71) },
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
          { nome: "Brasil 1970", escudo: FLAG("br") },
          { nome: "Brasil 2002", escudo: FLAG("br") },
          { nome: "Argentina 1986", escudo: FLAG("ar") },
          { nome: "Uruguai 1950", escudo: FLAG("uy") },
          { nome: "Argentina 2022", escudo: FLAG("ar") },
          { nome: "Brasil 1994", escudo: FLAG("br") },
        ],
      },
      {
        nome: "Europa",
        times: [
          { nome: "Holanda 1974", escudo: FLAG("nl") },
          { nome: "Alemanha 1974", escudo: FLAG("de") },
          { nome: "Itália 1982", escudo: FLAG("it") },
          { nome: "França 1998", escudo: FLAG("fr") },
          { nome: "Espanha 2010", escudo: FLAG("es") },
          { nome: "Alemanha 2014", escudo: FLAG("de") },
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
