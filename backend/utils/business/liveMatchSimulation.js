/**
 * utils/business/liveMatchSimulation.js
 *
 * Motor de simulacion "en vivo" (medio tiempo por medio tiempo, para poder
 * animar el marcador minuto a minuto en el cliente). Comparte las mismas
 * constantes/formulas numericas que el motor "instantaneo"
 * (utils/simulation/*) para que ambos pipelines produzcan la misma
 * distribucion de goles -- antes reimplementaba clamp/averagePower/
 * samplePoisson/expectedGoals/pesos por posicion con parametros propios y
 * divergentes, dando resultados estadisticamente distintos segun que
 * pipeline simulara el partido.
 *
 * Lo que sigue siendo propio de este archivo (no se comparte) es el armado
 * de goleadores acotado a un rango de minutos (startMinute/endMinute): el
 * motor instantaneo no tiene noción de "primer/segundo tiempo", así que su
 * buildScorers reparte minutos en todo el partido (1-90).
 */

const { averagePower, samplePoisson, expectedGoals } = require('../simulation/math');
const { REGULAR_GOAL_WEIGHTS } = require('../simulation/constants');
const { normalizeRoster: normalizeRosterShared } = require('../simulation/roster');
const { simulatePenalties } = require('../simulation/penalties');

function normalizeRoster(team, players = [], options) {
  return normalizeRosterShared(team, players, options);
}

function weightedPick(players) {
  const pool = players.map((player) => ({
    player,
    weight: (REGULAR_GOAL_WEIGHTS[player.position] ?? 1) * (0.45 + Number(player.power ?? 60) / 100),
  }));
  const total = pool.reduce((sum, item) => sum + item.weight, 0);
  if (!total) return pool[0]?.player ?? null;

  let cursor = Math.random() * total;
  for (const item of pool) {
    cursor -= item.weight;
    if (cursor <= 0) return item.player;
  }
  return pool[pool.length - 1]?.player ?? null;
}

function buildScorers(goals, team, roster, startMinute, endMinute) {
  const scorers = [];
  for (let index = 0; index < goals; index += 1) {
    const scorer = weightedPick(roster);
    if (!scorer) continue;
    scorers.push({
      teamId: team.id,
      teamName: team.name,
      playerId: scorer.id,
      playerName: `${scorer.firstName} ${scorer.lastName}`.trim(),
      position: scorer.position,
      power: scorer.power,
      minute: Math.min(endMinute, startMinute + Math.floor(Math.random() * (endMinute - startMinute + 1))),
      isPenalty: false,
    });
  }

  return scorers.sort((a, b) => a.minute - b.minute);
}

function simulateMatchHalf({
  homeTeam,
  awayTeam,
  homePlayers,
  awayPlayers,
  startMinute,
  endMinute,
  isSecondHalf = false,
}) {
  const homeRoster = normalizeRoster(homeTeam, homePlayers);
  const awayRoster = normalizeRoster(awayTeam, awayPlayers);
  const homeAvg = averagePower(homeRoster);
  const awayAvg = averagePower(awayRoster);
  const homeLambda = expectedGoals(homeAvg, awayAvg, isSecondHalf ? 0.06 : 0.1) * 0.5;
  const awayLambda = expectedGoals(awayAvg, homeAvg, 0) * 0.5;
  const homeGoals = samplePoisson(homeLambda);
  const awayGoals = samplePoisson(awayLambda);

  const scorers = [
    ...buildScorers(homeGoals, homeTeam, homeRoster, startMinute, endMinute),
    ...buildScorers(awayGoals, awayTeam, awayRoster, startMinute, endMinute),
  ].sort((a, b) => a.minute - b.minute);

  return {
    homeGoals,
    awayGoals,
    scorers,
    metrics: {
      homeAveragePower: Number(homeAvg.toFixed(1)),
      awayAveragePower: Number(awayAvg.toFixed(1)),
    },
  };
}

/**
 * Combina los dos medios tiempos en el resultado final. Si el partido queda
 * empatado y es de eliminacion directa (isKnockout), resuelve el ganador por
 * penales con la misma simulatePenalties() que usa el motor instantaneo
 * (utils/simulation/simulateMatch.js) -- antes esta funcion dejaba
 * `winner: null` en un empate sin importar el tipo de partido, y un cruce de
 * copa jugado por este pipeline "en vivo" quedaba trabado para siempre
 * (matchSimulation.js:advanceCupWinners no puede avanzar un cruce sin
 * winner.id).
 *
 * @param {object} firstHalf
 * @param {object} secondHalf
 * @param {object} homeTeam
 * @param {object} awayTeam
 * @param {object} [options]
 * @param {Array}  [options.homePlayers] - Plantel local para la tanda de penales (si es knockout)
 * @param {Array}  [options.awayPlayers] - Plantel visitante para la tanda de penales (si es knockout)
 * @param {boolean} [options.isKnockout] - true si un empate debe resolverse por penales
 */
function mergeHalfSimulations(firstHalf, secondHalf, homeTeam, awayTeam, options = {}) {
  const { homePlayers, awayPlayers, isKnockout = false } = options;

  const homeGoals = Number(firstHalf?.homeGoals ?? 0) + Number(secondHalf?.homeGoals ?? 0);
  const awayGoals = Number(firstHalf?.awayGoals ?? 0) + Number(secondHalf?.awayGoals ?? 0);
  const scorers = [...(firstHalf?.scorers ?? []), ...(secondHalf?.scorers ?? [])].sort((a, b) => a.minute - b.minute);

  let winner = homeGoals > awayGoals ? homeTeam : awayGoals > homeGoals ? awayTeam : null;
  let homePenalties = null;
  let awayPenalties = null;
  let decidedBy = 'regular';

  if (!winner && isKnockout) {
    const homeRoster = normalizeRoster(homeTeam, homePlayers, { required: false, sideLabel: 'equipo local' });
    const awayRoster = normalizeRoster(awayTeam, awayPlayers, { required: false, sideLabel: 'equipo visitante' });
    const penalties = simulatePenalties(homeTeam, awayTeam, homeRoster, awayRoster);
    homePenalties = penalties.home;
    awayPenalties = penalties.away;
    winner = penalties.winner;
    decidedBy = 'penalties';
  }

  return {
    homeGoals,
    awayGoals,
    homePenalties,
    awayPenalties,
    scorers,
    winner,
    decidedBy,
  };
}

function summarizeSimulationAtMinute(simulation, minute) {
  const scorers = (simulation?.scorers ?? []).filter((goal) => Number(goal.minute) <= Number(minute));
  let homeGoals = 0;
  let awayGoals = 0;

  scorers.forEach((goal) => {
    if (String(goal.teamId) === String(simulation?.homeTeam?.id)) homeGoals += 1;
    if (String(goal.teamId) === String(simulation?.awayTeam?.id)) awayGoals += 1;
  });

  return {
    homeGoals,
    awayGoals,
    scorers,
  };
}

function createSimulationEnvelope(match, result) {
  return {
    homeTeam: match.home,
    awayTeam: match.away,
    ...result,
  };
}

module.exports = {
  simulateMatchHalf,
  mergeHalfSimulations,
  summarizeSimulationAtMinute,
  createSimulationEnvelope,
};
