// Sequelize version of User model for authentication

const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Assure-toi que ce chemin pointe vers ton instance sequelize
const bcrypt = require('bcrypt');

// Définition du modèle User (doit correspondre à la table 'users')
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'employee'),
    allowNull: true,
    defaultValue: 'employee'
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: false
});

// Hook pour hasher le mot de passe avant création ou update
User.beforeCreate(async (user, options) => {
  if (user.password_hash) {
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});

User.beforeUpdate(async (user, options) => {
  if (user.changed('password_hash')) {
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});

// Méthode d'instance pour vérifier le mot de passe
User.prototype.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = User;
