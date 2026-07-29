/**
 * controllers/mercadoController.js
 */

const {
  evaluateSaleOffer,
  evaluateLoanOffer,
} = require('../utils/business/transferMarket');

function evaluarVenta(req, res) {
  try {
    const outcome = evaluateSaleOffer(req.body ?? {});
    return res.json(outcome);
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo evaluar la venta.', detail: error.message });
  }
}

function evaluarPrestamo(req, res) {
  try {
    const outcome = evaluateLoanOffer(req.body ?? {});
    return res.json(outcome);
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo evaluar el prestamo.', detail: error.message });
  }
}

module.exports = {
  evaluarVenta,
  evaluarPrestamo,
};
