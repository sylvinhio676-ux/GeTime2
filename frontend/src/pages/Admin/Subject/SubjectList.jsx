import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { subjectService } from '../../../services/subjectService';
import { teacherService } from '../../../services/teacherService';
import { specialtyService } from '../../../services/specialtyService';
import { sectorService } from '@/services/sectorService';
import { levelService } from '@/services/levelService';
import SubjectForm from './SubjectForm';
import QuotaAlert from '@/components/QuotaAlert';
import {
  BookOpen,
  Plus,
  Search,
  Clock,
  User,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/useAuth';
import Pagination from '@/components/Pagination';

export default function SubjectList() {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [quotas, setQuotas] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin') || hasRole('super_admin');
  const [page, setPage] = useState(1);

  const showNotify = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const subjectsData = await subjectService.getAll();
      setSubjects(subjectsData || []);

      const basePromises = [
        teacherService.getAll(),
        specialtyService.getAll(),
        subjectService.getQuotaStatus(),
      ];
      const sectorPromise = isAdmin ? sectorService.getAll() : sectorService.getForTeacher();
      const levelPromise = isAdmin ? levelService.getAll() : levelService.getForTeacher();

      const [teachersData, specialtiesData, quotasData, sectorsData, levelsData] =
        await Promise.all([...basePromises, sectorPromise, levelPromise]);

      setTeachers(teachersData || []);
      setSpecialties(specialtiesData || []);
      setQuotas(quotasData?.subjects || []);
      setSectors(sectorsData || []);
      setLevels(levelsData || []);
    } catch {
      showNotify('Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, showNotify]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleFormSubmit = async (formData) => {
    try {
      if (editingData) {
        await subjectService.update(editingData.id, formData);
        showNotify('Matière mise à jour');
      } else {
        await subjectService.create(formData);
        showNotify('Matière créée');
      }
      setShowForm(false);
      setEditingData(null);
      fetchInitialData();
    } catch {
      showNotify("Erreur d'enregistrement", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette matière ?')) {
      try {
        await subjectService.delete(id);
        showNotify('Matière supprimée');
        setSubjects(subjects.filter(s => s.id !== id));
      } catch {
        showNotify('Erreur de suppression', 'error');
      }
    }
  };

  const getQuotaForSubject = (subjectId, teacherId) => {
    return quotas.find(q => q.subject_id === subjectId && q.teacher_id === teacherId) || {
      total_quota: 0,
      used_quota: 0,
      remaining_quota: 0,
      status: 'not_programmed',
      percentage_used: 0
    };
  };

  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => {
      const matchesSearch = s.subject_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const quota = getQuotaForSubject(s.id, s.teacher_id);
      const matchesStatus = !statusFilter || quota.status === statusFilter;
      const specialtyId = s.specialty_id || s.specialty?.id;
      const matchesSpecialty = !specialtyFilter || String(specialtyId) === String(specialtyFilter);
      const levelId = s.specialty?.level_id || s.specialty?.level?.id;
      const matchesLevel = !levelFilter || String(levelId) === String(levelFilter);
      const sectorId =
        s.specialty?.sector_id ||
        s.specialty?.sector?.id ||
        s.specialty?.sector_detail_id ||
        s.specialty?.sector_detail?.sector_id;
      const matchesSector = !sectorFilter || String(sectorId) === String(sectorFilter);
      return matchesSearch && matchesStatus && matchesSpecialty && matchesLevel && matchesSector;
    });
  }, [subjects, searchTerm, statusFilter, quotas, specialtyFilter, levelFilter, sectorFilter]);

  const PAGE_SIZE = 10;
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, specialtyFilter, levelFilter, sectorFilter, subjects.length]);
  
  const totalPages = Math.max(1, Math.ceil(filteredSubjects.length / PAGE_SIZE));
  const pagedSubjects = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredSubjects.slice(start, start + PAGE_SIZE);
  }, [filteredSubjects, page]);

  if (loading && subjects.length === 0) {
    return <div className="p-4 md:p-8 max-w-[1600px] mx-auto"><Progress value={40} className="h-1" /></div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">

      {/* HEADER - Responsive adaptation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary/80 to-secondary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Matières</h1>
            <p className="text-muted-foreground text-xs md:text-sm font-medium">Programmes et volumes horaires</p>
          </div>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full md:w-auto bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-lg rounded-xl py-6 md:py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle matière
          </Button>
        )}
      </div>

      {/* FILTERS - Responsive Grid Layout */}
      <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="sm:col-span-2 lg:col-span-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminées</option>
            <option value="not_programmed">Non programmées</option>
          </select>

          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          >
            <option value="">Tous les secteurs</option>
            {sectors.map((s) => <option key={s.id} value={s.id}>{s.sector_name}</option>)}
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          >
            <option value="">Tous les niveaux</option>
            {levels.map((l) => <option key={l.id} value={l.id}>{l.name_level}</option>)}
          </select>

          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          >
            <option value="">Spécialités</option>
            {specialties.map((sp) => <option key={sp.id} value={sp.id}>{sp.specialty_name}</option>)}
          </select>
        </div>
      </div>

      {/* TABLE / CARD VIEW */}
      <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
        {filteredSubjects.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-muted-foreground/60">
            <BookOpen className="w-12 h-12 mb-3 opacity-10" />
            <p className="font-bold text-sm uppercase tracking-widest">Aucune matière trouvée</p>
          </div>
        ) : (
          <>
            {/* Desktop Table - Hidden on mobile */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/50 text-muted-foreground/80 text-[10px] uppercase font-black tracking-widest border-b border-border/60">
                  <tr>
                    <th className="px-6 py-4">Matière</th>
                    <th className="px-6 py-4">V. Horaire</th>
                    <th className="px-6 py-4">Quota (T/U/R)</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4">Spécialité & Enseignant</th>
                    {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {pagedSubjects.map((subject) => {
                    const quota = getQuotaForSubject(subject.id, subject.teacher_id);
                    return (
                      <tr key={subject.id} className="group hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center font-bold text-[10px] group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                              {subject.subject_name?.substring(0, 2).toUpperCase()}
                            </div>
                            <p className="font-bold text-sm">{subject.subject_name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{subject.total_hour}h</span>
                            <span className="text-[10px] opacity-60">{subject.hour_by_week}h/sem</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-medium">
                            <span className="text-foreground">{quota.total_quota}h</span> / 
                            <span className="text-emerald-600"> {quota.used_quota.toFixed(1)}h</span> / 
                            <span className="text-orange-600"> {quota.remaining_quota.toFixed(1)}h</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={`text-[9px] uppercase font-black ${
                            quota.status === 'completed' ? 'border-red-200 text-red-600 bg-red-50' :
                            quota.status === 'in_progress' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' :
                            'border-yellow-200 text-yellow-600 bg-yellow-50'
                          }`}>
                            {quota.status === 'completed' ? 'Terminée' : quota.status === 'in_progress' ? 'En cours' : 'Non prog.'}
                          </Badge>
                          <QuotaAlert percentageUsed={quota.percentage_used} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                              <Filter className="w-3 h-3" /> {subject.specialty?.specialty_name || '-'}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-medium italic">
                              <User className="w-3 h-3" /> {subject.teacher?.user?.name || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isAdmin && (
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" onClick={() => { setEditingData(subject); setShowForm(true); }} className="h-8 w-8 text-blue-600"><Pencil className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(subject.id)} className="h-8 w-8 text-red-500"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View - Visible on small screens */}
            <div className="lg:hidden divide-y divide-border/40">
              {pagedSubjects.map((subject) => {
                const quota = getQuotaForSubject(subject.id, subject.teacher_id);
                return (
                  <div key={subject.id} className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                          {subject.subject_name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm leading-tight">{subject.subject_name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-black">{subject.total_hour}h Total • {subject.hour_by_week}h/sem</p>
                        </div>
                      </div>
                      <Badge className={`text-[9px] uppercase font-black ${
                        quota.status === 'completed' ? 'bg-red-50 text-red-600' :
                        quota.status === 'in_progress' ? 'bg-emerald-50 text-emerald-600' : 'bg-yellow-50 text-yellow-600'
                      }`}>
                        {quota.status === 'completed' ? 'Terminée' : quota.status === 'in_progress' ? 'En cours' : 'Non prog.'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-muted/30 p-3 rounded-xl">
                      <div className="text-center border-r border-border/50">
                        <p className="text-[8px] uppercase font-black text-muted-foreground">Quota</p>
                        <p className="text-xs font-bold">{quota.total_quota}h</p>
                      </div>
                      <div className="text-center border-r border-border/50">
                        <p className="text-[8px] uppercase font-black text-muted-foreground">Utilisé</p>
                        <p className="text-xs font-bold text-emerald-600">{quota.used_quota.toFixed(1)}h</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] uppercase font-black text-muted-foreground">Reste</p>
                        <p className="text-xs font-bold text-orange-600">{quota.remaining_quota.toFixed(1)}h</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 font-bold text-muted-foreground">
                          <Filter className="w-3 h-3" /> {subject.specialty?.specialty_name}
                        </div>
                        <div className="flex items-center gap-1 italic">
                          <User className="w-3 h-3" /> {subject.teacher?.user?.name}
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button size="icon" variant="outline" onClick={() => { setEditingData(subject); setShowForm(true); }} className="h-9 w-9 border-2 rounded-xl text-blue-600"><Pencil className="w-4 h-4" /></Button>
                          <Button size="icon" variant="outline" onClick={() => handleDelete(subject.id)} className="h-9 w-9 border-2 rounded-xl text-red-500"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        <div className="p-4 bg-muted/20 border-t border-border">
           <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* MODAL - Responsive drawer style on mobile */}
      {showForm && isAdmin && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/10 shrink-0">
              <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
                {editingData ? 'Modifier matière' : 'Nouvelle matière'}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="rounded-full"><X className="w-5 h-5" /></Button>
            </div>
            <div className="p-6 overflow-y-auto">
              <SubjectForm
                initialData={editingData}
                teachers={teachers}
                specialties={specialties}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION - Bottom center on mobile */}
      {notification.show && (
        <div className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-[200] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border-2 transition-all animate-in slide-in-from-bottom-10 sm:slide-in-from-right ${
          notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
          <span className="font-bold text-xs uppercase tracking-widest flex-1">{notification.message}</span>
          <button onClick={() => setNotification({ show: false, message: '', type: '' })} className="p-1 hover:bg-black/5 rounded-full"><X className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}