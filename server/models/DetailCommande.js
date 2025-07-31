const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DetailCommande = sequelize.define('DetailCommande', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  commande_id: { type: DataTypes.INTEGER, allowNull: false },
  produit_id: { type: DataTypes.INTEGER, allowNull: false },
  quantite: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  prix_unitaire: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
  prix_total: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: 'commande_details',
  timestamps: false
});

// Définir les associations
const defineAssociations = (models) => {
  DetailCommande.belongsTo(models.Commande, { foreignKey: 'commande_id', as: 'commande' });
  DetailCommande.belongsTo(models.Produit, { foreignKey: 'produit_id', as: 'produit' });
};

module.exports = { DetailCommande, defineAssociations }; 