import React, { useEffect, useMemo, useState } from 'react';
import { userService } from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Search, AlertCircle, CheckCircle2, X, Pencil, Trash2, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Pagination from '@/components/Pagination';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'teacher',
    password: '',
    password_confirmation: '',
  });
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const isSuperAdmin = hasRole('super_admin');
  const [page, setPage] = useState(1);

  const showNotify = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data || []);
    } catch (error) {
      showNotify('Erreur de chargement des utilisateurs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter((user) => {
      const roles = (user.roles || []).map((r) => r.name);
      if (!isSuperAdmin && roles.includes('super_admin')) {
        return false;
      }
      const matchesRole = roleFilter === 'all' || roles.includes(roleFilter);
      const matchesSearch =
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phone?.toLowerCase().includes(term);
      return matchesRole && matchesSearch;
    });
  }, [users, searchTerm, roleFilter]);
  const PAGE_SIZE = 5;
  useEffect(() => {
    setPage(1);
  }, [searchTerm, roleFilter, users.length]);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, page]);

  if (loading && users.length === 0) {
    return <div className="p-6 max-w-6xl mx-auto"><Progress value={30} className="h-1" /></div>;
  }

  const startEdit = (user) => {
    const roles = (user.roles || []).map((r) => r.name);
    const primaryRole = roles[0] || 'teacher';
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: primaryRole,
      password: '',
      password_confirmation: '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'teacher',
      password: '',
      password_confirmation: '',
    });
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...formData };
      if (editingUser) {
        if (!payload.password) {
          delete payload.password;
          delete payload.password_confirmation;
        }
        await userService.update(editingUser.id, payload);
        showNotify('Utilisateur mis à jour');
      } else {
        await userService.create(payload);
        showNotify('Utilisateur créé');
      }
      resetForm();
      fetchUsers();
    } catch (error) {
      showNotify('Erreur lors de l’enregistrement', 'error');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Supprimer ${user.name} ?`)) return;
    try {
      await userService.delete(user.id);
      showNotify('Utilisateur supprimé');
      fetchUsers();
    } catch (error) {
      showNotify('Erreur de suppression', 'error');
    }
  };

  const canDeleteUser = (user) => {
    const roles = (user.roles || []).map((r) => r.name);
    if (roles.includes('super_admin')) return false;
    if (roles.includes('admin')) return isSuperAdmin;
    return isAdmin || isSuperAdmin;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Utilisateurs</h1>
            <p className="text-slate-500 text-xs md:text-sm font-medium">Gestion des comptes et rôles</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-6 h-auto shadow-md gap-2 font-bold transition-all active:scale-95">
            <Plus className="w-5 h-5" /> Ajouter
          </Button>
          <Button onClick={fetchUsers} variant="outline" className="rounded-xl px-6 py-6 h-auto">
            Actualiser
          </Button>
        </div>
      </div>

      {notification.show && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom-10 ${
          notification.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <p className="text-sm font-bold">{notification.message}</p>
          <button onClick={() => setNotification({ ...notification, show: false })} className="ml-4 opacity-50"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex flex-col lg:flex-row gap-4 items-center justify-between bg-slate-50/30">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email..."
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full lg:w-auto px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Admin</option>
              <option value="teacher">Enseignant</option>
              <option value="programmer">Programmeur</option>
            </select>
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none font-bold px-4 py-1">
              {filteredUsers.length} Utilisateurs
            </Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-slate-400">
              <Users className="w-12 h-12 mb-3 opacity-10" />
              <p className="text-sm font-bold">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[980px]">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5">Utilisateur</th>
                  <th className="px-8 py-5">Téléphone</th>
                  <th className="px-8 py-5">Rôle</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pagedUsers.map((user) => {
                  const roles = (user.roles || []).map((r) => r.name).filter((role) => role !== 'super_admin');
                  return (
                    <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </td>
                      <td className="px-8 py-5 text-slate-500 font-medium">{user.phone || '—'}</td>
                      <td className="px-8 py-5">
                        {roles.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {roles.map((role) => (
                              <Badge key={role} variant="secondary" className="bg-indigo-50 text-indigo-700 border-none font-bold px-3 py-1">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(user)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {canDeleteUser(user) && (
                            <button
                              onClick={() => handleDelete(user)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={resetForm} />
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                  <Users className="w-4 h-4" />
                </div>
                {editingUser ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
              </h3>
              <button onClick={resetForm} className="text-slate-400 p-2"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-400">Nom</label>
                <input
                  className="mt-2 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-400">Email</label>
                <input
                  type="email"
                  className="mt-2 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-400">Téléphone</label>
                <input
                  className="mt-2 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-400">Rôle</label>
                <select
                  className="mt-2 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="teacher">Enseignant</option>
                  <option value="programmer">Programmeur</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400">Mot de passe</label>
                  <input
                    type="password"
                    className="mt-2 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400">Confirmation</label>
                  <input
                    type="password"
                    className="mt-2 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                    required={!editingUser}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" className="text-slate-500" onClick={resetForm}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 font-bold">
                  {editingUser ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
