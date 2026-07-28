import { LEAGUES } from '../data/leagues';
import { generateLeagueFixture } from './fixtureGenerator';
import { buildLeagueCatalog } from './leagueCatalog';

function cloneRounds(rounds = []) {
  return rounds.map((round) => ({
    ...round,
    matches: (round.matches ?? []).map((match) => ({ ...match })),
  }));
}

function cloneDivisions(divisions = []) {
  return divisions.map((division) => ({
    ...division,
    teams: [...(division.teams ?? [])],
    rounds: cloneRounds(division.rounds ?? []),
  }));
}

export function buildLeagueSchedules(teamPool = [], selectedLeagueIds = []) {
  const leagues = teamPool.length > 0
    ? buildLeagueCatalog(teamPool, selectedLeagueIds)
    : LEAGUES.filter((league) => !selectedLeagueIds.length || selectedLeagueIds.includes(league.id));

  return leagues.map((league) => ({
    id: league.id,
    name: league.name,
    flag: league.flag ?? '',
    divisions: (league.divisions ?? []).map((division) => ({
      level: division.level,
      name: division.name,
      teams: [...(division.teams ?? [])],
      rounds: cloneRounds(generateLeagueFixture(division.teams ?? [])),
    })),
  }));
}

export function findLeagueDivisionSchedule(leagueSchedules = [], leagueId, divisionLevel) {
  const league = leagueSchedules.find((item) => String(item.id) === String(leagueId));
  return league?.divisions?.find((division) => Number(division.level) === Number(divisionLevel)) ?? null;
}

export function getMatchesForRound(leagueSchedules = [], roundNumber) {
  const matches = [];

  for (const league of leagueSchedules) {
    for (const division of league.divisions ?? []) {
      const round = (division.rounds ?? []).find((item) => Number(item.round) === Number(roundNumber));
      if (!round) continue;

      (round.matches ?? []).forEach((match, matchIndex) => {
        matches.push({
          leagueId: league.id,
          leagueName: league.name,
          divisionLevel: division.level,
          divisionName: division.name,
          round: round.round,
          matchIndex,
          match,
        });
      });
    }
  }

  return matches;
}

export function applyMatchResultToLeagueSchedules(
  leagueSchedules = [],
  { leagueId, divisionLevel, round, matchIndex, matchPatch }
) {
  return leagueSchedules.map((league) => {
    if (String(league.id) !== String(leagueId)) return league;

    return {
      ...league,
      divisions: cloneDivisions(league.divisions).map((division) => {
        if (Number(division.level) !== Number(divisionLevel)) return division;

        return {
          ...division,
          rounds: (division.rounds ?? []).map((item) => {
            if (Number(item.round) !== Number(round)) return item;

            return {
              ...item,
              matches: (item.matches ?? []).map((match, index) => (
                index === matchIndex ? { ...match, ...matchPatch } : match
              )),
            };
          }),
        };
      }),
    };
  });
}

export function buildLeagueRoundSnapshot(leagueSchedules = [], leagueId, roundNumber) {
  const league = leagueSchedules.find((item) => String(item.id) === String(leagueId));
  if (!league) return null;

  return {
    id: league.id,
    name: league.name,
    flag: league.flag ?? '',
    round: roundNumber,
    divisions: (league.divisions ?? []).map((division) => ({
      level: division.level,
      name: division.name,
      matches: (division.rounds ?? []).find((item) => Number(item.round) === Number(roundNumber))?.matches ?? [],
    })),
  };
}