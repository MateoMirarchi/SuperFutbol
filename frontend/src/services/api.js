/**
 * services/api.js
 * Cliente mínimo para consumir la API del backend.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const base = data.error || 'Error de red';
    const detail = data.detail ? ` — ${data.detail}` : '';
    const error = new Error(`${base}${detail}`);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

export function loginRequest(credentials) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

/**
 * Obtiene la lista de equipos.
 * @param {object} params - Filtros opcionales: { liga_id, division }
 */
export function getEquipos(params = {}) {
  const qs = Object.keys(params).length
    ? '?' + new URLSearchParams(params).toString()
    : '';
  return request(`/equipos${qs}`);
}

export function getEquipoDetalle(id) {
  return request(`/equipos/${id}`);
}

export function createEquipo(payload, token) {
  return request('/equipos', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export function updateEquipo(id, payload, token) {
  return request(`/equipos/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteEquipo(id, token) {
  return request(`/equipos/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function createJugador(payload, token) {
  return request('/jugadores', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export function getJugador(id) {
  return request(`/jugadores/${id}`);
}

export function updateJugador(id, payload, token) {
  return request(`/jugadores/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteJugador(id, token) {
  return request(`/jugadores/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function simulatePartido(payload) {
  return request('/partidos/simular', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── Países ────────────────────────────────────────────────────────

/**
 * Devuelve todos los países con sus divisiones.
 */
export function getPaises() {
  return request('/paises');
}

/**
 * Crea un país e inserta automáticamente sus 4 divisiones.
 * @param {{ nombre: string }} payload
 * @param {string} token - JWT de administrador
 */
export function createPais(payload, token) {
  return request('/paises', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}
