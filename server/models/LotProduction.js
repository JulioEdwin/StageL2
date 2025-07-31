const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LotProduction = sequelize.define('LotProduction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  numero_lot: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  recolte_id: { type: DataTypes.INTEGER, allowNull: true },
  bassin_id: { type: DataTypes.INTEGER, allowNull: true },
  date_debut_production: { type: DataTypes.DATEONLY, allowNull: false },
  date_fin_production: { type: DataTypes.DATEONLY, allowNull: true },
  type_vin: { type: DataTypes.STRING(50), allowNull: false },
  volume_initial_litres: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  volume_final_litres: { type: DataTypes.DECIMAL(10,2), allowNull: true },
  degre_alcool: { type: DataTypes.DECIMAL(5,2), allowNull: true },
  statut: { type: DataTypes.ENUM('en_fermentation', 'en_vieillissement', 'pret', 'embouteille'), allowNull: false, defaultValue: 'en_fermentation' },
  notes_production: { type: DataTypes.TEXT, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: 'lots_production',
  timestamps: false
});

// Définir les associations
const defineAssociations = (models) => {
  LotProduction.belongsTo(models.Recolte, { foreignKey: 'recolte_id', as: 'recolte' });
  LotProduction.belongsTo(models.Bassin, { foreignKey: 'bassin_id', as: 'bassin' });
  LotProduction.hasMany(models.Produit, { foreignKey: 'lot_production_id', as: 'produits' });
};

module.exports = { LotProduction, defineAssociations }; 