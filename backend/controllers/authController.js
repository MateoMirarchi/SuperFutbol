/**
 * controllers/authController.js
 * Lógica del endpoint POST /auth/login.
 */

const authService = require('../services/authService');
const { verifyPassword } = require('../utils/hash');
const { signAdminToken } = require('../utils/jwt');
const { validateLoginPayload } = require('../utils/validation');

/**
 * POST /auth/login
 * Verifica credenciales del administrador y devuelve un JWT.
 * Body: { login, password }
 */
async function login(req, res) {
  try {
    const errors = validateLoginPayload(req.body);
    if (Object.keys(errors).length) {
      return res.status(400).json({ errors });
    }

    const { login, password } = req.body;
    const normalizedLogin = login.trim().toLowerCase();

    const admin = normalizedLogin.includes('@')
      ? await authService.findByEmail(normalizedLogin)
      : await authService.findByUsuario(normalizedLogin);

    if (!admin) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const isValid = await verifyPassword(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const token = signAdminToken(admin);

    return res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        usuario: admin.usuario,
        rol: 'admin',
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo iniciar sesión.', detail: error.message });
  }
}

module.exports = { login };
