const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Client = sequelize.define('Client', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.STRING(100), allowNull: false },
  prenom: { type: DataTypes.STRING(100), allowNull: false },
  entreprise: { type: DataTypes.STRING(150), allowNull: true },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
  telephone: { type: DataTypes.STRING(30), allowNull: false },
  adresse: { type: DataTypes.STRING(255), allowNull: false },
  ville: { type: DataTypes.STRING(100), allowNull: false },
  code_postal: { type: DataTypes.STRING(20), allowNull: true },
  pays: { type: DataTypes.STRING(100), allowNull: false },
  type_client: { type: DataTypes.ENUM('particulier', 'entreprise'), allowNull: false, defaultValue: 'particulier' },
  statut: { type: DataTypes.ENUM('actif', 'inactif'), allowNull: false, defaultValue: 'actif' },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: 'clients',
  timestamps: false
});

// Définir les associations
const defineAssociations = (models) => {
  Client.hasMany(models.Commande, { foreignKey: 'client_id', as: 'commandes' });
  // Erreur lors de la récupération des clients
};

module.exports = { Client, defineAssociations };