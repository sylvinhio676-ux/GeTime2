import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { subjectService } from '../../../services/subjectService';
import { teacherService } from '../../../services/teacherService';
import { specialtyService } from '../../../services/specialtyService';
import { sectorService } from '@/services/sectorService';
import { levelService } from '@/services/levelService';
import SubjectForm from './SubjectForm';
import QuotaAlert from '@/components/QuotaAlert';
import {
  BookOpen, Plus, Search, Pencil, Trash2, X, AlertCircle, CheckCircle2, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/useAuth';
import Pagination from '@/components/Pagination';

export default function SubjectList() {
  // --- ÉTATS DES DONNÉES ---
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [quotas, setQuotas] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false); // Loader spécifique pour le form

  // --- ÉTATS DES FILTRES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');

  // --- ÉTATS UI ---
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [page, setPage] = useState(1);

  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin') || hasRole('super_admin');

  // --- ACTIONS ---
  const showNotify = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [subjectsData, teachersData, specialtiesData, quotasData, sectorsData, levelsData] =
        await Promise.all([
          subjectService.getAll(),
          teacherService.getAll(),
          specialtyService.getAll(),
          subjectService.getQuotaStatus(),
          isAdmin ? sectorService.getAll() : sectorService.getForTeacher(),
          isAdmin ? levelService.getAll() : levelService.getForTeacher(),
        ]);

      setSubjects(subjectsData || []);
      setTeachers(teachersData || []);
      setSpecialties(specialtiesData || []);
      setQuotas(quotasData?.subjects || []);
      setSectors(sectorsData || []);
      setLevels(levelsData || []);
    } catch (err) {
      console.error("Erreur de chargement:", err);
      showNotify('Erreur de chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, showNotify]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleFormSubmit = async (formData) => {
    try {
      setSubmitLoading(true);
      if (editingData) {
        await subjectService.update(editingData.id, formData);
        showNotify('Matière mise à jour avec succès');
      } else {
        await subjectService.create(formData);
        showNotify('Matière créée avec succès');
      }
      setShowForm(false);
      setEditingData(null);
      // On rafraîchit tout pour voir le changement de quota/statut
      await fetchInitialData();
    } catch (err) {
      console.error(err);
      throw err; // On laisse le SubjectForm gérer l'affichage de l'erreur interne
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette matière ?')) {
      try {
        await subjectService.delete(id);
        showNotify('Matière supprimée');
        setSubjects(prev => prev.filter(s => s.id !== id));
        // Optionnel : refresh quotas après suppression
        const quotasData = await subjectService.getQuotaStatus();
        setQuotas(quotasData?.subjects || []);
      } catch (err) {
        console.error(err);
        showNotify('Erreur lors de la suppression', 'error');
      }
    }
  };

  // --- LOGIQUE DE FILTRAGE ET CALCULS ---
  const getQuotaForSubject = useCallback((subjectId, teacherId) => {
    // 1. Chercher dans l'état quotas (calculé par le backend)
    // On cherche par subject_id car parfois teacher_id peut être nul en base au début
    const q = quotas.find(item => Number(item.subject_id) === Number(subjectId));
    
    // 2. Chercher la matière elle-même pour avoir le total théorique
    const subject = subjects.find(s => Number(s.id) === Number(subjectId));

    // 3. Récupérer les valeurs avec des solutions de repli (fallbacks)
    const total = Number(q?.total_quota || subject?.total_hour || 0);
    const used = Number(q?.used_quota || 0);
    const percentage = total > 0 ? (used / total) * 100 : 0;

    return {
      total_quota: total,
      used_quota: used,
      remaining_quota: Math.max(0, total - used),
      status: q?.status || subject?.status || 'not_programmed',
      percentage_used: percentage
    };
  }, [quotas, subjects]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => {
      const matchesSearch = s.subject_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || String(s.status) === String(statusFilter);
      const specId = s.specialty_id || s.specialty?.id;
      const matchesSpecialty = !specialtyFilter || String(specId) === String(specialtyFilter);
      const secId = s.specialty?.sector_id || s.specialty?.sector?.id;
      const matchesSector = !sectorFilter || String(secId) === String(sectorFilter);
      const lvlId = s.specialty?.level_id || s.specialty?.level?.id;
      const matchesLevel = !levelFilter || String(lvlId) === String(levelFilter);

      return matchesSearch && matchesStatus && matchesSpecialty && matchesSector && matchesLevel;
    });
  }, [subjects, searchTerm, statusFilter, specialtyFilter, sectorFilter, levelFilter]);

  // Pagination
  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredSubjects.length / PAGE_SIZE));
  const pagedSubjects = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredSubjects.slice(start, start + PAGE_SIZE);
  }, [filteredSubjects, page]);

  useEffect(() => { setPage(1); }, [searchTerm, statusFilter, specialtyFilter, sectorFilter, levelFilter]);

  if (loading && subjects.length === 0) {
    return <div className="p-8 flex justify-center items-center h-64"><Progress value={45} className="w-1/2 h-1" /></div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6">
      {/* HEADER & FILTRES identiques à ton code... */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-[2rem] border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black">Matières</h1>
            <p className="text-muted-foreground text-xs md:text-sm font-medium">Gestion du programme académique</p>
          </div>
        </div>
        {isAdmin && (
          <Button onClick={() => { setEditingData(null); setShowForm(true); }} className="rounded-xl py-6 md:py-2">
            <Plus className="w-4 h-4 mr-2" /> Nouvelle matière
          </Button>
        )}
      </div>

      <div className="bg-card p-6 rounded-[2rem] border shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input 
            type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..." className="w-full pl-10 pr-4 py-3 bg-muted/50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 bg-muted/50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">Tous les statuts</option>
          <option value="in_progress">En cours</option>
          <option value="completed">Terminées</option>
          <option value="not_programmed">Non programmées</option>
        </select>
        <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} className="px-4 py-3 bg-muted/50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">Tous les secteurs</option>
          {sectors.map(s => <option key={s.id} value={s.id}>{s.sector_name}</option>)}
        </select>
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="px-4 py-3 bg-muted/50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">Tous les niveaux</option>
          {levels.map(l => <option key={l.id} value={l.id}>{l.name_level}</option>)}
        </select>
        <select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)} className="px-4 py-3 bg-muted/50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">Toutes spécialités</option>
          {specialties.map(sp => <option key={sp.id} value={sp.id}>{sp.specialty_name}</option>)}
        </select>
      </div>

      {/* TABLEAU */}
      <div className="bg-card rounded-[2rem] border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50 text-[10px] uppercase font-black tracking-widest border-b border-border/60">
              <tr>
                <th className="px-6 py-4 text-muted-foreground/80">Matière</th>
                <th className="px-6 py-4 text-muted-foreground/80">Quotas (U/T/R)</th>
                <th className="px-6 py-4 text-muted-foreground/80">Statut de progression</th>
                <th className="px-6 py-4 text-muted-foreground/80">Spécialité</th>
                {isAdmin && <th className="px-6 py-4 text-right text-muted-foreground/80">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {pagedSubjects.length > 0 ? pagedSubjects.map((s) => {
                const q = getQuotaForSubject(s.id, s.teacher_id);
                const displayStatus = s.status || q.status; 

                return (
                  <tr key={s.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                       <p className="font-bold text-sm text-foreground">{s.subject_name}</p>
                       <p className="text-[10px] text-muted-foreground italic">{s.teacher?.user?.name || 'Aucun enseignant'}</p>
                    </td>
                   <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 min-w-[150px]">
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-[10px] font-black text-muted-foreground uppercase">Progression</span>
                          <span className="text-xs font-bold">
                            {q.used_quota.toFixed(1)}h / {q.total_quota > 0 ? q.total_quota.toFixed(0) : '—'}h
                          </span>
                        </div>
                        
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/40">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              q.percentage_used >= 100 ? 'bg-red-500' : 
                              q.percentage_used >= 80 ? 'bg-orange-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(q.percentage_used, 100)}%` }}
                          />
                        </div>

                        <div className="flex justify-between mt-1">
                          <span className="text-[9px] font-bold text-orange-600">
                            {q.total_quota > 0 ? `Reste: ${q.remaining_quota.toFixed(1)}h` : 'Pas de quota'}
                          </span>
                          {q.percentage_used > 100 && (
                            <span className="text-[9px] font-bold text-red-600 animate-pulse">Dépassement</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <Badge variant="outline" className={`w-fit text-[9px] uppercase font-black px-2 py-0.5 ${
                          displayStatus === 'completed' ? 'bg-red-50 text-red-600 border-red-200' :
                          displayStatus === 'in_progress' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                          'bg-yellow-50 text-yellow-600 border-yellow-200'
                        }`}>
                          {displayStatus === 'completed' ? 'Terminée' : displayStatus === 'in_progress' ? 'En cours' : 'Non prog.'}
                        </Badge>
                        <QuotaAlert percentageUsed={q.percentage_used} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                          <Filter className="w-3 h-3" /> {s.specialty?.specialty_name}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isAdmin && (
                        <div className="flex justify-end gap-1 ">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingData(s); setShowForm(true); }} className="h-8 w-8 text-blue-600 hover:bg-blue-50"><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="h-8 w-8 text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-sm italic">Aucune matière trouvée avec ces critères.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border/60 bg-muted/20">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* --- FORM MODAL AVEC KEY --- */}
      {showForm && isAdmin && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-muted/10">
              <h2 className="font-black uppercase tracking-tight text-sm flex items-center gap-2">
                {editingData ? <Pencil className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
                {editingData ? 'Modifier la matière' : 'Ajouter une matière'}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="rounded-full h-8 w-8"><X className="w-5 h-5" /></Button>
            </div>
            <div className="p-6 overflow-y-auto">
              <SubjectForm 
                /* LA CLÉ ICI EST LA SOLUTION POUR L'ERREUR DE RENDU */
                key={editingData ? `edit-${editingData.id}` : 'new-subject'}
                initialData={editingData} 
                teachers={teachers} 
                specialties={specialties} 
                onSubmit={handleFormSubmit} 
                onCancel={() => setShowForm(false)} 
                isLoading={submitLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS identiques... */}
      {notification.show && (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl border-2 shadow-2xl animate-in slide-in-from-bottom-5 duration-300 ${
          notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="font-bold text-[11px] uppercase tracking-widest">{notification.message}</span>
        </div>
      )}
    </div>
  );
}