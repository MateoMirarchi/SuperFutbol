/**
 * middleware/authAdmin.js
 * Verifica el JWT en el header Authorization.
 * Solo permite continuar si el token es v\u00E1lido y el rol es 'admin'.
 *
 * Uso: router.post('/equipos', authAdmin, equiposController.create)
 *
 * El token debe enviarse como:
 *   Authorization: Bearer <token>
 */

const jwt = require('jsonwebtoken');

function authAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado.' });
  }

  const token = authHeader.slice(7); // Quitar "Bearer "

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Solo admins pueden pasar
    if (payload.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado: se requiere rol administrador.' });
    }

    // Adjuntar datos del admin al request para uso posterior
    req.admin = payload;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado. Inici\u00E1 sesi\u00F3n nuevamente.' });
    }
    return res.status(401).json({ error: 'Token inv\u00E1lido.' });
  }
}

module.exports = authAdmin;
