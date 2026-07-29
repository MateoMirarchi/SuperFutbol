/**
 * utils/business/leagueCatalog.js
 * Adaptado para backend: normalizacion y catalogacion de ligas/divisiones.
 */

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function findLegacyLeague(input, legacyLeagues = []) {
  const leagueName = normalizeText(typeof input === 'string' ? input : input?.leagueName);
  if (!leagueName) return null;

  return legacyLeagues.find((league) => {
    const candidates = [league.id, league.name, league.country].map(normalizeText);
    return candidates.some((candidate) =>
      candidate === leagueName || candidate.includes(leagueName) || leagueName.includes(candidate)
    );
  }) ?? null;
}

function matchesLeagueSelection(team, leagueIds = [], legacyLeagues = []) {
  if (!leagueIds?.length) return true;

  const normalizedLeagueIds = leagueIds.map(String);
  const teamLeagueId = String(team?.leagueId ?? '');
  if (normalizedLeagueIds.includes(teamLeagueId)) return true;

  const legacyLeague = findLegacyLeague(team, legacyLeagues);
  return legacyLeague ? normalizedLeagueIds.includes(String(legacyLeague.id)) : false;
}

function buildLeagueCatalog(teams = [], leagueIds, legacyLeagues = []) {
  const filtered = leagueIds?.length
    ? teams.filter((team) => matchesLeagueSelection(team, leagueIds, legacyLeagues))
    : teams;

  const leagueMap = {};
  for (const team of filtered) {
    if (!team?.id || team.leagueId === undefined || team.leagueId === null) continue;

    const legacyLeague = findLegacyLeague(team, legacyLeagues);
    if (!leagueMap[team.leagueId]) {
      leagueMap[team.leagueId] = {
        id: team.leagueId,
        name: team.leagueName ?? legacyLeague?.country ?? String(team.leagueId),
        flag: team.leagueFlag ?? legacyLeague?.flag ?? '',
        legacyId: legacyLeague?.id ?? null,
        divisionsMap: {},
      };
    }

    const divisionsMap = leagueMap[team.leagueId].divisionsMap;
    if (!divisionsMap[team.divisionLevel]) {
      divisionsMap[team.divisionLevel] = {
        level: team.divisionLevel,
        name: team.divisionName ?? `Division ${team.divisionLevel}`,
        teams: [],
      };
    }

    divisionsMap[team.divisionLevel].teams.push(team);
  }

  return Object.values(leagueMap)
    .map(({ divisionsMap, ...league }) => ({
      ...league,
      divisions: Object.values(divisionsMap)
        .map((division) => ({
          ...division,
          teams: [...division.teams].sort(
            (a, b) => Number(b.prestige ?? 0) - Number(a.prestige ?? 0) || a.name.localeCompare(b.name)
          ),
        }))
        .sort((a, b) => a.level - b.level),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

module.exports = {
  normalizeText,
  findLegacyLeague,
  matchesLeagueSelection,
  buildLeagueCatalog,
};
