import { normalizePosition } from './teamDbUtils';

function splitPlayerName(player) {
  if (player?.firstName || player?.lastName) {
    return {
      firstName: player.firstName?.trim() || 'Jugador',
      lastName: player.lastName?.trim() || '',
    };
  }

  const nameParts = String(player?.name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (nameParts.length === 0) {
    return { firstName: 'Jugador', lastName: '' };
  }

  if (nameParts.length === 1) {
    return { firstName: nameParts[0], lastName: '' };
  }

  return {
    firstName: nameParts.slice(0, -1).join(' '),
    lastName: nameParts.at(-1),
  };
}

export function getParticipants(save) {
  return Array.isArray(save?.players) ? save.players : [];
}

export function getActiveParticipant(save) {
  const participants = getParticipants(save);
  if (!participants.length) return null;

  if (save?.activeParticipantId) {
    const active = participants.find((participant) => String(participant.id) === String(save.activeParticipantId));
    if (active) return active;
  }

  return participants[0];
}

export function updateParticipantCollection(participants = [], participantId, updates) {
  return participants.map((participant) =>
    String(participant.id) === String(participantId)
      ? { ...participant, ...updates }
      : participant
  );
}

export function mapBackendPlayerToSquadPlayer(player, currentSeason = 1) {
  if (!player) return null;

  const { firstName, lastName } = splitPlayerName(player);
  return {
    id: player.id,
    teamId: player.teamId,
    firstName,
    lastName,
    position: normalizePosition(player.position ?? 'CM'),
    age: Number(player.age ?? 22),
    power: Number(player.power ?? 60),
    value: Number(player.value ?? 0),
    salary: Number(player.salary ?? 0),
    contractEndSeason: Number(player.contractEndSeason ?? (currentSeason + 2)),
    status: player.status ?? 'available',
    tiredness: Number(player.tiredness ?? 0),
  };
}

export function createManagerParticipant(name, save) {
  return {
    id: `manager_${Date.now()}`,
    name: name.trim(),
    role: 'manager',
    teamId: null,
    teamName: 'Sin club',
    leagueId: null,
    divisionLevel: null,
    divisionName: '',
    city: '',
    prestige: 50,
    budget: 0,
    hiredAt: { season: save?.season ?? 1, matchday: save?.matchday ?? 1 },
    record: { won: 0, drawn: 0, lost: 0 },
  };
}