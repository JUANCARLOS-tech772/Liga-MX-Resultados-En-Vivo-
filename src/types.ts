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

export interface MatchEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'var' | 'substitution';
  minute: number;
  teamId: string;
  player: string;
  detail?: string;
}

export interface MatchStats {
  homePossession: number;
  awayPossession: number;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homeCorners: number;
  awayCorners: number;
  homeFouls: number;
  awayFouls: number;
}

export interface Match {
  id: string;
  jornada: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  status: 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'FINISHED';
  minute: number;
  period: string; // '1T', 'Descanso', '2T', 'FT', 'Previo'
  stadium: string;
  date: string;
  time: string;
  isManualOverride: boolean;
  events: MatchEvent[];
  stats: MatchStats;
  lastUpdated: string;
}

export interface GoalAlertPayload {
  title: string;
  body: string;
  scoringTeam: string;
  badgeUrl: string;
  minute: number;
  matchId?: string;
  homeScore?: number;
  awayScore?: number;
  isTest?: boolean;
}

export interface AppSettings {
  showAdminToPublic: boolean;
  lastApiSync: string;
  apiStatus?: string;
  connectedClients?: number;
}

export interface StandingRow {
  rank: number;
  teamId: string;
  name: string;
  shortName: string;
  badgeUrl: string;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
  form: ('W' | 'D' | 'L')[];
  liveMatchInfo?: {
    opponentId: string;
    opponentName: string;
    opponentBadge: string;
    minute: number;
    matchScore: string;
    isHome: boolean;
    period: string;
    livePointsDelta: number;
  };
}
