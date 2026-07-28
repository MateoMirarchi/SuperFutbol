/**
 * controllers/partidosController.js
 * Endpoint de simulacion de partidos.
 */

const { simularPartido } = require('../services/partidosService');

async function simulate(req, res) {
  try {
    if (!req.body?.homeTeam || !req.body?.awayTeam) {
      return res.status(400).json({ error: 'Los equipos local y visitante son obligatorios.' });
    }

    const simulation = simularPartido(req.body);
    return res.json(simulation);
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo simular el partido.', detail: error.message });
  }
}

module.exports = { simulate };