import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Eye, Trash2, Truck, Calendar, User, Package, RefreshCw } from 'lucide-react';
import { bonLivraisonService, commandeService, clientService, produitService } from '../services/api';

const BonsLivraison = () => {
  // États principaux
  const [bonsLivraison, setBonsLivraison] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedBonLivraison, setSelectedBonLivraison] = useState(null);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Formulaire
  const [formData, setFormData] = useState({
    commande_id: '',
    date_livraison: new Date().toISOString().split('T')[0],
    date_livraison_effective: '',
    adresse_livraison: '',
    transporteur: '',
    numero_suivi: '',
    statut: 'en_preparation',
    notes: '',
    details: [{ produit_id: '', quantite_commandee: 0, quantite_livree: 0 }],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const [bonsLivraisonData, commandesData, clientsData, produitsData] = await Promise.all([
        bonLivraisonService.getAll(),
        commandeService.getAll(),
        clientService.getAll(),
        produitService.getAll(),
      ]);

      // Enrichir les bons de livraison avec les informations commandes et clients
      const enrichedBonsLivraison = bonsLivraisonData.map(bon => {
        const commande = commandesData.find(c => c.id === bon.commande_id);
        const client = commande ? clientsData.find(cl => cl.id === commande.client_id) : null;
        return {
          ...bon,
          commande_numero: commande?.numero_commande || 'N/A',
          client_nom: client?.nom || 'N/A',
          client_prenom: client?.prenom || '',
          entreprise: client?.entreprise || '',
          email: client?.email || 'N/A',
          telephone: client?.telephone || 'N/A',
        };
      });

      setBonsLivraison(enrichedBonsLivraison);
      setCommandes(commandesData);
      setClients(clientsData);
      setProduits(produitsData);
    } catch (error) {
      const errorMessage = error.message || 'Erreur inconnue';
      setMessage(`Erreur lors du chargement des données: ${errorMessage}`);
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validation
      if (!formData.commande_id) {
        setMessage('Veuillez sélectionner une commande');
        return;
      }

      if (!formData.adresse_livraison.trim()) {
        setMessage('Veuillez saisir l\'adresse de livraison');
        return;
      }

      if (formData.details.length === 0 || formData.details.some(d => !d.produit_id)) {
        setMessage('Veuillez ajouter au moins un produit valide');
        return;
      }

      // Validation des détails
      for (let i = 0; i < formData.details.length; i++) {
        const detail = formData.details[i];
        if (!detail.produit_id) {
          setMessage(`Veuillez sélectionner un produit pour la ligne ${i + 1}`);
          return;
        }
        if (!detail.quantite_commandee || detail.quantite_commandee <= 0) {
          setMessage(`La quantité commandée doit être supérieure à 0 pour la ligne ${i + 1}`);
          return;
        }
        if (detail.quantite_livree < 0) {
          setMessage(`La quantité livrée ne peut pas être négative pour la ligne ${i + 1}`);
          return;
        }
        if (detail.quantite_livree > detail.quantite_commandee) {
          setMessage(`La quantité livrée ne peut pas dépasser la quantité commandée pour la ligne ${i + 1}`);
          return;
        }
      }

      // Préparation des données
      const bonLivraisonData = {
        ...formData,
        commande_id: parseInt(formData.commande_id),
        details: formData.details.map(detail => ({
          produit_id: parseInt(detail.produit_id),
          quantite_commandee: parseInt(detail.quantite_commandee),
          quantite_livree: parseInt(detail.quantite_livree) || 0
        }))
      };

      // Envoi des données
      if (editingId) {
        await bonLivraisonService.update(editingId, bonLivraisonData);
        setMessage('Bon de livraison modifié avec succès');
      } else {
        await bonLivraisonService.create(bonLivraisonData);
        setMessage('Bon de livraison créé avec succès');
      }
      
      await loadData();
      closeForm();
    } catch (error) {
      setMessage(
        editingId
          ? `Erreur lors de la modification: ${error.message}`
          : `Erreur lors de la création: ${error.message}`
      );
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const handleStatusChange = async (bonLivraisonId, newStatus) => {
    try {
      const bonExiste = bonsLivraison.some(b => b.id === bonLivraisonId);
      if (!bonExiste) {
        setMessage('Bon de livraison introuvable ou déjà supprimé');
        return;
      }
      await bonLivraisonService.updateStatus(bonLivraisonId, newStatus);
      setMessage('Statut mis à jour avec succès');
      loadData();
    } catch (error) {
      setMessage(
        `Erreur lors de la mise à jour du statut: ${
          error.message.includes('404') ? 'Bon de livraison non trouvé' : error.message
        }`
      );
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const handleViewDetails = async (bonLivraisonId) => {
    try {
      const bonExiste = bonsLivraison.some(b => b.id === bonLivraisonId);
      if (!bonExiste) {
        setMessage('Bon de livraison introuvable ou déjà supprimé');
        return;
      }
      const bonLivraison = await bonLivraisonService.getById(bonLivraisonId);
      if (!bonLivraison) throw new Error('Bon de livraison non trouvé');
      
      // Trouver la commande et le client associés
      const commande = commandes.find(c => c.id === bonLivraison.commande_id);
      const client = commande ? clients.find(cl => cl.id === commande.client_id) : null;
      
      // Enrichir les détails avec les noms des produits
      const detailsWithProductNames = bonLivraison.details.map(detail => {
        const produit = produits.find(p => p.id === detail.produit_id);
        return {
          ...detail,
          produit_nom: produit?.nom || 'N/A'
        };
      });

      setSelectedBonLivraison({
        ...bonLivraison,
        details: detailsWithProductNames,
        commande_numero: commande?.numero_commande || 'N/A',
        client_nom: client?.nom || 'N/A',
        client_prenom: client?.prenom || '',
        entreprise: client?.entreprise || '',
        email: client?.email || 'N/A',
        telephone: client?.telephone || 'N/A',
      });
      setShowDetails(true);
      setShowForm(false);
      setMessage('');
    } catch (error) {
      setMessage(
        `Erreur lors du chargement des détails: ${
          error.message.includes('404') ? 'Bon de livraison non trouvé' : error.message
        }`
      );
      console.error('Erreur lors du chargement des détails:', error);
    }
  };

  const handleEdit = async (bonLivraisonId) => {
    try {
      const bonExiste = bonsLivraison.some(b => b.id === bonLivraisonId);
      if (!bonExiste) {
        setMessage('Bon de livraison introuvable ou déjà supprimé');
        return;
      }
      const bonLivraison = await bonLivraisonService.getById(bonLivraisonId);
      if (!bonLivraison) throw new Error('Bon de livraison non trouvé');
      
      setFormData({
        commande_id: bonLivraison.commande_id?.toString() || '',
        date_livraison: bonLivraison.date_livraison
          ? new Date(bonLivraison.date_livraison).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        date_livraison_effective: bonLivraison.date_livraison_effective
          ? new Date(bonLivraison.date_livraison_effective).toISOString().split('T')[0]
          : '',
        adresse_livraison: bonLivraison.adresse_livraison || '',
        transporteur: bonLivraison.transporteur || '',
        numero_suivi: bonLivraison.numero_suivi || '',
        statut: bonLivraison.statut || 'en_preparation',
        notes: bonLivraison.notes || '',
        details: bonLivraison.details?.length
          ? bonLivraison.details.map(detail => ({
              produit_id: detail.produit_id?.toString() || '',
              quantite_commandee: detail.quantite_commandee || 0,
              quantite_livree: detail.quantite_livree || 0,
            }))
          : [{ produit_id: '', quantite_commandee: 0, quantite_livree: 0 }],
      });
      setEditingId(bonLivraisonId);
      setShowForm(true);
      setShowDetails(false);
      setMessage('');
    } catch (error) {
      setMessage(
        `Erreur lors du chargement pour modification: ${
          error.message.includes('404') ? 'Bon de livraison non trouvé' : error.message
        }`
      );
      console.error('Erreur lors du chargement pour modification:', error);
    }
  };

  const handleDelete = async (id) => {
    const bonExiste = bonsLivraison.some(b => b.id === id);
    if (!bonExiste) {
      setMessage('Bon de livraison introuvable ou déjà supprimé');
      return;
    }
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bon de livraison ?')) {
      try {
        await bonLivraisonService.delete(id);
        setMessage('Bon de livraison supprimé avec succès');
        loadData();
      } catch (error) {
        setMessage(
          `Erreur lors de la suppression: ${
            error.message.includes('404') ? 'Bon de livraison non trouvé' : error.message
          }`
        );
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const addDetailLine = () => {
    setFormData({
      ...formData,
      details: [...formData.details, { produit_id: '', quantite_commandee: 0, quantite_livree: 0 }],
    });
  };

  const removeDetailLine = (index) => {
    if (formData.details.length <= 1) {
      setMessage('Au moins un produit est requis');
      return;
    }
    setFormData({
      ...formData,
      details: formData.details.filter((_, i) => i !== index),
    });
  };

  const updateDetailLine = (index, field, value) => {
    const updatedDetails = formData.details.map((detail, i) => {
      if (i === index) {
        if (field === 'quantite_commandee' || field === 'quantite_livree') {
          const numValue = parseInt(value) || 0;
          return { ...detail, [field]: numValue };
        }
        return { ...detail, [field]: value };
      }
      return detail;
    });
    setFormData({ ...formData, details: updatedDetails });
  };

  const resetForm = () => {
    setFormData({
      commande_id: '',
      date_livraison: new Date().toISOString().split('T')[0],
      date_livraison_effective: '',
      adresse_livraison: '',
      transporteur: '',
      numero_suivi: '',
      statut: 'en_preparation',
      notes: '',
      details: [{ produit_id: '', quantite_commandee: 0, quantite_livree: 0 }],
    });
    setEditingId(null);
    setMessage('');
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const closeDetails = () => {
    setShowDetails(false);
  };

  const filteredBonsLivraison = bonsLivraison.filter((bon) => {
    const matchesSearch =
      (bon.numero_bon || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bon.client_nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bon.client_prenom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bon.commande_numero || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bon.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'en_preparation':
        return 'bg-yellow-100 text-yellow-800';
      case 'expedie':
        return 'bg-blue-100 text-blue-800';
      case 'en_transit':
        return 'bg-purple-100 text-purple-800';
      case 'livre':
        return 'bg-green-100 text-green-800';
      case 'retour':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case 'en_preparation':
        return 'En préparation';
      case 'expedie':
        return 'Expédié';
      case 'en_transit':
        return 'En transit';
      case 'livre':
        return 'Livré';
      case 'retour':
        return 'Retour';
      default:
        return statut;
    }
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('fr-FR') : '';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des bons de livraison...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestion des Bons de Livraison</h1>
            <p className="text-gray-600 mt-1">Gérez tous les bons de livraison de votre entreprise</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center transition duration-300"
            >
              <Plus className="mr-2" />
              Nouveau Bon de Livraison
            </button>
            <button
              onClick={loadData}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center transition duration-300"
            >
              <RefreshCw className="mr-2" />
              Rafraîchir
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('succès') 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher bon de livraison..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_preparation">En préparation</option>
              <option value="expedie">Expédié</option>
              <option value="en_transit">En transit</option>
              <option value="livre">Livré</option>
              <option value="retour">Retour</option>
            </select>
          </div>
          
          <div className="text-right md:text-left">
            <p className="text-gray-600">
              {filteredBonsLivraison.length} {filteredBonsLivraison.length === 1 ? 'bon trouvé' : 'bons trouvés'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bon de Livraison
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Livraison
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
              {filteredBonsLivraison.map((bon) => (
                <tr key={bon.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Truck className="w-5 h-5 text-red-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {bon.numero_bon || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {bon.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {bon.commande_numero || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {bon.client_nom || 'N/A'} {bon.client_prenom || ''}
                        </div>
                        {bon.entreprise && (
                          <div className="text-xs text-gray-500">{bon.entreprise}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-purple-600 mr-3" />
                      <div>
                        <div className="text-sm text-gray-900">
                          {formatDate(bon.date_livraison)}
                        </div>
                        {bon.date_livraison_effective && (
                          <div className="text-xs text-gray-500">
                            Effectif: {formatDate(bon.date_livraison_effective)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={bon.statut || 'en_preparation'}
                      onChange={(e) => handleStatusChange(bon.id, e.target.value)}
                      className={`text-xs px-3 py-1 rounded-full font-medium border-0 focus:ring-2 focus:ring-red-500 ${getStatusColor(
                        bon.statut || 'en_preparation'
                      )}`}
                      disabled={loading}
                    >
                      <option value="en_preparation">En préparation</option>
                      <option value="expedie">Expédié</option>
                      <option value="en_transit">En transit</option>
                      <option value="livre">Livré</option>
                      <option value="retour">Retour</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(bon.id)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                        disabled={loading}
                        title="Modifier"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleViewDetails(bon.id)}
                        className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50 transition-colors"
                        disabled={loading}
                        title="Voir détails"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(bon.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                        disabled={loading}
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBonsLivraison.length === 0 && !loading && (
          <div className="text-center py-12">
            <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun bon de livraison trouvé</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? `Aucun bon de livraison ne correspond à "${searchTerm}"` 
                : 'Aucun bon de livraison disponible. Créez un nouveau bon de livraison pour commencer.'}
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
            >
              <Plus className="mr-2" />
              Créer un bon de livraison
            </button>
          </div>
        )}
      </div>

      {/* Modal de formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingId ? 'Modifier le Bon de Livraison' : 'Nouveau Bon de Livraison'}
                </h3>
                <button
                  onClick={closeForm}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Commande *</label>
                      <select
                        required
                        value={formData.commande_id}
                        onChange={(e) => setFormData({ ...formData, commande_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Sélectionner une commande</option>
                        {commandes.map((commande) => {
                          const client = clients.find(c => c.id === commande.client_id);
                          return (
                            <option key={commande.id} value={commande.id}>
                              {commande.numero_commande || 'N/A'} - {client?.nom || 'N/A'} {client?.prenom || ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de Livraison *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date_livraison}
                        onChange={(e) => setFormData({ ...formData, date_livraison: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de Livraison Effective
                      </label>
                      <input
                        type="date"
                        value={formData.date_livraison_effective}
                        onChange={(e) =>
                          setFormData({ ...formData, date_livraison_effective: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                      <select
                        value={formData.statut}
                        onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="en_preparation">En préparation</option>
                        <option value="expedie">Expédié</option>
                        <option value="en_transit">En transit</option>
                        <option value="livre">Livré</option>
                        <option value="retour">Retour</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Adresse de Livraison *</label>
                      <textarea
                        required
                        value={formData.adresse_livraison}
                        onChange={(e) => setFormData({ ...formData, adresse_livraison: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Adresse complète de livraison..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transporteur</label>
                      <input
                        type="text"
                        value={formData.transporteur}
                        onChange={(e) => setFormData({ ...formData, transporteur: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Nom du transporteur..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de Suivi</label>
                      <input
                        type="text"
                        value={formData.numero_suivi}
                        onChange={(e) => setFormData({ ...formData, numero_suivi: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Numéro de suivi..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Notes additionnelles..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Détails du Bon de Livraison</h4>
                    <button
                      type="button"
                      onClick={addDetailLine}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                    >
                      <Plus className="mr-1" />
                      Ajouter un produit
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.details.map((detail, index) => (
                      <div
                        key={index}
                        className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1 w-full">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
                          <select
                            required
                            value={detail.produit_id}
                            onChange={(e) => updateDetailLine(index, 'produit_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          >
                            <option value="">Sélectionner un produit</option>
                            {produits.map((produit) => (
                              <option key={produit.id} value={produit.id}>
                                {produit.nom || 'N/A'}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="w-full md:w-32">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantité Commandée</label>
                          <input
                            type="number"
                            min="0"
                            value={detail.quantite_commandee}
                            onChange={(e) => updateDetailLine(index, 'quantite_commandee', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                        
                        <div className="w-full md:w-32">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantité Livrée</label>
                          <input
                            type="number"
                            min="0"
                            value={detail.quantite_livree}
                            onChange={(e) => updateDetailLine(index, 'quantite_livree', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                        
                        {formData.details.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDetailLine(index)}
                            className="mt-6 md:mt-0 px-3 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center"
                          >
                            <Trash2 className="mr-1" />
                            Supprimer
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {editingId ? 'Modifier le Bon de Livraison' : 'Créer le Bon de Livraison'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {showDetails && selectedBonLivraison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Bon de Livraison {selectedBonLivraison.numero_bon || 'N/A'}
                </h3>
                <button
                  onClick={closeDetails}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  &times;
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-4 pb-2 border-b">Informations Client</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Nom</p>
                      <p className="font-medium">
                        {selectedBonLivraison.client_nom || 'N/A'} {selectedBonLivraison.client_prenom || ''}
                      </p>
                    </div>
                    
                    {selectedBonLivraison.entreprise && (
                      <div>
                        <p className="text-sm text-gray-600">Entreprise</p>
                        <p className="font-medium">{selectedBonLivraison.entreprise}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedBonLivraison.email || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="font-medium">{selectedBonLivraison.telephone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-4 pb-2 border-b">Informations Livraison</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Commande</p>
                      <p className="font-medium">{selectedBonLivraison.commande_numero || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Date de livraison</p>
                      <p className="font-medium">{formatDate(selectedBonLivraison.date_livraison)}</p>
                    </div>
                    
                    {selectedBonLivraison.date_livraison_effective && (
                      <div>
                        <p className="text-sm text-gray-600">Livraison effective</p>
                        <p className="font-medium">
                          {formatDate(selectedBonLivraison.date_livraison_effective)}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-600">Statut</p>
                      <p className="font-medium">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            selectedBonLivraison.statut
                          )}`}
                        >
                          {getStatusLabel(selectedBonLivraison.statut)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-4 pb-2 border-b">Adresse de Livraison</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">{selectedBonLivraison.adresse_livraison}</p>
                </div>
              </div>
              
              {selectedBonLivraison.transporteur && (
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-4 pb-2 border-b">Informations Transport</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Transporteur</p>
                      <p className="font-medium">{selectedBonLivraison.transporteur}</p>
                    </div>
                    {selectedBonLivraison.numero_suivi && (
                      <div>
                        <p className="text-sm text-gray-600">Numéro de suivi</p>
                        <p className="font-medium">{selectedBonLivraison.numero_suivi}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-4 pb-2 border-b">Détails du Bon de Livraison</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Produit</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500 uppercase">Quantité Commandée</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500 uppercase">Quantité Livrée</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500 uppercase">Reste</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedBonLivraison.details?.length > 0 ? (
                        selectedBonLivraison.details.map((detail, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3">{detail.produit_nom || 'N/A'}</td>
                            <td className="px-4 py-3 text-center">{detail.quantite_commandee || 0}</td>
                            <td className="px-4 py-3 text-center">{detail.quantite_livree || 0}</td>
                            <td className="px-4 py-3 text-center font-medium">
                              {(detail.quantite_commandee || 0) - (detail.quantite_livree || 0)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                            Aucun détail disponible
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {selectedBonLivraison.notes && (
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-3">Notes</h4>
                  <p className="text-gray-700">{selectedBonLivraison.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BonsLivraison;
