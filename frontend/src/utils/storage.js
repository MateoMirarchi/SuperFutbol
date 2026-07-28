/**
 * storage.js
 * Capa de abstracción sobre localStorage para guardar/cargar datos de partida.
 * Centraliza el manejo de errores y la serialización.
 */

/** Guarda cualquier valor serializable bajo una clave dada. */
export function saveData(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`storage.saveData: no se pudo guardar "${key}"`, err);
  }
}

/** Lee y deserializa el valor guardado bajo una clave. */
export function loadData(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`storage.loadData: no se pudo leer "${key}"`, err);
    return fallback;
  }
}

/** Elimina la entrada de una clave. */
export function removeData(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.error(`storage.removeData: no se pudo eliminar "${key}"`, err);
  }
}

/** Retorna true si hay datos guardados bajo la clave dada. */
export function hasData(key) {
  return window.localStorage.getItem(key) !== null;
}
