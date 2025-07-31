const { Client, defineAssociations: defineClientAssociations } = require('./Client');
const { Produit, defineAssociations: defineProduitAssociations } = require('./Produit');
const { Commande, defineAssociations: defineCommandeAssociations } = require('./Commande');
const { DetailCommande, defineAssociations: defineDetailCommandeAssociations } = require('./DetailCommande');
const { Facture, defineAssociations: defineFactureAssociations } = require('./Facture');
const { FactureDetail, defineAssociations: defineFactureDetailAssociations } = require('./FactureDetail');
const { BonLivraison, defineAssociations: defineBonLivraisonAssociations } = require('./BonLivraison');
const { BonLivraisonDetail, defineAssociations: defineBonLivraisonDetailAssociations } = require('./BonLivraisonDetail');
const { Parcelle, defineAssociations: defineParcelleAssociations } = require('./Parcelle');
const { Recolte, defineAssociations: defineRecolteAssociations } = require('./Recolte');
const { Bassin, defineAssociations: defineBassinAssociations } = require('./Bassin');
const { LotProduction, defineAssociations: defineLotProductionAssociations } = require('./LotProduction');
// Correction et analyse : 
// Vérifier que le module './MouvementStock' exporte bien une fonction 'defineAssociations'.
// Si ce n'est pas le cas, il faut corriger l'import pour éviter l'erreur "defineMouvementStockAssociations is not a function".

// Si MouvementStock n'a pas de defineAssociations, importer simplement le modèle :
const { MouvementStock, defineAssociations: defineMouvementStockAssociations } = require('./MouvementStock');
const { Paiement, defineAssociations: definePaiementAssociations } = require('./Paiement');
const { AnalyseQualite, defineAssociations: defineAnalyseQualiteAssociations } = require('./AnalyseQualite');
const User = require('./User');

const defineAllAssociations = () => {
  const models = {
    Client,
    Produit,
    Commande,
    DetailCommande,
    Facture,
    FactureDetail,
    BonLivraison,
    BonLivraisonDetail,
    Parcelle,
    Recolte,
    Bassin,
    LotProduction,
    MouvementStock,
    Paiement,
    User,
    AnalyseQualite // Ajout du modèle AnalyseQualite
  };

  defineClientAssociations(models);
  defineProduitAssociations(models);
  defineCommandeAssociations(models);
  defineDetailCommandeAssociations(models);
  defineFactureAssociations(models);
  defineFactureDetailAssociations(models);
  defineBonLivraisonAssociations(models);
  defineBonLivraisonDetailAssociations(models);
  defineParcelleAssociations(models);
  defineRecolteAssociations(models);
  defineBassinAssociations(models);
  defineLotProductionAssociations(models);
  definePaiementAssociations(models);
  defineAnalyseQualiteAssociations(models); // Ajout de l'association AnalyseQualite
  // defineUserAssociations(models); // User n'a pas de defineAssociations

  return models;
};

module.exports = {
  Client,
  Produit,
  Commande,
  DetailCommande,
  Facture,
  FactureDetail,
  BonLivraison,
  BonLivraisonDetail,
  Parcelle,
  Recolte,
  Bassin,
  LotProduction,
  MouvementStock,
  Paiement,
  User,
  AnalyseQualite, // Ajout export AnalyseQualite
  defineAllAssociations // Ajout de l'export manquant
};