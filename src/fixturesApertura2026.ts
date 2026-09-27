import { Match } from './types';

type RawFixture = [
  jornada: number,
  homeId: string,
  awayId: string,
  day: string,
  time: string,
  stadium: string,
  idSuffix?: string,
  isLiguilla?: boolean,
  stageTitle?: string
];

/**
 * Calendario Oficial Torneo Apertura 2026 - Liga BBVA MX
 * Con casillas listas y equipos "Por Confirmar" (TBD) para asignación manual.
 */
const RAW_FIXTURES: RawFixture[] = [
  // J1 (16, 17, 18 de Julio)
  [1, 'tbd', 'tbd', 'Jueves 16 de Julio', '19:00', 'Estadio Victoria'],
  [1, 'tbd', 'tbd', 'Jueves 16 de Julio', '21:00 HC / 20:00 HL', 'Estadio Caliente'],
  [1, 'tbd', 'tbd', 'Viernes 17 de Julio', '19:00', 'Estadio Libertad Financiera'],
  [1, 'tbd', 'tbd', 'Viernes 17 de Julio', '19:00', 'Estadio Nou Camp'],
  [1, 'tbd', 'tbd', 'Viernes 17 de Julio', '21:00', 'Estadio Olímpico Benito Juárez'],
  [1, 'tbd', 'tbd', 'Sábado 18 de Julio', '17:00', 'Estadio Olímpico Universitario'],
  [1, 'tbd', 'tbd', 'Sábado 18 de Julio', '19:00', 'Estadio Akron'],
  [1, 'tbd', 'tbd', 'Sábado 18 de Julio', '19:00', 'Estadio BBVA'],
  [1, 'tbd', 'tbd', 'Sábado 18 de Julio', '21:00', 'Estadio La Corregidora'],

  // J2 (21, 24, 25, 26 de Julio)
  [2, 'tbd', 'tbd', 'Martes 21 de Julio', '19:00', 'Estadio Banorte'],
  [2, 'tbd', 'tbd', 'Martes 21 de Julio', '21:00', 'Estadio Nemesio Díez'],
  [2, 'tbd', 'tbd', 'Viernes 24 de Julio', '19:00', 'Estadio Universitario'],
  [2, 'tbd', 'tbd', 'Viernes 24 de Julio', '21:00', 'Estadio Banorte'],
  [2, 'tbd', 'tbd', 'Viernes 24 de Julio', '21:00 HC / 20:00 HL', 'Estadio Caliente'],
  [2, 'tbd', 'tbd', 'Sábado 25 de Julio', '17:00', 'Estadio Akron'],
  [2, 'tbd', 'tbd', 'Sábado 25 de Julio', '21:00', 'Estadio TSM Corona'],
  [2, 'tbd', 'tbd', 'Domingo 26 de Julio', '17:00', 'Estadio Victoria'],
  [2, 'tbd', 'tbd', 'Domingo 26 de Julio', '19:00', 'Estadio Hidalgo'],

  // J3 (31 de Julio, 1, 2 de Agosto)
  [3, 'tbd', 'tbd', 'Viernes 31 de Julio', '19:00', 'Estadio Cuauhtémoc'],
  [3, 'tbd', 'tbd', 'Viernes 31 de Julio', '21:00', 'Estadio Libertad Financiera'],
  [3, 'tbd', 'tbd', 'Viernes 31 de Julio', '21:00', 'Estadio Olímpico Benito Juárez'],
  [3, 'tbd', 'tbd', 'Sábado 1 de Agosto', '17:00', 'Estadio La Corregidora'],
  [3, 'tbd', 'tbd', 'Sábado 1 de Agosto', '19:00', 'Estadio Nou Camp'],
  [3, 'tbd', 'tbd', 'Sábado 1 de Agosto', '19:00', 'Estadio Jalisco'],
  [3, 'tbd', 'tbd', 'Sábado 1 de Agosto', '21:00', 'Estadio Banorte'],
  [3, 'tbd', 'tbd', 'Domingo 2 de Agosto', '17:00', 'Estadio Banorte'],
  [3, 'tbd', 'tbd', 'Domingo 2 de Agosto', '19:00', 'Estadio Nemesio Díez'],

  // J4 (15, 16, 17 de Agosto)
  [4, 'tbd', 'tbd', 'Sábado 15 de Agosto', '17:00', 'Estadio Banorte'],
  [4, 'tbd', 'tbd', 'Sábado 15 de Agosto', '19:00', 'Estadio BBVA'],
  [4, 'tbd', 'tbd', 'Sábado 15 de Agosto', '21:00', 'Estadio Jalisco'],
  [4, 'tbd', 'tbd', 'Domingo 16 de Agosto', '12:00', 'Estadio Olímpico Universitario'],
  [4, 'tbd', 'tbd', 'Domingo 16 de Agosto', '17:00', 'Estadio Banorte'],
  [4, 'tbd', 'tbd', 'Domingo 16 de Agosto', '19:00', 'Estadio TSM Corona'],
  [4, 'tbd', 'tbd', 'Domingo 16 de Agosto', '21:00 HC / 20:00 HL', 'Estadio Caliente'],
  [4, 'tbd', 'tbd', 'Lunes 17 de Agosto', '19:00', 'Estadio Victoria'],
  [4, 'tbd', 'tbd', 'Lunes 17 de Agosto', '21:00', 'Estadio Hidalgo'],

  // J5 (21, 22, 23 de Agosto)
  [5, 'tbd', 'tbd', 'Viernes 21 de Agosto', '19:00', 'Estadio Cuauhtémoc'],
  [5, 'tbd', 'tbd', 'Viernes 21 de Agosto', '21:00', 'Estadio Olímpico Benito Juárez'],
  [5, 'tbd', 'tbd', 'Sábado 22 de Agosto', '17:00', 'Estadio La Corregidora'],
  [5, 'tbd', 'tbd', 'Sábado 22 de Agosto', '17:00', 'Estadio Akron'],
  [5, 'tbd', 'tbd', 'Sábado 22 de Agosto', '19:00', 'Estadio Nou Camp'],
  [5, 'tbd', 'tbd', 'Sábado 22 de Agosto', '21:00', 'Estadio Universitario'],
  [5, 'tbd', 'tbd', 'Sábado 22 de Agosto', '21:00', 'Estadio Banorte'],
  [5, 'tbd', 'tbd', 'Domingo 23 de Agosto', '17:00', 'Estadio Libertad Financiera'],
  [5, 'tbd', 'tbd', 'Domingo 23 de Agosto', '19:00', 'Estadio Olímpico Universitario'],

  // J6 (28, 29, 30 de Agosto)
  [6, 'tbd', 'tbd', 'Viernes 28 de Agosto', '19:00', 'Estadio Victoria'],
  [6, 'tbd', 'tbd', 'Viernes 28 de Agosto', '19:00', 'Estadio Banorte'],
  [6, 'tbd', 'tbd', 'Viernes 28 de Agosto', '21:00 HC / 20:00 HL', 'Estadio Caliente'],
  [6, 'tbd', 'tbd', 'Sábado 29 de Agosto', '17:00', 'Estadio Jalisco'],
  [6, 'tbd', 'tbd', 'Sábado 29 de Agosto', '17:00', 'Estadio Hidalgo'],
  [6, 'tbd', 'tbd', 'Sábado 29 de Agosto', '19:00', 'Estadio Banorte'],
  [6, 'tbd', 'tbd', 'Sábado 29 de Agosto', '21:00', 'Estadio TSM Corona'],
  [6, 'tbd', 'tbd', 'Domingo 30 de Agosto', '18:00', 'Estadio Nemesio Díez'],
  [6, 'tbd', 'tbd', 'Domingo 30 de Agosto', '20:00', 'Estadio BBVA'],

  // J7 (4, 5, 6 de Septiembre)
  [7, 'tbd', 'tbd', 'Viernes 4 de Septiembre', '19:00', 'Estadio Cuauhtémoc'],
  [7, 'tbd', 'tbd', 'Viernes 4 de Septiembre', '21:00', 'Estadio Olímpico Benito Juárez'],
  [7, 'tbd', 'tbd', 'Sábado 5 de Septiembre', '17:00', 'Estadio Libertad Financiera'],
  [7, 'tbd', 'tbd', 'Sábado 5 de Septiembre', '17:00', 'Estadio La Corregidora'],
  [7, 'tbd', 'tbd', 'Sábado 5 de Septiembre', '19:00', 'Estadio Universitario'],
  [7, 'tbd', 'tbd', 'Sábado 5 de Septiembre', '19:00', 'Estadio Banorte'],
  [7, 'tbd', 'tbd', 'Sábado 5 de Septiembre', '21:00', 'Estadio Jalisco'],
  [7, 'tbd', 'tbd', 'Domingo 6 de Septiembre', '12:00', 'Estadio Olímpico Universitario'],
  [7, 'tbd', 'tbd', 'Domingo 6 de Septiembre', '20:00', 'Estadio Banorte'],

  // J8 (11, 12, 13 de Septiembre)
  [8, 'tbd', 'tbd', 'Viernes 11 de Septiembre', '19:00', 'Estadio Victoria'],
  [8, 'tbd', 'tbd', 'Viernes 11 de Septiembre', '21:00', 'Estadio Banorte'],
  [8, 'tbd', 'tbd', 'Viernes 11 de Septiembre', '21:00 HC / 20:00 HL', 'Estadio Caliente'],
  [8, 'tbd', 'tbd', 'Sábado 12 de Septiembre', '17:00', 'Estadio Nou Camp'],
  [8, 'tbd', 'tbd', 'Sábado 12 de Septiembre', '17:00 / 19:00 / 21:00', 'Estadio Nemesio Díez'],
  [8, 'tbd', 'tbd', 'Sábado 12 de Septiembre', '17:00 / 19:00 / 21:00', 'Estadio Banorte'],
  [8, 'tbd', 'tbd', 'Domingo 13 de Septiembre', '18:00', 'Estadio TSM Corona'],
  [8, 'tbd', 'tbd', 'Domingo 13 de Septiembre', '18:00', 'Estadio Akron'],
  [8, 'tbd', 'tbd', 'Domingo 13 de Septiembre', '20:00', 'Estadio BBVA'],

  // J9 (18, 19, 20 de Septiembre)
  [9, 'tbd', 'tbd', 'Viernes 18 de Septiembre', '19:00', 'Estadio Cuauhtémoc'],
  [9, 'tbd', 'tbd', 'Viernes 18 de Septiembre', '21:00', 'Estadio Olímpico Benito Juárez'],
  [9, 'tbd', 'tbd', 'Sábado 19 de Septiembre', '17:00', 'Estadio Jalisco'],
  [9, 'tbd', 'tbd', 'Sábado 19 de Septiembre', '17:00', 'Estadio Libertad Financiera'],
  [9, 'tbd', 'tbd', 'Sábado 19 de Septiembre', '19:00', 'Estadio BBVA'],
  [9, 'tbd', 'tbd', 'Sábado 19 de Septiembre', '21:00', 'Estadio Banorte'],
  [9, 'tbd', 'tbd', 'Domingo 20 de Septiembre', '18:00', 'Estadio Hidalgo'],
  [9, 'tbd', 'tbd', 'Domingo 20 de Septiembre', '18:00', 'Estadio Nemesio Díez'],
  [9, 'tbd', 'tbd', 'Domingo 20 de Septiembre', '20:00', 'Estadio La Corregidora'],

  // J10 (25, 26, 27 de Septiembre)
  [10, 'tbd', 'tbd', 'Viernes 25 de Septiembre', '19:00', 'Estadio Banorte'],
  [10, 'tbd', 'tbd', 'Viernes 25 de Septiembre', '21:00 HC / 20:00 HL', 'Estadio Caliente'],
  [10, 'tbd', 'tbd', 'Sábado 26 de Septiembre', '17:00', 'Estadio Akron'],
  [10, 'tbd', 'tbd', 'Sábado 26 de Septiembre', '19:00', 'Estadio TSM Corona'],
  [10, 'tbd', 'tbd', 'Sábado 26 de Septiembre', '19:00', 'Estadio Universitario'],
  [10, 'tbd', 'tbd', 'Sábado 26 de Septiembre', '21:00', 'Estadio Banorte'],
  [10, 'tbd', 'tbd', 'Domingo 27 de Septiembre', '12:00', 'Estadio Olímpico Universitario'],
  [10, 'tbd', 'tbd', 'Domingo 27 de Septiembre', '19:00', 'Estadio Nou Camp'],
  [10, 'tbd', 'tbd', 'Domingo 27 de Septiembre', '21:00', 'Estadio Victoria'],

  // J11 (9, 10, 11 de Octubre)
  [11, 'tbd', 'tbd', 'Viernes 9 de Octubre', '19:00', 'Estadio La Corregidora'],
  [11, 'tbd', 'tbd', 'Viernes 9 de Octubre', '19:00', 'Estadio Cuauhtémoc'],
  [11, 'tbd', 'tbd', 'Viernes 9 de Octubre', '21:00', 'Estadio Universitario'],
  [11, 'tbd', 'tbd', 'Sábado 10 de Octubre', '17:00', 'Estadio Olímpico Benito Juárez'],
  [11, 'tbd', 'tbd', 'Sábado 10 de Octubre', '19:00', 'Estadio Jalisco'],
  [11, 'tbd', 'tbd', 'Sábado 10 de Octubre', '21:00', 'Estadio Banorte'],
  [11, 'tbd', 'tbd', 'Domingo 11 de Octubre', '17:00', 'Estadio Hidalgo'],
  [11, 'tbd', 'tbd', 'Domingo 11 de Octubre', '17:00', 'Estadio Libertad Financiera'],
  [11, 'tbd', 'tbd', 'Domingo 11 de Octubre', '19:00', 'Estadio Olímpico Universitario'],

  // J12 (16, 17, 18 de Octubre)
  [12, 'tbd', 'tbd', 'Viernes 16 de Octubre', '19:00', 'Estadio Victoria'],
  [12, 'tbd', 'tbd', 'Viernes 16 de Octubre', '21:00', 'Estadio Banorte'],
  [12, 'tbd', 'tbd', 'Viernes 16 de Octubre', '21:00 HC / 20:00 HL', 'Estadio Caliente'],
  [12, 'tbd', 'tbd', 'Sábado 17 de Octubre', '17:00', 'Estadio Akron'],
  [12, 'tbd', 'tbd', 'Sábado 17 de Octubre', '17:00', 'Estadio TSM Corona'],
  [12, 'tbd', 'tbd', 'Sábado 17 de Octubre', '19:00', 'Estadio Nou Camp'],
  [12, 'tbd', 'tbd', 'Sábado 17 de Octubre', '19:00', 'Estadio Nemesio Díez'],
  [12, 'tbd', 'tbd', 'Sábado 17 de Octubre', '21:00', 'Estadio Banorte'],
  [12, 'tbd', 'tbd', 'Domingo 18 de Octubre', '19:00', 'Estadio BBVA'],

  // J13 DOBLE (20, 21 de Octubre)
  [13, 'tbd', 'tbd', 'Martes 20 de Octubre', '19:00', 'Estadio Libertad Financiera'],
  [13, 'tbd', 'tbd', 'Martes 20 de Octubre', '19:00', 'Estadio Olímpico Benito Juárez'],
  [13, 'tbd', 'tbd', 'Martes 20 de Octubre', '21:00', 'Estadio Universitario'],
  [13, 'tbd', 'tbd', 'Martes 20 de Octubre', '21:00', 'Estadio Akron'],
  [13, 'tbd', 'tbd', 'Miércoles 21 de Octubre', '19:00', 'Estadio Cuauhtémoc'],
  [13, 'tbd', 'tbd', 'Miércoles 21 de Octubre', '19:00', 'Estadio Jalisco'],
  [13, 'tbd', 'tbd', 'Miércoles 21 de Octubre', '19:00', 'Estadio Nemesio Díez'],
  [13, 'tbd', 'tbd', 'Miércoles 21 de Octubre', '21:00', 'Estadio Hidalgo'],
  [13, 'tbd', 'tbd', 'Miércoles 21 de Octubre', '21:00', 'Estadio TSM Corona'],

  // J14 (23, 24, 25 de Octubre)
  [14, 'tbd', 'tbd', 'Viernes 23 de Octubre', '19:00', 'Estadio Victoria'],
  [14, 'tbd', 'tbd', 'Viernes 23 de Octubre', '21:00', 'Estadio Banorte'],
  [14, 'tbd', 'tbd', 'Sábado 24 de Octubre', '17:00', 'Estadio Nou Camp'],
  [14, 'tbd', 'tbd', 'Sábado 24 de Octubre', '19:00', 'Estadio BBVA'],
  [14, 'tbd', 'tbd', 'Sábado 24 de Octubre', '21:00', 'Estadio Olímpico Universitario'],
  [14, 'tbd', 'tbd', 'Domingo 25 de Octubre', '17:00', 'Estadio Jalisco'],
  [14, 'tbd', 'tbd', 'Domingo 25 de Octubre', '17:00', 'Estadio Banorte'],
  [14, 'tbd', 'tbd', 'Domingo 25 de Octubre', '19:00', 'Estadio La Corregidora'],
  [14, 'tbd', 'tbd', 'Domingo 25 de Octubre', '21:00 HC / 20:00 HL', 'Estadio Caliente'],

  // J15 (30, 31 de Octubre, 1 de Noviembre)
  [15, 'tbd', 'tbd', 'Viernes 30 de Octubre', '19:00', 'Estadio Libertad Financiera'],
  [15, 'tbd', 'tbd', 'Viernes 30 de Octubre', '19:00', 'Estadio Olímpico Benito Juárez'],
  [15, 'tbd', 'tbd', 'Viernes 30 de Octubre', '21:00', 'Estadio Cuauhtémoc'],
  [15, 'tbd', 'tbd', 'Sábado 31 de Octubre', '17:00', 'Estadio Hidalgo'],
  [15, 'tbd', 'tbd', 'Sábado 31 de Octubre', '19:00', 'Estadio Akron'],
  [15, 'tbd', 'tbd', 'Sábado 31 de Octubre', '19:00', 'Estadio BBVA'],
  [15, 'tbd', 'tbd', 'Sábado 31 de Octubre', '21:00', 'Estadio Banorte'],
  [15, 'tbd', 'tbd', 'Domingo 1 de Noviembre', '17:00', 'Estadio TSM Corona'],
  [15, 'tbd', 'tbd', 'Domingo 1 de Noviembre', '19:00', 'Estadio Banorte'],

  // J16 (6, 7, 8 de Noviembre)
  [16, 'tbd', 'tbd', 'Viernes 6 de Noviembre', '19:00', 'Estadio Libertad Financiera'],
  [16, 'tbd', 'tbd', 'Viernes 6 de Noviembre', '19:00', 'Estadio Victoria'],
  [16, 'tbd', 'tbd', 'Viernes 6 de Noviembre', '21:00', 'Estadio Banorte'],
  [16, 'tbd', 'tbd', 'Sábado 7 de Noviembre', '17:00', 'Estadio Jalisco'],
  [16, 'tbd', 'tbd', 'Sábado 7 de Noviembre', '17:00', 'Estadio Universitario'],
  [16, 'tbd', 'tbd', 'Sábado 7 de Noviembre', '19:00', 'Estadio Nemesio Díez'],
  [16, 'tbd', 'tbd', 'Sábado 7 de Noviembre', '21:00', 'Estadio Olímpico Universitario'],
  [16, 'tbd', 'tbd', 'Domingo 8 de Noviembre', '18:00', 'Estadio La Corregidora'],
  [16, 'tbd', 'tbd', 'Domingo 8 de Noviembre', '20:00', 'Estadio Nou Camp'],

  // J17 (20, 21, 22 de Noviembre)
  [17, 'tbd', 'tbd', 'Viernes 20 de Noviembre', '19:00', 'Estadio Cuauhtémoc'],
  [17, 'tbd', 'tbd', 'Viernes 20 de Noviembre', '21:00 HC / 20:00 HL', 'Estadio Olímpico Benito Juárez'],
  [17, 'tbd', 'tbd', 'Viernes 20 de Noviembre', '21:00 HC / 19:00 HL', 'Estadio Caliente'],
  [17, 'tbd', 'tbd', 'Sábado 21 de Noviembre', '17:00', 'Estadio TSM Corona'],
  [17, 'tbd', 'tbd', 'Sábado 21 de Noviembre', '17:00', 'Estadio Hidalgo'],
  [17, 'tbd', 'tbd', 'Sábado 21 de Noviembre', '19:00', 'Estadio Olímpico Universitario'],
  [17, 'tbd', 'tbd', 'Sábado 21 de Noviembre', '21:00', 'Estadio Universitario'],
  [17, 'tbd', 'tbd', 'Domingo 22 de Noviembre', '17:00', 'Estadio Akron'],
  [17, 'tbd', 'tbd', 'Domingo 22 de Noviembre', '19:00', 'Estadio La Corregidora'],

  // LIGUILLA: CUARTOS DE FINAL (CF - 25, 26, 28, 29 de Noviembre) - Espacios por confirmar
  [18, 'tbd', 'tbd', '25/26 de Noviembre', '00:00', 'Estadio por definir', 'cf-ida-1', true, 'Cuartos de Final (Ida)'],
  [18, 'tbd', 'tbd', '25/26 de Noviembre', '00:00', 'Estadio por definir', 'cf-ida-2', true, 'Cuartos de Final (Ida)'],
  [18, 'tbd', 'tbd', '25/26 de Noviembre', '00:00', 'Estadio por definir', 'cf-ida-3', true, 'Cuartos de Final (Ida)'],
  [18, 'tbd', 'tbd', '25/26 de Noviembre', '00:00', 'Estadio por definir', 'cf-ida-4', true, 'Cuartos de Final (Ida)'],
  [18, 'tbd', 'tbd', '28/29 de Noviembre', '00:00', 'Estadio por definir', 'cf-vta-1', true, 'Cuartos de Final (Vuelta)'],
  [18, 'tbd', 'tbd', '28/29 de Noviembre', '00:00', 'Estadio por definir', 'cf-vta-2', true, 'Cuartos de Final (Vuelta)'],
  [18, 'tbd', 'tbd', '28/29 de Noviembre', '00:00', 'Estadio por definir', 'cf-vta-3', true, 'Cuartos de Final (Vuelta)'],
  [18, 'tbd', 'tbd', '28/29 de Noviembre', '00:00', 'Estadio por definir', 'cf-vta-4', true, 'Cuartos de Final (Vuelta)'],

  // LIGUILLA: SEMIFINALES (SF - 2, 3, 5, 6 de Diciembre) - Espacios por confirmar
  [19, 'tbd', 'tbd', '2/3 de Diciembre', '00:00', 'Estadio por definir', 'sf-ida-1', true, 'Semifinal (Ida)'],
  [19, 'tbd', 'tbd', '2/3 de Diciembre', '00:00', 'Estadio por definir', 'sf-ida-2', true, 'Semifinal (Ida)'],
  [19, 'tbd', 'tbd', '5/6 de Diciembre', '00:00', 'Estadio por definir', 'sf-vta-1', true, 'Semifinal (Vuelta)'],
  [19, 'tbd', 'tbd', '5/6 de Diciembre', '00:00', 'Estadio por definir', 'sf-vta-2', true, 'Semifinal (Vuelta)'],

  // LIGUILLA: GRAN FINAL (F - 10, 13 de Diciembre / 24, 27 de Diciembre) - Espacios por confirmar
  [20, 'tbd', 'tbd', '10/24 de Diciembre', '00:00', 'Estadio por definir', 'f-ida-1', true, 'Gran Final (Ida)'],
  [20, 'tbd', 'tbd', '13/27 de Diciembre', '00:00', 'Estadio por definir', 'f-vta-1', true, 'Gran Final (Vuelta)']
];

export const APERTURA_2026_MATCHES: Match[] = RAW_FIXTURES.map((item, idx) => {
  const [jornada, homeTeamId, awayTeamId, date, time, stadium, idSuffix, isLiguilla, stageTitle] = item;
  return {
    id: idSuffix ? `m-liguilla-${idSuffix}` : `m-j${jornada}-${idx + 1}`,
    jornada,
    homeTeamId,
    awayTeamId,
    homeScore: 0,
    awayScore: 0,
    status: 'SCHEDULED',
    minute: 0,
    period: isLiguilla ? (stageTitle || 'Liguilla') : 'Previo',
    stadium,
    date,
    time,
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
});
