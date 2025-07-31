const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BonLivraisonDetail = sequelize.define('BonLivraisonDetail', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  bon_livraison_id: { type: DataTypes.INTEGER, allowNull: false },
  produit_id: { type: DataTypes.INTEGER, allowNull: false },
  quantite_commandee: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  quantite_livree: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW }
}, {
  tableName: 'bon_livraison_details',
  timestamps: false
});

// Définir les associations
const defineAssociations = (models) => {
  BonLivraisonDetail.belongsTo(models.BonLivraison, { foreignKey: 'bon_livraison_id', as: 'bon_livraison' });
  BonLivraisonDetail.belongsTo(models.Produit, { foreignKey: 'produit_id', as: 'produit' });
};

module.exports = { BonLivraisonDetail, defineAssociations }; 