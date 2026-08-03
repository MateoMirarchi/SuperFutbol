import { COMPETITIONS } from '../data/competitions';
import { getActiveParticipant } from './saveState';

export function idsEqual(a, b) {
  return String(a) === String(b);
}

function findPlayerMatch(round, teamId) {
  return round?.matches?.find(
    (match) => idsEqual(match.home?.id, teamId) || idsEqual(match.away?.id, teamId)
  ) ?? null;
}

function uniqueTeamsFromRounds(rounds = []) {
  const teams = [];
  const seen = new Set();
  for (const round of rounds) {
    for (const match of round.matches ?? []) {
      for (const team of [match.home, match.away]) {
        if (!team?.id) continue;
        if (seen.has(String(team.id))) continue;
        seen.add(String(team.id));
        teams.push(team);
      }
    }
  }
  return teams;
}

function cupRoundName(shortName) {
  return {
    R32: 'Copa Local · 16avos de Final',
    R16: 'Copa Local · Ronda de 16',
    QF: 'Copa Local · Cuartos',
    SF: 'Copa Local · Semifinal',
    FIN: 'Copa Local · Final',
  }[shortName] ?? 'Copa Local';
}

export function findNextMatch(save) {
  const player = getActiveParticipant(save);
  if (!player?.teamId) return null;

  const annualCalendar = (save.annualCalendar?.length
    ? save.annualCalendar
    : (save.localSchedule ?? []).map((round) => ({ competition: 'local', round: round.round }))
  );
  const playerGroup = save.continentalGroups?.find((group) =>
    group.teams?.some((team) => idsEqual(team.id, player.teamId))
  );

  for (const event of annualCalendar) {
    if (event.competition === 'local') {
      const round = save.localSchedule?.find((item) => item.round === event.round);
      const match = findPlayerMatch(round, player.teamId);
      if (match && !match.result) {
        const rival = idsEqual(match.home?.id, player.teamId) ? match.away : match.home;
        return {
          competition: 'local',
          round: event.round,
          label: `Fecha ${event.round}`,
          tournamentName: player.divisionName ?? 'Torneo Local',
          isHome: idsEqual(match.home?.id, player.teamId),
          rival: rival?.name ?? 'Por definir',
          rivalPrestige: rival?.prestige ?? 70,
          homeTeam: match.home,
          awayTeam: match.away,
          matchRef: { round: event.round, competition: 'local' },
        };
      }
    }

    if (event.competition === 'cup') {
      const round = save.cupBracket?.rounds?.find((item) => item.shortName.toLowerCase() === event.cupRound);
      const match = round?.matches?.find(
        (item) =>
          !item.result &&
          (idsEqual(item.home?.id, player.teamId) || idsEqual(item.away?.id, player.teamId))
      );
      if (match) {
        const rival = idsEqual(match.home?.id, player.teamId) ? match.away : match.home;
        return {
          competition: 'cup',
          cupRound: round.shortName,
          label: round.name,
          tournamentName: cupRoundName(round.shortName),
          isHome: idsEqual(match.home?.id, player.teamId),
          rival: rival?.name ?? 'Por definir',
          rivalPrestige: rival?.prestige ?? 70,
          homeTeam: match.home,
          awayTeam: match.away,
          matchId: match.id,
          matchRef: { competition: 'cup', roundShortName: round.shortName, matchId: match.id },
        };
      }
    }

    if (event.competition === 'continental') {
      const round = playerGroup?.rounds?.find((item) => item.round === event.contRound);
      const match = findPlayerMatch(round, player.teamId);
      if (match && !match.result) {
        const rival = idsEqual(match.home?.id, player.teamId) ? match.away : match.home;
        const compId = save.config?.selectedCompetitions?.[0] ?? '';
        const comp = COMPETITIONS.find((item) => item.id === compId);
        return {
          competition: 'continental',
          contRound: event.contRound,
          label: `Fecha ${event.contRound}`,
          tournamentName: comp?.name ?? 'Copa Continental',
          isHome: idsEqual(match.home?.id, player.teamId),
          rival: rival?.name ?? 'Por definir',
          rivalPrestige: rival?.prestige ?? 70,
          homeTeam: match.home,
          awayTeam: match.away,
          groupName: playerGroup?.groupName ?? '',
          matchRef: { competition: 'continental', round: event.contRound },
        };
      }
    }
  }

  return null;
}

function replaceMatch(rounds, roundNumber, teamId, patch) {
  return (rounds ?? []).map((round) => {
    if (round.round !== roundNumber) return round;
    return {
      ...round,
      matches: (round.matches ?? []).map((match) => {
        const isTarget = idsEqual(match.home?.id, teamId) || idsEqual(match.away?.id, teamId);
        return isTarget ? { ...match, ...patch } : match;
      }),
    };
  });
}

function advanceCupWinners(bracket) {
  if (!bracket?.rounds?.length) return bracket;

  const winners = new Map();
  for (const round of bracket.rounds) {
    for (const match of round.matches ?? []) {
      if (match.winner?.id) winners.set(match.id, match.winner);
    }
  }

  return {
    ...bracket,
    rounds: bracket.rounds.map((round, index) => {
      if (index === 0) return round;
      return {
        ...round,
        matches: (round.matches ?? []).map((match) => {
          const home = winners.get(match.fromA) ?? match.home ?? null;
          const away = winners.get(match.fromB) ?? match.away ?? null;
          return {
            ...match,
            home,
            away,
          };
        }),
      };
    }),
  };
}

