/**
 * scheduleGenerator.js
 * Genera calendarios de liga (doble vuelta round-robin) y brackets de copa.
 */

import { matchesLeagueSelection } from './leagueCatalog';

/**
 * Genera el calendario completo de una liga con sistema de doble vuelta.
 * Para n equipos produce (n-1)*2 fechas de n/2 partidos cada una.
 *
 * @param {Array} teams - Equipos [{ id, name, ... }]
 * @returns {Array} rounds - [{ round: number, matches: [{ home, away }] }]
 */
export function generateLeagueSchedule(teams) {
  const list = [...teams];

  // Si hay número impar, agregar equipo "libre"
  if (list.length % 2 !== 0) {
    list.push({ id: 'bye', name: 'Libre' });
  }

  const size = list.length;
  const half = size / 2;
  const fixed = list[0];
  const rotating = list.slice(1); // se rota cada fecha

  const firstHalf = [];

  for (let r = 0; r < size - 1; r++) {
    const matches = [];

    // El equipo fijo juega contra rotating[0]; alterna local/visita
    if (fixed.id !== 'bye' && rotating[0].id !== 'bye') {
      matches.push(
        r % 2 === 0
          ? { home: fixed, away: rotating[0] }
          : { home: rotating[0], away: fixed }
      );
    }

    // Los demás enfrentamientos: rotating[i] vs rotating[size-1-i]
    for (let i = 1; i < half; i++) {
      const h = rotating[i];
      const a = rotating[size - 1 - i];
      if (h.id !== 'bye' && a.id !== 'bye') {
        matches.push({ home: h, away: a });
      }
    }

    firstHalf.push({ round: r + 1, matches });

    // Rotación (circular): el último pasa al frente
    rotating.unshift(rotating.pop());
  }

  // Segunda vuelta: invierten local/visitante
  const secondHalf = firstHalf.map((fd, i) => ({
    round: size - 1 + i + 1,
    matches: fd.matches.map((m) => ({ home: m.away, away: m.home })),
  }));

  return [...firstHalf, ...secondHalf];
}

/**
 * Genera un bracket de copa eliminatoria de 8 equipos (ida y vuelta).
 * Siembra: 1-8, 2-7, 3-6, 4-5 en cuartos.
 *
 * @param {Array} teams - Al menos 8 equipos [{ id, name, prestige, ... }]
 * @returns {Object} bracket { quarterFinals, semiFinals, final }
 */
export function generateCupBracket(teams) {
  // Ordena por prestige descendente y toma los 8 mejores
  const seeded = [...teams]
    .sort((a, b) => b.prestige - a.prestige)
    .slice(0, 8);

  return {
    quarterFinals: [
      { id: 'qf1', home: seeded[0], away: seeded[7] },
      { id: 'qf2', home: seeded[3], away: seeded[4] },
      { id: 'qf3', home: seeded[1], away: seeded[6] },
      { id: 'qf4', home: seeded[2], away: seeded[5] },
    ],
    semiFinals: [
      { id: 'sf1', note: 'Ganador QF1 vs Ganador QF2' },
      { id: 'sf2', note: 'Ganador QF3 vs Ganador QF4' },
    ],
    final: { id: 'fin', note: 'Ganador SF1 vs Ganador SF2' },
  };
}

/**
 * Genera grupos de copa continental (4 grupos de 4 equipos).
 * Acepta dos formatos de entrada:
 *   - Array plano de equipos del backend (cada uno con { leagueId, divisionLevel, prestige })
 *   - Array de ligas estáticas LEAGUES (con { id, divisions: [{ level, teams }] })
 *
 * @param {Array} allLeaguesOrTeams - Equipos planos del backend O array de ligas LEAGUES
 * @param {Array} leagueIds         - IDs de ligas elegidas
 * @param {object} playerTeam       - { id, name, ... } equipo del jugador principal
 * @returns {Array} groups [{ name, teams }]
 */
export function generateContinentalGroups(allLeaguesOrTeams, leagueIds, playerTeam) {
  let pool = [];

  // Detectar formato: si el primer elemento tiene `divisions`, es LEAGUES estático
  if (allLeaguesOrTeams.length > 0 && allLeaguesOrTeams[0]?.divisions) {
    // Formato LEAGUES estático (retrocompatibilidad)
    for (const l of allLeaguesOrTeams) {
      if (!leagueIds.includes(l.id)) continue;
      const div1 = l.divisions.find((d) => d.level === 1);
      if (div1) pool.push(...div1.teams);
    }
  } else {
    // Formato plano del backend: equipos con { leagueId, divisionLevel }
    pool = allLeaguesOrTeams.filter(
      (t) => matchesLeagueSelection(t, leagueIds) && t.divisionLevel === 1
    );
  }

  // Asegura que el equipo del jugador esté en el pool
  if (!pool.find((t) => t.id === playerTeam.id)) {
    pool.unshift(playerTeam);
  }

  const sorted = pool.sort((a, b) => b.prestige - a.prestige).slice(0, 16);

  // Distribuye en 4 grupos
  const groups = [
    { name: 'Grupo A', teams: [] },
    { name: 'Grupo B', teams: [] },
    { name: 'Grupo C', teams: [] },
    { name: 'Grupo D', teams: [] },
  ];

  // El equipo del jugador siempre en el Grupo A
  const playerIdx = sorted.findIndex((t) => t.id === playerTeam.id);
  if (playerIdx !== 0) {
    const tmp = sorted[0];
    sorted[0] = sorted[playerIdx];
    sorted[playerIdx] = tmp;
  }

  sorted.forEach((team, i) => {
    groups[i % 4].teams.push(team);
  });

  return groups;
}
