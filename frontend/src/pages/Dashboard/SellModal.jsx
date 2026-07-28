/**
 * SellModal.jsx
 * Modal para vender un jugador de la plantilla.
 * Muestra la información del jugador, su valor de mercado y permite
 * al DT ingresar un precio de venta. Al confirmar, el jugador es
 * eliminado de la plantilla y el monto se suma al presupuesto.
 *
 * Separación: pages/Dashboard/ → modal de dominio específico del dashboard.
 * Props:
 *   isOpen      boolean
 *   player      object | null
 *   onClose     () => void
 *   onConfirm   (player, salePrice) => void
 */

import { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import Button from '../../components/Button/Button';
import { formatMoneyFull, formatMoneyShort } from '../../utils/currency';
import { normalizePosition } from '../../utils/teamDbUtils';
import './SellModal.css';

function parseSalePrice(rawValue) {
  const numericValue = Number.parseFloat(String(rawValue).replace(',', '.'));
  if (!Number.isFinite(numericValue) || numericValue <= 0) return 0;

  return Math.round(numericValue);
}

function SellModal({ isOpen, player, onClose, onConfirm }) {
  const [salePrice, setSalePrice] = useState('');
  const [marketFeedback, setMarketFeedback] = useState('');

  // Pre-llenar con el valor de mercado al abrir
  useEffect(() => {
    if (player) {
      setSalePrice(String(Math.round(Number(player.value ?? 0))));
      setMarketFeedback('');
    }
  }, [player]);

  if (!player) return null;

  const salePriceNum = parseSalePrice(salePrice);
  const marketValue  = Number(player.value ?? 0);
  const pctOfMarket  = marketValue > 0 ? Math.round((salePriceNum / marketValue) * 100) : 0;
  const position = normalizePosition(player.position);

  function getPriceClass() {
    if (pctOfMarket >= 110) return 'sell-modal__price--high';
    if (pctOfMarket >= 90)  return 'sell-modal__price--ok';
    return 'sell-modal__price--low';
  }

  function handleConfirm() {
    if (salePriceNum <= 0) return;
    const outcome = onConfirm(player, salePriceNum);
    if (outcome?.accepted) {
      setMarketFeedback(
        outcome.buyerTeam
          ? `${outcome.buyerTeam.name} acepto la oferta por ${formatMoneyShort(outcome.saleAmount)}.`
          : `Oferta aceptada por ${formatMoneyShort(outcome.saleAmount)}.`
      );
      onClose();
      return;
    }

    setMarketFeedback(outcome?.reason || 'No hubo ofertas aceptadas por ese monto.');
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="💰 Vender Jugador"
      size="sm"
    >
      <div className="sell-modal">
        {/* Info del jugador */}
        <div className="sell-modal__player-card">
          <div className="sell-modal__player-header">
            <span className={`sell-modal__pos sell-modal__pos--${position}`}>
              {position}
            </span>
            <span className="sell-modal__name">
              {player.firstName} {player.lastName}
            </span>
          </div>
          <div className="sell-modal__player-stats">
            <div className="sell-modal__stat">
              <span>Edad</span>
              <strong>{player.age}</strong>
            </div>
            <div className="sell-modal__stat">
              <span>Potencia</span>
              <strong>{player.power}</strong>
            </div>
            <div className="sell-modal__stat">
              <span>Valor mercado</span>
              <strong>{formatMoneyFull(player.value)}</strong>
            </div>
            <div className="sell-modal__stat">
              <span>Sueldo actual</span>
              <strong>${player.salary}K/mes</strong>
            </div>
          </div>
        </div>

        {/* Input precio de venta */}
        <div className="sell-modal__price-block">
          <label className="sell-modal__label" htmlFor="sale-price">
            Precio de venta
          </label>
          <input
            id="sale-price"
            type="number"
            min="0"
            step="1"
            className="sell-modal__input"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
          />
          <span className={`sell-modal__price-hint ${getPriceClass()}`}>
            {pctOfMarket}% del valor de mercado
            {pctOfMarket >= 110 && ' — precio por encima del mercado ✅'}
            {pctOfMarket < 90   && ' — precio por debajo del mercado ⚠️'}
          </span>
          {marketFeedback && (
            <span className="sell-modal__price-hint sell-modal__price--ok">
              {marketFeedback}
            </span>
          )}
        </div>

        {/* Acciones */}
        <div className="sell-modal__footer">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            disabled={salePriceNum <= 0}
          >
            Confirmar venta → {formatMoneyShort(salePriceNum)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default SellModal;
