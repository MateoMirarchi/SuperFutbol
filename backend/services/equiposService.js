/**
 * services/equiposService.js
 * Queries SQL contra la tabla `equipos` en Supabase.
 *
 * Tabla esperada:
 *   CREATE TABLE equipos (
 *     id            SERIAL PRIMARY KEY,
 *     nombre        VARCHAR(100) NOT NULL,
 *     nombre_corto  VARCHAR(5)   NOT NULL,
 *     ciudad        VARCHAR(100),
 *     liga_id       VARCHAR(10)  NOT NULL,
 *     liga_nombre   VARCHAR(100),
 *     division      INTEGER      NOT NULL DEFAULT 1,
 *     division_nombre VARCHAR(100),
 *     prestigio     INTEGER      NOT NULL DEFAULT 50,
 *     color_primario   VARCHAR(7)  NOT NULL DEFAULT '#1E3A5F',
 *     color_secundario VARCHAR(7)  NOT NULL DEFAULT '#FFFFFF',
 *     created_at    TIMESTAMPTZ  DEFAULT NOW()
 *   );
 */

const supabase = require('./supabase');
const TABLE = 'equipos';

/**
 * Devuelve todos los equipos ordenados por nombre.
 * @param {object} filtros - Filtros opcionales: { liga_id, division }
 */
async function getAll(filtros = {}) {
  let query = supabase.from(TABLE).select('*');

  if (filtros.liga_id) query = query.eq('liga_id', filtros.liga_id);
  if (filtros.division !== undefined) query = query.eq('division', Number(filtros.division));

  const { data, error } = await query.order('nombre', { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Devuelve un equipo por su ID.
 * @param {number} id
 */
async function getById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Crea un nuevo equipo y devuelve el registro insertado.
 * @param {object} campos
 */
async function create(campos) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([campos])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualiza un equipo existente y devuelve el registro actualizado.
 * @param {number} id
 * @param {object} cambios
 */
async function update(id, cambios) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(cambios)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Elimina un equipo por su ID.
 * Nota: los jugadores del equipo deben eliminarse antes (o con ON DELETE CASCADE en la DB).
 * @param {number} id
 */
async function remove(id) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) throw error;
}

module.exports = { getAll, getById, create, update, remove };
