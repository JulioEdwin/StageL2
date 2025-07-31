import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import Produits from './components/Produits';
import Commandes from './components/Commandes';
import BonsLivraison from './components/BonsLivraison';
import Factures from './components/Factures';
import Statistiques from './components/Statistiques';
import Recoltes from './components/Recoltes';
import Parcelles from './components/Parcelles';
import Bassins from './components/Bassins';
import Lots from './components/Lots';
import Paiements from './components/Paiements';
import Login from './components/Login'; // Ajout de l'import Login

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'clients': return <Clients />;
      case 'produits': return <Produits />;
      case 'commandes': return <Commandes />;
      case 'bons-livraison': return <BonsLivraison />;
      case 'factures': return <Factures />;
      case 'statistiques': return <Statistiques />;
      case 'recoltes': return <Recoltes />;
      case 'parcelles': return <Parcelles />;
      case 'bassins': return <Bassins />;
      case 'lots': return <Lots />;
      case 'paiements': return <Paiements />;
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Paramètres du Système</h3>
                <p className="text-gray-500 mb-6">Cette section sera développée prochainement</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Configuration Générale</h4>
                    <p className="text-sm text-gray-500">Paramètres de base du système</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Sécurité</h4>
                    <p className="text-sm text-gray-500">Gestion des accès et permissions</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Notifications</h4>
                    <p className="text-sm text-gray-500">Configuration des alertes</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Sauvegarde</h4>
                    <p className="text-sm text-gray-500">Gestion des sauvegardes</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Intégrations</h4>
                    <p className="text-sm text-gray-500">Connexions externes</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Maintenance</h4>
                    <p className="text-sm text-gray-500">Outils de maintenance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default: return <Dashboard />;
    }
  };

  // Affiche Login si pas connecté
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // Sinon, affiche l'app principale
  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage} onLogout={() => setUser(null)}>
      {renderPage()}
    </Layout>
  );
}

export default App;