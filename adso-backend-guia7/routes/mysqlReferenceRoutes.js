const express = require('express');
const controller = require('../controllers/mysqlReferenceController');
const asyncHandler = require('../middleware/asyncHandler');
const { validateLogin, validateProduct, validateRegistration } = require('../middleware/validateRequest');

const router = express.Router();

router.post('/productos', validateProduct, asyncHandler(controller.crearProductoMySQL));
router.get('/productos', asyncHandler(controller.obtenerProductosMySQL));
router.get('/productos/categoria/:cat', asyncHandler(controller.obtenerProductosPorCategoriaMySQL));
router.get('/productos/:id', asyncHandler(controller.obtenerProductoPorIdMySQL));
router.put('/productos/:id', validateProduct, asyncHandler(controller.actualizarProductoMySQL));
router.delete('/productos/:id', asyncHandler(controller.eliminarProductoMySQL));
router.post('/usuarios/registro', validateRegistration, asyncHandler(controller.registrarUsuarioMySQL));
router.post('/usuarios/login', validateLogin, asyncHandler(controller.loginUsuarioMySQL));
router.get('/usuarios', asyncHandler(controller.obtenerUsuariosMySQL));
router.get('/reportes/estadisticas', asyncHandler(controller.obtenerEstadisticasMySQL));

module.exports = router;
