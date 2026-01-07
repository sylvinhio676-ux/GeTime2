import React, { useEffect, useState, useMemo } from 'react';
import { schoolService } from '../../../services/schoolService';
import SchoolForm from './SchoolForm';
import { Progress } from '@/components/ui/progress';
import { 
  Pencil, Trash2, Plus, Search, University, 
  AlertCircle, CheckCircle2, X, School2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/Pagination';

export default function SchoolList() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const data = await schoolService.getAll();
      setSchools(data);
    } catch (error) {
      showNotify('Erreur lors de la récupération des écoles', 'error');
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
        await schoolService.update(editingData.id, formData);
        showNotify('École mise à jour avec succès');
      } else {
        await schoolService.create(formData);
        showNotify('Nouvelle école ajoutée');
      }
      setShowForm(false);
      setEditingData(null);
      fetchSchools();
    } catch (error) {
      showNotify('Une erreur est survenue', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette école ?')) {
      try {
        await schoolService.delete(id);
        showNotify('École supprimée');
        fetchSchools();
      } catch (error) {
        showNotify('Erreur de suppression', 'error');
      }
    }
  };

  const filteredSchools = useMemo(() => {
    return schools.filter(s => 
      s.school_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [schools, searchTerm]);
  const PAGE_SIZE = 10;
  useEffect(() => {
    setPage(1);
  }, [searchTerm, schools.length]);
  const totalPages = Math.max(1, Math.ceil(filteredSchools.length / PAGE_SIZE));
  const pagedSchools = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredSchools.slice(start, start + PAGE_SIZE);
  }, [filteredSchools, page]);

  if (loading && schools.length === 0) {
    return <div className="p-8"><Progress value={30} className="h-1" /></div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      
      {/* --- HEADER RESPONSIVE --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100 shrink-0">
            <University className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Écoles</h1>
            <p className="text-slate-500 text-xs md:text-sm font-medium">Gestion des établissements</p>
          </div>
        </div>
        <Button 
          onClick={() => { setEditingData(null); setShowForm(true); }}
          className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white rounded-xl py-6 h-auto shadow-lg shadow-blue-100 gap-2"
        >
          <Plus className="w-5 h-5" /> Ajouter
        </Button>
      </div>

      {/* --- NOTIFICATIONS --- */}
      {notification.show && (
        <div className={`fixed bottom-4 right-4 z-[100] flex items-center gap-3 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom-4 ${
          notification.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <p className="text-sm font-bold">{notification.message}</p>
          <button onClick={() => setNotification({ ...notification, show: false })} className="ml-4 opacity-50"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* --- CONTENT AREA --- */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        
        {/* BARRE DE RECHERCHE */}
        <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="secondary" className="bg-white text-slate-500 border-slate-200">{filteredSchools.length} Total</Badge>
        </div>

        {/* TABLEAU AVEC SCROLL HORIZONTAL MOBILE */}
        <div className="overflow-x-auto">
          {filteredSchools.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-slate-400">
              <School2 className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-bold tracking-tight">Aucun résultat trouvé</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.15em] border-b border-slate-100">
                <tr>
                  <th className="px-8 py-4">Nom de l'École</th>
                  <th className="px-8 py-4">Description</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pagedSchools.map((school) => (
                  <tr key={school.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-xs">
                            {school.school_name?.substring(0, 2).toUpperCase()}
                         </div>
                         <p className="font-bold text-slate-900 tracking-tight">{school.school_name}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm text-slate-500 font-medium line-clamp-1 max-w-xs">
                        {school.description || "---"}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setEditingData(school); setShowForm(true); }}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(school.id)}
                          className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* --- FORM MODAL RESPONSIVE --- */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900">{editingData ? 'Modifier l\'école' : 'Ajouter une école'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto max-h-[80vh]">
              <SchoolForm
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
