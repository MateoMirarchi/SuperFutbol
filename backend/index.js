/**
 * index.js
 * Punto de entrada del servidor Express.
 * Carga variables de entorno, monta rutas y arranca el servidor.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors    = require('cors');

const equiposRoutes   = require('./routes/equipos');
const jugadoresRoutes = require('./routes/jugadores');
const authRoutes      = require('./routes/auth');
const paisesRoutes    = require('./routes/paises');
const simulacionRoutes = require('./routes/simulacion');
const mercadoRoutes = require('./routes/mercado');
const confianzaRoutes = require('./routes/confianza');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares globales ──────────────────────────────────────────
app.use(cors({
  origin: true,           // refleja el Origin del request (acepta cualquiera)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors()); // preflight para todas las rutas
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// ── Rutas ─────────────────────────────────────────────────────────
app.use('/', authRoutes);
app.use('/auth', authRoutes);
app.use('/equipos', equiposRoutes);
app.use('/jugadores', jugadoresRoutes);
app.use('/paises', paisesRoutes);
app.use('/simulacion', simulacionRoutes);
app.use('/mercado', mercadoRoutes);
app.use('/confianza', confianzaRoutes);

// ── Health check ─────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Arrancar servidor ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[SuperFutbol API] Servidor corriendo en http://localhost:${PORT}`);
});
