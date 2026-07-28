/**
 * routes/partidos.js
 * Endpoints de simulacion de partidos.
 */

const express = require('express');
const partidosController = require('../controllers/partidosController');

const router = express.Router();

/**
 * POST /partidos/simular
 * Simula un partido y devuelve resultado + goleadores.
 */
router.post('/simular', partidosController.simulate);

module.exports = router;