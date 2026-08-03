/**
 * controllers/mercadoController.js
 */

const {
  evaluateSaleOffer,
  evaluateLoanOffer,
} = require('../utils/business/transferMarket');
const jugadoresService = require('../services/jugadoresService');
const { validateVentaPayload, validatePrestamoPayload } = require('../utils/validation');

/**
 * Busca el jugador en la tabla `jugadores` (catalogo real de la base) y, si
 * existe, devuelve sus campos de negocio (valor/potencia/estado) como fuente
 * de verdad en vez de los que manda el cliente en el body.
 *
 * LIMITACION CONOCIDA: las plantillas de una partida se generan
 * proceduralmente en el cliente/servidor (ver utils/business/squadGenerator.js)
 * y esos jugadores NUNCA se insertan en la tabla `jugadores` -- no hay estado
 * de partida persistido server-side (ver saves en localStorage del
 * frontend). Para esos jugadores no existe ninguna fila con la que
 * contrastar, y se sigue confiando en los campos que manda el cliente. Esto
 * acota el fix a los jugadores que sí vienen del catalogo real (equipos
 * cargados desde la base), que es lo unico verificable sin repensar donde
 * vive el estado de partida (ver TODO en simulacionController.js).
 */
async function resolveAuthoritativePlayer(player) {
  const numericId = Number(player?.id);
  if (!Number.isInteger(numericId)) return player;

  const row = await jugadoresService.getById(numericId);
  if (!row) return player;

  return {
    ...player,
    value: Number(row.valor),
    power: Number(row.potencia),
    status: row.estado,
  };
}

async function evaluarVenta(req, res) {
  try {
    const errors = validateVentaPayload(req.body ?? {});
    if (Object.keys(errors).length) {
      return res.status(400).json({ errors });
    }

    const { player, askingPrice, sellerTeamId, teamPool } = req.body;
    const authoritativePlayer = await resolveAuthoritativePlayer(player);

    const outcome = evaluateSaleOffer({
      player: authoritativePlayer,
      askingPrice: Number(askingPrice),
      sellerTeamId,
      teamPool,
    });
    return res.json(outcome);
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo evaluar la venta.', detail: error.message });
  }
}

async function evaluarPrestamo(req, res) {
  try {
    const errors = validatePrestamoPayload(req.body ?? {});
    if (Object.keys(errors).length) {
      return res.status(400).json({ errors });
    }

    const { player, ownerTeamId, teamPool } = req.body;
    const authoritativePlayer = await resolveAuthoritativePlayer(player);

    const outcome = evaluateLoanOffer({
      player: authoritativePlayer,
      ownerTeamId,
      teamPool,
    });
    return res.json(outcome);
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo evaluar el prestamo.', detail: error.message });
  }
}

module.exports = {
  evaluarVenta,
  evaluarPrestamo,
};
