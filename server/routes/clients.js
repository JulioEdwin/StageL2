const express = require('express');
const router = express.Router();
const { Client } = require('../models');

// GET all clients
router.get('/', async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des clients" });
  }
});

// GET client by id
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: "Client non trouvé" });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du client" });
  }
});

// POST create client
router.post('/', async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du client" });
  }
});

// PUT update client
router.put('/:id', async (req, res) => {
  try {
    await Client.update(req.body, { where: { id: req.params.id } });
    const client = await Client.findByPk(req.params.id);
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du client" });
  }
});

// DELETE client
router.delete('/:id', async (req, res) => {
  try {
    await Client.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du client" });
  }
});

module.exports = router;