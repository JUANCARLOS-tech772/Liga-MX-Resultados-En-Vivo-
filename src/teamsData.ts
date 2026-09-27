export interface Team {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  city: string;
  stadium: string;
  founded: number;
  primaryColor: string;
  secondaryColor: string;
  badgeUrl: string;
  fallbackBadge: string;
  officialPresets?: { name: string; url: string }[];
}

/**
 * Lista Oficial de Equipos de la Liga MX (18 Equipos)
 * Escudos oficiales de alta resolución servidos directamente desde /teams/
 * Mazatlán FC ha sido reemplazado estrictamente por Atlante FC.
 */
export const TEAMS_DATA: Record<string, Team> = {
  america: {
    id: "america",
    name: "Club América",
    shortName: "AME",
    slug: "club-america",
    city: "Ciudad de México",
    stadium: "Estadio Ciudad de los Deportes / Azteca",
    founded: 1916,
    primaryColor: "#fef08a",
    secondaryColor: "#1e3a8a",
    badgeUrl: "/teams/america.png",
    fallbackBadge: "https://r2.thesportsdb.com/images/media/team/badge/amy1xs1581857392.png",
    officialPresets: [
      { name: "Oficial HD (Local)", url: "/teams/america.png" },
      { name: "TheSportsDB R2", url: "https://r2.thesportsdb.com/images/media/team/badge/amy1xs1581857392.png" },
      { name: "ESPN Deportes", url: "https://a.espncdn.com/i/teamlogos/soccer/500/227.png" },
      { name: "FotMob Vector", url: "https://images.fotmob.com/image_resources/logo/teamlogo/8687.png" }
    ]
  },
  atlante: {
    id: "atlante",
    name: "Atlante FC",
    shortName: "ATL",
    slug: "atlante-fc",
    city: "Ciudad de México",
    stadium: "Estadio Ciudad de los Deportes",
    founded: 1916,
    primaryColor: "#991b1b",
    secondaryColor: "#1e3a8a",
    badgeUrl: "/teams/atlante.png",
    fallbackBadge: "https://r2.thesportsdb.com/images/media/team/badge/wcf2r51754018201.png",
    officialPresets: [
      { name: "Oficial HD (Local)", url: "/teams/atlante.png" },
      { name: "TheSportsDB R2", url: "https://r2.thesportsdb.com/images/media/team/badge/wcf2r51754018201.png" },
      { name: "ESPN Deportes", url: "https://a.espncdn.com/i/teamlogos/soccer/500/230.png" }
    ]
  },
  atlas: {
    id: "atlas",
    name: "Atlas FC",
    shortName: "ATS",
    slug: "atlas",
    city: "Guadalajara, Jalisco",
    stadium: "Estadio Jalisco",
    founded: 1916,
    primaryColor: "#dc2626",
    secondaryColor: "#000000",
    badgeUrl: "/teams/atlas.png",
    fallbackBadge: "https://r2.thesportsdb.com/images/media/team/badge/svvyvw1473541813.png",
    officialPresets: [
      { name: "Oficial HD (Local)", url: "/teams/atlas.png" },
      { name: "TheSportsDB R2", url: "https://r2.thesportsdb.com/images/media/team/badge/svvyvw1473541813.png" },
      { name: "ESPN Deportes", url: "https://a.espncdn.com/i/teamlogos/soccer/500/232.png" }
    ]
  },
  san_luis: {
    id: "san_luis",
    name: "Atlético de San Luis",
    shortName: "ASL",
    slug: "atletico-san-luis",
    city: "San Luis Potosí",
    stadium: "Estadio Alfonso Lastras",
    founded: 2013,
    primaryColor: "#dc2626",
    secondaryColor: "#1e40af",
    badgeUrl: "/teams/san_luis.png",
    fallbackBadge: "https://r2.thesportsdb.com/images/media/team/badge/9kgjme1593448412.png",
    officialPresets: [
      { name: "Oficial HD (Local)", url: "/teams/san_luis.png" },
      { name: "TheSportsDB R2", url: "https://r2.thesportsdb.com/images/media/team/badge/9kgjme1593448412.png" },
      { name: "FotMob Vector", url: "https://images.fotmob.com/image_resources/logo/teamlogo/10237.png" }
    ]
  },
  cruz_azul: {
    id: "cruz_azul",
    name: "Cruz Azul",
    shortName: "CAZ",
    slug: "cruz-azul",
    city: "Ciudad de México",
    stadium: "Estadio Ciudad de los Deportes",
    founded: 1927,
    primaryColor: "#2563eb",
    secondaryColor: "#ffffff",
    badgeUrl: "/teams/cruz_azul.png",
    fallbackBadge: "https://r2.thesportsdb.com/images/media/team/badge/wcd2yi1781543370.png",
    officialPresets: [
      { name: "Oficial HD (Local)", url: "/teams/cruz_azul.png" },
      { name: "TheSportsDB R2", url: "https://r2.thesportsdb.com/images/media/team/badge/wcd2yi1781543370.png" },
      { name: "ESPN Deportes", url: "https://a.espncdn.com/i/teamlogos/soccer/500/228.png" },
      { name: "FotMob Vector", url: "https://images.fotmob.com/image_resources/logo/teamlogo/8688.png" }
    ]
  },
  guadalajara: {
    id: "guadalajara",
    name: "Guadalajara (Chivas)",
    shortName: "GDL",
    slug: "chivas-guadalajara",
    city: "Guadalajara, Jalisco",
    stadium: "Estadio Akron",
    founded: 1906,
    primaryColor: "#ef4444",
    secondaryColor: "#1e3a8a",
    badgeUrl: "/teams/guadalajara.png",
    fallbackBadge: "https://r2.thesportsdb.com/images/media/team/badge/mp1box1593452087.png",
    officialPresets: [
      { name: "Oficial HD (Local)", url: "/teams/guadalajara.png" },
      { name: "TheSportsDB R2", url: "https://r2.thesportsdb.com/images/media/team/badge/mp1box1593452087.png" },
      { name: "ESPN Deportes", url: "https://a.espncdn.com/i/teamlogos/soccer/500/229.png" },
      { name: "FotMob Vector", url: "https://images.fotmob.com/image_resources/logo/teamlogo/8689.png" }
    ]
  },
  leon: {
    id: "leon",
    name: "Club León",
    shortName: "LEO",
    slug: "club-leon",
    city: "León, Guanajuato",
    stadium: "Estadio Nou Camp",
    founded: 1944,
    primaryColor: "#15803d",
    secondaryColor: "#ca8a04",
    badgeUrl: "/teams/leon.png",
    fallbackBadge: "https://r2.thesportsdb.com/images/media/team/badge/pc9gro1752393439.png",
    officialPresets: [
      { name: "Oficial HD (Local)", url: "/teams/leon.png" },
      { name: "TheSportsDB R2", url: "https://r2.thesportsdb.com/images/media/team/badge/pc9gro1752393439.png" },
      { name: "ESPN Deportes", url: "https://a.espncdn.com/i/teamlogos/soccer/500/234.png" }
    ]
  },
  juarez: {
    id: "juarez",
    name: "FC Juárez",
    shortName: "JUA",
    slug: "fc-juarez",
    city: "Ciudad Juárez, Chihuahua",
    stadium: "Estadio Olímpico Benito Juárez",
    founded: 2015,
    primaryColor: "#16a34a",
    secondaryColor: "#dc2626",
    badgeUrl: "/teams/juarez.png",
    fallbackBadge: "https://r2.thesportsdb.com/images/media/team/badge/b4oy071567446336.png",
    officialPresets: [
      { name: "Oficial HD (Local)", url: "/teams/juarez.png" },
      { name: "TheSportsDB R2", url: "https://r2.thesportsdb.com/images/media/team/badge/b4oy071567446336.png" },
      { name: "FotMob Vector", url: "https://images.fotmob.com/image_resources/logo/teamlogo/8099.png" }
    ]
  },
  monterrey: {
    id: "monterrey",
    name: "CF Monterrey (Rayados)",
    shortName: "MTY",
    slug: "rayados-monterrey",
    city: "Monterrey, Nuevo León",
    stadium: "Estadio BBVA",
    founded: 1945,
    primaryColor: "#1e3a8a",
    secondaryColor: "#ffffff",
    badgeUrl: "/teams/monterrey.png",
    fallbackBadge: "https://r2.thesportsdb.com/images/media/team/badge/yglj911721542561.png",
    officialPresets: [
      { name: "Oficial HD (Local)", url: "/teams/monterrey.png" },
      { name: "TheSportsDB R2", url: "https://r2.thesportsdb.com/images/media/team/badge/yglj911721542561.png" },
      { name: "ESPN Deportes", url: "https://a.espncdn.com/i/teamlogos/soccer/500/235.png" }
    ]
  },
  necaxa: {
    id: "necaxa",
    name: "Club Necaxa",
    shortName: "NEC",
    slug: "club-necaxa",
    city: "Aguascalientes",
    stadium: "Estadio Victoria",
    founded: 1923,
    primaryColor: "#dc2626",
    secondaryColor: "#ffffff",
    badgeUrl: "/teams/necaxa.png",
    fallbackBadge: "https://r2.thesportsdb.com/images/media/team/badge/tqdk9e1779772432.png",
    officialPresets: [
      { name: "Oficial HD (Local)", url: "/teams/necaxa.png" },
      { name: "TheSportsDB R2", url: "https://r2.thesportsdb.com/images/media/team/badge/tqdk9e1779772432.png" },
      { name: "ESPN Deportes", url: "https://a.espncdn.com/i/teamlogos/soccer/500/236.png" }
    ]
  },
  pachuca: {
    id: "pachuca",
    name: "CF Pachuca (Tuzos)",
    shortName: "PAC",
    slug: "cf-pachuca",
    city: "Pachuca, Hidalgo",
    stadium: "Estadio Hidalgo",
    founded: 1892,
    primaryColor: "#1e40af",
    secondaryColor: "#ffffff",
    badgeUrl: "/teams/pachuca.png",
    fallbackBadge: "https://r2.thesportsdb.com/images/media/team/badge/k9duyw1747334895.png",
    officialPresets: [
      { name: "Oficial HD (Local)", url: "/teams/pachuca.png" },
      { name: "TheSportsDB R2", url: "https://r2.thesportsdb.com/images/media/team/badge/k9duyw1747334895.png" },
      { name: "ESPN Deportes", url: "https://a.espncdn.com/i/teamlogos/soccer/500/237.png" }
    ]
  },
  puebla: {
    id: "puebla",
    name: "Club Puebla",
    shortName: "PUE",
    slug: "club-puebla",
    city: "Puebla",
    stadium: "Estadio Cuauhtémoc",
    founded: 1944,
    primaryColor: "#2563eb",
    secondaryColor: "#ffffff",
    badgeUrl: "/teams/puebla.png",
    fallbackBadge: "https://r2.thesportsdb.com/images/media/team/badge/h0jgg51593451845.png",
    officialPresets: [
      { name: "Oficial HD (Local)", url: "/teams/puebla.png" },
      { name: "TheSportsDB R2", url: "https://r2.thesportsdb.com/images/media/team/badge/h0jgg51593451845.png" },
      { name: "ESPN Deportes", url: "https://a.espncdn.com/i/teamlogos/soccer/500/238.png" }
    ]
  },
  pumas: {
    id: "pumas",
    name: "Pumas UNAM",
    shortName: "PUM",
    slug: "pumas-unam",
    city: "Ciudad de México",
    stadium: "Estadio Olímpico Universitario",
    founded: 1954,
    primaryColor: "#1e3a8a",
    secondaryColor: "#ca8a04",
    badgeUrl: "/teams/pumas.png",
    fallbackBadge: "https://r2.thesportsdb.com/images/media/team/badge/5eltim1651859350.png",
    officialPresets: [
      { name: "Oficial HD (Local)", url: "/teams/pumas.png" },
      { name: "TheSportsDB R2", url: "https://r2.thesportsdb.com/images/media/team/badge/5eltim1651859350.png" },
      { name: "ESPN Deportes", url: "https://a.espncdn.com/i/teamlogos/soccer/500/239.png" }
    ]
  },
  queretaro: {
    id: "queretaro",
    name: "Querétaro FC (Gallos Blancos)",
    shortName: "QRO",
    slug: "queretaro-fc",
    city: "Querétaro",
    stadium: "Estadio Corregidora",
    founded: 1950,
    primaryColor: "#1e40af",
    secondaryColor: "#000000",
    badgeUrl: "/teams/queretaro.png",
    fallbackBadge: "https://r2.thesportsdb.com/images/media/team/badge/024n481781543211.png",
    officialPresets: [
      { name: "Oficial HD (Local)", url: "/teams/queretaro.png" },
      { name: "TheSportsDB R2", url: "https://r2.thesportsdb.com/images/media/team/badge/024n481781543211.png" },
      { name: "ESPN Deportes", url: "https://a.espncdn.com/i/teamlogos/soccer/500/240.png" }
    ]
  },
  santos: {
    id: "santos",
    name: "Santos Laguna",
    shortName: "SAN",
    slug: "santos-laguna",
    city: "Torreón, Coahuila",
    stadium: "Estadio Corona (TSM)",
    founded: 1983,
    primaryColor: "#15803d",
    secondaryColor: "#ffffff",
    badgeUrl: "/teams/santos.png",
    fallbackBadge: "https://r2.thesportsdb.com/images/media/team/badge/kg9gzh1779771734.png",
    officialPresets: [
      { name: "Oficial HD (Local)", url: "/teams/santos.png" },
      { name: "TheSportsDB R2", url: "https://r2.thesportsdb.com/images/media/team/badge/kg9gzh1779771734.png" },
      { name: "ESPN Deportes", url: "https://a.espncdn.com/i/teamlogos/soccer/500/241.png" }
    ]
  },
  tigres: {
    id: "tigres",
    name: "Tigres UANL",
    shortName: "TIG",
    slug: "tigres-uanl",
    city: "San Nicolás de los Garza, Nuevo León",
    stadium: "Estadio Universitario (El Volcán)",
    founded: 1960,
    primaryColor: "#eab308",
    secondaryColor: "#1e3a8a",
    badgeUrl: "/teams/tigres.png",
    fallbackBadge: "https://r2.thesportsdb.com/images/media/team/badge/x6mzk41615832215.png",
    officialPresets: [
      { name: "Oficial HD (Local)", url: "/teams/tigres.png" },
      { name: "TheSportsDB R2", url: "https://r2.thesportsdb.com/images/media/team/badge/x6mzk41615832215.png" },
      { name: "ESPN Deportes", url: "https://a.espncdn.com/i/teamlogos/soccer/500/242.png" }
    ]
  },
  toluca: {
    id: "toluca",
    name: "Deportivo Toluca",
    shortName: "TOL",
    slug: "deportivo-toluca",
    city: "Toluca, Estado de México",
    stadium: "Estadio Nemesio Díez",
    founded: 1917,
    primaryColor: "#dc2626",
    secondaryColor: "#ffffff",
    badgeUrl: "/teams/toluca.png",
    fallbackBadge: "https://r2.thesportsdb.com/images/media/team/badge/y64wy91523913186.png",
    officialPresets: [
      { name: "Oficial HD (Local)", url: "/teams/toluca.png" },
      { name: "TheSportsDB R2", url: "https://r2.thesportsdb.com/images/media/team/badge/y64wy91523913186.png" },
      { name: "ESPN Deportes", url: "https://a.espncdn.com/i/teamlogos/soccer/500/243.png" }
    ]
  },
  tijuana: {
    id: "tijuana",
    name: "Club Tijuana (Xolos)",
    shortName: "TIJ",
    slug: "club-tijuana",
    city: "Tijuana, Baja California",
    stadium: "Estadio Caliente",
    founded: 2007,
    primaryColor: "#dc2626",
    secondaryColor: "#000000",
    badgeUrl: "/teams/tijuana.png",
    fallbackBadge: "https://r2.thesportsdb.com/images/media/team/badge/b0mky81779772352.png",
    officialPresets: [
      { name: "Oficial HD (Local)", url: "/teams/tijuana.png" },
      { name: "TheSportsDB R2", url: "https://r2.thesportsdb.com/images/media/team/badge/b0mky81779772352.png" },
      { name: "FotMob Vector", url: "https://images.fotmob.com/image_resources/logo/teamlogo/8699.png" }
    ]
  },
  tbd: {
    id: "tbd",
    name: "Por Confirmar",
    shortName: "TBD",
    slug: "por-confirmar",
    city: "Liga BBVA MX",
    stadium: "Estadio por definir",
    founded: 2026,
    primaryColor: "#64748b",
    secondaryColor: "#334155",
    badgeUrl: "/teams/tbd.svg",
    fallbackBadge: "/teams/tbd.svg",
    officialPresets: [
      { name: "Escudo Gris Oficial", url: "/teams/tbd.svg" }
    ]
  },
  por_confirmar: {
    id: "por_confirmar",
    name: "Por Confirmar",
    shortName: "TBD",
    slug: "por-confirmar",
    city: "Liga BBVA MX",
    stadium: "Estadio por definir",
    founded: 2026,
    primaryColor: "#64748b",
    secondaryColor: "#334155",
    badgeUrl: "/teams/tbd.svg",
    fallbackBadge: "/teams/tbd.svg",
    officialPresets: [
      { name: "Escudo Gris Oficial", url: "/teams/tbd.svg" }
    ]
  }
};

export const TEAMS_ARRAY: Team[] = Object.values(TEAMS_DATA);

// Los 18 clubes oficiales de la Liga MX (excluyendo el comodín TBD)
export const LIGA_MX_18_TEAMS: Team[] = Object.values(TEAMS_DATA).filter(
  t => t.id !== 'tbd' && t.id !== 'por_confirmar'
);

export function getTeam(teamId: string): Team | undefined {
  return TEAMS_DATA[teamId] || TEAMS_DATA['tbd'];
}
