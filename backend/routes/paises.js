/**
 * routes/paises.js
 * Endpoints para países y sus divisiones.
 */

const express        = require('express');
const authAdmin      = require('../middleware/authAdmin');
const paisesController = require('../controllers/paisesController');

const router = express.Router();

/**
 * GET /paises
 * Lista todos los países con sus divisiones. Público.
 */
router.get('/', paisesController.getAll);

/**
 * POST /paises
 * Crea un país y sus 4 divisiones. Solo admin.
 */
router.post('/', authAdmin, paisesController.create);

module.exports = router;
