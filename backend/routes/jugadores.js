/**
 * routes/jugadores.js
 * Endpoints CRUD de jugadores.
 */

const express = require('express');
const authAdmin = require('../middleware/authAdmin');
const jugadoresController = require('../controllers/jugadoresController');

const router = express.Router();

/**
 * GET /jugadores/:id
 * Devuelve el detalle de un jugador. Público.
 */
router.get('/:id', jugadoresController.getById);

/**
 * POST /jugadores
 * Crea un jugador. Solo admin.
 */
router.post('/', authAdmin, jugadoresController.create);

/**
 * PUT /jugadores/:id
 * Modifica un jugador. Solo admin.
 */
router.put('/:id', authAdmin, jugadoresController.update);

/**
 * DELETE /jugadores/:id
 * Elimina un jugador. Solo admin.
 */
router.delete('/:id', authAdmin, jugadoresController.remove);

module.exports = router;
