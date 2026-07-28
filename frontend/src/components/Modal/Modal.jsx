/**
 * Modal.jsx
 * Modal genérico y reutilizable con backdrop.
 * Props:
 *   - isOpen: boolean
 *   - onClose: function
 *   - title: string
 *   - children: ReactNode
 *   - size: 'sm' | 'md' | 'lg'
 *   - showCloseButton: boolean
 */

import { useEffect } from 'react';
import './Modal.css';

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) {
  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`modal modal--${size} animate-fade-in-scale`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="modal__header">
          {title && <h2 className="modal__title">{title}</h2>}
          {showCloseButton && (
            <button
              className="modal__close"
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              ✕
            </button>
          )}
        </div>

        {/* Contenido */}
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
