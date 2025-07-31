const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Parcelle = sequelize.define('Parcelle', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.STRING(100), allowNull: false },
  superficie: { type: DataTypes.DECIMAL(8,2), allowNull: false },
  localisation: { type: DataTypes.STRING(255), allowNull: true },
  type_sol: { type: DataTypes.STRING(100), allowNull: true },
  exposition: { type: DataTypes.STRING(50), allowNull: true },
  altitude: { type: DataTypes.INTEGER, allowNull: true },
  pente: { type: DataTypes.DECIMAL(5,2), allowNull: true },
  date_plantation: { type: DataTypes.DATEONLY, allowNull: true },
  cepage: { type: DataTypes.STRING(100), allowNull: false },
  densite_plantation: { type: DataTypes.INTEGER, allowNull: true },
  certification: { type: DataTypes.ENUM('bio', 'conventionnel', 'demeter'), allowNull: true },
  statut: { type: DataTypes.ENUM('active', 'inactive', 'renovation'), allowNull: false, defaultValue: 'active' },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: 'parcelles',
  timestamps: false
});

// Définir les associations
const defineAssociations = (models) => {
  Parcelle.hasMany(models.Recolte, { foreignKey: 'parcelle_id', as: 'recoltes' });
};

module.exports = { Parcelle, defineAssociations }; 