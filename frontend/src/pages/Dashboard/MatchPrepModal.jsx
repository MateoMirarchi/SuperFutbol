import { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/Modal/Modal';
import {
  ATTITUDES,
  PLAY_STYLES,
  PRESSURES,
  buildInitialTacticalSetup,
  getAdjustedPlayerPower,
  getAssignedStarters,
  getBenchPlayers,
  getFormationSlots,
  isPlayerNaturalForSlot,
  remapAssignmentsToFormation,
  resolvePlayerName,
  sanitizeTacticalSetup,
} from '../../utils/tacticalSetup';
import { normalizePosition, POSITION_LABELS, POSITION_ORDER } from '../../utils/teamDbUtils';
import './MatchPrepModal.css';

const FORMATION_OPTIONS = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-3-2'];
const MATCHDAY_BENCH_SIZE = 7;

const POSITION_GROUP_ORDER = {
  GK: 0,
  LB: 1,
  RB: 1,
  CB: 1,
  CDM: 2,
  CM: 2,
  CAM: 2,
  LM: 2,
  RM: 2,
  LW: 3,
  RW: 3,
  ST: 3,
};

function idsEqual(leftId, rightId) {
  return String(leftId ?? '') === String(rightId ?? '');
}

function comparePlayersByPosition(leftPlayer, rightPlayer) {
  const leftPosition = normalizePosition(leftPlayer.position);
  const rightPosition = normalizePosition(rightPlayer.position);
  const groupDelta = (POSITION_GROUP_ORDER[leftPosition] ?? 99) - (POSITION_GROUP_ORDER[rightPosition] ?? 99);

  if (groupDelta !== 0) return groupDelta;

  const orderDelta = (POSITION_ORDER[leftPosition] ?? 99) - (POSITION_ORDER[rightPosition] ?? 99);
  if (orderDelta !== 0) return orderDelta;

  return resolvePlayerName(leftPlayer).localeCompare(resolvePlayerName(rightPlayer));
}

function getLocalizedPosition(player) {
  const normalizedPosition = normalizePosition(player?.position);
  return POSITION_LABELS[normalizedPosition] ?? normalizedPosition;
}

function MatchPrepModal({
  isOpen,
  squad = [],
  previousSetup = null,
  nextMatch,
  onClose,
  onConfirm,
  title = 'Preparar partido',
  confirmLabel = 'Comenzar partido',
}) {
  const [setup, setSetup] = useState(() => buildInitialTacticalSetup(squad, previousSetup));
  const [localError, setLocalError] = useState('');
  const [draggedPlayerId, setDraggedPlayerId] = useState(null);
  const [activeDropSlotId, setActiveDropSlotId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setSetup(buildInitialTacticalSetup(squad, previousSetup));
    setDraggedPlayerId(null);
    setActiveDropSlotId(null);
    setLocalError('');
  }, [isOpen, previousSetup, squad]);

  const formationSlots = useMemo(() => getFormationSlots(setup.formation), [setup.formation]);
  const starters = useMemo(() => getAssignedStarters(setup, squad), [setup, squad]);
  const benchPlayers = useMemo(() => getBenchPlayers(setup, squad), [setup, squad]);
  const playersById = useMemo(() => new Map(squad.map((player) => [String(player.id), player])), [squad]);
  const starterPlayers = starters.filter(({ player }) => Boolean(player)).map(({ player }) => player);
  const orderedBenchPlayers = useMemo(
    () => [...benchPlayers].sort(comparePlayersByPosition),
    [benchPlayers]
  );
  const benchUnitPlayers = useMemo(
    () => orderedBenchPlayers.slice(0, MATCHDAY_BENCH_SIZE),
    [orderedBenchPlayers]
  );
  const reservePlayers = useMemo(
    () => orderedBenchPlayers.slice(MATCHDAY_BENCH_SIZE),
    [orderedBenchPlayers]
  );

  function applySetup(nextSetup) {
    setSetup(sanitizeTacticalSetup(nextSetup, squad));
  }

  function updateField(field, value) {
    setSetup((current) => ({ ...current, [field]: value }));
  }

  function getPlayerCurrentSlotId(playerId) {
    return Object.entries(setup.slotAssignments ?? {}).find(([, value]) => idsEqual(value, playerId))?.[0] ?? null;
  }

  function handleFormationChange(nextFormation) {
    applySetup({
      ...setup,
      formation: nextFormation,
      slotAssignments: remapAssignmentsToFormation(setup.slotAssignments, setup.formation, nextFormation),
    });
  }

  function assignPlayerToSlot(playerId, targetSlotId) {
    setLocalError('');
    const nextAssignments = { ...(setup.slotAssignments ?? {}) };
    const currentSlotId = getPlayerCurrentSlotId(playerId);
    const displacedPlayerId = nextAssignments[targetSlotId] ?? null;

    if (currentSlotId) {
      nextAssignments[currentSlotId] = displacedPlayerId && displacedPlayerId !== playerId ? displacedPlayerId : null;
    }

    nextAssignments[targetSlotId] = playerId;
    applySetup({ ...setup, slotAssignments: nextAssignments });
  }

  function removePlayerFromPitch(playerId) {
    const slotId = getPlayerCurrentSlotId(playerId);
    if (!slotId) return;

    const nextAssignments = { ...(setup.slotAssignments ?? {}) };
    nextAssignments[slotId] = null;
    applySetup({ ...setup, slotAssignments: nextAssignments });
  }

  function handleDragStart(playerId) {
    setDraggedPlayerId(playerId);
    setActiveDropSlotId(null);
    setLocalError('');
  }

  function handleDragEnd() {
    setDraggedPlayerId(null);
    setActiveDropSlotId(null);
  }

  function handleSlotDragOver(event, slotId) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setActiveDropSlotId(slotId);
  }

  function handleSlotDrop(event, slotId) {
    event.preventDefault();
    event.stopPropagation();
    const playerId = event.dataTransfer.getData('text/plain') || draggedPlayerId;
    if (playerId) assignPlayerToSlot(playerId, slotId);
    handleDragEnd();
  }

  function handleSubmit(event) {
    event.preventDefault();
    const sanitizedSetup = sanitizeTacticalSetup(setup, squad);

    if (squad.length >= 11 && sanitizedSetup.starterIds.length !== 11) {
      setLocalError('Tenés que completar los 11 puestos de la cancha antes de arrancar.');
      return;
    }

    onConfirm(sanitizedSetup);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form className="match-prep" onSubmit={handleSubmit}>
        <div className="match-prep__intro">
          <div>
            <h3>{nextMatch?.tournamentName ?? 'Próximo partido'}</h3>
            <p>{nextMatch?.homeTeam?.name ?? 'Local'} vs {nextMatch?.awayTeam?.name ?? 'Visitante'}</p>
          </div>
          <span className="match-prep__badge">Fecha {nextMatch?.matchday ?? '-'}</span>
        </div>

        <div className="match-prep__grid">
          <label className="match-prep__field">
            <span>Formación</span>
            <select value={setup.formation} onChange={(event) => handleFormationChange(event.target.value)}>
              {FORMATION_OPTIONS.map((formation) => (
                <option key={formation} value={formation}>{formation}</option>
              ))}
            </select>
          </label>

          <label className="match-prep__field">
            <span>Estilo y actitud</span>
            <select value={setup.attitude} onChange={(event) => updateField('attitude', event.target.value)}>
              {ATTITUDES.map((attitude) => (
                <option key={attitude} value={attitude}>{attitude}</option>
              ))}
            </select>
          </label>

          <label className="match-prep__field">
            <span>Tipo de presión</span>
            <select value={setup.pressure} onChange={(event) => updateField('pressure', event.target.value)}>
              {PRESSURES.map((pressure) => (
                <option key={pressure} value={pressure}>{pressure}</option>
              ))}
            </select>
          </label>

          <label className="match-prep__field">
            <span>Juego</span>
            <select value={setup.playStyle} onChange={(event) => updateField('playStyle', event.target.value)}>
              {PLAY_STYLES.map((style) => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </label>

          <label className="match-prep__field">
            <span>Capitán</span>
            <select value={setup.captainId ?? ''} onChange={(event) => updateField('captainId', event.target.value)}>
              {starterPlayers.map((player) => (
                <option key={player.id} value={player.id}>{resolvePlayerName(player)}</option>
              ))}
            </select>
          </label>

          <label className="match-prep__field">
            <span>Lanzador de faltas</span>
            <select value={setup.setPieceTakerId ?? ''} onChange={(event) => updateField('setPieceTakerId', event.target.value)}>
              {starterPlayers.map((player) => (
                <option key={player.id} value={player.id}>{resolvePlayerName(player)}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="match-prep__editor">
          <section className="match-prep__pitch-wrapper">
            <header className="match-prep__section-header">
              <h4>Cancha táctica</h4>
              <span>Arrastrá jugadores desde la lista hacia los puestos.</span>
            </header>

            <div className="match-prep__pitch">
              <div className="match-prep__pitch-markings" />
              {formationSlots.map((slot) => {
                const player = playersById.get(String(setup.slotAssignments?.[slot.id] ?? '')) ?? null;
                const outOfPosition = player ? !isPlayerNaturalForSlot(player, slot) : false;
                const adjustedPower = player ? getAdjustedPlayerPower(player, slot) : null;

                return (
                  <div
                    key={slot.id}
                    className={[
                      'match-prep__slot',
                      player ? 'match-prep__slot--filled' : '',
                      outOfPosition ? 'match-prep__slot--warning' : '',
                      activeDropSlotId === slot.id ? 'match-prep__slot--active' : '',
                    ].filter(Boolean).join(' ')}
                    style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                    onDragOver={(event) => handleSlotDragOver(event, slot.id)}
                    onDragLeave={() => setActiveDropSlotId((current) => (current === slot.id ? null : current))}
                    onDrop={(event) => handleSlotDrop(event, slot.id)}
                  >
                    <span className="match-prep__slot-label">{slot.label}</span>
                    {player ? (
                      <button
                        type="button"
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.setData('text/plain', player.id);
                          event.dataTransfer.effectAllowed = 'move';
                          handleDragStart(player.id);
                        }}
                        onDragEnd={handleDragEnd}
                        onDragOver={(event) => handleSlotDragOver(event, slot.id)}
                        onDrop={(event) => handleSlotDrop(event, slot.id)}
                        className={[
                          'match-prep__slot-player',
                          outOfPosition ? 'match-prep__slot-player--warning' : '',
                        ].filter(Boolean).join(' ')}
                      >
                        <strong>{resolvePlayerName(player).split(' ').at(-1)}</strong>
                        <span>{adjustedPower}</span>
                      </button>
                    ) : (
                      <span className="match-prep__slot-empty">Libre</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="match-prep__list-box">
            <header className="match-prep__section-header">
              <h4>Jugadores</h4>
              <span>Banco y reserva ordenados por línea.</span>
            </header>

            <div
              className="match-prep__bench-drop"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const playerId = event.dataTransfer.getData('text/plain') || draggedPlayerId;
                if (playerId) removePlayerFromPitch(playerId);
                handleDragEnd();
              }}
            >
              Banco de suplentes
            </div>

            <div className="match-prep__list">
              <div className="match-prep__subgroup">
                <h5>Banco de suplentes</h5>
                {benchUnitPlayers.length ? benchUnitPlayers.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData('text/plain', player.id);
                      event.dataTransfer.effectAllowed = 'move';
                      handleDragStart(player.id);
                    }}
                    onDragEnd={handleDragEnd}
                    className="match-prep__player-card"
                  >
                    <div>
                      <strong>{resolvePlayerName(player)}</strong>
                      <span>{getLocalizedPosition(player)}</span>
                    </div>
                    <em>{player.power}</em>
                  </button>
                )) : <p className="match-prep__empty-group">No hay suplentes disponibles.</p>}
              </div>

              <div className="match-prep__subgroup">
                <h5>Reserva</h5>
                {reservePlayers.length ? reservePlayers.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData('text/plain', player.id);
                      event.dataTransfer.effectAllowed = 'move';
                      handleDragStart(player.id);
                    }}
                    onDragEnd={handleDragEnd}
                    className="match-prep__player-card"
                  >
                    <div>
                      <strong>{resolvePlayerName(player)}</strong>
                      <span>{getLocalizedPosition(player)}</span>
                    </div>
                    <em>{player.power}</em>
                  </button>
                )) : <p className="match-prep__empty-group">No hay jugadores en reserva.</p>}
              </div>
            </div>
          </section>
        </div>

        {localError && <p className="match-prep__error">{localError}</p>}

        <div className="match-prep__actions">
          <button type="button" className="match-prep__btn match-prep__btn--secondary" onClick={onClose}>
            Volver
          </button>
          <button type="submit" className="match-prep__btn match-prep__btn--primary">
            {confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default MatchPrepModal;