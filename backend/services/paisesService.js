/**
 * services/paisesService.js
 * Queries contra las tablas `paises` y `divisiones` en Supabase.
 */

const supabase = require('./supabase');

const PAISES_TABLE    = 'paises';
const DIVISIONES_TABLE = 'divisiones';

/**
 * Devuelve todos los países ordenados por nombre, incluyendo sus divisiones.
 * @returns {Array} [{ id, nombre, divisiones: [...] }]
 */
async function getAll() {
  const { data: paises, error: paisError } = await supabase
    .from(PAISES_TABLE)
    .select('*')
    .order('nombre', { ascending: true });

  if (paisError) throw paisError;

  const { data: divisiones, error: divError } = await supabase
    .from(DIVISIONES_TABLE)
    .select('*')
    .order('nombre', { ascending: true });

  if (divError) throw divError;

  // Agrupa las divisiones dentro de cada país
  return paises.map((p) => ({
    ...p,
    divisiones: divisiones.filter((d) => d.pais_id === p.id),
  }));
}

/**
 * Busca un país por nombre (sin distinción de mayúsculas/minúsculas).
 * @param {string} nombre
 * @returns {object|null}
 */
async function findByNombre(nombre) {
  const { data, error } = await supabase
    .from(PAISES_TABLE)
    .select('*')
    .ilike('nombre', nombre.trim())
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Crea un país e inserta automáticamente sus 4 divisiones.
 * Ambos INSERT ocurren dentro de una unica transaccion de Postgres (funcion
 * crear_pais_con_divisiones, ver sql/migrations/001_crear_pais_con_divisiones.sql):
 * si falla la insercion de las divisiones, el pais tampoco queda persistido
 * (antes eran dos INSERT sueltos desde Node sin ninguna transaccion, y un
 * pais podia quedar huerfano sin sus 4 divisiones).
 *
 * Requiere que la migracion 001 este aplicada en Supabase antes de desplegar
 * este cambio -- si la funcion no existe todavia, esta llamada falla con un
 * error de Postgres ("function crear_pais_con_divisiones does not exist").
 *
 * @param {string} nombre - Nombre del país
 * @returns {{ id, nombre, divisiones: Array }}
 */
async function create(nombre) {
  const { data, error } = await supabase.rpc('crear_pais_con_divisiones', {
    p_nombre: nombre.trim(),
  });

  if (error) throw error;
  return data;
}

module.exports = { getAll, findByNombre, create };
