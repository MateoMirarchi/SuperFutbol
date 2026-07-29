/**
 * utils/simulation/math.js
 * Helpers numericos para la simulacion.
 */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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
  } while (product > limit && value < 9);

  return value - 1;
}

function expectedGoals(attackAvg, defenseAvg, homeAdvantage = 0) {
  const attackFactor = (attackAvg - 58) / 18;
  const defenseFactor = (defenseAvg - 58) / 20;
  const randomSwing = (Math.random() - 0.5) * 0.55;
  const lambda = 1.15 + attackFactor * 0.48 - defenseFactor * 0.28 + homeAdvantage + randomSwing;
  return clamp(lambda, 0.2, 4.1);
}

function randomGoalMinute(index) {
  const baseMinute = clamp(Math.round(Math.random() * 88) + 1, 1, 90);
  return clamp(baseMinute + index, 1, 90);
}

module.exports = {
  clamp,
  averagePower,
  samplePoisson,
  expectedGoals,
  randomGoalMinute,
};
