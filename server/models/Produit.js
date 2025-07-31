const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Produit = sequelize.define('Produit', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.STRING(150), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  lot_production_id: { type: DataTypes.INTEGER, allowNull: true },
  type_vin: { 
    type: DataTypes.ENUM('rouge', 'blanc', 'rose', 'petillant'), 
    allowNull: false 
  },
  millesime: { type: DataTypes.INTEGER, allowNull: false }, // YEAR est mappé sur INTEGER
  degre_alcool: { type: DataTypes.DECIMAL(4,2), allowNull: true },
  volume_bouteille: { type: DataTypes.DECIMAL(6,2), allowNull: true, defaultValue: 750.00 },
  prix_unitaire: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  stock_actuel: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
  stock_minimum: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 10 },
  code_produit: { type: DataTypes.STRING(50), allowNull: true, unique: true },
  statut: { 
    type: DataTypes.ENUM('actif', 'inactif', 'rupture'), 
    allowNull: true, 
    defaultValue: 'actif' 
  },
  created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
}, {
  tableName: 'produits',
  timestamps: false, // car tu gères les timestamps manuellement
});

// Définir les associations
const defineAssociations = (models) => {
  Produit.hasMany(models.DetailCommande, { foreignKey: 'produit_id', as: 'details_commandes' });
  Produit.hasMany(models.BonLivraisonDetail, { foreignKey: 'produit_id', as: 'details_livraison' });
};

module.exports = { Produit, defineAssociations };