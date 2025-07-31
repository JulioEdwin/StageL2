import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, CreditCard, Calendar, DollarSign, Edit } from 'lucide-react';
import { paiementService, factureService } from '../services/api';

const Paiements = () => {
  const [paiements, setPaiements] = useState([]);
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPaiement, setEditingPaiement] = useState(null);
  const [formData, setFormData] = useState({
    facture_id: '',
    date_paiement: new Date().toISOString().split('T')[0],
    montant: 0,
    mode_paiement: 'especes',
    reference_paiement: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [paiementsData, facturesData] = await Promise.all([
        paiementService.getAll(),
        factureService.getAll()
      ]);
      setPaiements(paiementsData);
      setFactures(facturesData.filter(f => f.statut !== 'payee')); // Seulement les factures non payées
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPaiement) {
        await paiementService.update(editingPaiement.id, formData);
      } else {
        await paiementService.create(formData);
      }
      loadData();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (paiement) => {
    setEditingPaiement(paiement);
    setFormData({
      facture_id: paiement.facture_id,
      date_paiement: paiement.date_paiement,
      montant: paiement.montant,
      mode_paiement: paiement.mode_paiement,
      reference_paiement: paiement.reference_paiement || '',
      notes: paiement.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      try {
        await paiementService.delete(id);
        loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      facture_id: '',
      date_paiement: new Date().toISOString().split('T')[0],
      montant: 0,
      mode_paiement: 'especes',
      reference_paiement: '',
      notes: ''
    });
    setEditingPaiement(null);
    setShowForm(false);
  };

  const filteredPaiements = paiements.filter(paiement => {
    const matchesSearch = paiement.facture_numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paiement.client_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paiement.reference_paiement?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode = modeFilter === 'all' || paiement.mode_paiement === modeFilter;
    return matchesSearch && matchesMode;
  });

  const getModeColor = (mode) => {
    switch (mode) {
      case 'especes': return 'bg-green-100 text-green-800';
      case 'cheque': return 'bg-blue-100 text-blue-800';
      case 'virement': return 'bg-purple-100 text-purple-800';
      case 'carte': return 'bg-orange-100 text-orange-800';
      case 'mobile_money': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'especes': return '💵';
      case 'cheque': return '📝';
      case 'virement': return '🏦';
      case 'carte': return '💳';
      case 'mobile_money': return '📱';
      default: return '💰';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getTotalPaiements = () => {
    return filteredPaiements.reduce((sum, paiement) => sum + paiement.montant, 0);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Paiements</h2>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Paiements</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total des paiements: <span className="font-semibold text-green-600">{formatPrice(getTotalPaiements())}</span>
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau Paiement</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un paiement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          <option value="all">Tous les modes</option>
          <option value="especes">Espèces</option>
          <option value="cheque">Chèque</option>
          <option value="virement">Virement</option>
          <option value="carte">Carte</option>
          <option value="mobile_money">Mobile Money</option>
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingPaiement ? 'Modifier le Paiement' : 'Nouveau Paiement'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facture *
                    </label>
                    <select
                      required
                      value={formData.facture_id}
                      onChange={(e) => {
                        const selectedFacture = factures.find(f => f.id === parseInt(e.target.value));
                        setFormData({
                          ...formData, 
                          facture_id: e.target.value,
                          montant: selectedFacture ? selectedFacture.montant_ttc : 0
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Sélectionner une facture</option>
                      {factures.map(facture => (
                        <option key={facture.id} value={facture.id}>
                          {facture.numero_facture} - {facture.client_nom} ({formatPrice(facture.montant_ttc)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de Paiement *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date_paiement}
                      onChange={(e) => setFormData({...formData, date_paiement: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Montant (MGA) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.montant}
                      onChange={(e) => setFormData({...formData, montant: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mode de Paiement *
                    </label>
                    <select
                      required
                      value={formData.mode_paiement}
                      onChange={(e) => setFormData({...formData, mode_paiement: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="especes">Espèces</option>
                      <option value="cheque">Chèque</option>
                      <option value="virement">Virement bancaire</option>
                      <option value="carte">Carte bancaire</option>
                      <option value="mobile_money">Mobile Money</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Référence de Paiement
                    </label>
                    <input
                      type="text"
                      value={formData.reference_paiement}
                      onChange={(e) => setFormData({...formData, reference_paiement: e.target.value})}
                      placeholder="Numéro de chèque, référence virement, etc."
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
                    {editingPaiement ? 'Mettre à jour' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payments List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Id Facture</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Id Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facture</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPaiements.map((paiement) => (
                <tr key={paiement.id || Math.random()} className="hover:bg-gray-50">
                  <td className="px-2 py-4 whitespace-nowrap">{paiement.facture_id || '-'}</td>
                  <td className="px-2 py-4 whitespace-nowrap">{paiement.client_id || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{paiement.facture_numero || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {(paiement.client_nom || '-') + ' ' + (paiement.client_prenom || '')}
                    </div>
                    {paiement.client_entreprise ? (
                      <div className="text-sm text-gray-500">{paiement.client_entreprise}</div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                      <div className="text-sm text-gray-900">{paiement.date_paiement ? formatDate(paiement.date_paiement) : '-'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">{formatPrice(paiement.montant || 0)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getModeColor(paiement.mode_paiement || '')}`}>
                      <span className="mr-1">{getModeIcon(paiement.mode_paiement || '')}</span>
                      {(paiement.mode_paiement || '').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{paiement.reference_paiement || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(paiement)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(paiement.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPaiements.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun paiement trouvé</p>
        </div>
      )}
    </div>
  );
};

export default Paiements;