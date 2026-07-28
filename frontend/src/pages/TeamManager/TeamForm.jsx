/**
 * TeamForm.jsx
 * Modal para crear o editar un equipo en la base de datos.
 *
 * Campos:
 *   Nombre, Abreviatura (3-5 chars), Ciudad,
 *   Liga, Divisi\u00F3n, Prestigio (0-100),
 *   Color primario (hex), Color secundario (hex)
 *
 * Props:
 *   isOpen       - boolean
 *   team         - Objeto equipo existente (null para crear nuevo)
 *   onSave       - (teamData) => void
 *   onClose      - () => void
 *
 * Separaci\u00F3n: pages/TeamManager/ \u2192 modal espec\u00EDfico de esta pantalla.
 */

import { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import { validateTeam, defaultTeam } from '../../utils/teamDbUtils';
import './TeamForm.css';

const ARGENTINA_DIVISION_NAMES = {
  1: 'Liga Profesional de Futbol (LPF)',
  2: 'Primera B Nacional',
  3: 'B Metro y Federal A',
  4: 'Primera C',
};

function TeamForm({ isOpen, team, onSave, onClose, saveError = '', paises = [] }) {
  const [form, setForm]     = useState({});
  const [errors, setErrors] = useState({});

  function getPais(paisId) {
    return paises.find((item) => Number(item.id) === Number(paisId));
  }

  function isArgentinaPais(pais) {
    return String(pais?.nombre ?? '').trim().toLowerCase() === 'argentina';
  }

  function resolveDivisionName(level, pais) {
    if (isArgentinaPais(pais)) {
      return ARGENTINA_DIVISION_NAMES[Number(level)] ?? `Division ${level}`;
    }

    return `Division ${level}`;
  }

  function getDivisiones(paisId) {
    const pais = getPais(paisId);
    const divisiones = [...(pais?.divisiones ?? [])].sort((a, b) => getDivisionLevel(a) - getDivisionLevel(b));

    if (!isArgentinaPais(pais)) return divisiones;

    if (divisiones.length > 0) {
      return divisiones.map((division) => ({
        ...division,
        nombre: resolveDivisionName(getDivisionLevel(division), pais),
      }));
    }

    return [1, 2, 3, 4].map((level) => ({
      id: `arg-${level}`,
      nombre: resolveDivisionName(level, pais),
    }));
  }

  function getDivisionLevel(division) {
    if (!division?.nombre) return 1;
    const normalizedName = String(division.nombre).trim().toLowerCase();
    const argentinaLevel = Object.entries(ARGENTINA_DIVISION_NAMES).find(
      ([, name]) => name.toLowerCase() === normalizedName
    );

    if (argentinaLevel) return Number(argentinaLevel[0]);

    const match = String(division.nombre).match(/\d+/);
    return match ? Number(match[0]) : 1;
  }

  // Inicializa el formulario al abrir
  useEffect(() => {
    if (isOpen) {
      if (team) {
        const divisiones = getDivisiones(team.leagueId);
        const division = divisiones.find((item) => getDivisionLevel(item) === Number(team.divisionLevel));
        const pais = getPais(team.leagueId);
        setForm({
          ...team,
          leagueId: team.leagueId ?? '',
          leagueName: team.leagueName ?? pais?.nombre ?? '',
          countryName: team.countryName ?? pais?.nombre ?? '',
          divisionName: division?.nombre ?? team.divisionName ?? resolveDivisionName(1, pais),
        });
      } else {
        setForm({ ...defaultTeam() });
      }
      setErrors({});
    }
  }, [isOpen, team, paises]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  // Actualiza los datos del país usando la data real de la base
  function handleLeagueChange(leagueId) {
    const pais = getPais(leagueId);
    const primeraDivision = getDivisiones(leagueId)[0];
    setForm((f) => ({
      ...f,
      leagueId: pais?.id ?? '',
      leagueName: pais?.nombre ?? '',
      leagueFlag: '',
      countryName: pais?.nombre ?? '',
      divisionLevel: getDivisionLevel(primeraDivision),
      divisionName: primeraDivision?.nombre ?? resolveDivisionName(1, pais),
    }));
  }

  // Actualiza divisionName al cambiar el nivel
  function handleDivisionChange(level) {
    const division = getDivisiones(form.leagueId).find((item) => getDivisionLevel(item) === Number(level));
    const pais = getPais(form.leagueId);
    setForm((f) => ({
      ...f,
      divisionLevel: Number(level),
      divisionName:  division?.nombre ?? resolveDivisionName(level, pais),
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validateTeam(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
  }

  const selectedDivisiones = getDivisiones(form.leagueId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={team ? 'Editar equipo' : 'Crear equipo'}
      size="md"
    >
      <form className="team-form" onSubmit={handleSubmit}>
        {/* Nombre */}
        <div className="tf-field">
          <label className="tf-label">Nombre <span className="tf-req">*</span></label>
          <input
            className={`tf-input${errors.name ? ' tf-input--error' : ''}`}
            value={form.name ?? ''}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Ej: Boca Juniors"
          />
          {errors.name && <span className="tf-error">{errors.name}</span>}
        </div>

        {/* Fila: Abreviatura + Ciudad */}
        <div className="tf-row">
          <div className="tf-field">
            <label className="tf-label">Abrev. <span className="tf-req">*</span></label>
            <input
              className={`tf-input tf-input--sm${errors.shortName ? ' tf-input--error' : ''}`}
              value={form.shortName ?? ''}
              maxLength={5}
              onChange={(e) => set('shortName', e.target.value.toUpperCase())}
              placeholder="BOC"
            />
            {errors.shortName && <span className="tf-error">{errors.shortName}</span>}
          </div>

          <div className="tf-field tf-field--grow">
            <label className="tf-label">Ciudad</label>
            <input
              className="tf-input"
              value={form.city ?? ''}
              onChange={(e) => set('city', e.target.value)}
              placeholder="Buenos Aires"
            />
          </div>
        </div>

        {/* Fila: Liga + Divisi\u00F3n */}
        <div className="tf-row">
          <div className="tf-field tf-field--grow">
            <label className="tf-label">Liga <span className="tf-req">*</span></label>
            <select
              className={`tf-input${errors.leagueId ? ' tf-input--error' : ''}`}
              value={form.leagueId ?? ''}
              onChange={(e) => handleLeagueChange(e.target.value)}
            >
              <option value="">Seleccionar...</option>
              {paises.map((pais) => (
                <option key={pais.id} value={pais.id}>
                  {pais.nombre}
                </option>
              ))}
            </select>
            {errors.leagueId && <span className="tf-error">{errors.leagueId}</span>}
          </div>

          <div className="tf-field">
            <label className="tf-label">División <span className="tf-req">*</span></label>
            <select
              className={`tf-input${errors.divisionLevel ? ' tf-input--error' : ''}`}
              value={form.divisionLevel ?? 1}
              onChange={(e) => handleDivisionChange(e.target.value)}
            >
              {(selectedDivisiones.length ? selectedDivisiones : [1, 2, 3, 4].map((level) => ({ id: level, nombre: `Division ${level}` }))).map((division) => (
                <option key={division.id ?? division.nombre} value={getDivisionLevel(division)}>
                  {division.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Prestigio */}
        <div className="tf-field">
          <label className="tf-label">
            Prestigio: <strong>{form.prestige ?? 50}</strong>
          </label>
          <input
            type="range"
            className="tf-range"
            min={1} max={99}
            value={form.prestige ?? 50}
            onChange={(e) => set('prestige', Number(e.target.value))}
          />
          <div className="tf-range-labels">
            <span>Amateur</span>
            <span>Elite</span>
          </div>
        </div>

        {/* Colores */}
        <div className="tf-row">
          <div className="tf-field">
            <label className="tf-label">Color primario</label>
            <div className="tf-color-row">
              <input
                type="color"
                className="tf-color-picker"
                value={form.primaryColor ?? '#1E3A5F'}
                onChange={(e) => set('primaryColor', e.target.value)}
              />
              <input
                className="tf-input tf-input--sm"
                value={form.primaryColor ?? ''}
                maxLength={7}
                onChange={(e) => set('primaryColor', e.target.value)}
                placeholder="#1E3A5F"
              />
            </div>
          </div>

          <div className="tf-field">
            <label className="tf-label">Color secundario</label>
            <div className="tf-color-row">
              <input
                type="color"
                className="tf-color-picker"
                value={form.secondaryColor ?? '#FFFFFF'}
                onChange={(e) => set('secondaryColor', e.target.value)}
              />
              <input
                className="tf-input tf-input--sm"
                value={form.secondaryColor ?? ''}
                maxLength={7}
                onChange={(e) => set('secondaryColor', e.target.value)}
                placeholder="#FFFFFF"
              />
            </div>
          </div>
        </div>

        {/* Preview de colores */}
        <div
          className="tf-color-preview"
          style={{
            background: `linear-gradient(135deg, ${form.primaryColor ?? '#1E3A5F'} 50%, ${form.secondaryColor ?? '#FFFFFF'} 50%)`,
          }}
          aria-hidden="true"
        />

        {/* Error de guardado */}
        {saveError && (
          <div className="tf-save-error">{saveError}</div>
        )}

        {/* Botones */}
        <div className="tf-footer">
          <button type="button" className="td-btn td-btn--secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="td-btn td-btn--primary">
            Guardar equipo
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default TeamForm;
