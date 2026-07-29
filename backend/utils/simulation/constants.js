/**
 * utils/simulation/constants.js
 * Constantes del motor de simulacion de partidos.
 */

const REGULAR_GOAL_WEIGHTS = {
  GK: 0,
  LB: 1.0,
  RB: 1.0,
  CB: 0.9,
  CDM: 1.4,
  CM: 2.2,
  CAM: 3.1,
  LM: 2.6,
  RM: 2.6,
  ST: 5.2,
  LW: 4.6,
  RW: 4.6,
};

const PENALTY_GOAL_WEIGHTS = {
  GK: 0.2,
  LB: 0.8,
  RB: 0.8,
  CB: 0.7,
  CDM: 1.2,
  CM: 2.0,
  CAM: 2.9,
  LM: 2.4,
  RM: 2.4,
  ST: 3.8,
  LW: 3.3,
  RW: 3.3,
};

const POSITION_ALIASES = {
  DEF: 'CB',
  MID: 'CM',
  FWD: 'ST',
};

module.exports = {
  REGULAR_GOAL_WEIGHTS,
  PENALTY_GOAL_WEIGHTS,
  POSITION_ALIASES,
};
