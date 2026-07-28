import './MatchRound.css';

/**
 * MatchRound
 * Lista de fechas de un torneo con todos sus partidos.
 * Resalta la fecha actual y los partidos del equipo del jugador.
 *
 * @param {Array<{round, matches}>}  rounds        - Todas las fechas del torneo
 * @param {string}                   playerTeamId  - ID del equipo del jugador
 * @param {number}                   currentRound  - Fecha actual (resaltada)
 */
function MatchRound({ rounds = [], playerTeamId, currentRound }) {
  if (!rounds.length) {
    return (
      <p className="match-round-empty">
        El calendario a\u00FAn no fue generado. Us\u00E1 el bot\u00F3n &quot;Generar calendario&quot;.
      </p>
    );
  }

  return (
    <div className="match-round-list">
      {rounds.map((rnd) => {
        const isCurrent = rnd.round === currentRound;
        return (
          <div
            key={rnd.round}
            className={`match-round ${isCurrent ? 'match-round--current' : ''}`}
          >
            {/* Cabecera de la fecha */}
            <div className="match-round__header">
              <span className="match-round__label">Fecha {rnd.round}</span>
              {isCurrent && (
                <span className="match-round__badge">En juego</span>
              )}
            </div>

            {/* Lista de partidos */}
            <div className="match-round__matches">
              {rnd.matches.map((m, i) => {
                const isPlayer =
                  m.home?.id === playerTeamId || m.away?.id === playerTeamId;
                const hasResult =
                  m.result !== null && m.result !== undefined;

                return (
                  <div
                    key={i}
                    className={`match-row${isPlayer ? ' match-row--player' : ''}${hasResult ? ' match-row--played' : ''}`}
                  >
                    <span className="match-row__team match-row__team--home">
                      {m.home?.name ?? '\u2014'}
                    </span>

                    {hasResult ? (
                      <span className="match-row__score">
                        {m.result.homeGoals}&nbsp;-&nbsp;{m.result.awayGoals}
                      </span>
                    ) : (
                      <span className="match-row__vs">vs</span>
                    )}

                    <span className="match-row__team match-row__team--away">
                      {m.away?.name ?? '\u2014'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MatchRound;
