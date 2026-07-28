/**
 * TeamManager.jsx
 * Pantalla de gestión de equipos y jugadores conectada al backend.
 */

import { useEffect, useState } from 'react';
import useTeamApi from '../../hooks/useTeamApi';
import TeamList from './TeamList';
import TeamDetail from './TeamDetail';
import TeamForm from './TeamForm';
import PlayerForm from './PlayerForm';
import PaisModal from './PaisModal';
import './TeamManager.css';

function TeamManager({ onBack, token }) {
  const db = useTeamApi(token);

  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [search, setSearch] = useState('');
  const [leagueFilter, setLeagueFilter] = useState('');
  const [divFilter, setDivFilter] = useState('');
  const [teamFormOpen, setTeamFormOpen] = useState(false);
  const [playerFormOpen, setPlayerFormOpen] = useState(false);
  const [paisFormOpen, setPaisFormOpen] = useState(false);
  const [paisLoading, setPaisLoading] = useState(false);
  const [paisError, setPaisError] = useState('');
  const [teamSaveError, setTeamSaveError] = useState('');
  const [playerSaveError, setPlayerSaveError] = useState('');
  const [editingTeam, setEditingTeam] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [savedNotice, setSavedNotice] = useState(false);

  function showSaved() {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  }

  useEffect(() => {
    if (selectedTeamId) {
      db.loadTeamDetail(selectedTeamId).catch(() => {});
    }
  }, [selectedTeamId]);

  const selectedTeam = db.selectedTeam;
  const selectedPlayers = db.players;

  function handleCreateTeam() {
    setEditingTeam(null);
    setTeamSaveError('');
    setTeamFormOpen(true);
  }

  async function handleCreatePais(nombre) {
    setPaisLoading(true);
    setPaisError('');
    try {
      await db.addPais(nombre);
      setPaisFormOpen(false);
      showSaved();
    } catch (err) {
      const msg = err.message || 'No se pudo crear el país.';
      setPaisError(msg);
    } finally {
      setPaisLoading(false);
    }
  }

  function handleEditTeam() {
    if (!selectedTeam) return;
    setEditingTeam({ ...selectedTeam });
    setTeamSaveError('');
    setTeamFormOpen(true);
  }

  async function handleSaveTeam(data) {
    try {
      let teamId = editingTeam?.id;

      if (editingTeam) {
        const updated = await db.saveTeam(editingTeam.id, data);
        teamId = updated.id;
      } else {
        const created = await db.createTeam(data);
        teamId = created.id;
        setSelectedTeamId(created.id);
      }

      setTeamFormOpen(false);
      await db.loadTeams();
      await db.loadTeamDetail(teamId);
      showSaved();
    } catch (error) {
      console.error('[TeamManager] Error al guardar equipo:', error);
      const msg = error.message || 'Error desconocido al guardar el equipo.';
      setTeamSaveError(`${msg} (status: ${error.status ?? 'red'})`);
    }
  }

  async function handleDeleteTeam() {
    if (!selectedTeam) return;
    if (!window.confirm(`¿Eliminar el equipo "${selectedTeam.name}" y todos sus jugadores?\nEsta acción no se puede deshacer.`)) return;

    try {
      await db.removeTeam(selectedTeamId);
      setSelectedTeamId(null);
      setSelectedPlayerId(null);
      showSaved();
    } catch (error) {
      db.setError(error.message || 'No se pudo eliminar el equipo.');
    }
  }

  function handleCreatePlayer() {
    setEditingPlayer(null);
    setPlayerSaveError('');
    setPlayerFormOpen(true);
  }

  function handleEditPlayer(player) {
    setEditingPlayer({ ...player });
    setPlayerSaveError('');
    setPlayerFormOpen(true);
  }

  async function handleSavePlayer(data) {
    try {
      const targetTeamId = Number(data.teamId);

      if (editingPlayer) {
        await db.savePlayer(editingPlayer.id, data);
      } else {
        await db.createPlayer(data);
      }

      if (targetTeamId !== selectedTeamId) {
        setSelectedTeamId(targetTeamId);
      }

      setPlayerFormOpen(false);
      await db.loadTeams();
      await db.loadTeamDetail(targetTeamId);
      showSaved();
    } catch (error) {
      console.error('[TeamManager] Error al guardar jugador:', error);
      const msg = error.message || 'Error desconocido al guardar el jugador.';
      setPlayerSaveError(`${msg} (status: ${error.status ?? 'red'})`);
    }
  }

  async function handleDeletePlayer(playerId) {
    const player = selectedPlayers.find((item) => item.id === playerId);
    if (!player) return;
    if (!window.confirm(`¿Eliminar al jugador "${player.firstName} ${player.lastName}"?`)) return;

    try {
      await db.removePlayer(playerId);
      if (selectedPlayerId === playerId) setSelectedPlayerId(null);
      await db.loadTeams();
      await db.loadTeamDetail(selectedTeamId);
      showSaved();
    } catch (error) {
      db.setError(error.message || 'No se pudo eliminar el jugador.');
    }
  }

  return (
    <div className="team-manager">
      <header className="tm-header">
        <button className="tm-back-btn" onClick={onBack} type="button">
          {'\u2190'} Volver
        </button>

        <h1 className="tm-title">
          {'\uD83D\uDCCB'} Gestionar equipos
        </h1>

        <div className="tm-header-right">
          {savedNotice && (
            <span className="tm-saved-notice">
              {'\u2713'} Guardado
            </span>
          )}
          <button className="tm-save-btn" type="button" onClick={showSaved}>
            Guardar
          </button>
        </div>
      </header>

      <div className="tm-actions">
        <button className="td-btn td-btn--primary" onClick={handleCreateTeam} type="button">
          + Crear equipo
        </button>
        <button className="td-btn td-btn--secondary" onClick={handleCreatePlayer} type="button">
          + Crear jugador
        </button>
        <button
          className="td-btn td-btn--secondary"
          onClick={() => { setPaisError(''); setPaisFormOpen(true); }}
          type="button"
        >
          + Agregar país
        </button>
        <span className="tm-db-info">
          {db.teams.length} equipos &middot; {selectedPlayers.length} jugadores en el equipo seleccionado
        </span>
      </div>

      {db.error && <div className="tm-message tm-message--error">{db.error}</div>}
      {db.loadingTeams && <div className="tm-message">Cargando equipos...</div>}

      <div className="tm-layout">
        <aside className="tm-sidebar">
          <TeamList
            teams={db.teams}
            players={selectedPlayers}
            selectedId={selectedTeamId}
            onSelect={setSelectedTeamId}
            search={search}
            leagueFilter={leagueFilter}
            divFilter={divFilter}
            onSearchChange={setSearch}
            onLeagueChange={setLeagueFilter}
            onDivChange={setDivFilter}
          />
        </aside>

        <main className="tm-main">
          {db.loadingDetail && <div className="tm-message">Cargando detalle del equipo...</div>}
          <TeamDetail
            team={selectedTeam}
            players={selectedPlayers}
            selectedPlayer={selectedPlayerId}
            onSelectPlayer={setSelectedPlayerId}
            onEditTeam={handleEditTeam}
            onDeleteTeam={handleDeleteTeam}
            onAddPlayer={handleCreatePlayer}
            onEditPlayer={handleEditPlayer}
            onDeletePlayer={handleDeletePlayer}
          />
        </main>
      </div>

      <TeamForm
        isOpen={teamFormOpen}
        team={editingTeam}
        onSave={handleSaveTeam}
        onClose={() => setTeamFormOpen(false)}
        saveError={teamSaveError}
        paises={db.paises}
      />

      <PlayerForm
        isOpen={playerFormOpen}
        player={editingPlayer}
        teams={db.teams}
        defaultTeamId={selectedTeamId ?? ''}
        onSave={handleSavePlayer}
        onClose={() => { setPlayerFormOpen(false); setPlayerSaveError(''); }}
        saveError={playerSaveError}
      />

      <PaisModal
        isOpen={paisFormOpen}
        onSave={handleCreatePais}
        onClose={() => { setPaisFormOpen(false); setPaisError(''); }}
        loading={paisLoading}
        error={paisError}
      />
    </div>
  );
}

export default TeamManager;
