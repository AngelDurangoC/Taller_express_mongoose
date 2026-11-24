require('dotenv').config();

const express = require('express');
const cors = require('cors');
const conectarBD = require('./config/db');

const productoRoutes = require('./routes/productoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const mysqlReferenceRoutes = require('./routes/mysqlReferenceRoutes');

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    servicio: 'API RESTful ADSO - Guía de Aprendizaje #7 (Node.js + Express + MongoDB)',
    version: '1.0.0'
  });
});

app.use('/api/productos', productoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/mysql', mysqlReferenceRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: 'Error',
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error('Error no controlado:', error.stack || error.message);
  const statusCode =
    error instanceof SyntaxError && error.status === 400 && 'body' in error ? 400 : 500;
  return res.status(statusCode).json({
    status: 'Error',
    error: statusCode === 400 ? 'El cuerpo JSON no es válido' : 'Error interno del servidor'
  });
});

async function startServer() {
  await conectarBD();
  return app.listen(PORT, () => {
    console.log(`✓ Servidor Express ejecutándose en http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('✗ No fue posible iniciar el servidor:', error.message);
    process.exitCode = 1;
  });
}

module.exports = app;
module.exports.startServer = startServer;
