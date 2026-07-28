/**
 * routes/auth.js
 * Endpoints de autenticación.
 */

const express = require('express');
const { login } = require('../controllers/authController');

const router = express.Router();

/**
 * POST /auth/login
 * Recibe { login, password } y devuelve { token, admin }.
 */
router.post('/login', login);

module.exports = router;
