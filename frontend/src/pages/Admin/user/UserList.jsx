import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { userService } from '@/services/userService';
import { etablishmentService } from '@/services/etablishmentService';
import { campusService } from '@/services/campusService';
import { schoolService } from '@/services/schoolService';
import { sectorService } from '@/services/sectorService';
import { specialtyService } from '@/services/specialtyService';
import { subjectService } from '@/services/subjectService';
import { roomService } from '@/services/roomService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, Search, X, Pencil, Trash2, Plus, Mail, Phone, 
  RefreshCcw, Download, Upload, History, Bell, BarChart3, Wifi, WifiOff, PhoneCall
} from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import Pagination from '@/components/Pagination';
import Select from 'react-select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, ResponsiveContainer } from 'recharts';

export default function UserList() {
  // States
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Filters state (grouped)
  const [filters, setFilters] = useState({
    establishment: null,
    campus: null,
    school: null,
    sector: null,
    specialty: null
  });

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', role: 'teacher',
    assignedSubjects: [], assignedRooms: [], assignedSpecialties: []
  });

  const [showStats, setShowStats] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const { hasRole } = useAuth();
  const isSuperAdmin = hasRole('super_admin');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Data for Selects
  const [options, setOptions] = useState({
    establishments: [], campuses: [], schools: [], sectors: [], specialties: [], subjects: [], rooms: []
  });

  const showNotify = useCallback((message, type = 'success') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users', error);
      showNotify('Erreur de chargement des utilisateurs', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotify]);

  const loadDependencies = useCallback(async () => {
    try {
      const [estabs, camps, schs, sects, specs, subs, rms] = await Promise.all([
        etablishmentService.getAll(), campusService.getAll(), schoolService.getAll(),
        sectorService.getAll(), specialtyService.getAll(), subjectService.getAll(), roomService.getAll()
      ]);
      setOptions({
        establishments: estabs || [], campuses: camps || [], schools: schs || [],
        sectors: sects || [], specialties: specs || [], subjects: subs || [], rooms: rms || []
      });
    } catch (err) {
      console.error('Failed to load dependencies', err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    loadDependencies();
  }, [fetchUsers, loadDependencies]);

  // Online status management
  useEffect(() => {
    const toggleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', toggleStatus);
    window.addEventListener('offline', toggleStatus);
    return () => {
      window.removeEventListener('online', toggleStatus);
      window.removeEventListener('offline', toggleStatus);
    };
  }, []);

  // Advanced Filtering Logic
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const userRoles = (user.roles || []).map((r) => r.name);
      if (!isSuperAdmin && userRoles.includes('super_admin')) return false;

      const matchesRole = roleFilter === 'all' || userRoles.includes(roleFilter);
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEst = !filters.establishment || user.establishment_id === filters.establishment.value;
      const matchesCamp = !filters.campus || user.campus_id === filters.campus.value;
      const matchesSpec = !filters.specialty || user.specialties?.some(s => s.id === filters.specialty.value);

      return matchesRole && matchesSearch && matchesEst && matchesCamp && matchesSpec;
    });
  }, [users, searchTerm, roleFilter, filters, isSuperAdmin]);

  const pagedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, page]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  const stats = useMemo(() => {
    const roleStats = {};
    filteredUsers.forEach(u => (u.roles || []).forEach(r => roleStats[r.name] = (roleStats[r.name] || 0) + 1));
    return Object.entries(roleStats).map(([name, value]) => ({ name, value }));
  }, [filteredUsers]);

  const handleAction = async (asyncFn, successMsg) => {
    setActionLoading(true);
    try {
      await asyncFn();
      showNotify(successMsg);
      fetchUsers();
    } catch (err) {
      console.error('Action failed', err);
      showNotify('Une erreur est survenue', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const action = editingUser ? () => userService.update(editingUser.id, formData) : () => userService.create(formData);
    handleAction(action, editingUser ? 'Utilisateur mis à jour' : 'Utilisateur créé');
    setShowForm(false);
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '0.75rem',
      borderColor: 'hsl(var(--border))',
      minHeight: '42px',
      backgroundColor: 'hsl(var(--card))',
    })
  };

  return (
    <div className="max-w-[1600px] mx-auto p-3 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row justify-between gap-4 bg-card p-5 rounded-3xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Gestion Utilisateurs</h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className="text-xs font-medium text-muted-foreground">{isOnline ? 'Serveur Connecté' : 'Mode Hors-ligne'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
            <Button variant="outline" size="icon" onClick={() => setShowStats(!showStats)} className="rounded-xl"><BarChart3 className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon" onClick={fetchUsers} className="rounded-xl"><RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
            <Button variant="outline" onClick={() => {}} className="rounded-xl gap-2"><Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span></Button>
            <Button onClick={() => { setEditingUser(null); setShowForm(true); }} className="bg-primary hover:opacity-90 rounded-xl gap-2 px-6 shadow-md">
                <Plus className="w-5 h-5" /> <span>Nouveau</span>
            </Button>
        </div>
      </div>

      {/* STATS VISUALIZATION */}
      {showStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-4">
          <div className="lg:col-span-2 bg-card p-6 rounded-3xl border border-border h-[300px]">
            <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-muted-foreground">Répartition par Rôles</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex flex-col justify-center items-center text-center">
             <Users className="w-12 h-12 text-primary mb-4" />
             <span className="text-4xl font-black text-primary">{filteredUsers.length}</span>
             <span className="text-sm font-medium text-primary/60">Utilisateurs filtrés</span>
          </div>
        </div>
      )}

      {/* FILTERS BAR */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border-none rounded-xl text-sm focus:ring-2 ring-primary/20 outline-none transition-all"
              placeholder="Rechercher un nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select 
            placeholder="Établissement"
            options={options.establishments.map(e => ({ value: e.id, label: e.establishment_name }))}
            styles={selectStyles}
            onChange={(val) => setFilters({...filters, establishment: val})}
            isClearable
          />
          <Select 
            placeholder="Campus"
            options={options.campuses.map(c => ({ value: c.id, label: c.campus_name }))}
            styles={selectStyles}
            onChange={(val) => setFilters({...filters, campus: val})}
            isClearable
          />
          <select 
            className="rounded-xl border-border bg-card text-sm font-semibold px-3 py-2 outline-none focus:ring-2 ring-primary/20"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Admin</option>
            <option value="teacher">Enseignant</option>
          </select>
        </div>
      </div>

      {/* MAIN TABLE / LIST */}
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        {loading ? (
            <div className="p-20 flex flex-col items-center gap-4">
                <Progress value={60} className="w-48 h-1" />
                <p className="text-xs text-muted-foreground animate-pulse">Chargement des données...</p>
            </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30 border-b border-border text-[10px] uppercase font-black text-muted-foreground tracking-widest">
                    <th className="px-6 py-4 text-left">Utilisateur</th>
                    <th className="px-6 py-4 text-left">Contact</th>
                    <th className="px-6 py-4 text-left">Accès</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {pagedUsers.map(user => (
                    <tr key={user.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {user.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-sm">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-1 text-muted-foreground">
                          <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> {user.email}</div>
                          {user.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {user.phone}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {(user.roles || []).map(r => (
                            <Badge key={r.name} variant="secondary" className="text-[9px] font-bold px-2 py-0">{r.name}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => { setEditingUser(user); setFormData({...user, role: user.roles?.[0]?.name}); setShowForm(true); }} className="h-8 w-8 text-primary"><Pencil className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => {}} className="h-8 w-8 text-muted-foreground"><Bell className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => {}} className="h-8 w-8 text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border/40">
              {pagedUsers.map(user => (
                <div key={user.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs">{user.name?.slice(0,2).toUpperCase()}</div>
                      <div>
                        <p className="font-bold text-sm">{user.name}</p>
                        <p className="text-[10px] text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <Button size="icon" variant="ghost" className="h-8 w-8"><Pencil className="w-4 h-4" /></Button>
                       <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {(user.roles || []).map(r => <Badge key={r.name} className="text-[8px]">{r.name}</Badge>)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-border bg-muted/10">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-card border border-border rounded-t-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]">
             <div className="p-6 border-b border-border flex justify-between items-center">
                <h2 className="font-black italic uppercase tracking-tight">{editingUser ? 'Editer Profil' : 'Nouveau Compte'}</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="rounded-full"><X className="w-5 h-5" /></Button>
             </div>
             <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Nom Complet</label>
                    <input required className="w-full px-4 py-2.5 bg-muted/50 rounded-xl text-sm border-none outline-none focus:ring-2 ring-primary/20" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Email Professionnel</label>
                    <input type="email" required className="w-full px-4 py-2.5 bg-muted/50 rounded-xl text-sm border-none outline-none focus:ring-2 ring-primary/20" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Rôle</label>
                      <select className="w-full px-4 py-2.5 bg-muted/50 rounded-xl text-sm border-none outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="teacher">Enseignant</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Téléphone</label>
                      <input className="w-full px-4 py-2.5 bg-muted/50 rounded-xl text-sm border-none outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Matières</label>
                      <Select 
                        isMulti 
                        options={options.subjects.map(s => ({ value: s.id, label: s.subject_name }))} 
                        styles={selectStyles}
                        value={formData.assignedSubjects}
                        onChange={v => setFormData({...formData, assignedSubjects: v})}
                      />
                  </div>
                </div>
                <div className="pt-4">
                  <Button disabled={actionLoading} type="submit" className="w-full bg-primary h-12 rounded-xl font-bold text-white shadow-lg">
                    {actionLoading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : (editingUser ? 'Enregistrer les modifications' : 'Créer le compte')}
                  </Button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
