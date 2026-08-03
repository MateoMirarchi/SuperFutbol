/**
 * storage.js
 * Wrapper defensivo sobre localStorage: centraliza el try/catch que antes
 * estaba reimplementado (con matices distintos) en useLocalStorage.js,
 * useAdminAuth.js y useTeamDatabase.js. Cubre cuota excedida, modo privado
 * (donde localStorage puede lanzar al primer acceso) y JSON corrupto.
 */

export function loadData(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`storage.loadData: error al leer "${key}"`, err);
    return fallback;
  }
}

export function saveData(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`storage.saveData: error al guardar "${key}"`, err);
    return false;
  }
}

export function removeData(key) {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.warn(`storage.removeData: error al eliminar "${key}"`, err);
    return false;
  }
}
