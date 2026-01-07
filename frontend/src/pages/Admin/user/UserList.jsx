import React, { useEffect, useMemo, useState } from 'react';
import { userService } from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Pencil, 
  Trash2, 
  Plus, 
  Mail, 
  Phone,
  Filter,
  RefreshCcw,
  UserPlus,
  PhoneCall
} from 'lucide-react';
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
      showNotify('Erreur de chargement', 'error');
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
      if (!isSuperAdmin && roles.includes('super_admin')) return false;
      const matchesRole = roleFilter === 'all' || roles.includes(roleFilter);
      const matchesSearch =
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phone?.toLowerCase().includes(term);
      return matchesRole && matchesSearch;
    });
  }, [users, searchTerm, roleFilter, isSuperAdmin]);

  const PAGE_SIZE = 10;
  useEffect(() => { setPage(1); }, [searchTerm, roleFilter, users.length]);
  
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, page]);

  const startEdit = (user) => {
    const roles = (user.roles || []).map((r) => r.name);
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: roles[0] || 'teacher',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', phone: '', role: 'teacher' });
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingUser) {
        await userService.update(editingUser.id, formData);
        showNotify('Utilisateur mis à jour');
      } else {
        await userService.create(formData);
        showNotify('Utilisateur créé');
      }
      resetForm();
      fetchUsers();
    } catch (error) {
      showNotify("Erreur d'enregistrement", "error");
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

  if (loading && users.length === 0) {
    return <div className="p-4 md:p-8 max-w-[1600px] mx-auto"><Progress value={40} className="h-1 bg-slate-100" /></div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-600 via-slate-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Utilisateurs</h1>
            <p className="text-slate-500 text-xs md:text-sm font-medium">Gestion des comptes et accès</p>
          </div>
        </div>
        <div className="flex gap-3">
            <Button 
                onClick={fetchUsers} 
                variant="outline" 
                className="rounded-xl px-4 py-6 h-auto border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
            >
                <RefreshCcw className="w-5 h-5" />
            </Button>
            <Button 
                onClick={() => setShowForm(true)} 
                className="bg-blue-700 hover:bg-blue-800 text-white rounded-xl px-6 py-6 h-auto shadow-md gap-2 font-bold transition-all active:scale-95"
            >
                <Plus className="w-5 h-5" /> Ajouter
            </Button>
        </div>
      </div>

      {/* --- FILTRES & TABLEAU --- */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex flex-col lg:flex-row gap-4 items-center justify-between bg-slate-50/30">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un nom ou email..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-slate-50 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full lg:w-auto pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 focus:ring-4 focus:ring-slate-50 outline-none appearance-none cursor-pointer"
                >
                <option value="all">Tous les rôles</option>
                <option value="admin">Admin</option>
                <option value="teacher">Enseignant</option>
                <option value="programmer">Programmeur</option>
                </select>
            </div>
            <Badge variant="secondary" className="hidden sm:flex bg-white border-slate-200 text-slate-500 font-bold px-4 py-1.5 rounded-full uppercase text-[10px] tracking-widest whitespace-nowrap">
              {filteredUsers.length} Membres
            </Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-slate-300">
              <Users className="w-12 h-12 mb-3 opacity-10" />
              <p className="font-bold text-slate-400 text-sm">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5">Identité</th>
                  <th className="px-8 py-5">Contact</th>
                  <th className="px-8 py-5">Rôles</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pagedUsers.map((user) => {
                  const roles = (user.roles || []).map((r) => r.name).filter(n => n !== 'super_admin');
                  return (
                    <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-gradient-to-br from-slate-600 via-slate-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 font-black text-xs tracking-tighter uppercase">
                            {user.name?.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-base md:text-lg tracking-tight leading-tight">
                              {user.name}
                            </div>
                            <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                              <span className="text-slate-400">#</span>{user.id}
                              <span className="w-1 h-1 rounded-full bg-slate-200" />
                              <span className="font-medium">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                                <Mail className="w-3 h-3 text-slate-400" /> {user.email}
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Phone className="w-3 h-3 text-slate-400" /> {user.phone}
                                </div>
                            )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-wrap gap-1.5">
                          {roles.map((role) => (
                            <Badge key={role} className="bg-slate-50 hover:bg-slate-100 text-slate-700 border-none font-black text-[9px] uppercase tracking-tighter px-2.5 py-0.5 rounded-md">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-1.5 transition-opacity">
                          <button onClick={() => startEdit(user)} className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          {canDeleteUser(user) && (
                            <button onClick={() => handleDelete(user)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <a href={`mailto:${user.email}`} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                            <Mail className="w-4 h-4" />
                          </a>
                          {user.phone && (
                            <a href={`tel:${user.phone}`} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                              <PhoneCall className="w-4 h-4" />
                            </a>
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

      {/* --- FORM MODAL --- */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={resetForm} />
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-500 to-purple-500 flex items-center justify-center text-white">
                  <UserPlus className="w-4 h-4" />
                </div>
                {editingUser ? 'Modifier le profil' : 'Nouvel utilisateur'}
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid gap-5">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nom complet</label>
                    <input
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-slate-50 outline-none transition-all"
                    value={formData.name}
                    placeholder="ex: Jean Dupont"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email professionnel</label>
                    <input
                    type="email"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-slate-50 outline-none transition-all"
                    value={formData.email}
                    placeholder="jean@ecole.com"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Téléphone</label>
                        <input
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-slate-50 outline-none transition-all"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Rôle système</label>
                        <select
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-slate-50 outline-none transition-all appearance-none"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="admin">Administrateur</option>
                            <option value="teacher">Enseignant</option>
                            <option value="programmer">Programmeur</option>
                        </select>
                    </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" className="text-slate-500 font-bold rounded-xl" onClick={resetForm}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white rounded-xl px-8 py-3 h-auto font-black shadow-lg shadow-slate-200 transition-all active:scale-95">
                  {editingUser ? 'Enregistrer les modifications' : 'Créer le compte'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- NOTIFICATIONS --- */}
      {notification.show && (
        <div className={`fixed bottom-8 right-8 z-[110] flex items-center gap-3 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom-10 ${
          notification.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <p className="text-sm font-bold">{notification.message}</p>
          <button onClick={() => setNotification({ ...notification, show: false })} className="ml-2 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
