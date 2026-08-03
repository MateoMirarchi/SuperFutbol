/**
 * utils/validation.js
 * Validaciones de payloads para auth, equipos y jugadores.
 */

const POSITIONS = new Set(['GK', 'LB', 'RB', 'CB', 'CM', 'CDM', 'CAM', 'LM', 'RM', 'ST', 'RW', 'LW']);
const STATUSES = new Set(['available', 'injured', 'suspended', 'loan']);

function isHexColor(value) {
  return typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value);
}

function validateLoginPayload(body) {
  const errors = {};

  if (!body.login || typeof body.login !== 'string') {
    errors.login = 'El usuario o email es requerido.';
  }

  if (!body.password || typeof body.password !== 'string') {
    errors.password = 'La contraseña es requerida.';
  }

  return errors;
}

function validateEquipoPayload(body) {
  const errors = {};

  if (!body.name?.trim()) errors.name = 'El nombre es obligatorio.';
  if (!body.shortName?.trim()) errors.shortName = 'La abreviatura es obligatoria.';
  if (body.leagueId === undefined || body.leagueId === null || body.leagueId === '') errors.leagueId = 'La liga es obligatoria.';
  if (!Number.isInteger(Number(body.divisionLevel)) || Number(body.divisionLevel) < 1 || Number(body.divisionLevel) > 4) {
    errors.divisionLevel = 'La división debe estar entre 1 y 4.';
  }
  if (!Number.isInteger(Number(body.prestige)) || Number(body.prestige) < 1 || Number(body.prestige) > 99) {
    errors.prestige = 'El prestigio debe estar entre 1 y 99.';
  }
  if (body.shortName && body.shortName.trim().length > 5) {
    errors.shortName = 'La abreviatura admite hasta 5 caracteres.';
  }
  if (body.primaryColor && !isHexColor(body.primaryColor)) {
    errors.primaryColor = 'El color primario debe ser hexadecimal (#RRGGBB).';
  }
  if (body.secondaryColor && !isHexColor(body.secondaryColor)) {
    errors.secondaryColor = 'El color secundario debe ser hexadecimal (#RRGGBB).';
  }

  return errors;
}

function validateJugadorPayload(body) {
  const errors = {};
  const age = Number(body.age);
  const power = Number(body.power);
  const value = Number(body.value);
  const salary = Number(body.salary);
  const contractEndSeason = Number(body.contractEndSeason);

  if (!Number.isInteger(Number(body.teamId))) errors.teamId = 'El equipo es obligatorio.';
  if (!body.firstName?.trim()) errors.firstName = 'El nombre es obligatorio.';
  if (!body.lastName?.trim()) errors.lastName = 'El apellido es obligatorio.';
  if (!POSITIONS.has(body.position)) errors.position = 'La posición no es válida.';
  if (!Number.isInteger(age) || age < 14 || age > 45) errors.age = 'La edad debe estar entre 14 y 45.';
  if (!Number.isInteger(power) || power < 1 || power > 99) errors.power = 'La potencia debe estar entre 1 y 99.';
  if (Number.isNaN(value) || value < 0) errors.value = 'El valor debe ser un número positivo.';
  if (!Number.isInteger(salary) || salary < 0) errors.salary = 'El sueldo debe ser un entero positivo.';
  if (!Number.isInteger(contractEndSeason) || contractEndSeason < 1 || contractEndSeason > 20) {
    errors.contractEndSeason = 'El fin de contrato debe estar entre 1 y 20.';
  }
  if (!STATUSES.has(body.status)) errors.status = 'El estado no es válido.';

  return errors;
}

function validateVentaPayload(body) {
  const errors = {};
  const askingPrice = Number(body.askingPrice);

  if (!body.player || typeof body.player !== 'object') {
    errors.player = 'El jugador es obligatorio.';
  } else if (body.player.id === undefined || body.player.id === null || body.player.id === '') {
    errors.player = 'El jugador debe tener un id.';
  }

  if (!Number.isFinite(askingPrice) || askingPrice <= 0) {
    errors.askingPrice = 'El precio pedido debe ser un numero positivo.';
  }

  if (body.teamPool !== undefined && !Array.isArray(body.teamPool)) {
    errors.teamPool = 'teamPool debe ser un array.';
  }

  return errors;
}

function validatePrestamoPayload(body) {
  const errors = {};

  if (!body.player || typeof body.player !== 'object') {
    errors.player = 'El jugador es obligatorio.';
  } else if (body.player.id === undefined || body.player.id === null || body.player.id === '') {
    errors.player = 'El jugador debe tener un id.';
  }

  if (body.teamPool !== undefined && !Array.isArray(body.teamPool)) {
    errors.teamPool = 'teamPool debe ser un array.';
  }

  return errors;
}

module.exports = {
  validateLoginPayload,
  validateEquipoPayload,
  validateJugadorPayload,
  validateVentaPayload,
  validatePrestamoPayload,
};
