/**
 * utils/business/squadGenerator.js
 */

const POSITION_TEMPLATE = [
  'GK', 'GK',
  'LB', 'LB', 'RB', 'RB', 'CB', 'CB', 'CB', 'CB',
  'CDM', 'CDM', 'CM', 'CM', 'CAM', 'CAM', 'LM', 'RM',
  'ST', 'ST', 'LW', 'RW',
];

const FIRST_NAMES = [
  'Carlos', 'Lucas', 'Matias', 'Diego', 'Gonzalo', 'Sebastian', 'Rodrigo',
  'Facundo', 'Nicolas', 'Pablo', 'Hernan', 'Ezequiel', 'Leandro', 'Javier',
  'Fernando', 'Juan', 'Alejandro', 'Cristian', 'Franco', 'Ramiro',
  'Emiliano', 'Mauro', 'Agustin', 'Tomas', 'Ignacio', 'Santiago', 'Martin',
  'Lautaro', 'Thiago', 'Bruno', 'Gabriel', 'Rafael', 'Pedro', 'Adrian',
];

const LAST_NAMES = [
  'Gonzalez', 'Rodriguez', 'Lopez', 'Martinez', 'Garcia', 'Fernandez',
  'Perez', 'Alvarez', 'Gomez', 'Sanchez', 'Romero', 'Diaz', 'Torres',
  'Ruiz', 'Herrera', 'Morales', 'Benitez', 'Castro', 'Ramos', 'Ortega',
  'Suarez', 'Mendez', 'Silva', 'Flores', 'Cabrera', 'Vega', 'Rios',
  'Delgado', 'Vargas', 'Nunez', 'Aguirre', 'Ibanez', 'Caceres', 'Rojas',
];

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function randomName() {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return { firstName, lastName };
}

function randomPower(prestige) {
  const base = Math.round(prestige * 0.78);
  const spread = Math.round(prestige * 0.22) + 6;
  const power = base + Math.floor(Math.random() * spread);
  return Math.max(28, Math.min(99, power));
}

function calcValue(power, age) {
  const ageFactor = age <= 24 ? 1.1 : age <= 28 ? 1.0 : Math.max(0.35, 1 - (age - 28) * 0.08);
  const base = Math.pow(power / 10, 2) * 0.15;
  return Math.round(base * ageFactor * 100) / 100;
}

function calcSalary(power) {
  return Math.round((power / 10) * 18 + Math.random() * 25);
}

function generateSquad(prestige = 70, currentSeason = 1) {
  return POSITION_TEMPLATE.map((position) => {
    const age = 17 + Math.floor(Math.random() * 19);
    const power = randomPower(prestige);
    const { firstName, lastName } = randomName();

    return {
      id: generateId('pl'),
      firstName,
      lastName,
      position,
      age,
      power,
      value: calcValue(power, age),
      tiredness: 0,
      salary: calcSalary(power),
      contractEndSeason: currentSeason + Math.floor(Math.random() * 4) + 1,
      status: 'available',
    };
  });
}

module.exports = {
  generateSquad,
};
