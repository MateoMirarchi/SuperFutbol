export const FORMATIONS = {
  '4-3-3': [
    { id: 'gk', label: 'ARQ', x: 50, y: 91, acceptedPositions: ['GK'] },
    { id: 'lb', label: 'LI', x: 16, y: 75, acceptedPositions: ['LB'] },
    { id: 'cb1', label: 'DFC', x: 38, y: 76, acceptedPositions: ['CB'] },
    { id: 'cb2', label: 'DFC', x: 62, y: 76, acceptedPositions: ['CB'] },
    { id: 'rb', label: 'LD', x: 84, y: 75, acceptedPositions: ['RB'] },
    { id: 'cm1', label: 'MC', x: 28, y: 56, acceptedPositions: ['CM', 'CDM'] },
    { id: 'cm2', label: 'MCO', x: 50, y: 51, acceptedPositions: ['CAM', 'CM'] },
    { id: 'cm3', label: 'MC', x: 72, y: 56, acceptedPositions: ['CM', 'CDM'] },
    { id: 'lw', label: 'EI', x: 24, y: 26, acceptedPositions: ['LW', 'LM'] },
    { id: 'st', label: 'DC', x: 50, y: 19, acceptedPositions: ['ST', 'CAM'] },
    { id: 'rw', label: 'ED', x: 76, y: 26, acceptedPositions: ['RW', 'RM'] },
  ],
  '4-4-2': [
    { id: 'gk', label: 'ARQ', x: 50, y: 91, acceptedPositions: ['GK'] },
    { id: 'lb', label: 'LI', x: 16, y: 75, acceptedPositions: ['LB'] },
    { id: 'cb1', label: 'DFC', x: 38, y: 76, acceptedPositions: ['CB'] },
    { id: 'cb2', label: 'DFC', x: 62, y: 76, acceptedPositions: ['CB'] },
    { id: 'rb', label: 'LD', x: 84, y: 75, acceptedPositions: ['RB'] },
    { id: 'lm', label: 'MI', x: 17, y: 50, acceptedPositions: ['LM', 'LW'] },
    { id: 'cm1', label: 'MC', x: 40, y: 54, acceptedPositions: ['CM', 'CDM'] },
    { id: 'cm2', label: 'MC', x: 60, y: 54, acceptedPositions: ['CM', 'CAM'] },
    { id: 'rm', label: 'MD', x: 83, y: 50, acceptedPositions: ['RM', 'RW'] },
    { id: 'st1', label: 'DC', x: 40, y: 24, acceptedPositions: ['ST'] },
    { id: 'st2', label: 'DC', x: 60, y: 24, acceptedPositions: ['ST'] },
  ],
  '4-2-3-1': [
    { id: 'gk', label: 'ARQ', x: 50, y: 91, acceptedPositions: ['GK'] },
    { id: 'lb', label: 'LI', x: 16, y: 75, acceptedPositions: ['LB'] },
    { id: 'cb1', label: 'DFC', x: 38, y: 76, acceptedPositions: ['CB'] },
    { id: 'cb2', label: 'DFC', x: 62, y: 76, acceptedPositions: ['CB'] },
    { id: 'rb', label: 'LD', x: 84, y: 75, acceptedPositions: ['RB'] },
    { id: 'cdm1', label: 'MCD', x: 38, y: 60, acceptedPositions: ['CDM', 'CM'] },
    { id: 'cdm2', label: 'MCD', x: 62, y: 60, acceptedPositions: ['CDM', 'CM'] },
    { id: 'caml', label: 'EI', x: 24, y: 39, acceptedPositions: ['LW', 'LM'] },
    { id: 'cam', label: 'MCO', x: 50, y: 34, acceptedPositions: ['CAM', 'CM'] },
    { id: 'camr', label: 'ED', x: 76, y: 39, acceptedPositions: ['RW', 'RM'] },
    { id: 'st', label: 'DC', x: 50, y: 17, acceptedPositions: ['ST'] },
  ],
  '3-5-2': [
    { id: 'gk', label: 'ARQ', x: 50, y: 91, acceptedPositions: ['GK'] },
    { id: 'cb1', label: 'DFC', x: 25, y: 77, acceptedPositions: ['CB'] },
    { id: 'cb2', label: 'DFC', x: 50, y: 74, acceptedPositions: ['CB'] },
    { id: 'cb3', label: 'DFC', x: 75, y: 77, acceptedPositions: ['CB'] },
    { id: 'lwb', label: 'CAI', x: 12, y: 52, acceptedPositions: ['LB', 'LM', 'LW'] },
    { id: 'cm1', label: 'MC', x: 34, y: 55, acceptedPositions: ['CM', 'CDM'] },
    { id: 'cam', label: 'MCO', x: 50, y: 46, acceptedPositions: ['CAM', 'CM'] },
    { id: 'cm2', label: 'MC', x: 66, y: 55, acceptedPositions: ['CM', 'CDM'] },
    { id: 'rwb', label: 'CAD', x: 88, y: 52, acceptedPositions: ['RB', 'RM', 'RW'] },
    { id: 'st1', label: 'DC', x: 40, y: 22, acceptedPositions: ['ST'] },
    { id: 'st2', label: 'DC', x: 60, y: 22, acceptedPositions: ['ST'] },
  ],
  '5-3-2': [
    { id: 'gk', label: 'ARQ', x: 50, y: 91, acceptedPositions: ['GK'] },
    { id: 'lwb', label: 'CAI', x: 10, y: 68, acceptedPositions: ['LB', 'LM'] },
    { id: 'cb1', label: 'DFC', x: 28, y: 77, acceptedPositions: ['CB'] },
    { id: 'cb2', label: 'DFC', x: 50, y: 75, acceptedPositions: ['CB'] },
    { id: 'cb3', label: 'DFC', x: 72, y: 77, acceptedPositions: ['CB'] },
    { id: 'rwb', label: 'CAD', x: 90, y: 68, acceptedPositions: ['RB', 'RM'] },
    { id: 'cm1', label: 'MC', x: 30, y: 51, acceptedPositions: ['CM', 'CDM'] },
    { id: 'cm2', label: 'MC', x: 50, y: 46, acceptedPositions: ['CM', 'CAM'] },
    { id: 'cm3', label: 'MC', x: 70, y: 51, acceptedPositions: ['CM', 'CDM'] },
    { id: 'st1', label: 'DC', x: 40, y: 22, acceptedPositions: ['ST'] },
    { id: 'st2', label: 'DC', x: 60, y: 22, acceptedPositions: ['ST'] },
  ],
};

