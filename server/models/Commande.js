const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Commande = sequelize.define('Commande', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  numero_commande: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  client_id: { type: DataTypes.INTEGER, allowNull: false },
  date_commande: { type: DataTypes.DATEONLY, allowNull: false },
  date_livraison_prevue: { type: DataTypes.DATEONLY, allowNull: true },
  statut: { type: DataTypes.ENUM('en_attente', 'confirmee', 'preparee', 'livree', 'annulee'), allowNull: false, defaultValue: 'en_attente' },
  montant_total: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
  tva: { type: DataTypes.DECIMAL(8,2), allowNull: false, defaultValue: 0 },
  remise: { type: DataTypes.DECIMAL(8,2), allowNull: false, defaultValue: 0 },
  notes: { type: DataTypes.TEXT, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: 'commandes',
  timestamps: false
});

// Définir les associations
const defineAssociations = (models) => {
  Commande.belongsTo(models.Client, { foreignKey: 'client_id', as: 'client' });
  Commande.hasMany(models.DetailCommande, { foreignKey: 'commande_id', as: 'details' });
};

module.exports = { Commande, defineAssociations };