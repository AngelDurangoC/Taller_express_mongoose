const express = require('express');
const router = express.Router();
const { obtenerEstadisticas } = require('../controllers/reporteController');

router.get('/estadisticas', obtenerEstadisticas);

module.exports = router;
