/**
 * utils/business/liveMatchSimulation.js
 */

const REGULAR_GOAL_WEIGHTS = {
  GK: 0,
  LB: 0.4,
  RB: 0.4,
  CB: 0.5,
  CDM: 0.8,
  CM: 1.6,
  CAM: 2.4,
  LM: 1.8,
  RM: 1.8,
  ST: 4.2,
  LW: 3.2,
  RW: 3.2,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizePosition(position) {
  const normalized = String(position ?? '').trim().toUpperCase();
  return { DEF: 'CB', MID: 'CM', FWD: 'ST' }[normalized] ?? normalized;
}

function normalizeRoster(team, players = []) {
  if (!Array.isArray(players) || !players.length) {
    throw new Error(`No hay plantel real disponible para ${team?.name ?? 'el equipo'}.`);
  }
  return players.map((player, index) => ({
    id: player.id ?? `${team?.id ?? 'team'}-pl-${index + 1}`,
    firstName: player.firstName ?? player.nombre ?? 'Jugador',
    lastName: player.lastName ?? player.apellido ?? `${index + 1}`,
    position: normalizePosition(player.position),
    power: clamp(Number(player.tacticalPower ?? player.power ?? 60), 1, 99),
    outOfPosition: Boolean(player.outOfPosition),
  }));
}

function averagePower(players) {
  if (!players.length) return 60;
  return players.reduce((sum, player) => sum + Number(player.power ?? 60), 0) / players.length;
}

function samplePoisson(lambda) {
  const limit = Math.exp(-lambda);
  let product = 1;
  let value = 0;
  do {
    value += 1;
    product *= Math.random();
  } while (product > limit && value < 8);
  return value - 1;
}

function expectedGoals(attackAvg, defenseAvg, homeAdvantage = 0) {
  const attackFactor = (attackAvg - 55) / 18;
  const defenseFactor = (defenseAvg - 55) / 22;
  const swing = (Math.random() - 0.5) * 0.35;
  const lambda = 1.05 + attackFactor * 0.45 - defenseFactor * 0.25 + homeAdvantage + swing;
  return clamp(lambda, 0.15, 3.6);
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

function mergeHalfSimulations(firstHalf, secondHalf, homeTeam, awayTeam) {
  const homeGoals = Number(firstHalf?.homeGoals ?? 0) + Number(secondHalf?.homeGoals ?? 0);
  const awayGoals = Number(firstHalf?.awayGoals ?? 0) + Number(secondHalf?.awayGoals ?? 0);
  const winner = homeGoals > awayGoals ? homeTeam : awayGoals > homeGoals ? awayTeam : null;

  return {
    homeGoals,
    awayGoals,
    homePenalties: null,
    awayPenalties: null,
    scorers: [...(firstHalf?.scorers ?? []), ...(secondHalf?.scorers ?? [])].sort((a, b) => a.minute - b.minute),
    winner,
    decidedBy: 'regular',
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
