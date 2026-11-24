const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/dbMysql');

const crearProductoMySQL = async (req, res) => {
  try {
    const { nombre, precio, categoria, stock } = req.body;

    if (!nombre || precio === undefined || !categoria) {
      return res.status(400).json({
        status: 'Error',
        error: 'Los campos nombre, precio y categoria son obligatorios'
      });
    }

    if (Number(precio) < 0 || (stock !== undefined && Number(stock) < 0)) {
      return res.status(400).json({
        status: 'Error',
        error: 'El precio y el stock deben ser mayores o iguales a 0'
      });
    }

    const stockFinal = stock !== undefined ? Number(stock) : 0;
    const [result] = await pool.execute(
      'INSERT INTO productos (nombre, precio, categoria, stock) VALUES (?, ?, ?, ?)',
      [nombre.trim(), Number(precio), categoria.trim(), stockFinal]
    );
    const [rows] = await pool.execute(
      'SELECT id, nombre, precio, categoria, stock, fecha_creacion AS fechaCreacion FROM productos WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      status: 'OK',
      data: rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Error',
      error: error.message
    });
  }
};

const obtenerProductosMySQL = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, nombre, precio, categoria, stock, fecha_creacion AS fechaCreacion FROM productos ORDER BY fecha_creacion DESC'
    );

    return res.status(200).json({
      status: 'OK',
      total: rows.length,
      data: rows
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Error',
      error: error.message
    });
  }
};

const obtenerProductoPorIdMySQL = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'Error',
        error: 'El ID proporcionado debe ser un entero positivo válido'
      });
    }

    const [rows] = await pool.execute(
      'SELECT id, nombre, precio, categoria, stock, fecha_creacion AS fechaCreacion FROM productos WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'Error',
        error: 'Producto no encontrado en MySQL'
      });
    }

    return res.status(200).json({
      status: 'OK',
      data: rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Error',
      error: error.message
    });
  }
};

const actualizarProductoMySQL = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nombre, precio, categoria, stock } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'Error',
        error: 'El ID proporcionado debe ser un entero positivo válido'
      });
    }

    if (!nombre || precio === undefined || !categoria || stock === undefined) {
      return res.status(400).json({
        status: 'Error',
        error: 'Para actualización total (PUT) debe enviar nombre, precio, categoria y stock'
      });
    }

    if (Number(precio) < 0 || Number(stock) < 0) {
      return res.status(400).json({
        status: 'Error',
        error: 'El precio y el stock no pueden ser negativos'
      });
    }

    const [result] = await pool.execute(
      'UPDATE productos SET nombre = ?, precio = ?, categoria = ?, stock = ? WHERE id = ?',
      [nombre.trim(), Number(precio), categoria.trim(), Number(stock), id]
    );

    if (result.affectedRows === 0) {
      const [existing] = await pool.execute('SELECT id FROM productos WHERE id = ?', [id]);
      if (existing.length > 0) {
        const [rows] = await pool.execute(
          'SELECT id, nombre, precio, categoria, stock, fecha_creacion AS fechaCreacion FROM productos WHERE id = ?',
          [id]
        );
        return res.status(200).json({
          status: 'OK',
          data: rows[0]
        });
      }

      return res.status(404).json({
        status: 'Error',
        error: 'Producto no encontrado para actualizar en MySQL'
      });
    }

    const [rows] = await pool.execute(
      'SELECT id, nombre, precio, categoria, stock, fecha_creacion AS fechaCreacion FROM productos WHERE id = ?',
      [id]
    );

    return res.status(200).json({
      status: 'OK',
      data: rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Error',
      error: error.message
    });
  }
};

const eliminarProductoMySQL = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'Error',
        error: 'El ID proporcionado debe ser un entero positivo válido'
      });
    }

    const [existing] = await pool.execute(
      'SELECT id, nombre, precio, categoria, stock, fecha_creacion AS fechaCreacion FROM productos WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: 'Error',
        error: 'Producto no encontrado para eliminar en MySQL'
      });
    }

    await pool.execute('DELETE FROM productos WHERE id = ?', [id]);

    return res.status(200).json({
      status: 'OK',
      mensaje: 'Producto eliminado correctamente de MySQL',
      data: existing[0]
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Error',
      error: error.message
    });
  }
};

const obtenerProductosPorCategoriaMySQL = async (req, res) => {
  try {
    const { cat } = req.params;
    if (!cat || !cat.trim()) {
      return res.status(400).json({
        status: 'Error',
        error: 'Debe especificar una categoría válida'
      });
    }

    const [rows] = await pool.execute(
      'SELECT id, nombre, precio, categoria, stock, fecha_creacion AS fechaCreacion FROM productos WHERE LOWER(categoria) = LOWER(?) ORDER BY fecha_creacion DESC',
      [cat.trim()]
    );

    return res.status(200).json({
      status: 'OK',
      total: rows.length,
      data: rows
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Error',
      error: error.message
    });
  }
};

const registrarUsuarioMySQL = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        status: 'Error',
        error: 'Los campos nombre, email y password son obligatorios'
      });
    }

    const emailNormalizado = email.toLowerCase().trim();
    const [existing] = await pool.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [emailNormalizado]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        status: 'Error',
        error: 'El correo electrónico ya está registrado en MySQL'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
      [nombre.trim(), emailNormalizado, hash]
    );
    const [rows] = await pool.execute(
      'SELECT id, nombre, email, fecha_creacion AS fechaCreacion FROM usuarios WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      status: 'OK',
      data: rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Error',
      error: error.message
    });
  }
};

const loginUsuarioMySQL = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'Error',
        error: 'Debe proporcionar email y password'
      });
    }

    const [rows] = await pool.execute(
      'SELECT id, email, password FROM usuarios WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        status: 'Error',
        error: 'Credenciales inválidas'
      });
    }

    const usuario = rows[0];
    const coincidencia = await bcrypt.compare(password, usuario.password);
    if (!coincidencia) {
      return res.status(401).json({
        status: 'Error',
        error: 'Credenciales inválidas'
      });
    }

    const secret = process.env.JWT_SECRET || 'adso_sena_clave_secreta_super_segura_2026';
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '4h'
    });

    return res.status(200).json({
      status: 'OK',
      token,
      usuario: {
        email: usuario.email
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Error',
      error: error.message
    });
  }
};

const obtenerUsuariosMySQL = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, nombre, email, fecha_creacion AS fechaCreacion FROM usuarios ORDER BY fecha_creacion DESC'
    );

    return res.status(200).json({
      status: 'OK',
      total: rows.length,
      data: rows
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Error',
      error: error.message
    });
  }
};

const obtenerEstadisticasMySQL = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        categoria AS _id,
        categoria,
        COUNT(*) AS totalProductos,
        ROUND(AVG(precio), 2) AS precioPromedio,
        COALESCE(SUM(stock), 0) AS stockTotal
      FROM productos
      GROUP BY categoria
      ORDER BY totalProductos DESC
    `);

    return res.status(200).json({
      status: 'OK',
      totalCategorias: rows.length,
      data: rows
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Error',
      error: error.message
    });
  }
};

module.exports = {
  crearProductoMySQL,
  obtenerProductosMySQL,
  obtenerProductoPorIdMySQL,
  actualizarProductoMySQL,
  eliminarProductoMySQL,
  obtenerProductosPorCategoriaMySQL,
  registrarUsuarioMySQL,
  loginUsuarioMySQL,
  obtenerUsuariosMySQL,
  obtenerEstadisticasMySQL
};
