const express = require('express');
const simulacionController = require('../controllers/simulacionController');

const router = express.Router();

router.post('/run', simulacionController.run);

module.exports = router;
