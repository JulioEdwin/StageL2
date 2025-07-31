const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Méthodes HTTP
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, { 
      ...options, 
      method: 'POST', 
      body: data 
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: data 
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Services spécialisés
class ClientService extends ApiService {
  getAll() {
    return this.get('/clients');
  }

  getById(id) {
    return this.get(`/clients/${id}`);
  }

  create(clientData) {
    return this.post('/clients', clientData);
  }

  update(id, clientData) {
    return this.put(`/clients/${id}`, clientData);
  }

  delete(id) {
    return this.request(`/clients/${id}`, { method: 'DELETE' });
  }

  search(query) {
    return this.get(`/clients/search?q=${encodeURIComponent(query)}`);
  }

  getStats() {
    return this.get('/clients/stats');
  }
}

class ProduitService extends ApiService {
  getAll() {
    return this.get('/produits');
  }

  getById(id) {
    return this.get(`/produits/${id}`);
  }

  create(produitData) {
    return this.post('/produits', produitData);
  }

  update(id, produitData) {
    return this.put(`/produits/${id}`, produitData);
  }

  delete(id) {
    return this.request(`/produits/${id}`, { method: 'DELETE' });
  }

  updateStock(id, stock, motif) {
    return this.put(`/produits/${id}/stock`, { stock, motif });
  }

  getStats() {
    return this.get('/produits/stats');
  }
}

class CommandeService extends ApiService {
  getAll() {
    return this.get('/commandes');
  }

  getById(id) {
    return this.get(`/commandes/${id}`);
  }

  create(commandeData) {
    return this.post('/commandes', commandeData);
  }

  update(id, commandeData) {
    return this.put(`/commandes/${id}`, commandeData);
  }

  delete(id) {
    return this.request(`/commandes/${id}`, { method: 'DELETE' });
  }

  updateStatus(id, statut) {
    return this.put(`/commandes/${id}/status`, { statut });
  }

  getByStatus(status) {
    return this.get(`/commandes/status/${status}`);
  }

  getStats() {
    return this.get('/commandes/stats');
  }
}

class FactureService extends ApiService {
  getAll() {
    return this.get('/factures');
  }

  getById(id) {
    return this.get(`/factures/${id}`);
  }

  create(factureData) {
    return this.post('/factures', factureData);
  }

  updateStatus(id, statut) {
    return this.put(`/factures/${id}/status`, { statut });
  }

  getByStatus(status) {
    return this.get(`/factures/status/${status}`);
  }

  getStats() {
    return this.get('/factures/stats');
  }

  createFromCommande(commandeId) {
    return this.post(`/factures/from-commande/${commandeId}`);
  }
}

// Export des services
export const clientService = new ClientService();
export const produitService = new ProduitService();
export const commandeService = new CommandeService();
export const factureService = new FactureService();

// Services pour les nouvelles pages
class RecolteService extends ApiService {
  getAll() {
    return this.get('/recoltes');
  }

  getById(id) {
    return this.get(`/recoltes/${id}`);
  }

  create(recolteData) {
    return this.post('/recoltes', recolteData);
  }

  update(id, recolteData) {
    return this.put(`/recoltes/${id}`, recolteData);
  }

  delete(id) {
    return this.request(`/recoltes/${id}`, { method: 'DELETE' });
  }

  getStats() {
    return this.get('/recoltes/stats');
  }
}

class ParcelleService extends ApiService {
  getAll() {
    return this.get('/parcelles');
  }

  getById(id) {
    return this.get(`/parcelles/${id}`);
  }

  create(parcelleData) {
    return this.post('/parcelles', parcelleData);
  }

  update(id, parcelleData) {
    return this.put(`/parcelles/${id}`, parcelleData);
  }

  delete(id) {
    return this.request(`/parcelles/${id}`, { method: 'DELETE' });
  }

  getStats() {
    return this.get('/parcelles/stats');
  }
}

class BassinService extends ApiService {
  getAll() {
    return this.get('/bassins');
  }

  getById(id) {
    return this.get(`/bassins/${id}`);
  }

  create(bassinData) {
    return this.post('/bassins', bassinData);
  }

  update(id, bassinData) {
    return this.put(`/bassins/${id}`, bassinData);
  }

  delete(id) {
    return this.request(`/bassins/${id}`, { method: 'DELETE' });
  }

  getStats() {
    return this.get('/bassins/stats');
  }
}

class LotService extends ApiService {
  getAll() {
    return this.get('/lots');
  }

  getById(id) {
    return this.get(`/lots/${id}`);
  }

  create(lotData) {
    return this.post('/lots', lotData);
  }

  update(id, lotData) {
    return this.put(`/lots/${id}`, lotData);
  }

  delete(id) {
    return this.request(`/lots/${id}`, { method: 'DELETE' });
  }

  getStats() {
    return this.get('/lots/stats');
  }
}

class PaiementService extends ApiService {
  getAll() {
    return this.get('/paiements');
  }

  getById(id) {
    return this.get(`/paiements/${id}`);
  }

  create(paiementData) {
    return this.post('/paiements', paiementData);
  }

  update(id, paiementData) {
    return this.put(`/paiements/${id}`, paiementData);
  }

  delete(id) {
    return this.request(`/paiements/${id}`, { method: 'DELETE' });
  }

  getStats() {
    return this.get('/paiements/stats');
  }
}

class BonLivraisonService extends ApiService {
  getAll() {
    return this.get('/bons-livraison');
  }

  getById(id) {
    return this.get(`/bons-livraison/${id}`);
  }

  create(bonLivraisonData) {
    return this.post('/bons-livraison', bonLivraisonData);
  }

  update(id, bonLivraisonData) {
    return this.put(`/bons-livraison/${id}`, bonLivraisonData);
  }

  delete(id) {
    return this.request(`/bons-livraison/${id}`, { method: 'DELETE' });
  }

  updateStatus(id, statut) {
    return this.put(`/bons-livraison/${id}/status`, { statut });
  }

  getByStatus(status) {
    return this.get(`/bons-livraison/status/${status}`);
  }

  getByCommande(commandeId) {
    return this.get(`/bons-livraison/commande/${commandeId}`);
  }

  getStats() {
    return this.get('/bons-livraison/stats');
  }
}

// Export des nouveaux services
export const recolteService = new RecolteService();
export const parcelleService = new ParcelleService();
export const bassinService = new BassinService();
export const lotService = new LotService();
export const paiementService = new PaiementService();
export const bonLivraisonService = new BonLivraisonService();

export const api = {
  client: clientService,
  produit: produitService,
  commande: commandeService,
  facture: factureService,
  recolte: recolteService,
  parcelle: parcelleService,
  bassin: bassinService,
  lot: lotService,
  paiement: paiementService,
  bonLivraison: bonLivraisonService,
};

export default ApiService;