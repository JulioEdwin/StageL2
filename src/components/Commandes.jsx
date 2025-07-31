import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Eye, Trash2, ShoppingCart, Calendar, User, RefreshCw } from 'lucide-react';
import { commandeService, clientService, produitService } from '../services/api';

const Commandes = () => {
  // États principaux
  const [commandes, setCommandes] = useState([]);
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' ou 'error'
  const [editingId, setEditingId] = useState(null);

  // Formulaire
  const [formData, setFormData] = useState({
    client_id: '',
    date_commande: new Date().toISOString().split('T')[0],
    date_livraison_prevue: '',
    statut: 'en_attente',
    tva: '0.00',
    remise: '0.00',
    notes: '',
    details: [{ produit_id: '', quantite: 1, prix_unitaire: 0 }],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const [commandesData, clientsData, produitsData] = await Promise.all([
        commandeService.getAll(),
        clientService.getAll(),
        produitService.getAll(),
      ]);

      // Enrichir les commandes avec les informations clients
      const enrichedCommandes = commandesData.map(commande => {
        const client = clientsData.find(c => c.id === commande.client_id);
        return {
          ...commande,
          client_nom: client?.nom || 'N/A',
          client_prenom: client?.prenom || '',
          entreprise: client?.entreprise || '',
          email: client?.email || 'N/A',
          telephone: client?.telephone || 'N/A',
        };
      });

      setCommandes(enrichedCommandes);
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
      if (!formData.client_id) {
        setMessage('Veuillez sélectionner un client');
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
        if (!detail.quantite || detail.quantite <= 0) {
          setMessage(`La quantité doit être supérieure à 0 pour la ligne ${i + 1}`);
          return;
        }
        if (!detail.prix_unitaire || detail.prix_unitaire <= 0) {
          setMessage(`Le prix unitaire doit être supérieur à 0 pour la ligne ${i + 1}`);
          return;
        }
      }

      // Calcul du montant total
      const montantTotal = formData.details.reduce((sum, detail) => {
        return sum + (parseInt(detail.quantite) || 0) * (parseFloat(detail.prix_unitaire) || 0);
      }, 0);

      // Préparation des données
      const commandeData = {
        ...formData,
        client_id: parseInt(formData.client_id),
        tva: parseFloat(formData.tva) || 0,
        remise: parseFloat(formData.remise) || 0,
        montant_total: montantTotal,
        details: formData.details.map(detail => ({
          produit_id: parseInt(detail.produit_id),
          quantite: parseInt(detail.quantite),
          prix_unitaire: parseFloat(detail.prix_unitaire),
          prix_total: parseInt(detail.quantite) * parseFloat(detail.prix_unitaire)
        }))
      };

      // Envoi des données
      if (editingId) {
        await commandeService.update(editingId, commandeData);
        setMessage('Commande modifiée avec succès');
      } else {
        await commandeService.create(commandeData);
        setMessage('Commande créée avec succès');
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

  const handleStatusChange = async (commandeId, newStatus) => {
    try {
      const commandeExiste = commandes.some(c => c.id === commandeId);
      if (!commandeExiste) {
        setMessage('Commande introuvable ou déjà supprimée');
        return;
      }
      await commandeService.updateStatus(commandeId, newStatus);
      setMessage('Statut mis à jour avec succès');
      loadData();
    } catch (error) {
      setMessage(
        `Erreur lors de la mise à jour du statut: ${
          error.message.includes('404') ? 'Commande non trouvée' : error.message
        }`
      );
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const handleViewDetails = async (commandeId) => {
    try {
      const commandeExiste = commandes.some(c => c.id === commandeId);
      if (!commandeExiste) {
        setMessage('Commande introuvable ou déjà supprimée');
        return;
      }
      const commande = await commandeService.getById(commandeId);
      if (!commande) throw new Error('Commande non trouvée');
      
      // Trouver le client associé
      const client = clients.find(c => c.id === commande.client_id);
      
      // Enrichir les détails avec les noms des produits
      const detailsWithProductNames = commande.details.map(detail => {
        const produit = produits.find(p => p.id === detail.produit_id);
        return {
          ...detail,
          produit_nom: produit?.nom || 'N/A'
        };
      });

      setSelectedCommande({
        ...commande,
        details: detailsWithProductNames,
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
          error.message.includes('404') ? 'Commande non trouvée' : error.message
        }`
      );
      console.error('Erreur lors du chargement des détails:', error);
    }
  };

  const handleEdit = async (commandeId) => {
    try {
      const commandeExiste = commandes.some(c => c.id === commandeId);
      if (!commandeExiste) {
        setMessage('Commande introuvable ou déjà supprimée');
        return;
      }
      const commande = await commandeService.getById(commandeId);
      if (!commande) throw new Error('Commande non trouvée');
      
      setFormData({
        client_id: commande.client_id?.toString() || '',
        date_commande: commande.date_commande
          ? new Date(commande.date_commande).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        date_livraison_prevue: commande.date_livraison_prevue
          ? new Date(commande.date_livraison_prevue).toISOString().split('T')[0]
          : '',
        statut: commande.statut || 'en_attente',
        notes: commande.notes || '',
        tva: commande.tva?.toString() || '0.00',
        remise: commande.remise?.toString() || '0.00',
        details: commande.details?.length
          ? commande.details.map(detail => ({
              produit_id: detail.produit_id?.toString() || '',
              quantite: detail.quantite || 1,
              prix_unitaire: detail.prix_unitaire || 0,
            }))
          : [{ produit_id: '', quantite: 1, prix_unitaire: 0 }],
      });
      setEditingId(commandeId);
      setShowForm(true);
      setShowDetails(false);
      setMessage('');
    } catch (error) {
      setMessage(
        `Erreur lors du chargement pour modification: ${
          error.message.includes('404') ? 'Commande non trouvée' : error.message
        }`
      );
      console.error('Erreur lors du chargement pour modification:', error);
    }
  };

  const handleDelete = async (id) => {
    const commandeExiste = commandes.some(c => c.id === id);
    if (!commandeExiste) {
      setMessage('Commande introuvable ou déjà supprimée');
      return;
    }
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      try {
        await commandeService.delete(id);
        setMessage('Commande supprimée avec succès');
        loadData();
      } catch (error) {
        setMessage(
          `Erreur lors de la suppression: ${
            error.message.includes('404') ? 'Commande non trouvée' : error.message
          }`
        );
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const addDetailLine = () => {
    setFormData({
      ...formData,
      details: [...formData.details, { produit_id: '', quantite: 1, prix_unitaire: 0 }],
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
        if (field === 'produit_id') {
          const produit = produits.find((p) => p.id === parseInt(value));
          return { 
            ...detail, 
            produit_id: value, 
            prix_unitaire: produit?.prix_unitaire || 0 
          };
        }
        if (field === 'quantite' || field === 'prix_unitaire') {
          const numValue = parseFloat(value) || 0;
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
      client_id: '',
      date_commande: new Date().toISOString().split('T')[0],
      date_livraison_prevue: '',
      statut: 'en_attente',
      notes: '',
      tva: '0.00',
      remise: '0.00',
      details: [{ produit_id: '', quantite: 1, prix_unitaire: 0 }],
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

  const filteredCommandes = commandes.filter((commande) => {
    const matchesSearch =
      (commande.numero_commande || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (commande.client_nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (commande.client_prenom || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || commande.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmee':
        return 'bg-blue-100 text-blue-800';
      case 'preparee':
        return 'bg-purple-100 text-purple-800';
      case 'livree':
        return 'bg-green-100 text-green-800';
      case 'annulee':
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
    }).format(parseFloat(price) || 0);
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('fr-FR') : '';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestion des Commandes</h1>
            <p className="text-gray-600 mt-1">Gérez toutes les commandes de votre entreprise</p>
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
              Nouvelle Commande
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
              placeholder="Rechercher commande..."
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
              <option value="en_attente">En attente</option>
              <option value="confirmee">Confirmée</option>
              <option value="preparee">Préparée</option>
              <option value="livree">Livrée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
          
          <div className="text-right md:text-left">
            <p className="text-gray-600">
              {filteredCommandes.length} {filteredCommandes.length === 1 ? 'commande trouvée' : 'commandes trouvées'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
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
              {filteredCommandes.map((commande) => (
                <tr key={commande.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ShoppingCart className="w-5 h-5 text-red-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {commande.numero_commande || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {commande.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {commande.client_nom || 'N/A'} {commande.client_prenom || ''}
                        </div>
                        {commande.entreprise && (
                          <div className="text-xs text-gray-500">{commande.entreprise}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <div className="text-sm text-gray-900">
                          {formatDate(commande.date_commande)}
                        </div>
                        {commande.date_livraison_prevue && (
                          <div className="text-xs text-gray-500">
                            Liv: {formatDate(commande.date_livraison_prevue)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(commande.montant_total)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={commande.statut || 'en_attente'}
                      onChange={(e) => handleStatusChange(commande.id, e.target.value)}
                      className={`text-xs px-3 py-1 rounded-full font-medium border-0 focus:ring-2 focus:ring-red-500 ${getStatusColor(
                        commande.statut || 'en_attente'
                      )}`}
                      disabled={loading}
                    >
                      <option value="en_attente">En attente</option>
                      <option value="confirmee">Confirmée</option>
                      <option value="preparee">Préparée</option>
                      <option value="livree">Livrée</option>
                      <option value="annulee">Annulée</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(commande.id)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                        disabled={loading}
                        title="Modifier"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleViewDetails(commande.id)}
                        className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50 transition-colors"
                        disabled={loading}
                        title="Voir détails"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(commande.id)}
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

        {filteredCommandes.length === 0 && !loading && (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande trouvée</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? `Aucune commande ne correspond à "${searchTerm}"` 
                : 'Aucune commande disponible. Créez une nouvelle commande pour commencer.'}
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
            >
              <Plus className="mr-2" />
              Créer une commande
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
                  {editingId ? 'Modifier la Commande' : 'Nouvelle Commande'}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
                      <select
                        required
                        value={formData.client_id}
                        onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Sélectionner un client</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.nom || 'N/A'} {client.prenom || ''} {client.entreprise && `(${client.entreprise})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de Commande *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date_commande}
                        onChange={(e) => setFormData({ ...formData, date_commande: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de Livraison Prévue
                      </label>
                      <input
                        type="date"
                        value={formData.date_livraison_prevue}
                        onChange={(e) =>
                          setFormData({ ...formData, date_livraison_prevue: e.target.value })
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
                        <option value="en_attente">En attente</option>
                        <option value="confirmee">Confirmée</option>
                        <option value="preparee">Préparée</option>
                        <option value="livree">Livrée</option>
                        <option value="annulee">Annulée</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">TVA (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.tva}
                        onChange={(e) => setFormData({ ...formData, tva: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Remise (MGA)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.remise}
                        onChange={(e) => setFormData({ ...formData, remise: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Détails de la Commande</h4>
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
                                {produit.nom || 'N/A'} - {formatPrice(produit.prix_unitaire)}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="w-full md:w-32">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                          <input
                            type="number"
                            min="1"
                            value={detail.quantite}
                            onChange={(e) => updateDetailLine(index, 'quantite', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                        
                        <div className="w-full md:w-40">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Prix Unitaire</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={detail.prix_unitaire}
                            onChange={(e) =>
                              updateDetailLine(index, 'prix_unitaire', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                        
                        <div className="w-full md:w-40">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                          <div className="w-full px-3 py-2 bg-gray-50 rounded-lg text-right font-medium">
                            {formatPrice(detail.quantite * detail.prix_unitaire)}
                          </div>
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
                  
                  <div className="mt-6 text-right">
                    <div className="text-xl font-bold">
                      Total: {formatPrice(formData.details.reduce((sum, detail) => sum + (detail.quantite * detail.prix_unitaire || 0), 0))}
                    </div>
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
                    {editingId ? 'Modifier la Commande' : 'Créer la Commande'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {showDetails && selectedCommande && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Commande {selectedCommande.numero_commande || 'N/A'}
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
                        {selectedCommande.client_nom || 'N/A'} {selectedCommande.client_prenom || ''}
                      </p>
                    </div>
                    
                    {selectedCommande.entreprise && (
                      <div>
                        <p className="text-sm text-gray-600">Entreprise</p>
                        <p className="font-medium">{selectedCommande.entreprise}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedCommande.email || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="font-medium">{selectedCommande.telephone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-4 pb-2 border-b">Informations Commande</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Date de commande</p>
                      <p className="font-medium">{formatDate(selectedCommande.date_commande)}</p>
                    </div>
                    
                    {selectedCommande.date_livraison_prevue && (
                      <div>
                        <p className="text-sm text-gray-600">Livraison prévue</p>
                        <p className="font-medium">
                          {formatDate(selectedCommande.date_livraison_prevue)}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-600">Statut</p>
                      <p className="font-medium">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            selectedCommande.statut
                          )}`}
                        >
                          {selectedCommande.statut ? selectedCommande.statut.replace('_', ' ') : 'N/A'}
                        </span>
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Montant total</p>
                      <p className="font-medium text-xl">
                        {formatPrice(selectedCommande.montant_total)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-4 pb-2 border-b">Détails de la Commande</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase">Produit</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500 uppercase">Quantité</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 uppercase">Prix Unitaire</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedCommande.details?.length > 0 ? (
                        selectedCommande.details.map((detail, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3">{detail.produit_nom || 'N/A'}</td>
                            <td className="px-4 py-3 text-center">{detail.quantite || 0}</td>
                            <td className="px-4 py-3 text-right">{formatPrice(detail.prix_unitaire)}</td>
                            <td className="px-4 py-3 text-right font-medium">
                              {formatPrice(detail.prix_total)}
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
                    <tfoot className="bg-gray-50 font-bold">
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-right">
                          Total:
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatPrice(selectedCommande.montant_total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              {selectedCommande.notes && (
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-3">Notes</h4>
                  <p className="text-gray-700">{selectedCommande.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Commandes;