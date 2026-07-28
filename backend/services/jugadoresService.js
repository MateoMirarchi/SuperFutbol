/**
 * services/jugadoresService.js
 * Queries SQL contra la tabla `jugadores` en Supabase.
 *
 * Tabla esperada:
 *   CREATE TABLE jugadores (
 *     id                  SERIAL PRIMARY KEY,
 *     equipo_id           INTEGER      NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
 *     nombre              VARCHAR(80)  NOT NULL,
 *     apellido            VARCHAR(80)  NOT NULL,
 *     posicion            VARCHAR(3)   NOT NULL CHECK (posicion IN ('GK','LB','RB','CB','CM','CDM','CAM','LM','RM','ST','RW','LW')),
 *     edad                INTEGER      NOT NULL,
 *     potencia            INTEGER      NOT NULL,
 *     valor               BIGINT       NOT NULL DEFAULT 1000000,
 *     sueldo              INTEGER      NOT NULL DEFAULT 80000,
 *     fin_contrato_temp   INTEGER      NOT NULL DEFAULT 3,
 *     estado              VARCHAR(20)  NOT NULL DEFAULT 'available'
 *                           CHECK (estado IN ('available','injured','suspended','loan')),
 *     nacionalidad        VARCHAR(80)
 *   );
 */

const supabase = require('./supabase');
const TABLE = 'jugadores';

/**
 * Devuelve todos los jugadores con su equipo para conteos globales.
 */
async function getAll() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, equipo_id');

  if (error) throw error;
  return data;
}

/**
 * Devuelve todos los jugadores de un equipo, ordenados por apellido.
 * @param {number} equipoId
 */
async function getByEquipo(equipoId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('equipo_id', equipoId)
    .order('apellido', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Devuelve un jugador por su ID.
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
 * Crea un nuevo jugador y devuelve el registro insertado.
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
 * Actualiza un jugador existente y devuelve el registro actualizado.
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
 * Elimina un jugador por su ID.
 * @param {number} id
 */
async function remove(id) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) throw error;
}

module.exports = { getAll, getByEquipo, getById, create, update, remove };
