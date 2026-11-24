function validateProduct(req, res, next) {
  const body = req.body;
  if (
    !body ||
    typeof body.nombre !== 'string' ||
    body.nombre.trim().length < 2 ||
    typeof body.categoria !== 'string' ||
    !body.categoria.trim() ||
    typeof body.precio !== 'number' ||
    !Number.isFinite(body.precio) ||
    body.precio < 0 ||
    (body.stock !== undefined && (!Number.isInteger(body.stock) || body.stock < 0))
  ) {
    return res.status(400).json({ mensaje: 'Los datos del producto no son válidos.' });
  }
  return next();
}

function validateRegistration(req, res, next) {
  const { nombre, email, password } = req.body || {};
  if (
    typeof nombre !== 'string' ||
    nombre.trim().length < 2 ||
    typeof email !== 'string' ||
    !isValidEmail(email) ||
    typeof password !== 'string' ||
    password.length < 6
  ) {
    return res.status(400).json({
      mensaje: 'Se requiere nombre, correo válido y contraseña de al menos 6 caracteres.'
    });
  }
  return next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || !isValidEmail(email) || typeof password !== 'string' || !password) {
    return res.status(400).json({ mensaje: 'Se requiere un correo válido y una contraseña.' });
  }
  return next();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = { validateProduct, validateRegistration, validateLogin };
