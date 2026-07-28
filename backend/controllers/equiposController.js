/**
 * controllers/equiposController.js
 * Lógica de endpoints CRUD de equipos.
 */

const equiposService = require('../services/equiposService');
const jugadoresService = require('../services/jugadoresService');
const paisesService = require('../services/paisesService');
const { validateEquipoPayload } = require('../utils/validation');
const { toEquipoRow, fromEquipoRow, fromJugadorRow } = require('../utils/serializers');

/**
 * GET /equipos
 * Lista todos los equipos. Endpoint público.
 * Query params opcionales: liga_id, division
 */
async function getAll(req, res) {
  try {
    // Filtros opcionales vía query string: ?liga_id=arg&division=1
    const filtros = {};
    if (req.query.liga_id) filtros.liga_id = req.query.liga_id;
    if (req.query.division) filtros.division = Number(req.query.division);

    const rows = await equiposService.getAll(filtros);
    const playersRows = await jugadoresService.getAll();
    const counts = playersRows.reduce((acc, player) => {
      acc[player.equipo_id] = (acc[player.equipo_id] || 0) + 1;
      return acc;
    }, {});

    return res.json(
      rows.map((row) => ({
        ...fromEquipoRow(row),
        playerCount: counts[row.id] || 0,
      }))
    );
  } catch (error) {
    return res.status(500).json({ error: 'No se pudieron listar los equipos.', detail: error.message });
  }
}

/**
 * GET /equipos/:id
 * Devuelve el detalle de un equipo y su plantilla. Endpoint público.
 */
async function getById(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'ID de equipo inválido.' });
    }

    const teamRow = await equiposService.getById(id);
    if (!teamRow) {
      return res.status(404).json({ error: 'Equipo no encontrado.' });
    }

    const playersRows = await jugadoresService.getByEquipo(id);

    return res.json({
      team: fromEquipoRow(teamRow),
      players: playersRows.map(fromJugadorRow),
    });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo obtener el detalle del equipo.', detail: error.message });
  }
}

/**
 * POST /equipos
 * Crea un nuevo equipo. Requiere JWT de administrador.
 */
async function create(req, res) {
  try {
    const errors = validateEquipoPayload(req.body);
    if (Object.keys(errors).length) {
      return res.status(400).json({ errors });
    }

    // Si viene el nombre del país, asegurar que exista con sus 4 divisiones
    const countryName = req.body.countryName?.trim();
    if (countryName) {
      const existente = await paisesService.findByNombre(countryName);
      if (!existente) {
        await paisesService.create(countryName);
      }
    }

    const created = await equiposService.create(toEquipoRow(req.body));
    return res.status(201).json(fromEquipoRow(created));
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo crear el equipo.', detail: error.message });
  }
}

/**
 * PUT /equipos/:id
 * Modifica un equipo existente. Requiere JWT de administrador.
 */
async function update(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'ID de equipo inválido.' });
    }

    const errors = validateEquipoPayload(req.body);
    if (Object.keys(errors).length) {
      return res.status(400).json({ errors });
    }

    const updated = await equiposService.update(id, toEquipoRow(req.body));
    if (!updated) {
      return res.status(404).json({ error: 'Equipo no encontrado.' });
    }
    return res.json(fromEquipoRow(updated));
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo actualizar el equipo.', detail: error.message });
  }
}

/**
 * DELETE /equipos/:id
 * Elimina un equipo. Requiere JWT de administrador.
 */
async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'ID de equipo inválido.' });
    }

    await equiposService.remove(id);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo eliminar el equipo.', detail: error.message });
  }
}

module.exports = { getAll, getById, create, update, remove };
