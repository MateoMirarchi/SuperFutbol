/**
 * utils/serializers.js
 * Traduce entre el modelo camelCase del frontend y el modelo snake_case de la base.
 */

function toEquipoRow(payload) {
  return {
    nombre: payload.name?.trim(),
    nombre_corto: payload.shortName?.trim(),
    ciudad: payload.city?.trim() || '',
    liga_id: payload.leagueId,
    liga_nombre: payload.leagueName,
    division: Number(payload.divisionLevel),
    division_nombre: payload.divisionName,
    prestigio: Number(payload.prestige),
    color_primario: payload.primaryColor || '#1E3A5F',
    color_secundario: payload.secondaryColor || '#FFFFFF',
  };
}

function fromEquipoRow(row) {
  return {
    id: row.id,
    name: row.nombre,
    shortName: row.nombre_corto,
    city: row.ciudad,
    leagueId: row.liga_id,
    leagueName: row.liga_nombre,
    divisionLevel: row.division,
    divisionName: row.division_nombre,
    prestige: row.prestigio,
    primaryColor: row.color_primario,
    secondaryColor: row.color_secundario,
    createdAt: row.created_at,
  };
}

function toJugadorRow(payload) {
  return {
    equipo_id: Number(payload.teamId),
    nombre: payload.firstName?.trim(),
    apellido: payload.lastName?.trim(),
    posicion: payload.position,
    edad: Number(payload.age),
    potencia: Number(payload.power),
    valor: Number(payload.value),
    sueldo: Number(payload.salary),
    fin_contrato_temp: Number(payload.contractEndSeason),
    estado: payload.status,
    nacionalidad: payload.nationality?.trim() || '',
  };
}

function fromJugadorRow(row) {
  return {
    id: row.id,
    teamId: row.equipo_id,
    firstName: row.nombre,
    lastName: row.apellido,
    position: row.posicion,
    age: row.edad,
    power: row.potencia,
    value: Number(row.valor),
    salary: Number(row.sueldo),
    contractEndSeason: row.fin_contrato_temp,
    status: row.estado,
    nationality: row.nacionalidad,
  };
}

module.exports = {
  toEquipoRow,
  fromEquipoRow,
  toJugadorRow,
  fromJugadorRow,
};
