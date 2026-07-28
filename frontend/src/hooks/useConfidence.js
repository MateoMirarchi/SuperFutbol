/**
 * useConfidence.js
 * Hook para leer y modificar la confianza de dirigencia y hinchada
 * de la partida activa. Persiste los cambios a través de onUpdateSave.
 *
 * Separación: hooks/ → lógica con estado que depende de utils/confidenceHelpers.
 * Consumido por: pages/Dashboard/Dashboard.jsx
 */

import {
  clamp,
  calcLossConfidenceDelta,
  calcWinConfidenceDelta,
  shouldFire,
} from '../utils/confidenceHelpers';
import { getActiveParticipant } from '../utils/saveState';

/**
 * Valores de confianza iniciales para una nueva partida.
 * @returns {{ board: number, fans: number }}
 */
export function defaultConfidence() {
  return { board: 70, fans: 70 };
}

/**
 * Hook de confianza.
 *
 * @param {object}   activeSave    - Partida activa
 * @param {function} onUpdateSave  - Persiste cambios: onUpdateSave({ confidence })
 * @returns {{
 *   confidence: { board: number, fans: number },
 *   applyMatchResult: function,
 *   isFired: boolean
 * }}
 */
function useConfidence(activeSave, onUpdateSave) {
  // Leer confianza actual o inicializar con defaults
  const confidence = activeSave?.confidence ?? defaultConfidence();

  /**
   * Aplica el resultado de un partido y actualiza la confianza en el estado.
   *
   * @param {'win'|'draw'|'loss'} result
   * @param {'international'|'nationalCup'|'local'} competitionType
   * @param {number} rivalPrestige - Prestigio del equipo rival (0-100)
   * @returns {{ confidence: object, fired: boolean }}
   */
  function applyMatchResult(result, competitionType, rivalPrestige) {
    const myPrestige = getActiveParticipant(activeSave)?.prestige ?? 70;
    let delta = { board: 0, fans: 0 };

    if (result === 'loss') {
      delta = calcLossConfidenceDelta(competitionType, myPrestige, rivalPrestige);
    } else if (result === 'win') {
      delta = calcWinConfidenceDelta(competitionType, myPrestige, rivalPrestige);
    }
    // Empate → delta = { board: 0, fans: 0 }

    const newBoard = clamp(confidence.board + delta.board);
    const newFans  = clamp(confidence.fans  + delta.fans);
    const updated  = { board: newBoard, fans: newFans };

    onUpdateSave({ confidence: updated });

    return { confidence: updated, fired: shouldFire(newBoard) };
  }

  return {
    confidence,
    applyMatchResult,
    /** true si la confianza de dirigencia está por debajo de 10 → el DT es expulsado */
    isFired: shouldFire(confidence.board),
  };
}

export default useConfidence;
