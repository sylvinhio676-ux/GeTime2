import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { subjectService } from '../../../services/subjectService';
import { teacherService } from '../../../services/teacherService';
import { specialtyService } from '../../../services/specialtyService';
import SubjectForm from './SubjectForm';
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
  CheckCircle2 
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

      if (isAdmin) {
        const [teachersData, specialtiesData] = await Promise.all([
          teacherService.getAll(),
          specialtyService.getAll()
        ]);
        setTeachers(teachersData || []);
        setSpecialties(specialtiesData || []);
      }
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

  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => 
      s.subject_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subjects, searchTerm]);
  const PAGE_SIZE = 10;
  useEffect(() => {
    setPage(1);
  }, [searchTerm, subjects.length]);
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
      
      {/* --- HEADER (Largeur Campus) --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-[2rem] border border-border shadow-sm">
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
            onClick={() => { setEditingData(null); setShowForm(true); }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-6 h-auto shadow-md gap-2 font-bold"
          >
            <Plus className="w-5 h-5" /> Ajouter une matière
          </Button>
        )}
      </div>

      {/* --- NOTIFICATIONS --- */}
      {notification.show && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom-10 ${
          notification.type === 'error' ? 'bg-delta-negative/10 border-delta-negative/20 text-delta-negative' : 'bg-delta-positive/10 border-delta-positive/20 text-delta-positive'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <p className="text-sm font-bold">{notification.message}</p>
          <button onClick={() => setNotification({ ...notification, show: false })} className="ml-4 opacity-50"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* --- LISTE (Largeur Campus) --- */}
      <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
        
        <div className="p-5 border-b border-border/40 flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
            <input 
              type="text"
              placeholder="Rechercher une matière..."
              className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-4 focus:ring-muted/40 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="outline" className="border-border text-muted-foreground font-bold px-4 py-1.5 rounded-full uppercase text-[10px] tracking-widest">
            {filteredSubjects.length} Unités
          </Badge>
        </div>

        <div className="overflow-x-auto">
          {filteredSubjects.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-muted-foreground/60">
              <BookOpen className="w-12 h-12 mb-3 opacity-10" />
              <p className="font-bold text-muted-foreground/80 text-sm">Aucune matière trouvée</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-muted/50 text-muted-foreground/80 text-[10px] uppercase font-black tracking-widest border-b border-border/60">
                <tr>
                  <th className="px-6 py-4">Libellé</th>
                  <th className="px-6 py-4">V. Horaire</th>
                  <th className="px-6 py-4">Specialite</th>
                  <th className="px-6 py-4">Enseignant</th>
                  {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {pagedSubjects.map((subject) => (
                  <tr key={subject.id} className="group hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center font-bold text-[10px] group-hover:bg-gradient-to-tr group-hover:from-primary/90 group-hover:to-secondary group-hover:text-primary-foreground transition-all">
                          {subject.subject_name?.substring(0, 2).toUpperCase()}
                        </div>
                        <p className="font-bold text-foreground text-sm tracking-tight">{subject.subject_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1.5 text-foreground font-bold">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" /> {subject.total_hour}h
                        </span>
                        <span className="text-[10px] text-muted-foreground/80">{subject.hour_by_week}h / semaine</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-muted-foreground/60" />
                        {subject.specialty?.specialty_name || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-muted-foreground/60" />
                        {subject.teacher?.user?.name || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isAdmin && (
                        <div className="flex justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingData(subject); setShowForm(true); }} className="p-2 text-muted-foreground hover:bg-muted rounded-lg"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(subject.id)} className="p-2 text-delta-negative hover:bg-delta-negative/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* --- MODAL --- */}
      {showForm && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-6 border-b border-border/60 flex justify-between items-center bg-muted/50">
              <h3 className="font-black text-foreground tracking-tight flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/90 to-secondary flex items-center justify-center text-primary-foreground"><Plus className="w-4 h-4" /></div>
                 {editingData ? 'Modifier' : 'Nouvelle Matière'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground/80 p-2"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 max-h-[80vh] overflow-y-auto">
              <SubjectForm
                initialData={editingData}
                teachers={teachers}
                specialties={specialties}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowForm(false)}
                isLoading={loading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
