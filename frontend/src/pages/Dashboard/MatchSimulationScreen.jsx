import { useEffect, useMemo, useRef, useState } from 'react';
import { getActiveParticipant } from '../../utils/saveState';
import {
  applyMatchResultToLeagueSchedules,
  buildLeagueSchedules,
  findLeagueDivisionSchedule,
  getMatchesForRound,
} from '../../utils/leagueSimulation';
import {
  createSimulationEnvelope,
  mergeHalfSimulations,
  simulateMatchHalf,
  summarizeSimulationAtMinute,
} from '../../utils/liveMatchSimulation';
import { buildEffectiveMatchRoster } from '../../utils/tacticalSetup';
import MatchPrepModal from './MatchPrepModal';
import './MatchSimulationScreen.css';

const TICK_MS = 110;

function idsEqual(a, b) {
  return String(a) === String(b);
}

function buildSimulationKey(matchContext) {
  return `${matchContext.leagueId}_${matchContext.divisionLevel}_${matchContext.round}_${matchContext.matchIndex}`;
}

function buildHistoryEntry(matchContext, simulation) {
  return {
    id: `match_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    competition: 'local',
    tournamentName: matchContext.divisionName,
    label: `Fecha ${matchContext.round}`,
    homeTeam: matchContext.match.home,
    awayTeam: matchContext.match.away,
    result: {
      homeGoals: simulation.homeGoals,
      awayGoals: simulation.awayGoals,
      homePenalties: simulation.homePenalties ?? null,
      awayPenalties: simulation.awayPenalties ?? null,
      scorers: simulation.scorers ?? [],
      winner: simulation.winner ?? null,
      decidedBy: simulation.decidedBy ?? 'regular',
    },
  };
}

function nextUnplayedRound(rounds = []) {
  return rounds.find((round) => (round.matches ?? []).some((match) => !match.result))?.round ?? null;
}

function formatClock(status, minute) {
  if (status === 'halftime') return '45\'';
  if (status === 'finished') return '90\'';
  if (status === 'booting') return '--';
  return `${minute}'`;
}

function buildLatestFeed(matchContexts, simulations, minute) {
  return matchContexts
    .flatMap((matchContext) => {
      const simulation = simulations[buildSimulationKey(matchContext)]?.full;
      if (!simulation) return [];

      return (simulation.scorers ?? [])
        .filter((goal) => Number(goal.minute) <= Number(minute))
        .map((goal, index) => {
          const score = summarizeSimulationAtMinute(simulation, goal.minute);
          return {
            id: `${buildSimulationKey(matchContext)}_${goal.playerId}_${goal.minute}_${index}`,
            divisionName: matchContext.divisionName,
            minute: goal.minute,
            text: `${goal.playerName} marcó para ${goal.teamName}`,
            score: `${matchContext.match.home?.name} ${score.homeGoals}-${score.awayGoals} ${matchContext.match.away?.name}`,
          };
        });
    })
    .sort((a, b) => b.minute - a.minute)
    .slice(0, 8);
}

function MatchSimulationScreen({ save, preparation, onApplySave, onExit }) {
  const [lockedSave] = useState(() => save);
  const [lockedPreparation] = useState(() => preparation);

  const player = getActiveParticipant(lockedSave);
  const roundNumber = lockedSave.matchday ?? 1;
  const sourceSchedules = useMemo(
    () => (lockedSave.leagueSchedules?.length
      ? lockedSave.leagueSchedules
      : buildLeagueSchedules(lockedSave.teamPool ?? [], lockedSave.config?.selectedLeagues ?? [])),
    [lockedSave]
  );
  const matchContexts = useMemo(
    () => getMatchesForRound(sourceSchedules, roundNumber).filter(({ match }) => !match.result),
    [roundNumber, sourceSchedules]
  );
  const playerMatchKey = useMemo(() => {
    const playerMatch = matchContexts.find((matchContext) => (
      idsEqual(matchContext.match.home?.id, player?.teamId) || idsEqual(matchContext.match.away?.id, player?.teamId)
    ));
    return playerMatch ? buildSimulationKey(playerMatch) : null;
  }, [matchContexts, player?.teamId]);

  const [status, setStatus] = useState('booting');
  const [error, setError] = useState('');
  const [minute, setMinute] = useState(0);
  const [currentPreparation, setCurrentPreparation] = useState(lockedPreparation);
  const [showHalftimeModal, setShowHalftimeModal] = useState(false);
  const [simulations, setSimulations] = useState({});
  const persistedRef = useRef(false);

  useEffect(() => {
    persistedRef.current = false;
    setError('');

    const initialSimulations = {};
    const initialRoster = buildEffectiveMatchRoster(lockedPreparation, lockedSave.squad ?? []);

    matchContexts.forEach((matchContext) => {
      const key = buildSimulationKey(matchContext);
      const isPlayerMatch = key === playerMatchKey;
      const homePlayers = isPlayerMatch && idsEqual(matchContext.match.home?.id, player?.teamId) ? initialRoster : undefined;
      const awayPlayers = isPlayerMatch && idsEqual(matchContext.match.away?.id, player?.teamId) ? initialRoster : undefined;

      const firstHalf = simulateMatchHalf({
        homeTeam: matchContext.match.home,
        awayTeam: matchContext.match.away,
        homePlayers,
        awayPlayers,
        startMinute: 1,
        endMinute: 45,
      });

      const secondHalf = isPlayerMatch
        ? null
        : simulateMatchHalf({
            homeTeam: matchContext.match.home,
            awayTeam: matchContext.match.away,
            startMinute: 46,
            endMinute: 90,
            isSecondHalf: true,
          });

      const fullResult = mergeHalfSimulations(
        firstHalf,
        secondHalf ?? { homeGoals: 0, awayGoals: 0, scorers: [] },
        matchContext.match.home,
        matchContext.match.away
      );

      initialSimulations[key] = {
        key,
        context: matchContext,
        firstHalf,
        secondHalf,
        full: createSimulationEnvelope(matchContext.match, fullResult),
      };
    });

    setSimulations(initialSimulations);
    setMinute(matchContexts.length ? 1 : 0);
    setShowHalftimeModal(false);
    setStatus(matchContexts.length ? 'first-half' : 'finished');
  }, [lockedPreparation, lockedSave.squad, matchContexts, player?.teamId, playerMatchKey]);

  useEffect(() => {
    if (status !== 'first-half' && status !== 'second-half') return undefined;

    const timer = window.setInterval(() => {
      setMinute((currentMinute) => {
        const nextMinute = currentMinute + 1;

        if (status === 'first-half' && nextMinute >= 45) {
          window.clearInterval(timer);
          setStatus('halftime');
          setShowHalftimeModal(Boolean(playerMatchKey));
          if (!playerMatchKey) {
            window.setTimeout(() => {
              setMinute(46);
              setStatus('second-half');
            }, 0);
          }
          return 45;
        }

        if (status === 'second-half' && nextMinute >= 90) {
          window.clearInterval(timer);
          setStatus('finished');
          return 90;
        }

        return nextMinute;
      });
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, [playerMatchKey, status]);

  useEffect(() => {
    if (status !== 'finished' || persistedRef.current) return;

    try {
      persistedRef.current = true;

      let workingSchedules = sourceSchedules;
      let playerHistoryEntry = null;
      const historyEntries = [];

      matchContexts.forEach((matchContext) => {
        const simulation = simulations[buildSimulationKey(matchContext)]?.full;
        if (!simulation) return;

        const matchPatch = {
          result: {
            homeGoals: simulation.homeGoals,
            awayGoals: simulation.awayGoals,
            homePenalties: simulation.homePenalties ?? null,
            awayPenalties: simulation.awayPenalties ?? null,
          },
          scorers: simulation.scorers ?? [],
          winner: simulation.winner ?? null,
          decidedBy: simulation.decidedBy ?? 'regular',
        };

        workingSchedules = applyMatchResultToLeagueSchedules(workingSchedules, {
          leagueId: matchContext.leagueId,
          divisionLevel: matchContext.divisionLevel,
          round: matchContext.round,
          matchIndex: matchContext.matchIndex,
          matchPatch,
        });

        const historyEntry = buildHistoryEntry(matchContext, simulation);
        historyEntries.push(historyEntry);

        if (idsEqual(matchContext.match.home?.id, player?.teamId) || idsEqual(matchContext.match.away?.id, player?.teamId)) {
          playerHistoryEntry = historyEntry;
        }
      });

      const playerDivisionRounds = findLeagueDivisionSchedule(
        workingSchedules,
        player?.leagueId,
        player?.divisionLevel
      )?.rounds ?? lockedSave.localSchedule ?? [];

      onApplySave({
        leagueSchedules: workingSchedules,
        localSchedule: playerDivisionRounds,
        matchday: nextUnplayedRound(playerDivisionRounds) ?? (roundNumber + 1),
        matchesPlayed: Number(lockedSave.matchesPlayed ?? 0) + historyEntries.length,
        results: [...(lockedSave.results ?? []), ...historyEntries],
        lastMatchResult: playerHistoryEntry ?? historyEntries.at(-1) ?? lockedSave.lastMatchResult,
        matchPreparation: currentPreparation,
      });
    } catch (simulationError) {
      setError(simulationError.message || 'No se pudo cerrar la jornada.');
      setStatus('error');
    }
  }, [currentPreparation, lockedSave.lastMatchResult, lockedSave.localSchedule, lockedSave.matchesPlayed, lockedSave.results, matchContexts, onApplySave, player?.divisionLevel, player?.leagueId, player?.teamId, roundNumber, simulations, sourceSchedules, status]);

  const roundView = useMemo(() => {
    const league = sourceSchedules.find((item) => String(item.id) === String(player?.leagueId));
    if (!league) return null;

    return {
      name: league.name,
      flag: league.flag,
      divisions: (league.divisions ?? []).map((division) => {
        const roundMatches = (division.rounds ?? []).find((round) => Number(round.round) === Number(roundNumber))?.matches ?? [];
        const contextsByIndex = new Map(
          matchContexts
            .filter((matchContext) => (
              String(matchContext.leagueId) === String(league.id)
              && Number(matchContext.divisionLevel) === Number(division.level)
            ))
            .map((matchContext) => [matchContext.matchIndex, matchContext])
        );

        return {
          level: division.level,
          name: division.name,
          matches: roundMatches.map((match, index) => {
            const matchContext = contextsByIndex.get(index);
            const simulation = matchContext ? simulations[buildSimulationKey(matchContext)]?.full : null;
            const summary = simulation ? summarizeSimulationAtMinute(simulation, minute) : null;

            return {
              home: match.home,
              away: match.away,
              display: summary ? `${summary.homeGoals} - ${summary.awayGoals}` : (match.result ? `${match.result.homeGoals} - ${match.result.awayGoals}` : '0 - 0'),
              isPlayerMatch: matchContext ? buildSimulationKey(matchContext) === playerMatchKey : false,
            };
          }),
        };
      }),
    };
  }, [matchContexts, minute, player?.leagueId, playerMatchKey, roundNumber, simulations, sourceSchedules]);

  const latestFeed = useMemo(
    () => buildLatestFeed(matchContexts, simulations, minute),
    [matchContexts, minute, simulations]
  );

  function handleHalftimeConfirm(nextPreparation) {
    const effectivePreparation = nextPreparation ?? currentPreparation;
    setCurrentPreparation(effectivePreparation);
    setShowHalftimeModal(false);

    if (!playerMatchKey) {
      setMinute(46);
      setStatus('second-half');
      return;
    }

    setSimulations((current) => {
      const matchState = current[playerMatchKey];
      if (!matchState) return current;

      const secondHalfRoster = buildEffectiveMatchRoster(effectivePreparation, lockedSave.squad ?? []);
      const secondHalf = simulateMatchHalf({
        homeTeam: matchState.context.match.home,
        awayTeam: matchState.context.match.away,
        homePlayers: idsEqual(matchState.context.match.home?.id, player?.teamId) ? secondHalfRoster : undefined,
        awayPlayers: idsEqual(matchState.context.match.away?.id, player?.teamId) ? secondHalfRoster : undefined,
        startMinute: 46,
        endMinute: 90,
        isSecondHalf: true,
      });

      return {
        ...current,
        [playerMatchKey]: {
          ...matchState,
          secondHalf,
          full: createSimulationEnvelope(
            matchState.context.match,
            mergeHalfSimulations(
              matchState.firstHalf,
              secondHalf,
              matchState.context.match.home,
              matchState.context.match.away
            )
          ),
        },
      };
    });

    setMinute(46);
    setStatus('second-half');
  }

  return (
    <div className="match-sim-screen animate-fade-in">
      <header className="match-sim-screen__header">
        <div>
          <p className="match-sim-screen__eyebrow">Simulación en vivo</p>
          <h1>{roundView?.flag ? `${roundView.flag} ` : ''}{roundView?.name ?? player?.leagueName ?? 'Liga'} · Fecha {roundNumber}</h1>
          <p className="match-sim-screen__status">
            {status === 'first-half' && 'Primer tiempo en juego'}
            {status === 'halftime' && 'Entretiempo'}
            {status === 'second-half' && 'Segundo tiempo en juego'}
            {status === 'finished' && 'Jornada finalizada'}
            {status === 'booting' && 'Preparando simulación...'}
            {status === 'error' && 'La simulación se detuvo con un error'}
          </p>
        </div>
        <div className="match-sim-screen__clock-card">
          <strong>{formatClock(status, minute)}</strong>
          <span>
            {status === 'first-half' || status === 'second-half'
              ? 'Tiempo del partido'
              : 'Estado de la jornada'}
          </span>
        </div>
      </header>

      <main className="match-sim-screen__body">
        <section className="match-sim-screen__board">
          {(roundView?.divisions ?? []).map((division) => (
            <article key={division.level} className="match-sim-screen__division">
              <header>
                <span>División {division.level}</span>
                <h2>{division.name}</h2>
              </header>

              <div className="match-sim-screen__matches">
                {division.matches.map((match, index) => (
                  <div
                    key={`${division.level}-${index}`}
                    className={[
                      'match-sim-screen__match-row',
                      match.isPlayerMatch ? 'match-sim-screen__match-row--focus' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <span className="match-sim-screen__team">{match.home?.name}</span>
                    <strong className="match-sim-screen__score">{match.display}</strong>
                    <span className="match-sim-screen__team match-sim-screen__team--right">{match.away?.name}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <aside className="match-sim-screen__feed">
          <div className="match-sim-screen__feed-card">
            <h3>Incidencias</h3>
            <div className="match-sim-screen__feed-list">
              {latestFeed.length > 0 ? latestFeed.map((item) => (
                <div key={item.id} className="match-sim-screen__feed-item">
                  <span>{item.minute}' · {item.divisionName}</span>
                  <strong>{item.text}</strong>
                  <em>{item.score}</em>
                </div>
              )) : (
                <p className="match-sim-screen__empty">Aún no hubo goles en la jornada.</p>
              )}
            </div>
          </div>

          {error && <p className="match-sim-screen__error">{error}</p>}

          {(status === 'finished' || status === 'error') && (
            <button type="button" className="match-sim-screen__exit" onClick={onExit}>
              Volver al dashboard
            </button>
          )}
        </aside>
      </main>

      <MatchPrepModal
        isOpen={showHalftimeModal}
        squad={lockedSave.squad ?? []}
        previousSetup={currentPreparation}
        nextMatch={{
          homeTeam: matchContexts.find((matchContext) => buildSimulationKey(matchContext) === playerMatchKey)?.match.home,
          awayTeam: matchContexts.find((matchContext) => buildSimulationKey(matchContext) === playerMatchKey)?.match.away,
          matchday: roundNumber,
          tournamentName: player?.leagueName ?? 'Liga',
        }}
        onClose={() => handleHalftimeConfirm(currentPreparation)}
        onConfirm={handleHalftimeConfirm}
        title="Entretiempo"
        confirmLabel="Comenzar segundo tiempo"
      />
    </div>
  );
}

export default MatchSimulationScreen;