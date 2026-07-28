/**
 * TeamDetail.jsx
 * Panel derecho del gestor de equipos.
 * Muestra la informaci\u00F3n completa de un equipo seleccionado:
 *   - Datos generales: nombre, liga, divisi\u00F3n, colores, prestigio
 *   - Presupuesto: sumatoria de salarios de la plantilla
 *   - Tabla de jugadores: nombre, posici\u00F3n, edad, potencia, valor, sueldo, estado
 *   - Acciones: editar equipo, eliminar equipo, agregar jugador, editar/eliminar jugador
 *
 * Props:
 *   team          - Objeto equipo (de la DB) o null si nada seleccionado
 *   players       - Lista de jugadores del equipo
 *   selectedPlayer - ID del jugador seleccionado (para resaltado)
 *   onSelectPlayer - (playerId) => void
 *   onEditTeam    - () => void
 *   onDeleteTeam  - () => void
 *   onAddPlayer   - () => void
 *   onEditPlayer  - (player) => void
 *   onDeletePlayer - (playerId) => void
 *
 * Separaci\u00F3n: pages/TeamManager/ \u2192 componente espec\u00EDfico de esta pantalla.
 */

import {
  calcTeamBudget,
  formatBudget,
  normalizePosition,
  POSITION_ORDER,
  STATUS_LABELS,
} from '../../utils/teamDbUtils';
import { formatMoneyFull } from '../../utils/currency';
import './TeamDetail.css';

function TeamDetail({
  team,
  players,
  selectedPlayer,
  onSelectPlayer,
  onEditTeam,
  onDeleteTeam,
  onAddPlayer,
  onEditPlayer,
  onDeletePlayer,
}) {
  if (!team) {
    return (
      <div className="team-detail team-detail--empty">
        <p className="team-detail__placeholder">
          Seleccione un equipo de la lista para ver su información.
        </p>
      </div>
    );
  }

  const budget = calcTeamBudget(players);
  const sortedPlayers = [...players].sort((a, b) => {
    const positionOrder =
      (POSITION_ORDER[normalizePosition(a.position)] ?? 99) -
      (POSITION_ORDER[normalizePosition(b.position)] ?? 99);

    if (positionOrder !== 0) return positionOrder;

    const lastNameOrder = String(a.lastName ?? '').localeCompare(String(b.lastName ?? ''));
    if (lastNameOrder !== 0) return lastNameOrder;

    return String(a.firstName ?? '').localeCompare(String(b.firstName ?? ''));
  });

  return (
    <div className="team-detail">
      {/* ── Cabecera del equipo ─────────────────────────────────── */}
      <div className="team-detail__header">
        {/* Badge de colores */}
        <div
          className="team-detail__color-badge"
          style={{
            background: `linear-gradient(135deg, ${team.primaryColor} 50%, ${team.secondaryColor} 50%)`,
          }}
          aria-label={`Colores: ${team.primaryColor} y ${team.secondaryColor}`}
        />

        <div className="team-detail__title-block">
          <h2 className="team-detail__name">{team.name}</h2>
          <p className="team-detail__meta">
            {team.leagueFlag} {team.leagueName} &middot; Divisi\u00F3n {team.divisionLevel} &middot; {team.city}
          </p>
        </div>

        <div className="team-detail__actions">
          <button className="td-btn td-btn--secondary" onClick={onEditTeam}>
            Editar
          </button>
          <button className="td-btn td-btn--danger" onClick={onDeleteTeam}>
            Eliminar
          </button>
        </div>
      </div>

      {/* ── Info r\u00E1pida ──────────────────────────────────────────── */}
      <div className="team-detail__stats">
        <div className="td-stat">
          <span className="td-stat__label">Prestigio</span>
          <span className="td-stat__value">{team.prestige}</span>
        </div>
        <div className="td-stat">
          <span className="td-stat__label">Plantilla</span>
          <span className="td-stat__value">{players.length} jugadores</span>
        </div>
        <div className="td-stat">
          <span className="td-stat__label">Presupuesto</span>
          <span className="td-stat__value">{formatBudget(budget)}</span>
        </div>
        <div className="td-stat">
          <span className="td-stat__label">Colores</span>
          <span className="td-stat__value td-stat__value--colors">
            <span
              className="td-color-chip"
              style={{ background: team.primaryColor }}
              title={team.primaryColor}
            />
            <span
              className="td-color-chip"
              style={{ background: team.secondaryColor }}
              title={team.secondaryColor}
            />
            <span className="td-color-hex">{team.primaryColor}</span>
            <span className="td-color-sep">/</span>
            <span className="td-color-hex">{team.secondaryColor}</span>
          </span>
        </div>
      </div>

      {/* ── Plantilla de jugadores ──────────────────────────────── */}
      <div className="team-detail__roster">
        <div className="team-detail__roster-header">
          <h3 className="team-detail__roster-title">Plantilla</h3>
          <button className="td-btn td-btn--primary" onClick={onAddPlayer}>
            + Agregar jugador
          </button>
        </div>

        {players.length === 0 ? (
          <p className="team-detail__no-players">
            Este equipo no tiene jugadores en la base de datos.
            Agregá jugadores con el bot\u00F3n de arriba.
          </p>
        ) : (
          <div className="roster-table-wrap">
            <table className="roster-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Pos.</th>
                  <th>Edad</th>
                  <th>Pot.</th>
                  <th>Valor</th>
                  <th>Sueldo</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((p) => {
                  const position = normalizePosition(p.position);
                  return (
                  <tr
                    key={p.id}
                    className={`roster-row${p.id === selectedPlayer ? ' roster-row--active' : ''}`}
                    onClick={() => onSelectPlayer?.(p.id === selectedPlayer ? null : p.id)}
                  >
                    <td className="roster-row__name">
                      {p.firstName} {p.lastName}
                    </td>
                    <td>
                      <span className={`pos-badge pos-badge--${position.toLowerCase()}`}>
                        {position}
                      </span>
                    </td>
                    <td>{p.age}</td>
                    <td>
                      <span
                        className="power-bar"
                        style={{ '--pow': `${p.power}%` }}
                        title={`Potencia: ${p.power}`}
                      >
                        {p.power}
                      </span>
                    </td>
                    <td>{formatMoneyFull(p.value)}</td>
                    <td>${p.salary}K</td>
                    <td>
                      <span className={`status-badge status-badge--${p.status}`}>
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="roster-row__btns" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="td-btn td-btn--xs td-btn--secondary"
                        onClick={() => onEditPlayer(p)}
                      >
                        Editar
                      </button>
                      <button
                        className="td-btn td-btn--xs td-btn--danger"
                        onClick={() => onDeletePlayer(p.id)}
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamDetail;
