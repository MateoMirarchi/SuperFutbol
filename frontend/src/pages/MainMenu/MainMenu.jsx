/**
 * MainMenu.jsx
 * Pantalla principal del juego con acceso normal y acceso administrador.
 */

import SoccerBall from '../../components/SoccerBall/SoccerBall';
import Button from '../../components/Button/Button';
import './MainMenu.css';

function MainMenu({
  onNewGame,
  onLoadGame,
  onSettings,
  onManageTeams,
  onOpenLogin,
  onLogout,
  isAdmin,
  adminUser,
}) {
  return (
    <div className="main-menu">
      {/* Fondo decorativo con hexágonos */}
      <div className="main-menu__bg" aria-hidden="true">
        <div className="main-menu__bg-grid" />
      </div>

      <div className="main-menu__content animate-fade-in">
        <div className="main-menu__admin-bar">
          {isAdmin ? (
            /* Modo admin: pill con nombre + botón de cerrar sesión separado */
            <>
              <span className="main-menu__admin-pill">
                <span className="main-menu__admin-icon">{'\uD83D\uDC64'}</span>
                <span>{adminUser || 'Administrador'}</span>
              </span>
              <button
                className="main-menu__logout-btn"
                type="button"
                onClick={onLogout}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            /* Sin sesión: botón para iniciar sesión */
            <button
              className="main-menu__admin-btn"
              type="button"
              onClick={onOpenLogin}
            >
              <span className="main-menu__admin-icon">{'\uD83D\uDC64'}</span>
              <span>Iniciar sesión</span>
            </button>
          )}
        </div>

        {/* Logo y título */}
        <header className="main-menu__header">
          <SoccerBall size={100} animate className="main-menu__ball" />
          <h1 className="main-menu__title">
            <span className="main-menu__title-super">SUPER</span>
            <span className="main-menu__title-futbol">FÚTBOL</span>
          </h1>
          <p className="main-menu__subtitle">
            Sé el director técnico que llevará a tu club a la gloria
          </p>
        </header>

        {/* Botones principales */}
        <nav className="main-menu__nav" aria-label="Menú principal">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onNewGame}
          >
            ⚽ Nueva Partida
          </Button>

          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onLoadGame}
          >
            {'\uD83D\uDCC2'} Cargar Partida
          </Button>

          {isAdmin && (
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              onClick={onManageTeams}
            >
              {'\uD83D\uDCCB'} Gestionar equipos
            </Button>
          )}

          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={onSettings}
          >
            {'\u2699\uFE0F'} Configuración
          </Button>
        </nav>

        {/* Versión */}
        <footer className="main-menu__footer">
          <span>SuperFútbol v0.1.0</span>
        </footer>
      </div>
    </div>
  );
}

export default MainMenu;
