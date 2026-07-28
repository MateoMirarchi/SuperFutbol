/**
 * competitions.js
 * Competencias internacionales disponibles en la partida.
 * Cada una puede ser habilitada o deshabilitada por el jugador.
 */

export const COMPETITIONS = [
  {
    id: 'libertadores',
    name: 'Copa Libertadores',
    shortName: 'Libertadores',
    region: 'sudamerica',
    tier: 1,
    icon: '🏆',
    description: 'La máxima competencia de clubes de Sudamérica.',
    // Ligas que participan (ids de leagues.js)
    eligibleLeagues: ['arg', 'bra'],
  },
  {
    id: 'sudamericana',
    name: 'Copa Sudamericana',
    shortName: 'Sudamericana',
    region: 'sudamerica',
    tier: 2,
    icon: '🥈',
    description: 'Segunda competencia continental de Sudamérica.',
    eligibleLeagues: ['arg', 'bra'],
  },
  {
    id: 'champions',
    name: 'UEFA Champions League',
    shortName: 'Champions',
    region: 'europa',
    tier: 1,
    icon: '⭐',
    description: 'La máxima competencia de clubes de Europa.',
    eligibleLeagues: ['esp', 'ger', 'ita', 'fra'],
  },
  {
    id: 'europa',
    name: 'UEFA Europa League',
    shortName: 'Europa League',
    region: 'europa',
    tier: 2,
    icon: '🌟',
    description: 'Segunda competencia continental de Europa.',
    eligibleLeagues: ['esp', 'ger', 'ita', 'fra'],
  },
  {
    id: 'mundial2026',
    name: 'Copa del Mundo 2026',
    shortName: 'Mundial 2026',
    region: 'global',
    tier: 0,
    icon: '🌍',
    description: 'El torneo más importante del fútbol mundial, edición 2026.',
    eligibleLeagues: ['arg', 'bra', 'esp', 'ger', 'ita', 'fra'],
  },
  {
    id: 'mundialClubes',
    name: 'Mundial de Clubes',
    shortName: 'Mundial de Clubes',
    region: 'global',
    tier: 1,
    icon: '🌐',
    description: 'El torneo de clubes más importante a nivel mundial.',
    eligibleLeagues: ['arg', 'bra', 'esp', 'ger', 'ita', 'fra'],
  },
];

/**
 * Retorna solo las competencias disponibles para un conjunto de ligas elegidas.
 */
export function getAvailableCompetitions(selectedLeagueIds) {
  return COMPETITIONS.filter((comp) =>
    comp.eligibleLeagues.some((id) => selectedLeagueIds.includes(id))
  );
}
