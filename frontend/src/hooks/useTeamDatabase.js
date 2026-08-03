/**
 * useTeamDatabase.js
 * Hook que gestiona la "base de datos" de equipos y jugadores del juego.
 *
 * Implementaci\u00F3n SQL-like sobre localStorage:
 *
 *   TABLE teams
 *     id, name, shortName, city, leagueId, leagueName, leagueFlag,
 *     divisionLevel, divisionName, prestige, primaryColor, secondaryColor
 *
 *   TABLE players
 *     id, teamId, firstName, lastName, position, age, power,
 *     value, salary, contractEndSeason, status, nationality
 *
 * Responsabilidades:
 *   - Inicializar la DB a partir de leagues.js si no existe (\u00ABseed\u00BB)
 *   - Exponer operaciones CRUD para equipos y jugadores
 *   - Persistir cambios inmediatamente en localStorage (clave 'superfutbol_db')
 *
 * Separaci\u00F3n:
 *   - utils/teamDbUtils.js \u2192 seed, c\u00E1lculos, validaciones (sin estado)
 *   - hooks/useTeamDatabase.js \u2192 estado React + CRUD
 *   - pages/TeamManager/ \u2192 UI
 *
 * NOTA sobre los cambios de partidas:
 *   Los traspasos y cesiones durante una partida se guardan en el save
 *   (localStorage 'superfutbol_saves') y NO modifican esta base de datos.
 *   Esta DB solo se modifica desde el gestor de equipos del men\u00FA principal.
 */

import { useState, useCallback } from 'react';
import { DB_KEY, DB_VERSION, seedDatabase } from '../utils/teamDbUtils';
import { loadData, saveData } from '../utils/storage';

// ── Helpers de persistencia ──────────────────────────────────────────────

// Migraciones por version de origen: DB_MIGRATIONS[1] transforma una DB v1
// en v2, etc. Vacio por ahora (DB_VERSION nunca subio de 1); es el lugar
// donde agregar el paso de transformacion el dia que cambie la forma de la DB.
const DB_MIGRATIONS = {};

function migrateDb(db) {
  let current = db;
  while (current.version < DB_VERSION) {
    const migrate = DB_MIGRATIONS[current.version];
    if (!migrate) {
      console.warn(
        `useTeamDatabase: no hay migracion definida de la version ${current.version} a ${current.version + 1}; se conserva el dato tal cual y solo se actualiza el numero de version.`
      );
      current = { ...current, version: current.version + 1 };
      continue;
    }
    current = migrate(current);
  }
  return current;
}

function loadDb() {
  const parsed = loadData(DB_KEY, null);
  if (parsed?.teams) {
    const version = Number(parsed.version ?? 0);
    if (version === DB_VERSION) return parsed;

    if (version > DB_VERSION) {
      console.warn(
        `useTeamDatabase: la base de equipos guardada (v${version}) es mas nueva que la version soportada por esta build (v${DB_VERSION}). Se usa tal cual; podrian aparecer inconsistencias.`
      );
      return parsed;
    }

    console.warn(`useTeamDatabase: migrando base de equipos de v${version} a v${DB_VERSION}.`);
    const migrated = migrateDb({ ...parsed, version });
    saveData(DB_KEY, migrated);
    return migrated;
  }

  const fresh = seedDatabase();
  saveData(DB_KEY, fresh);
  return fresh;
}

function persistDb(db) {
  // saveData atrapa errores de cuota/modo privado en vez de lanzar: antes este
  // setItem no tenia try/catch y una cuota llena rompia cualquier alta/edicion
  // de equipos o jugadores (commit() propagaba la excepcion sin capturarla).
  saveData(DB_KEY, db);
}

// ── Hook ─────────────────────────────────────────────────────────────────

function useTeamDatabase() {
  const [db, setDb] = useState(() => loadDb());

  /**
   * Aplica un updater al estado y persiste el resultado en localStorage.
   * Equivalente a una \u00ABtransacci\u00F3n\u00BB at\u00F3mica.
   */
  const commit = useCallback((updater) => {
    setDb((prev) => {
      const next = { ...updater(prev), updatedAt: new Date().toISOString() };
      persistDb(next);
      return next;
    });
  }, []);

  // ── CRUD: Equipos ──────────────────────────────────────────────────────

  /** Devuelve todos los equipos (SELECT * FROM teams). */
  const getTeams = () => db.teams;

  /** Devuelve un equipo por ID (SELECT * FROM teams WHERE id = ?). */
  const getTeam = (id) => db.teams.find((t) => t.id === id) ?? null;

  /** Crea un nuevo equipo (INSERT INTO teams). */
  const createTeam = (data) =>
    commit((prev) => ({ ...prev, teams: [...prev.teams, data] }));

  /** Actualiza un equipo existente (UPDATE teams SET ... WHERE id = ?). */
  const updateTeam = (id, updates) =>
    commit((prev) => ({
      ...prev,
      teams: prev.teams.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));

  /**
   * Elimina un equipo y todos sus jugadores (DELETE + CASCADE).
   * (DELETE FROM teams WHERE id = ? + DELETE FROM players WHERE teamId = ?)
   */
  const deleteTeam = (id) =>
    commit((prev) => ({
      ...prev,
      teams:   prev.teams.filter((t) => t.id !== id),
      players: prev.players.filter((p) => p.teamId !== id),
    }));

  // ── CRUD: Jugadores ────────────────────────────────────────────────────

  /** Devuelve los jugadores de un equipo (SELECT * FROM players WHERE teamId = ?). */
  const getPlayers = (teamId) => db.players.filter((p) => p.teamId === teamId);

  /** Devuelve todos los jugadores (SELECT * FROM players). */
  const getAllPlayers = () => db.players;

  /** Devuelve un jugador por ID. */
  const getPlayer = (id) => db.players.find((p) => p.id === id) ?? null;

  /** Crea un nuevo jugador (INSERT INTO players). */
  const createPlayer = (data) =>
    commit((prev) => ({ ...prev, players: [...prev.players, data] }));

  /** Actualiza un jugador existente (UPDATE players SET ... WHERE id = ?). */
  const updatePlayer = (id, updates) =>
    commit((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));

  /** Elimina un jugador (DELETE FROM players WHERE id = ?). */
  const deletePlayer = (id) =>
    commit((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.id !== id),
    }));

  /** Reinicia la DB a los datos originales de leagues.js. */
  const resetDatabase = () => commit(() => seedDatabase());

  return {
    // Estado raw (para renders reactivos)
    teams:   db.teams,
    players: db.players,
    // Equipos
    getTeams,
    getTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    // Jugadores
    getPlayers,
    getAllPlayers,
    getPlayer,
    createPlayer,
    updatePlayer,
    deletePlayer,
    // Administraci\u00F3n de la DB
    resetDatabase,
  };
}

export default useTeamDatabase;