export const ATTITUDES = ['Ofensiva', 'Equilibrada', 'Defensiva'];
export const PRESSURES = ['Alta', 'Normal', 'Baja'];
export const PLAY_STYLES = ['Por las puntas', 'Posesión', 'Contraataque', 'Balón largo'];

function toPlayerIdKey(playerId) {
  return String(playerId ?? '');
}

function idsEqual(leftId, rightId) {
  return toPlayerIdKey(leftId) === toPlayerIdKey(rightId);
}

function findAvailablePlayer(availablePlayers, playerId) {
  return availablePlayers.find((player) => idsEqual(player.id, playerId)) ?? null;
}

function normalizeSetupFormation(formation) {
  return FORMATIONS[formation] ? formation : '4-3-3';
}

export function resolvePlayerName(player) {
  return [player?.firstName, player?.lastName].filter(Boolean).join(' ').trim() || 'Jugador';
}

export function getFormationSlots(formation) {
  return FORMATIONS[normalizeSetupFormation(formation)] ?? FORMATIONS['4-3-3'];
}

export function getAvailableSquadPlayers(squad = []) {
  return squad.filter((player) => player.status !== 'loan');
}

function mapPlayersToSlots(playerIds = [], formation = '4-3-3') {
  const slots = getFormationSlots(formation);
  return Object.fromEntries(slots.map((slot, index) => [slot.id, playerIds[index] ?? null]));
}

export function buildInitialTacticalSetup(squad = [], previousSetup = null) {
  const availablePlayers = getAvailableSquadPlayers(squad);
  const formation = normalizeSetupFormation(previousSetup?.formation);
  const previousAssignments = previousSetup?.slotAssignments ?? null;

  let orderedStarterIds = [];
  if (previousAssignments) {
    const slots = getFormationSlots(formation);
    orderedStarterIds = slots
      .map((slot) => findAvailablePlayer(availablePlayers, previousAssignments[slot.id])?.id ?? null)
      .filter(Boolean);
  }

  if (!orderedStarterIds.length) {
    orderedStarterIds = (previousSetup?.starterIds ?? [])
      .map((playerId) => findAvailablePlayer(availablePlayers, playerId)?.id ?? null)
      .filter(Boolean);
  }

  if (!orderedStarterIds.length) {
    orderedStarterIds = availablePlayers.slice(0, Math.min(11, availablePlayers.length)).map((player) => player.id);
  }

  const slotAssignments = mapPlayersToSlots(orderedStarterIds, formation);
  const starterIds = Object.values(slotAssignments).filter(Boolean);
  const benchIds = availablePlayers
    .filter((player) => !starterIds.includes(player.id))
    .map((player) => player.id);

  return {
    formation,
    attitude: previousSetup?.attitude ?? ATTITUDES[0],
    pressure: previousSetup?.pressure ?? PRESSURES[1],
    playStyle: previousSetup?.playStyle ?? PLAY_STYLES[0],
    slotAssignments,
    starterIds,
    benchIds,
    captainId: previousSetup?.captainId ?? starterIds[0] ?? null,
    setPieceTakerId: previousSetup?.setPieceTakerId ?? starterIds[1] ?? starterIds[0] ?? null,
  };
}

