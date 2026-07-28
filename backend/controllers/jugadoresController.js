/**
 * controllers/jugadoresController.js
 * Lógica de endpoints CRUD de jugadores.
 */

const jugadoresService = require('../services/jugadoresService');
const { validateJugadorPayload } = require('../utils/validation');
const { toJugadorRow, fromJugadorRow } = require('../utils/serializers');

/**
 * GET /jugadores/:id
 * Devuelve el detalle de un jugador. Endpoint público.
 */
async function getById(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'ID de jugador inválido.' });
    }

    const playerRow = await jugadoresService.getById(id);
    if (!playerRow) {
      return res.status(404).json({ error: 'Jugador no encontrado.' });
    }

    return res.json(fromJugadorRow(playerRow));
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo obtener el jugador.', detail: error.message });
  }
}

/**
 * POST /jugadores
 * Crea un nuevo jugador dentro de un equipo. Requiere JWT de administrador.
 */
async function create(req, res) {
  try {
    const errors = validateJugadorPayload(req.body);
    if (Object.keys(errors).length) {
      return res.status(400).json({ errors });
    }

    const created = await jugadoresService.create(toJugadorRow(req.body));
    return res.status(201).json(fromJugadorRow(created));
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo crear el jugador.', detail: error.message });
  }
}

/**
 * PUT /jugadores/:id
 * Modifica un jugador existente. Requiere JWT de administrador.
 */
async function update(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'ID de jugador inválido.' });
    }

    const errors = validateJugadorPayload(req.body);
    if (Object.keys(errors).length) {
      return res.status(400).json({ errors });
    }

    const updated = await jugadoresService.update(id, toJugadorRow(req.body));
    if (!updated) {
      return res.status(404).json({ error: 'Jugador no encontrado.' });
    }
    return res.json(fromJugadorRow(updated));
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo actualizar el jugador.', detail: error.message });
  }
}

/**
 * DELETE /jugadores/:id
 * Elimina un jugador. Requiere JWT de administrador.
 */
async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'ID de jugador inválido.' });
    }

    await jugadoresService.remove(id);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo eliminar el jugador.', detail: error.message });
  }
}

module.exports = { getById, create, update, remove };
