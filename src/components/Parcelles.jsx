import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, MapPin, Calendar } from 'lucide-react';
import { parcelleService } from '../services/api';

const Parcelles = () => {
  const [parcelles, setParcelles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingParcelle, setEditingParcelle] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    superficie: 0,
    localisation: '',
    type_sol: '',
    exposition: 'Sud',
    altitude: 0,
    pente: 0,
    date_plantation: '',
    cepage: '',
    densite_plantation: 0,
    statut: 'active'
  });

  useEffect(() => {
    loadParcelles();
  }, []);

  const loadParcelles = async () => {
    try {
      const data = await parcelleService.getAll();
      setParcelles(data);
    } catch (error) {
      console.error('Erreur lors du chargement des parcelles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingParcelle) {
        await parcelleService.update(editingParcelle.id, formData);
      } else {
        await parcelleService.create(formData);
      }
      loadParcelles();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (parcelle) => {
    setEditingParcelle(parcelle);
    setFormData({
      nom: parcelle.nom,
      superficie: parcelle.superficie,
      localisation: parcelle.localisation,
      type_sol: parcelle.type_sol,
      exposition: parcelle.exposition,
      altitude: parcelle.altitude,
      pente: parcelle.pente,
      date_plantation: parcelle.date_plantation,
      cepage: parcelle.cepage,
      densite_plantation: parcelle.densite_plantation,
      statut: parcelle.statut
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette parcelle ?')) {
      try {
        await parcelleService.delete(id);
        loadParcelles();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      superficie: 0,
      localisation: '',
      type_sol: '',
      exposition: 'Sud',
      altitude: 0,
      pente: 0,
      date_plantation: '',
      cepage: '',
      densite_plantation: 0,
      statut: 'active'
    });
    setEditingParcelle(null);
    setShowForm(false);
  };

  const filteredParcelles = parcelles.filter(parcelle =>
    parcelle.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parcelle.cepage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parcelle.localisation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'repos': return 'bg-yellow-100 text-yellow-800';
      case 'renovation': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('fr-FR') : 'Non définie';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Parcelles</h2>
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
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Parcelles</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle Parcelle</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher une parcelle..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingParcelle ? 'Modifier la Parcelle' : 'Nouvelle Parcelle'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de la Parcelle *
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
                      Superficie (ha) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.superficie}
                      onChange={(e) => setFormData({...formData, superficie: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cépage
                    </label>
                    <input
                      type="text"
                      value={formData.cepage}
                      onChange={(e) => setFormData({...formData, cepage: e.target.value})}
                      placeholder="Ex: Cabernet Sauvignon"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de Sol
                    </label>
                    <input
                      type="text"
                      value={formData.type_sol}
                      onChange={(e) => setFormData({...formData, type_sol: e.target.value})}
                      placeholder="Ex: Argilo-calcaire"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exposition
                    </label>
                    <select
                      value={formData.exposition}
                      onChange={(e) => setFormData({...formData, exposition: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="Nord">Nord</option>
                      <option value="Sud">Sud</option>
                      <option value="Est">Est</option>
                      <option value="Ouest">Ouest</option>
                      <option value="Nord-Est">Nord-Est</option>
                      <option value="Nord-Ouest">Nord-Ouest</option>
                      <option value="Sud-Est">Sud-Est</option>
                      <option value="Sud-Ouest">Sud-Ouest</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Altitude (m)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.altitude}
                      onChange={(e) => setFormData({...formData, altitude: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pente (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.pente}
                      onChange={(e) => setFormData({...formData, pente: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de Plantation
                    </label>
                    <input
                      type="date"
                      value={formData.date_plantation}
                      onChange={(e) => setFormData({...formData, date_plantation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Densité de Plantation (pieds/ha)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.densite_plantation}
                      onChange={(e) => setFormData({...formData, densite_plantation: parseInt(e.target.value)})}
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
                      <option value="active">Active</option>
                      <option value="repos">En repos</option>
                      <option value="renovation">En rénovation</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localisation
                  </label>
                  <textarea
                    value={formData.localisation}
                    onChange={(e) => setFormData({...formData, localisation: e.target.value})}
                    rows={2}
                    placeholder="Description de l'emplacement de la parcelle"
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
                    {editingParcelle ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Parcelles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParcelles.map((parcelle) => (
          <div key={parcelle.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-green-600" />
                  {parcelle.nom}
                </h3>
                <p className="text-sm text-gray-600">{parcelle.superficie} hectares</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(parcelle)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(parcelle.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {parcelle.cepage && (
                <div className="text-center py-2 bg-purple-50 rounded-lg">
                  <div className="text-lg font-semibold text-purple-800">{parcelle.cepage}</div>
                  <div className="text-sm text-purple-600">Cépage principal</div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                {parcelle.exposition && (
                  <div className="flex items-center">
                    <span className="text-gray-600">Exposition:</span>
                    <span className="font-medium ml-1">{parcelle.exposition}</span>
                  </div>
                )}
                {parcelle.altitude > 0 && (
                  <div className="flex items-center">
                    <span className="text-gray-600">Alt:</span>
                    <span className="font-medium ml-1">{parcelle.altitude}m</span>
                  </div>
                )}
                {parcelle.pente > 0 && (
                  <div>
                    <span className="text-gray-600">Pente:</span>
                    <span className="font-medium ml-1">{parcelle.pente}%</span>
                  </div>
                )}
                {parcelle.densite_plantation > 0 && (
                  <div>
                    <span className="text-gray-600">Densité:</span>
                    <span className="font-medium ml-1">{parcelle.densite_plantation}/ha</span>
                  </div>
                )}
              </div>
              
              {parcelle.type_sol && (
                <div className="text-sm">
                  <span className="text-gray-600">Sol:</span>
                  <span className="font-medium ml-1">{parcelle.type_sol}</span>
                </div>
              )}
              
              {parcelle.date_plantation && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  Plantée le {formatDate(parcelle.date_plantation)}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(parcelle.statut)}`}>
                {parcelle.statut}
              </span>
              {parcelle.localisation && (
                <span className="text-xs text-gray-500 truncate max-w-32" title={parcelle.localisation}>
                  {parcelle.localisation}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredParcelles.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucune parcelle trouvée</p>
        </div>
      )}
    </div>
  );
};

export default Parcelles;