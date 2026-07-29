/**
 * utils/simulation/penalties.js
 * Definicion de tanda de penales.
 */

const { averagePower } = require('./math');

function simulatePenalties(homeTeam, awayTeam, homeRoster, awayRoster) {
  const homeStrength = averagePower(homeRoster) / 100;
  const awayStrength = averagePower(awayRoster) / 100;
  let home = 0;
  let away = 0;

  for (let index = 0; index < 5; index += 1) {
    if (Math.random() < 0.68 + homeStrength * 0.18) home += 1;
    if (Math.random() < 0.68 + awayStrength * 0.18) away += 1;
  }

  while (home === away) {
    if (Math.random() < 0.68 + homeStrength * 0.18) home += 1;
    if (Math.random() < 0.68 + awayStrength * 0.18) away += 1;
  }

  return {
    home,
    away,
    winner: home > away ? homeTeam : awayTeam,
  };
}

module.exports = {
  simulatePenalties,
};
