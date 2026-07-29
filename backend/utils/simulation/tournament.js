/**
 * utils/simulation/tournament.js
 * Actualizacion de estado de torneos a partir del resultado.
 */

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

module.exports = {
  buildTournamentUpdate,
};
