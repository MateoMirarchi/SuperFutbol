/**
 * useNextMatch.js
 * Hook para derivar la información del próximo partido de la partida activa.
 * Busca primero en el calendario local y luego en el continental.
 *
 * Separación: hooks/ → derivación de datos sin mutación de estado.
 * Consumido por: pages/Dashboard/Dashboard.jsx
 */

import { COMPETITIONS } from '../data/competitions';
import { findNextMatch } from '../utils/matchSimulation';
import { getActiveParticipant } from '../utils/saveState';

/**
 * Extrae la información del próximo partido a jugar.
 *
 * @param {object} activeSave - Partida activa
 * @returns {{
 *   rival: string,
 *   competition: 'local'|'continental',
 *   matchday: number,
 *   tournamentName: string,
 *   isHome: boolean
 * } | null}
 */
function useNextMatch(activeSave) {
  const player1 = getActiveParticipant(activeSave);
  if (!player1?.teamId) return null;

  const nextMatch = findNextMatch(activeSave);
  if (!nextMatch) return null;

  if (nextMatch.competition === 'local') {
    return {
      ...nextMatch,
      matchday: nextMatch.round,
      tournamentName: nextMatch.tournamentName || player1.divisionName || 'Torneo Local',
    };
  }

  if (nextMatch.competition === 'continental') {
    const compId = activeSave.config?.selectedCompetitions?.[0] ?? '';
    const comp = COMPETITIONS.find((item) => item.id === compId);
    return {
      ...nextMatch,
      matchday: nextMatch.contRound,
      tournamentName: nextMatch.tournamentName || comp?.name || 'Copa Continental',
    };
  }

  return {
    ...nextMatch,
    matchday: nextMatch.label,
  };
}

export default useNextMatch;
