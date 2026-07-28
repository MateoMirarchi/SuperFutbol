import { useState, useRef, useEffect } from 'react';
import StandingsModal from './StandingsModal';
import CalendarModal from './CalendarModal';
import LoanModal from './LoanModal';
import DtModal from './DtModal';
import SearchModal from './SearchModal';
import SellModal from './SellModal';
import ContractModal from './ContractModal';
import LoanOutModal from './LoanOutModal';
import MatchPrepModal from './MatchPrepModal';
import MatchSimulationScreen from './MatchSimulationScreen';
import ConfidenceBar from '../../components/ConfidenceBar/ConfidenceBar';
import PlayerList from '../../components/PlayerList/PlayerList';
import PlayerContextMenu from '../../components/PlayerContextMenu/PlayerContextMenu';
import PlayerSidePanel from '../../components/PlayerSidePanel/PlayerSidePanel';
import useConfidence from '../../hooks/useConfidence';
import useNextMatch from '../../hooks/useNextMatch';
import { COMPETITIONS } from '../../data/competitions';
import { getActiveParticipant, updateParticipantCollection } from '../../utils/saveState';
import { formatMoneyShort, kToMoney } from '../../utils/currency';
import { evaluateLoanOffer, evaluateSaleOffer } from '../../utils/transferMarket';
import './Dashboard.css';

