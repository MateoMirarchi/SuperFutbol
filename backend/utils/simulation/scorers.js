/**
 * utils/simulation/scorers.js
 * Seleccion de goleadores y armado de eventos de gol.
 */

const { PENALTY_GOAL_WEIGHTS, REGULAR_GOAL_WEIGHTS } = require('./constants');
const { randomGoalMinute } = require('./math');

function weightedPick(players, weights) {
  const pool = players
    .map((player) => {
      const positionWeight = weights[player.position] ?? 1;
      const powerWeight = 0.6 + Number(player.power ?? 60) / 100;
      return { player, weight: positionWeight * powerWeight };
    })
    .filter((item) => item.weight > 0);

  const total = pool.reduce((sum, item) => sum + item.weight, 0);
  if (!total) return players[0] ?? null;

  let cursor = Math.random() * total;
  for (const item of pool) {
    cursor -= item.weight;
    if (cursor <= 0) return item.player;
  }

  return pool[pool.length - 1]?.player ?? null;
}

function formatPlayerName(player) {
  const first = String(player.firstName ?? '').trim();
  const last = String(player.lastName ?? '').trim();
  const full = `${first} ${last}`.trim();
  return full || 'Jugador';
}

function buildScorers(goals, team, roster) {
  const scorers = [];

  for (let index = 0; index < goals; index += 1) {
    const isPenalty = Math.random() < 0.16;
    const scorer = weightedPick(roster, isPenalty ? PENALTY_GOAL_WEIGHTS : REGULAR_GOAL_WEIGHTS);
    if (!scorer) continue;

    scorers.push({
      teamId: team.id,
      teamName: team.name,
      playerId: scorer.id,
      playerName: formatPlayerName(scorer),
      position: scorer.position,
      power: scorer.power,
      minute: randomGoalMinute(index),
      isPenalty,
    });
  }

  return scorers.sort((a, b) => a.minute - b.minute);
}

module.exports = {
  buildScorers,
};
