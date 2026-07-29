/**
 * App.jsx
 * Componente raíz de la aplicación.
 * Gestiona la navegación entre pantallas mediante un estado de "vista activa".
 *
 * Vistas posibles:
 *   'main'        → Menú principal
 *   'new-game'    → Configuración de nueva partida
 *   'team-select' → Selección de equipo y nombre de partida
 *   'dashboard'   → Pantalla principal de juego
 *   'market'      → Mercado de transferencias
 *   'settings'    → Configuración
 */

import { useState } from 'react';
import MainMenu from './pages/MainMenu/MainMenu';
import NewGame from './pages/NewGame/NewGame';
import TeamSelection from './pages/TeamSelection/TeamSelection';
import LoadGame from './pages/LoadGame/LoadGame';
import Settings from './pages/Settings/Settings';
import Dashboard from './pages/Dashboard/Dashboard';
import Market from './pages/Market/Market';
import TeamManager from './pages/TeamManager/TeamManager';
import useGameState from './hooks/useGameState';
import useAdminAuth from './hooks/useAdminAuth';
import { getEquipoDetalle } from './services/api';
import LoginModal from './components/LoginModal/LoginModal';
import './styles/animations.css';

function App() {
  const adminAuth = useAdminAuth();
  const [view, setView] = useState('main');
  const [loadGameOpen, setLoadGameOpen] = useState(false);
  const [pendingConfig, setPendingConfig] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  // Guarda a qué vista volver al cerrar Settings
  const [settingsReturnView, setSettingsReturnView] = useState('main');

  const { saves, activeSave, createNewGame, updateSave, deleteSave, loadSave } = useGameState();

  function handleNewGameNext(config) {
    setPendingConfig(config);
    setView('team-select');
  }

  async function handleTeamConfirm(players, gameName, allTeams) {
    let teamRosters = {};

    try {
      const uniqueTeamIds = [...new Set((allTeams ?? []).map((team) => String(team.id)))];
      const details = await Promise.all(
        uniqueTeamIds.map(async (teamId) => {
          try {
            const detail = await getEquipoDetalle(teamId);
            return [teamId, Array.isArray(detail?.players) ? detail.players : []];
          } catch (error) {
            console.warn(`No se pudo cargar la plantilla del equipo ${teamId}:`, error);
            return [teamId, []];
          }
        })
      );

      teamRosters = Object.fromEntries(details);
    } catch (error) {
      console.warn('No se pudieron cargar las plantillas reales para iniciar la partida:', error);
      teamRosters = {};
    }

    const playerTeamId = String(players[0]?.teamId ?? '');
    const initialTeamPlayers = Array.isArray(teamRosters[playerTeamId]) ? teamRosters[playerTeamId] : [];

    // allTeams: array plano de equipos del backend, usado por useGameState para generar el calendario
    await createNewGame(pendingConfig, players, gameName, allTeams, initialTeamPlayers, teamRosters);
    setView('dashboard');
  }

  function handleLoadSave(saveId) {
    loadSave(saveId);
    setLoadGameOpen(false);
    setView('dashboard');
  }

  function handleDeleteSave(saveId) {
    if (window.confirm('¿Eliminar esta partida? Esta acción no se puede deshacer.')) {
      deleteSave(saveId);
    }
  }

  function openSettings(returnView = 'main') {
    setSettingsReturnView(returnView);
    setView('settings');
  }

  async function handleAdminLogin(credentials) {
    try {
      setLoginError('');
      await adminAuth.login(credentials);
      setLoginOpen(false);
    } catch (error) {
      setLoginError(error.details?.error || error.message || 'No se pudo iniciar sesión.');
    }
  }

  function handleAdminLogout() {
    adminAuth.logout();
    if (view === 'team-manager') {
      setView('main');
    }
  }

  return (
    <>
      {view === 'main' && (
        <MainMenu
          onNewGame={() => setView('new-game')}
          onLoadGame={() => setLoadGameOpen(true)}
          onSettings={() => openSettings('main')}
          onManageTeams={() => setView('team-manager')}
          onOpenLogin={() => {
            setLoginError('');
            setLoginOpen(true);
          }}
          onLogout={handleAdminLogout}
          isAdmin={adminAuth.isAdmin}
          adminUser={adminAuth.admin?.usuario}
        />
      )}

      {view === 'team-manager' && adminAuth.isAdmin && (
        <TeamManager onBack={() => setView('main')} token={adminAuth.token} />
      )}

      {view === 'new-game' && (
        <NewGame
          onNext={handleNewGameNext}
          onBack={() => setView('main')}
        />
      )}

      {view === 'team-select' && pendingConfig && (
        <TeamSelection
          gameConfig={pendingConfig}
          onConfirm={handleTeamConfirm}
          onBack={() => setView('new-game')}
        />
      )}

      {view === 'dashboard' && activeSave && (
        <Dashboard
          activeSave={activeSave}
          onSave={() => updateSave(activeSave.id, {})}
          onSettings={() => openSettings('dashboard')}
          onExit={() => setView('main')}
          onMarket={() => setView('market')}
          onUpdateSave={(updates) => updateSave(activeSave.id, updates)}
        />
      )}

      {view === 'market' && activeSave && (
        <Market
          save={activeSave}
          onBack={() => setView('dashboard')}
        />
      )}

      {view === 'settings' && (
        <Settings onBack={() => setView(settingsReturnView)} />
      )}

      <LoadGame
        isOpen={loadGameOpen}
        onClose={() => setLoadGameOpen(false)}
        saves={saves}
        onLoad={handleLoadSave}
        onDelete={handleDeleteSave}
      />

      <LoginModal
        isOpen={loginOpen}
        isLoading={adminAuth.isLoading}
        error={loginError}
        onClose={() => setLoginOpen(false)}
        onSubmit={handleAdminLogin}
      />
    </>
  );
}

export default App;
