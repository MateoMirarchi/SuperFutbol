/**
 * fixtureGenerator.js
 * Generación de calendarios/fixtures para todas las competencias.
 *
 * Responsabilidades:
 *   - Torneo local:        doble vuelta round-robin (18 fechas para 10 equipos)
 *   - Copa nacional:       bracket de 16 equipos con cruces por división
 *   - Copa continental:    fase de grupos (6 fechas por equipo en grupo de 4)
 *   - Calendario anual:    distribución realista de fechas a lo largo de la temporada
 */

// ── Utilidades ────────────────────────────────────────────────────────────────

/**
 * Mezcla un array en forma aleatoria (Fisher-Yates in-place).
 * @param {Array} arr
 * @returns {Array} nuevo array mezclado
 */
export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Torneo local (doble vuelta round-robin) ───────────────────────────────────

/**
 * Genera el calendario completo de liga con doble vuelta.
 * Para n equipos produce (n-1)*2 fechas con n/2 partidos cada una.
 *
 * Algoritmo "Circle method":
 *   - Un equipo permanece fijo; el resto rota circularmente cada fecha.
 *   - La segunda vuelta invierte local/visitante de la primera.
 *
 * @param {Array<{id, name, prestige}>} teams
 * @returns {Array<{round:number, matches:Array<{home, away, result:null}>}>}
 */
export function generateLeagueFixture(teams) {
  const list = [...teams];

  // Si hay número impar de equipos, agregar un equipo "libre" (bye)
  if (list.length % 2 !== 0) {
    list.push({ id: 'bye', name: 'Libre', prestige: 0 });
  }

  const n       = list.length;
  const half    = n / 2;
  const fixed   = list[0];           // Equipo que no rota
  const rotating = list.slice(1);    // Equipo que rotan cada fecha
  const firstHalf = [];

  for (let r = 0; r < n - 1; r++) {
    const matches = [];

    // Partido del equipo fijo: alterna local/visitante en fechas pares/impares
    if (fixed.id !== 'bye' && rotating[0].id !== 'bye') {
      matches.push(
        r % 2 === 0
          ? { home: fixed,       away: rotating[0], result: null }
          : { home: rotating[0], away: fixed,        result: null }
      );
    }

    // Partidos restantes: rotating[i] vs rotating[n-1-i]
    for (let i = 1; i < half; i++) {
      const h = rotating[i];
      const a = rotating[n - 1 - i];
      if (h.id !== 'bye' && a.id !== 'bye') {
        matches.push({ home: h, away: a, result: null });
      }
    }

    firstHalf.push({ round: r + 1, matches });

    // Rotación circular: el último pasa al frente
    rotating.unshift(rotating.pop());
  }

  // Segunda vuelta: los partidos locales pasan a ser visitantes y viceversa
  const secondHalf = firstHalf.map((fd, i) => ({
    round: n - 1 + i + 1,
    matches: fd.matches.map((m) => ({ home: m.away, away: m.home, result: null })),
  }));

  return [...firstHalf, ...secondHalf];
}

// ── Copa nacional (bracket de 16 equipos, cruces por división) ────────────────

/**
 * Genera el bracket de copa nacional de 16 equipos con cruces entre divisiones.
 *
 * Regla de cruce de primera ronda:
 *   - División 1 (top 4 por prestige) vs División 4 (top 4 por prestige)
 *   - División 2 (top 4 por prestige) vs División 3 (top 4 por prestige)
 * El equipo del jugador siempre está incluido.
 *
 * Estructura del bracket (8 fases: R16 → QF → SF → Final):
 *   R16: 8 partidos  (cruces inter-división)
 *   QF:  4 partidos  (ganadores de R16)
 *   SF:  2 partidos  (ganadores de QF)
 *   F:   1 partido   (ganadores de SF)
 *
 * @param {Object} league      - Objeto liga con { id, divisions: [{level, teams}] }
 * @param {string} playerTeamId - ID del equipo del jugador
 * @returns {{ rounds: Array<{name, shortName, matches}> }}
 */
