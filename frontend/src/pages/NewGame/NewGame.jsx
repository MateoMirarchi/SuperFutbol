/**
 * NewGame.jsx
 * Pantalla de configuración de nueva partida.
 * Paso 1: Seleccionar cantidad de jugadores, ligas y competencias.
 */

import { useState } from 'react';
import Button from '../../components/Button/Button';
import Checkbox from '../../components/Checkbox/Checkbox';
import Select from '../../components/Select/Select';
import { LEAGUES } from '../../data/leagues';
import { COMPETITIONS, getAvailableCompetitions } from '../../data/competitions';
import './NewGame.css';

// Opciones de cantidad de jugadores (1–4)
const PLAYER_COUNT_OPTIONS = [1, 2, 3, 4].map((n) => ({
  value: n,
  label: `${n} jugador${n > 1 ? 'es' : ''}`,
}));

function NewGame({ onNext, onBack }) {
  const [playerCount, setPlayerCount] = useState(1);
  const [selectedLeagues, setSelectedLeagues] = useState([]);
  const [selectedCompetitions, setSelectedCompetitions] = useState([]);

  // Competencias disponibles según ligas elegidas
  const availableCompetitions = getAvailableCompetitions(selectedLeagues);

  // Validación: al menos una liga elegida
  const canContinue = selectedLeagues.length > 0;

  // Alternar selección de liga
  function toggleLeague(leagueId) {
    setSelectedLeagues((prev) => {
      const next = prev.includes(leagueId)
        ? prev.filter((id) => id !== leagueId)
        : [...prev, leagueId];

      // Quitar competencias que ya no aplican al remover una liga
      const nextAvailable = getAvailableCompetitions(next).map((c) => c.id);
      setSelectedCompetitions((prevComps) =>
        prevComps.filter((id) => nextAvailable.includes(id))
      );

      return next;
    });
  }

  // Alternar selección de competencia
  function toggleCompetition(compId) {
    setSelectedCompetitions((prev) =>
      prev.includes(compId)
        ? prev.filter((id) => id !== compId)
        : [...prev, compId]
    );
  }

  function handleNext() {
    onNext({ playerCount, selectedLeagues, selectedCompetitions });
  }

  return (
    <div className="new-game animate-fade-in">
      <div className="new-game__container">

        {/* Cabecera */}
        <header className="new-game__header">
          <button className="new-game__back" onClick={onBack} aria-label="Volver">
            ← Volver
          </button>
          <h1 className="new-game__title">Nueva Partida</h1>
          <p className="new-game__desc">
            Configurá tu mundo: elegí jugadores, ligas y competencias.
          </p>
        </header>

        <div className="new-game__body">
          {/* Cantidad de jugadores */}
          <section className="new-game__section">
            <h2 className="new-game__section-title">👥 Cantidad de jugadores</h2>
            <Select
              id="player-count"
              label="Jugadores humanos"
              value={playerCount}
              onChange={(e) => setPlayerCount(Number(e.target.value))}
              options={PLAYER_COUNT_OPTIONS}
            />
          </section>

          {/* Ligas */}
          <section className="new-game__section">
            <h2 className="new-game__section-title">🏟️ Ligas a incluir</h2>
            <p className="new-game__section-hint">
              Seleccioná al menos una liga. Las competencias disponibles se actualizan automáticamente.
            </p>
            <div className="new-game__grid">
              {LEAGUES.map((league) => (
                <div
                  key={league.id}
                  className={`league-card ${selectedLeagues.includes(league.id) ? 'league-card--selected' : ''}`}
                  onClick={() => toggleLeague(league.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && toggleLeague(league.id)}
                  aria-pressed={selectedLeagues.includes(league.id)}
                >
                  <span className="league-card__flag">{league.flag}</span>
                  <span className="league-card__name">{league.name}</span>
                  <span className="league-card__country">{league.country}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Competencias */}
          <section className="new-game__section">
            <h2 className="new-game__section-title">🏆 Competencias</h2>
            {availableCompetitions.length === 0 ? (
              <p className="new-game__section-hint">
                Seleccioná al menos una liga para ver las competencias disponibles.
              </p>
            ) : (
              <div className="new-game__competitions">
                {availableCompetitions.map((comp) => (
                  <div key={comp.id} className="competition-item">
                    <Checkbox
                      id={`comp-${comp.id}`}
                      checked={selectedCompetitions.includes(comp.id)}
                      onChange={() => toggleCompetition(comp.id)}
                      label=""
                    />
                    <div className="competition-item__info">
                      <span className="competition-item__icon">{comp.icon}</span>
                      <div>
                        <strong className="competition-item__name">{comp.name}</strong>
                        <p className="competition-item__desc">{comp.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer con botón Siguiente */}
        <footer className="new-game__footer">
          <span className="new-game__footer-hint">
            {!canContinue && 'Elegí al menos una liga para continuar'}
          </span>
          <Button
            variant="primary"
            size="lg"
            onClick={handleNext}
            disabled={!canContinue}
          >
            Siguiente →
          </Button>
        </footer>
      </div>
    </div>
  );
}

export default NewGame;
