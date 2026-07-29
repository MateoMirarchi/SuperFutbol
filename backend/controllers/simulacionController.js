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
  mergeHalfSimulations: ({ firstHalf, secondHalf, homeTeam, awayTeam }) =>
    live.mergeHalfSimulations(firstHalf, secondHalf, homeTeam, awayTeam),
  summarizeSimulationAtMinute: ({ simulation, minute }) => live.summarizeSimulationAtMinute(simulation, minute),
  createSimulationEnvelope: ({ matchData, result }) => live.createSimulationEnvelope(matchData, result),

  findNextMatch: ({ save }) => match.findNextMatch(save),
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
