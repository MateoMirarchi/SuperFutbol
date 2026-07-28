/**
 * teamDbUtils.js
 * Funciones auxiliares para la base de datos de equipos y jugadores.
 *
 * Responsabilidades:
 *   - Inicialización ("seed") de la DB a partir de leagues.js
 *   - Cálculo y formateo de presupuesto
 *   - Filtros de búsqueda y ordenamiento
 *   - Validaciones de campos requeridos
 *   - Generación de IDs y valores por defecto
 *
 * Separación: utils/ → funciones puras sin estado.
 * Consumido por: hooks/useTeamDatabase.js, pages/TeamManager/
 */

import { LEAGUES } from '../data/leagues';

// ── Clave de la "base de datos" en localStorage ───────────────────────────
export const DB_KEY     = 'superfutbol_db';
export const DB_VERSION = 1;

// ── Colores por defecto por liga ──────────────────────────────────────────
const LEAGUE_COLORS = {
  arg: { primary: '#6CACE4', secondary: '#FFFFFF' }, // celeste / blanco
  bra: { primary: '#009C3B', secondary: '#FFDF00' }, // verde / amarillo
  esp: { primary: '#C60B1E', secondary: '#FFC400' }, // rojo / amarillo
  ger: { primary: '#DD0000', secondary: '#000000' }, // rojo / negro
  ita: { primary: '#003399', secondary: '#FFFFFF' }, // azul / blanco
  fra: { primary: '#002395', secondary: '#ED2939' }, // azul / rojo
};

// ── Seed: genera la DB inicial a partir de LEAGUES ────────────────────────

/**
 * Genera la estructura inicial de la base de datos a partir de LEAGUES.
 * Los jugadores comienzan vacíos; se crean desde el gestor de equipos.
 *
 * @returns {{ version, teams, players }}
 */
export function seedDatabase() {
  const teams = [];
  for (const league of LEAGUES) {
    const colors = LEAGUE_COLORS[league.id] ?? { primary: '#1E3A5F', secondary: '#FFFFFF' };
    for (const division of league.divisions) {
      for (const team of division.teams) {
        teams.push({
          id:             team.id,
          name:           team.name,
          shortName:      team.shortName,
          city:           team.city ?? '',
          leagueId:       league.id,
          leagueName:     league.name,
          leagueFlag:     league.flag,
          divisionLevel:  division.level,
          divisionName:   division.name,
          prestige:       team.prestige ?? 50,
          primaryColor:   colors.primary,
          secondaryColor: colors.secondary,
        });
      }
    }
  }
  return { version: DB_VERSION, teams, players: [] };
}

// ── Presupuesto ───────────────────────────────────────────────────────────

/**
 * Calcula la sumatoria de salarios mensuales del equipo ($K).
 * @param {Array} players - Jugadores del equipo
 * @returns {number}
 */
export function calcTeamBudget(players) {
  return players.reduce((sum, p) => sum + (p.salary ?? 0), 0);
}

/**
 * Formatea el presupuesto como string legible.
 * @param {number} totalSalary - Suma de salarios en $K/mes
 * @returns {string}
 */
export function formatBudget(totalSalary) {
  if (totalSalary === 0) return 'Sin plantilla';
  if (totalSalary >= 1000) return `$${(totalSalary / 1000).toFixed(1)}M / mes`;
  return `$${totalSalary}K / mes`;
}

// ── Filtros de búsqueda ───────────────────────────────────────────────────

/**
 * Filtra una lista de equipos por texto, liga y división.
 *
 * @param {Array}        teams
 * @param {string}       query         - Texto de búsqueda (nombre / ciudad / abrev.)
 * @param {string|null}  leagueId      - ID de liga o null para todos
 * @param {number|null}  divisionLevel - Nivel de división (1-4) o null para todos
 * @returns {Array}
 */
export function filterTeams(teams, query = '', leagueId = null, divisionLevel = null) {
  let result = teams;

  if (leagueId) {
    result = result.filter((t) => t.leagueId === leagueId);
  }

  if (divisionLevel) {
    result = result.filter((t) => t.divisionLevel === Number(divisionLevel));
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.city?.toLowerCase().includes(q) ||
        t.shortName?.toLowerCase().includes(q)
    );
  }

  return result;
}

