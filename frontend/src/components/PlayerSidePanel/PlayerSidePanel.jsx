/**
 * PlayerSidePanel.jsx
 * Panel lateral que aparece al hacer click izquierdo sobre un jugador.
 * Muestra datos detallados del jugador y botones de acción.
 * Se ubica entre la barra de confianza y la info del próximo partido.
 *
 * Separación: components/ → UI genérica sin lógica de negocio.
 * Props:
 *   player      object | null
 *   onContract  (player) => void
 *   onSell      (player) => void
 *   onLoan      (player) => void
 *   onClose     () => void
 */

import './PlayerSidePanel.css';
import { formatMoneyFull } from '../../utils/currency';
import { normalizePosition } from '../../utils/teamDbUtils';

const STATUS_INFO = {
  available: { icon: '✅', label: 'Disponible' },
  injured:   { icon: '🤕', label: 'Lesionado'  },
  suspended: { icon: '🟥', label: 'Suspendido' },
  loan:      { icon: '🔄', label: 'En préstamo'},
};

function StatRow({ label, value }) {
  return (
    <div className="side-panel__stat">
      <span className="side-panel__stat-label">{label}</span>
      <span className="side-panel__stat-value">{value}</span>
    </div>
  );
}

function PlayerSidePanel({ player, onContract, onSell, onLoan, onClose }) {
  if (!player) return null;

  const status = STATUS_INFO[player.status] ?? STATUS_INFO.available;
  const position = normalizePosition(player.position);

  return (
    <div className="side-panel animate-slide-right">
      {/* Encabezado */}
      <div className="side-panel__header">
        <div className="side-panel__name-block">
          <span className={`side-panel__pos side-panel__pos--${position}`}>
            {position}
          </span>
          <span className="side-panel__name">
            {player.firstName} {player.lastName}
          </span>
        </div>
        <button className="side-panel__close" onClick={onClose} aria-label="Cerrar panel">
          ✕
        </button>
      </div>

      {/* Datos */}
      <div className="side-panel__stats">
        <StatRow label="Edad"      value={`${player.age} años`} />
        <StatRow label="Potencia"  value={player.power} />
        <StatRow label="Valor"     value={formatMoneyFull(player.value)} />
        <StatRow label="Cansancio" value={`${player.tiredness}%`} />
        <StatRow label="Sueldo"    value={`$${player.salary}K/mes`} />
        <StatRow label="Contrato"  value={`hasta T${player.contractEndSeason}`} />
        <StatRow label="Estado"    value={`${status.icon} ${status.label}`} />
      </div>

      {/* Acciones */}
      <div className="side-panel__actions">
        <button
          className="side-panel__btn side-panel__btn--contract"
          onClick={() => onContract(player)}
        >
          📝 Renovar contrato
        </button>
        <button
          className="side-panel__btn side-panel__btn--sell"
          onClick={() => onSell(player)}
        >
          💰 Vender
        </button>
        <button
          className="side-panel__btn side-panel__btn--loan"
          onClick={() => onLoan(player)}
          disabled={player.status === 'loan'}
          title={player.status === 'loan' ? 'Ya está en préstamo' : undefined}
        >
          🔄 Préstamo
        </button>
      </div>
    </div>
  );
}

export default PlayerSidePanel;
