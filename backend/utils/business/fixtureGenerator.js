/**
 * utils/business/fixtureGenerator.js
 * Generacion de fixtures/torneos en backend.
 */

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateLeagueFixture(teams = []) {
  const list = [...teams];

  if (list.length % 2 !== 0) {
    list.push({ id: 'bye', name: 'Libre', prestige: 0 });
  }

  const n = list.length;
  const half = n / 2;
  const fixed = list[0];
  const rotating = list.slice(1);
  const firstHalf = [];

  for (let r = 0; r < n - 1; r += 1) {
    const matches = [];

    if (fixed.id !== 'bye' && rotating[0].id !== 'bye') {
      matches.push(
        r % 2 === 0
          ? { home: fixed, away: rotating[0], result: null }
          : { home: rotating[0], away: fixed, result: null }
      );
    }

    for (let i = 1; i < half; i += 1) {
      const h = rotating[i];
      const a = rotating[n - 1 - i];
      if (h.id !== 'bye' && a.id !== 'bye') {
        matches.push({ home: h, away: a, result: null });
      }
    }

    firstHalf.push({ round: r + 1, matches });
    rotating.unshift(rotating.pop());
  }

  const secondHalf = firstHalf.map((fd, i) => ({
    round: n - 1 + i + 1,
    matches: fd.matches.map((m) => ({ home: m.away, away: m.home, result: null })),
  }));

  return [...firstHalf, ...secondHalf];
}

function generateCupBracket16(league, _playerTeamId) {
  function sortedDivisionTeams(level) {
    const division = league?.divisions?.find((item) => Number(item.level) === Number(level));
    return [...(division?.teams ?? [])]
      .sort((a, b) => Number(b.prestige ?? 0) - Number(a.prestige ?? 0));
  }

  const division1 = sortedDivisionTeams(1);
  const division2 = sortedDivisionTeams(2);
  const division3 = sortedDivisionTeams(3);
  const division4Top2 = sortedDivisionTeams(4).slice(0, 2);

  // Regla Copa Argentina: todos los de 1ra, 2da, 3ra y los 2 primeros de 4ta.
  const selected = [...division1, ...division2, ...division3, ...division4Top2];

  // Respaldo: si por datos incompletos no hay 32, completar con mejores restantes.
  const selectedIds = new Set(selected.map((team) => String(team.id)));
  const remaining = [...sortedDivisionTeams(4)].filter((team) => !selectedIds.has(String(team.id)));
  while (selected.length < 32 && remaining.length > 0) {
    selected.push(remaining.shift());
  }

  const seeded = selected.slice(0, 32);
  const shuffled = shuffleArray(seeded);

  const r32Matches = Array.from({ length: 16 }, (_, index) => ({
    id: `r32-${index + 1}`,
    home: shuffled[index * 2] ?? null,
    away: shuffled[index * 2 + 1] ?? null,
    result: null,
    winner: null,
  }));

  const r16Matches = Array.from({ length: 8 }, (_, index) => ({
    id: `r16-${index + 1}`,
    home: null,
    away: null,
    result: null,
    winner: null,
    fromA: `r32-${index * 2 + 1}`,
    fromB: `r32-${index * 2 + 2}`,
  }));

  const qfMatches = Array.from({ length: 4 }, (_, index) => ({
    id: `qf-${index + 1}`,
    home: null,
    away: null,
    result: null,
    winner: null,
    fromA: `r16-${index * 2 + 1}`,
    fromB: `r16-${index * 2 + 2}`,
  }));

  const sfMatches = Array.from({ length: 2 }, (_, index) => ({
    id: `sf-${index + 1}`,
    home: null,
    away: null,
    result: null,
    winner: null,
    fromA: `qf-${index * 2 + 1}`,
    fromB: `qf-${index * 2 + 2}`,
  }));

  const finalMatch = [
    { id: 'fin', home: null, away: null, result: null, winner: null, fromA: 'sf-1', fromB: 'sf-2' },
  ];

  return {
    rounds: [
      { name: '16avos de Final', shortName: 'R32', matches: r32Matches },
      { name: 'Octavos de Final', shortName: 'R16', matches: r16Matches },
      { name: 'Cuartos de Final', shortName: 'QF', matches: qfMatches },
      { name: 'Semifinales', shortName: 'SF', matches: sfMatches },
      { name: 'Final', shortName: 'FIN', matches: finalMatch },
    ],
  };
}

function generateGroupStageFixtures(groups = []) {
  return groups.map((group) => ({
    groupName: group.name,
    teams: group.teams,
    rounds: generateLeagueFixture(group.teams),
  }));
}

function buildAnnualCalendar(localRounds = [], continentalGroups, hasCup = true) {
  const calendar = [];
  const contAfterLocal = new Set([3, 6, 9, 12, 15, 18]);
  const cupAfterLocal = new Map([[2, 'r32'], [5, 'r16'], [8, 'qf'], [12, 'sf'], [16, 'fin']]);
  let contRoundIdx = 1;

  for (const localRound of localRounds) {
    calendar.push({
      week: calendar.length + 1,
      competition: 'local',
      round: localRound.round,
    });

    const afterThis = localRound.round;

    if (hasCup && cupAfterLocal.has(afterThis)) {
      calendar.push({
        week: calendar.length + 1,
        competition: 'cup',
        cupRound: cupAfterLocal.get(afterThis),
      });
    }

    if (continentalGroups && contAfterLocal.has(afterThis) && contRoundIdx <= 6) {
      calendar.push({
        week: calendar.length + 1,
        competition: 'continental',
        contRound: contRoundIdx,
      });
      contRoundIdx += 1;
    }
  }

  return calendar;
}

module.exports = {
  shuffleArray,
  generateLeagueFixture,
  generateCupBracket16,
  generateGroupStageFixtures,
  buildAnnualCalendar,
};
