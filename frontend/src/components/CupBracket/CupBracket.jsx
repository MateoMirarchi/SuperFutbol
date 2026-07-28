import './CupBracket.css';

/**
 * CupBracket
 * Muestra el cuadro de copa en formato bracket horizontal.
 * Cada columna es una ronda; las filas son los partidos de esa ronda.
 *
 * @param {object}  bracket       - { rounds: [{name, shortName, matches}] }
 * @param {string}  playerTeamId  - ID del equipo del jugador (para resaltado)
 */
function CupBracket({ bracket, playerTeamId }) {
  if (!bracket?.rounds?.length) {
    return (
      <p className="bracket-empty">
        El cuadro de copa a\u00FAn no fue generado.
        Us\u00E1 el bot\u00F3n &quot;Generar calendario&quot;.
      </p>
    );
  }

  return (
    <div className="cup-bracket">
      {bracket.rounds.map((round, ri) => (
        <div key={round.shortName} className="bracket-col">
          {/* Nombre de la ronda */}
          <div className="bracket-col__name">{round.name}</div>

          {/* Partidos de la ronda */}
          <div className="bracket-col__matches">
            {round.matches.map((m) => {
              const isPending = !m.home && !m.away;
              const isPlayer  =
                !isPending &&
                (m.home?.id === playerTeamId || m.away?.id === playerTeamId);

              return (
                <div
                  key={m.id}
                  className={`bracket-match${isPlayer ? ' bracket-match--player' : ''}${isPending ? ' bracket-match--pending' : ''}`}
                >
                  {isPending ? (
                    <span className="bracket-match__tbd">Por definirse</span>
                  ) : (
                    <>
                      {/* Equipo local */}
                      <div
                        className={`bracket-team${m.winner?.id === m.home?.id ? ' bracket-team--winner' : ''}`}
                      >
                        <span className="bracket-team__name">
                          {m.home?.name ?? '\u2014'}
                        </span>
                        {m.result && (
                          <span className="bracket-team__score">
                            {m.result.homeGoals}
                          </span>
                        )}
                      </div>

                      {/* Separador */}
                      <div className="bracket-match__sep">
                        {m.result ? '' : 'vs'}
                      </div>

                      {/* Equipo visitante */}
                      <div
                        className={`bracket-team${m.winner?.id === m.away?.id ? ' bracket-team--winner' : ''}`}
                      >
                        <span className="bracket-team__name">
                          {m.away?.name ?? '\u2014'}
                        </span>
                        {m.result && (
                          <span className="bracket-team__score">
                            {m.result.awayGoals}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Conector visual entre rondas */}
          {ri < bracket.rounds.length - 1 && (
            <div className="bracket-col__connector" aria-hidden="true">
              {'\u276F'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default CupBracket;
