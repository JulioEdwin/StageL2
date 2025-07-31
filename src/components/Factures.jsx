import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Eye, FileText, Calendar, User, DollarSign } from 'lucide-react';
import { factureService, clientService, produitService, commandeService } from '../services/api';

const Factures = () => {
  const [factures, setFactures] = useState([]);
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [formData, setFormData] = useState({
    client_id: '',
    commande_id: '',
    date_facture: new Date().toISOString().split('T')[0],
    date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    taux_tva: 20,
    remise: 0,
    notes: '',
    details: [{ produit_id: '', quantite: 1, prix_unitaire: 0 }]
  });

  // Ref for printable content
  const printRef = useRef();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [facturesData, clientsData, produitsData, commandesData] = await Promise.all([
        factureService.getAll(),
        clientService.getAll(),
        produitService.getAll(),
        commandeService.getAll()
      ]);
      setFactures(facturesData);
      setClients(clientsData);
      setProduits(produitsData);
      setCommandes(commandesData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAmounts = () => {
    const montant_ht = formData.details.reduce((sum, detail) => {
      return sum + (detail.quantite * detail.prix_unitaire);
    }, 0) - formData.remise;

    const montant_tva = montant_ht * (formData.taux_tva / 100);
    const montant_ttc = montant_ht + montant_tva;

    return { montant_ht, montant_tva, montant_ttc };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { montant_ht, montant_tva, montant_ttc } = calculateAmounts();

      const factureData = {
        ...formData,
        montant_ht,
        montant_tva,
        montant_ttc,
        details: formData.details.map(detail => ({
          ...detail,
          prix_total: detail.quantite * detail.prix_unitaire
        }))
      };

      await factureService.create(factureData);
      loadData();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la création de la facture:', error);
    }
  };

  const handleStatusChange = async (factureId, newStatus) => {
    try {
      await factureService.updateStatus(factureId, newStatus);
      loadData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const handleViewDetails = async (factureId) => {
    try {
      const facture = await factureService.getById(factureId);
      setSelectedFacture(facture);
      setShowDetails(true);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    }
  };

  const handleCreateFromCommande = async (commandeId) => {
    try {
      await factureService.createFromCommande(commandeId);
      loadData();
    } catch (error) {
      console.error('Erreur lors de la création de la facture:', error);
    }
  };

  const addDetailLine = () => {
    setFormData({
      ...formData,
      details: [...formData.details, { produit_id: '', quantite: 1, prix_unitaire: 0 }]
    });
  };

  const removeDetailLine = (index) => {
    setFormData({
      ...formData,
      details: formData.details.filter((_, i) => i !== index)
    });
  };

  const updateDetailLine = (index, field, value) => {
    const updatedDetails = formData.details.map((detail, i) => {
      if (i === index) {
        if (field === 'produit_id') {
          const produit = produits.find(p => p.id === parseInt(value));
          return { ...detail, produit_id: value, prix_unitaire: produit?.prix_unitaire || 0 };
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
      commande_id: '',
      date_facture: new Date().toISOString().split('T')[0],
      date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      taux_tva: 20,
      remise: 0,
      notes: '',
      details: [{ produit_id: '', quantite: 1, prix_unitaire: 0 }]
    });
    setShowForm(false);
  };

  const filteredFactures = factures.filter(facture => {
    const matchesSearch = facture.numero_facture.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facture.client_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facture.client_prenom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || facture.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'envoyee': return 'bg-blue-100 text-blue-800';
      case 'payee': return 'bg-green-100 text-green-800';
      case 'en_retard': return 'bg-red-100 text-red-800';
      case 'annulee': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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

  // Print handler for the details modal
  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // To restore event listeners and React state
  };

  const { montant_ht, montant_tva, montant_ttc } = calculateAmounts();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Factures</h2>
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
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Factures</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowForm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle Facture</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher une facture..."
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
          <option value="en_attente">En attente</option>
          <option value="envoyee">Envoyée</option>
          <option value="payee">Payée</option>
          <option value="en_retard">En retard</option>
          <option value="annulee">Annulée</option>
        </select>
      </div>

      {/* Invoice Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouvelle Facture</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Client et dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client *
                    </label>
                    <select
                      required
                      value={formData.client_id}
                      onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Sélectionner un client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.nom} {client.prenom} {client.entreprise && `(${client.entreprise})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commande (optionnel)
                    </label>
                    <select
                      value={formData.commande_id}
                      onChange={(e) => setFormData({...formData, commande_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Aucune commande</option>
                      {commandes.map(commande => (
                        <option key={commande.id} value={commande.id}>
                          {commande.numero_commande}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de Facture *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date_facture}
                      onChange={(e) => setFormData({...formData, date_facture: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d'Échéance *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date_echeance}
                      onChange={(e) => setFormData({...formData, date_echeance: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Détails de la facture */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900">Détails de la Facture</h4>
                    <button
                      type="button"
                      onClick={addDetailLine}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      + Ajouter un produit
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.details.map((detail, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <select
                            value={detail.produit_id}
                            onChange={(e) => updateDetailLine(index, 'produit_id', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          >
                            <option value="">Sélectionner un produit</option>
                            {produits.map(produit => (
                              <option key={produit.id} value={produit.id}>
                                {produit.nom} - {formatPrice(produit.prix_unitaire)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            min="1"
                            value={detail.quantite}
                            onChange={(e) => updateDetailLine(index, 'quantite', parseInt(e.target.value))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            step="0.01"
                            value={detail.prix_unitaire}
                            onChange={(e) => updateDetailLine(index, 'prix_unitaire', parseFloat(e.target.value))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                        <div className="w-32 text-right">
                          <span className="text-sm font-medium">
                            {formatPrice(detail.quantite * detail.prix_unitaire)}
                          </span>
                        </div>
                        {formData.details.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDetailLine(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculs et totaux */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Remise (MGA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.remise}
                      onChange={(e) => setFormData({...formData, remise: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taux TVA (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.taux_tva}
                      onChange={(e) => setFormData({...formData, taux_tva: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Montant HT:</span>
                        <span className="font-medium">{formatPrice(montant_ht)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TVA ({formData.taux_tva}%):</span>
                        <span className="font-medium">{formatPrice(montant_tva)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total TTC:</span>
                        <span>{formatPrice(montant_ttc)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
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
                    Créer la Facture
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {showDetails && selectedFacture && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Facture {selectedFacture.numero_facture}
                </h3>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 p-2">
                    <DollarSign className="w-5 h-5" />
                  </button>
                  {/* Imprimer bouton */}
                  <button
                    className="text-green-600 hover:text-green-800 p-2"
                    onClick={handlePrint}
                    title="Imprimer la facture"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              {/* Printable content */}
              <div ref={printRef}>
                {/* Informations client */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Informations Client</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Nom:</strong> {selectedFacture.client_nom} {selectedFacture.client_prenom}</p>
                      {selectedFacture.entreprise && <p><strong>Entreprise:</strong> {selectedFacture.entreprise}</p>}
                    </div>
                    <div>
                      <p><strong>Email:</strong> {selectedFacture.email}</p>
                      <p><strong>Téléphone:</strong> {selectedFacture.telephone}</p>
                    </div>
                  </div>
                </div>

                {/* Détails de la facture */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Détails de la Facture</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Produit</th>
                          <th className="px-4 py-2 text-center">Quantité</th>
                          <th className="px-4 py-2 text-right">Prix Unitaire</th>
                          <th className="px-4 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedFacture.details.map((detail, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2">{detail.produit_nom}</td>
                            <td className="px-4 py-2 text-center">{detail.quantite}</td>
                            <td className="px-4 py-2 text-right">{formatPrice(detail.prix_unitaire)}</td>
                            <td className="px-4 py-2 text-right">{formatPrice(detail.prix_total)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan="3" className="px-4 py-2 text-right font-medium">Montant HT:</td>
                          <td className="px-4 py-2 text-right font-medium">{formatPrice(selectedFacture.montant_ht)}</td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="px-4 py-2 text-right font-medium">TVA ({selectedFacture.taux_tva}%):</td>
                          <td className="px-4 py-2 text-right font-medium">{formatPrice(selectedFacture.montant_tva)}</td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="px-4 py-2 text-right font-bold">Total TTC:</td>
                          <td className="px-4 py-2 text-right font-bold">{formatPrice(selectedFacture.montant_ttc)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Informations facture */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Date de facture:</strong> {formatDate(selectedFacture.date_facture)}</p>
                    <p><strong>Date d'échéance:</strong> {formatDate(selectedFacture.date_echeance)}</p>
                    {selectedFacture.numero_commande && (
                      <p><strong>Commande:</strong> {selectedFacture.numero_commande}</p>
                    )}
                  </div>
                  <div>
                    <p><strong>Statut:</strong> 
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedFacture.statut)}`}>
                        {selectedFacture.statut.replace('_', ' ')}
                      </span>
                    </p>
                  </div>
                </div>

                {selectedFacture.notes && (
                  <div className="mt-4">
                    <p><strong>Notes:</strong> {selectedFacture.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facture
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Échéance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant TTC
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
              {filteredFactures.map((facture) => (
                <tr key={facture.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{facture.numero_facture}</div>
                        {facture.numero_commande && (
                          <div className="text-sm text-gray-500">Cmd: {facture.numero_commande}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {facture.client_nom} {facture.client_prenom}
                        </div>
                        {facture.entreprise && (
                          <div className="text-sm text-gray-500">{facture.entreprise}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                      <div className="text-sm text-gray-900">{formatDate(facture.date_facture)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(facture.date_echeance)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">{formatPrice(facture.montant_ttc)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={facture.statut}
                      onChange={(e) => handleStatusChange(facture.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 focus:ring-2 focus:ring-red-500 ${getStatusColor(facture.statut)}`}
                    >
                      <option value="en_attente">En attente</option>
                      <option value="envoyee">Envoyée</option>
                      <option value="payee">Payée</option>
                      <option value="en_retard">En retard</option>
                      <option value="annulee">Annulée</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleViewDetails(facture.id)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredFactures.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucune facture trouvée</p>
        </div>
      )}
    </div>
  );
};

export default Factures;