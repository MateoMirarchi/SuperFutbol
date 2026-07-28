/**
 * ContractModal.jsx
 * Modal para renovar el contrato de un jugador.
 * Muestra el contrato actual y permite extenderlo 1, 2 o 3 temporadas.
 * El costo de la renovación se descuenta del presupuesto.
 *
 * Separación: pages/Dashboard/ → modal de dominio específico del dashboard.
 * Props:
 *   isOpen      boolean
 *   player      object | null
 *   currentSeason number
 *   onClose     () => void
 *   onConfirm   (player, extraSeasons) => void
 */

import { useState } from 'react';
import Modal from '../../components/Modal/Modal';
import Button from '../../components/Button/Button';
import './ContractModal.css';

// Costo aproximado de renovación: X meses de sueldo por año extra
const MONTHS_PER_RENEWAL = 3;

function ContractModal({ isOpen, player, currentSeason, onClose, onConfirm }) {
  const [extraSeasons, setExtraSeasons] = useState(1);

  if (!player) return null;

  const newEndSeason  = player.contractEndSeason + extraSeasons;
  const renewalCost   = player.salary * MONTHS_PER_RENEWAL * extraSeasons; // $K
  const seasonsLeft   = player.contractEndSeason - (currentSeason ?? 1);
  const isExpiring    = seasonsLeft <= 1;

  function handleConfirm() {
    onConfirm(player, extraSeasons);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📝 Renovar Contrato"
      size="sm"
    >
      <div className="contract-modal">
        {/* Jugador */}
        <div className="contract-modal__player">
          <span className={`contract-modal__pos contract-modal__pos--${player.position}`}>
            {player.position}
          </span>
          <div className="contract-modal__info">
            <span className="contract-modal__name">
              {player.firstName} {player.lastName}
            </span>
            <span className="contract-modal__current">
              Contrato actual: hasta T{player.contractEndSeason}
              {isExpiring && (
                <span className="contract-modal__expiring"> ⚠️ Por vencer</span>
              )}
            </span>
          </div>
        </div>

        {/* Opciones de extensión */}
        <div className="contract-modal__options">
          <span className="contract-modal__label">Extender contrato</span>
          <div className="contract-modal__btns">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={`contract-modal__opt ${extraSeasons === n ? 'contract-modal__opt--active' : ''}`}
                onClick={() => setExtraSeasons(n)}
              >
                +{n} T
              </button>
            ))}
          </div>
        </div>

        {/* Resumen */}
        <div className="contract-modal__summary">
          <div className="contract-modal__row">
            <span>Nuevo fin de contrato</span>
            <strong>Temporada {newEndSeason}</strong>
          </div>
          <div className="contract-modal__row">
            <span>Costo de renovación</span>
            <strong className="contract-modal__cost">${renewalCost.toLocaleString()}K</strong>
          </div>
        </div>

        {/* Acciones */}
        <div className="contract-modal__footer">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleConfirm}>
            Confirmar renovación
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ContractModal;
