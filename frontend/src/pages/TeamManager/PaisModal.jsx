import { useState } from 'react';
import Modal from '../../components/Modal/Modal';
import './PaisModal.css';

/**
 * PaisModal
 * Modal para agregar un nuevo país con sus 4 divisiones automáticas.
 *
 * Props:
 *  - isOpen   {boolean}          Controla visibilidad
 *  - onSave   {(nombre) => void} Callback con el nombre ingresado
 *  - onClose  {() => void}       Callback al cerrar sin guardar
 *  - loading  {boolean}          Muestra estado de carga en botón
 *  - error    {string}           Mensaje de error externo
 */
function PaisModal({ isOpen, onSave, onClose, loading = false, error = '' }) {
  const [nombre, setNombre] = useState('');
  const [localError, setLocalError] = useState('');

  function handleClose() {
    setNombre('');
    setLocalError('');
    onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();

    const trimmed = nombre.trim();
    if (!trimmed) {
      setLocalError('El nombre del país es requerido.');
      return;
    }

    setLocalError('');
    onSave(trimmed);
  }

  // Limpiar el campo cuando el modal se abre de nuevo
  function handleNombreChange(e) {
    setNombre(e.target.value);
    if (localError) setLocalError('');
  }

  const displayError = localError || error;

  return (
    <Modal isOpen={isOpen} title="Agregar País" onClose={handleClose}>
      <form className="pm-form" onSubmit={handleSubmit} noValidate>
        <div className="tf-field">
          <label className="tf-label" htmlFor="pais-nombre">
            Nombre del país <span className="tf-req">*</span>
          </label>
          <input
            id="pais-nombre"
            type="text"
            className={`tf-input${displayError ? ' tf-input--error' : ''}`}
            value={nombre}
            onChange={handleNombreChange}
            placeholder="Ej: Argentina"
            maxLength={100}
            autoFocus
            disabled={loading}
          />
          {displayError && <span className="tf-error">{displayError}</span>}
        </div>

        <p className="pm-hint">
          Se crearán automáticamente <strong>División 1</strong>, <strong>División 2</strong>,{' '}
          <strong>División 3</strong> y <strong>División 4</strong>.
        </p>

        <div className="pm-actions">
          <button
            type="button"
            className="td-btn td-btn--secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="td-btn td-btn--primary"
            disabled={loading || !nombre.trim()}
          >
            {loading ? 'Guardando…' : 'Crear país'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default PaisModal;
