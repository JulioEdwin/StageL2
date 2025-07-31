const express = require('express');
const router = express.Router();
const { Recolte } = require('../models');

// GET all récoltes
router.get('/', async (req, res) => {
  try {
    const recoltes = await Recolte.findAll({
      order: [['date_recolte', 'DESC']]
    });
    res.json(recoltes);
  } catch (error) {
    console.error('Erreur lors de la récupération des récoltes:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des récoltes" });
  }
});

// GET récolte by id
router.get('/:id', async (req, res) => {
  try {
    const recolte = await Recolte.findByPk(req.params.id);
    if (!recolte) {
      return res.status(404).json({ message: "Récolte non trouvée" });
    }
    res.json(recolte);
  } catch (error) {
    console.error('Erreur lors de la récupération de la récolte:', error);
    res.status(500).json({ message: "Erreur lors de la récupération de la récolte" });
  }
});

// POST create récolte
router.post('/', async (req, res) => {
  try {
    const recolte = await Recolte.create(req.body);
    res.status(201).json(recolte);
  } catch (error) {
    console.error('Erreur lors de la création de la récolte:', error);
    res.status(500).json({ message: "Erreur lors de la création de la récolte" });
  }
});

// PUT update récolte
router.put('/:id', async (req, res) => {
  try {
    const recolte = await Recolte.findByPk(req.params.id);
    if (!recolte) {
      return res.status(404).json({ message: "Récolte non trouvée" });
    }
    
    await Recolte.update(req.body, { where: { id: req.params.id } });
    const updatedRecolte = await Recolte.findByPk(req.params.id);
    res.json(updatedRecolte);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la récolte:', error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la récolte" });
  }
});

// DELETE récolte
router.delete('/:id', async (req, res) => {
  try {
    const recolte = await Recolte.findByPk(req.params.id);
    if (!recolte) {
      return res.status(404).json({ message: "Récolte non trouvée" });
    }
    
    await Recolte.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: "Récolte supprimée avec succès" });
  } catch (error) {
    console.error('Erreur lors de la suppression de la récolte:', error);
    res.status(500).json({ message: "Erreur lors de la suppression de la récolte" });
  }
});

// GET récoltes par parcelle
router.get('/parcelle/:parcelleId', async (req, res) => {
  try {
    const recoltes = await Recolte.findAll({
      where: { parcelle_id: req.params.parcelleId },
      order: [['date_recolte', 'DESC']]
    });
    res.json(recoltes);
  } catch (error) {
    console.error('Erreur lors de la récupération des récoltes par parcelle:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des récoltes par parcelle" });
  }
});

// GET récoltes par date
router.get('/date/:date', async (req, res) => {
  try {
    const recoltes = await Recolte.findAll({
      where: { date_recolte: req.params.date },
      order: [['parcelle_id', 'ASC']]
    });
    res.json(recoltes);
  } catch (error) {
    console.error('Erreur lors de la récupération des récoltes par date:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des récoltes par date" });
  }
});

module.exports = router;