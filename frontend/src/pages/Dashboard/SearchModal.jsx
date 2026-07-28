/**
 * SearchModal.jsx
 * Buscador de jugadores con filtros por nombre, posición, liga y presupuesto.
 * (En esta versión inicial muestra la interfaz de búsqueda; los datos de
 *  jugadores individuales se integrarán en una iteración posterior.)
 */

import { useState } from 'react';
import Modal from '../../components/Modal/Modal';
import './SearchModal.css';

const POSITIONS = ['Todos', 'POR', 'DEF', 'MED', 'DEL'];

function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [position, setPosition] = useState('Todos');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔍 Buscar Jugadores" size="lg">
      <div className="search-modal">
        {/* Filtros */}
        <div className="search-modal__filters">
          <input
            type="text"
            className="search-modal__input"
            placeholder="Nombre del jugador…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="search-modal__positions">
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                className={`search-modal__pos-btn ${position === pos ? 'search-modal__pos-btn--active' : ''}`}
                onClick={() => setPosition(pos)}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Placeholder: datos aún no disponibles */}
        <div className="search-modal__placeholder">
          <span className="search-modal__placeholder-icon">🔍</span>
          <p className="search-modal__placeholder-title">Buscador en construcción</p>
          <p className="search-modal__placeholder-desc">
            El buscador estará disponible en la próxima actualización.
            <br />
            Podrás filtrar por posición, liga, prestige y rango de presupuesto.
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default SearchModal;