// ── Validaciones ──────────────────────────────────────────────────────────

/**
 * Valida los campos requeridos para crear/editar un equipo.
 * @param {object} data
 * @returns {object} errores por campo (vacío si no hay errores)
 */
export function validateTeam(data) {
  const errors = {};
  if (!data.name?.trim())          errors.name          = 'El nombre es requerido';
  if (!data.shortName?.trim())     errors.shortName     = 'La abreviatura es requerida';
  if (!data.leagueId)              errors.leagueId      = 'La liga es requerida';
  if (!data.divisionLevel)         errors.divisionLevel = 'La divisi\u00F3n es requerida';
  if (data.shortName?.length > 5)  errors.shortName     = 'M\u00E1ximo 5 caracteres';
  return errors;
}

/**
 * Valida los campos requeridos para crear/editar un jugador.
 * @param {object} data
 * @returns {object} errores por campo
 */
export function validatePlayer(data) {
  const errors = {};
  if (!data.firstName?.trim()) errors.firstName = 'El nombre es requerido';
  if (!data.lastName?.trim())  errors.lastName  = 'El apellido es requerido';
  if (!data.teamId)            errors.teamId    = 'El equipo es requerido';
  if (!data.position) {
    errors.position  = 'La posici\u00F3n es requerida';
  } else if (!POSITIONS.includes(normalizePosition(data.position))) {
    errors.position = 'La posici\u00F3n no es v\u00E1lida';
  }
  const age = Number(data.age);
  if (!age || age < 14 || age > 45) errors.age = 'Edad v\u00E1lida: 14-45';
  return errors;
}

// ── Generación de IDs y valores por defecto ───────────────────────────────

/** Genera un ID \u00FAnico con prefijo. */
export function generateDbId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Devuelve valores por defecto para un nuevo jugador.
 * @param {string} teamId - ID del equipo al que pertenece
 */
export function defaultPlayer(teamId = '') {
  return {
    id:                generateDbId('pl'),
    teamId,
    firstName:         '',
    lastName:          '',
    position:          'CM',
    age:               22,
    power:             65,
    value:             1.0,
    salary:            80,
    contractEndSeason: 3,
    status:            'available',
    nationality:       '',
  };
}

/**
 * Devuelve valores por defecto para un nuevo equipo.
 */
export function defaultTeam() {
  return {
    id:             generateDbId('tm'),
    name:           '',
    shortName:      '',
    city:           '',
    leagueId:       '',
    leagueName:     '',
    leagueFlag:     '',
    countryName:    '',
    divisionLevel:  1,
    divisionName:   'Division 1',
    prestige:       50,
    primaryColor:   '#1E3A5F',
    secondaryColor: '#FFFFFF',
  };
}

// ── Helpers de presentaci\u00F3n ────────────────────────────────────────────────

const POSITION_ALIASES = {
  DEF: 'CB',
  MID: 'CM',
  FWD: 'ST',
};

export function normalizePosition(position) {
  const normalized = String(position ?? '').trim().toUpperCase();
  return POSITION_ALIASES[normalized] ?? normalized;
}

export const POSITION_LABELS = {
  GK: 'Arquero',
  LB: 'Lateral izquierdo',
  RB: 'Lateral derecho',
  CB: 'Central',
  CM: 'Mediocentro',
  CDM: 'Mediocentro defensivo',
  CAM: 'Mediocentro ofensivo',
  LM: 'Mediocentro izquierdo',
  RM: 'Mediocentro derecho',
  ST: 'Delantero centro',
  RW: 'Delantero derecho',
  LW: 'Delantero izquierdo',
};

export const POSITION_ORDER = {
  GK: 0,
  LB: 1,
  RB: 2,
  CB: 3,
  CDM: 4,
  CM: 5,
  CAM: 6,
  LM: 7,
  RM: 8,
  LW: 9,
  RW: 10,
  ST: 11,
};

export const STATUS_LABELS = {
  available:  'Disponible',
  injured:    'Lesionado',
  suspended:  'Suspendido',
  loan:       'Cedido',
};

export const POSITIONS = ['GK', 'LB', 'RB', 'CB', 'CM', 'CDM', 'CAM', 'LM', 'RM', 'ST', 'RW', 'LW'];
export const STATUSES   = ['available', 'injured', 'suspended', 'loan'];
