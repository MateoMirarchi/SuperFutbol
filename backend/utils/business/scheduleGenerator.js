/**
 * utils/business/scheduleGenerator.js
 * Generadores de calendario/continental para backend.
 */

const { matchesLeagueSelection } = require('./leagueCatalog');

function generateLeagueSchedule(teams = []) {
  const list = [...teams];

  if (list.length % 2 !== 0) {
    list.push({ id: 'bye', name: 'Libre' });
  }

  const size = list.length;
  const half = size / 2;
  const fixed = list[0];
  const rotating = list.slice(1);

  const firstHalf = [];

  for (let r = 0; r < size - 1; r += 1) {
    const matches = [];

    if (fixed.id !== 'bye' && rotating[0].id !== 'bye') {
      matches.push(
        r % 2 === 0
          ? { home: fixed, away: rotating[0] }
          : { home: rotating[0], away: fixed }
      );
    }

    for (let i = 1; i < half; i += 1) {
      const h = rotating[i];
      const a = rotating[size - 1 - i];
      if (h.id !== 'bye' && a.id !== 'bye') {
        matches.push({ home: h, away: a });
      }
    }

    firstHalf.push({ round: r + 1, matches });
    rotating.unshift(rotating.pop());
  }

  const secondHalf = firstHalf.map((fd, i) => ({
    round: size - 1 + i + 1,
    matches: fd.matches.map((m) => ({ home: m.away, away: m.home })),
  }));

  return [...firstHalf, ...secondHalf];
}

function generateCupBracket(teams = []) {
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

function generateContinentalGroups(allLeaguesOrTeams = [], leagueIds = [], playerTeam, legacyLeagues = []) {
  let pool = [];

  if (allLeaguesOrTeams.length > 0 && allLeaguesOrTeams[0]?.divisions) {
    for (const l of allLeaguesOrTeams) {
      if (!leagueIds.includes(l.id)) continue;
      const div1 = l.divisions.find((d) => d.level === 1);
      if (div1) pool.push(...div1.teams);
    }
  } else {
    pool = allLeaguesOrTeams.filter(
      (t) => matchesLeagueSelection(t, leagueIds, legacyLeagues) && t.divisionLevel === 1
    );
  }

  if (!pool.find((t) => t.id === playerTeam.id)) {
    pool.unshift(playerTeam);
  }

  const sorted = pool.sort((a, b) => b.prestige - a.prestige).slice(0, 16);

  const groups = [
    { name: 'Grupo A', teams: [] },
    { name: 'Grupo B', teams: [] },
    { name: 'Grupo C', teams: [] },
    { name: 'Grupo D', teams: [] },
  ];

  const playerIdx = sorted.findIndex((t) => t.id === playerTeam.id);
  if (playerIdx > 0) {
    const tmp = sorted[0];
    sorted[0] = sorted[playerIdx];
    sorted[playerIdx] = tmp;
  }

  sorted.forEach((team, i) => {
    groups[i % 4].teams.push(team);
  });

  return groups;
}

module.exports = {
  generateLeagueSchedule,
  generateCupBracket,
  generateContinentalGroups,
};
