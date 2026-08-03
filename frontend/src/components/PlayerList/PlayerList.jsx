/**
 * PlayerList.jsx
 * Tabla de la plantilla del equipo con todas las columnas del jugador.
 * Soporta click izquierdo (onLeftClick) y click derecho (onRightClick).
 *
 * Separación: components/ → componente genérico, sin lógica de negocio.
 * Props:
 *   squad        Array<Player>   – plantilla completa
 *   onLeftClick  (player) => void
 *   onRightClick (player, event) => void
 *   selectedId   string | null   – id del jugador seleccionado (resalta fila)
 */

import { memo, useMemo } from 'react';
import './PlayerList.css';
import { normalizePosition, POSITION_ORDER } from '../../utils/teamDbUtils';
import { formatMoneyFull } from '../../utils/currency';

/** Etiqueta abreviada de estado del jugador */
const STATUS_LABELS = {
  available:  { label: '✅', title: 'Disponible' },
  injured:    { label: '🤕', title: 'Lesionado'  },
  suspended:  { label: '🟥', title: 'Suspendido' },
  loan:       { label: '🔄', title: 'Préstamo'   },
};

/** Color de la potencia según rango */
function powerClass(power) {
  if (power >= 85) return 'plist__power--elite';
  if (power >= 70) return 'plist__power--good';
  if (power >= 55) return 'plist__power--mid';
  return 'plist__power--low';
}

/** Color de cansancio */
function tirednessClass(pct) {
  if (pct >= 75) return 'plist__tired--high';
  if (pct >= 45) return 'plist__tired--mid';
  return 'plist__tired--ok';
}

const PlayerRow = memo(function PlayerRow({ player, isSelected, onLeftClick, onRightClick }) {
  const status = STATUS_LABELS[player.status] ?? STATUS_LABELS.available;

  return (
    <tr
      className={`plist__row ${isSelected ? 'plist__row--selected' : ''}`}
      onClick={() => onLeftClick?.(player)}
      onContextMenu={(e) => {
        e.preventDefault();
        onRightClick?.(player, e);
      }}
      title="Click izq: ver opciones | Click der: menú rápido"
    >
      <td className="plist__td plist__td--pos">
        <span className={`plist__pos plist__pos--${normalizePosition(player.position)}`}>
          {normalizePosition(player.position)}
        </span>
      </td>
      <td className="plist__td plist__td--name">
        {player.firstName} {player.lastName}
      </td>
      <td className="plist__td plist__td--num">{player.age}</td>
      <td className={`plist__td plist__td--num plist__power ${powerClass(player.power)}`}>
        {player.power}
      </td>
      <td className="plist__td plist__td--num">
        {formatMoneyFull(player.value)}
      </td>
      <td className={`plist__td plist__td--num ${tirednessClass(player.tiredness)}`}>
        {player.tiredness}%
      </td>
      <td className="plist__td plist__td--num">
        ${player.salary}K
      </td>
      <td className="plist__td plist__td--status" title={status.title}>
        {status.label}
      </td>
    </tr>
  );
});

function PlayerList({ squad = [], onLeftClick, onRightClick, selectedId }) {
  const sorted = useMemo(
    () =>
      [...squad].sort(
        (a, b) => (POSITION_ORDER[normalizePosition(a.position)] ?? 99) - (POSITION_ORDER[normalizePosition(b.position)] ?? 99)
      ),
    [squad]
  );

  if (squad.length === 0) {
    return (
      <div className="plist__empty">
        No hay jugadores en la plantilla.
      </div>
    );
  }

  return (
    <div className="plist__wrapper">
      <table className="plist">
        <thead>
          <tr>
            <th className="plist__th plist__th--pos">Pos</th>
            <th className="plist__th plist__th--name">Jugador</th>
            <th className="plist__th plist__th--num">Edad</th>
            <th className="plist__th plist__th--num">Pot</th>
            <th className="plist__th plist__th--num">Valor</th>
            <th className="plist__th plist__th--num">Cans.</th>
            <th className="plist__th plist__th--num">Sueldo</th>
            <th className="plist__th plist__th--status" aria-label="Estado"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((player) => (
            <PlayerRow
              key={player.id}
              player={player}
              isSelected={selectedId === player.id}
              onLeftClick={onLeftClick}
              onRightClick={onRightClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(PlayerList);
