const express = require('express');
const router = express.Router();
const { Paiement, Facture, Client } = require('../models');

router.get('/', async (req, res) => {
  try {
    const paiements = await Paiement.findAll({
      include: [
        {
          model: Facture,
          as: 'facture',
          include: [
            {
              model: Client,
              as: 'client'
            }
          ]
        }
      ]
    });

    // Transformer les données pour inclure les informations de facture et client
    const paiementsEnrichis = paiements.map(paiement => {
      const paiementData = paiement.toJSON();
      return {
        ...paiementData,
        facture_id: paiementData.facture?.id || null,
        facture_numero: paiementData.facture?.numero_facture || null,
        client_id: paiementData.facture?.client?.id || null,
        client_nom: paiementData.facture?.client?.nom || null,
        client_prenom: paiementData.facture?.client?.prenom || null,
        client_entreprise: paiementData.facture?.client?.entreprise || null
      };
    });

    res.json(paiementsEnrichis);
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des paiements" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const paiement = await Paiement.findByPk(req.params.id);
    if (!paiement) return res.status(404).json({ message: "Paiement non trouvé" });
    res.json(paiement);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du paiement" });
  }
});

router.post('/', async (req, res) => {
  try {
    const paiement = await Paiement.create(req.body);
    res.status(201).json(paiement);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du paiement" });
  }
});

router.put('/:id', async (req, res) => {
  try {
    await Paiement.update(req.body, { where: { id: req.params.id } });
    const paiement = await Paiement.findByPk(req.params.id);
    res.json(paiement);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du paiement" });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Paiement.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du paiement" });
  }
});

module.exports = router;