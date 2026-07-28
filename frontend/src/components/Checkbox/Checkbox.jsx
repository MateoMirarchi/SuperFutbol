/**
 * Checkbox.jsx
 * Checkbox genérico y reutilizable.
 * Props:
 *   - id: string (requerido para accesibilidad)
 *   - label: string
 *   - checked: boolean
 *   - onChange: function
 *   - disabled: boolean
 */

import './Checkbox.css';

function Checkbox({ id, label, checked, onChange, disabled = false }) {
  return (
    <label
      htmlFor={id}
      className={`checkbox ${disabled ? 'checkbox--disabled' : ''}`}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="checkbox__input"
      />
      <span className="checkbox__box" />
      {label && <span className="checkbox__label">{label}</span>}
    </label>
  );
}

export default Checkbox;
