/**
 * utils/simulation/roster.js
 * Normalizacion de planteles reales para simulacion.
 */

const { POSITION_ALIASES } = require('./constants');
const { clamp } = require('./math');

function normalizePosition(position) {
  const normalized = String(position ?? '').trim().toUpperCase();
  return POSITION_ALIASES[normalized] ?? normalized;
}

function sanitizeName(value) {
  return String(value ?? '').trim();
}

function normalizePlayer(player, index, fallbackTeamId) {
  const firstName = sanitizeName(player.firstName ?? player.nombre);
  const lastName = sanitizeName(player.lastName ?? player.apellido);
  const fullName = sanitizeName(player.name ?? player.fullName ?? player.nombreCompleto);

  let resolvedFirstName = firstName;
  let resolvedLastName = lastName;

  if (!resolvedFirstName && !resolvedLastName && fullName) {
    const [first, ...rest] = fullName.split(' ');
    resolvedFirstName = first ?? '';
    resolvedLastName = rest.join(' ');
  }

  if (!resolvedFirstName && !resolvedLastName) {
    resolvedFirstName = 'Jugador';
    resolvedLastName = `${index + 1}`;
  }

  return {
    id: player.id ?? `${fallbackTeamId}-player-${index + 1}`,
    firstName: resolvedFirstName,
    lastName: resolvedLastName,
    position: normalizePosition(player.position ?? player.posicion ?? 'CM'),
    power: clamp(Number(player.tacticalPower ?? player.power ?? player.potencia ?? 60), 1, 99),
  };
}

function normalizeRoster(team, players, { required = true, sideLabel = 'equipo' } = {}) {
  if (!Array.isArray(players) || players.length === 0) {
    if (required) {
      throw new Error(`Se requiere el plantel real del ${sideLabel} para simular el partido.`);
    }
    return [];
  }

  return players.map((player, index) => normalizePlayer(player, index, team?.id ?? 'team'));
}

module.exports = {
  normalizeRoster,
};
