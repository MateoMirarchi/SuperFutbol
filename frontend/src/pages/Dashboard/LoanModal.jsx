/**
 * LoanModal.jsx
 * Permite al jugador solicitar un préstamo de hasta $10M.
 * Calcula intereses según el plazo y el momento de la temporada.
 */

import { useState } from 'react';
import Modal from '../../components/Modal/Modal';
import Button from '../../components/Button/Button';
import './LoanModal.css';

const MAX_LOAN = 10_000_000;
const MIN_LOAN = 1_000_000;
const STEP = 500_000;

const TERM_OPTIONS = [
  { seasons: 1, label: '1 Temporada' },
  { seasons: 2, label: '2 Temporadas' },
  { seasons: 3, label: '3 Temporadas' },
];

/**
 * Calcula la tasa de interés anual basada en la fecha en que se solicita.
 * - Base: 8 % por temporada
 * - Penalización si se pide tarde en la temporada (fecha > 20): +2 %
 * - Penalización adicional si ya hay préstamos vigentes: +3 %
 */
function calcRate(matchday, hasExistingLoans) {
  let rate = 0.08;
  if (matchday > 20) rate += 0.02;
  if (hasExistingLoans) rate += 0.03;
  return rate;
}

function fmt(n) {
  return `$${(n / 1_000_000).toFixed(2)}M`;
}

function fmtShort(n) {
  return `$${Math.round(n).toLocaleString('es-AR')}`;
}

function LoanModal({ isOpen, onClose, save, onLoan }) {
  const [amount, setAmount] = useState(3_000_000);
  const [termSeasons, setTermSeasons] = useState(1);
  const [confirming, setConfirming] = useState(false);

  const existingLoans = save.finances?.loans ?? [];
  const totalDebt = existingLoans.reduce((sum, l) => sum + (l.remaining ?? 0), 0);
  const hasDebt = totalDebt > 0;

  const rate = calcRate(save.matchday ?? 1, hasDebt);
  const totalRepay = amount * Math.pow(1 + rate, termSeasons);
  const totalInterest = totalRepay - amount;
  const matchdayCount = termSeasons * 38;
  const perMatchday = totalRepay / matchdayCount;

  function handleClose() {
    setConfirming(false);
    onClose();
  }

  function handleConfirm() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    const loan = {
      id: `loan_${Date.now()}`,
      amount,
      rate,
      termSeasons,
      totalRepay,
      remaining: totalRepay,
      perMatchday,
      takenAt: { season: save.season ?? 1, matchday: save.matchday ?? 1 },
    };
    onLoan(loan);
    setConfirming(false);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="💰 Préstamo Bancario" size="md">
      <div className="loan-modal">
        {/* Deuda existente */}
        {hasDebt && (
          <div className="loan-modal__debt-warning">
            ⚠ Deuda vigente: <strong>{fmt(totalDebt)}</strong> — tasa adicional aplicada
          </div>
        )}

        {/* Monto */}
        <div className="loan-modal__field">
          <label className="loan-modal__label">
            Monto del préstamo
            <span className="loan-modal__amount-display">{fmt(amount)}</span>
          </label>
          <input
            type="range"
            min={MIN_LOAN}
            max={MAX_LOAN}
            step={STEP}
            value={amount}
            onChange={(e) => { setAmount(Number(e.target.value)); setConfirming(false); }}
            className="loan-modal__slider"
          />
          <div className="loan-modal__slider-labels">
            <span>{fmt(MIN_LOAN)}</span>
            <span>{fmt(MAX_LOAN)}</span>
          </div>
        </div>

        {/* Plazo */}
        <div className="loan-modal__field">
          <label className="loan-modal__label">Plazo de pago</label>
          <div className="loan-modal__terms">
            {TERM_OPTIONS.map((opt) => (
              <button
                key={opt.seasons}
                className={`loan-modal__term-btn ${termSeasons === opt.seasons ? 'loan-modal__term-btn--active' : ''}`}
                onClick={() => { setTermSeasons(opt.seasons); setConfirming(false); }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Detalle del cálculo */}
        <div className="loan-modal__breakdown">
          <div className="loan-modal__row">
            <span>Tasa de interés</span>
            <span className="loan-modal__row-val">{(rate * 100).toFixed(0)} % / temporada</span>
          </div>
          <div className="loan-modal__row">
            <span>Intereses totales</span>
            <span className="loan-modal__row-val loan-modal__row-val--warn">{fmt(totalInterest)}</span>
          </div>
          <div className="loan-modal__row loan-modal__row--total">
            <span>Total a devolver</span>
            <span className="loan-modal__row-val">{fmt(totalRepay)}</span>
          </div>
          <div className="loan-modal__row">
            <span>Pago por fecha ({matchdayCount} fechas)</span>
            <span className="loan-modal__row-val">{fmtShort(perMatchday)}</span>
          </div>
        </div>

        {/* Confirmación */}
        {confirming && (
          <div className="loan-modal__confirm-text">
            ¿Confirmar préstamo de <strong>{fmt(amount)}</strong> a devolver
            en <strong>{termSeasons} temporada{termSeasons > 1 ? 's' : ''}</strong>?
          </div>
        )}

        <div className="loan-modal__actions">
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            {confirming ? '✓ Confirmar préstamo' : 'Solicitar préstamo'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default LoanModal;
