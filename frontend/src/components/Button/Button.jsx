/**
 * Button.jsx
 * Botón genérico y reutilizable.
 * Props:
 *   - variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 *   - size: 'sm' | 'md' | 'lg'
 *   - fullWidth: boolean
 *   - disabled: boolean
 *   - onClick: function
 *   - children: ReactNode
 *   - type: 'button' | 'submit' | 'reset'
 */

import './Button.css';

function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  children,
  type = 'button',
  className = '',
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? 'btn--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
