import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Container, Thermometer, Droplets, Settings } from 'lucide-react';
import { bassinService } from '../services/api';

const Bassins = () => {
  const [bassins, setBassins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBassin, setEditingBassin] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    capacite_litres: 0,
    materiau: 'inox',
    type_bassin: 'fermentation',
    statut: 'disponible',
    temperature_optimale: 18.0,
    last_cleaning: ''
  });

  useEffect(() => {
    loadBassins();
  }, []);

  const loadBassins = async () => {
    try {
      const data = await bassinService.getAll();
      setBassins(data);
    } catch (error) {
      console.error('Erreur lors du chargement des bassins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBassin) {
        await bassinService.update(editingBassin.id, formData);
      } else {
        await bassinService.create(formData);
      }
      loadBassins();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (bassin) => {
    setEditingBassin(bassin);
    setFormData({
      nom: bassin.nom,
      capacite_litres: bassin.capacite_litres,
      materiau: bassin.materiau,
      type_bassin: bassin.type_bassin,
      statut: bassin.statut,
      temperature_optimale: bassin.temperature_optimale,
      last_cleaning: bassin.last_cleaning
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bassin ?')) {
      try {
        await bassinService.delete(id);
        loadBassins();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      capacite_litres: 0,
      materiau: 'inox',
      type_bassin: 'fermentation',
      statut: 'disponible',
      temperature_optimale: 18.0,
      last_cleaning: ''
    });
    setEditingBassin(null);
    setShowForm(false);
  };

  const filteredBassins = bassins.filter(bassin =>
    bassin.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bassin.materiau.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bassin.type_bassin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'disponible': return 'bg-green-100 text-green-800';
      case 'occupe': return 'bg-red-100 text-red-800';
      case 'nettoyage': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMateriauColor = (materiau) => {
    switch (materiau) {
      case 'inox': return 'bg-gray-100 text-gray-800';
      case 'beton': return 'bg-stone-100 text-stone-800';
      case 'bois': return 'bg-amber-100 text-amber-800';
      case 'plastique': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'fermentation': return 'bg-purple-100 text-purple-800';
      case 'stockage': return 'bg-blue-100 text-blue-800';
      case 'vieillissement': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('fr-FR') : 'Non défini';
  };

  const formatCapacity = (litres) => {
    if (litres >= 1000) {
      return `${(litres / 1000).toFixed(1)} kL`;
    }
    return `${litres} L`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Bassins</h2>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Bassins</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau Bassin</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher un bassin..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingBassin ? 'Modifier le Bassin' : 'Nouveau Bassin'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du Bassin *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({...formData, nom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacité (litres) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.capacite_litres}
                      onChange={(e) => setFormData({...formData, capacite_litres: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Matériau
                    </label>
                    <select
                      value={formData.materiau}
                      onChange={(e) => setFormData({...formData, materiau: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="inox">Inox</option>
                      <option value="beton">Béton</option>
                      <option value="bois">Bois</option>
                      <option value="plastique">Plastique</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de Bassin
                    </label>
                    <select
                      value={formData.type_bassin}
                      onChange={(e) => setFormData({...formData, type_bassin: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="fermentation">Fermentation</option>
                      <option value="stockage">Stockage</option>
                      <option value="vieillissement">Vieillissement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut
                    </label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData({...formData, statut: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="occupe">Occupé</option>
                      <option value="nettoyage">En nettoyage</option>
                      <option value="maintenance">En maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Température Optimale (°C)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={formData.temperature_optimale}
                      onChange={(e) => setFormData({...formData, temperature_optimale: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dernier Nettoyage
                    </label>
                    <input
                      type="date"
                      value={formData.last_cleaning}
                      onChange={(e) => setFormData({...formData, last_cleaning: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    {editingBassin ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bassins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBassins.map((bassin) => (
          <div key={bassin.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Container className="w-5 h-5 mr-2 text-blue-600" />
                  {bassin.nom}
                </h3>
                <p className="text-sm text-gray-600">{formatCapacity(bassin.capacite_litres)}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(bassin)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(bassin.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="text-center py-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-800">{formatCapacity(bassin.capacite_litres)}</div>
                <div className="text-sm text-blue-600">Capacité totale</div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(bassin.type_bassin)}`}>
                  {bassin.type_bassin}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMateriauColor(bassin.materiau)}`}>
                  {bassin.materiau}
                </span>
              </div>
              
              {bassin.temperature_optimale && (
                <div className="flex items-center text-sm text-gray-600">
                  <Thermometer className="w-4 h-4 mr-2 text-orange-500" />
                  <span>Température optimale: {bassin.temperature_optimale}°C</span>
                </div>
              )}
              
              {bassin.last_cleaning && (
                <div className="flex items-center text-sm text-gray-600">
                  <Droplets className="w-4 h-4 mr-2 text-blue-500" />
                  <span>Dernier nettoyage: {formatDate(bassin.last_cleaning)}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bassin.statut)}`}>
                {bassin.statut}
              </span>
              <button className="text-gray-400 hover:text-gray-600">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBassins.length === 0 && (
        <div className="text-center py-12">
          <Container className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun bassin trouvé</p>
        </div>
      )}
    </div>
  );
};

export default Bassins;