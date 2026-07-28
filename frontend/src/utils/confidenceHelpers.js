/**
 * confidenceHelpers.js
 * Funciones puras para calcular variaciones de confianza (dirigencia y hinchada).
 *
 * Separación: utils/ → sin estado, sin efectos secundarios.
 * Consumido por: hooks/useConfidence.js
 */

/**
 * Genera un entero aleatorio en el rango inclusivo [min, max].
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Restringe un valor al rango [min, max].
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calcula el delta de confianza al PERDER un partido.
 * Considera el tipo de competencia y el prestigio relativo de los equipos.
 *
 * Rangos base:
 *  - Copa internacional : dirigencia -3 a -5 | hinchada -5 a -7
 *  - Copa/torneo local  : dirigencia -2 a -3 | hinchada -5 a -6
 *
 * Modificador de prestigio:
 *  - Rival mucho más débil (diff > 20) → castigo extra
 *  - Rival mucho más fuerte (diff < -20) → castigo reducido
 *
 * @param {'international'|'nationalCup'|'local'} competitionType
 * @param {number} myPrestige     - Prestigio del equipo del jugador (0-100)
 * @param {number} rivalPrestige  - Prestigio del rival (0-100)
 * @returns {{ board: number, fans: number }} deltas negativos
 */
export function calcLossConfidenceDelta(competitionType, myPrestige, rivalPrestige) {
  const ranges = {
    international: { board: [-5, -3], fans: [-7, -5] },
    nationalCup:   { board: [-3, -2], fans: [-6, -5] },
    local:         { board: [-3, -2], fans: [-6, -5] },
  };

  const type = ranges[competitionType] ?? ranges.local;
  const [bMin, bMax] = type.board;
  const [fMin, fMax] = type.fans;

  let boardDelta = randomRange(bMin, bMax); // negativo
  let fansDelta  = randomRange(fMin, fMax); // negativo

  // Modificador basado en diferencia de prestigio
  const prestigeDiff = myPrestige - rivalPrestige; // positivo → rival más débil

  if (prestigeDiff > 20) {
    // Perdiste contra un equipo mucho más débil: castigo mayor
    boardDelta -= randomRange(1, 2);
    fansDelta  -= randomRange(1, 3);
  } else if (prestigeDiff < -20) {
    // Perdiste contra un equipo mucho más fuerte: castigo menor
    boardDelta += randomRange(1, 2);
    fansDelta  += randomRange(1, 2);
  }

  return {
    board: clamp(boardDelta, -15, 0),
    fans:  clamp(fansDelta,  -15, 0),
  };
}

/**
 * Calcula el delta de confianza al GANAR un partido.
 * Ganarle a un rival muy superior da un bono extra.
 *
 * @param {'international'|'nationalCup'|'local'} competitionType
 * @param {number} myPrestige
 * @param {number} rivalPrestige
 * @returns {{ board: number, fans: number }} deltas positivos
 */
export function calcWinConfidenceDelta(competitionType, myPrestige, rivalPrestige) {
  const ranges = {
    international: { board: [3, 5], fans: [4, 6] },
    nationalCup:   { board: [2, 4], fans: [3, 5] },
    local:         { board: [1, 3], fans: [2, 4] },
  };

  const type = ranges[competitionType] ?? ranges.local;
  const [bMin, bMax] = type.board;
  const [fMin, fMax] = type.fans;

  let boardDelta = randomRange(bMin, bMax);
  let fansDelta  = randomRange(fMin, fMax);

  const prestigeDiff = myPrestige - rivalPrestige;

  if (prestigeDiff < -20) {
    // Ganaste contra un equipo mucho más fuerte: bono extra
    boardDelta += randomRange(1, 2);
    fansDelta  += randomRange(2, 3);
  }

  return {
    board: clamp(boardDelta, 0, 15),
    fans:  clamp(fansDelta,  0, 15),
  };
}

/**
 * Determina si el DT debe ser expulsado.
 * Regla: confianza de dirigencia inferior a 10 → expulsión.
 *
 * @param {number} boardConfidence - Valor actual de confianza de la dirigencia
 * @returns {boolean}
 */
export function shouldFire(boardConfidence) {
  return boardConfidence < 10;
}

/**
 * Devuelve la categoría visual según el nivel de confianza.
 * @param {number} value  0-100
 * @returns {'critical'|'low'|'mid'|'good'|'great'}
 */
export function confidenceLevel(value) {
  if (value < 20) return 'critical';
  if (value < 40) return 'low';
  if (value < 60) return 'mid';
  if (value < 80) return 'good';
  return 'great';
}
