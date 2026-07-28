/**
 * utils/jwt.js
 * Helpers para firmar tokens JWT de administradores.
 */

const jwt = require('jsonwebtoken');

/**
 * Genera un JWT para un administrador autenticado.
 * @param {{ id:number, email:string, usuario:string }} admin
 * @returns {string}
 */
function signAdminToken(admin) {
  return jwt.sign(
    {
      sub: String(admin.id),
      email: admin.email,
      usuario: admin.usuario,
      rol: 'admin',
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    }
  );
}

module.exports = { signAdminToken };
