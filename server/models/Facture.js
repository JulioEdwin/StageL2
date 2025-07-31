const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Facture = sequelize.define('Facture', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  numero_facture: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  client_id: { type: DataTypes.INTEGER, allowNull: false },
  commande_id: { type: DataTypes.INTEGER, allowNull: true },
  date_facture: { type: DataTypes.DATEONLY, allowNull: false },
  date_echeance: { type: DataTypes.DATEONLY, allowNull: true },
  montant_ht: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
  taux_tva: { type: DataTypes.DECIMAL(5,2), allowNull: false, defaultValue: 20 },
  montant_tva: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
  montant_ttc: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
  remise: { type: DataTypes.DECIMAL(8,2), allowNull: false, defaultValue: 0 },
  statut: { type: DataTypes.ENUM('brouillon', 'emise', 'payee', 'annulee'), allowNull: false, defaultValue: 'brouillon' },
  notes: { type: DataTypes.TEXT, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: 'factures',
  timestamps: false
});

// Définir les associations
const defineAssociations = (models) => {
  Facture.belongsTo(models.Client, { foreignKey: 'client_id', as: 'client' });
  Facture.belongsTo(models.Commande, { foreignKey: 'commande_id', as: 'commande' });
  Facture.hasMany(models.FactureDetail, { foreignKey: 'facture_id', as: 'details' });
};

module.exports = { Facture, defineAssociations };