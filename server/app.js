const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { defineAllAssociations } = require('./models');

// Charger et définir les associations des modèles
defineAllAssociations();

// Import des routes
const usersRoutes = require('./routes/users');
const clientRoutes = require('./routes/clients');
const produitRoutes = require('./routes/produits');
const commandeRoutes = require('./routes/commandes');
const factureRoutes = require('./routes/factures');
const bonLivraisonRoutes = require('./routes/bons-livraison');
const recolteRoutes = require('./routes/recoltes');
const parcelleRoutes = require('./routes/parcelles');
const bassinRoutes = require('./routes/bassins');
const lotRoutes = require('./routes/lots');
const paiementRoutes = require('./routes/paiements');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use('/api/users', usersRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/factures', factureRoutes);
app.use('/api/bons-livraison', bonLivraisonRoutes);
app.use('/api/recoltes', recolteRoutes);
app.use('/api/parcelles', parcelleRoutes);
app.use('/api/bassins', bassinRoutes);
app.use('/api/lots', lotRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/auth', authRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    message: "API Lazan'i Bestileo Wine Management", 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs 404 (doit être après toutes les routes)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion des erreurs globales (doit avoir 4 arguments)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    // Test de la connexion à la base de données
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Impossible de se connecter à la base de données');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`🍷 Serveur Lazan'i Bestileo Wine Management démarré sur le port ${PORT}`);
      console.log(`📡 API disponible sur: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;