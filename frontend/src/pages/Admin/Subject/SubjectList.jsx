import React, { useEffect, useState, useMemo } from 'react';
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
import { useAuth } from '@/context/AuthContext';
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

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
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
        await subjectService.update(editingData.id, formData);
        showNotify('Matière mise à jour');
      } else {
        await subjectService.create(formData);
        showNotify('Matière créée');
      }
      setShowForm(false);
      setEditingData(null);
      fetchInitialData();
    } catch (error) {
      showNotify("Erreur d'enregistrement", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette matière ?')) {
      try {
        await subjectService.delete(id);
        showNotify('Matière supprimée');
        setSubjects(subjects.filter(s => s.id !== id));
      } catch (error) {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-600 via-slate-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Matières</h1>
            <p className="text-slate-500 text-xs md:text-sm font-medium">Programmes et volumes horaires</p>
          </div>
        </div>
        {isAdmin && (
          <Button 
            onClick={() => { setEditingData(null); setShowForm(true); }}
            className="bg-blue-700 hover:bg-blue-800 text-white rounded-xl px-6 py-6 h-auto shadow-md gap-2 font-bold"
          >
            <Plus className="w-5 h-5" /> Ajouter une matière
          </Button>
        )}
      </div>

      {/* --- NOTIFICATIONS --- */}
      {notification.show && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom-10 ${
          notification.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <p className="text-sm font-bold">{notification.message}</p>
          <button onClick={() => setNotification({ ...notification, show: false })} className="ml-4 opacity-50"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* --- LISTE (Largeur Campus) --- */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher une matière..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-slate-50 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold px-4 py-1.5 rounded-full uppercase text-[10px] tracking-widest">
            {filteredSubjects.length} Unités
          </Badge>
        </div>

        <div className="overflow-x-auto">
          {filteredSubjects.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-slate-300">
              <BookOpen className="w-12 h-12 mb-3 opacity-10" />
              <p className="font-bold text-slate-400 text-sm">Aucune matière trouvée</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Libellé</th>
                  <th className="px-6 py-4">V. Horaire</th>
                  <th className="px-6 py-4">Enseignant</th>
                  {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pagedSubjects.map((subject) => (
                  <tr key={subject.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-[10px] group-hover:bg-gradient-to-tr group-hover:from-slate-500 group-hover:to-purple-500 group-hover:text-white transition-all">
                          {subject.subject_name?.substring(0, 2).toUpperCase()}
                        </div>
                        <p className="font-bold text-slate-900 text-sm tracking-tight">{subject.subject_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1.5 text-slate-900 font-bold">
                          <Clock className="w-3.5 h-3.5 text-slate-500" /> {subject.total_hour}h
                        </span>
                        <span className="text-[10px] text-slate-400">{subject.hour_by_week}h / semaine</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-300" />
                        {subject.teacher?.user?.name || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isAdmin && (
                        <div className="flex justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingData(subject); setShowForm(true); }} className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(subject.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-500 to-purple-500 flex items-center justify-center text-white"><Plus className="w-4 h-4" /></div>
                 {editingData ? 'Modifier' : 'Nouvelle Matière'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 p-2"><X className="w-5 h-5" /></button>
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
