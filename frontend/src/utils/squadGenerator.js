/**
 * squadGenerator.js
 * Genera una plantilla de jugadores aleatorios para un equipo
 * basándose en el prestigio del equipo.
 *
 * Separación: utils/ → generación de datos sin estado.
 * Consumido por: hooks/useGameState.js (al crear nueva partida)
 */

import { generateId } from './gameHelpers';

// Plantilla de posiciones para una plantilla estándar de 22 jugadores
const POSITION_TEMPLATE = [
  'GK', 'GK',
  'LB', 'LB', 'RB', 'RB', 'CB', 'CB', 'CB', 'CB',
  'CDM', 'CDM', 'CM', 'CM', 'CAM', 'CAM', 'LM', 'RM',
  'ST', 'ST', 'LW', 'RW',
];

const FIRST_NAMES = [
  'Carlos', 'Lucas', 'Matías', 'Diego', 'Gonzalo', 'Sebastián', 'Rodrigo',
  'Facundo', 'Nicolás', 'Pablo', 'Hernán', 'Ezequiel', 'Leandro', 'Javier',
  'Fernando', 'Juan', 'Alejandro', 'Cristian', 'Franco', 'Ramiro',
  'Emiliano', 'Mauro', 'Agustín', 'Tomás', 'Ignacio', 'Santiago', 'Martín',
  'Lautaro', 'Thiago', 'Bruno', 'Gabriel', 'Rafael', 'Pedro', 'Adrián',
];

const LAST_NAMES = [
  'González', 'Rodríguez', 'López', 'Martínez', 'García', 'Fernández',
  'Pérez', 'Álvarez', 'Gómez', 'Sánchez', 'Romero', 'Díaz', 'Torres',
  'Ruiz', 'Herrera', 'Morales', 'Benítez', 'Castro', 'Ramos', 'Ortega',
  'Suárez', 'Méndez', 'Silva', 'Flores', 'Cabrera', 'Vega', 'Ríos',
  'Delgado', 'Vargas', 'Núñez', 'Aguirre', 'Ibáñez', 'Cáceres', 'Rojas',
];

/** Devuelve un nombre y apellido aleatorios. */
function randomName() {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName  = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return { firstName, lastName };
}

/**
 * Genera la potencia del jugador en función del prestigio del equipo.
 * Equipos de prestige 90+ → jugadores ~75-98
 * Equipos de prestige 50  → jugadores ~38-62
 */
function randomPower(prestige) {
  const base   = Math.round(prestige * 0.78);
  const spread = Math.round(prestige * 0.22) + 6;
  const power  = base + Math.floor(Math.random() * spread);
  return Math.max(28, Math.min(99, power));
}

/**
 * Calcula el valor de mercado en millones (2 decimales)
 * según potencia y edad. Pico entre 24 y 28 años.
 *
 * @param {number} power  1-99
 * @param {number} age    17-35
 * @returns {number} valor en millones
 */
function calcValue(power, age) {
  const ageFactor =
    age <= 24 ? 1.1 :
    age <= 28 ? 1.0 :
    Math.max(0.35, 1 - (age - 28) * 0.08);

  const base = Math.pow(power / 10, 2) * 0.15;
  return Math.round(base * ageFactor * 100) / 100;
}

/**
 * Calcula el sueldo mensual en miles ($K) según la potencia.
 * @param {number} power
 * @returns {number}
 */
function calcSalary(power) {
  return Math.round((power / 10) * 18 + Math.random() * 25);
}

/**
 * Genera la plantilla completa de un equipo.
 *
 * Cada jugador tiene:
 *  id, firstName, lastName, position, age, power, value (M),
 *  tiredness (%), salary ($K/mes), contractEndSeason, status
 *
 * @param {number} prestige       - Prestigio del equipo (0-100)
 * @param {number} currentSeason  - Temporada actual (para contractEndSeason)
 * @returns {Array<object>} Plantilla de jugadores
 */
export function generateSquad(prestige = 70, currentSeason = 1) {
  return POSITION_TEMPLATE.map((position) => {
    const age   = 17 + Math.floor(Math.random() * 19); // 17-35
    const power = randomPower(prestige);
    const { firstName, lastName } = randomName();

    return {
      id: generateId('pl'),
      firstName,
      lastName,
      position,
      age,
      power,
      value:             calcValue(power, age),
      tiredness:         0,          // porcentaje 0-100
      salary:            calcSalary(power), // $K por mes
      contractEndSeason: currentSeason + Math.floor(Math.random() * 4) + 1,
      status:            'available', // 'available' | 'injured' | 'suspended' | 'loan'
    };
  });
}
