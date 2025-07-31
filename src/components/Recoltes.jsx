import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Grape, Calendar, MapPin, Edit } from 'lucide-react';
import { recolteService, parcelleService } from '../services/api';

const Recoltes = () => {
  const [recoltes, setRecoltes] = useState([]);
  const [parcelles, setParcelles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRecolte, setEditingRecolte] = useState(null);
  const [formData, setFormData] = useState({
    parcelle_id: '',
    date_recolte: new Date().toISOString().split('T')[0],
    quantite_kg: 0,
    qualite_raisin: 'bon',
    taux_sucre: 0,
    acidite: 0,
    ph_raisin: 7.0,
    conditions_meteo: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recoltesData, parcellesData] = await Promise.all([
        recolteService.getAll(),
        parcelleService.getAll()
      ]);
      setRecoltes(recoltesData);
      setParcelles(parcellesData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecolte) {
        await recolteService.update(editingRecolte.id, formData);
      } else {
        await recolteService.create(formData);
      }
      loadData();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (recolte) => {
    setEditingRecolte(recolte);
    setFormData({
      parcelle_id: recolte.parcelle_id,
      date_recolte: recolte.date_recolte,
      quantite_kg: recolte.quantite_kg,
      qualite_raisin: recolte.qualite_raisin,
      taux_sucre: recolte.taux_sucre,
      acidite: recolte.acidite,
      ph_raisin: recolte.ph_raisin,
      conditions_meteo: recolte.conditions_meteo,
      notes: recolte.notes
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette récolte ?')) {
      try {
        await recolteService.delete(id);
        loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      parcelle_id: '',
      date_recolte: new Date().toISOString().split('T')[0],
      quantite_kg: 0,
      qualite_raisin: 'bon',
      taux_sucre: 0,
      acidite: 0,
      ph_raisin: 7.0,
      conditions_meteo: '',
      notes: ''
    });
    setEditingRecolte(null);
    setShowForm(false);
  };

  const filteredRecoltes = recoltes.filter(recolte =>
    recolte.parcelle_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recolte.conditions_meteo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getQualityColor = (qualite) => {
    switch (qualite) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'bon': return 'bg-blue-100 text-blue-800';
      case 'moyen': return 'bg-yellow-100 text-yellow-800';
      case 'mediocre': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Récoltes</h2>
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
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Récoltes</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle Récolte</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher une récolte..."
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
                {editingRecolte ? 'Modifier la Récolte' : 'Nouvelle Récolte'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parcelle *
                    </label>
                    <select
                      required
                      value={formData.parcelle_id}
                      onChange={(e) => setFormData({...formData, parcelle_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Sélectionner une parcelle</option>
                      {parcelles.map(parcelle => (
                        <option key={parcelle.id} value={parcelle.id}>
                          {parcelle.nom} - {parcelle.superficie} ha
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de Récolte *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date_recolte}
                      onChange={(e) => setFormData({...formData, date_recolte: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantité (kg) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      value={formData.quantite_kg}
                      onChange={(e) => setFormData({...formData, quantite_kg: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qualité du Raisin
                    </label>
                    <select
                      value={formData.qualite_raisin}
                      onChange={(e) => setFormData({...formData, qualite_raisin: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="excellent">Excellent</option>
                      <option value="bon">Bon</option>
                      <option value="moyen">Moyen</option>
                      <option value="mediocre">Médiocre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taux de Sucre (°Brix)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.taux_sucre}
                      onChange={(e) => setFormData({...formData, taux_sucre: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Acidité (g/L)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.acidite}
                      onChange={(e) => setFormData({...formData, acidite: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      pH du Raisin
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="14"
                      step="0.1"
                      value={formData.ph_raisin}
                      onChange={(e) => setFormData({...formData, ph_raisin: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Conditions Météo
                    </label>
                    <input
                      type="text"
                      value={formData.conditions_meteo}
                      onChange={(e) => setFormData({...formData, conditions_meteo: e.target.value})}
                      placeholder="Ex: Ensoleillé, 25°C"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
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
                    {editingRecolte ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Recoltes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecoltes.map((recolte) => (
          <div key={recolte.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Grape className="w-5 h-5 mr-2 text-purple-600" />
                  {recolte.parcelle_nom}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(recolte.date_recolte)}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(recolte)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(recolte.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="text-center py-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{recolte.quantite_kg} kg</div>
                <div className="text-sm text-gray-600">Quantité récoltée</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Sucre:</span>
                  <span className="font-medium ml-1">{recolte.taux_sucre}°Brix</span>
                </div>
                <div>
                  <span className="text-gray-600">pH:</span>
                  <span className="font-medium ml-1">{recolte.ph_raisin}</span>
                </div>
                <div>
                  <span className="text-gray-600">Acidité:</span>
                  <span className="font-medium ml-1">{recolte.acidite} g/L</span>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(recolte.qualite_raisin)}`}>
                    {recolte.qualite_raisin}
                  </span>
                </div>
              </div>
              
              {recolte.conditions_meteo && (
                <div className="flex items-center text-sm text-gray-600">
                  {/* Assuming Thermometer is available from lucide-react */}
                  {/* <Thermometer className="w-4 h-4 mr-1" /> */}
                  {recolte.conditions_meteo}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredRecoltes.length === 0 && (
        <div className="text-center py-12">
          <Grape className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucune récolte trouvée</p>
        </div>
      )}
    </div>
  );
};

export default Recoltes;