export function generateCupBracket16(league, playerTeamId) {
  /**
   * Selecciona los 4 equipos más prestigiosos de una división.
   * Si el equipo del jugador pertenece a esa división pero no es top-4,
   * lo incluye forzosamente reemplazando al cuarto lugar.
   */
  function pickTop4(divLevel) {
    const div = league.divisions.find((d) => d.level === divLevel);
    if (!div) return [];
    const sorted = [...div.teams].sort((a, b) => b.prestige - a.prestige);
    const top4   = sorted.slice(0, 4);

    // Asegurar que el equipo del jugador esté en el grupo si pertenece a esta división
    const playerInDiv = div.teams.find((t) => t.id === playerTeamId);
    if (playerInDiv && !top4.find((t) => t.id === playerTeamId)) {
      top4[3] = playerInDiv; // Reemplaza el 4to lugar
    }

    return top4;
  }

  const d1 = pickTop4(1); // [0]=mejor de la div, [3]=peor del top-4
  const d2 = pickTop4(2);
  const d3 = pickTop4(3);
  const d4 = pickTop4(4);

  // ── Ronda de 16: cruces entre divisiones opuestas ─────────────────────────
  //
  // Lógica de siembra:
  //   d1[0] (mejor div1) vs d4[3] (peor de div4 seleccionada) → partido más desigual
  //   d1[3] (peor top4 de div1) vs d4[0] (mejor div4)        → partido más equilibrado
  //
  // La misma lógica aplica para d2 vs d3.
  const r16Matches = [
    { id: 'r16-1', home: d1[0], away: d4[3], result: null, winner: null },
    { id: 'r16-2', home: d1[1], away: d4[2], result: null, winner: null },
    { id: 'r16-3', home: d2[0], away: d3[3], result: null, winner: null },
    { id: 'r16-4', home: d2[1], away: d3[2], result: null, winner: null },
    { id: 'r16-5', home: d1[2], away: d4[1], result: null, winner: null },
    { id: 'r16-6', home: d1[3], away: d4[0], result: null, winner: null },
    { id: 'r16-7', home: d2[2], away: d3[1], result: null, winner: null },
    { id: 'r16-8', home: d2[3], away: d3[0], result: null, winner: null },
  ];

  // ── Cuartos de final (pendientes; se completan con ganadores de R16) ────────
  const qfMatches = [
    { id: 'qf-1', home: null, away: null, result: null, winner: null, fromA: 'r16-1', fromB: 'r16-2' },
    { id: 'qf-2', home: null, away: null, result: null, winner: null, fromA: 'r16-3', fromB: 'r16-4' },
    { id: 'qf-3', home: null, away: null, result: null, winner: null, fromA: 'r16-5', fromB: 'r16-6' },
    { id: 'qf-4', home: null, away: null, result: null, winner: null, fromA: 'r16-7', fromB: 'r16-8' },
  ];

  // ── Semifinales ───────────────────────────────────────────────────────────────
  const sfMatches = [
    { id: 'sf-1', home: null, away: null, result: null, winner: null, fromA: 'qf-1', fromB: 'qf-2' },
    { id: 'sf-2', home: null, away: null, result: null, winner: null, fromA: 'qf-3', fromB: 'qf-4' },
  ];

  // ── Final ─────────────────────────────────────────────────────────────────────
  const finalMatch = [
    { id: 'fin', home: null, away: null, result: null, winner: null, fromA: 'sf-1', fromB: 'sf-2' },
  ];

  return {
    rounds: [
      { name: 'Ronda de 16',    shortName: 'R16', matches: r16Matches },
      { name: 'Cuartos de Final', shortName: 'QF',  matches: qfMatches },
      { name: 'Semifinales',      shortName: 'SF',  matches: sfMatches },
      { name: 'Final',            shortName: 'FIN', matches: finalMatch },
    ],
  };
}

// ── Copa continental: fase de grupos ─────────────────────────────────────────

/**
 * Genera los calendarios de fase de grupos para una copa continental.
 * Cada grupo tiene 4 equipos → 6 fechas (3 de ida + 3 de vuelta),
 * con 2 partidos por fecha.
 *
 * @param {Array<{name:string, teams:Array}>} groups - Grupos generados por generateContinentalGroups
 * @returns {Array<{groupName:string, teams:Array, rounds:Array}>}
 */
export function generateGroupStageFixtures(groups) {
  return groups.map((group) => {
    // generateLeagueFixture para 4 equipos produce exactamente 6 rondas
    const rounds = generateLeagueFixture(group.teams);
    return {
      groupName: group.name,
      teams:     group.teams,
      rounds,    // 6 fechas, 2 partidos cada una
    };
  });
}

// ── Calendario anual integrado ────────────────────────────────────────────────

/**
 * Construye un calendario anual realista intercalando torneo local,
 * copa continental y copa nacional.
 *
 * Distribución de fechas (30 semanas aproximadas):
 *   - Las 18 fechas de liga se distribuyen uniformemente.
 *   - Las 6 fechas de copa continental se insertan cada 3 fechas de liga.
 *     (semanas 4, 7, 10, 14, 17, 21 aprox.)
 *   - Las instancias de copa nacional se insertan en semanas fijas.
 *
 * Cada entrada del calendario indica qué competencia se juega esa "semana".
 *
 * @param {Array}       localRounds         - Fechas del torneo local (18 rounds)
 * @param {Array|null}  continentalGroups   - Grupos continentales con rounds (o null)
 * @param {boolean}     hasCup              - Si hay copa nacional esta temporada
 * @returns {Array<{week:number, competition:string, round?:number, contRound?:number, cupRound?:string}>}
 */
export function buildAnnualCalendar(localRounds, continentalGroups, hasCup = true) {
  const calendar = [];

  // Fechas locales en las que se inserta una fecha continental
  // (después de las fechas 3, 6, 9, 12, 15, 18 de liga)
  const contAfterLocal = new Set([3, 6, 9, 12, 15, 18]);

  // Fechas locales en las que se inserta una instancia de copa nacional
  // (después de fechas 4, 8, 12, 16 → R16, QF, SF, Final)
  const cupRoundNames  = ['r16', 'qf', 'sf', 'fin'];
  const cupAfterLocal  = new Map([[4, 'r16'], [8, 'qf'], [12, 'sf'], [16, 'fin']]);

  let contRoundIdx = 1; // Número de fecha continental (1-6)

  for (const localRound of localRounds) {
    calendar.push({
      week:        calendar.length + 1,
      competition: 'local',
      round:       localRound.round,
    });

    const afterThis = localRound.round;

    // Insertar fecha de copa nacional si corresponde
    if (hasCup && cupAfterLocal.has(afterThis)) {
      calendar.push({
        week:        calendar.length + 1,
        competition: 'cup',
        cupRound:    cupAfterLocal.get(afterThis),
      });
    }

    // Insertar fecha continental si corresponde
    if (continentalGroups && contAfterLocal.has(afterThis) && contRoundIdx <= 6) {
      calendar.push({
        week:        calendar.length + 1,
        competition: 'continental',
        contRound:   contRoundIdx,
      });
      contRoundIdx++;
    }
  }

  return calendar;
}
