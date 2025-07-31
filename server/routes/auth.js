const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { User } = require('../models'); // Adjust according to your Sequelize or other model structure

// Route for login at /api/auth
router.post('/', async (req, res) => {
  const { username, password } = req.body;

  // Input validation
  if (!username || !password) {
    return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
  }

  try {
    // Find user by username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
    }

    // Compare password with hashed password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
    }

    // Successful login - return user data
    res.status(200).json({
      id: user.id,
      username: user.username,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
  }
});

// Route GET pour tester la disponibilité de l'API d'authentification
router.get('/', (req, res) => {
  res.json({ message: "Route d'authentification disponible" });
});

// Route POST pour l'inscription d'un nouvel utilisateur
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Nom d'utilisateur et mot de passe requis." });
  }
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ error: "Nom d'utilisateur déjà utilisé." });
    }
    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    // Création de l'utilisateur
    const user = await User.create({
      username,
      password: hashedPassword,
      role: role || 'user'
    });
    res.status(201).json({ message: "Utilisateur créé avec succès", user: {
      id: user.id,
      username: user.username,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }});
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ error: "Erreur serveur lors de l'inscription" });
  }
});

module.exports = router;