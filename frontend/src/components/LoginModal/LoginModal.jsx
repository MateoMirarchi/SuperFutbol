import { useEffect, useState } from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import './LoginModal.css';

function LoginModal({ isOpen, isLoading, error, onClose, onSubmit }) {
  const [form, setForm] = useState({ login: '', password: '' });

  useEffect(() => {
    if (isOpen) {
      setForm({ login: '', password: '' });
    }
  }, [isOpen]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Acceso de administrador" size="sm">
      <form className="login-modal" onSubmit={handleSubmit}>
        <p className="login-modal__text">
          Iniciá sesión con tu usuario o email de administrador para habilitar la gestión de equipos.
        </p>

        <label className="login-modal__field">
          <span className="login-modal__label">Usuario o email</span>
          <input
            className="login-modal__input"
            value={form.login}
            onChange={(event) => handleChange('login', event.target.value)}
            placeholder="admin o admin@club.com"
            autoComplete="username"
          />
        </label>

        <label className="login-modal__field">
          <span className="login-modal__label">Contraseña</span>
          <input
            className="login-modal__input"
            type="password"
            value={form.password}
            onChange={(event) => handleChange('password', event.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>

        {error && <p className="login-modal__error">{error}</p>}

        <div className="login-modal__actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default LoginModal;
