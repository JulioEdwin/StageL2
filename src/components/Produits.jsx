import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Wine, Edit } from 'lucide-react';
import { produitService } from '../services/api';

const Produits = () => {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    type_vin: 'blanc',
    millesime: new Date().getFullYear(),
    degre_alcool: '',
    volume_bouteille: '750',
    prix_unitaire: '',
    stock_actuel: '0',
    stock_minimum: '10',
    code_produit: '',
    statut: 'actif',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await produitService.getAll();
      setProduits(data);
    } catch (error) {
      setMessage('Erreur lors du chargement des produits');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Préparer les données avec les bonnes conversions de types
      const produitData = {
        ...formData,
        millesime: formData.millesime ? parseInt(formData.millesime) : null,
        degre_alcool: formData.degre_alcool ? parseFloat(formData.degre_alcool) : null,
        volume_bouteille: formData.volume_bouteille ? parseFloat(formData.volume_bouteille) : null,
        prix_unitaire: formData.prix_unitaire ? parseFloat(formData.prix_unitaire) : null,
        stock_actuel: formData.stock_actuel ? parseInt(formData.stock_actuel) : 0,
        stock_minimum: formData.stock_minimum ? parseInt(formData.stock_minimum) : 10,
      };

      if (editingId) {
        await produitService.update(editingId, produitData);
        setMessage('Produit modifié avec succès');
      } else {
        await produitService.create(produitData);
        setMessage('Produit ajouté avec succès');
      }
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erreur détaillée:', error);
      if (error.message) {
        setMessage(`Erreur lors de l'enregistrement: ${error.message}`);
      } else {
        setMessage("Erreur lors de l'enregistrement");
      }
    }
  };

  const handleDelete = async (id) => {
    const produitExiste = produits.some(p => p.id === id);
    if (!produitExiste) {
      setMessage('Produit introuvable ou déjà supprimé');
      return;
    }
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await produitService.delete(id);
        setMessage('Produit supprimé avec succès');
        loadData();
      } catch (error) {
        setMessage('Erreur lors de la suppression');
        console.error(error);
      }
    }
  };

  const handleEdit = (produit) => {
    setFormData({
      nom: produit.nom || '',
      description: produit.description || '',
      type_vin: produit.type_vin || '',
      millesime: produit.millesime || '',
      degre_alcool: produit.degre_alcool || '',
      volume_bouteille: produit.volume_bouteille || '',
      prix_unitaire: produit.prix_unitaire || '',
      stock_actuel: produit.stock_actuel || '',
      stock_minimum: produit.stock_minimum || '',
      code_produit: produit.code_produit || '',
      statut: produit.statut || 'actif',
    });
    setEditingId(produit.id);
    setShowForm(true);
    setMessage('');
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      type_vin: 'blanc',
      millesime: new Date().getFullYear(),
      degre_alcool: '',
      volume_bouteille: '750',
      prix_unitaire: '',
      stock_actuel: '0',
      stock_minimum: '10',
      code_produit: '',
      statut: 'actif',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredProduits = produits.filter((produit) => {
    const matchesSearch =
      produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produit.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produit.code_produit?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || produit.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'actif':
        return 'bg-green-100 text-green-800';
      case 'inactif':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Produits</h2>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
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
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Produits</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau Produit</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
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
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
        </select>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes('succès') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingId ? 'Modifier le Produit' : 'Nouveau Produit'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de vin</label>
                    <select
                      name="type_vin"
                      value={formData.type_vin}
                      onChange={(e) => setFormData({ ...formData, type_vin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="blanc">Blanc</option>
                      <option value="rouge">Rouge</option>
                      <option value="rose">Rosé</option>
                      <option value="petillant">Pétillant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Millésime</label>
                    <input
                      type="number"
                      name="millesime"
                      value={formData.millesime}
                      onChange={(e) => setFormData({ ...formData, millesime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Degré d'alcool</label>
                    <input
                      type="number"
                      step="0.1"
                      name="degre_alcool"
                      value={formData.degre_alcool}
                      onChange={(e) => setFormData({ ...formData, degre_alcool: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Volume (ml)</label>
                    <input
                      type="number"
                      name="volume_bouteille"
                      value={formData.volume_bouteille}
                      onChange={(e) => setFormData({ ...formData, volume_bouteille: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix unitaire *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="prix_unitaire"
                      value={formData.prix_unitaire}
                      onChange={(e) => setFormData({ ...formData, prix_unitaire: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock actuel</label>
                    <input
                      type="number"
                      name="stock_actuel"
                      value={formData.stock_actuel}
                      onChange={(e) => setFormData({ ...formData, stock_actuel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock minimum</label>
                    <input
                      type="number"
                      name="stock_minimum"
                      value={formData.stock_minimum}
                      onChange={(e) => setFormData({ ...formData, stock_minimum: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code produit</label>
                    <input
                      type="text"
                      name="code_produit"
                      value={formData.code_produit}
                      onChange={(e) => setFormData({ ...formData, code_produit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut *</label>
                    <select
                      name="statut"
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="actif">Actif</option>
                      <option value="inactif">Inactif</option>
                    </select>
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
                    {editingId ? 'Modifier' : 'Créer'} le Produit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Millésime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProduits.map((produit) => (
                <tr key={produit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Wine className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{produit.nom}</div>
                        <div className="text-sm text-gray-500">{produit.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{produit.type_vin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{produit.millesime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatPrice(produit.prix_unitaire)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{produit.stock_actuel}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        produit.statut
                      )}`}
                    >
                      {produit.statut === 'actif' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleEdit(produit)}
                      className="text-blue-600 hover:text-blue-800 p-1 mr-2"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(produit.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredProduits.length === 0 && (
        <div className="text-center py-12">
          <Wine className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun produit trouvé</p>
        </div>
      )}
    </div>
  );
};

export default Produits;