// server/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password_hash'] } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
  }
});

// POST create user
router.post('/', async (req, res) => {
  try {
    const { username, email, password, role, full_name, phone } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username, email, password_hash: hash, role, full_name, phone
    });
    res.status(201).json({ ...user.toJSON(), password_hash: undefined });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de l'utilisateur" });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const { username, email, password, role, full_name, phone } = req.body;
    const updateData = { username, email, role, full_name, phone };
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }
    await User.update(updateData, { where: { id: req.params.id } });
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password_hash'] } });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ message: "Utilisateur supprimé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur" });
  }
});

// PUT /api/users/:id/password : réinitialisation du mot de passe
router.put('/:id/password', async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: "Nouveau mot de passe requis" });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    await User.update({ password_hash: hash }, { where: { id: req.params.id } });
    res.json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du mot de passe" });
  }
});

// PUT /api/users/:id/mainte : mise à jour du mot de passe (alias maintenance)
router.put('/:id/mainte', async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: "Nouveau mot de passe requis" });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    await User.update({ password_hash: hash }, { where: { id: req.params.id } });
    res.json({ message: "Mot de passe mis à jour (mainte) avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du mot de passe (mainte)" });
  }
});

module.exports = router;