function Dashboard({ activeSave, onSave, onSettings, onExit, onMarket, onUpdateSave }) {
  // Toolbar state
  const [openMenu, setOpenMenu] = useState(null);
  const [showStandings, setShowStandings] = useState(false);
  const [calendarMode, setCalendarMode] = useState(null);
  const [showLoan, setShowLoan] = useState(false);
  const [showDt, setShowDt] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [simulatingMatch, setSimulatingMatch] = useState(false);
  const [simulationError, setSimulationError] = useState('');
  const [showMatchPrep, setShowMatchPrep] = useState(false);
  const [matchSimulationOpen, setMatchSimulationOpen] = useState(false);
  const [pendingPreparation, setPendingPreparation] = useState(null);

  // Plantilla / jugador seleccionado
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  // Modales de plantilla
  const [sellTarget, setSellTarget] = useState(null);
  const [contractTarget, setContractTarget] = useState(null);
  const [loanTarget, setLoanTarget] = useState(null);

  const toolbarRef = useRef(null);

  // Cierra el dropdown al hacer clic fuera
  useEffect(() => {
    function handleOutsideClick(e) {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const player1 = getActiveParticipant(activeSave);
  const selectedCompetitions = activeSave.config?.selectedCompetitions ?? [];

  // Competencias continentales seleccionadas
  const continentalComps = COMPETITIONS.filter(
    (c) =>
      ['libertadores', 'sudamericana', 'champions', 'europa'].includes(c.id) &&
      selectedCompetitions.includes(c.id)
  );
  const hasContinental = continentalComps.length > 0;

  // Hooks de dominio
  const { confidence } = useConfidence(activeSave, onUpdateSave);
  const nextMatch      = useNextMatch(activeSave);

  // Plantilla del equipo (retrocompatibilidad: puede no existir en saves viejos)
  const squad  = activeSave.squad ?? [];
  const budget = player1?.budget ?? 0;

  // Helpers de toolbar
  function toggleMenu(name) {
    setOpenMenu((prev) => (prev === name ? null : name));
  }

  function handleSave() {
    onSave();
    setOpenMenu(null);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  }

  function handleOpenCalendar(mode) {
    setCalendarMode(mode);
    setOpenMenu(null);
  }

  function handleLoan(loan) {
    if (!player1) return;

    const currentBudget = player1.budget ?? 0;
    onUpdateSave({
      finances: {
        ...(activeSave.finances ?? {}),
        loans: [...(activeSave.finances?.loans ?? []), loan],
      },
      players: updateParticipantCollection(activeSave.players, player1.id, {
        budget: currentBudget + loan.amount,
      }),
    });
  }

  function handleUpdateParticipants(players) {
    onUpdateSave({ players });
  }

  // Handlers de plantilla
  function handlePlayerLeftClick(player) {
    setSelectedPlayer((prev) => (prev?.id === player.id ? null : player));
    setContextMenu(null);
  }

  function handlePlayerRightClick(player, event) {
    setContextMenu({ player, x: event.clientX, y: event.clientY });
    setSelectedPlayer(null);
  }

  /** Vende un jugador: lo elimina de la plantilla y suma el precio al presupuesto. */
  function handleSellConfirm(player, salePrice) {
    if (!player1) return;

    const outcome = evaluateSaleOffer({
      player,
      askingPrice: salePrice,
      sellerTeamId: player1.teamId,
      teamPool: activeSave.teamPool ?? [],
    });

    if (!outcome.accepted) {
      return outcome;
    }

    const newSquad  = squad.filter((p) => p.id !== player.id);
    const newBudget = (player1.budget ?? 0) + outcome.saleAmount;
    onUpdateSave({
      squad: newSquad,
      players: updateParticipantCollection(activeSave.players, player1.id, {
        budget: newBudget,
      }),
    });
    if (selectedPlayer?.id === player.id) setSelectedPlayer(null);

    return outcome;
  }

  /** Renueva contrato: extiende el contractEndSeason del jugador. */
  function handleContractConfirm(player, extraSeasons) {
    if (!player1) return;

    const renewalCost = kToMoney(player.salary * 3 * extraSeasons);
    const newBudget   = Math.max(0, (player1.budget ?? 0) - renewalCost);
    const newSquad     = squad.map((p) =>
      p.id === player.id
        ? { ...p, contractEndSeason: p.contractEndSeason + extraSeasons }
        : p
    );
    onUpdateSave({
      squad: newSquad,
      players: updateParticipantCollection(activeSave.players, player1.id, {
        budget: newBudget,
      }),
    });
    if (selectedPlayer?.id === player.id) {
      setSelectedPlayer((prev) => ({
        ...prev,
        contractEndSeason: prev.contractEndSeason + extraSeasons,
      }));
    }
  }

  /** Cambia el estado de prestamo del jugador. */
  function handleLoanConfirm(player, newStatus) {
    if (!player1) return null;

    if (newStatus === 'available') {
      const newSquad = squad.map((p) =>
        p.id === player.id
          ? { ...p, status: 'available', loanTeamId: null, loanTeamName: '' }
          : p
      );
      onUpdateSave({ squad: newSquad });
      if (selectedPlayer?.id === player.id) {
        setSelectedPlayer((prev) => ({ ...prev, status: 'available', loanTeamId: null, loanTeamName: '' }));
      }
      return { accepted: true, loanTeam: null, returned: true, reason: '' };
    }

    const outcome = evaluateLoanOffer({
      player,
      ownerTeamId: player1.teamId,
      teamPool: activeSave.teamPool ?? [],
    });

    if (!outcome.accepted) {
      return outcome;
    }

    const newSquad = squad.map((p) =>
      p.id === player.id
        ? {
            ...p,
            status: newStatus,
            loanTeamId: outcome.loanTeam?.id ?? null,
            loanTeamName: outcome.loanTeam?.name ?? '',
          }
        : p
    );
    onUpdateSave({ squad: newSquad });
    if (selectedPlayer?.id === player.id) {
      setSelectedPlayer((prev) => ({
        ...prev,
        status: newStatus,
        loanTeamId: outcome.loanTeam?.id ?? null,
        loanTeamName: outcome.loanTeam?.name ?? '',
      }));
    }

    return outcome;
  }

  // Calculos de presupuesto
  const totalSalary = squad.reduce((sum, p) => sum + (p.salary ?? 0), 0);

  // Icono del proximo partido
  const competitionIcon =
    nextMatch?.competition === 'continental' ? '\uD83C\uDF10' : '\uD83C\uDFDF\uFE0F';

  function handleSimulateMatch() {
    if (!nextMatch || simulatingMatch || !player1?.teamId) return;
    setSimulationError('');
    setPendingPreparation(null);
    setMatchSimulationOpen(false);
    setShowMatchPrep(true);
  }

  function handleConfirmPreparation(preparation) {
    setPendingPreparation(preparation);
    setShowMatchPrep(false);
    setSimulatingMatch(true);
    setMatchSimulationOpen(true);
  }

  if (matchSimulationOpen && pendingPreparation) {
    return (
      <MatchSimulationScreen
        save={activeSave}
        preparation={pendingPreparation}
        onApplySave={(updates) => {
          setMatchSimulationOpen(false);
          setPendingPreparation(null);
          setSimulatingMatch(false);
          onUpdateSave(updates);
        }}
        onExit={() => {
          setMatchSimulationOpen(false);
          setPendingPreparation(null);
          setSimulatingMatch(false);
        }}
      />
    );
  }

  return (
    <div className="dashboard">
      {/* Barra superior */}
      <header className="dashboard__topbar" ref={toolbarRef}>
        <div className="dashboard__brand">
          <span className="dashboard__game-name">{activeSave.name}</span>
          <span className="dashboard__season-badge">
            T{activeSave.season} &middot; Fecha {activeSave.matchday}
          </span>
        </div>

        <nav className="dashboard__toolbar">
          {/* Engranaje / Opciones */}
          <div className={`toolbar-item ${openMenu === 'gear' ? 'toolbar-item--open' : ''}`}>
            <button
              className="toolbar-item__btn"
              onClick={() => toggleMenu('gear')}
              title="Opciones"
              aria-expanded={openMenu === 'gear'}
            >
              {'\u2699\uFE0F'}
            </button>
            {openMenu === 'gear' && (
              <ul className="toolbar-item__dropdown">
                <li>
                  <button onClick={handleSave}>{'\uD83D\uDCBE'} Guardar</button>
                </li>
                <li>
                  <button onClick={() => { onSettings(); setOpenMenu(null); }}>
                    {'\uD83D\uDD27'} Configuraci&oacute;n
                  </button>
                </li>
                <li className="toolbar-item__separator">
                  <button
                    className="toolbar-item__danger"
                    onClick={() => { onExit(); setOpenMenu(null); }}
                  >
                    {'\uD83D\uDEAA'} Salir al men&uacute;
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* Calendario */}
          <div className={`toolbar-item ${openMenu === 'calendar' ? 'toolbar-item--open' : ''}`}>
            <button
              className="toolbar-item__btn"
              onClick={() => toggleMenu('calendar')}
              title="Calendarios"
              aria-expanded={openMenu === 'calendar'}
            >
              {'\uD83D\uDCC5'}
            </button>
            {openMenu === 'calendar' && (
              <ul className="toolbar-item__dropdown">
                <li>
                  <button onClick={() => handleOpenCalendar('local')}>
                    {'\uD83C\uDFDF\uFE0F'} Torneo Local
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => hasContinental && handleOpenCalendar('continental')}
                    disabled={!hasContinental}
                    className={!hasContinental ? 'toolbar-item__disabled' : ''}
                    title={!hasContinental ? 'No participas en copa continental' : ''}
                  >
                    {'\uD83C\uDF10'} Copa Continental
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenCalendar('cup')}>
                    {'\uD83C\uDFC6'} Copa Local (cuadro)
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* Finanzas / Prestamo */}
          <div className="toolbar-item">
            <button
              className="toolbar-item__btn"
              onClick={() => { setShowLoan(true); setOpenMenu(null); }}
              title="Finanzas / Pr\u00E9stamo"
            >
              {'\uD83D\uDCB0'}
            </button>
          </div>

          {/* Tabla de posiciones */}
          <div className="toolbar-item">
            <button
              className="toolbar-item__btn"
              onClick={() => { setShowStandings(true); setOpenMenu(null); }}
              title="Tabla de posiciones"
            >
              {'\uD83D\uDCCA'}
            </button>
          </div>

          {/* Mercado */}
          <div className="toolbar-item">
            <button className="toolbar-item__btn" onClick={onMarket} title="Mercado">
              {'\uD83C\uDFEA'}
            </button>
          </div>

          {/* Buscador */}
          <div className="toolbar-item">
            <button
              className="toolbar-item__btn"
              onClick={() => { setShowSearch(true); setOpenMenu(null); }}
              title="Buscar jugadores"
            >
              {'\uD83D\uDD0D'}
            </button>
          </div>

          {/* Directores Tecnicos */}
          <div className="toolbar-item">
            <button
              className="toolbar-item__btn"
              onClick={() => { setShowDt(true); setOpenMenu(null); }}
              title="Directores T\u00E9cnicos"
            >
              {'\uD83D\uDC68\u200D\uD83D\uDCBC'}
            </button>
          </div>
        </nav>
      </header>

      {/* Aviso de guardado */}
      {savedNotice && (
        <div className="dashboard__save-notice animate-fade-in">
          {'\u2705'} Partida guardada
        </div>
      )}

      {/* Contenido principal */}
      <main className="dashboard__main">

        {/* Columna izquierda */}
        <aside className="dashboard__left">
          {/* Barras de confianza */}
          <ConfidenceBar
            confidence={confidence}
            teamName={player1?.teamName ?? 'Sin club'}
          />

          {/* Panel lateral del jugador seleccionado (click izquierdo) */}
          {selectedPlayer && (
            <PlayerSidePanel
              player={selectedPlayer}
              onContract={(p) => { setContractTarget(p); setSelectedPlayer(null); }}
              onSell={(p)     => { setSellTarget(p);     setSelectedPlayer(null); }}
              onLoan={(p)     => { setLoanTarget(p);     setSelectedPlayer(null); }}
              onClose={() => setSelectedPlayer(null)}
            />
          )}

          {/* Proximo partido */}
          <div className="dashboard__next-match">
            <span className="dashboard__next-match-title">Pr&oacute;ximo partido</span>
            {nextMatch ? (
              <div className="dashboard__next-match-info">
                <div className="dashboard__next-match-rival">
                  {competitionIcon} vs <strong>{nextMatch.rival}</strong>
                  <span className={`dashboard__next-match-venue ${nextMatch.isHome ? 'home' : 'away'}`}>
                    {nextMatch.isHome ? '(Local)' : '(Visitante)'}
                  </span>
                </div>
                <div className="dashboard__next-match-meta">
                  <span>{nextMatch.tournamentName}</span>
                  <span>&middot;</span>
                  <span>Fecha {nextMatch.matchday}</span>
                </div>
                <button
                  type="button"
                  className="dashboard__simulate-btn"
                  onClick={handleSimulateMatch}
                  disabled={simulatingMatch}
                >
                  {simulatingMatch ? 'Simulando...' : 'Jugar Partido'}
                </button>
                {simulationError && (
                  <div className="dashboard__simulate-error">{simulationError}</div>
                )}
                {activeSave.lastMatchResult && (
                  <div className="dashboard__last-result">
                    <div className="dashboard__last-result-score">
                      <strong>{activeSave.lastMatchResult.homeTeam?.name}</strong>
                      <span>
                        {activeSave.lastMatchResult.result.homeGoals}
                        {' - '}
                        {activeSave.lastMatchResult.result.awayGoals}
                        {activeSave.lastMatchResult.result.homePenalties !== null && (
                          ` (${activeSave.lastMatchResult.result.homePenalties}-${activeSave.lastMatchResult.result.awayPenalties} pen)`
                        )}
                      </span>
                      <strong>{activeSave.lastMatchResult.awayTeam?.name}</strong>
                    </div>
                    <div className="dashboard__last-result-meta">
                      {activeSave.lastMatchResult.tournamentName} · {activeSave.lastMatchResult.label}
                    </div>
                    {!!activeSave.lastMatchResult.result.scorers?.length && (
                      <ul className="dashboard__scorers">
                        {activeSave.lastMatchResult.result.scorers.map((goal, index) => (
                          <li key={`${goal.playerId}-${goal.minute}-${index}`}>
                            <span>{goal.minute}'</span>
                            <span>{goal.playerName}</span>
                            <span>{goal.position} · {goal.power}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="dashboard__next-match-empty">
                Sin partido programado. Genera el calendario desde {'\uD83D\uDCC5'}.
              </p>
            )}
          </div>
        </aside>

        {/* Columna derecha: plantilla */}
        <section className="dashboard__right">
          <div className="dashboard__squad-header">
            <span className="dashboard__squad-title">{'\uD83D\uDC55'} Plantilla</span>
            <span className="dashboard__squad-hint">
              Click izq para ver opciones &middot; Click der para men&uacute; r&aacute;pido
            </span>
          </div>

          <div className="dashboard__squad-list">
            <PlayerList
              squad={squad}
              onLeftClick={handlePlayerLeftClick}
              onRightClick={handlePlayerRightClick}
              selectedId={selectedPlayer?.id ?? null}
            />
          </div>

          {/* Footer: presupuesto + cantidad */}
          <div className="dashboard__squad-footer">
            <div className="dashboard__squad-stat">
              <span>Presupuesto</span>
              <strong className="dashboard__budget">
                {formatMoneyShort(budget)}
              </strong>
            </div>
            <div className="dashboard__squad-stat">
              <span>Masa salarial</span>
              <strong>${totalSalary.toLocaleString()}K/mes</strong>
            </div>
            <div className="dashboard__squad-stat">
              <span>Jugadores</span>
              <strong>{squad.length}</strong>
            </div>
          </div>
        </section>
      </main>

      {/* Menu contextual (click derecho) */}
      <PlayerContextMenu
        player={contextMenu?.player ?? null}
        position={{ x: contextMenu?.x ?? 0, y: contextMenu?.y ?? 0 }}
        onContract={(p) => { setContractTarget(p); setContextMenu(null); }}
        onSell={(p)     => { setSellTarget(p);     setContextMenu(null); }}
        onLoan={(p)     => { setLoanTarget(p);     setContextMenu(null); }}
        onClose={() => setContextMenu(null)}
      />

      {/* Modales de plantilla */}
      <SellModal
        isOpen={sellTarget !== null}
        player={sellTarget}
        onClose={() => setSellTarget(null)}
        onConfirm={handleSellConfirm}
      />

      <ContractModal
        isOpen={contractTarget !== null}
        player={contractTarget}
        currentSeason={activeSave.season}
        onClose={() => setContractTarget(null)}
        onConfirm={handleContractConfirm}
      />

      <LoanOutModal
        isOpen={loanTarget !== null}
        player={loanTarget}
        onClose={() => setLoanTarget(null)}
        onConfirm={handleLoanConfirm}
      />

      {/* Modales existentes */}
      <StandingsModal
        isOpen={showStandings}
        onClose={() => setShowStandings(false)}
        save={activeSave}
      />

      <CalendarModal
        isOpen={calendarMode !== null}
        mode={calendarMode}
        onClose={() => setCalendarMode(null)}
        save={activeSave}
        hasContinental={hasContinental}
        continentalComps={continentalComps}
        onUpdateSave={(updates) => onUpdateSave(updates)}
      />

      <LoanModal
        isOpen={showLoan}
        onClose={() => setShowLoan(false)}
        save={activeSave}
        onLoan={handleLoan}
      />

      <DtModal
        isOpen={showDt}
        onClose={() => setShowDt(false)}
        save={activeSave}
        onUpdateParticipants={handleUpdateParticipants}
      />

      <SearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />

      <MatchPrepModal
        isOpen={showMatchPrep}
        squad={squad}
        previousSetup={activeSave.matchPreparation}
        nextMatch={nextMatch}
        onClose={() => {
          setShowMatchPrep(false);
          setPendingPreparation(null);
          setMatchSimulationOpen(false);
        }}
        onConfirm={handleConfirmPreparation}
      />
    </div>
  );
}

export default Dashboard;
