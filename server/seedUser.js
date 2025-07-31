const bcrypt = require('bcrypt');
const User = require('./models/User');

async function addJulioEdwin() {
  try {
    const passwordHash = await bcrypt.hash('julio123', 10);
    const [user, created] = await User.findOrCreate({
      where: { username: 'Julio Edwin' },
      defaults: {
        email: 'julioedwin@gmail.com',
        password_hash: passwordHash, // le champ du modèle est 'password_hash'
        role: 'admin',
        full_name: 'Julio Edwin',
        phone: '+261320000000',
        created_at: new Date(),
        updated_at: new Date(),
      }
    });
    if (created) {
      console.log('Utilisateur Julio Edwin ajouté !');
    } else {
      console.log('Utilisateur Julio Edwin existe déjà.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de l\'ajout de l\'utilisateur:', err);
    process.exit(1);
  }
}

addJulioEdwin(); 