export function remapAssignmentsToFormation(slotAssignments = {}, currentFormation, nextFormation) {
  const currentSlots = getFormationSlots(currentFormation);
  const nextSlots = getFormationSlots(nextFormation);
  const orderedPlayers = currentSlots.map((slot) => slotAssignments[slot.id]).filter(Boolean);
  return Object.fromEntries(nextSlots.map((slot, index) => [slot.id, orderedPlayers[index] ?? null]));
}

export function isPlayerNaturalForSlot(player, slot) {
  if (!player || !slot) return false;
  return (slot.acceptedPositions ?? []).includes(player.position);
}

export function getAdjustedPlayerPower(player, slot) {
  const basePower = Number(player?.power ?? 1);
  if (!player || !slot) return basePower;
  return isPlayerNaturalForSlot(player, slot)
    ? basePower
    : Math.max(1, Math.round(basePower * 0.58));
}

export function getAssignedStarters(setup, squad = []) {
  const playersById = new Map(getAvailableSquadPlayers(squad).map((player) => [toPlayerIdKey(player.id), player]));
  return getFormationSlots(setup?.formation).map((slot) => ({
    slot,
    player: playersById.get(toPlayerIdKey(setup?.slotAssignments?.[slot.id])) ?? null,
  }));
}

export function getBenchPlayers(setup, squad = []) {
  const starterIds = new Set(
    Object.values(setup?.slotAssignments ?? {})
      .filter(Boolean)
      .map((playerId) => toPlayerIdKey(playerId))
  );
  return getAvailableSquadPlayers(squad).filter((player) => !starterIds.has(toPlayerIdKey(player.id)));
}

export function sanitizeTacticalSetup(setup, squad = []) {
  const availablePlayers = getAvailableSquadPlayers(squad);
  const formation = normalizeSetupFormation(setup?.formation);
  const slots = getFormationSlots(formation);
  const usedIds = new Set();
  const slotAssignments = {};

  slots.forEach((slot) => {
    const playerId = setup?.slotAssignments?.[slot.id];
    const matchingPlayer = findAvailablePlayer(availablePlayers, playerId);
    const normalizedPlayerId = matchingPlayer ? toPlayerIdKey(matchingPlayer.id) : null;

    if (matchingPlayer && !usedIds.has(normalizedPlayerId)) {
      slotAssignments[slot.id] = matchingPlayer.id;
      usedIds.add(normalizedPlayerId);
    } else {
      slotAssignments[slot.id] = null;
    }
  });

  const starterIds = Object.values(slotAssignments).filter(Boolean);
  const starterIdKeys = new Set(starterIds.map((playerId) => toPlayerIdKey(playerId)));
  const benchIds = availablePlayers
    .filter((player) => !starterIdKeys.has(toPlayerIdKey(player.id)))
    .map((player) => player.id);

  return {
    ...setup,
    formation,
    slotAssignments,
    starterIds,
    benchIds,
    captainId: starterIds.includes(setup?.captainId) ? setup.captainId : starterIds[0] ?? null,
    setPieceTakerId: starterIds.includes(setup?.setPieceTakerId)
      ? setup.setPieceTakerId
      : starterIds[1] ?? starterIds[0] ?? null,
  };
}

export function buildEffectiveMatchRoster(setup, squad = []) {
  return getAssignedStarters(setup, squad)
    .filter(({ player }) => Boolean(player))
    .map(({ slot, player }) => ({
      ...player,
      tacticalSlotId: slot.id,
      tacticalRole: slot.label,
      tacticalPower: getAdjustedPlayerPower(player, slot),
      outOfPosition: !isPlayerNaturalForSlot(player, slot),
      power: getAdjustedPlayerPower(player, slot),
    }));
}