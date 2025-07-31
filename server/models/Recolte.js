const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Recolte = sequelize.define('Recolte', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  parcelle_id: { type: DataTypes.INTEGER, allowNull: false },
  date_recolte: { type: DataTypes.DATEONLY, allowNull: false },
  quantite_kg: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  qualite_raisin: { type: DataTypes.STRING(100), allowNull: false },
  taux_sucre: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
  acidite: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
  ph_raisin: { type: DataTypes.DECIMAL(4, 2), allowNull: true },
  conditions_meteo: { type: DataTypes.STRING(255), allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW }
  // NE PAS inclure updated_at
}, {
  tableName: 'recoltes',
  timestamps: false,
});

// Définir les associations
const defineAssociations = (models) => {
  Recolte.belongsTo(models.Parcelle, { foreignKey: 'parcelle_id', as: 'parcelle' });
};

module.exports = { Recolte, defineAssociations };