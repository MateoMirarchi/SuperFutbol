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
 * @param {string} nombre - Nombre del país
 * @returns {{ id, nombre, divisiones: Array }}
 */
async function create(nombre) {
  // 1. Insertar el país
  const { data: pais, error: paisError } = await supabase
    .from(PAISES_TABLE)
    .insert([{ nombre: nombre.trim() }])
    .select()
    .single();

  if (paisError) throw paisError;

  // 2. Insertar las 4 divisiones asociadas
  const filas = [1, 2, 3, 4].map((n) => ({
    nombre:  `División ${n}`,
    pais_id: pais.id,
  }));

  const { data: divisiones, error: divError } = await supabase
    .from(DIVISIONES_TABLE)
    .insert(filas)
    .select();

  if (divError) throw divError;

  return { ...pais, divisiones };
}

module.exports = { getAll, findByNombre, create };
