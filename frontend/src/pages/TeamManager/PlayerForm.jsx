/**
 * PlayerForm.jsx
 * Modal para crear o editar un jugador en la base de datos.
 *
 * Campos:
 *   Nombre, Apellido, Equipo (selector), Posici\u00F3n,
 *   Edad, Potencia (0-99), Valor ($M), Sueldo ($K/mes),
 *   Fin de contrato (temporada), Estado, Nacionalidad
 *
 * Props:
 *   isOpen          - boolean
 *   player          - Objeto jugador existente (null para crear nuevo)
 *   teams           - Lista de equipos (para el selector)
 *   defaultTeamId   - ID del equipo preseleccionado
 *   onSave          - (playerData) => void
 *   onClose         - () => void
 *
 * Separaci\u00F3n: pages/TeamManager/ \u2192 modal espec\u00EDfico de esta pantalla.
 */

import { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import {
  validatePlayer,
  defaultPlayer,
  POSITIONS,
  POSITION_LABELS,
  normalizePosition,
  STATUSES,
  STATUS_LABELS,
} from '../../utils/teamDbUtils';
import './PlayerForm.css';

function PlayerForm({ isOpen, player, teams, defaultTeamId, onSave, onClose, saveError = '' }) {
  const [form, setForm]     = useState({});
  const [errors, setErrors] = useState({});
  const lockedTeamId = !player && defaultTeamId ? Number(defaultTeamId) : null;
  const lockedTeam = lockedTeamId
    ? teams.find((teamItem) => Number(teamItem.id) === lockedTeamId)
    : null;

  useEffect(() => {
    if (isOpen) {
      setForm(
        player
          ? { ...player, position: normalizePosition(player.position) }
          : { ...defaultPlayer(defaultTeamId ?? '') }
      );
      setErrors({});
    }
  }, [isOpen, player, defaultTeamId]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validatePlayer(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={player ? 'Editar jugador' : 'Crear jugador'}
      size="md"
    >
      <form className="player-form" onSubmit={handleSubmit}>

        {/* Equipo */}
        {lockedTeam ? (
          <div className="tf-field">
            <label className="tf-label">Equipo</label>
            <div className="pf-team-lock">
              <strong>{lockedTeam.name}</strong>
              <span>{lockedTeam.leagueName} · Div. {lockedTeam.divisionLevel}</span>
            </div>
          </div>
        ) : (
          <div className="tf-field">
            <label className="tf-label">Equipo <span className="tf-req">*</span></label>
            <select
              className={`tf-input${errors.teamId ? ' tf-input--error' : ''}`}
              value={form.teamId ?? ''}
              onChange={(e) => set('teamId', e.target.value)}
            >
              <option value="">Seleccionar equipo...</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.leagueFlag} {t.name} (Div. {t.divisionLevel})
                </option>
              ))}
            </select>
            {errors.teamId && <span className="tf-error">{errors.teamId}</span>}
          </div>
        )}

        {/* Nombre + Apellido */}
        <div className="tf-row">
          <div className="tf-field tf-field--grow">
            <label className="tf-label">Nombre <span className="tf-req">*</span></label>
            <input
              className={`tf-input${errors.firstName ? ' tf-input--error' : ''}`}
              value={form.firstName ?? ''}
              onChange={(e) => set('firstName', e.target.value)}
              placeholder="Lucas"
            />
            {errors.firstName && <span className="tf-error">{errors.firstName}</span>}
          </div>

          <div className="tf-field tf-field--grow">
            <label className="tf-label">Apellido <span className="tf-req">*</span></label>
            <input
              className={`tf-input${errors.lastName ? ' tf-input--error' : ''}`}
              value={form.lastName ?? ''}
              onChange={(e) => set('lastName', e.target.value)}
              placeholder="Gonzalez"
            />
            {errors.lastName && <span className="tf-error">{errors.lastName}</span>}
          </div>
        </div>

        {/* Posicion + Estado */}
        <div className="tf-row">
          <div className="tf-field tf-field--grow">
            <label className="tf-label">Posicion <span className="tf-req">*</span></label>
            <select
              className={`tf-input${errors.position ? ' tf-input--error' : ''}`}
              value={form.position ?? 'CM'}
              onChange={(e) => set('position', e.target.value)}
            >
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>{pos} {POSITION_LABELS[pos]}</option>
              ))}
            </select>
            {errors.position && <span className="tf-error">{errors.position}</span>}
          </div>

          <div className="tf-field tf-field--grow">
            <label className="tf-label">Estado</label>
            <select
              className="tf-input"
              value={form.status ?? 'available'}
              onChange={(e) => set('status', e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Edad + Potencia */}
        <div className="tf-row">
          <div className="tf-field">
            <label className="tf-label">
              Edad: <strong>{form.age ?? 22}</strong>
            </label>
            <input
              type="range"
              className="tf-range"
              min={14} max={45}
              value={form.age ?? 22}
              onChange={(e) => set('age', Number(e.target.value))}
            />
            <div className="tf-range-labels"><span>14</span><span>45</span></div>
            {errors.age && <span className="tf-error">{errors.age}</span>}
          </div>

          <div className="tf-field">
            <label className="tf-label">
              Potencia: <strong>{form.power ?? 65}</strong>
            </label>
            <input
              type="range"
              className="tf-range"
              min={1} max={99}
              value={form.power ?? 65}
              onChange={(e) => set('power', Number(e.target.value))}
            />
            <div className="tf-range-labels"><span>1</span><span>99</span></div>
          </div>
        </div>

        {/* Valor + Sueldo + Fin contrato */}
        <div className="tf-row">
          <div className="tf-field tf-field--grow">
            <label className="tf-label">Valor ($M)</label>
            <input
              type="number"
              className="tf-input pf-input--plain-number"
              min={0} step={0.1}
              inputMode="decimal"
              value={form.value ?? 1}
              onChange={(e) => set('value', Number(e.target.value))}
              placeholder="1.5"
            />
          </div>

          <div className="tf-field tf-field--grow">
            <label className="tf-label">Sueldo ($K/mes)</label>
            <input
              type="number"
              className="tf-input pf-input--plain-number"
              min={0}
              inputMode="numeric"
              value={form.salary ?? 80}
              onChange={(e) => set('salary', Number(e.target.value))}
              placeholder="80"
            />
          </div>

          <div className="tf-field">
            <label className="tf-label">Fin contrato (temp.)</label>
            <input
              type="number"
              className="tf-input tf-input--sm"
              min={1} max={20}
              value={form.contractEndSeason ?? 3}
              onChange={(e) => set('contractEndSeason', Number(e.target.value))}
            />
          </div>
        </div>

        {/* Nacionalidad */}
        <div className="tf-field">
          <label className="tf-label">Nacionalidad</label>
          <input
            className="tf-input"
            value={form.nationality ?? ''}
            onChange={(e) => set('nationality', e.target.value)}
            placeholder="Argentina"
          />
        </div>

        {saveError && (
          <div className="tf-save-error">{saveError}</div>
        )}

        {/* Botones */}
        <div className="tf-footer">
          <button type="button" className="td-btn td-btn--secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="td-btn td-btn--primary">
            Guardar jugador
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default PlayerForm;
