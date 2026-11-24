const mongoose = require('mongoose');
const Producto = require('../models/Producto');

const crearProducto = async (req, res) => {
  try {
    const { nombre, precio, categoria, stock } = req.body;

    if (!nombre || precio === undefined || !categoria) {
      return res.status(400).json({
        status: 'Error',
        error: 'Los campos nombre, precio y categoria son obligatorios'
      });
    }

    const nuevoProducto = new Producto({
      nombre,
      precio,
      categoria,
      stock: stock !== undefined ? stock : 0
    });

    const productoGuardado = await nuevoProducto.save();

    return res.status(201).json({
      status: 'OK',
      data: productoGuardado
    });
  } catch (error) {
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    return res.status(statusCode).json({
      status: 'Error',
      error: error.message
    });
  }
};

const obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find().sort({ fechaCreacion: -1 });

    return res.status(200).json({
      status: 'OK',
      total: productos.length,
      data: productos
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Error',
      error: error.message
    });
  }
};

const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'Error',
        error: 'El ID proporcionado no tiene un formato ObjectId válido'
      });
    }

    const producto = await Producto.findById(id);

    if (!producto) {
      return res.status(404).json({
        status: 'Error',
        error: 'Producto no encontrado'
      });
    }

    return res.status(200).json({
      status: 'OK',
      data: producto
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Error',
      error: error.message
    });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, categoria, stock } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'Error',
        error: 'El ID proporcionado no tiene un formato ObjectId válido'
      });
    }

    if (!nombre || precio === undefined || !categoria || stock === undefined) {
      return res.status(400).json({
        status: 'Error',
        error: 'Para una actualización total (PUT) debe enviar nombre, precio, categoria y stock'
      });
    }

    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      { nombre, precio, categoria, stock },
      { new: true, runValidators: true }
    );

    if (!productoActualizado) {
      return res.status(404).json({
        status: 'Error',
        error: 'Producto no encontrado para actualizar'
      });
    }

    return res.status(200).json({
      status: 'OK',
      data: productoActualizado
    });
  } catch (error) {
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    return res.status(statusCode).json({
      status: 'Error',
      error: error.message
    });
  }
};

const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'Error',
        error: 'El ID proporcionado no tiene un formato ObjectId válido'
      });
    }

    const productoEliminado = await Producto.findByIdAndDelete(id);

    if (!productoEliminado) {
      return res.status(404).json({
        status: 'Error',
        error: 'Producto no encontrado para eliminar'
      });
    }

    return res.status(200).json({
      status: 'OK',
      mensaje: 'Producto eliminado correctamente',
      data: productoEliminado
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Error',
      error: error.message
    });
  }
};

const obtenerProductosPorCategoria = async (req, res) => {
  try {
    const { cat } = req.params;

    if (!cat || !cat.trim()) {
      return res.status(400).json({
        status: 'Error',
        error: 'Debe especificar una categoría válida'
      });
    }

    const categoriaEscapada = cat.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const productos = await Producto.find({
      categoria: { $regex: new RegExp(`^${categoriaEscapada}$`, 'i') }
    }).sort({ fechaCreacion: -1 });

    return res.status(200).json({
      status: 'OK',
      total: productos.length,
      data: productos
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Error',
      error: error.message
    });
  }
};

module.exports = {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto,
  obtenerProductosPorCategoria
};
