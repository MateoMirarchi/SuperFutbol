/**
 * DtModal.jsx
 * Modal para gestionar los Directores Técnicos contratados.
 * Permite agregar un DT con nombre y despedirlo.
 * Los DTs reciben ofertas de equipos a medida que avanza la partida.
 */

import { useState } from 'react';
import Modal from '../../components/Modal/Modal';
import Button from '../../components/Button/Button';
import { createManagerParticipant, getActiveParticipant, getParticipants, updateParticipantCollection } from '../../utils/saveState';
import './DtModal.css';

function DtModal({ isOpen, onClose, save, onUpdateParticipants }) {
  const directors = getParticipants(save);
  const activeParticipant = getActiveParticipant(save);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const newDt = createManagerParticipant(trimmed, save);
    onUpdateParticipants([...directors, newDt]);
    setNewName('');
    setAdding(false);
  }

  function handleDismiss(dtId) {
    onUpdateParticipants(
      updateParticipantCollection(directors, dtId, {
        teamId: null,
        teamName: 'Sin club',
        leagueId: null,
        divisionLevel: null,
        divisionName: '',
        city: '',
        budget: 0,
      })
    );
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') { setAdding(false); setNewName(''); }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="👨‍💼 Directores Técnicos" size="md">
      <div className="dt-modal">
        {directors.length === 0 && !adding ? (
          <div className="dt-modal__empty">
            <span className="dt-modal__empty-icon">👨‍💼</span>
            <p>No hay directores tecnicos cargados en esta partida.</p>
            <p className="dt-modal__empty-hint">
              Cada DT nuevo se guarda como un participante independiente y puede quedar sin club.
            </p>
          </div>
        ) : (
          <ul className="dt-modal__list">
            {directors.map((dt) => (
              <li key={dt.id} className="dt-item">
                <div className="dt-item__avatar">👨‍💼</div>
                <div className="dt-item__info">
                  <span className="dt-item__name">{dt.name}</span>
                  <span className="dt-item__meta">
                    T{dt.hiredAt?.season ?? 1} · F{dt.hiredAt?.matchday ?? 1}
                    {' · '}
                    {dt.teamName || 'Sin club'}
                    {String(dt.id) === String(activeParticipant?.id) && ' · Activo'}
                  </span>
                  <span className="dt-item__record">
                    {(dt.record?.won ?? 0)}G&nbsp; {(dt.record?.drawn ?? 0)}E&nbsp; {(dt.record?.lost ?? 0)}P
                  </span>
                </div>
                <button
                  className="dt-item__dismiss"
                  onClick={() => handleDismiss(dt.id)}
                  title="Dejar sin club"
                  aria-label={`Dejar sin club a ${dt.name}`}
                  disabled={String(dt.id) === String(activeParticipant?.id) || !dt.teamId}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Formulario de nuevo DT */}
        {adding ? (
          <div className="dt-modal__add-form">
            <input
              type="text"
              className="dt-modal__input"
              placeholder="Nombre del entrenador…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={60}
              autoFocus
            />
            <div className="dt-modal__add-actions">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setAdding(false); setNewName(''); }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAdd}
                disabled={!newName.trim()}
              >
                Agregar DT
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="primary" onClick={() => setAdding(true)} fullWidth>
            + Agregar director tecnico
          </Button>
        )}
      </div>
    </Modal>
  );
}

export default DtModal;
