/**
 * Settings.jsx
 * Pantalla de configuración general del juego.
 * Opciones: idioma, velocidad de partidos, sonido.
 * Los cambios se guardan automáticamente en localStorage.
 */

import { useState } from 'react';
import Button from '../../components/Button/Button';
import Select from '../../components/Select/Select';
import useLocalStorage from '../../hooks/useLocalStorage';
import './Settings.css';

const LANGUAGE_OPTIONS = [
  { value: 'es', label: '🇦🇷 Español' },
  { value: 'en', label: '🇬🇧 English' },
  { value: 'pt', label: '🇧🇷 Português' },
];

const MATCH_SPEED_OPTIONS = [
  { value: 'slow',      label: 'Lenta' },
  { value: 'normal',    label: 'Normal' },
  { value: 'fast',      label: 'Rápida' },
  { value: 'superfast', label: 'Super Rápido' },
];

// Valores por defecto de configuración
const DEFAULT_SETTINGS = {
  language: 'es',
  matchSpeed: 'normal',
  spectatorMatchSpeed: 'normal',
  soundEnabled: true,
  musicEnabled: true,
  animations: true,
};

function Settings({ onBack }) {
  const [settings, setSettings] = useLocalStorage('superfutbol_settings', DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  function handleChange(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    // El hook ya guarda automáticamente; solo mostramos el feedback visual
    setSaved(true);
    onBack(); // Volvemos al dashboard después de guardar
  }

  function handleReset() {
    setSettings(DEFAULT_SETTINGS);
  }

  return (
    <div className="settings animate-fade-in">
      <div className="settings__container">

        {/* Cabecera */}
        <header className="settings__header">
          <button className="settings__back" onClick={onBack} aria-label="Volver">
            ← Volver
          </button>
          <h1 className="settings__title">⚙️ Configuración</h1>
        </header>

        <div className="settings__body">
          {/* Idioma */}
          <section className="settings__section">
            <h2 className="settings__section-title">🌐 Idioma</h2>
            <Select
              id="language"
              label="Idioma de la interfaz"
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)}
              options={LANGUAGE_OPTIONS}
            />
          </section>

          {/* Partidos */}
          <section className="settings__section">
            <h2 className="settings__section-title">⚽ Velocidad de partidos</h2>
            <Select
              id="match-speed"
              label="Velocidad de simulación"
              value={settings.matchSpeed}
              onChange={(e) => handleChange('matchSpeed', e.target.value)}
              options={MATCH_SPEED_OPTIONS}
            />
            <Select
              id="spectator-match-speed"
              label="Velocidad de partido no participable"
              value={settings.spectatorMatchSpeed}
              onChange={(e) => handleChange('spectatorMatchSpeed', e.target.value)}
              options={MATCH_SPEED_OPTIONS}
            />
          </section>

          {/* Audio */}
          <section className="settings__section">
            <h2 className="settings__section-title">🔊 Audio</h2>
            <div className="settings__toggles">
              <ToggleRow
                label="Efectos de sonido"
                checked={settings.soundEnabled}
                onChange={(val) => handleChange('soundEnabled', val)}
              />
              <ToggleRow
                label="Música de fondo"
                checked={settings.musicEnabled}
                onChange={(val) => handleChange('musicEnabled', val)}
              />
            </div>
          </section>

          {/* Visuales */}
          <section className="settings__section">
            <h2 className="settings__section-title">✨ Visual</h2>
            <div className="settings__toggles">
              <ToggleRow
                label="Animaciones"
                checked={settings.animations}
                onChange={(val) => handleChange('animations', val)}
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="settings__footer">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Restablecer defaults
          </Button>
          <Button variant="primary" size="md" onClick={handleSave}>
            {saved ? '✅ Guardado' : 'Guardar cambios'}
          </Button>
        </footer>
      </div>
    </div>
  );
}

/**
 * ToggleRow: fila de toggle reutilizable dentro de Settings.
 */
function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="toggle-row">
      <span className="toggle-row__label">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        className={`toggle ${checked ? 'toggle--on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle__thumb" />
      </button>
    </div>
  );
}

export default Settings;
