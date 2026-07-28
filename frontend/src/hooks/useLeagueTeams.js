/**
 * useLeagueTeams.js
 * Obtiene TODOS los equipos del backend una sola vez y provee helpers de agrupación.
 *
 * Usado por TeamSelection y Market para eliminar datos hardcodeados del frontend.
 * Las agrupaciones por liga/división se construyen dinámicamente desde los datos reales.
 */

import { useState, useEffect, useCallback } from 'react';
import { getEquipos } from '../services/api';
import { buildLeagueCatalog } from '../utils/leagueCatalog';

function useLeagueTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga todos los equipos al montar; cancela la solicitud si se desmonta.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getEquipos()
      .then((data) => {
        if (!cancelled) setTeams(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Error al cargar equipos desde el backend');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Retorna los equipos de una liga y nivel de división específicos.
   * @param {string} leagueId
   * @param {number} divisionLevel
   */
  const getTeamsByLeagueAndDivision = useCallback(
    (leagueId, divisionLevel) =>
      teams.filter(
        (t) => String(t.leagueId) === String(leagueId) && t.divisionLevel === Number(divisionLevel)
      ),
    [teams]
  );

  /**
   * Retorna las opciones de división disponibles para una liga
   * (basadas en los equipos registrados en la DB, no en datos estáticos).
   * @param {string} leagueId
   * @returns {{ value: number, label: string }[]}
   */
  const getDivisionOptions = useCallback(
    (leagueId) => {
      const divMap = {};
      for (const t of teams) {
        if (String(t.leagueId) !== String(leagueId)) continue;
        if (!divMap[t.divisionLevel]) {
          divMap[t.divisionLevel] = t.divisionName || `División ${t.divisionLevel}`;
        }
      }
      return Object.keys(divMap)
        .sort((a, b) => Number(a) - Number(b))
        .map((level) => ({ value: Number(level), label: divMap[level] }));
    },
    [teams]
  );

  /**
   * Construye la lista de ligas disponibles con sus divisiones y equipos.
   * Compatible con el formato usado en los tabs de Market y TeamSelection.
   *
   * @param {string[]?} leagueIds - Si se proporciona, filtra solo esas ligas.
   * @returns {{ id, name, flag, divisions: [{ level, name, teams }] }[]}
   */
  const getLeaguesList = useCallback(
    (leagueIds) => buildLeagueCatalog(teams, leagueIds),
    [teams]
  );

  return {
    /** Array plano de todos los equipos del backend */
    teams,
    loading,
    error,
    getTeamsByLeagueAndDivision,
    getDivisionOptions,
    getLeaguesList,
  };
}

export default useLeagueTeams;
