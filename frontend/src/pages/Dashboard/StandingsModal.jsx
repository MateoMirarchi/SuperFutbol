/**
 * StandingsModal.jsx
 * Tabla de posiciones de todas las divisiones de los países seleccionados.
 * Muestra zonas de clasificación continental, playoff y descenso.
 */

import { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/Modal/Modal';
import { buildStandingsTable, getLocalDivisionTeams } from '../../utils/matchSimulation';
import { buildLeagueCatalog } from '../../utils/leagueCatalog';
import { getActiveParticipant } from '../../utils/saveState';
import './StandingsModal.css';

// Referencia estable para no invalidar los useMemo de abajo cuando el save
// no trae config/localSchedule (evita que `?? []` cree un array nuevo en
// cada render, lo que rompería la comparación de dependencias de useMemo).
const EMPTY_ARRAY = [];

/**
 * Devuelve la zona de clasificación para una posición en una división dada.
 * Primera división:
 *   1° → campeón
 *   1–3 → copa principal continental (Libertadores / Champions)
 *   4–7 → copa secundaria continental (Sudamericana / Europa)
 *   8   → playoff de ascenso/descenso (ida y vuelta con el 3° de Div 2)
 *   9–10 → descienden
 * Segunda división:
 *   1 → campeón + ascenso directo
 *   2 → ascenso directo
 *   3 → playoff
 *   9–10 → descienden
 * Tercera y cuarta división: misma lógica de ascenso/descenso.
 */
function getZone(position, divisionLevel) {
  if (divisionLevel === 1) {
    if (position === 1) return 'champion';
    if (position <= 3) return 'continental1';
    if (position <= 7) return 'continental2';
    if (position === 8) return 'playoff';
    return 'relegation';
  }
  if (position === 1) return 'champion';
  if ((divisionLevel === 2 || divisionLevel === 3 || divisionLevel === 4) && position === 2) return 'promotion';
  if (position === 3) return 'playoff';
  if ((divisionLevel !== 4) && position === 8) return 'playoff';
  if ((divisionLevel !== 4) && position >= 9) return 'relegation';
  return null;
}

const ZONE_COLORS = {
  champion:     { border: '#ffd700', bg: 'rgba(255,215,0,0.08)',   label: '🏆 Campeón' },
  continental1: { border: '#1e90ff', bg: 'rgba(30,144,255,0.08)',  label: '🌍 Copa Principal' },
  continental2: { border: '#00d4ff', bg: 'rgba(0,212,255,0.06)',   label: '🌐 Copa Secundaria' },
  promotion:    { border: '#4ade80', bg: 'rgba(74,222,128,0.08)',  label: '⬆ Ascenso directo' },
  playoff:      { border: '#fb923c', bg: 'rgba(251,146,60,0.08)',  label: '🔀 Playoff' },
  relegation:   { border: '#f87171', bg: 'rgba(248,113,113,0.08)', label: '⬇ Descenso' },
};

function DivisionTable({ division }) {
  const rows = useMemo(
    () => buildStandingsTable(division.teams ?? EMPTY_ARRAY, EMPTY_ARRAY),
    [division.teams]
  );

  return <RowsTable division={division} rows={rows} />;
}

function RowsTable({ division, rows }) {
  const mappedRows = rows.map((row, index) => ({
    ...row,
    pos: index + 1,
    zone: getZone(index + 1, division.level),
  }));

  return (
    <div className="div-table">
      <h4 className="div-table__title">División {division.level} — {division.name}</h4>
      <div className="div-table__scroll">
        <table className="div-table__table">
          <thead>
            <tr>
              <th>#</th>
              <th className="div-table__team-col">Equipo</th>
              <th title="Partidos Jugados">PJ</th>
              <th title="Ganados">G</th>
              <th title="Empatados">E</th>
              <th title="Perdidos">P</th>
              <th title="Goles a Favor">GF</th>
              <th title="Goles en Contra">GC</th>
              <th title="Diferencia de Gol">DG</th>
              <th title="Puntos">Pts</th>
            </tr>
          </thead>
          <tbody>
            {mappedRows.map((row) => {
              const z = row.zone ? ZONE_COLORS[row.zone] : null;
              return (
                <tr
                  key={row.team.id}
                  style={
                    z
                      ? {
                          backgroundColor: z.bg,
                          borderLeft: `3px solid ${z.border}`,
                        }
                      : {}
                  }
                >
                  <td className="div-table__pos">{row.pos}</td>
                  <td className="div-table__team-name">{row.team.name}</td>
                  <td>{row.played}</td>
                  <td>{row.won}</td>
                  <td>{row.drawn}</td>
                  <td>{row.lost}</td>
                  <td>{row.gf}</td>
                  <td>{row.ga}</td>
                  <td>{row.gd}</td>
                  <td className="div-table__pts">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DynamicLocalDivision({ save, division }) {
  // getLocalDivisionTeams solo lee save.localSchedule internamente; se
  // depende de ese campo puntual (no de `save`) a proposito, para no
  // recalcular en cada render por el resto del save cambiando de referencia.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const teams = useMemo(() => getLocalDivisionTeams(save), [save.localSchedule]);
  const rows = useMemo(
    () => buildStandingsTable(teams, save.localSchedule ?? EMPTY_ARRAY),
    [teams, save.localSchedule]
  );
  if (!rows.length) {
    return <DivisionTable division={division} />;
  }
  return <RowsTable division={division} rows={rows} />;
}

function StandingsModal({ isOpen, onClose, save }) {
  const selectedLeagueIds = save.config?.selectedLeagues ?? EMPTY_ARRAY;
  const leagues = useMemo(
    () => buildLeagueCatalog(save.teamPool ?? EMPTY_ARRAY, selectedLeagueIds),
    [save.teamPool, selectedLeagueIds]
  );
  const player = getActiveParticipant(save);

  const [activeLeagueId, setActiveLeagueId] = useState(
    leagues[0]?.id ?? null
  );

  useEffect(() => {
    if (!leagues.length) {
      setActiveLeagueId(null);
      return;
    }

    const hasActiveLeague = leagues.some((league) => String(league.id) === String(activeLeagueId));
    if (!hasActiveLeague) {
      setActiveLeagueId(leagues[0].id);
    }
  }, [leagues, activeLeagueId]);

  const activeLeague = leagues.find((l) => l.id === activeLeagueId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📊 Tabla de Posiciones" size="lg">
      <div className="standings-modal">
        {/* Tabs de liga */}
        {leagues.length > 1 && (
          <div className="standings-modal__tabs">
            {leagues.map((l) => (
              <button
                key={l.id}
                className={`standings-tab ${activeLeagueId === l.id ? 'standings-tab--active' : ''}`}
                onClick={() => setActiveLeagueId(l.id)}
              >
                {l.flag} {l.name}
              </button>
            ))}
          </div>
        )}

        {/* Leyenda de zonas */}
        <div className="standings-modal__legend">
          {Object.entries(ZONE_COLORS).map(([key, z]) => (
            <span
              key={key}
              className="legend-chip"
              style={{ borderColor: z.border, background: z.bg }}
            >
              {z.label}
            </span>
          ))}
        </div>

        {/* Tablas por división */}
        {activeLeague && (
          <div className="standings-modal__divisions">
            {activeLeague.divisions.map((div) => (
              activeLeagueId === player?.leagueId && div.level === player?.divisionLevel
                ? (
                  <DynamicLocalDivision
                    key={div.level}
                    save={save}
                    division={div}
                  />
                ) : (
                  <DivisionTable
                    key={div.level}
                    division={div}
                  />
                )
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default StandingsModal;
