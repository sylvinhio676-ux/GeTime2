import React, { useEffect, useState, useMemo } from 'react';
import { levelService } from '../../../services/levelService';
import LevelForm from './LevelForm';
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  BarChart, 
  Layers, 
  X, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function LevelList() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const data = await levelService.getAll();
      setLevels(data || []);
    } catch (error) {
      showNotify('Erreur de chargement des niveaux', error);
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
        await levelService.update(editingData.id, formData);
        showNotify('Niveau mis à jour');
      } else {
        await levelService.create(formData);
        showNotify('Nouveau niveau créé');
      }
      setShowForm(false);
      setEditingData(null);
      fetchLevels();
    } catch (error) {
      showNotify('Erreur lors de l\'enregistrement', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous supprimer ce niveau ?')) {
      try {
        await levelService.delete(id);
        showNotify('Niveau supprimé');
        setLevels(levels.filter(l => l.id !== id));
      } catch (error) {
        showNotify('Erreur de suppression', error);
      }
    }
  };

  const filteredLevels = useMemo(() => {
    return levels.filter(l => 
      l.name_level?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [levels, searchTerm]);

  if (loading && levels.length === 0) {
    return <div className="p-8"><Progress value={30} className="h-1" /></div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
            <BarChart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Niveaux d'études</h1>
            <p className="text-slate-500 text-xs md:text-sm font-medium">Gestion des cycles académiques</p>
          </div>
        </div>
        <Button 
          onClick={() => { setEditingData(null); setShowForm(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-6 h-auto shadow-md gap-2 font-bold transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Ajouter un niveau
        </Button>
      </div>

      {/* --- NOTIFICATIONS --- */}
      {notification.show && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom-10 ${
          notification.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <p className="text-sm font-bold">{notification.message}</p>
          <button onClick={() => setNotification({ ...notification, show: false })} className="ml-4 opacity-50 text-current hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* --- LISTE ET FILTRES --- */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher un niveau..."
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold px-4 py-1.5 rounded-full uppercase text-[10px] tracking-widest">
            {filteredLevels.length} Niveaux actifs
          </Badge>
        </div>

        <div className="overflow-x-auto">
          {filteredLevels.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-slate-300">
              <Layers className="w-12 h-12 mb-3 opacity-10" />
              <p className="text-sm font-bold">Aucun niveau répertorié</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5">Identifiant</th>
                  <th className="px-8 py-5">Nom du niveau</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLevels.map((level) => (
                  <tr key={level.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 font-mono text-xs text-slate-400">
                      #{level.id}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[10px]">
                            {level.name_level?.match(/\d+/) || 'LV'}
                         </div>
                         <p className="font-bold text-slate-900 tracking-tight">{level.name_level}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200">
                        <button 
                          onClick={() => { setEditingData(level); setShowForm(true); }}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(level.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Supprimer"
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
      </div>

      {/* --- MODAL FORMULAIRE --- */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                {editingData ? 'Modifier le niveau' : 'Nouveau niveau'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-8">
              <LevelForm
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