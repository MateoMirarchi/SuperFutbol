/**
 * CalendarModal.jsx
 * Muestra tres vistas de calendario:
 *   - 'local':       lista de fechas del torneo local (doble vuelta)
 *   - 'cup':         cuadro de copa nacional (bracket de 16 equipos)
 *   - 'continental': fase de grupos de la copa continental
 *
 * Los datos se leen del save activo (localSchedule, cupBracket,
 * continentalGroups) en lugar de regenerarse en cada render.
 *
 * Separación de responsabilidades:
 *   - hooks/useSchedule.js  → generación y persistencia del calendario
 *   - components/MatchRound → lista de fechas con partidos
 *   - components/CupBracket → visualizaci\u00F3n del bracket
 */

import Modal from '../../components/Modal/Modal';
import MatchRound from '../../components/MatchRound/MatchRound';
import CupBracket from '../../components/CupBracket/CupBracket';
import useSchedule from '../../hooks/useSchedule';
import { buildStandingsTable } from '../../utils/matchSimulation';
import { getActiveParticipant } from '../../utils/saveState';
import './CalendarModal.css';

// ── Calendario de torneo local ──────────────────────────────────────────────

function LocalCalendar({ save, onGenerate }) {
  const player1       = getActiveParticipant(save);
  const localSchedule = save.localSchedule ?? [];

  if (!localSchedule.length) {
    return <GeneratePrompt onGenerate={onGenerate} />;
  }

  return (
    <MatchRound
      rounds={localSchedule}
      playerTeamId={player1.teamId}
      currentRound={save.matchday ?? 1}
    />
  );
}

// ── Cuadro de copa nacional ─────────────────────────────────────────────────

function NationalCupView({ save, onGenerate }) {
  const player1    = getActiveParticipant(save);
  const cupBracket = save.cupBracket ?? null;

  if (!cupBracket) {
    return <GeneratePrompt onGenerate={onGenerate} />;
  }

  return (
    <CupBracket
      bracket={cupBracket}
      playerTeamId={player1.teamId}
    />
  );
}

// ── Copa continental: grupos ────────────────────────────────────────────────

function GroupStandingsTable({ group, playerTeamId }) {
  const rows = buildStandingsTable(group.teams ?? [], group.rounds ?? []);

  return (
    <div className="continental-standings">
      <table className="continental-standings__table">
        <thead>
          <tr>
            <th>#</th>
            <th>Equipo</th>
            <th>PJ</th>
            <th>GF</th>
            <th>GC</th>
            <th>DG</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.team.id} className={row.team.id === playerTeamId ? 'continental-standings__row--player' : ''}>
              <td>{row.pos}</td>
              <td>{row.team.name}</td>
              <td>{row.played}</td>
              <td>{row.gf}</td>
              <td>{row.ga}</td>
              <td>{row.gd}</td>
              <td><strong>{row.points}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContinentalCalendar({ save, continentalComps, onGenerate }) {
  const player1           = getActiveParticipant(save);
  const continentalGroups = save.continentalGroups ?? [];
  const currentContRound  = save.continentalRound ?? 1;

  if (!continentalGroups.length) {
    return <GeneratePrompt onGenerate={onGenerate} />;
  }

  return (
    <div className="continental-cal">
      {continentalComps?.length > 0 && (
        <p className="continental-cal__header">
          {continentalComps.map((c) => c.name).join(' \u00B7 ')}
        </p>
      )}

      {continentalGroups.map((group) => {
        const isPlayerGroup = group.teams.some((t) => t.id === player1.teamId);
        return (
          <div
            key={group.groupName}
            className={`continental-group${isPlayerGroup ? ' continental-group--player' : ''}`}
          >
            <div className="continental-group__header">
              <span className="continental-group__name">{group.groupName}</span>
              <div className="continental-group__teams">
                {group.teams.map((t) => (
                  <span
                    key={t.id}
                    className={`continental-team${t.id === player1.teamId ? ' continental-team--player' : ''}`}
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </div>

            <GroupStandingsTable group={group} playerTeamId={player1.teamId} />

            <MatchRound
              rounds={group.rounds}
              playerTeamId={player1.teamId}
              currentRound={isPlayerGroup ? currentContRound : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}

// ── Prompt de generaci\u00F3n de calendario ─────────────────────────────────────

function GeneratePrompt({ onGenerate }) {
  return (
    <div className="cal-generate-prompt">
      <p className="cal-generate-prompt__text">
        El calendario de esta temporada a\u00FAn no fue generado.
      </p>
      <button className="cal-generate-prompt__btn" onClick={onGenerate}>
        {'\uD83D\uDDD3'} Generar calendario
      </button>
    </div>
  );
}


// ── Modal principal ─────────────────────────────────────────────────────────

const TITLES = {
  local:       `${'\uD83D\uDCC5'} Calendario \u2014 Torneo Local`,
  continental: `${'\uD83C\uDF10'} Calendario \u2014 Copa Continental`,
  cup:         `${'\uD83C\uDFC6'} Cuadro \u2014 Copa Local`,
};

/**
 * @param {boolean}  isOpen
 * @param {string}   mode            - 'local' | 'continental' | 'cup'
 * @param {function} onClose
 * @param {object}   save            - activeSave completo
 * @param {boolean}  hasContinental
 * @param {Array}    continentalComps
 * @param {function} onUpdateSave    - Para persistir el schedule generado
 */
function CalendarModal({ isOpen, mode, onClose, save, hasContinental, continentalComps, onUpdateSave }) {
  const { generateSeasonSchedule } = useSchedule(save, onUpdateSave);

  if (!mode || !save) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={TITLES[mode] ?? `${'\uD83D\uDCC5'} Calendario`}
      size="lg"
    >
      <div className="calendar-modal">
        {mode === 'local' && (
          <LocalCalendar save={save} onGenerate={generateSeasonSchedule} />
        )}

        {mode === 'cup' && (
          <NationalCupView save={save} onGenerate={generateSeasonSchedule} />
        )}

        {mode === 'continental' && hasContinental && (
          <ContinentalCalendar
            save={save}
            continentalComps={continentalComps}
            onGenerate={generateSeasonSchedule}
          />
        )}

        {mode === 'continental' && !hasContinental && (
          <p className="calendar-modal__no-continental">
            No partic\u00E1s en ninguna copa continental esta temporada.
          </p>
        )}
      </div>
    </Modal>
  );
}

export default CalendarModal;
