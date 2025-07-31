import React, { useState } from 'react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [editingUserId, setEditingUserId] = useState(null);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Erreur lors du chargement des utilisateurs');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Erreur inconnue');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle add or update user
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let res;
      if (editingUserId) {
        res = await fetch(`/api/users/${editingUserId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
      } else {
        res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: form.username,
            email: form.email,
            password: form.password
          })
        });
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Erreur lors de la sauvegarde');
      }
      setForm({ username: '', email: '', password: '' });
      setEditingUserId(null);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Erreur inconnue');
    }
  };

  // Handle delete user
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    setError('');
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Erreur inconnue');
    }
  };

  // Handle edit user
  const handleEdit = (user) => {
    setForm({
      username: user.username,
      email: user.email,
      password: ''
    });
    setEditingUserId(user._id);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setForm({ username: '', email: '', password: '' });
    setEditingUserId(null);
  };

  // Filtered users
  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Gestion des utilisateurs</h2>

      <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            name="username"
            placeholder="Nom d'utilisateur"
            value={form.username}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 flex-1"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 flex-1"
          />
          <input
            type="password"
            name="password"
            placeholder={editingUserId ? "Nouveau mot de passe (laisser vide pour inchangé)" : "Mot de passe"}
            value={form.password}
            onChange={handleChange}
            className="border rounded px-3 py-2 flex-1"
            required={!editingUserId}
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingUserId ? 'Mettre à jour' : 'Ajouter'}
          </button>
          {editingUserId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Annuler
            </button>
          )}
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Nom d'utilisateur</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Créé le</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">Aucun utilisateur trouvé.</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td className="py-2 px-4 border-b">{user.username}</td>
                    <td className="py-2 px-4 border-b">{user.email}</td>
                    <td className="py-2 px-4 border-b">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
                    </td>
                    <td className="py-2 px-4 border-b flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
