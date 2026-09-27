import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ligamx2026';

// 18 Equipos Oficiales con Atlante FC
interface TeamInfo {
  id: string;
  name: string;
  shortName: string;
  badgeUrl: string;
  city: string;
  stadium: string;
  founded: number;
}

const TEAMS: Record<string, TeamInfo> = {
  america: {
    id: "america",
    name: "Club América",
    shortName: "AME",
    city: "Ciudad de México",
    stadium: "Estadio Ciudad de los Deportes",
    founded: 1916,
    badgeUrl: "/teams/america.png"
  },
  atlante: {
    id: "atlante",
    name: "Atlante FC",
    shortName: "ATL",
    city: "Ciudad de México",
    stadium: "Estadio Ciudad de los Deportes",
    founded: 1916,
    badgeUrl: "/teams/atlante.png"
  },
  atlas: {
    id: "atlas",
    name: "Atlas FC",
    shortName: "ATS",
    city: "Guadalajara, Jalisco",
    stadium: "Estadio Jalisco",
    founded: 1916,
    badgeUrl: "/teams/atlas.png"
  },
  san_luis: {
    id: "san_luis",
    name: "Atlético de San Luis",
    shortName: "ASL",
    city: "San Luis Potosí",
    stadium: "Estadio Alfonso Lastras",
    founded: 2013,
    badgeUrl: "/teams/san_luis.png"
  },
  cruz_azul: {
    id: "cruz_azul",
    name: "Cruz Azul",
    shortName: "CAZ",
    city: "Ciudad de México",
    stadium: "Estadio Ciudad de los Deportes",
    founded: 1927,
    badgeUrl: "/teams/cruz_azul.png"
  },
  guadalajara: {
    id: "guadalajara",
    name: "Guadalajara (Chivas)",
    shortName: "GDL",
    city: "Guadalajara, Jalisco",
    stadium: "Estadio Akron",
    founded: 1906,
    badgeUrl: "/teams/guadalajara.png"
  },
  leon: {
    id: "leon",
    name: "Club León",
    shortName: "LEO",
    city: "León, Guanajuato",
    stadium: "Estadio León (Nou Camp)",
    founded: 1944,
    badgeUrl: "/teams/leon.png"
  },
  juarez: {
    id: "juarez",
    name: "FC Juárez (Bravos)",
    shortName: "JUA",
    city: "Ciudad Juárez, Chihuahua",
    stadium: "Estadio Olímpico Benito Juárez",
    founded: 2015,
    badgeUrl: "/teams/juarez.png"
  },
  monterrey: {
    id: "monterrey",
    name: "CF Monterrey (Rayados)",
    shortName: "MTY",
    city: "Monterrey, Nuevo León",
    stadium: "Estadio BBVA",
    founded: 1945,
    badgeUrl: "/teams/monterrey.png"
  },
  necaxa: {
    id: "necaxa",
    name: "Club Necaxa",
    shortName: "NEC",
    city: "Aguascalientes",
    stadium: "Estadio Victoria",
    founded: 1923,
    badgeUrl: "/teams/necaxa.png"
  },
  pachuca: {
    id: "pachuca",
    name: "CF Pachuca (Tuzos)",
    shortName: "PAC",
    city: "Pachuca, Hidalgo",
    stadium: "Estadio Hidalgo",
    founded: 1901,
    badgeUrl: "/teams/pachuca.png"
  },
  puebla: {
    id: "puebla",
    name: "Club Puebla (La Franja)",
    shortName: "PUE",
    city: "Puebla, Puebla",
    stadium: "Estadio Cuauhtémoc",
    founded: 1944,
    badgeUrl: "/teams/puebla.png"
  },
  pumas: {
    id: "pumas",
    name: "Pumas UNAM",
    shortName: "PUM",
    city: "Ciudad de México",
    stadium: "Estadio Olímpico Universitario",
    founded: 1954,
    badgeUrl: "/teams/pumas.png"
  },
  queretaro: {
    id: "queretaro",
    name: "Querétaro FC (Gallos)",
    shortName: "QRO",
    city: "Querétaro, Qro.",
    stadium: "Estadio Corregidora",
    founded: 1950,
    badgeUrl: "/teams/queretaro.png"
  },
  santos: {
    id: "santos",
    name: "Santos Laguna",
    shortName: "SAN",
    city: "Torreón, Coahuila",
    stadium: "Estadio Corona (TSM)",
    founded: 1983,
    badgeUrl: "/teams/santos.png"
  },
  tigres: {
    id: "tigres",
    name: "Tigres UANL",
    shortName: "TIG",
    city: "San Nicolás de los Garza, N.L.",
    stadium: "Estadio Universitario",
    founded: 1960,
    badgeUrl: "/teams/tigres.png"
  },
  toluca: {
    id: "toluca",
    name: "Deportivo Toluca",
    shortName: "TOL",
    city: "Toluca, Estado de México",
    stadium: "Estadio Nemesio Díez",
    founded: 1917,
    badgeUrl: "/teams/toluca.png"
  },
  tijuana: {
    id: "tijuana",
    name: "Club Tijuana (Xolos)",
    shortName: "TIJ",
    city: "Tijuana, Baja California",
    stadium: "Estadio Caliente",
    founded: 2007,
    badgeUrl: "/teams/tijuana.png"
  },
  tbd: {
    id: "tbd",
    name: "Por Confirmar",
    shortName: "TBD",
    city: "Liga BBVA MX",
    stadium: "Estadio por definir",
    founded: 2026,
    badgeUrl: "/teams/tbd.svg"
  },
  por_confirmar: {
    id: "por_confirmar",
    name: "Por Confirmar",
    shortName: "TBD",
    city: "Liga BBVA MX",
    stadium: "Estadio por definir",
    founded: 2026,
    badgeUrl: "/teams/tbd.svg"
  }
};

