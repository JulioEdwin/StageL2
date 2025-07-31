import React, { useState, useEffect } from 'react';
import { Wine, Users, Package, ShoppingCart, TrendingUp, AlertTriangle, DollarSign, BarChart3 } from 'lucide-react';
import { clientService, produitService, commandeService } from '../services/api';

const Dashboard = () => {
  // Correction : initialiser les stats à 0 pour éviter les valeurs nulles
  const [stats, setStats] = useState({
    clients: { total: 0, active: 0, inactive: 0 },
    produits: { total: 0, actifs: 0, inactifs: 0, valeurStock: 0, byType: [] },
    commandes: { total: 0, parStatut: [], chiffreAffaires: { ca_total: 0, ca_mois: 0 } },
    loading: true
  });

  // Déclaration de l'état pour le nombre total de valeurs dans la base de données
  const [dbCounts, setDbCounts] = useState({
    clients: 0,
    produits: 0,
    commandes: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // On récupère toutes les données pour compter le nombre total de clients, produits, commandes
      const [clients, produits, commandes] = await Promise.all([
        clientService.getAll(),
        produitService.getAll(),
        commandeService.getAll(),
      ]);

      // Correction : vérifier que les données sont bien des tableaux
      const clientsArr = Array.isArray(clients) ? clients : [];
      const produitsArr = Array.isArray(produits) ? produits : [];
      const commandesArr = Array.isArray(commandes) ? commandes : [];

      // Calcul des statistiques des clients
      const clientStats = {
        total: clientsArr.length,
        active: clientsArr.filter(c => c.statut === 'actif').length,
        inactive: clientsArr.filter(c => c.statut === 'inactif').length
      };

      // Calcul des statistiques des produits
      const produitStats = {
        total: produitsArr.length,
        actifs: produitsArr.filter(p => p.statut === 'actif').length,
        inactifs: produitsArr.filter(p => p.statut === 'inactif').length,
        valeurStock: produitsArr.reduce((total, p) => total + ((p.prix_unitaire || 0) * (p.stock_actuel || 0)), 0),
        byType: Object.entries(
          produitsArr.reduce((acc, p) => {
            acc[p.type_vin] = (acc[p.type_vin] || 0) + 1;
            return acc;
          }, {})
        ).map(([type, count]) => ({ type_vin: type, count }))
      };

      // Calcul des statistiques des commandes
      const commandeStats = {
        total: commandesArr.length,
        en_attente: commandesArr.filter(c => c.statut === 'en_attente').length,
        confirmee: commandesArr.filter(c => c.statut === 'confirmee').length,
        en_preparation: commandesArr.filter(c => c.statut === 'en_preparation').length,
        expediee: commandesArr.filter(c => c.statut === 'expediee').length,
        livree: commandesArr.filter(c => c.statut === 'livree').length,
        annulee: commandesArr.filter(c => c.statut === 'annulee').length,
        parStatut: [
          { statut: 'en_attente', count: commandesArr.filter(c => c.statut === 'en_attente').length },
          { statut: 'confirmee', count: commandesArr.filter(c => c.statut === 'confirmee').length },
          { statut: 'en_preparation', count: commandesArr.filter(c => c.statut === 'en_preparation').length },
          { statut: 'expediee', count: commandesArr.filter(c => c.statut === 'expediee').length },
          { statut: 'livree', count: commandesArr.filter(c => c.statut === 'livree').length },
          { statut: 'annulee', count: commandesArr.filter(c => c.statut === 'annulee').length }
        ].filter(item => item.count > 0),
        chiffreAffaires: {
          ca_total: commandesArr.reduce((total, c) => total + (c.montant_total || 0), 0),
          ca_mois: commandesArr
            .filter(c => {
              if (!c.date_commande) return false;
              const commandeDate = new Date(c.date_commande);
              const now = new Date();
              return commandeDate.getMonth() === now.getMonth() && 
                     commandeDate.getFullYear() === now.getFullYear();
            })
            .reduce((total, c) => total + (c.montant_total || 0), 0)
        }
      };

      // On met à jour les stats avec les totaux
      setDbCounts({
        clients: clientsArr.length,
        produits: produitsArr.length,
        commandes: commandesArr.length,
      });

      setStats({
        clients: clientStats,
        produits: produitStats,
        commandes: commandeStats,
        loading: false
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (stats.loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-14 h-14 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 text-white p-6 rounded-lg">
        <div className="flex items-center space-x-3">
          <Wine className="w-8 h-8 text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold">Bienvenue dans le système de gestion viticole</h1>
            <p className="text-red-100 mt-1">Lazan'i Bestileo - Fianarantsoa, Madagascar</p>
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Clients Total"
          value={stats.clients.total}
          icon={Users}
          color="bg-blue-600"
          subtitle={`${stats.clients.active} actifs`}
        />
        <StatCard
          title="Produits"
          value={stats.produits.total}
          icon={Package}
          color="bg-green-600"
          subtitle={`${stats.produits.actifs} actifs`}
        />
        <StatCard
          title="Commandes"
          value={stats.commandes.total}
          icon={ShoppingCart}
          color="bg-purple-600"
          subtitle="Total des commandes"
        />
        <StatCard
          title="Valeur Stock"
          value={formatCurrency(stats.produits.valeurStock)}
          icon={DollarSign}
          color="bg-yellow-600"
          subtitle="Valeur totale"
        />
      </div>

      {/* Charts and Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des commandes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-red-600" />
            Répartition des Commandes
          </h3>
          <div className="space-y-3">
            {stats.commandes.parStatut.length > 0 ? (
              stats.commandes.parStatut.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{item.statut.replace('_', ' ')}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-600 transition-all duration-300"
                        style={{ width: `${(item.count / (stats.commandes.total || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400">Aucune commande</div>
            )}
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
            Alertes Stock
          </h3>
          <div className="space-y-3">
            {/* Supprimer toutes les lignes qui utilisent stockAlerts, getStockAlerts, alerts, et l'affichage des alertes de stock */}
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucune alerte de stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Types de Produits */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Wine className="w-5 h-5 mr-2 text-red-600" />
          Répartition par Type de Vin
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.produits.byType.length > 0 ? (
            stats.produits.byType.map((type, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{type.count}</div>
                <div className="text-sm text-gray-600 capitalize">{type.type_vin}</div>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center text-gray-400">Aucun type de vin</div>
          )}
        </div>
      </div>

      {/* Chiffre d'affaires */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Chiffre d'Affaires
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(stats.commandes.chiffreAffaires.ca_total)}
            </div>
            <div className="text-sm text-gray-600">Chiffre d'affaires total</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(stats.commandes.chiffreAffaires.ca_mois)}
            </div>
            <div className="text-sm text-gray-600">Chiffre d'affaires ce mois</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Affichage du nombre total de commandes, clients et produits dans le tableau de bord
export default Dashboard;