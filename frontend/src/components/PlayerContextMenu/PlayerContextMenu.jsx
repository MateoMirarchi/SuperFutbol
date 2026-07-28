/**
 * PlayerContextMenu.jsx
 * Menú contextual flotante que aparece al hacer click derecho sobre un jugador.
 * Ofrece: Contrato · Vender · Préstamo.
 * Se cierra al hacer click fuera o al presionar Escape.
 *
 * Separación: components/ → UI genérica sin lógica de negocio.
 * Props:
 *   player      object | null     – jugador sobre el que se hizo click
 *   position    { x, y }          – coordenadas del mouse
 *   onContract  (player) => void
 *   onSell      (player) => void
 *   onLoan      (player) => void
 *   onClose     () => void
 */

import { useEffect, useRef } from 'react';
import './PlayerContextMenu.css';

function PlayerContextMenu({ player, position, onContract, onSell, onLoan, onClose }) {
  const menuRef = useRef(null);

  // Cerrar con Escape o click fuera
  useEffect(() => {
    if (!player) return;

    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }

    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [player, onClose]);

  if (!player) return null;

  // Ajustar posición para que no salga de la pantalla
  const style = {
    top:  position.y,
    left: position.x,
  };

  function handle(fn) {
    fn(player);
    onClose();
  }

  return (
    <ul className="ctx-menu animate-fade-in-scale" style={style} ref={menuRef} role="menu">
      <li className="ctx-menu__header">
        {player.firstName} {player.lastName}
        <span className="ctx-menu__pos">{player.position}</span>
      </li>
      <li className="ctx-menu__divider" />
      <li>
        <button className="ctx-menu__item" onClick={() => handle(onContract)} role="menuitem">
          📝 Renovar contrato
        </button>
      </li>
      <li>
        <button className="ctx-menu__item" onClick={() => handle(onSell)} role="menuitem">
          💰 Vender
        </button>
      </li>
      <li>
        <button
          className="ctx-menu__item"
          onClick={() => handle(onLoan)}
          role="menuitem"
          disabled={player.status === 'loan'}
          title={player.status === 'loan' ? 'Ya está en préstamo' : undefined}
        >
          🔄 Disponible para préstamo
        </button>
      </li>
    </ul>
  );
}

export default PlayerContextMenu;
