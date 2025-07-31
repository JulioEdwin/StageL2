const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AnalyseQualite = sequelize.define('AnalyseQualite', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  lot_production_id: { type: DataTypes.INTEGER, allowNull: false },
  date_analyse: { type: DataTypes.DATEONLY, allowNull: false },
  type_analyse: { type: DataTypes.ENUM('fermentation','vieillissement','final'), allowNull: false },
  ph: { type: DataTypes.DECIMAL(3,1), allowNull: true },
  acidite: { type: DataTypes.DECIMAL(5,2), allowNull: true },
  degre_alcool: { type: DataTypes.DECIMAL(4,2), allowNull: true },
  sucre_residuel: { type: DataTypes.DECIMAL(5,2), allowNull: true },
  so2_libre: { type: DataTypes.DECIMAL(6,2), allowNull: true },
  so2_total: { type: DataTypes.DECIMAL(6,2), allowNull: true },
  notes_degustation: { type: DataTypes.TEXT, allowNull: true },
  conforme: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
  created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW }
}, {
  tableName: 'analyses_qualite',
  timestamps: false
});

// Associations
const defineAssociations = (models) => {
  AnalyseQualite.belongsTo(models.LotProduction, { foreignKey: 'lot_production_id', as: 'lot_production' });
};

module.exports = { AnalyseQualite, defineAssociations }; 