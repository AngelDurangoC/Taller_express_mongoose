const mongoose = require('mongoose');

const conectarBD = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      'mongodb://127.0.0.1:27017/adso_backend_db';
    const conn = await mongoose.connect(mongoURI);
    console.log(`✓ Conexión exitosa a MongoDB: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('✗ Error crítico al conectar con MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = conectarBD;
