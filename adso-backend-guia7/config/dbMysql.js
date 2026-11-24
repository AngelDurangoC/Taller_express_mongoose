const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'adso_backend_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const verificarConexionMySQL = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('✓ Conexión exitosa al Pool de MySQL');
    return true;
  } catch (error) {
    console.error('✗ Error al verificar conexión con MySQL:', error.message);
    return false;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  pool,
  verificarConexionMySQL
};
