/**
 * TeamSelection.jsx
 * Paso 2 de la nueva partida.
 * Obtiene equipos desde el backend (reemplaza datos hardcodeados de leagues.js).
 * Recorre cada jugador uno a uno solicitando nombre y equipo.
 * Después del último jugador, pide el nombre de la partida.
 * Al confirmar llama a onConfirm(players[], gameName, allTeams[]).
 */

import { useEffect, useState } from 'react';
import Button from '../../components/Button/Button';
import Select from '../../components/Select/Select';
import useLeagueTeams from '../../hooks/useLeagueTeams';
import { prestigeClass } from '../../utils/gameHelpers';
import './TeamSelection.css';

/** Presupuesto inicial según el prestige del equipo elegido */
function calcInitialBudget(prestige) {
  if (prestige >= 85) return 30_000_000;
  if (prestige >= 70) return 20_000_000;
  if (prestige >= 55) return 12_000_000;
  if (prestige >= 40) return 6_000_000;
  return 3_000_000;
}

function TeamSelection({ gameConfig, onConfirm, onBack }) {
  const { playerCount, selectedLeagues } = gameConfig;

  // Equipos reales desde el backend
  const {
    teams: allTeams,
    loading,
    error,
    getTeamsByLeagueAndDivision,
    getDivisionOptions,
    getLeaguesList,
  } = useLeagueTeams();

  // 'selecting' → cada jugador elige su equipo
  // 'naming'    → ingresar nombre de la partida
  const [step, setStep] = useState('selecting');

  // Índice del jugador que está eligiendo ahora (0-based)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  // Jugadores ya confirmados
  const [confirmedPlayers, setConfirmedPlayers] = useState([]);
  // Todos los jugadores listos (usado al pasar al paso de naming)
  const [allPlayers, setAllPlayers] = useState([]);

  // Nombre de la partida
  const [gameName, setGameName] = useState('Mi Partida');

  // ── Estado de la selección del jugador actual ──
  const [playerName, setPlayerName] = useState('');
  const [selectedLeagueId, setSelectedLeagueId] = useState('');
  const [selectedDivision, setSelectedDivision] = useState(1);
  const [chosenTeam, setChosenTeam] = useState(null);

  // Ligas disponibles: solo las que el usuario eligió en NewGame
  const availableLeagues = getLeaguesList(selectedLeagues);

  useEffect(() => {
    if (!availableLeagues.length) {
      setSelectedLeagueId('');
      setSelectedDivision(1);
      setChosenTeam(null);
      return;
    }

    const hasCurrentLeague = availableLeagues.some((league) => String(league.id) === String(selectedLeagueId));
    if (hasCurrentLeague) return;

    const firstLeague = availableLeagues[0];
    setSelectedLeagueId(firstLeague.id);
    setSelectedDivision(firstLeague.divisions?.[0]?.level ?? 1);
    setChosenTeam(null);
  }, [availableLeagues, selectedLeagueId]);

  const leagueOptions = availableLeagues.map((l) => ({
    value: l.id,
    label: `${l.flag} ${l.name}`,
  }));

  const divisionOptions = getDivisionOptions(selectedLeagueId);
  // Equipos de la liga+división actualmente seleccionada
  const teams = getTeamsByLeagueAndDivision(selectedLeagueId, selectedDivision);

  // Un jugador puede confirmar si completó nombre y eligió equipo
  const canConfirm = playerName.trim().length > 0 && chosenTeam !== null;

  function handleLeagueChange(e) {
    const nextLeague = availableLeagues.find((league) => String(league.id) === String(e.target.value));
    setSelectedLeagueId(nextLeague?.id ?? '');
    setSelectedDivision(nextLeague?.divisions?.[0]?.level ?? 1);
    setChosenTeam(null);
  }

  function resetSelectionState() {
    setPlayerName('');
    setSelectedLeagueId(availableLeagues[0]?.id ?? '');
    setSelectedDivision(availableLeagues[0]?.divisions?.[0]?.level ?? 1);
    setChosenTeam(null);
  }

  function handleConfirmPlayer() {
    if (!canConfirm) return;

    const newPlayer = {
      name: playerName.trim(),
      teamId: chosenTeam.id,
      teamName: chosenTeam.name,
      leagueId: chosenTeam.leagueId,
      divisionLevel: selectedDivision,
      city: chosenTeam.city,
      prestige: chosenTeam.prestige,
      budget: calcInitialBudget(chosenTeam.prestige),
    };

    const updatedPlayers = [...confirmedPlayers, newPlayer];

    if (currentPlayerIndex + 1 < playerCount) {
      // Quedan más jugadores: avanzar al siguiente
      setConfirmedPlayers(updatedPlayers);
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      resetSelectionState();
    } else {
      // Último jugador: pedir nombre de partida
      setAllPlayers(updatedPlayers);
      setStep('naming');
    }
  }

  const playerLabel = `Jugador ${currentPlayerIndex + 1}`;
  const isLastPlayer = currentPlayerIndex + 1 === playerCount;

  // ── Paso: nombre de la partida ──────────────────────────────────────────
  if (step === 'naming') {
    return (
      <div className="team-selection animate-fade-in">
        <div className="team-selection__container">
          <header className="team-selection__header">
            <h1 className="team-selection__title">🎮 Nombre de la partida</h1>
            <p className="team-selection__desc">
              Elegí un nombre para identificar esta partida en el listado de guardados.
            </p>
          </header>

          {/* Resumen de jugadores */}
          <div className="team-selection__confirmed">
            <p className="team-selection__confirmed-title">Jugadores confirmados:</p>
            <ul className="team-selection__confirmed-list">
              {allPlayers.map((p, i) => (
                <li key={i} className="team-selection__confirmed-item">
                  <span className="team-selection__confirmed-player">
                    Jugador {i + 1} — <strong>{p.name}</strong>
                  </span>
                  <span className="team-selection__confirmed-team">{p.teamName}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Input de nombre */}
          <div className="team-selection__name-field">
            <label htmlFor="game-name" className="team-selection__name-label">
              Nombre de la partida
            </label>
            <input
              id="game-name"
              type="text"
              className="team-selection__name-input"
              placeholder="Ej: Mi primera temporada…"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              maxLength={60}
              autoComplete="off"
              autoFocus
            />
          </div>

          <footer className="team-selection__footer">
            <button
              className="team-selection__back"
              onClick={() => setStep('selecting')}
            >
              ← Volver
            </button>
            {/* Pasa allTeams al padre para que useGameState genere el calendario con datos reales */}
            <Button
              variant="primary"
              size="lg"
              onClick={() => onConfirm(allPlayers, gameName.trim() || 'Mi Partida', allTeams)}
              disabled={!gameName.trim()}
            >
              ¡Comenzar Partida! →
            </Button>
          </footer>
        </div>
      </div>
    );
  }

  // ── Loading / Error ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="team-selection animate-fade-in">
        <div className="team-selection__container">
          <p className="team-selection__loading">⏳ Cargando equipos desde el servidor…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="team-selection animate-fade-in">
        <div className="team-selection__container">
          <p className="team-selection__error">❌ {error}</p>
          <button className="team-selection__back" onClick={onBack}>← Volver</button>
        </div>
      </div>
    );
  }

  // ── Paso: selección de equipo ───────────────────────────────────────────
  return (
    <div className="team-selection animate-fade-in">
      <div className="team-selection__container">

        {/* Cabecera */}
        <header className="team-selection__header">
          <button className="team-selection__back" onClick={onBack} aria-label="Volver">
            ← Volver
          </button>

          {/* Indicador de progreso cuando hay más de 1 jugador */}
          {playerCount > 1 && (
            <div className="team-selection__progress">
              {Array.from({ length: playerCount }, (_, i) => (
                <span
                  key={i}
                  className={`team-selection__progress-dot ${
                    i < currentPlayerIndex
                      ? 'team-selection__progress-dot--done'
                      : i === currentPlayerIndex
                      ? 'team-selection__progress-dot--active'
                      : ''
                  }`}
                />
              ))}
            </div>
          )}

          <h1 className="team-selection__title">
            {playerCount > 1 ? `${playerLabel}: Elegí tu club` : 'Elegí tu club'}
          </h1>
          <p className="team-selection__desc">
            Ingresá tu nombre y seleccioná la liga, división y equipo.
          </p>
        </header>

        {/* Campo de nombre */}
        <div className="team-selection__name-field">
          <label htmlFor="player-name" className="team-selection__name-label">
            {playerCount > 1 ? `Nombre del ${playerLabel}` : 'Tu nombre'}
          </label>
          <input
            id="player-name"
            type="text"
            className="team-selection__name-input"
            placeholder="Ej: Martín, Luis…"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={40}
            autoComplete="off"
          />
        </div>

        {/* Filtros */}
        <div className="team-selection__filters">
          <Select
            id="league-filter"
            label="Liga"
            value={selectedLeagueId}
            onChange={handleLeagueChange}
            options={leagueOptions}
          />
          <Select
            id="division-filter"
            label="División"
            value={selectedDivision}
            onChange={(e) => {
              setSelectedDivision(Number(e.target.value));
              setChosenTeam(null);
            }}
            options={divisionOptions}
          />
        </div>

        {/* Lista de equipos desde el backend */}
        <div className="team-selection__list">
          {teams.length === 0 ? (
            <p className="team-selection__empty">
              No hay equipos registrados para esta liga y división.
              Pedile al administrador que cargue los equipos desde el gestor.
            </p>
          ) : (
            teams.map((team) => {
            const pClass = prestigeClass(team.prestige);
            const isSelected = chosenTeam?.id === team.id;
            return (
              <button
                key={team.id}
                className={`team-item team-item--${pClass} ${isSelected ? 'team-item--selected' : ''}`}
                onClick={() => setChosenTeam(team)}
                aria-pressed={isSelected}
              >
                <div className="team-item__info">
                  <span className="team-item__name">{team.name}</span>
                  <span className="team-item__city">{team.city}</span>
                </div>
                <div className="team-item__prestige">
                  <span className="team-item__prestige-label">Prestigio</span>
                  <span className="team-item__prestige-value">{team.prestige}</span>
                  <div className="team-item__prestige-bar">
                    <div
                      className="team-item__prestige-fill"
                      style={{ width: `${team.prestige}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })
          )}
        </div>

        {/* Previsualización de la selección actual */}
        {chosenTeam && playerName.trim() && (
          <div className="team-selection__preview animate-fade-in">
            <span className="team-selection__preview-icon">✅</span>
            <span>
              <strong>{playerName.trim()}</strong> → {chosenTeam.name} ({chosenTeam.city})
            </span>
          </div>
        )}

        {/* Resumen de jugadores ya confirmados */}
        {confirmedPlayers.length > 0 && (
          <div className="team-selection__confirmed">
            <p className="team-selection__confirmed-title">Ya elegidos:</p>
            <ul className="team-selection__confirmed-list">
              {confirmedPlayers.map((p, i) => (
                <li key={i} className="team-selection__confirmed-item">
                  <span className="team-selection__confirmed-player">
                    Jugador {i + 1} — <strong>{p.name}</strong>
                  </span>
                  <span className="team-selection__confirmed-team">{p.teamName}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <footer className="team-selection__footer">
          <span className="team-selection__footer-hint">
            {!playerName.trim()
              ? 'Ingresá tu nombre para continuar'
              : !chosenTeam
              ? 'Seleccioná un equipo para confirmar'
              : ''}
          </span>
          <Button
            variant="primary"
            size="lg"
            onClick={handleConfirmPlayer}
            disabled={!canConfirm}
          >
            {isLastPlayer ? 'Confirmar y comenzar →' : `Siguiente: Jugador ${currentPlayerIndex + 2} →`}
          </Button>
        </footer>
      </div>
    </div>
  );
}

export default TeamSelection;

