const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BonLivraison = sequelize.define('BonLivraison', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  numero_bon: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  commande_id: { type: DataTypes.INTEGER, allowNull: false },
  date_livraison: { type: DataTypes.DATEONLY, allowNull: false },
  date_livraison_effective: { type: DataTypes.DATEONLY, allowNull: true },
  adresse_livraison: { type: DataTypes.TEXT, allowNull: false },
  transporteur: { type: DataTypes.STRING(100), allowNull: true },
  numero_suivi: { type: DataTypes.STRING(100), allowNull: true },
  statut: { 
    type: DataTypes.ENUM('en_preparation', 'expedie', 'en_transit', 'livre', 'retour'), 
    allowNull: true, 
    defaultValue: 'en_preparation' 
  },
  notes: { type: DataTypes.TEXT, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW }
}, {
  tableName: 'bons_livraison',
  timestamps: false
});

// Définir les associations
const defineAssociations = (models) => {
  BonLivraison.belongsTo(models.Commande, { foreignKey: 'commande_id', as: 'commande' });
  BonLivraison.hasMany(models.BonLivraisonDetail, { foreignKey: 'bon_livraison_id', as: 'details' });
};

module.exports = { BonLivraison, defineAssociations }; 