/**
 * controllers/paisesController.js
 * Lógica de los endpoints de países y divisiones.
 */

const paisesService = require('../services/paisesService');

/**
 * GET /paises
 * Lista todos los países con sus divisiones. Endpoint público.
 */
async function getAll(req, res) {
  try {
    const paises = await paisesService.getAll();
    return res.json(paises);
  } catch (error) {
    return res.status(500).json({
      error: 'No se pudieron listar los países.',
      detail: error.message,
    });
  }
}

/**
 * POST /paises
 * Crea un país e inserta automáticamente sus 4 divisiones.
 * Requiere JWT de administrador.
 * Body: { nombre: string }
 */
async function create(req, res) {
  try {
    const { nombre } = req.body;

    // Validar campo requerido
    if (!nombre?.trim()) {
      return res.status(400).json({
        errors: { nombre: 'El nombre del país es requerido.' },
      });
    }

    // Verificar duplicado (case-insensitive)
    const existente = await paisesService.findByNombre(nombre);
    if (existente) {
      return res.status(409).json({
        error: `El país "${nombre.trim()}" ya existe.`,
      });
    }

    const resultado = await paisesService.create(nombre);
    return res.status(201).json(resultado);
  } catch (error) {
    return res.status(500).json({
      error: 'No se pudo crear el país.',
      detail: error.message,
    });
  }
}

module.exports = { getAll, create };
