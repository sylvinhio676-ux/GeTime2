import React, { useEffect, useState, useMemo } from 'react';
import { sectorService } from '../../../services/sectorService';
import { schoolService } from '../../../services/schoolService';
import SectorForm from './SectorForm';
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  Layers, 
  University, 
  X, 
  AlertCircle, 
  CheckCircle2,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Pagination from '@/components/Pagination';

export default function SectorList() {
  const [sectors, setSectors] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [page, setPage] = useState(1);

  const getErrorMessage = (error, fallback) => {
    if (!error) return fallback;
    if (typeof error === 'string') return error;
    return error.message || error.error || fallback;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [sectorData, schoolData] = await Promise.all([
        sectorService.getAll(),
        schoolService.getAll()
      ]);
      setSectors(sectorData || []);
      setSchools(schoolData || []);
    } catch (error) {
      showNotify(getErrorMessage(error, 'Erreur de chargement des données'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotify = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingData) {
        await sectorService.update(editingData.id, formData);
        showNotify('Filière mise à jour');
      } else {
        await sectorService.create(formData);
        showNotify('Nouvelle filière créée');
      }
      setShowForm(false);
      setEditingData(null);
      refreshSectors();
    } catch (error) {
      showNotify(getErrorMessage(error, 'Erreur lors de l\'enregistrement'), 'error');
    }
  };

  const refreshSectors = async () => {
    const data = await sectorService.getAll();
    setSectors(data);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette filière ?')) {
      try {
        await sectorService.delete(id);
        showNotify('Filière supprimée');
        setSectors(sectors.filter(s => s.id !== id));
      } catch (error) {
        showNotify(getErrorMessage(error, 'Erreur de suppression'), 'error');
      }
    }
  };

  const filteredSectors = useMemo(() => {
    return sectors.filter(s => 
      s.sector_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.school?.school_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sectors, searchTerm]);
  const PAGE_SIZE = 5;
  useEffect(() => {
    setPage(1);
  }, [searchTerm, sectors.length]);
  const totalPages = Math.max(1, Math.ceil(filteredSectors.length / PAGE_SIZE));
  const pagedSectors = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredSectors.slice(start, start + PAGE_SIZE);
  }, [filteredSectors, page]);

  if (loading && sectors.length === 0) {
    return <div className="p-8"><Progress value={60} className="h-1" /></div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Filières & Secteurs</h1>
            <p className="text-muted-foreground text-xs md:text-sm font-medium">Organisation académique</p>
          </div>
        </div>
        <Button 
          onClick={() => { setEditingData(null); setShowForm(true); }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-6 h-auto shadow-md gap-2 font-bold transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Ajouter une filière
        </Button>
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

      {/* --- LISTE ET FILTRES --- */}
      <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
        
        <div className="p-5 border-b border-border/40 flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
            <input 
              type="text"
              placeholder="Rechercher une filière ou un code..."
              className="w-full pl-12 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-4 focus:ring-muted/40 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="secondary" className="bg-muted text-foreground/80 border-none font-bold px-4 py-1">
            {filteredSectors.length} Secteurs enregistrés
          </Badge>
        </div>

        <div className="overflow-x-auto">
          {filteredSectors.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-muted-foreground/80">
              <Tag className="w-12 h-12 mb-3 opacity-10" />
              <p className="text-sm font-bold">Aucune filière trouvée</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[850px]">
              <thead className="bg-muted/50 text-muted-foreground/80 text-[10px] uppercase font-black tracking-widest border-b border-border/60">
                <tr>
                  <th className="px-8 py-5">Filière / Secteur</th>
                  <th className="px-8 py-5">Code</th>
                  <th className="px-8 py-5">École de rattachement</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {pagedSectors.map((sector) => (
                  <tr key={sector.id} className="group hover:bg-muted/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs uppercase group-hover:bg-primary/90 group-hover:text-primary-foreground transition-all">
                          {sector.sector_name?.substring(0, 2)}
                        </div>
                        <p className="font-bold text-foreground tracking-tight">{sector.sector_name}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <Badge variant="outline" className="font-mono text-muted-foreground border-border/60 bg-muted/30">
                        {sector.code || 'N/A'}
                      </Badge>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-muted-foreground font-medium">
                        <University className="w-4 h-4 opacity-40" />
                        {sector.school?.school_name || 'Non assigné'}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingData(sector); setShowForm(true); }}
                          className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(sector.id)}
                          className="p-2 text-delta-negative hover:bg-delta-negative/10 rounded-lg transition-colors"
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

      {/* --- MODAL FORMULAIRE --- */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-6 border-b border-border/60 flex justify-between items-center bg-muted/50">
              <h3 className="font-black text-foreground tracking-tight">
                {editingData ? 'Modifier la filière' : 'Nouvelle filière'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-card rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8">
              <SectorForm
                initialData={editingData}
                schools={schools}
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