function nextUnplayedRound(rounds, teamId) {
  return (rounds ?? []).find((round) => {
    const match = findPlayerMatch(round, teamId);
    return match && !match.result;
  })?.round ?? null;
}

function buildHistoryEntry(save, nextMatch, simulation) {
  return {
    id: `match_${Date.now()}`,
    createdAt: new Date().toISOString(),
    competition: nextMatch.competition,
    tournamentName: nextMatch.tournamentName,
    label: nextMatch.label,
    homeTeam: nextMatch.homeTeam,
    awayTeam: nextMatch.awayTeam,
    result: simulation.match,
  };
}

export function applySimulationToSave(save, nextMatch, simulation) {
  const playerTeamId = getActiveParticipant(save)?.teamId;
  const matchPatch = {
    result: {
      homeGoals: simulation.match.homeGoals,
      awayGoals: simulation.match.awayGoals,
      homePenalties: simulation.match.homePenalties,
      awayPenalties: simulation.match.awayPenalties,
    },
    scorers: simulation.match.scorers,
    winner: simulation.match.winner,
    decidedBy: simulation.match.decidedBy,
  };

  let localSchedule = save.localSchedule ?? [];
  let continentalGroups = save.continentalGroups ?? [];
  let continentalSchedule = save.continentalSchedule ?? [];
  let cupBracket = save.cupBracket ?? null;

  if (nextMatch.competition === 'local') {
    localSchedule = replaceMatch(localSchedule, nextMatch.round, playerTeamId, matchPatch);
  }

  if (nextMatch.competition === 'continental') {
    continentalGroups = continentalGroups.map((group) => {
      const isPlayerGroup = group.teams?.some((team) => idsEqual(team.id, playerTeamId));
      if (!isPlayerGroup) return group;
      return {
        ...group,
        rounds: replaceMatch(group.rounds, nextMatch.contRound, playerTeamId, matchPatch),
      };
    });
    continentalSchedule = continentalGroups.find((group) =>
      group.teams?.some((team) => idsEqual(team.id, playerTeamId))
    )?.rounds ?? continentalSchedule;
  }

  if (nextMatch.competition === 'cup' && cupBracket) {
    cupBracket = {
      ...cupBracket,
      rounds: cupBracket.rounds.map((round) => {
        if (round.shortName !== nextMatch.cupRound) return round;
        return {
          ...round,
          matches: (round.matches ?? []).map((match) =>
            match.id === nextMatch.matchId ? { ...match, ...matchPatch } : match
          ),
        };
      }),
    };
    cupBracket = advanceCupWinners(cupBracket);
  }

  const historyEntry = buildHistoryEntry(save, nextMatch, simulation);
  return {
    localSchedule,
    continentalGroups,
    continentalSchedule,
    cupBracket,
    matchday: nextUnplayedRound(localSchedule, playerTeamId) ?? save.matchday,
    continentalRound: nextUnplayedRound(continentalSchedule, playerTeamId) ?? save.continentalRound,
    matchesPlayed: Number(save.matchesPlayed ?? 0) + 1,
    results: [...(save.results ?? []), historyEntry],
    lastMatchResult: historyEntry,
  };
}

export function buildStandingsTable(teams = [], rounds = []) {
  const map = new Map(
    teams.map((team) => [String(team.id), {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
    }])
  );

  for (const round of rounds) {
    for (const match of round.matches ?? []) {
      if (!match.result) continue;
      const homeRow = map.get(String(match.home?.id));
      const awayRow = map.get(String(match.away?.id));
      if (!homeRow || !awayRow) continue;

      const homeGoals = Number(match.result.homeGoals ?? 0);
      const awayGoals = Number(match.result.awayGoals ?? 0);

      homeRow.played += 1;
      awayRow.played += 1;
      homeRow.gf += homeGoals;
      homeRow.ga += awayGoals;
      awayRow.gf += awayGoals;
      awayRow.ga += homeGoals;

      if (homeGoals > awayGoals) {
        homeRow.won += 1;
        awayRow.lost += 1;
        homeRow.points += 3;
      } else if (awayGoals > homeGoals) {
        awayRow.won += 1;
        homeRow.lost += 1;
        awayRow.points += 3;
      } else {
        homeRow.drawn += 1;
        awayRow.drawn += 1;
        homeRow.points += 1;
        awayRow.points += 1;
      }

      homeRow.gd = homeRow.gf - homeRow.ga;
      awayRow.gd = awayRow.gf - awayRow.ga;
    }
  }

  return [...map.values()]
    .sort((a, b) => (
      b.points - a.points ||
      b.gd - a.gd ||
      b.gf - a.gf ||
      Number(b.team.prestige ?? 0) - Number(a.team.prestige ?? 0) ||
      a.team.name.localeCompare(b.team.name)
    ))
    .map((row, index) => ({ ...row, pos: index + 1 }));
}

export function getLocalDivisionTeams(save) {
  return uniqueTeamsFromRounds(save?.localSchedule ?? []);
}

export function summarizeSimulationAtMinute(simulation, minute) {
  const scorers = (simulation?.scorers ?? []).filter((goal) => Number(goal.minute) <= Number(minute));
  let homeGoals = 0;
  let awayGoals = 0;

  scorers.forEach((goal) => {
    if (idsEqual(goal.teamId, simulation?.homeTeam?.id)) homeGoals += 1;
    if (idsEqual(goal.teamId, simulation?.awayTeam?.id)) awayGoals += 1;
  });

  return {
    homeGoals,
    awayGoals,
    scorers,
  };
}