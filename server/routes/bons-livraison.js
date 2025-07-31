const express = require('express');
const router = express.Router();
const { BonLivraison, BonLivraisonDetail, Commande, Client, Produit } = require('../models');

// GET all bons de livraison
router.get('/', async (req, res) => {
  try {
    const bonsLivraison = await BonLivraison.findAll({
      include: [
        { model: Commande, as: 'commande' },
        { model: BonLivraisonDetail, as: 'details' }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(bonsLivraison);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des bons de livraison" });
  }
});

// GET bon de livraison by ID
router.get('/:id', async (req, res) => {
  try {
    const bonLivraison = await BonLivraison.findByPk(req.params.id, {
      include: [
        { model: Commande, as: 'commande' },
        { model: BonLivraisonDetail, as: 'details' }
      ]
    });
    if (!bonLivraison) {
      return res.status(404).json({ message: "Bon de livraison non trouvé" });
    }
    res.json(bonLivraison);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération du bon de livraison" });
  }
});

// POST create new bon de livraison
router.post('/', async (req, res) => {
  try {
    const { details, ...bonLivraisonData } = req.body;
    
    // Générer un numéro de bon unique
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const count = await BonLivraison.count();
    const numeroBon = `BL-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
    
    const bonLivraison = await BonLivraison.create({
      ...bonLivraisonData,
      numero_bon: numeroBon,
      date_livraison: new Date()
    });

    // Créer les détails du bon de livraison
    if (details && details.length > 0) {
      const detailsData = details.map(detail => ({
        bon_livraison_id: bonLivraison.id,
        produit_id: detail.produit_id,
        quantite_commandee: detail.quantite_commandee,
        quantite_livree: detail.quantite_livree || 0
      }));
      
      await BonLivraisonDetail.bulkCreate(detailsData);
    }

    // Récupérer le bon de livraison avec les détails
    const bonLivraisonComplete = await BonLivraison.findByPk(bonLivraison.id, {
      include: [
        { model: Commande, as: 'commande' },
        { model: BonLivraisonDetail, as: 'details' }
      ]
    });

    res.status(201).json(bonLivraisonComplete);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création du bon de livraison" });
  }
});

// PUT update bon de livraison
router.put('/:id', async (req, res) => {
  try {
    const { details, ...bonLivraisonData } = req.body;
    
    const bonLivraison = await BonLivraison.findByPk(req.params.id);
    if (!bonLivraison) {
      return res.status(404).json({ message: "Bon de livraison non trouvé" });
    }

    await bonLivraison.update(bonLivraisonData);

    // Mettre à jour les détails si fournis
    if (details) {
      // Supprimer les anciens détails
      await BonLivraisonDetail.destroy({
        where: { bon_livraison_id: bonLivraison.id }
      });

      // Créer les nouveaux détails
      if (details.length > 0) {
        const detailsData = details.map(detail => ({
          bon_livraison_id: bonLivraison.id,
          produit_id: detail.produit_id,
          quantite_commandee: detail.quantite_commandee,
          quantite_livree: detail.quantite_livree || 0
        }));
        
        await BonLivraisonDetail.bulkCreate(detailsData);
      }
    }

    // Récupérer le bon de livraison mis à jour
    const bonLivraisonUpdated = await BonLivraison.findByPk(req.params.id, {
      include: [
        { model: Commande, as: 'commande' },
        { model: BonLivraisonDetail, as: 'details' }
      ]
    });

    res.json(bonLivraisonUpdated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du bon de livraison" });
  }
});

// DELETE bon de livraison
router.delete('/:id', async (req, res) => {
  try {
    const bonLivraison = await BonLivraison.findByPk(req.params.id);
    if (!bonLivraison) {
      return res.status(404).json({ message: "Bon de livraison non trouvé" });
    }

    // Supprimer les détails associés
    await BonLivraisonDetail.destroy({
      where: { bon_livraison_id: bonLivraison.id }
    });

    await bonLivraison.destroy();
    res.json({ message: "Bon de livraison supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression du bon de livraison" });
  }
});

// PUT update status
router.put('/:id/status', async (req, res) => {
  try {
    const { statut } = req.body;
    const bonLivraison = await BonLivraison.findByPk(req.params.id);
    
    if (!bonLivraison) {
      return res.status(404).json({ message: "Bon de livraison non trouvé" });
    }

    await bonLivraison.update({ statut });
    res.json(bonLivraison);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du statut" });
  }
});

// GET bons de livraison by status
router.get('/status/:status', async (req, res) => {
  try {
    const bonsLivraison = await BonLivraison.findAll({
      where: { statut: req.params.status },
      include: [
        { model: Commande, as: 'commande' },
        { model: BonLivraisonDetail, as: 'details' }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(bonsLivraison);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des bons de livraison" });
  }
});

// GET bons de livraison by commande
router.get('/commande/:commandeId', async (req, res) => {
  try {
    const bonsLivraison = await BonLivraison.findAll({
      where: { commande_id: req.params.commandeId },
      include: [
        { model: Commande, as: 'commande' },
        { model: BonLivraisonDetail, as: 'details' }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(bonsLivraison);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des bons de livraison" });
  }
});

// GET stats
router.get('/stats', async (req, res) => {
  try {
    const total = await BonLivraison.count();
    const enPreparation = await BonLivraison.count({ where: { statut: 'en_preparation' } });
    const expedie = await BonLivraison.count({ where: { statut: 'expedie' } });
    const enTransit = await BonLivraison.count({ where: { statut: 'en_transit' } });
    const livre = await BonLivraison.count({ where: { statut: 'livre' } });
    const retour = await BonLivraison.count({ where: { statut: 'retour' } });

    res.json({
      total,
      enPreparation,
      expedie,
      enTransit,
      livre,
      retour
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des statistiques" });
  }
});

module.exports = router; 