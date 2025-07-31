const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 Test de connexion avec Julio (mot de passe: julio1234)...');
    
    const response = await axios.post('http://localhost:3001/api/auth', {
      username: 'julio',
      password: 'julio1234'
    });
    
    console.log('✅ Connexion réussie !');
    console.log('Données utilisateur:', response.data);
    
  } catch (error) {
    console.error('❌ Erreur de connexion:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data);
    } else {
      console.error('Erreur réseau:', error.message);
    }
  }
}

// Attendre que le serveur démarre
setTimeout(testLogin, 2000); 