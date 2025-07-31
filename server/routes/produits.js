const express = require('express');
const router = express.Router();
const { Produit } = require('../models');
const Sequelize = require('sequelize'); // Added for Sequelize.col
const { Op } = require('sequelize'); // Ajouté pour les opérateurs Sequelize modernes

// GET all produits
router.get('/', async (req, res) => {
  try {
    const produits = await Produit.findAll();
    res.json(produits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des produits" });
  }
});

// GET produit by id
router.get('/:id', async (req, res) => {
  try {
    const produit = await Produit.findByPk(req.params.id);
    if (!produit) return res.status(404).json({ message: "Produit non trouvé" });
    res.json(produit);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du produit" });
  }
});

// POST create produit
router.post('/', async (req, res) => {
  try {
    // Validation des données requises
    const { nom, prix_unitaire } = req.body;
    if (!nom || !prix_unitaire) {
      return res.status(400).json({ 
        message: "Le nom et le prix unitaire sont obligatoires" 
      });
    }

    // Validation du type de vin
    const { type_vin } = req.body;
    if (type_vin && !['rouge', 'blanc', 'rose', 'petillant'].includes(type_vin)) {
      return res.status(400).json({ 
        message: "Le type de vin doit être 'rouge', 'blanc', 'rose' ou 'petillant'" 
      });
    }

    // Validation du statut
    const { statut } = req.body;
    if (statut && !['actif', 'inactif', 'rupture'].includes(statut)) {
      return res.status(400).json({ 
        message: "Le statut doit être 'actif', 'inactif' ou 'rupture'" 
      });
    }

    const produit = await Produit.create(req.body);
    res.status(201).json(produit);
  } catch (error) {
    console.error('Erreur création produit:', error);
    
    // Gestion des erreurs spécifiques
    if (error.name === 'SequelizeUniqueConstraintError') {
      // Détecter quel champ est en conflit
      if (error.parent && error.parent.sqlMessage && error.parent.sqlMessage.includes('code_produit')) {
        return res.status(400).json({ 
          message: "Un produit avec ce code existe déjà. Veuillez utiliser un code unique." 
        });
      }
      return res.status(400).json({ 
        message: "Une contrainte d'unicité a été violée" 
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ message: messages });
    }
    
    res.status(500).json({ message: "Erreur lors de la création du produit" });
  }
});

// PUT update produit
router.put('/:id', async (req, res) => {
  try {
    // Validation des données requises
    const { nom, prix_unitaire } = req.body;
    if (!nom || !prix_unitaire) {
      return res.status(400).json({ 
        message: "Le nom et le prix unitaire sont obligatoires" 
      });
    }

    // Validation du type de vin
    const { type_vin } = req.body;
    if (type_vin && !['rouge', 'blanc', 'rose', 'petillant'].includes(type_vin)) {
      return res.status(400).json({ 
        message: "Le type de vin doit être 'rouge', 'blanc', 'rose' ou 'petillant'" 
      });
    }

    // Validation du statut
    const { statut } = req.body;
    if (statut && !['actif', 'inactif', 'rupture'].includes(statut)) {
      return res.status(400).json({ 
        message: "Le statut doit être 'actif', 'inactif' ou 'rupture'" 
      });
    }

    const produit = await Produit.findByPk(req.params.id);
    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    await Produit.update(req.body, { where: { id: req.params.id } });
    const updatedProduit = await Produit.findByPk(req.params.id);
    res.json(updatedProduit);
  } catch (error) {
    console.error('Erreur mise à jour produit:', error);
    
    // Gestion des erreurs spécifiques
    if (error.name === 'SequelizeUniqueConstraintError') {
      // Détecter quel champ est en conflit
      if (error.parent && error.parent.sqlMessage && error.parent.sqlMessage.includes('code_produit')) {
        return res.status(400).json({ 
          message: "Un produit avec ce code existe déjà. Veuillez utiliser un code unique." 
        });
      }
      return res.status(400).json({ 
        message: "Une contrainte d'unicité a été violée" 
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ message: messages });
    }
    
    res.status(500).json({ message: "Erreur lors de la mise à jour du produit" });
  }
});

// DELETE produit
router.delete('/:id', async (req, res) => {
  try {
    await Produit.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du produit" });
  }
});

module.exports = router;