const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MouvementStock = sequelize.define('MouvementStock', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  produit_id: { type: DataTypes.INTEGER, allowNull: false },
  type_mouvement: { type: DataTypes.ENUM('entree', 'sortie', 'ajustement'), allowNull: false },
  quantite: { type: DataTypes.INTEGER, allowNull: false },
  date_mouvement: { type: DataTypes.DATEONLY, allowNull: false },
  motif: { type: DataTypes.STRING(255), allowNull: true },
  reference: { type: DataTypes.STRING(100), allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: 'mouvements_stock',
  timestamps: false
});
// Aucun code à corriger ou à ajouter ici, le modèle MouvementStock est déjà correctement défini.

// Définir les associations
const defineAssociations = (models) => {
  MouvementStock.belongsTo(models.Produit, { foreignKey: 'produit_id', as: 'produit' });
};

module.exports = { MouvementStock, defineAssociations }; 