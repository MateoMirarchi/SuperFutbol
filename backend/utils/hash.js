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

const BCRYPT_HASH_PATTERN = /^\$2[aby]?\$/;

/**
 * Si el valor guardado no tiene forma de hash bcrypt, la verificacion falla
 * explicitamente: no hay fallback a comparacion en texto plano (=== no es
 * de tiempo constante, y dejaria el login funcionando indefinidamente con
 * passwords sin hashear). Si existen registros reales sin hashear en la
 * tabla admins, migrarlos con scripts/rehash-plaintext-passwords.js.
 */
async function verifyPassword(plainPassword, hash) {
  if (!hash) return false;

  if (typeof hash !== 'string') return false;

  if (!BCRYPT_HASH_PATTERN.test(hash)) return false;

  return bcrypt.compare(plainPassword, hash);
}

module.exports = { hashPassword, verifyPassword };
