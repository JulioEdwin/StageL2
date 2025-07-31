const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FactureDetail = sequelize.define('FactureDetail', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  facture_id: { type: DataTypes.INTEGER, allowNull: false },
  produit_id: { type: DataTypes.INTEGER, allowNull: false },
  quantite: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  prix_unitaire: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
  prix_total: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: 'facture_details',
  timestamps: false
});

// Définir les associations
const defineAssociations = (models) => {
  FactureDetail.belongsTo(models.Facture, { foreignKey: 'facture_id', as: 'facture' });
  FactureDetail.belongsTo(models.Produit, { foreignKey: 'produit_id', as: 'produit' });
};

module.exports = { FactureDetail, defineAssociations }; 