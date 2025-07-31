const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// MySQL pool for direct queries
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lazan_bestileo_wine',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Sequelize instance for ORM
const sequelize = new Sequelize(
  process.env.DB_NAME || 'lazan_bestileo_wine',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: false // Disable timestamps by default
    }
  }
);

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connexion à la base de données réussie');
    connection.release();
    
    // Test Sequelize connection
    await sequelize.authenticate();
    console.log('✅ Connexion Sequelize réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    return false;
  }
};

module.exports = { pool, sequelize, testConnection };