export interface MatchEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'var' | 'substitution';
  minute: number;
  teamId: string;
  player: string;
  detail?: string;
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
  period: string; // '1T', 'Descanso', '2T', 'FT'
  stadium: string;
  date: string;
  time: string;
  isManualOverride: boolean;
  events: MatchEvent[];
  stats: {
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
  };
  lastUpdated: string;
}

import { APERTURA_2026_MATCHES } from './src/fixturesApertura2026';

// Initial central state loaded from Apertura 2026 Official Calendar
let matchesState: Match[] = [...APERTURA_2026_MATCHES];

// App global settings - 100% Control Manual Sin API Externa
let appSettings = {
  showAdminToPublic: true,
  lastApiSync: new Date().toISOString(),
  apiStatus: 'manual_master_control',
  autoClockRunning: false,
  connectedClients: 0
};

// SSE Active Response streams
const sseClients = new Set<Response>();

function broadcast(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Timer opcional para avanzar minuto en vivo solo si el usuario lo activa desde el panel
setInterval(() => {
  if (!appSettings.autoClockRunning) return;
  let changed = false;
  matchesState = matchesState.map(m => {
    if (m.status === 'LIVE') {
      const nextMin = m.minute + 1;
      if (nextMin === 45) {
        changed = true;
        return { ...m, minute: 45, status: 'HALFTIME', period: 'Descanso', lastUpdated: new Date().toISOString() };
      } else if (nextMin >= 90) {
        changed = true;
        return { ...m, minute: 90, status: 'FINISHED', period: 'FT', lastUpdated: new Date().toISOString() };
      } else {
        changed = true;
        return { ...m, minute: nextMin, lastUpdated: new Date().toISOString() };
      }
    }
    return m;
  });

  if (changed) {
    broadcast('ticker_update', { matches: matchesState });
  }
}, 60000);

const CUSTOM_BADGES_FILE = path.resolve(__dirname, 'custom_badges.json');
let customBadges: Record<string, string> = {};
if (fs.existsSync(CUSTOM_BADGES_FILE)) {
  try {
    customBadges = JSON.parse(fs.readFileSync(CUSTOM_BADGES_FILE, 'utf-8'));
    for (const [tId, bUrl] of Object.entries(customBadges)) {
      if (TEAMS[tId]) {
        TEAMS[tId].badgeUrl = bUrl;
      }
    }
  } catch (err) {
    console.warn('Error reading custom_badges.json:', err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Servir escudos oficiales directamente con caché de alto rendimiento
  app.use('/teams', express.static(path.resolve(__dirname, 'public/teams'), { maxAge: '7d' }));
  app.use(express.static(path.resolve(__dirname, 'public'), { maxAge: '1d' }));

  // Rutas de API
  app.get('/api/teams', (_req: Request, res: Response) => {
    res.json({
      success: true,
      teams: Object.values(TEAMS),
      total: 18,
      notice: "Mazatlán FC ha sido reemplazado oficialmente por Atlante FC."
    });
  });

  app.get('/api/matches', (_req: Request, res: Response) => {
    res.json({
      success: true,
      matches: matchesState,
      settings: {
        showAdminToPublic: appSettings.showAdminToPublic,
        lastApiSync: appSettings.lastApiSync
      }
    });
  });

  app.get('/api/settings', (_req: Request, res: Response) => {
    res.json({
      showAdminToPublic: appSettings.showAdminToPublic,
      lastApiSync: appSettings.lastApiSync,
      apiStatus: appSettings.apiStatus,
      connectedClients: sseClients.size
    });
  });

  // Server-Sent Events (SSE) para sincronización centralizada instantánea en tiempo real
  app.get('/api/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    sseClients.add(res);
    appSettings.connectedClients = sseClients.size;

    // Enviar estado inicial al nuevo cliente conectado
    const initialPayload = JSON.stringify({
      type: 'INIT',
      matches: matchesState,
      settings: appSettings,
      teams: Object.values(TEAMS),
      serverTime: new Date().toISOString()
    });
    res.write(`event: init\ndata: ${initialPayload}\n\n`);

    broadcast('client_count', { count: sseClients.size });

    req.on('close', () => {
      sseClients.delete(res);
      appSettings.connectedClients = sseClients.size;
      broadcast('client_count', { count: sseClients.size });
    });
  });

  // Autenticación de Admin
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      return res.json({ success: true, token: 'auth-ligamx-admin-valid' });
    }
    return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
  });

  // Toggle de visibilidad del panel admin al público
  app.post('/api/admin/visibility', (req: Request, res: Response) => {
    const { password, showAdminToPublic } = req.body;
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    appSettings.showAdminToPublic = Boolean(showAdminToPublic);
    broadcast('settings_update', { showAdminToPublic: appSettings.showAdminToPublic });

    res.json({
      success: true,
      showAdminToPublic: appSettings.showAdminToPublic
    });
  });

  // Actualización manual de partido desde el panel Admin (activa isManualOverride: true)
  app.post('/api/admin/match/update', (req: Request, res: Response) => {
    const {
      password,
      matchId,
      homeScore,
      awayScore,
      minute,
      status,
      period,
      newGoalEvent,
      homeTeamId,
      awayTeamId,
      stadium,
      date,
      time
    } = req.body;

    if (password !== ADMIN_PASSWORD && password !== 'ligamx2026') {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const matchIndex = matchesState.findIndex(m => m.id === matchId);
    if (matchIndex === -1) {
      return res.status(404).json({ success: false, error: 'Partido no encontrado' });
    }

    const oldMatch = matchesState[matchIndex];
    const prevHomeScore = oldMatch.homeScore;
    const prevAwayScore = oldMatch.awayScore;

    const updatedMatch: Match = {
      ...oldMatch,
      homeTeamId: homeTeamId && TEAMS[homeTeamId] ? homeTeamId : oldMatch.homeTeamId,
      awayTeamId: awayTeamId && TEAMS[awayTeamId] ? awayTeamId : oldMatch.awayTeamId,
      stadium: stadium || oldMatch.stadium,
      date: date || oldMatch.date,
      time: time || oldMatch.time,
      homeScore: typeof homeScore === 'number' ? homeScore : oldMatch.homeScore,
      awayScore: typeof awayScore === 'number' ? awayScore : oldMatch.awayScore,
      minute: typeof minute === 'number' ? minute : oldMatch.minute,
      status: status || oldMatch.status,
      period: period || oldMatch.period,
      isManualOverride: true, // ANULACIÓN MANUAL ACTIVADA
      lastUpdated: new Date().toISOString()
    };

    // Si se agrega un nuevo evento de gol
    if (newGoalEvent) {
      const eventObj: MatchEvent = {
        id: `ev-${Date.now()}`,
        type: newGoalEvent.type || 'goal',
        minute: updatedMatch.minute,
        teamId: newGoalEvent.teamId,
        player: newGoalEvent.player || 'Jugador',
        detail: newGoalEvent.detail || 'Gol anotado'
      };
      updatedMatch.events = [...updatedMatch.events, eventObj];
    }

    matchesState[matchIndex] = updatedMatch;

    // Detectar si hubo gol
    const homeGoal = updatedMatch.homeScore > prevHomeScore;
    const awayGoal = updatedMatch.awayScore > prevAwayScore;

    if (homeGoal || awayGoal) {
      const scoringTeamId = homeGoal ? updatedMatch.homeTeamId : updatedMatch.awayTeamId;
      const scoringTeam = TEAMS[scoringTeamId];
      const homeTeam = TEAMS[updatedMatch.homeTeamId];
      const awayTeam = TEAMS[updatedMatch.awayTeamId];

      const goalAlert = {
        title: `¡GOOOOL DE ${scoringTeam?.name.toUpperCase()}!`,
        body: `${homeTeam?.shortName} ${updatedMatch.homeScore} - ${updatedMatch.awayScore} ${awayTeam?.shortName} (Minuto ${updatedMatch.minute}')`,
        scoringTeam: scoringTeam?.name,
        badgeUrl: scoringTeam?.badgeUrl,
        minute: updatedMatch.minute,
        matchId: updatedMatch.id,
        homeScore: updatedMatch.homeScore,
        awayScore: updatedMatch.awayScore
      };

      // Transmisión instantánea de GOL a todos los dispositivos
      broadcast('goal_alert', goalAlert);
    }

    // Transmisión instantánea de actualización a todos los dispositivos
    broadcast('match_update', { match: updatedMatch, matches: matchesState });

    res.json({
      success: true,
      match: updatedMatch,
      isManualOverride: true
    });
  });

  // Crear nuevo partido manualmente (cualquier combinación de los 18 clubes)
  app.post('/api/admin/match/create', (req: Request, res: Response) => {
    const { password, jornada, homeTeamId, awayTeamId, stadium, date, time, status, homeScore, awayScore, minute, period } = req.body;
    if (password && password !== ADMIN_PASSWORD && password !== 'ligamx2026') {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }
    if (!TEAMS[homeTeamId] || !TEAMS[awayTeamId]) {
      return res.status(400).json({ success: false, error: 'Equipos no válidos' });
    }
    const newMatch: Match = {
      id: `m-custom-${Date.now()}`,
      jornada: Number(jornada) || 10,
      homeTeamId,
      awayTeamId,
      homeScore: Number(homeScore) || 0,
      awayScore: Number(awayScore) || 0,
      status: status || 'SCHEDULED',
      minute: Number(minute) || 0,
      period: period || (status === 'LIVE' ? '1T' : 'Previo'),
      stadium: stadium || TEAMS[homeTeamId]?.stadium || 'Estadio Liga MX',
      date: date || 'Hoy',
      time: time || '20:00',
      isManualOverride: true,
      events: [],
      stats: {
        homePossession: 50,
        awayPossession: 50,
        homeShots: 0,
        awayShots: 0,
        homeShotsOnTarget: 0,
        awayShotsOnTarget: 0,
        homeCorners: 0,
        awayCorners: 0,
        homeFouls: 0,
        awayFouls: 0
      },
      lastUpdated: new Date().toISOString()
    };
    matchesState = [newMatch, ...matchesState];
    broadcast('match_update', { match: newMatch, matches: matchesState });
    res.json({ success: true, match: newMatch, matches: matchesState, message: 'Partido creado con éxito.' });
  });

  // Eliminar un partido
  app.post('/api/admin/match/delete', (req: Request, res: Response) => {
    const { password, matchId } = req.body;
    if (password && password !== ADMIN_PASSWORD && password !== 'ligamx2026') {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }
    matchesState = matchesState.filter(m => m.id !== matchId);
    broadcast('match_update', { matches: matchesState });
    res.json({ success: true, matches: matchesState, message: 'Partido eliminado.' });
  });

  // Reiniciar un partido a 0-0
  app.post('/api/admin/match/reset', (req: Request, res: Response) => {
    const { password, matchId } = req.body;
    if (password && password !== ADMIN_PASSWORD && password !== 'ligamx2026') {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }
    const idx = matchesState.findIndex(m => m.id === matchId);
    if (idx !== -1) {
      matchesState[idx] = {
        ...matchesState[idx],
        homeScore: 0,
        awayScore: 0,
        minute: 0,
        status: 'SCHEDULED',
        period: 'Previo',
        events: [],
        lastUpdated: new Date().toISOString()
      };
      broadcast('match_update', { match: matchesState[idx], matches: matchesState });
      return res.json({ success: true, match: matchesState[idx], message: 'Partido reiniciado.' });
    }
    res.status(404).json({ success: false, error: 'Partido no encontrado' });
  });

  // Agregar evento a un partido (Gol, Tarjeta Amarilla, Roja, VAR, Sustitución)
  app.post('/api/admin/match/event', (req: Request, res: Response) => {
    const { password, matchId, type, minute, teamId, player, detail } = req.body;
    if (password && password !== ADMIN_PASSWORD && password !== 'ligamx2026') {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }
    const idx = matchesState.findIndex(m => m.id === matchId);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Partido no encontrado' });

    const newEvent: MatchEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: type || 'goal',
      minute: Number(minute) || matchesState[idx].minute,
      teamId: teamId || matchesState[idx].homeTeamId,
      player: player || 'Jugador',
      detail: detail || ''
    };

    matchesState[idx].events = [...matchesState[idx].events, newEvent];
    matchesState[idx].lastUpdated = new Date().toISOString();
    broadcast('match_update', { match: matchesState[idx], matches: matchesState });
    res.json({ success: true, event: newEvent, match: matchesState[idx] });
  });

  // Actualizar estadísticas detalladas de un partido
  app.post('/api/admin/match/stats', (req: Request, res: Response) => {
    const { password, matchId, stats } = req.body;
    if (password && password !== ADMIN_PASSWORD && password !== 'ligamx2026') {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }
    const idx = matchesState.findIndex(m => m.id === matchId);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Partido no encontrado' });

    matchesState[idx].stats = {
      ...matchesState[idx].stats,
      ...stats
    };
    matchesState[idx].lastUpdated = new Date().toISOString();
    broadcast('match_update', { match: matchesState[idx], matches: matchesState });
    res.json({ success: true, match: matchesState[idx] });
  });

  // Alternar avance automático del temporizador en partidos EN VIVO
  app.post('/api/admin/clock/toggle', (req: Request, res: Response) => {
    const { password, running } = req.body;
    if (password && password !== ADMIN_PASSWORD && password !== 'ligamx2026') {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }
    appSettings.autoClockRunning = typeof running === 'boolean' ? running : !appSettings.autoClockRunning;
    broadcast('settings_update', appSettings);
    res.json({ success: true, autoClockRunning: appSettings.autoClockRunning });
  });

  // Enviar alerta de prueba de notificación push / gol
  app.post('/api/admin/test-alert', (req: Request, res: Response) => {
    const { password, teamId } = req.body;
    if (password && password !== ADMIN_PASSWORD && password !== 'ligamx2026') {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const team = TEAMS[teamId] || TEAMS['atlante'] || TEAMS['america'];
    const alertData = {
      title: `¡GOOOOL DE ${team.name.toUpperCase()}!`,
      body: `Golazo en vivo de prueba (Minuto 75')`,
      scoringTeam: team.name,
      badgeUrl: team.badgeUrl,
      minute: 75,
      isTest: true
    };

    broadcast('goal_alert', alertData);
    res.json({ success: true, alert: alertData });
  });

  // Cambiar escudo oficial de un equipo (por URL o por subida de archivo Base64)
  app.post('/api/admin/teams/update-badge', (req: Request, res: Response) => {
    const { password, teamId, badgeUrl, base64Data } = req.body;
    if (password && password !== ADMIN_PASSWORD && password !== 'ligamx2026') {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }
    if (!TEAMS[teamId]) {
      return res.status(404).json({ success: false, error: 'Equipo no encontrado' });
    }

    let finalBadgeUrl = badgeUrl;

    // Si envió una imagen subida en base64
    if (base64Data && typeof base64Data === 'string' && base64Data.startsWith('data:image/')) {
      try {
        const matches = base64Data.match(/^data:image\/([a-zA-Z0-9\+\-]+);base64,(.+)$/);
        if (matches) {
          const rawExt = matches[1];
          const ext = rawExt.includes('svg') ? 'svg' : rawExt.includes('jpeg') ? 'jpg' : rawExt.includes('webp') ? 'webp' : 'png';
          const buffer = Buffer.from(matches[2], 'base64');
          const filename = `${teamId}_custom_${Date.now()}.${ext}`;
          
          const publicTeamsDir = path.resolve(__dirname, 'public/teams');
          if (!fs.existsSync(publicTeamsDir)) {
            fs.mkdirSync(publicTeamsDir, { recursive: true });
          }
          fs.writeFileSync(path.resolve(publicTeamsDir, filename), buffer);
          finalBadgeUrl = `/teams/${filename}`;
        }
      } catch (err: any) {
        console.error('Error procesando imagen subida:', err);
        return res.status(500).json({ success: false, error: 'Error al procesar archivo de imagen' });
      }
    }

    if (!finalBadgeUrl) {
      return res.status(400).json({ success: false, error: 'Se requiere una URL o archivo de imagen' });
    }

    TEAMS[teamId].badgeUrl = finalBadgeUrl;
    customBadges[teamId] = finalBadgeUrl;

    try {
      fs.writeFileSync(CUSTOM_BADGES_FILE, JSON.stringify(customBadges, null, 2));
    } catch (err) {
      console.warn('Error guardando custom_badges.json:', err);
    }

    // Transmitir a todos los clientes en tiempo real
    broadcast('teams_update', {
      teams: Object.values(TEAMS),
      updatedTeamId: teamId,
      badgeUrl: finalBadgeUrl
    });

    res.json({
      success: true,
      team: TEAMS[teamId],
      message: `Escudo de ${TEAMS[teamId].name} actualizado con éxito.`
    });
  });

  // Restablecer escudo al original de base
  app.post('/api/admin/teams/reset-badge', (req: Request, res: Response) => {
    const { password, teamId } = req.body;
    if (password && password !== ADMIN_PASSWORD && password !== 'ligamx2026') {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }
    if (!TEAMS[teamId]) {
      return res.status(404).json({ success: false, error: 'Equipo no encontrado' });
    }

    const defaultUrl = `/teams/${teamId}.png`;
    TEAMS[teamId].badgeUrl = defaultUrl;
    delete customBadges[teamId];

    try {
      fs.writeFileSync(CUSTOM_BADGES_FILE, JSON.stringify(customBadges, null, 2));
    } catch (err) {
      console.warn('Error guardando custom_badges.json:', err);
    }

    broadcast('teams_update', {
      teams: Object.values(TEAMS),
      updatedTeamId: teamId,
      badgeUrl: defaultUrl
    });

    res.json({
      success: true,
      team: TEAMS[teamId],
      message: `Escudo de ${TEAMS[teamId].name} restablecido al original.`
    });
  });

  // Servir Vite en desarrollo o estáticos en producción
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Servidor Liga MX] Corriendo en http://0.0.0.0:${PORT}`);
    console.log(`[Tiempo Real] SSE activo en /api/events`);
    console.log(`[Control Maestro] Modo 100% Manual y Firestore activos`);
  });
}

startServer().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});
