const express = require('express');
const { body, validationResult } = require('express-validator');
const { Facture, FactureDetail, Client, Commande } = require('../models');
const router = express.Router();

// Validation rules
const factureValidation = [
  body('client_id').isInt({ min: 1 }).withMessage('Client ID invalide'),
  body('date_facture').isDate().withMessage('Date de facture invalide'),
  body('montant_ttc').isFloat({ min: 0 }).withMessage('Montant TTC invalide'),
  body('details').isArray({ min: 1 }).withMessage('Détails de facture requis')
];

// GET /api/factures - Obtenir toutes les factures
router.get('/', async (req, res) => {
  try {
    const factures = await Facture.findAll({
      include: [
        { model: Client, as: 'client' },
        { model: Commande, as: 'commande' },
        { model: FactureDetail, as: 'details' }
      ],
      order: [['date_facture', 'DESC']]
    });
    res.json(factures);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des factures' });
  }
});

// GET /api/factures/stats - Statistiques factures
router.get('/stats', async (req, res) => {
  try {
    const total = await Facture.count();
    const facturesParStatut = await Facture.findAll({
      attributes: ['statut', [Facture.sequelize.fn('COUNT', '*'), 'count']],
      group: ['statut']
    });
    
    const chiffreAffaires = await Facture.findAll({
      attributes: [
        [Facture.sequelize.fn('SUM', Facture.sequelize.col('montant_ttc')), 'ca_total'],
        [Facture.sequelize.fn('SUM', 
          Facture.sequelize.literal("CASE WHEN MONTH(date_facture) = MONTH(CURRENT_DATE()) THEN montant_ttc ELSE 0 END")
        ), 'ca_mois'],
        [Facture.sequelize.fn('SUM', 
          Facture.sequelize.literal("CASE WHEN statut = 'payee' THEN montant_ttc ELSE 0 END")
        ), 'ca_paye'],
        [Facture.sequelize.fn('SUM', 
          Facture.sequelize.literal("CASE WHEN statut = 'en_attente' THEN montant_ttc ELSE 0 END")
        ), 'ca_en_attente']
      ]
    });

    res.json({
      total,
      parStatut: facturesParStatut,
      chiffreAffaires: chiffreAffaires[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// GET /api/factures/status/:status - Obtenir les factures par statut
router.get('/status/:status', async (req, res) => {
  try {
    const factures = await Facture.findAll({
      where: { statut: req.params.status },
      include: [
        { model: Client, as: 'client' },
        { model: Commande, as: 'commande' }
      ],
      order: [['date_facture', 'DESC']]
    });
    res.json(factures);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des factures' });
  }
});

// GET /api/factures/:id - Obtenir une facture par ID
router.get('/:id', async (req, res) => {
  try {
    const facture = await Facture.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client' },
        { model: Commande, as: 'commande' },
        { model: FactureDetail, as: 'details' }
      ]
    });
    
    if (!facture) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }
    res.json(facture);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la facture' });
  }
});

// POST /api/factures - Créer une nouvelle facture
router.post('/', factureValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { details, ...factureData } = req.body;
    
    // Générer un numéro de facture unique
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await Facture.count({
      where: Facture.sequelize.literal(`DATE_FORMAT(date_facture, '%Y-%m') = '${year}-${month}'`)
    });
    const numeroFacture = `FACT${year}${month}${String(count + 1).padStart(4, '0')}`;
    
    const facture = await Facture.create({
      ...factureData,
      numero_facture: numeroFacture
    });

    // Créer les détails de la facture
    if (details && details.length > 0) {
      const detailsData = details.map(detail => ({
        facture_id: facture.id,
        produit_id: detail.produit_id,
        quantite: detail.quantite,
        prix_unitaire: detail.prix_unitaire,
        prix_total: detail.prix_total
      }));
      
      await FactureDetail.bulkCreate(detailsData);
    }

    // Récupérer la facture avec les détails
    const factureComplete = await Facture.findByPk(facture.id, {
      include: [
        { model: Client, as: 'client' },
        { model: Commande, as: 'commande' },
        { model: FactureDetail, as: 'details' }
      ]
    });

    res.status(201).json(factureComplete);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la création de la facture' });
  }
});

// PUT /api/factures/:id - Mettre à jour une facture
router.put('/:id', async (req, res) => {
  try {
    const { details, ...factureData } = req.body;
    
    const facture = await Facture.findByPk(req.params.id);
    if (!facture) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    await facture.update(factureData);

    // Mettre à jour les détails si fournis
    if (details) {
      // Supprimer les anciens détails
      await FactureDetail.destroy({
        where: { facture_id: facture.id }
      });

      // Créer les nouveaux détails
      if (details.length > 0) {
        const detailsData = details.map(detail => ({
          facture_id: facture.id,
          produit_id: detail.produit_id,
          quantite: detail.quantite,
          prix_unitaire: detail.prix_unitaire,
          prix_total: detail.prix_total
        }));
        
        await FactureDetail.bulkCreate(detailsData);
      }
    }

    // Récupérer la facture mise à jour
    const factureUpdated = await Facture.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client' },
        { model: Commande, as: 'commande' },
        { model: FactureDetail, as: 'details' }
      ]
    });

    res.json(factureUpdated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la facture' });
  }
});

// DELETE /api/factures/:id - Supprimer une facture
router.delete('/:id', async (req, res) => {
  try {
    const facture = await Facture.findByPk(req.params.id);
    if (!facture) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    // Supprimer les détails associés
    await FactureDetail.destroy({
      where: { facture_id: facture.id }
    });

    await facture.destroy();
    res.json({ message: 'Facture supprimée avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la facture' });
  }
});

// PUT /api/factures/:id/status - Mettre à jour le statut d'une facture
router.put('/:id/status', async (req, res) => {
  try {
    const { statut } = req.body;
    const validStatuts = ['en_attente', 'envoyee', 'payee', 'en_retard', 'annulee'];
    
    if (!validStatuts.includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const facture = await Facture.findByPk(req.params.id);
    if (!facture) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    await facture.update({ statut });
    res.json(facture);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
});

module.exports = router;