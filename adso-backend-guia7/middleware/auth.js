const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ mensaje: 'Se requiere un token Bearer.' });
  }
  try {
    const secret = process.env.JWT_SECRET || 'adso_sena_clave_secreta_super_segura_2026';
    req.auth = jwt.verify(token, secret);
    req.auth.sub = req.auth.sub || req.auth.id;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ mensaje: 'El token no es válido o ha expirado.' });
    }
    return next(error);
  }
}

module.exports = { authenticate };
