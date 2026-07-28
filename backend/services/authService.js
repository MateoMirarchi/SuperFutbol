/**
 * services/authService.js
 * Queries SQL contra la tabla `admins` en Supabase.
 *
 * Tabla esperada (ver schema.sql):
 *   CREATE TABLE admins (
 *     id       SERIAL PRIMARY KEY,
 *     email    VARCHAR(100) UNIQUE NOT NULL,
 *     usuario  VARCHAR(50)  UNIQUE NOT NULL,
 *     password VARCHAR(200) NOT NULL   -- hash bcrypt
 *   );
 */

const supabase = require('./supabase');
const TABLE = 'admins';

/**
 * Busca un administrador por su nombre de usuario.
 * @param {string} usuario
 * @returns {object|null}
 */
async function findByUsuario(usuario) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('usuario', usuario)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Busca un administrador por su email.
 * @param {string} email
 * @returns {object|null}
 */
async function findByEmail(email) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data;
}

module.exports = { findByUsuario, findByEmail };
