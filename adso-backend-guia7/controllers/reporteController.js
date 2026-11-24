const Producto = require('../models/Producto');

const obtenerEstadisticas = async (req, res) => {
  try {
    const estadisticas = await Producto.aggregate([
      {
        $group: {
          _id: '$categoria',
          totalProductos: { $sum: 1 },
          precioPromedio: { $avg: '$precio' },
          stockTotal: { $sum: '$stock' }
        }
      },
      {
        $project: {
          _id: 1,
          categoria: '$_id',
          totalProductos: 1,
          precioPromedio: { $round: ['$precioPromedio', 2] },
          stockTotal: 1
        }
      },
      {
        $sort: { totalProductos: -1 }
      }
    ]);

    return res.status(200).json({
      status: 'OK',
      totalCategorias: estadisticas.length,
      data: estadisticas
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Error',
      error: error.message
    });
  }
};

module.exports = {
  obtenerEstadisticas
};
