/**
 * gameHelpers.js
 * Funciones utilitarias generales del juego.
 */

/**
 * Formatea una fecha ISO a formato legible: "22 may. 2026"
 */
export function formatDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Genera un ID único simple basado en timestamp + random.
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Ordena un array de objetos por un campo numérico de forma descendente.
 */
export function sortByField(arr, field, desc = true) {
  return [...arr].sort((a, b) =>
    desc ? b[field] - a[field] : a[field] - b[field]
  );
}

/**
 * Trunca un string a la longitud máxima indicada con "…" al final.
 */
export function truncate(str, maxLength = 30) {
  if (!str) return '';
  return str.length > maxLength ? `${str.slice(0, maxLength - 1)}…` : str;
}

/**
 * Retorna el estilo de clase según el prestige del equipo.
 *   80-100 → 'elite'
 *   60-79  → 'mid'
 *   < 60   → 'low'
 */
export function prestigeClass(prestige) {
  if (prestige >= 80) return 'elite';
  if (prestige >= 60) return 'mid';
  return 'low';
}
