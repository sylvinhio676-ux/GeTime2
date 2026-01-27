import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { disponibilityService } from '../../../services/disponibilityService';
import { subjectService } from '../../../services/subjectService';
import { etablishmentService } from '../../../services/etablishmentService';
import { specialtyService } from '@/services/specialtyService';
import { levelService } from '@/services/levelService';
import DisponibilityForm from './DisponibilityForm';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trash2, Edit3, CalendarClock, Search, 
  AlertCircle, CheckCircle2, X, Plus, Filter 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/Pagination';
import { useAuth } from '@/context/useAuth';

export default function DisponibilityList() {
  // États principaux
  const [disponibilities, setDisponibilities] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [etablishments, setEtablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI & Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [convertingId, setConvertingId] = useState(null);

  const { hasRole } = useAuth();
  const isTeacher = hasRole('teacher');

  // Notification système sécurisée
  const showNotify = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    const timer = setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Chargement initial des données avec sécurité
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [dispData, subData, etabData] = await Promise.all([
        disponibilityService.getAll(),
        subjectService.getAll(),
        etablishmentService.getAll()
      ]);
      setDisponibilities(Array.isArray(dispData) ? dispData : []);
      setSubjects(subData || []);
      setEtablishments(etabData || []);
    } catch (error) {
      showNotify("Erreur lors de la synchronisation des données", 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotify]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Filtrage optimisé (useMemo évite les recalculs inutiles)
  const filteredDisponibilities = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return disponibilities.filter((d) => {
      if (!term) return true;
      return (
        (d.day?.toLowerCase() || "").includes(term) ||
        (d.subject?.subject_name?.toLowerCase() || "").includes(term) ||
        (d.etablishment?.etablishment_name?.toLowerCase() || "").includes(term) ||
        (d.subject?.specialty?.specialty_name?.toLowerCase() || "").includes(term)
      );
    });
  }, [disponibilities, searchTerm]);

  // Pagination
  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredDisponibilities.length / PAGE_SIZE));
  const pagedDisponibilities = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredDisponibilities.slice(start, start + PAGE_SIZE);
  }, [filteredDisponibilities, page]);

  // Actions CRUD
  const handleSave = async (formData) => {
    try {
      if (editingData?.id) {
        await disponibilityService.update(editingData.id, formData);
        showNotify('Disponibilité mise à jour');
      } else {
        await disponibilityService.create(formData);
        showNotify('Disponibilité ajoutée');
      }
      setShowForm(false);
      setEditingData(null);
      loadInitialData();
    } catch (error) {
      showNotify(error.message || "Erreur d'enregistrement", 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirmer la suppression ?')) return;
    try {
      await disponibilityService.delete(id);
      showNotify('Supprimé avec succès');
      loadInitialData();
    } catch (error) {
      showNotify("Erreur de suppression", 'error');
    }
  };

  const handleConvert = async (id) => {
    if (convertingId) return;
    try {
      setConvertingId(id);
      await disponibilityService.convert(id);
      showNotify('Converti en programmation avec succès');
      loadInitialData();
    } catch (error) {
      showNotify("Échec de la conversion", 'error');
    } finally {
      setConvertingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Supprimer ${selectedIds.length} créneau(x) ?`)) return;
    setBulkDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => disponibilityService.delete(id)));
      showNotify('Créneaux supprimés');
      setSelectedIds([]);
      loadInitialData();
    } catch (error) {
      const message =
        error?.message ||
        error?.data?.message ||
        "Échec de la suppression groupée";
      showNotify(message, 'error');
    } finally {
      setBulkDeleting(false);
    }
  };

  // Sélection multiple
  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shrink-0">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Disponibilités</h1>
            <p className="text-muted-foreground text-xs md:text-sm font-medium uppercase tracking-[0.2em]">Gestion des créneaux</p>
          </div>
        </div>
        <Button
          onClick={() => { setEditingData(null); setShowForm(true); }}
          className="rounded-xl px-6 py-6 h-auto shadow-lg shadow-primary/20 gap-2 font-bold transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Ajouter un créneau
        </Button>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card p-5 rounded-[2rem] border border-border">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par matière, jour ou école..."
            className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-xl h-full border-dashed">
            <Filter className="w-4 h-4 mr-2" /> Filtres
          </Button>
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              className="flex-1 rounded-xl"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? 'Suppression...' : `Suppr. (${selectedIds.length})`}
            </Button>
          )}
        </div>
      </div>

      {/* LIST TABLE */}
      <div className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border text-[10px] uppercase font-black tracking-widest text-muted-foreground">
              <tr>
                <th className="px-6 py-5 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    disabled={bulkDeleting}
                    onChange={(e) => {
                      setSelectedIds(e.target.checked ? pagedDisponibilities.map(d => d.id) : []);
                    }}
                  />
                </th>
                <th className="px-6 py-5">Créneau</th>
                <th className="px-6 py-5">Matière & Niveau</th>
                <th className="px-6 py-5">Établissement</th>
                <th className="px-6 py-5 text-center">Statut</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr><td colSpan="6" className="p-12 text-center animate-pulse font-bold text-muted-foreground">Synchronisation en cours...</td></tr>
              ) : pagedDisponibilities.length === 0 ? (
                <tr><td colSpan="6" className="p-12 text-center text-muted-foreground italic">Aucune donnée trouvée</td></tr>
              ) : (
                pagedDisponibilities.map((disp) => (
                  <tr key={disp.id} className="group hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-5">
                      <input type="checkbox" checked={selectedIds.includes(disp.id)} onChange={() => toggleSelection(disp.id)} />
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-black text-foreground uppercase">{disp.day}</div>
                      <div className="text-[10px] font-bold text-muted-foreground">{disp.hour_star} - {disp.hour_end}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-foreground">{disp.subject?.subject_name || '—'}</div>
                      <div className="text-[9px] text-primary font-black uppercase">
                        {disp.subject?.specialty?.level?.name_level} • {disp.subject?.specialty?.specialty_name}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-muted-foreground font-medium text-xs italic">
                      {disp.etablishment?.etablishment_name || '—'}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Badge variant={disp.used ? "default" : "secondary"} className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase ${disp.used ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                        {disp.used ? 'Programmée' : 'Disponible'}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setEditingData(disp); setShowForm(true); }} className="h-8 w-8 hover:text-primary"><Edit3 className="w-4 h-4" /></Button>
                        {!isTeacher && (
                          <Button size="icon" variant="ghost" onClick={() => handleConvert(disp.id)} disabled={disp.used || convertingId === disp.id} className="h-8 w-8 text-emerald-600"><CheckCircle2 className="w-4 h-4" /></Button>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(disp.id)} className="h-8 w-8 text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border bg-muted/20">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-card rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
              <h3 className="font-black uppercase italic tracking-tighter">{editingData ? 'Modifier' : 'Nouveau'} Créneau</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-5 h-5" /></Button>
            </div>
            <div className="p-8">
              <DisponibilityForm
                initialData={editingData}
                subjects={subjects}
                etablishments={etablishments}
                onSubmit={handleSave}
                onCancel={() => setShowForm(false)}
                isLoading={loading}
              />
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {notification.show && (
        <div className={`fixed bottom-8 right-8 z-[200] flex items-center gap-3 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-right-10 ${
          notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <p className="text-xs font-black uppercase tracking-widest">{notification.message}</p>
        </div>
      )}
    </div>
  );
}
