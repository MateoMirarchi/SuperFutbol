/**
 * Select.jsx
 * Select/dropdown genérico y reutilizable.
 * Props:
 *   - id: string
 *   - label: string
 *   - value: string | number
 *   - onChange: function
 *   - options: Array<{ value, label }>
 *   - disabled: boolean
 */

import './Select.css';

function Select({ id, label, value, onChange, options = [], disabled = false }) {
  return (
    <div className="select-wrapper">
      {label && (
        <label htmlFor={id} className="select-wrapper__label">
          {label}
        </label>
      )}
      <div className="select-wrapper__field">
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="select-wrapper__select"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Icono de flecha */}
        <span className="select-wrapper__arrow">▾</span>
      </div>
    </div>
  );
}

export default Select;
