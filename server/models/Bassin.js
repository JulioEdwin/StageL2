const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Bassin = sequelize.define('Bassin', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.STRING(100), allowNull: false },
  capacite_litres: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  materiau: { type: DataTypes.STRING(50), allowNull: false },
  type_bassin: { type: DataTypes.STRING(50), allowNull: false },
  statut: { type: DataTypes.ENUM('disponible', 'occupe', 'maintenance'), allowNull: false, defaultValue: 'disponible' },
  temperature_optimale: { type: DataTypes.DECIMAL(5,2), allowNull: true },
  last_cleaning: { type: DataTypes.DATEONLY, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: 'bassins',
  timestamps: false
});

// Définir les associations
const defineAssociations = (models) => {
  Bassin.hasMany(models.LotProduction, { foreignKey: 'bassin_id', as: 'lots_production' });
};

module.exports = { Bassin, defineAssociations }; 