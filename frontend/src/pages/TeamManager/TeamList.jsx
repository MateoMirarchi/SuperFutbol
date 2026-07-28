/**
 * TeamList.jsx
 * Panel izquierdo del gestor de equipos.
 * Muestra la lista filtrable de todos los equipos de la base de datos.
 *
 * Filtros disponibles:
 *   - Texto: nombre, ciudad, abreviatura
 *   - Liga: todas | arg | bra | esp | ger | ita | fra
 *   - Divisi\u00F3n: todas | 1 | 2 | 3 | 4
 *
 * Props:
 *   teams          - Lista completa de equipos
 *   players        - Lista completa de jugadores (para contar plantilla)
 *   selectedId     - ID del equipo seleccionado
 *   onSelect       - (teamId) => void
 *   search         - Estado del texto de b\u00FAsqueda
 *   leagueFilter   - Estado del filtro de liga
 *   divFilter      - Estado del filtro de divisi\u00F3n
 *   onSearchChange - (value) => void
 *   onLeagueChange - (value) => void
 *   onDivChange    - (value) => void
 *
 * Separaci\u00F3n: components/ \u2192 presentaci\u00F3n pura, sin l\u00F3gica de negocio.
 */

import { LEAGUES } from '../../data/leagues';
import { filterTeams } from '../../utils/teamDbUtils';
import './TeamList.css';

function TeamList({
  teams,
  players,
  selectedId,
  onSelect,
  search,
  leagueFilter,
  divFilter,
  onSearchChange,
  onLeagueChange,
  onDivChange,
}) {
  const visible = filterTeams(teams, search, leagueFilter || null, divFilter || null);

  function playerCount(teamId) {
    return players.filter((p) => p.teamId === teamId).length;
  }

  return (
    <div className="team-list">
      {/* ── Filtros ─────────────────────────────────────────────── */}
      <div className="team-list__filters">
        <input
          className="team-list__search"
          type="text"
          placeholder="Buscar equipo"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <div className="team-list__selects">
          <select
            className="team-list__select"
            value={leagueFilter}
            onChange={(e) => onLeagueChange(e.target.value)}
          >
            <option value="">Todas las ligas</option>
            {LEAGUES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.flag} {l.country}
              </option>
            ))}
          </select>

          <select
            className="team-list__select"
            value={divFilter}
            onChange={(e) => onDivChange(e.target.value)}
          >
            <option value="">Todas las divs.</option>
            <option value="1">División 1</option>
            <option value="2">División 2</option>
            <option value="3">División 3</option>
            <option value="4">División 4</option>
          </select>
        </div>
      </div>

      {/* ── Contador ─────────────────────────────────────────────── */}
      <p className="team-list__count">
        {visible.length} equipo{visible.length !== 1 ? 's' : ''}
      </p>

      {/* ── Lista ────────────────────────────────────────────────── */}
      <div className="team-list__items">
        {visible.length === 0 && (
          <p className="team-list__empty">
            Ningún equipo coincide con la búsqueda.
          </p>
        )}

        {visible.map((team) => {
          const count = team.playerCount ?? playerCount(team.id);
          const isActive = team.id === selectedId;
          return (
            <button
              key={team.id}
              className={`team-card${isActive ? ' team-card--active' : ''}`}
              onClick={() => onSelect(team.id)}
              type="button"
            >
              {/* Badge de colores */}
              <span
                className="team-card__colors"
                style={{
                  background: `linear-gradient(135deg, ${team.primaryColor} 50%, ${team.secondaryColor} 50%)`,
                }}
                aria-hidden="true"
              />

              {/* Info */}
              <span className="team-card__info">
                <span className="team-card__name">{team.name}</span>
                <span className="team-card__meta">
                  {team.leagueFlag} {team.leagueName}
                  {' \u00B7 '}
                  Div. {team.divisionLevel}
                  {' \u00B7 '}
                  {count} jugador{count !== 1 ? 'es' : ''}
                </span>
              </span>

              {/* Prestige */}
              <span className="team-card__prestige">{team.prestige}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TeamList;
