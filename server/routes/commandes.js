const express = require('express');
const router = express.Router();
const { Commande, DetailCommande } = require('../models');

// GET all commandes
router.get('/', async (req, res) => {
  try {
    const commandes = await Commande.findAll({
      include: ['details', 'client']
    });
    res.json(commandes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des commandes" });
  }
});

// GET commande by ID
router.get('/:id', async (req, res) => {
  try {
    const commande = await Commande.findByPk(req.params.id, {
      include: ['details', 'client']
    });
    if (!commande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    res.json(commande);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération de la commande" });
  }
});

// POST create new commande
router.post('/', async (req, res) => {
  try {
    const { details, ...commandeData } = req.body;
    
    // Générer un numéro de commande unique
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const count = await Commande.count();
    const numeroCommande = `CMD-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
    
    const commande = await Commande.create({
      ...commandeData,
      numero_commande: numeroCommande,
      date_commande: new Date()
    });

    // Créer les détails de la commande
    if (details && details.length > 0) {
      const detailsData = details.map(detail => ({
        commande_id: commande.id,
        produit_id: detail.produit_id,
        quantite: detail.quantite,
        prix_unitaire: detail.prix_unitaire,
        prix_total: detail.prix_total
      }));
      
      await DetailCommande.bulkCreate(detailsData);
    }

    // Récupérer la commande avec les détails
    const commandeComplete = await Commande.findByPk(commande.id, {
      include: ['details', 'client']
    });

    res.status(201).json(commandeComplete);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création de la commande" });
  }
});

// PUT update commande
router.put('/:id', async (req, res) => {
  try {
    const { details, ...commandeData } = req.body;
    
    const commande = await Commande.findByPk(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    await commande.update(commandeData);

    // Mettre à jour les détails si fournis
    if (details) {
      // Supprimer les anciens détails
      await DetailCommande.destroy({
        where: { commande_id: commande.id }
      });

      // Créer les nouveaux détails
      if (details.length > 0) {
        const detailsData = details.map(detail => ({
          commande_id: commande.id,
          produit_id: detail.produit_id,
          quantite: detail.quantite,
          prix_unitaire: detail.prix_unitaire,
          prix_total: detail.prix_total
        }));
        
        await DetailCommande.bulkCreate(detailsData);
      }
    }

    // Récupérer la commande mise à jour
    const commandeUpdated = await Commande.findByPk(req.params.id, {
      include: ['details', 'client']
    });

    res.json(commandeUpdated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la commande" });
  }
});

// DELETE commande
router.delete('/:id', async (req, res) => {
  try {
    const commande = await Commande.findByPk(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    // Supprimer les détails associés
    await DetailCommande.destroy({
      where: { commande_id: commande.id }
    });

    await commande.destroy();
    res.json({ message: "Commande supprimée avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression de la commande" });
  }
});

// PUT update status
router.put('/:id/status', async (req, res) => {
  try {
    const { statut } = req.body;
    const commande = await Commande.findByPk(req.params.id);
    
    if (!commande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    await commande.update({ statut });
    res.json(commande);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du statut" });
  }
});

// GET commandes by status
router.get('/status/:status', async (req, res) => {
  try {
    const commandes = await Commande.findAll({
      where: { statut: req.params.status },
      include: ['details', 'client']
    });
    res.json(commandes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des commandes" });
  }
});

// GET stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Commande.count();
    const enAttente = await Commande.count({ where: { statut: 'en_attente' } });
    const confirmees = await Commande.count({ where: { statut: 'confirmee' } });
    const preparees = await Commande.count({ where: { statut: 'preparee' } });
    const livrees = await Commande.count({ where: { statut: 'livree' } });
    const annulees = await Commande.count({ where: { statut: 'annulee' } });

    res.json({
      total,
      enAttente,
      confirmees,
      preparees,
      livrees,
      annulees
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des statistiques" });
  }
});

module.exports = router;