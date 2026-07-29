/**
 * utils/simulation/simulateMatch.js
 * Orquestador principal de simulacion de partido.
 */

const { averagePower, expectedGoals, samplePoisson } = require('./math');
const { simulatePenalties } = require('./penalties');
const { normalizeRoster } = require('./roster');
const { buildScorers } = require('./scorers');
const { buildTournamentUpdate } = require('./tournament');

function resolveTeamDefaults(team, side) {
  const fallbackId = side === 'home' ? 'home' : 'away';
  const fallbackName = side === 'home' ? 'Local' : 'Visitante';

  return {
    id: team?.id ?? fallbackId,
    name: team?.name ?? fallbackName,
    prestige: Number(team?.prestige ?? 70),
  };
}

function simularPartido(payload = {}) {
  const homeTeam = resolveTeamDefaults(payload.homeTeam, 'home');
  const awayTeam = resolveTeamDefaults(payload.awayTeam, 'away');

  const homeRoster = normalizeRoster(homeTeam, payload.homePlayers, {
    required: true,
    sideLabel: 'equipo local',
  });
  const awayRoster = normalizeRoster(awayTeam, payload.awayPlayers, {
    required: true,
    sideLabel: 'equipo visitante',
  });

  const homeAvg = averagePower(homeRoster);
  const awayAvg = averagePower(awayRoster);
  const homeGoals = samplePoisson(expectedGoals(homeAvg, awayAvg, 0.22));
  const awayGoals = samplePoisson(expectedGoals(awayAvg, homeAvg, 0));

  const scorers = [
    ...buildScorers(homeGoals, homeTeam, homeRoster),
    ...buildScorers(awayGoals, awayTeam, awayRoster),
  ].sort((a, b) => a.minute - b.minute);

  let winner = null;
  let penalties = null;
  let decidedBy = 'regular';

  if (homeGoals > awayGoals) winner = homeTeam;
  if (awayGoals > homeGoals) winner = awayTeam;

  if (!winner && payload.context?.type === 'knockout') {
    penalties = simulatePenalties(homeTeam, awayTeam, homeRoster, awayRoster);
    winner = penalties.winner;
    decidedBy = 'penalties';
  }

  const summary = {
    homeGoals,
    awayGoals,
    homePenalties: penalties?.home ?? null,
    awayPenalties: penalties?.away ?? null,
    scorers,
    winner,
    decidedBy,
  };

  return {
    match: summary,
    tournamentUpdate: buildTournamentUpdate(payload.context ?? {}, summary, homeTeam, awayTeam),
    metrics: {
      homeAveragePower: Number(homeAvg.toFixed(1)),
      awayAveragePower: Number(awayAvg.toFixed(1)),
    },
  };
}

module.exports = {
  simularPartido,
};
