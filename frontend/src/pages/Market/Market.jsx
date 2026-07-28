/**
 * Market.jsx
 * Pantalla de Mercado de Transferencias.
 * Muestra equipos reales desde el backend (no datos hardcodeados).
 * Los equipos se filtran según las ligas seleccionadas en la partida.
 */

import { useState } from 'react';
import Button from '../../components/Button/Button';
import useLeagueTeams from '../../hooks/useLeagueTeams';
import './Market.css';

function Market({ save, onBack }) {
  const selectedLeagueIds = save.config?.selectedLeagues ?? [];

  // Equipos desde el backend
  const { getLeaguesList, loading, error } = useLeagueTeams();
  const leagues = getLeaguesList(selectedLeagueIds);

  const [activeLeagueId, setActiveLeagueId] = useState(null);
  const [activeDivision, setActiveDivision] = useState(1);

  // Usa el primer ID de liga disponible como default (se resuelve tras la carga)
  const resolvedLeagueId = activeLeagueId ?? leagues[0]?.id ?? null;
  const activeLeague = leagues.find((l) => l.id === resolvedLeagueId);
  const activeDivData = activeLeague?.divisions.find((d) => d.level === activeDivision);

  return (
    <div className="market animate-fade-in">
      {/* Cabecera */}
      <header className="market__header">
        <button className="market__back" onClick={onBack} aria-label="Volver al dashboard">
          ← Volver
        </button>
        <h1 className="market__title">🏪 Mercado de Transferencias</h1>
        <span className="market__season">T{save.season ?? 1} · F{save.matchday ?? 1}</span>
      </header>

      <div className="market__body">
        {/* Loading / Error */}
        {loading && <p className="market__loading">⏳ Cargando equipos…</p>}
        {error && <p className="market__error">❌ {error}</p>}

        {!loading && !error && (
          <>
            {/* Tabs de liga */}
            <nav className="market__league-tabs">
              {leagues.map((l) => (
                <button
                  key={l.id}
                  className={`market__league-tab ${resolvedLeagueId === l.id ? 'market__league-tab--active' : ''}`}
                  onClick={() => { setActiveLeagueId(l.id); setActiveDivision(1); }}
                >
                  {l.flag} {l.name}
                </button>
              ))}
            </nav>

            {activeLeague && (
              <>
                {/* Tabs de división */}
                <nav className="market__div-tabs">
                  {activeLeague.divisions.map((div) => (
                    <button
                      key={div.level}
                      className={`market__div-tab ${activeDivision === div.level ? 'market__div-tab--active' : ''}`}
                      onClick={() => setActiveDivision(div.level)}
                    >
                      Div {div.level} — {div.name}
                    </button>
                  ))}
                </nav>

                {/* Lista de equipos */}
                {activeDivData && (
                  <div className="market__teams">
                    {activeDivData.teams.map((team) => (
                      <div key={team.id} className="market-team-card">
                        <div className="market-team-card__info">
                          <span className="market-team-card__name">{team.name}</span>
                          <span className="market-team-card__city">📍 {team.city}</span>
                          <div className="market-team-card__prestige-bar">
                            <div
                              className="market-team-card__prestige-fill"
                              style={{ width: `${team.prestige}%` }}
                            />
                          </div>
                          <span className="market-team-card__prestige-label">
                            Prestigio: {team.prestige}
                          </span>
                        </div>
                        <div className="market-team-card__actions">
                          <Button variant="ghost" size="sm" disabled>
                            Ver plantilla
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {leagues.length === 0 && (
              <p className="market__empty">
                No hay equipos cargados para las ligas de esta partida.
                Un administrador debe cargarlos desde el gestor de equipos.
              </p>
            )}
          </>
        )}

        {/* Nota informativa */}
        <div className="market__coming-soon">
          <span>🔜</span>
          <p>
            La compra y venta de jugadores estará disponible próximamente.
            <br />
            Podrás fichar y vender jugadores de todas las ligas seleccionadas.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Market;
