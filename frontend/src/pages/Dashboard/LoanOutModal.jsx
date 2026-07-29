/**
 * LoanOutModal.jsx
 * Modal para poner a un jugador disponible para préstamo
 * o cancelar la disponibilidad de préstamo.
 *
 * Separación: pages/Dashboard/ → modal de dominio específico del dashboard.
 * Props:
 *   isOpen      boolean
 *   player      object | null
 *   onClose     () => void
 *   onConfirm   (player, newStatus) => void  – newStatus: 'loan' | 'available'
 */

import { useEffect, useState } from 'react';
import Modal from '../../components/Modal/Modal';
import Button from '../../components/Button/Button';
import { normalizePosition } from '../../utils/teamDbUtils';
import './LoanOutModal.css';

function LoanOutModal({ isOpen, player, onClose, onConfirm }) {
  const [marketFeedback, setMarketFeedback] = useState('');

  useEffect(() => {
    setMarketFeedback('');
  }, [player, isOpen]);

  if (!player) return null;

  const isOnLoan   = player.status === 'loan';
  const newStatus  = isOnLoan ? 'available' : 'loan';
  const position   = normalizePosition(player.position);

  const title      = isOnLoan ? '🔄 Cancelar préstamo' : '🔄 Disponible para préstamo';
  const actionText = isOnLoan
    ? 'El jugador volverá a estar disponible para el equipo.'
    : 'El jugador quedará disponible para ser solicitado en préstamo por otros clubes.';

  async function handleConfirm() {
    const outcome = await onConfirm(player, newStatus);

    if (outcome?.accepted) {
      if (outcome.returned) {
        onClose();
        return;
      }

      setMarketFeedback(
        outcome.loanTeam
          ? `${outcome.loanTeam.name} acepto el prestamo.`
          : 'Prestamo confirmado.'
      );
      onClose();
      return;
    }

    setMarketFeedback(outcome?.reason || 'Ningun club acepto el prestamo.');
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="loan-out-modal">
        {/* Info jugador */}
        <div className="loan-out-modal__player">
          <span className={`loan-out-modal__pos loan-out-modal__pos--${position}`}>
            {position}
          </span>
          <div className="loan-out-modal__info">
            <span className="loan-out-modal__name">
              {player.firstName} {player.lastName}
            </span>
            <span className="loan-out-modal__sub">
              Potencia {player.power} · ${player.salary}K/mes
            </span>
          </div>
        </div>

        {/* Descripción de la acción */}
        <p className="loan-out-modal__desc">{actionText}</p>

        {/* Estado actual */}
        <div className="loan-out-modal__status">
          <span>Estado actual:</span>
          <strong className={isOnLoan ? 'loan-out-modal__status--loan' : 'loan-out-modal__status--ok'}>
            {isOnLoan ? '🔄 En préstamo' : '✅ Disponible'}
          </strong>
        </div>

        {marketFeedback && (
          <p className="loan-out-modal__desc">{marketFeedback}</p>
        )}

        {/* Acciones */}
        <div className="loan-out-modal__footer">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleConfirm}>
            {isOnLoan ? 'Volver al equipo' : 'Confirmar préstamo'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default LoanOutModal;
