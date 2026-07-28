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
 * @param {string} plainPassword
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function verifyPassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

module.exports = { hashPassword, verifyPassword };
