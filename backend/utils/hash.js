/**
 * utils/hash.js
 * Funciones auxiliares para hashing y verificaci\u00F3n de contrase\u00F1as con bcrypt.
 */

const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

/**
 * Genera el hash bcrypt de una contrase\u00F1a en texto plano.
 * @param {string} plainPassword
 * @returns {Promise<string>} hash
 */
async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compara una contrase\u00F1a en texto plano contra su hash almacenado.
 * Acepta tanto hashes bcrypt como contraseñas almacenadas en texto plano
 * para mantener compatibilidad con registros antiguos.
 * @param {string} plainPassword
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function verifyPassword(plainPassword, hash) {
  if (!hash) return false;

  if (typeof hash !== 'string') return false;

  if (hash.startsWith('$2') || hash.startsWith('$2a') || hash.startsWith('$2b')) {
    return bcrypt.compare(plainPassword, hash);
  }

  return plainPassword === hash;
}

module.exports = { hashPassword, verifyPassword };
