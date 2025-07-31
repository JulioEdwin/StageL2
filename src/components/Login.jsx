import React, { useState } from 'react';
import axios from 'axios';

// Utiliser la variable d'environnement pour l'URL de l'API ou le port backend par défaut
// Correction : éviter l'erreur "process is not defined" côté navigateur
const API_URL = (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL)
  ? process.env.REACT_APP_API_URL
  : 'http://localhost:3001/api/auth';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Appel API vers le backend pour authentification
      const res = await axios.post(API_URL, { username, password });
      setError('');
      if (onLogin) onLogin(res.data);
    } catch (err) {
      // Gestion d'erreur améliorée
      let errorMessage = "Nom d'utilisateur ou mot de passe incorrect";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(`Erreur de connexion : ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-yellow-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-red-900 mb-6 text-center">Connexion Administrateur</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="username">
              Nom d&apos;utilisateur
            </label>
            <input
              id="username"
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="password">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          <button
            type="submit"
            className="w-full bg-red-800 text-yellow-400 font-semibold py-2 rounded-lg hover:bg-red-900 transition"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;