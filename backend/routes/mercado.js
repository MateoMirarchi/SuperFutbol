const express = require('express');
const mercadoController = require('../controllers/mercadoController');

const router = express.Router();

router.post('/evaluar-venta', mercadoController.evaluarVenta);
router.post('/evaluar-prestamo', mercadoController.evaluarPrestamo);

module.exports = router;
