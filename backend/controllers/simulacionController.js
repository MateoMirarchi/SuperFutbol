/**
 * controllers/simulacionController.js
 */

const fixture = require('../utils/business/fixtureGenerator');
const league = require('../utils/business/leagueSimulation');
const live = require('../utils/business/liveMatchSimulation');
const match = require('../utils/business/matchSimulation');
const schedule = require('../utils/business/scheduleGenerator');
const { generateSquad } = require('../utils/business/squadGenerator');

const operationMap = {
  buildLeagueSchedules: ({ teamPool, selectedLeagueIds, fallbackLeagues }) =>
    league.buildLeagueSchedules(teamPool, selectedLeagueIds, fallbackLeagues),
  findLeagueDivisionSchedule: ({ leagueSchedules, leagueId, divisionLevel }) =>
    league.findLeagueDivisionSchedule(leagueSchedules, leagueId, divisionLevel),
  getMatchesForRound: ({ leagueSchedules, roundNumber }) =>
    league.getMatchesForRound(leagueSchedules, roundNumber),
  applyMatchResultToLeagueSchedules: ({ leagueSchedules, patch }) =>
    league.applyMatchResultToLeagueSchedules(leagueSchedules, patch),
  buildLeagueRoundSnapshot: ({ leagueSchedules, leagueId, roundNumber }) =>
    league.buildLeagueRoundSnapshot(leagueSchedules, leagueId, roundNumber),

  generateLeagueFixture: ({ teams }) => fixture.generateLeagueFixture(teams),
  generateCupBracket16: ({ leagueObj, playerTeamId }) => fixture.generateCupBracket16(leagueObj, playerTeamId),
  generateGroupStageFixtures: ({ groups }) => fixture.generateGroupStageFixtures(groups),
  buildAnnualCalendar: ({ localRounds, continentalGroups, hasCup }) =>
    fixture.buildAnnualCalendar(localRounds, continentalGroups, hasCup),

  generateContinentalGroups: ({ allLeaguesOrTeams, leagueIds, playerTeam, legacyLeagues }) =>
    schedule.generateContinentalGroups(allLeaguesOrTeams, leagueIds, playerTeam, legacyLeagues),
  generateLeagueSchedule: ({ teams }) => schedule.generateLeagueSchedule(teams),
  generateCupBracket: ({ teams }) => schedule.generateCupBracket(teams),

  simulateMatchHalf: (payload) => live.simulateMatchHalf(payload),
  mergeHalfSimulations: ({ firstHalf, secondHalf, homeTeam, awayTeam, homePlayers, awayPlayers, isKnockout }) =>
    live.mergeHalfSimulations(firstHalf, secondHalf, homeTeam, awayTeam, { homePlayers, awayPlayers, isKnockout }),
  summarizeSimulationAtMinute: ({ simulation, minute }) => live.summarizeSimulationAtMinute(simulation, minute),
  createSimulationEnvelope: ({ matchData, result }) => live.createSimulationEnvelope(matchData, result),

  findNextMatch: ({ save }) => match.findNextMatch(save),
  // TODO(seguridad/integridad): applySimulationToSave persiste el resultado
  // de partido (`simulation`) tal cual lo manda el cliente, sin volver a
  // ejecutar simularPartido/simulateMatchHalf+mergeHalfSimulations server-side
  // para verificarlo. Esto es una decision pendiente, no un olvido: hoy no
  // existe ningun estado de partida (save) persistido server-side -- el save
  // completo vive en localStorage del cliente (ver frontend/src/hooks/
  // useGameState.js) y este endpoint no tiene con que contrastar el
  // resultado recibido. Resolverlo de raiz implica decidir donde vive el
  // estado autoritativo de una partida (mover el save a la base, o al menos
  // que el servidor guarde el ultimo seed/parametros usados por partido para
  // poder re-simular y comparar) antes de poder rechazar un resultado
  // adulterado. Mismo problema de fondo que motivo el fix de
  // mercadoController.js (ver commit "validar payload y recalcular valor/
  // potencia server-side en mercado"), pero ahi si existe una fuente de
  // verdad parcial (tabla `jugadores`) para los jugadores del catalogo real;
  // aqui no hay ninguna tabla de "partidas en curso" contra la cual validar.
  applySimulationToSave: ({ save, nextMatch, simulation }) => match.applySimulationToSave(save, nextMatch, simulation),
  buildStandingsTable: ({ teams, rounds }) => match.buildStandingsTable(teams, rounds),
  getLocalDivisionTeams: ({ save }) => match.getLocalDivisionTeams(save),

  generateSquad: ({ prestige, currentSeason }) => generateSquad(prestige, currentSeason),
};

function run(req, res) {
  try {
    const { operation, payload } = req.body ?? {};

    if (!operation || !operationMap[operation]) {
      return res.status(400).json({ error: 'Operacion de simulacion invalida.' });
    }

    const data = operationMap[operation](payload ?? {});
    return res.json({ data });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo procesar la simulacion.', detail: error.message });
  }
}

module.exports = {
  run,
};
