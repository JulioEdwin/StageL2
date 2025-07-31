const bcrypt = require('bcrypt');
const { pool } = require('./config/database');

async function updatePassword() {
  try {
    // Générer le hash pour julio1234
    const password = 'julio1234';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Hash généré pour julio1234:', hashedPassword);
    
    // Mettre à jour le mot de passe dans la base de données
    const [result] = await pool.execute(
      'UPDATE users SET password = ? WHERE username = ?',
      [hashedPassword, 'julio']
    );
    
    if (result.affectedRows > 0) {
      console.log('✅ Mot de passe mis à jour avec succès pour l\'utilisateur julio');
    } else {
      console.log('❌ Utilisateur julio non trouvé');
    }
    
    // Vérifier que la mise à jour a fonctionné
    const [users] = await pool.execute('SELECT username, password FROM users WHERE username = ?', ['julio']);
    if (users.length > 0) {
      console.log('✅ Utilisateur julio trouvé avec le nouveau hash');
      console.log('Hash en base:', users[0].password);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    process.exit(0);
  }
}

updatePassword(); 