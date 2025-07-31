import React, { useState } from 'react';
import { Wine, Users, Package, ShoppingCart, TrendingUp, Settings, FileText, BarChart3, Grape, MapPin, Container, Package2, CreditCard, Truck, Menu, LogOut, X } from 'lucide-react';
const Layout = ({ children, currentPage, onPageChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Tableau de bord', id: 'dashboard', icon: TrendingUp },
    { name: 'Clients', id: 'clients', icon: Users },
    { name: 'Produits', id: 'produits', icon: Package },
    { name: 'Commandes', id: 'commandes', icon: ShoppingCart },
    { name: 'Bons de Livraison', id: 'bons-livraison', icon: Truck },
    { name: 'Factures', id: 'factures', icon: FileText },
    { name: 'Paiements', id: 'paiements', icon: CreditCard },
    { name: 'Parcelles', id: 'parcelles', icon: MapPin },
    { name: 'Récoltes', id: 'recoltes', icon: Grape },
    { name: 'Bassins', id: 'bassins', icon: Container },
    { name: 'Lots', id: 'lots', icon: Package2 },
    { name: 'Statistiques', id: 'statistiques', icon: BarChart3 },
    { name: 'Paramètres', id: 'settings', icon: Settings },
    { name: 'Se Déconnecter', id: 'deconnexion', icon: LogOut }, // Correction de l'icône
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        {/* Top bar with logo and user info */}
        <br/><br/>
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img src="image/logoLogin.png" alt="logo" className="logo" />
              <span className="text-xl font-bold text-red-900">Lazan'i Bestileo</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Administrateur</p>
              <p className="text-xs text-gray-500">En ligne</p>
            </div>
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">A</span>
            </div>
          </div>
        </div>
        <br/><br/>

        {/* Navigation bar */}
        <div className="border-t border-gray-100">
          <div className="px-4">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center justify-center space-x-1 py-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`flex flex-col items-center px-4 py-3 rounded-lg transition-all duration-200 min-w-[80px] ${
                      currentPage === item.id
                        ? 'bg-red-800 text-yellow-400 shadow-lg transform scale-105'
                        : 'text-gray-600 hover:bg-red-50 hover:text-red-900 hover:shadow-md'
                    }`}
                    title={item.name}
                  >
                    <Icon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium text-center leading-tight">{item.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile Navigation */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-full flex items-center justify-between py-3 px-4 text-gray-600 hover:text-gray-900"
              >
                <span className="font-medium">Navigation</span>
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              {mobileMenuOpen && (
                <div className="border-t border-gray-100 py-2">
                  <div className="grid grid-cols-3 gap-2">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onPageChange(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                            currentPage === item.id
                              ? 'bg-red-800 text-yellow-400'
                              : 'text-gray-600 hover:bg-red-50 hover:text-red-900'
                          }`}
                        >
                          <Icon className="w-5 h-5 mb-1" />
                          <span className="text-xs font-medium text-center">{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page title */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <h1 className="text-lg font-semibold text-gray-900">
            {navigation.find(item => item.id === currentPage)?.name || 'Dashboard'}
          </h1>
          <p className="text-sm text-gray-500">Gestion Viticole - Lazan'i Bestileo</p>
        </div>
      </header>
      {/* Additional Header Content */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <p className="text-gray-700 text-sm">Bienvenue sur Lazan'i Bestileo !</p>
      </div>
      {/* Main content */}
      <main aria-label="Main Content" className="flex-1 p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full p-4 border-t border-red-700 bg-gradient-to-b from-red-900 to-red-800">
        <p className="text-red-200 text-sm text-center">
          © 2024 Lazan'i Bestileo<br />
          Fianarantsoa, Madagascar
        </p>
      </footer>
    </div>
  );
};

export default Layout;