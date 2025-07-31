import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package2, Calendar, BarChart3 } from 'lucide-react';
import { lotService, recolteService, bassinService } from '../services/api';

const Lots = () => {
  const [lots, setLots] = useState([]);
  const [recoltes, setRecoltes] = useState([]);
  const [bassins, setBassins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingLot, setEditingLot] = useState(null);
  const [formData, setFormData] = useState({
    numero_lot: '',
    recolte_id: '',
    bassin_id: '',
    date_debut_production: new Date().toISOString().split('T')[0],
    date_fin_production: '',
    type_vin: 'rouge',
    volume_initial_litres: 0,
    volume_final_litres: 0,
    degre_alcool: 0,
    statut: 'en_fermentation',
    notes_production: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [lotsData, recoltesData, bassinsData] = await Promise.all([
        lotService.getAll(),
        recolteService.getAll(),
        bassinService.getAll()
      ]);
      setLots(lotsData);
      setRecoltes(recoltesData);
      setBassins(bassinsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLot) {
        await lotService.update(editingLot.id, formData);
      } else {
        await lotService.create(formData);
      }
      loadData();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (lot) => {
    setEditingLot(lot);
    setFormData({
      numero_lot: lot.numero_lot,
      recolte_id: lot.recolte_id,
      bassin_id: lot.bassin_id,
      date_debut_production: lot.date_debut_production,
      date_fin_production: lot.date_fin_production || '',
      type_vin: lot.type_vin,
      volume_initial_litres: lot.volume_initial_litres,
      volume_final_litres: lot.volume_final_litres || 0,
      degre_alcool: lot.degre_alcool || 0,
      statut: lot.statut,
      notes_production: lot.notes_production || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lot ?')) {
      try {
        await lotService.delete(id);
        loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      numero_lot: '',
      recolte_id: '',
      bassin_id: '',
      date_debut_production: new Date().toISOString().split('T')[0],
      date_fin_production: '',
      type_vin: 'rouge',
      volume_initial_litres: 0,
      volume_final_litres: 0,
      degre_alcool: 0,
      statut: 'en_fermentation',
      notes_production: ''
    });
    setEditingLot(null);
    setShowForm(false);
  };

  const filteredLots = lots.filter(lot => {
    const matchesSearch = lot.numero_lot.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lot.bassin_nom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lot.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'en_fermentation': return 'bg-yellow-100 text-yellow-800';
      case 'en_vieillissement': return 'bg-blue-100 text-blue-800';
      case 'pret': return 'bg-green-100 text-green-800';
      case 'embouteille': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'rouge': return 'bg-red-100 text-red-800';
      case 'blanc': return 'bg-yellow-100 text-yellow-800';
      case 'rose': return 'bg-pink-100 text-pink-800';
      case 'petillant': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('fr-FR') : 'Non définie';
  };

  const formatVolume = (litres) => {
    if (litres >= 1000) {
      return `${(litres / 1000).toFixed(1)} kL`;
    }
    return `${litres} L`;
  };

  const calculateYield = (initial, final) => {
    if (!initial || !final) return 0;
    return ((final / initial) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Lots de Production</h2>
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
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Lots de Production</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau Lot</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un lot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="en_fermentation">En fermentation</option>
          <option value="en_vieillissement">En vieillissement</option>
          <option value="pret">Prêt</option>
          <option value="embouteille">Embouteillé</option>
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingLot ? 'Modifier le Lot' : 'Nouveau Lot de Production'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de Lot *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.numero_lot}
                      onChange={(e) => setFormData({...formData, numero_lot: e.target.value})}
                      placeholder="Ex: LOT2024001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Récolte *
                    </label>
                    <select
                      required
                      value={formData.recolte_id}
                      onChange={(e) => setFormData({...formData, recolte_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Sélectionner une récolte</option>
                      {recoltes.map(recolte => (
                        <option key={recolte.id} value={recolte.id}>
                          {recolte.parcelle_nom} - {formatDate(recolte.date_recolte)} ({recolte.quantite_kg} kg)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bassin *
                    </label>
                    <select
                      required
                      value={formData.bassin_id}
                      onChange={(e) => setFormData({...formData, bassin_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Sélectionner un bassin</option>
                      {bassins.filter(b => b.statut === 'disponible').map(bassin => (
                        <option key={bassin.id} value={bassin.id}>
                          {bassin.nom} - {formatVolume(bassin.capacite_litres)} ({bassin.type_bassin})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de Vin *
                    </label>
                    <select
                      value={formData.type_vin}
                      onChange={(e) => setFormData({...formData, type_vin: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="rouge">Rouge</option>
                      <option value="blanc">Blanc</option>
                      <option value="rose">Rosé</option>
                      <option value="petillant">Pétillant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Début Production *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date_debut_production}
                      onChange={(e) => setFormData({...formData, date_debut_production: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Fin Production
                    </label>
                    <input
                      type="date"
                      value={formData.date_fin_production}
                      onChange={(e) => setFormData({...formData, date_fin_production: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Volume Initial (litres) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.volume_initial_litres}
                      onChange={(e) => setFormData({...formData, volume_initial_litres: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Volume Final (litres)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.volume_final_litres}
                      onChange={(e) => setFormData({...formData, volume_final_litres: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Degré d'Alcool (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={formData.degre_alcool}
                      onChange={(e) => setFormData({...formData, degre_alcool: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
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
                      <option value="en_fermentation">En fermentation</option>
                      <option value="en_vieillissement">En vieillissement</option>
                      <option value="pret">Prêt</option>
                      <option value="embouteille">Embouteillé</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes de Production
                  </label>
                  <textarea
                    value={formData.notes_production}
                    onChange={(e) => setFormData({...formData, notes_production: e.target.value})}
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
                    {editingLot ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Lots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLots.map((lot) => (
          <div key={lot.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Package2 className="w-5 h-5 mr-2 text-purple-600" />
                  {lot.numero_lot}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(lot.date_debut_production)}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(lot)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(lot.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(lot.type_vin)}`}>
                  {lot.type_vin}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lot.statut)}`}>
                  {lot.statut.replace('_', ' ')}
                </span>
              </div>
              
              <div className="text-center py-3 bg-purple-50 rounded-lg">
                <div className="text-xl font-bold text-purple-800">{formatVolume(lot.volume_initial_litres)}</div>
                <div className="text-sm text-purple-600">Volume initial</div>
                {lot.volume_final_litres > 0 && (
                  <div className="text-xs text-gray-600 mt-1">
                    Final: {formatVolume(lot.volume_final_litres)} ({calculateYield(lot.volume_initial_litres, lot.volume_final_litres)}%)
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Bassin:</span>
                  <span className="font-medium ml-1">{lot.bassin_nom}</span>
                </div>
                {lot.degre_alcool > 0 && (
                  <div className="flex items-center">
                    <BarChart3 className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="font-medium">{lot.degre_alcool}% vol</span>
                  </div>
                )}
              </div>
              
              {lot.date_fin_production && (
                <div className="text-sm text-gray-600">
                  <span>Fin prévue: {formatDate(lot.date_fin_production)}</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Récolte: {lot.recolte_parcelle}
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLots.length === 0 && (
        <div className="text-center py-12">
          <Package2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun lot trouvé</p>
        </div>
      )}
    </div>
  );
};

export default Lots;