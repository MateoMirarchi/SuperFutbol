/**
 * services/partidosService.js
 * Motor de simulacion de partidos para gameplay.
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

function normalizePosition(position) {
  const normalized = String(position ?? '').trim().toUpperCase();
  return {
    DEF: 'CB',
    MID: 'CM',
    FWD: 'ST',
  }[normalized] ?? normalized;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function createVirtualRoster(team = {}) {
  const prestige = Number(team.prestige ?? 68);
  return POSITION_TEMPLATE.map((position, index) => {
    const positionDelta = {
      GK: -6,
      LB: -2,
      RB: -2,
      CB: -3,
      CDM: -1,
      CM: 1,
      CAM: 3,
      LM: 2,
      RM: 2,
      ST: 5,
      LW: 4,
      RW: 4,
    }[position] ?? 0;
    const basePower = prestige * 0.78 + positionDelta + (Math.random() * 16 - 8);
    return {
      id: `${team.id ?? 'team'}-virt-${index + 1}`,
      firstName: randomItem(FIRST_NAMES),
      lastName: randomItem(LAST_NAMES),
      position,
      power: clamp(Math.round(basePower), 28, 99),
    };
  });
}

function normalizePlayer(player, index, fallbackTeamId) {
  return {
    id: player.id ?? `${fallbackTeamId}-player-${index + 1}`,
    firstName: player.firstName ?? player.nombre ?? 'Jugador',
    lastName: player.lastName ?? player.apellido ?? `${index + 1}`,
    position: normalizePosition(player.position ?? player.posicion ?? 'CM'),
    power: clamp(Number(player.power ?? player.potencia ?? 60), 1, 99),
  };
}

function normalizeRoster(team, players) {
  if (Array.isArray(players) && players.length > 0) {
    return players.map((player, index) => normalizePlayer(player, index, team?.id ?? 'team'));
  }
  return createVirtualRoster(team);
}

function averagePower(players) {
  if (!players.length) return 60;
  return players.reduce((sum, player) => sum + Number(player.power ?? 60), 0) / players.length;
}

function samplePoisson(lambda) {
  const limit = Math.exp(-lambda);
  let product = 1;
  let value = 0;

  do {
    value += 1;
    product *= Math.random();
  } while (product > limit && value < 9);

  return value - 1;
}

function expectedGoals(attackAvg, defenseAvg, homeAdvantage = 0) {
  const attackFactor = (attackAvg - 58) / 18;
  const defenseFactor = (defenseAvg - 58) / 20;
  const randomSwing = (Math.random() - 0.5) * 0.55;
  const lambda = 1.15 + attackFactor * 0.48 - defenseFactor * 0.28 + homeAdvantage + randomSwing;
  return clamp(lambda, 0.2, 4.1);
}

function weightedPick(players, weights) {
  const pool = players
    .map((player) => {
      const positionWeight = weights[player.position] ?? 1;
      const powerWeight = 0.6 + Number(player.power ?? 60) / 100;
      return { player, weight: positionWeight * powerWeight };
    })
    .filter((item) => item.weight > 0);

  const total = pool.reduce((sum, item) => sum + item.weight, 0);
  if (!total) return players[0] ?? null;

  let cursor = Math.random() * total;
  for (const item of pool) {
    cursor -= item.weight;
    if (cursor <= 0) return item.player;
  }

  return pool[pool.length - 1]?.player ?? null;
}

function randomGoalMinute(index) {
  const baseMinute = clamp(Math.round(Math.random() * 88) + 1, 1, 90);
  return clamp(baseMinute + index, 1, 90);
}

function buildScorers(goals, team, roster) {
  const scorers = [];
  for (let index = 0; index < goals; index += 1) {
    const isPenalty = Math.random() < 0.16;
    const weights = isPenalty ? PENALTY_GOAL_WEIGHTS : REGULAR_GOAL_WEIGHTS;
    const scorer = weightedPick(roster, weights);
    if (!scorer) continue;

    scorers.push({
      teamId: team.id,
      teamName: team.name,
      playerId: scorer.id,
      playerName: `${scorer.firstName} ${scorer.lastName}`.trim(),
      position: scorer.position,
      power: scorer.power,
      minute: randomGoalMinute(index),
      isPenalty,
    });
  }

  return scorers.sort((a, b) => a.minute - b.minute);
}

function simulatePenalties(homeTeam, awayTeam, homeRoster, awayRoster) {
  const homeStrength = averagePower(homeRoster) / 100;
  const awayStrength = averagePower(awayRoster) / 100;
  let home = 0;
  let away = 0;

  for (let index = 0; index < 5; index += 1) {
    if (Math.random() < 0.68 + homeStrength * 0.18) home += 1;
    if (Math.random() < 0.68 + awayStrength * 0.18) away += 1;
  }

  while (home === away) {
    if (Math.random() < 0.68 + homeStrength * 0.18) home += 1;
    if (Math.random() < 0.68 + awayStrength * 0.18) away += 1;
  }

  return {
    home,
    away,
    winner: home > away ? homeTeam : awayTeam,
  };
}

function buildTournamentUpdate(context, summary, homeTeam, awayTeam) {
  const type = context.type ?? 'league';

  if (type === 'group' || type === 'league') {
    const isDraw = summary.homeGoals === summary.awayGoals;
    const homeWon = summary.homeGoals > summary.awayGoals;
    return {
      type,
      home: {
        teamId: homeTeam.id,
        points: isDraw ? 1 : homeWon ? 3 : 0,
        goalDifference: summary.homeGoals - summary.awayGoals,
      },
      away: {
        teamId: awayTeam.id,
        points: isDraw ? 1 : homeWon ? 0 : 3,
        goalDifference: summary.awayGoals - summary.homeGoals,
      },
    };
  }

  if (type === 'knockout') {
    const previousLeg = context.previousLeg ?? null;
    let aggregate = null;
    let winner = summary.winner;
    let decidedBy = summary.decidedBy;

    if (previousLeg) {
      const homeAggregate = Number(previousLeg.homeGoals ?? 0) + Number(summary.homeGoals ?? 0);
      const awayAggregate = Number(previousLeg.awayGoals ?? 0) + Number(summary.awayGoals ?? 0);
      aggregate = { homeGoals: homeAggregate, awayGoals: awayAggregate };

      if (homeAggregate > awayAggregate) {
        winner = homeTeam;
        decidedBy = 'aggregate';
      } else if (awayAggregate > homeAggregate) {
        winner = awayTeam;
        decidedBy = 'aggregate';
      }
    }

    return {
      type,
      aggregate,
      winner,
      decidedBy,
    };
  }

  return { type };
}

function simularPartido(payload) {
  const homeTeam = payload.homeTeam ?? { id: 'home', name: 'Local', prestige: 70 };
  const awayTeam = payload.awayTeam ?? { id: 'away', name: 'Visitante', prestige: 70 };
  const homeRoster = normalizeRoster(homeTeam, payload.homePlayers);
  const awayRoster = normalizeRoster(awayTeam, payload.awayPlayers);

  const homeAvg = averagePower(homeRoster);
  const awayAvg = averagePower(awayRoster);
  const homeGoals = samplePoisson(expectedGoals(homeAvg, awayAvg, 0.22));
  const awayGoals = samplePoisson(expectedGoals(awayAvg, homeAvg, 0));

  const scorers = [
    ...buildScorers(homeGoals, homeTeam, homeRoster),
    ...buildScorers(awayGoals, awayTeam, awayRoster),
  ].sort((a, b) => a.minute - b.minute);

  let winner = null;
  let penalties = null;
  let decidedBy = 'regular';
  if (homeGoals > awayGoals) winner = homeTeam;
  if (awayGoals > homeGoals) winner = awayTeam;

  if (!winner && payload.context?.type === 'knockout') {
    penalties = simulatePenalties(homeTeam, awayTeam, homeRoster, awayRoster);
    winner = penalties.winner;
    decidedBy = 'penalties';
  }

  const summary = {
    homeGoals,
    awayGoals,
    homePenalties: penalties?.home ?? null,
    awayPenalties: penalties?.away ?? null,
    scorers,
    winner,
    decidedBy,
  };

  return {
    match: summary,
    tournamentUpdate: buildTournamentUpdate(payload.context ?? {}, summary, homeTeam, awayTeam),
    metrics: {
      homeAveragePower: Number(homeAvg.toFixed(1)),
      awayAveragePower: Number(awayAvg.toFixed(1)),
    },
  };
}

module.exports = { simularPartido };