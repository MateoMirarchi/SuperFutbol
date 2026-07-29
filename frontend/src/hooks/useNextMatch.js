/**
 * useNextMatch.js
 * Hook para derivar la información del próximo partido de la partida activa.
 * Busca primero en el calendario local y luego en el continental.
 *
 * Separación: hooks/ → derivación de datos sin mutación de estado.
 * Consumido por: pages/Dashboard/Dashboard.jsx
 */

import { useEffect, useState } from 'react';
import { COMPETITIONS } from '../data/competitions';
import { runSimulation } from '../services/api';
import { findNextMatch as findNextMatchLocal } from '../utils/matchSimulation';
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
  const [nextMatch, setNextMatch] = useState(null);
  const player1 = getActiveParticipant(activeSave);

  function buildSaveSnapshot(save) {
    return {
      activeParticipantId: save?.activeParticipantId ?? null,
      players: save?.players ?? [],
      annualCalendar: save?.annualCalendar ?? [],
      localSchedule: save?.localSchedule ?? [],
      cupBracket: save?.cupBracket ?? null,
      continentalGroups: save?.continentalGroups ?? [],
    };
  }

  useEffect(() => {
    let cancelled = false;

    if (!player1?.teamId) {
      setNextMatch(null);
      return () => {
        cancelled = true;
      };
    }

    async function fetchNextMatch() {
      try {
        const response = await runSimulation('findNextMatch', { save: buildSaveSnapshot(activeSave) });
        if (!cancelled) setNextMatch(response ?? null);
      } catch (_error) {
        if (!cancelled) setNextMatch(findNextMatchLocal(activeSave));
      }
    }

    fetchNextMatch();
    return () => {
      cancelled = true;
    };
  }, [activeSave, player1?.teamId]);

  if (!player1?.teamId) return null;

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
