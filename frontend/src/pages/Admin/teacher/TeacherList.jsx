import React, { useEffect, useState, useMemo } from 'react';
import { teacherService } from '../../../services/teacherService';
import TeacherForm from './TeacherForm';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Pencil, 
  Trash2, 
  X, 
  AlertCircle, 
  CheckCircle2,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Pagination from '@/components/Pagination';
import { useAuth } from '@/context/useAuth';

export default function TeacherList() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [page, setPage] = useState(1);
  const { hasRole } = useAuth();
  const isAdmin = hasRole("super_admin") || hasRole("admin");

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getAll();
      setTeachers(data || []);
    } catch (err) {
      showNotify('Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotify = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingData) {
        await teacherService.update(editingData.id, formData);
        showNotify('Enseignant mis à jour');
      } else {
        await teacherService.create(formData);
        showNotify('Enseignant créé avec succès');
      }
      setShowForm(false);
      setEditingData(null);
      fetchTeachers();
    } catch (error) {
      showNotify("Erreur d'enregistrement", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cet enseignant ?')) {
      try {
        await teacherService.delete(id);
        showNotify('Enseignant supprimé');
        setTeachers(teachers.filter(t => t.id !== id));
      } catch (error) {
        showNotify('Erreur de suppression', 'error');
      }
    }
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => 
      t.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teachers, searchTerm]);
  const PAGE_SIZE = 10;
  useEffect(() => {
    setPage(1);
  }, [searchTerm, teachers.length]);
  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / PAGE_SIZE));
  const pagedTeachers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredTeachers.slice(start, start + PAGE_SIZE);
  }, [filteredTeachers, page]);

  if (loading && teachers.length === 0) {
    return <div className="p-8"><Progress value={40} className="h-1 w-full" /></div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* --- HEADER (Style School/Campus) --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight leading-none">Enseignants</h1>
            <p className="text-muted-foreground text-xs md:text-sm font-medium mt-1">Gestion du personnel académique</p>
          </div>
        </div>
        {isAdmin && (
          <Button 
            onClick={() => { setEditingData(null); setShowForm(true); }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-6 h-auto shadow-md gap-2 font-bold"
          >
            <Plus className="w-5 h-5" /> Nouveau Teacher
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

      {/* --- TABLE & FILTERS --- */}
      <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
        
        <div className="p-5 border-b border-border/40 flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
            <input 
              type="text"
              placeholder="Rechercher un enseignant..."
              className="w-full pl-12 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-4 focus:ring-muted/40 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="outline" className="px-4 py-1.5 rounded-full border-border text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
            {filteredTeachers.length} Inscrits
          </Badge>
        </div>

        <div className="overflow-x-auto">
          {filteredTeachers.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-muted-foreground/60">
              <User className="w-12 h-12 mb-3 opacity-10" />
              <p className="font-bold text-muted-foreground/80 text-sm">Aucun enseignant trouvé</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-muted/50 text-muted-foreground/80 text-[10px] uppercase font-black tracking-widest border-b border-border/60">
                <tr>
                  <th className="px-8 py-4">Nom complet</th>
                  <th className="px-8 py-4">Matricule</th>
                  <th className="px-8 py-4">Contact</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {pagedTeachers.map((teacher) => (
                  <tr key={teacher.id} className="group hover:bg-muted/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs uppercase group-hover:bg-primary/90 group-hover:text-primary-foreground transition-all">
                          {teacher.user?.name?.substring(0, 2)}
                        </div>
                        <p className="font-bold text-foreground tracking-tight">{teacher.user?.name}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <Badge variant="secondary" className="bg-muted text-muted-foreground border-none font-mono text-[11px] px-3">
                        {teacher.registration_number}
                      </Badge>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground/80" />
                          {teacher.user?.email}
                        </div>
                        {teacher.user?.phone && (
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80">
                            <Phone className="w-3 h-3" />
                            {teacher.user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {isAdmin && (
                        <div className="flex justify-end gap-2 transition-opacity">
                          <button 
                            onClick={() => { setEditingData(teacher); setShowForm(true); }}
                            className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(teacher.id)}
                            className="p-2 text-delta-negative hover:bg-delta-negative/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* --- MODAL (Style Campus/School) --- */}
      {showForm && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-xl bg-card rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-6 border-b border-border/60 flex justify-between items-center bg-muted/50">
              <h3 className="font-black text-foreground tracking-tight flex items-center gap-2">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                  <Plus className="w-4 h-4" />
                </div>
                {editingData ? 'Modifier Enseignant' : 'Nouvel Enseignant'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-card rounded-full transition-colors text-muted-foreground/80"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 max-h-[80vh] overflow-y-auto">
              <TeacherForm
                initialData={editingData}
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
