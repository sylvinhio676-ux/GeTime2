import React, { useEffect, useState, useMemo } from 'react';
import { campusService } from '../../../services/campusService';
import { etablishmentService } from '@/services/etablishmentService';
import CampusForm from './CampusForm';
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  MapPin, 
  University,
  Building2, 
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Pagination from '@/components/Pagination';

export default function CampusList() {
  const [campuses, setCampuses] = useState([]);
  const [etablishments, setEtablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [campusData, etabData] = await Promise.all([
        campusService.getAll(),
        etablishmentService.getAll()
      ]);
      setCampuses(campusData);
      setEtablishments(etabData || []);
    } catch (error) {
      showNotify('Erreur de chargement des données', 'error');
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
        await campusService.update(editingData.id, formData);
        showNotify('Campus mis à jour avec succès');
      } else {
        await campusService.create(formData);
        showNotify('Nouveau campus ajouté');
      }
      setShowForm(false);
      setEditingData(null);
      refreshData();
    } catch (error) {
      showNotify('Une erreur est survenue', 'error');
    }
  };

  const refreshData = async () => {
    const data = await campusService.getAll();
    setCampuses(data);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce campus ?')) {
      try {
        await campusService.delete(id);
        showNotify('Campus supprimé');
        refreshData();
      } catch (error) {
        showNotify('Erreur de suppression', 'error');
      }
    }
  };

  const filteredCampuses = useMemo(() => {
    return campuses.filter(c => 
      c.campus_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.localisation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.etablishment?.etablishment_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [campuses, searchTerm]);
  const PAGE_SIZE = 10;
  useEffect(() => {
    setPage(1);
  }, [searchTerm, campuses.length]);
  const totalPages = Math.max(1, Math.ceil(filteredCampuses.length / PAGE_SIZE));
  const pagedCampuses = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredCampuses.slice(start, start + PAGE_SIZE);
  }, [filteredCampuses, page]);

  if (loading && campuses.length === 0) {
    return <div className="p-4 md:p-8 max-w-[1600px] mx-auto"><Progress value={40} className="w-full h-1" /></div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* --- HEADER (Identique à School) --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <MapPin className="text-slate-600 w-8 h-8" />
            Gestion des Campus
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Gérez les différents sites géographiques de vos établissements.
          </p>
        </div>
        <Button 
          onClick={() => { setEditingData(null); setShowForm(true); }}
          className="bg-blue-700 hover:bg-blue-800 text-white rounded-xl px-6 py-6 shadow-lg shadow-blue-100 flex gap-2 h-auto"
        >
          <Plus className="w-5 h-5" /> Ajouter un campus
        </Button>
      </div>

      {/* --- NOTIFICATION TOAST --- */}
      {notification.show && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border animate-in slide-in-from-top-4 ${
          notification.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <p className="text-sm font-bold">{notification.message}</p>
          <button onClick={() => setNotification({ ...notification, show: false })} className="ml-auto opacity-50"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* --- TABLE & FILTERS (Identique à School) --- */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher un campus, une ville..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-50 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1 flex justify-end">
             <Badge variant="outline" className="text-slate-500 font-bold">{filteredCampuses.length} Campus</Badge>
          </div>
        </div>

        {/* Tableau Responsive */}
        <div className="overflow-x-auto">
          {filteredCampuses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Building2 className="w-16 h-16 mb-4 opacity-10" />
              <p className="font-bold">Aucun campus trouvé</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-8 py-4">Désignation</th>
                  <th className="px-8 py-4">Localisation</th>
                  <th className="px-8 py-4">Établissement</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pagedCampuses.map((campus) => (
                  <tr key={campus.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-xs uppercase">
                            {campus.campus_name?.substring(0, 2)}
                         </div>
                         <p className="font-bold text-slate-900 tracking-tight">{campus.campus_name}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm text-slate-500 font-medium">{campus.localisation || "Non définie"}</p>
                    </td>
                    <td className="px-8 py-5">
                       <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold">
                          <University className="w-3 h-3 mr-1.5 opacity-50" />
                          {campus.etablishment?.etablishment_name || "---"}
                       </Badge>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingData(campus); setShowForm(true); }}
                          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(campus.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
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

      {/* --- MODAL FORM (Identique à School) --- */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                {editingData ? <Pencil className="w-5 h-5 text-slate-600" /> : <Plus className="w-5 h-5 text-slate-600" />}
                {editingData ? 'Modifier le Campus' : 'Nouveau Campus'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8">
              <CampusForm
                initialData={editingData}
                etablishments={etablishments}
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

// Dans ton tableau, remplace la cellule localisation par :
{/* <td className="px-8 py-5">
  <a 
    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(campus.localisation)}`}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-sm text-slate-500 font-medium hover:text-slate-600 transition-colors"
  >
    <MapPin className="w-3 h-3" />
    {campus.localisation || "Non définie"}
  </a>
</td> */}
