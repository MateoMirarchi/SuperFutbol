/**
 * hooks/useTeamApi.js
 * Hook para consumir la API remota de equipos y jugadores.
 */

import { useEffect, useState } from 'react';
import {
  getEquipos,
  getEquipoDetalle,
  createEquipo,
  updateEquipo,
  deleteEquipo,
  createJugador,
  updateJugador,
  deleteJugador,
  getPaises,
  createPais,
} from '../services/api';

function useTeamApi(token) {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');
  const [paises, setPaises] = useState([]);

  async function loadTeams() {
    setLoadingTeams(true);
    setError('');
    try {
      const data = await getEquipos();
      setTeams(data);
      return data;
    } catch (err) {
      setError(err.message || 'No se pudo cargar la lista de equipos.');
      throw err;
    } finally {
      setLoadingTeams(false);
    }
  }

  async function loadTeamDetail(teamId) {
    if (!teamId) {
      setSelectedTeam(null);
      setPlayers([]);
      return null;
    }

    setLoadingDetail(true);
    setError('');
    try {
      const data = await getEquipoDetalle(teamId);
      setSelectedTeam(data.team);
      setPlayers(data.players);
      return data;
    } catch (err) {
      setError(err.message || 'No se pudo cargar el detalle del equipo.');
      throw err;
    } finally {
      setLoadingDetail(false);
    }
  }

  async function createTeam(payload) {
    const created = await createEquipo(payload, token);
    setTeams((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    return created;
  }

  async function saveTeam(id, payload) {
    const updated = await updateEquipo(id, payload, token);
    setTeams((prev) => prev.map((team) => (team.id === id ? updated : team)));
    setSelectedTeam((prev) => (prev?.id === id ? updated : prev));
    return updated;
  }

  async function removeTeam(id) {
    await deleteEquipo(id, token);
    setTeams((prev) => prev.filter((team) => team.id !== id));
    setSelectedTeam((prev) => (prev?.id === id ? null : prev));
    setPlayers((prev) => (selectedTeam?.id === id ? [] : prev));
  }

  async function createPlayer(payload) {
    const created = await createJugador(payload, token);
    if (selectedTeam?.id === created.teamId) {
      setPlayers((prev) => [...prev, created]);
    }
    return created;
  }

  async function savePlayer(id, payload) {
    const updated = await updateJugador(id, payload, token);
    if (selectedTeam?.id === updated.teamId) {
      setPlayers((prev) => prev.map((player) => (player.id === id ? updated : player)));
    }
    return updated;
  }

  async function removePlayer(id) {
    await deleteJugador(id, token);
    setPlayers((prev) => prev.filter((player) => player.id !== id));
  }

  // ── Países ────────────────────────────────────────────────────────

  async function loadPaises() {
    try {
      const data = await getPaises();
      setPaises(data);
      return data;
    } catch (err) {
      // No bloquea la pantalla si falla; solo log silencioso
      console.warn('No se pudieron cargar los países:', err.message);
      return [];
    }
  }

  /**
   * Crea un país + 4 divisiones automáticas.
   * @param {string} nombre
   * @returns {{ id, nombre, divisiones: Array }}
   */
  async function addPais(nombre) {
    const created = await createPais({ nombre }, token);
    setPaises((prev) => [...prev, created].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    return created;
  }

  useEffect(() => {
    loadTeams().catch(() => {});
    loadPaises();
  }, []);

  return {
    teams,
    players,
    selectedTeam,
    loadingTeams,
    loadingDetail,
    error,
    setError,
    loadTeams,
    loadTeamDetail,
    createTeam,
    saveTeam,
    removeTeam,
    createPlayer,
    savePlayer,
    removePlayer,
    paises,
    loadPaises,
    addPais,
  };
}

export default useTeamApi;
