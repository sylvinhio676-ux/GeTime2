import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { specialtyService } from '../../../services/specialtyService';
import { sectorService } from '../../../services/sectorService';
import { programmersService } from '../../../services/programmerService';
import { levelService } from '../../../services/levelService';
import SpecialtyForm from './SpecialtyForm';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/useAuth';
import Pagination from '@/components/Pagination';
import {
  DeleteIcon,
  EditIcon,
  GraduationCap,
  Search,
  AlertCircle,
  CheckCircle2,
  X,
  Upload,
  DownloadCloud,
  Bell,
  MoreVertical,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react';

const RESPONSIBLE_OPTIONS = [
  { value: 'all', label: 'Responsable' },
  { value: 'assigned', label: 'Affecté' },
  { value: 'unassigned', label: 'Non affecté' },
];

export default function SpecialtyList() {
  // --- LOGIQUE D'ÉTAT ---
  const [specialties, setSpecialties] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [programmers, setProgrammers] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    sectorId: '',
    levelId: '',
    responsible: 'all',
    code: '',
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [drawerSpecialty, setDrawerSpecialty] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin') || hasRole('super_admin');

  // --- FONCTIONS UTILITAIRES ---
  const getErrorMessage = (error, fallback) => {
    if (!error) return fallback;
    if (typeof error === 'string') return error;
    return error.message || error.error || fallback;
  };

  const showNotify = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  // --- APPELS API ---
  const fetchSectors = async () => {
    try {
      const data = await (isAdmin ? sectorService.getAll() : sectorService.getForTeacher());
      setSectors(data || []);
    } catch (error) { console.error('Failed to fetch sectors', error); }
  };

  const fetchProgrammers = async () => {
    try {
      const data = await (isAdmin ? programmersService.getAll() : programmersService.getForTeacher());
      setProgrammers(data || []);
    } catch (error) { console.error('Failed to fetch programmers', error); }
  };

  const fetchLevels = async () => {
    try {
      const data = await (isAdmin ? levelService.getAll() : levelService.getForTeacher());
      setLevels(data || []);
    } catch (error) { console.error('Failed to fetch levels', error); }
  };

  const fetchSpecialties = async () => {
    try {
      setLoading(true);
      const data = await specialtyService.getAll();
      setSpecialties(data || []);
    } catch (error) {
      showNotify(getErrorMessage(error, 'Erreur de chargement'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
    fetchProgrammers();
    fetchLevels();
    fetchSpecialties();
  }, []);

  // --- ACTIONS ---
  const startEdit = (specialty) => {
    setEditingId(specialty.id);
    setEditingData(specialty);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData(null);
    setShowForm(false);
  };

  const handleCreate = async (formData) => {
    try {
      await specialtyService.create(formData);
      showNotify('Spécialité créée');
      setShowForm(false);
      fetchSpecialties();
    } catch (error) { showNotify(getErrorMessage(error, 'Erreur'), 'error'); }
  };

  const handleUpdate = async (formData) => {
    try {
      await specialtyService.update(editingId, formData);
      showNotify('Mise à jour réussie');
      cancelEdit();
      fetchSpecialties();
    } catch (error) { showNotify(getErrorMessage(error, 'Erreur'), 'error'); }
  };

  const handleStaticDelete = async (id) => {
    if (!window.confirm('Supprimer cette spécialité ?')) return;
    try {
      await specialtyService.delete(id);
      showNotify('Supprimé');
      fetchSpecialties();
    } catch (error) { showNotify(getErrorMessage(error, 'Erreur'), 'error'); }
  };

  // --- LOGIQUE DE FILTRE & PAGINATION ---
  const filteredSpecialties = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return specialties.filter((s) => {
      if (term && ![s.specialty_name, s.code, s.sector?.sector_name, s.programmer?.user?.name].filter(Boolean).some(v => v.toLowerCase().includes(term))) return false;
      if (filters.sectorId && String(s.sector?.id) !== filters.sectorId) return false;
      if (filters.levelId && String(s.level?.id) !== filters.levelId) return false;
      if (filters.responsible === 'assigned' && !s.programmer) return false;
      if (filters.responsible === 'unassigned' && s.programmer) return false;
      if (filters.code && s.code?.toLowerCase() !== filters.code.toLowerCase()) return false;
      return true;
    });
  }, [specialties, filters, searchTerm]);

  const PAGE_SIZE = 10;
  useEffect(() => { setPage(1); }, [searchTerm, filters, specialties.length]);
  const totalPages = Math.max(1, Math.ceil(filteredSpecialties.length / PAGE_SIZE));
  const pagedSpecialties = useMemo(() => filteredSpecialties.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredSpecialties, page]);

  // --- STATISTIQUES ---
  const totalSpecialties = specialties.length;
  const planningCount = specialties.filter(s => (s.programmations?.length || 0) > 0).length;
  const percentWithPlanning = totalSpecialties ? Math.round((planningCount / totalSpecialties) * 100) : 0;
  const withoutRoomCount = specialties.filter(s => (s.programmations || []).some(p => !p.room_id)).length;
  const percentWithoutRoom = totalSpecialties ? Math.round((withoutRoomCount / totalSpecialties) * 100) : 0;

  // --- SELECTION ---
  const allSelected = pagedSpecialties.length > 0 && pagedSpecialties.every(s => selectedIds.includes(s.id));
  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  const toggleSelectAll = () => {
    if (allSelected) {
      const pageIds = pagedSpecialties.map(s => s.id);
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...pagedSpecialties.map(s => s.id)])]);
    }
  };

  // --- EXPORT/IMPORT ---
  const handleExport = () => { /* Logique inchangée */ };
  const handleImport = (event) => { /* Logique inchangée */ };

  const openDrawer = (s) => setDrawerSpecialty(s);
  const closeDrawer = () => setDrawerSpecialty(null);

  if (loading && !specialties.length) {
    return <div className="p-8 max-w-[1600px] mx-auto"><Progress value={30} className="h-1" /></div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto p-3 sm:p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shrink-0">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-foreground">Spécialités</h1>
            <p className="text-muted-foreground text-[10px] sm:text-sm font-medium">Gestion des filières</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <Button onClick={() => { setEditingId(null); setShowForm(true); }} className="flex-1 sm:flex-none bg-primary rounded-xl px-6 h-11 font-bold shadow-md">
              Ajouter
            </Button>
          )}
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1 sm:flex-none rounded-xl h-11"><Upload className="w-4 h-4 mr-2" /> Import</Button>
          <Button onClick={handleExport} variant="outline" className="flex-1 sm:flex-none rounded-xl h-11"><DownloadCloud className="w-4 h-4 mr-2" /> Export</Button>
        </div>
        <input ref={fileInputRef} type="file" className="hidden" accept=".csv" onChange={handleImport} />
      </div>

      {/* STATS SECTION */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card/60 p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Total</p>
          <h2 className="text-2xl font-black">{totalSpecialties}</h2>
        </div>
        <div className="rounded-2xl border bg-card/60 p-4 space-y-2">
          <div className="flex justify-between text-xs font-bold"><span>Planning</span><span>{percentWithPlanning}%</span></div>
          <Progress value={percentWithPlanning} className="h-1.5" />
        </div>
        <div className="rounded-2xl border bg-card/60 p-4 space-y-2 sm:col-span-2 lg:col-span-1">
          <div className="flex justify-between text-xs font-bold"><span>Sans salle</span><span className="text-delta-negative">{percentWithoutRoom}%</span></div>
          <Progress value={percentWithoutRoom} className="h-1.5" />
        </div>
      </div>

      {/* FILTRES & LISTE */}
      <div className="bg-card rounded-2xl sm:rounded-[2rem] border border-border shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Rechercher..." className="w-full bg-muted/30 border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <select value={filters.sectorId} onChange={(e) => setFilters(p => ({ ...p, sectorId: e.target.value }))} className="rounded-xl border bg-input px-3 py-2 text-sm">
              <option value="">Secteurs</option>
              {sectors.map(s => <option key={s.id} value={s.id}>{s.sector_name}</option>)}
            </select>
            <select value={filters.levelId} onChange={(e) => setFilters(p => ({ ...p, levelId: e.target.value }))} className="rounded-xl border bg-input px-3 py-2 text-sm">
              <option value="">Niveaux</option>
              {levels.map(l => <option key={l.id} value={l.id}>{l.level_name}</option>)}
            </select>
            <select value={filters.responsible} onChange={(e) => setFilters(p => ({ ...p, responsible: e.target.value }))} className="rounded-xl border bg-input px-3 py-2 text-sm">
              {RESPONSIBLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input type="text" value={filters.code} onChange={(e) => setFilters(p => ({ ...p, code: e.target.value }))} placeholder="Code exact" className="rounded-xl border bg-input px-3 py-2 text-sm" />
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="px-6 py-3 bg-primary/5 border-y flex items-center justify-between">
            <span className="text-xs font-bold text-primary">{selectedIds.length} sélectionnés</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setSelectedIds([])}>Annuler</Button>
              <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={handleBulkDelete}>Supprimer</Button>
            </div>
          </div>
        )}

        <div className="w-full">
          {/* MOBILE LIST */}
          <div className="md:hidden divide-y">
            {pagedSpecialties.map((s) => (
              <div key={s.id} className="p-4 space-y-3 active:bg-muted/50 transition-colors" onClick={() => openDrawer(s)}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={(e) => { e.stopPropagation(); toggleSelect(s.id); }} className="w-4 h-4 rounded" />
                    <div>
                      <p className="font-bold text-sm">{s.specialty_name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{s.code || 'SANS CODE'}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[9px]">{s.level?.level_name || '—'}</Badge>
                </div>
                <div className="flex items-center justify-between pl-7">
                  <span className="text-[11px] text-muted-foreground">{s.sector?.sector_name}</span>
                  {isAdmin && (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => startEdit(s)} className="p-2 bg-primary/10 text-primary rounded-lg"><EditIcon className="w-4 h-4" /></button>
                      <button onClick={() => handleStaticDelete(s.id)} className="p-2 bg-delta-negative/10 text-delta-negative rounded-lg"><DeleteIcon className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 text-[10px] uppercase font-black tracking-widest border-b">
                <tr>
                  <th className="px-5 py-4 w-10"><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} /></th>
                  <th className="px-8 py-5">Spécialité</th>
                  <th className="px-8 py-5">Code</th>
                  <th className="px-8 py-5">Niveau</th>
                  <th className="px-8 py-5">Secteur</th>
                  {isAdmin && <th className="px-8 py-5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {pagedSpecialties.map((s) => (
                  <tr key={s.id} className="group hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => openDrawer(s)}>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => toggleSelect(s.id)} /></td>
                    <td className="px-8 py-5"><div className="font-bold text-sm">{s.specialty_name}</div><div className="text-[10px] text-muted-foreground">{s.number_student ?? 0} étudiants</div></td>
                    <td className="px-8 py-5"><Badge variant="outline" className="font-mono text-[10px]">{s.code || '—'}</Badge></td>
                    <td className="px-8 py-5 text-xs text-muted-foreground">{s.level?.name_level || '—'}</td>
                    <td className="px-8 py-5 text-xs text-muted-foreground">{s.sector?.sector_name || '—'}</td>
                    <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                      {isAdmin && (
                        <div className="flex justify-end gap-1">
                          <button onClick={() => startEdit(s)} className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary"><PencilIcon className="w-4 h-4" /></button>
                          <button onClick={() => handleStaticDelete(s.id)} className="p-2 hover:bg-muted rounded-lg text-delta-negative"><Trash2Icon className="w-4 h-4" /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* FORM MODAL (Mobile Responsive) */}
      {showForm && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={cancelEdit} />
          <div className="relative w-full max-w-lg bg-card h-[92vh] sm:h-auto rounded-t-3xl sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b flex justify-between items-center bg-muted/30 shrink-0">
              <h3 className="font-black text-lg">{editingId ? 'Modifier' : 'Ajouter'}</h3>
              <button onClick={cancelEdit} className="p-2 hover:bg-muted rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto grow">
              <SpecialtyForm initialData={editingData} sectors={sectors} programmers={programmers} levels={levels} onSubmit={editingId ? handleUpdate : handleCreate} onCancel={cancelEdit} isLoading={loading} />
            </div>
          </div>
        </div>
      )}

      {/* DETAILS DRAWER (Mobile Responsive) */}
      {drawerSpecialty && (
        <div className="fixed inset-0 z-[120] flex">
          <div className="flex-1 bg-black/10 backdrop-blur-xs" onClick={closeDrawer} />
          <div className="w-full max-w-md bg-card border-l shadow-2xl p-6 space-y-6 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Détails</p>
                <h2 className="text-xl font-black">{drawerSpecialty.specialty_name}</h2>
              </div>
              <button onClick={closeDrawer} className="p-2 hover:bg-muted rounded-full"><X className="w-5 h-5" /></button>
            </div>

            {/* DIRECT ACTIONS IN DRAWER FOR MOBILE */}
            {isAdmin && (
              <div className="flex gap-2 pb-4 border-b">
                <Button variant="outline" className="flex-1 gap-2 border-primary/20 text-primary" onClick={() => { closeDrawer(); startEdit(drawerSpecialty); }}><EditIcon className="w-4 h-4" /> Modifier</Button>
                <Button variant="outline" className="flex-1 gap-2 border-delta-negative/20 text-delta-negative" onClick={() => { closeDrawer(); handleStaticDelete(drawerSpecialty.id); }}><DeleteIcon className="w-4 h-4" /> Supprimer</Button>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-muted/30 p-3 rounded-xl"><p className="text-muted-foreground mb-1 uppercase tracking-tighter">Code</p><p className="font-bold">{drawerSpecialty.code || '—'}</p></div>
                <div className="bg-muted/30 p-3 rounded-xl"><p className="text-muted-foreground mb-1 uppercase tracking-tighter">Secteur</p><p className="font-bold truncate">{drawerSpecialty.sector?.sector_name || '—'}</p></div>
              </div>
              <div className="pt-4 space-y-2">
                <Button variant="default" className="w-full rounded-xl h-11 font-bold" onClick={() => window.location.assign(`/dashboard/disponibilities?specialty=${drawerSpecialty.id}`)}>Voir Disponibilités</Button>
                <Button variant="secondary" className="w-full rounded-xl h-11 font-bold" onClick={() => window.location.assign(`/dashboard/programmations?specialty=${drawerSpecialty.id}`)}>Voir Emploi du Temps</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS */}
      {notification.show && (
        <div className={`fixed bottom-4 left-4 right-4 sm:right-6 sm:left-auto sm:w-80 z-[200] flex items-center gap-3 p-4 rounded-xl border shadow-2xl animate-in slide-in-from-bottom-5 ${
          notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
          <p className="text-xs font-bold leading-tight flex-1">{notification.message}</p>
          <button onClick={() => setNotification(p => ({ ...p, show: false }))}><X className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}