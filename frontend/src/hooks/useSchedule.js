/**
 * useSchedule.js
 * Hook responsable de generar y almacenar el calendario completo de la
 * temporada en el save activo.
 *
 * El calendario se genera UNA VEZ por temporada (al crear la partida o al
 * iniciar una nueva temporada) y se persiste en activeSave:
 *
 *   localSchedule       → 18 fechas de liga (doble vuelta, 10 equipos)
 *   cupBracket          → Bracket de copa nacional (16 equipos, cruce por div.)
 *   continentalSchedule → Fechas del grupo del jugador (6 rounds, solo si participa)
 *   continentalGroups   → Todos los grupos continentales (para mostrar en CalendarModal)
 *   annualCalendar      → Timeline integrado: liga + copa + continental
 *
 * Separación de responsabilidades:
 *   hooks/ → lógica de generación y almacenamiento del calendario
 *   utils/ → algoritmos puros de generación de fixtures (fixtureGenerator.js)
 */

import { LEAGUES } from '../data/leagues';
import { runSimulation } from '../services/api';
import { getActiveParticipant } from '../utils/saveState';

/**
 * @param {object}   activeSave   - La partida activa
 * @param {function} onUpdateSave - Callback para persistir cambios en el save
 */
function useSchedule(activeSave, onUpdateSave) {
  /**
   * Indica si la temporada actual ya tiene un calendario generado.
   * Si `localSchedule` existe y tiene al menos una fecha, se considera generado.
   */
  const hasSchedule =
    Array.isArray(activeSave?.localSchedule) && activeSave.localSchedule.length > 0;

  /**
   * Genera y almacena el calendario completo de la temporada actual.
   *
   * Pasos:
   *   1. Torneo local         → doble vuelta round-robin con los 10 equipos de la división
   *   2. Copa nacional        → bracket de 16 con cruces entre las 4 divisiones
   *   3. Copa continental     → fase de grupos (si el jugador participa)
   *   4. Calendario anual     → distribución intercalada de las tres competencias
   */
  async function generateSeasonSchedule() {
    if (!activeSave) return;

    const player1  = getActiveParticipant(activeSave);
    if (!player1?.teamId) return;

    const leagueId = player1.leagueId;
    const divLevel = player1.divisionLevel;
    const teamPool = activeSave.teamPool ?? [];

    if (teamPool.length > 0) {
      const divisionTeams = teamPool.filter(
        (team) => String(team.leagueId) === String(leagueId) && team.divisionLevel === divLevel
      );
      const localSchedule = divisionTeams.length > 0
        ? await runSimulation('generateLeagueFixture', { teams: divisionTeams })
        : [];

      const leagueTeams = teamPool.filter((team) => String(team.leagueId) === String(leagueId));
      const divMap = {};
      for (const team of leagueTeams) {
        if (!divMap[team.divisionLevel]) divMap[team.divisionLevel] = [];
        divMap[team.divisionLevel].push(team);
      }

      const cupBracket = leagueTeams.length > 0
        ? await runSimulation('generateCupBracket16', {
            leagueObj: {
              id: leagueId,
              divisions: Object.keys(divMap)
                .sort((a, b) => Number(a) - Number(b))
                .map((level) => ({ level: Number(level), teams: divMap[level] })),
            },
            playerTeamId: player1.teamId,
          })
        : null;

      const selectedCompetitions = activeSave.config?.selectedCompetitions ?? [];
      const continentalIds = ['libertadores', 'sudamericana', 'champions', 'europa'];
      const hasContinental = continentalIds.some((id) => selectedCompetitions.includes(id));

      let continentalGroups = null;
      let continentalSchedule = null;

      if (hasContinental) {
        const playerTeam = {
          id: player1.teamId,
          name: player1.teamName,
          prestige: player1.prestige ?? 70,
        };
        const selectedLeagues = activeSave.config?.selectedLeagues ?? [leagueId];
        const rawGroups = await runSimulation('generateContinentalGroups', {
          allLeaguesOrTeams: teamPool,
          leagueIds: selectedLeagues,
          playerTeam,
          legacyLeagues: LEAGUES,
        });
        continentalGroups = await runSimulation('generateGroupStageFixtures', { groups: rawGroups });
        const playerGroup = continentalGroups.find((group) =>
          group.teams.some((team) => String(team.id) === String(player1.teamId))
        );
        continentalSchedule = playerGroup?.rounds ?? null;
      }

      const annualCalendar = await runSimulation('buildAnnualCalendar', {
        localRounds: localSchedule,
        continentalGroups,
        hasCup: true,
      });

      onUpdateSave({
        localSchedule,
        cupBracket,
        continentalGroups,
        continentalSchedule,
        annualCalendar,
        matchday: 1,
        continentalRound: 1,
      });
      return;
    }

    const league = LEAGUES.find((l) => l.id === leagueId);
    if (!league) return;

    const division = league.divisions.find((d) => d.level === divLevel);
    if (!division) return;

    // ── 1. Torneo local ──────────────────────────────────────────────────────
    const localSchedule = await runSimulation('generateLeagueFixture', { teams: division.teams });

    // ── 2. Copa nacional ─────────────────────────────────────────────────────
    const cupBracket = await runSimulation('generateCupBracket16', {
      leagueObj: league,
      playerTeamId: player1.teamId,
    });

    // ── 3. Copa continental ──────────────────────────────────────────────────
    const selectedCompetitions = activeSave.config?.selectedCompetitions ?? [];
    const continentalIds       = ['libertadores', 'sudamericana', 'champions', 'europa'];
    const hasContinental       = continentalIds.some((id) => selectedCompetitions.includes(id));

    let continentalGroups   = null;
    let continentalSchedule = null; // Fechas solo del grupo del jugador (para useNextMatch)

    if (hasContinental) {
      const playerTeam = {
        id:       player1.teamId,
        name:     player1.teamName,
        prestige: player1.prestige ?? 70,
      };
      const selectedLeagues = activeSave.config?.selectedLeagues ?? [leagueId];

      // Generar los 4 grupos con sus respectivos calendarios
      const rawGroups = await runSimulation('generateContinentalGroups', {
        allLeaguesOrTeams: LEAGUES,
        leagueIds: selectedLeagues,
        playerTeam,
        legacyLeagues: LEAGUES,
      });
      continentalGroups = await runSimulation('generateGroupStageFixtures', { groups: rawGroups });

      // Extraer solo el grupo del jugador para búsquedas rápidas en useNextMatch
      const playerGroup = continentalGroups.find((g) =>
        g.teams.some((t) => t.id === player1.teamId)
      );
      continentalSchedule = playerGroup?.rounds ?? null;
    }

    // ── 4. Calendario anual integrado ────────────────────────────────────────
    const annualCalendar = await runSimulation('buildAnnualCalendar', {
      localRounds: localSchedule,
      continentalGroups,
      hasCup: true,
    });

    onUpdateSave({
      localSchedule,
      cupBracket,
      continentalGroups,
      continentalSchedule,
      annualCalendar,
      // Reinicia los contadores de progreso de la temporada
      matchday:         1,
      continentalRound: 1,
    });
  }

  return { generateSeasonSchedule, hasSchedule };
}

export default useSchedule;
