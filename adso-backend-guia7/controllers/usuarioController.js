const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        status: 'Error',
        error: 'Los campos nombre, email y password son obligatorios'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'Error',
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const usuarioExistente = await Usuario.findOne({ email: normalizedEmail });
    if (usuarioExistente) {
      return res.status(400).json({
        status: 'Error',
        error: 'El correo electrónico ya se encuentra registrado'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptado = await bcrypt.hash(password, salt);
    const nuevoUsuario = new Usuario({
      nombre,
      email: normalizedEmail,
      password: passwordEncriptado
    });
    const usuarioGuardado = await nuevoUsuario.save();

    return res.status(201).json({
      status: 'OK',
      data: {
        _id: usuarioGuardado._id,
        nombre: usuarioGuardado.nombre,
        email: usuarioGuardado.email,
        fechaCreacion: usuarioGuardado.fechaCreacion
      }
    });
  } catch (error) {
    const statusCode = error.name === 'ValidationError' || error.code === 11000 ? 400 : 500;
    return res.status(statusCode).json({
      status: 'Error',
      error: error.message
    });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'Error',
        error: 'Debe proporcionar email y password'
      });
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase().trim() });
    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res.status(401).json({
        status: 'Error',
        error: 'Credenciales inválidas: correo o contraseña incorrectos'
      });
    }

    const secret = process.env.JWT_SECRET || 'adso_sena_clave_secreta_super_segura_2026';
    const expiresIn = process.env.JWT_EXPIRES_IN || '4h';
    const token = jwt.sign(
      { id: usuario._id, email: usuario.email },
      secret,
      { expiresIn }
    );

    return res.status(200).json({
      status: 'OK',
      token,
      usuario: { email: usuario.email }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Error',
      error: error.message
    });
  }
};

const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find({}, '-password').sort({ fechaCreacion: -1 });

    return res.status(200).json({
      status: 'OK',
      total: usuarios.length,
      data: usuarios
    });
  } catch (error) {
    return res.status(500).json({
      status: 'Error',
      error: error.message
    });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  obtenerUsuarios
};
