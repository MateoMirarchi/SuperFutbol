/**
 * useGameState.js
 * Hook central que gestiona el estado global de la partida activa.
 * Persiste automáticamente en localStorage.
 */

import useLocalStorage from './useLocalStorage';
import { getDefaultConfidence, runSimulation } from '../services/api';
import { defaultConfidence } from './useConfidence';
import { LEAGUES } from '../data/leagues';
import { mapBackendPlayerToSquadPlayer } from '../utils/saveState';

// Clave bajo la cual se guardan todas las partidas
export const SAVES_KEY = 'superfutbol_saves';
// Clave de la partida actualmente cargada
export const ACTIVE_SAVE_KEY = 'superfutbol_active_save';

/**
 * Retorna las herramientas para gestionar partidas guardadas.
 */
function useGameState() {
  const [saves, setSaves] = useLocalStorage(SAVES_KEY, []);
  const [activeSaveId, setActiveSaveId] = useLocalStorage(ACTIVE_SAVE_KEY, null);

  /** Retorna la partida actualmente activa */
  const activeSave = saves.find((s) => s.id === activeSaveId) ?? null;

  /**
   * Crea una nueva partida y la marca como activa.
   * @param {object} config    - Configuración inicial (ligas, competencias, etc.)
   * @param {Array}  players   - Jugadores [{ name, teamId, teamName, leagueId, divisionLevel, city, prestige, budget }]
   * @param {string} gameName  - Nombre identificador de la partida
   * @param {Array}  allTeams  - Equipos reales del backend (array plano). Si está vacío, usa datos estáticos.
  * @param {Array|null} initialTeamPlayers - Plantilla real del equipo principal desde la base.
  * @param {object} teamRostersByTeamId - Planteles reales por equipo: { [teamId]: Player[] }
   */
  async function createNewGame(config, players, gameName = 'Mi Partida', allTeams = [], initialTeamPlayers = null, teamRostersByTeamId = {}) {
    const normalizedPlayers = players.map((player, index) => ({
      ...player,
      id: player.id ?? `manager_${Date.now()}_${index + 1}`,
      role: player.role ?? 'manager',
    }));

    const player1         = normalizedPlayers[0];
    const player1Prestige = player1?.prestige ?? 70;
    let leagueSchedules = [];
    let playerDivisionSchedule = null;

    try {
      leagueSchedules = await runSimulation('buildLeagueSchedules', {
        teamPool: allTeams,
        selectedLeagueIds: config?.selectedLeagues ?? [],
      });
      playerDivisionSchedule = await runSimulation('findLeagueDivisionSchedule', {
        leagueSchedules,
        leagueId: player1?.leagueId,
        divisionLevel: player1?.divisionLevel,
      });
    } catch (_error) {
      leagueSchedules = [];
      playerDivisionSchedule = null;
    }

    // ── Generar calendario de la primera temporada ──────────────────────────

    let localSchedule     = [];
    let cupBracket        = null;

    if (playerDivisionSchedule?.rounds?.length) {
      localSchedule = playerDivisionSchedule.rounds;
    } else if (allTeams.length > 0) {
      // ── Ruta principal: equipos reales desde el backend ──────────────────

      // 1. Torneo local: equipos de la división del jugador
      const divisionTeams = allTeams.filter(
        (t) => String(t.leagueId) === String(player1?.leagueId) && t.divisionLevel === player1?.divisionLevel
      );
      localSchedule = divisionTeams.length > 0
        ? await runSimulation('generateLeagueFixture', { teams: divisionTeams })
        : [];

      // 2. Copa nacional: reconstruir el objeto liga desde los equipos del backend
      const leagueTeams = allTeams.filter((t) => String(t.leagueId) === String(player1?.leagueId));
      if (leagueTeams.length > 0) {
        const divMap = {};
        for (const t of leagueTeams) {
          if (!divMap[t.divisionLevel]) divMap[t.divisionLevel] = [];
          divMap[t.divisionLevel].push(t);
        }
        const leagueObj = {
          id: player1.leagueId,
          divisions: Object.keys(divMap)
            .sort((a, b) => Number(a) - Number(b))
            .map((level) => ({ level: Number(level), teams: divMap[level] })),
        };
        cupBracket = await runSimulation('generateCupBracket16', {
          leagueObj,
          playerTeamId: player1.teamId,
        });
      }
    } else {
      // ── Ruta de compatibilidad: partidas cargadas antes de la migración ──
      const league   = LEAGUES.find((l) => l.id === player1?.leagueId);
      const division = league?.divisions?.find((d) => d.level === player1?.divisionLevel);
      localSchedule  = division
        ? await runSimulation('generateLeagueFixture', { teams: division.teams })
        : [];
      cupBracket     = league
        ? await runSimulation('generateCupBracket16', { leagueObj: league, playerTeamId: player1.teamId })
        : null;
    }

    // 3. Copa continental (si el jugador participa en una)
    const continentalIds    = ['libertadores', 'sudamericana', 'champions', 'europa'];
    const hasContinental    = continentalIds.some(
      (id) => config?.selectedCompetitions?.includes(id)
    );

    let continentalGroups   = null;
    let continentalSchedule = null;

    if (hasContinental && player1) {
      const playerTeam     = { id: player1.teamId, name: player1.teamName, prestige: player1Prestige };
      const selectedLeagues = config?.selectedLeagues ?? [player1.leagueId];
      // Usa equipos reales si están disponibles, o cae en LEAGUES estático
      const teamsForGroups = allTeams.length > 0 ? allTeams : LEAGUES;
      const rawGroups = await runSimulation('generateContinentalGroups', {
        allLeaguesOrTeams: teamsForGroups,
        leagueIds: selectedLeagues,
        playerTeam,
        legacyLeagues: LEAGUES,
      });
      continentalGroups = await runSimulation('generateGroupStageFixtures', { groups: rawGroups });

      const playerGroup    = continentalGroups.find((g) =>
        g.teams.some((t) => t.id === player1.teamId)
      );
      continentalSchedule  = playerGroup?.rounds ?? null;
    }

    // 4. Calendario anual integrado
    const annualCalendar = await runSimulation('buildAnnualCalendar', {
      localRounds: localSchedule,
      continentalGroups,
      hasCup: true,
    });
    const squad = Array.isArray(initialTeamPlayers)
      ? initialTeamPlayers.map((player) => mapBackendPlayerToSquadPlayer(player, 1)).filter(Boolean)
      : await runSimulation('generateSquad', { prestige: player1Prestige, currentSeason: 1 });

    let initialConfidence = defaultConfidence();
    try {
      initialConfidence = await getDefaultConfidence();
    } catch (_error) {
      initialConfidence = defaultConfidence();
    }

    const newSave = {
      id: `save_${Date.now()}`,
      name: gameName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Configuración de la partida
      config,
      activeParticipantId: player1?.id ?? null,
      // Jugadores con sus equipos elegidos
      players: normalizedPlayers,
      // Snapshot de equipos reales usados para la partida
      teamPool: allTeams,
      teamRosters: teamRostersByTeamId,
      leagueSchedules,
      // Progreso
      season: 1,
      matchday: 1,
      continentalRound: 1,
      // Calendarios de la temporada
      localSchedule,
      cupBracket,
      continentalGroups,
      continentalSchedule,
      annualCalendar,
      // Plantilla de jugadores del equipo del jugador 1
      squad,
      // Confianza de dirigencia y hinchada (0-100)
      confidence: initialConfidence,
      // Finanzas globales (préstamos, etc.)
      finances: { loans: [] },
      // Historial
      titles: [],
      results: [],
      matchesPlayed: 0,
    };

    setSaves((prev) => [...prev, newSave]);
    setActiveSaveId(newSave.id);
    return newSave;
  }

  /**
   * Actualiza datos de una partida existente.
   * @param {string} saveId
   * @param {object} updates - Campos a actualizar (merge parcial)
   */
  function updateSave(saveId, updates) {
    setSaves((prev) =>
      prev.map((s) =>
        s.id === saveId
          ? { ...s, ...updates, updatedAt: new Date().toISOString() }
          : s
      )
    );
  }

  /** Elimina una partida guardada. */
  function deleteSave(saveId) {
    setSaves((prev) => prev.filter((s) => s.id !== saveId));
    if (activeSaveId === saveId) setActiveSaveId(null);
  }

  /** Carga una partida existente como activa. */
  function loadSave(saveId) {
    setActiveSaveId(saveId);
  }

  return {
    saves,
    activeSave,
    activeSaveId,
    createNewGame,
    updateSave,
    deleteSave,
    loadSave,
  };
}

export default useGameState;
