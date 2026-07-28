/**
 * ConfidenceBar.jsx
 * Muestra las barras de confianza de dirigencia y hinchada.
 * El color cambia según el nivel: rojo → naranja → amarillo → verde.
 * Si la confianza de dirigencia cae < 10 muestra un aviso de expulsión.
 *
 * Separación: components/ → componente genérico reutilizable.
 * Props:
 *   confidence   { board: number, fans: number }  – valores 0-100
 *   teamName     string
 */

import { confidenceLevel } from '../../utils/confidenceHelpers';
import './ConfidenceBar.css';

/** Mapea nivel → clase CSS de color */
const LEVEL_CLASS = {
  critical: 'conf-bar__fill--critical',
  low:      'conf-bar__fill--low',
  mid:      'conf-bar__fill--mid',
  good:     'conf-bar__fill--good',
  great:    'conf-bar__fill--great',
};

function SingleBar({ label, value }) {
  const level = confidenceLevel(value);
  return (
    <div className="conf-bar__row">
      <span className="conf-bar__label">{label}</span>
      <div className="conf-bar__track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={`conf-bar__fill ${LEVEL_CLASS[level]}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`conf-bar__value conf-bar__value--${level}`}>{Math.round(value)}%</span>
    </div>
  );
}

function ConfidenceBar({ confidence, teamName }) {
  const { board = 70, fans = 70 } = confidence ?? {};
  const fired = board < 10;

  return (
    <div className="conf-bar animate-fade-in">
      <div className="conf-bar__header">
        <span className="conf-bar__team">⚽ {teamName}</span>
        <span className="conf-bar__title">Confianza</span>
      </div>

      <SingleBar label="👔 Dirigencia" value={board} />
      <SingleBar label="🏟️ Hinchada"   value={fans}  />

      {fired && (
        <div className="conf-bar__fired-warning animate-fade-in">
          ⚠️ ¡La dirigencia perdió la confianza! El DT puede ser expulsado.
        </div>
      )}
    </div>
  );
}

export default ConfidenceBar;
