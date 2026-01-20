import React, { useEffect, useState, useMemo } from 'react';
import { yearService } from '../../../services/yearService';
import YearForm from './YearForm';
import { 
  CalendarDays, 
  Plus, 
  Search, 
  ArrowRight, 
  Pencil, 
  Trash2, 
  X, 
  AlertCircle, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Pagination from '@/components/Pagination';

export default function YearList() {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    try {
      setLoading(true);
      const data = await yearService.getAll();
      setYears(data || []);
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
        await yearService.update(editingData.id, formData);
        showNotify('Année mise à jour');
      } else {
        await yearService.create(formData);
        showNotify('Nouvelle année créée');
      }
      setShowForm(false);
      setEditingData(null);
      fetchYears();
    } catch (error) {
      showNotify("Erreur d'enregistrement", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette année académique ?')) {
      try {
        await yearService.delete(id);
        showNotify('Année supprimée');
        setYears(years.filter(y => y.id !== id));
      } catch (error) {
        showNotify('Erreur de suppression', 'error');
      }
    }
  };

  const filteredYears = useMemo(() => {
    return years.filter(y => 
      y.date_star?.includes(searchTerm) || y.date_end?.includes(searchTerm)
    );
  }, [years, searchTerm]);
  const PAGE_SIZE = 10;
  useEffect(() => {
    setPage(1);
  }, [searchTerm, years.length]);
  const totalPages = Math.max(1, Math.ceil(filteredYears.length / PAGE_SIZE));
  const pagedYears = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredYears.slice(start, start + PAGE_SIZE);
  }, [filteredYears, page]);

  if (loading && years.length === 0) {
    return <div className="p-4 md:p-8 max-w-[1600px] mx-auto"><Progress value={30} className="h-1" /></div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary/80 to-secondary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shrink-0">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Années Académiques</h1>
            <p className="text-muted-foreground text-xs md:text-sm font-medium">Définition des périodes scolaires</p>
          </div>
        </div>
        <Button 
          onClick={() => { setEditingData(null); setShowForm(true); }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-6 h-auto shadow-md gap-2 font-bold transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Nouvelle Année
        </Button>
      </div>

      {/* --- FILTRES --- */}
      <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border/40 flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
            <input 
              type="text"
              placeholder="Rechercher une date..."
              className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-4 focus:ring-muted/40 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="secondary" className="bg-card border-border text-muted-foreground font-bold px-4 py-1.5 rounded-full uppercase text-[10px] tracking-widest">
            {filteredYears.length} Périodes configurées
          </Badge>
        </div>

        {/* --- TABLEAU --- */}
        <div className="overflow-x-auto">
          {filteredYears.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-muted-foreground/60">
              <Calendar className="w-12 h-12 mb-3 opacity-10" />
              <p className="font-bold text-muted-foreground/80 text-sm">Aucune année trouvée</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-muted/50 text-muted-foreground/80 text-[10px] uppercase font-black tracking-widest border-b border-border/60">
                <tr>
                  <th className="px-8 py-4">ID</th>
                  <th className="px-8 py-4">Période Académique</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {pagedYears.map((year) => (
                  <tr key={year.id} className="group hover:bg-muted/50 transition-colors">
                    <td className="px-8 py-4 text-xs font-mono text-muted-foreground/80">#{year.id}</td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-muted/50 group-hover:bg-card px-4 py-2 rounded-xl border border-transparent group-hover:border-border/60 transition-all">
                          <span className="text-sm font-bold text-foreground/80">{year.date_star}</span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground/80" />
                          <span className="text-sm font-bold text-foreground/80">{year.date_end}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingData(year); setShowForm(true); }}
                          className="p-2.5 text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                        >
                          <Pencil className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(year.id)}
                          className="p-2.5 text-delta-negative hover:bg-delta-negative/10 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
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

      {/* --- MODAL --- */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-6 border-b border-border/60 flex justify-between items-center bg-muted/50">
              <h3 className="font-black text-foreground tracking-tight flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/90 to-secondary flex items-center justify-center text-primary-foreground">
                   <Plus className="w-4 h-4" />
                 </div>
                 {editingData ? 'Modifier l\'année' : 'Nouvelle année'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground/80 hover:text-muted-foreground transition-colors p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              <YearForm
                initialData={editingData}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowForm(false)}
                isLoading={loading}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- NOTIFICATIONS --- */}
      {notification.show && (
        <div className={`fixed bottom-8 right-8 z-[110] flex items-center gap-3 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom-10 ${
          notification.type === 'error' ? 'bg-delta-negative/10 border-delta-negative/20 text-delta-negative' : 'bg-delta-positive/10 border-delta-positive/20 text-delta-positive'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <p className="text-sm font-bold">{notification.message}</p>
        </div>
      )}
    </div>
  );
}
