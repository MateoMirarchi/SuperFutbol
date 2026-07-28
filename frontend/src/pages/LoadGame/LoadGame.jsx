/**
 * LoadGame.jsx
 * Modal con lista de partidas guardadas.
 * Permite continuar desde el progreso guardado o eliminar una partida.
 */

import Modal from '../../components/Modal/Modal';
import Button from '../../components/Button/Button';
import { formatDate } from '../../utils/gameHelpers';
import './LoadGame.css';

function LoadGame({ isOpen, onClose, saves, onLoad, onDelete }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📂 Cargar Partida"
      size="md"
    >
      <div className="load-game">
        {saves.length === 0 ? (
          <div className="load-game__empty">
            <span className="load-game__empty-icon">🏟️</span>
            <p>No hay partidas guardadas aún.</p>
            <p className="load-game__empty-hint">
              Empezá una nueva partida desde el menú principal.
            </p>
          </div>
        ) : (
          <ul className="load-game__list">
            {saves.map((save) => (
              <li key={save.id} className="save-card">
                <div className="save-card__info">
                  <span className="save-card__team">
                    {save.name ?? 'Partida'}
                  </span>
                  <span className="save-card__date">
                    Guardado: {formatDate(save.updatedAt)}
                  </span>
                </div>
                <div className="save-card__actions">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onLoad(save.id)}
                  >
                    Continuar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(save.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}

export default LoadGame;
