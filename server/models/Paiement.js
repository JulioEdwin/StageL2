const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Paiement = sequelize.define('Paiement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  facture_id: { type: DataTypes.INTEGER, allowNull: false },
  date_paiement: { type: DataTypes.DATEONLY, allowNull: false },
  montant: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  mode_paiement: { type: DataTypes.STRING, allowNull: false },
  reference_paiement: { type: DataTypes.STRING, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'paiements',
  timestamps: false
});

// Définir les associations
const defineAssociations = (models) => {
  Paiement.belongsTo(models.Facture, { foreignKey: 'facture_id', as: 'facture' });
};

module.exports = { Paiement, defineAssociations };