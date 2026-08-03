/**
 * useConfidence.js
 * Hook para leer y modificar la confianza de dirigencia y hinchada
 * de la partida activa. Persiste los cambios a través de onUpdateSave.
 *
 * Separación: hooks/ → lógica con estado que depende de utils/confidenceHelpers.
 * Consumido por: pages/Dashboard/Dashboard.jsx
 */

import { shouldFire } from '../utils/confidenceHelpers';
import { applyConfidenceResult } from '../services/api';
import { getActiveParticipant, updateParticipantCollection } from '../utils/saveState';

/**
 * Valores de confianza iniciales para una nueva partida.
 * @returns {{ board: number, fans: number }}
 */
export function defaultConfidence() {
  return { board: 70, fans: 70 };
}

/**
 * Aplica el resultado de un partido a la confianza de una partida (save) y arma
 * el patch listo para persistir. Es la única implementación de este cálculo:
 * la usan tanto este hook como pages/Dashboard/MatchSimulationScreen.jsx, que
 * necesita el patch para combinarlo con otros cambios antes de un único
 * onUpdateSave/onApplySave.
 *
 * @param {object} save - Partida activa
 * @param {'win'|'draw'|'loss'} result
 * @param {'international'|'nationalCup'|'local'} competitionType
 * @param {number} rivalPrestige - Prestigio del equipo rival (0-100)
 * @param {{ board: number, fans: number }} currentConfidence
 * @returns {Promise<{ confidence: object, players: object[], expulsado: boolean }>}
 */
export async function computeConfidencePatch({ save, result, competitionType, rivalPrestige, currentConfidence }) {
  const myPrestige = getActiveParticipant(save)?.prestige ?? 70;
  const response = await applyConfidenceResult({
    confidence: currentConfidence,
    result,
    competitionType,
    rivalPrestige,
    myPrestige,
  });

  const confidence = response?.confidence ?? currentConfidence;
  const expulsado = Boolean(response?.expulsado);
  const activeParticipant = getActiveParticipant(save);

  return {
    confidence,
    expulsado,
    players: activeParticipant
      ? updateParticipantCollection(save.players, activeParticipant.id, { expulsado })
      : save.players,
  };
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
  async function applyMatchResult(result, competitionType, rivalPrestige) {
    const patch = await computeConfidencePatch({
      save: activeSave,
      result,
      competitionType,
      rivalPrestige,
      currentConfidence: confidence,
    });

    onUpdateSave({
      confidence: patch.confidence,
      players: patch.players,
    });

    return { confidence: patch.confidence, fired: patch.expulsado, expulsado: patch.expulsado };
  }

  return {
    confidence,
    applyMatchResult,
    /** true si la confianza de dirigencia está por debajo de 10 → el DT es expulsado */
    isFired: Boolean(getActiveParticipant(activeSave)?.expulsado) || shouldFire(confidence.board),
  };
}

export default useConfidence;
