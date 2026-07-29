const express = require('express');
const confianzaController = require('../controllers/confianzaController');

const router = express.Router();

router.get('/default', confianzaController.getDefault);
router.post('/aplicar-resultado', confianzaController.applyResult);

module.exports = router;
