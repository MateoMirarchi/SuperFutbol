/**
 * controllers/confianzaController.js
 */

const {
  applyMatchResultConfidence,
} = require('../utils/business/confidenceHelpers');

function getDefault(_req, res) {
  return res.json({ board: 70, fans: 70 });
}

function applyResult(req, res) {
  try {
    const {
      confidence,
      result,
      competitionType,
      rivalPrestige,
      myPrestige,
    } = req.body ?? {};

    const payload = {
      confidence,
      result,
      competitionType,
      rivalPrestige,
      myPrestige,
    };

    const evaluated = applyMatchResultConfidence(payload);
    return res.json(evaluated);
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo calcular la confianza.', detail: error.message });
  }
}

module.exports = {
  getDefault,
  applyResult,
};
