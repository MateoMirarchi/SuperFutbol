/**
 * utils/business/confidenceHelpers.js
 * Logica de confianza de dirigencia/hinchada y expulsion del DT.
 */

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function calcLossConfidenceDelta(competitionType, myPrestige, rivalPrestige) {
  const ranges = {
    international: { board: [-5, -3], fans: [-7, -5] },
    nationalCup: { board: [-3, -2], fans: [-6, -5] },
    local: { board: [-3, -2], fans: [-6, -5] },
  };

  const type = ranges[competitionType] ?? ranges.local;
  const [bMin, bMax] = type.board;
  const [fMin, fMax] = type.fans;

  let boardDelta = randomRange(bMin, bMax);
  let fansDelta = randomRange(fMin, fMax);

  const prestigeDiff = Number(myPrestige ?? 70) - Number(rivalPrestige ?? 70);

  if (prestigeDiff > 20) {
    boardDelta -= randomRange(1, 2);
    fansDelta -= randomRange(1, 3);
  } else if (prestigeDiff < -20) {
    boardDelta += randomRange(1, 2);
    fansDelta += randomRange(1, 2);
  }

  return {
    board: clamp(boardDelta, -15, 0),
    fans: clamp(fansDelta, -15, 0),
  };
}

function calcWinConfidenceDelta(competitionType, myPrestige, rivalPrestige) {
  const ranges = {
    international: { board: [3, 5], fans: [4, 6] },
    nationalCup: { board: [2, 4], fans: [3, 5] },
    local: { board: [1, 3], fans: [2, 4] },
  };

  const type = ranges[competitionType] ?? ranges.local;
  const [bMin, bMax] = type.board;
  const [fMin, fMax] = type.fans;

  let boardDelta = randomRange(bMin, bMax);
  let fansDelta = randomRange(fMin, fMax);

  const prestigeDiff = Number(myPrestige ?? 70) - Number(rivalPrestige ?? 70);

  if (prestigeDiff < -20) {
    boardDelta += randomRange(1, 2);
    fansDelta += randomRange(2, 3);
  }

  return {
    board: clamp(boardDelta, 0, 15),
    fans: clamp(fansDelta, 0, 15),
  };
}

function shouldFire(boardConfidence) {
  return Number(boardConfidence ?? 0) < 10;
}

function applyMatchResultConfidence({ confidence, result, competitionType, rivalPrestige, myPrestige }) {
  const current = {
    board: Number(confidence?.board ?? 70),
    fans: Number(confidence?.fans ?? 70),
  };

  let delta = { board: 0, fans: 0 };

  if (result === 'loss') {
    delta = calcLossConfidenceDelta(competitionType, myPrestige, rivalPrestige);
  } else if (result === 'win') {
    delta = calcWinConfidenceDelta(competitionType, myPrestige, rivalPrestige);
  }

  const updated = {
    board: clamp(current.board + delta.board, 0, 100),
    fans: clamp(current.fans + delta.fans, 0, 100),
  };

  return {
    confidence: updated,
    delta,
    expulsado: shouldFire(updated.board),
  };
}

module.exports = {
  randomRange,
  clamp,
  calcLossConfidenceDelta,
  calcWinConfidenceDelta,
  shouldFire,
  applyMatchResultConfidence,
};
