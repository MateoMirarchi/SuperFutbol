/**
 * confidenceHelpers.js
 * Funciones puras de presentacion sobre la confianza (dirigencia y hinchada).
 * El calculo del delta de confianza (ganar/perder partido) es logica de
 * negocio y vive en el backend (backend/utils/business/confidenceHelpers.js,
 * expuesta via services/api.js:applyConfidenceResult) -- este archivo solo
 * se ocupa de derivar estado visual/UI a partir del valor ya calculado.
 *
 * Separación: utils/ → sin estado, sin efectos secundarios.
 * Consumido por: hooks/useConfidence.js, components/ConfidenceBar
 */

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
