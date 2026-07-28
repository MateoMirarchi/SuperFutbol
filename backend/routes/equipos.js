/**
 * routes/equipos.js
 * Endpoints CRUD de equipos.
 */

const express = require('express');
const authAdmin = require('../middleware/authAdmin');
const equiposController = require('../controllers/equiposController');

const router = express.Router();

/**
 * GET /equipos
 * Lista todos los equipos. Público.
 */
router.get('/', equiposController.getAll);

/**
 * GET /equipos/:id
 * Devuelve detalle del equipo y su plantilla. Público.
 */
router.get('/:id', equiposController.getById);

/**
 * POST /equipos
 * Crea un equipo. Solo admin.
 */
router.post('/', authAdmin, equiposController.create);

/**
 * PUT /equipos/:id
 * Modifica un equipo. Solo admin.
 */
router.put('/:id', authAdmin, equiposController.update);

/**
 * DELETE /equipos/:id
 * Elimina un equipo. Solo admin.
 */
router.delete('/:id', authAdmin, equiposController.remove);

module.exports = router;
