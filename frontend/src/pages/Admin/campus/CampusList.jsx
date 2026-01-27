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
  X,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Pagination from '@/components/Pagination';
import { useNavigate } from 'react-router-dom';

export default function CampusList() {
  const navigate = useNavigate();
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
      setCampuses(campusData || []);
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
    setCampuses(data || []);
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
      c.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    <div className="p-3 md:p-8 max-w-[1600px] mx-auto space-y-4 md:space-y-8 animate-in fade-in duration-500">
      
      {/* --- HEADER RESPONSIVE --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 md:p-6 rounded-2xl md:rounded-3xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center text-primary shrink-0">
            <MapPin className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Gestion des Campus</h1>
            <p className="text-muted-foreground text-[11px] md:text-sm font-medium">Sites géographiques des établissements.</p>
          </div>
        </div>
        <Button 
          onClick={() => { setEditingData(null); setShowForm(true); }}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 md:h-14 px-6 shadow-lg shadow-primary/20 gap-2 font-bold"
        >
          <Plus className="w-5 h-5" /> Ajouter un campus
        </Button>
      </div>

      {/* --- NOTIFICATION TOAST RESPONSIVE --- */}
      {notification.show && (
        <div className={`fixed bottom-4 left-4 right-4 md:relative md:bottom-0 md:left-0 md:right-0 z-[110] flex items-center gap-3 p-4 rounded-xl border animate-in slide-in-from-bottom-5 md:slide-in-from-top-4 ${
          notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
          <p className="text-xs md:text-sm font-bold">{notification.message}</p>
          <button onClick={() => setNotification({ ...notification, show: false })} className="ml-auto p-1"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* --- LIST CONTAINER --- */}
      <div className="bg-card rounded-2xl md:rounded-[2rem] border border-border shadow-sm overflow-hidden">
        
        {/* FILTERS SECTION */}
        <div className="p-4 md:p-6 border-b border-border/40 bg-muted/30 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
            <input 
              type="text"
              placeholder="Rechercher un campus..."
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="outline" className="hidden sm:flex bg-card text-muted-foreground font-bold px-4 py-1.5 rounded-lg border-border">
            {filteredCampuses.length} Campus répertoriés
          </Badge>
        </div>

        {/* CONTENU : CARDS (Mobile) vs TABLE (Desktop) */}
        <div className="w-full">
          {filteredCampuses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-24 text-muted-foreground/80">
              <Building2 className="w-12 h-12 md:w-16 md:h-16 mb-4 opacity-10" />
              <p className="text-sm font-bold italic">Aucun campus trouvé</p>
            </div>
          ) : (
            <>
              {/* VUE MOBILE : CARDS */}
              <div className="grid grid-cols-1 divide-y divide-border/40 md:hidden">
                {pagedCampuses.map((campus) => (
                  <div key={campus.id} className="p-4 space-y-4 bg-card active:bg-muted/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                          {campus.campus_name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground leading-none mb-1">{campus.campus_name}</h3>
                          <div className="flex items-center text-[11px] text-muted-foreground">
                            <MapPin className="w-3 h-3 mr-1" />
                            {campus.city || "Ville non définie"}
                          </div>
                        </div>
                      </div>
                      <Badge className={`text-[9px] font-black uppercase tracking-wider ${
                        (campus.available_rooms_count ?? 0) > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {(campus.available_rooms_count ?? 0) > 0 ? 'Actif' : 'Maintenance'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-xl">
                      <div className="flex items-center gap-2">
                        <University className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[11px] font-bold text-muted-foreground truncate max-w-[150px]">
                          {campus.etablishment?.etablishment_name || "---"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-foreground">{campus.available_rooms_count ?? 0}</span>
                        <span className="text-[10px] text-muted-foreground ml-1">salles</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button 
                        onClick={() => navigate(`/dashboard/campuses/${campus.id}`)}
                        variant="outline" size="sm" className="flex-1 h-9 rounded-lg text-xs font-bold gap-2"
                      >
                        Détails <ChevronRight className="w-3 h-3" />
                      </Button>
                      <button onClick={() => { setEditingData(campus); setShowForm(true); }} className="p-2.5 bg-muted rounded-lg text-muted-foreground">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(campus.id)} className="p-2.5 bg-red-50 rounded-lg text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* VUE DESKTOP : TABLEAU */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-muted/50 text-muted-foreground/80 text-[10px] uppercase font-black tracking-widest border-b border-border/60">
                    <tr>
                      <th className="px-8 py-5">Campus</th>
                      <th className="px-8 py-5">Ville</th>
                      <th className="px-8 py-5">Établissement</th>
                      <th className="px-6 py-5 text-center">Status</th>
                      <th className="px-6 py-5 text-center">Salles</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {pagedCampuses.map((campus) => (
                      <tr key={campus.id} className="group hover:bg-muted/20 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs uppercase group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              {campus.campus_name?.substring(0, 2)}
                            </div>
                            <p className="font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">{campus.campus_name}</p>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm text-muted-foreground font-medium">{campus.city || "---"}</td>
                        <td className="px-8 py-5">
                          <Badge variant="secondary" className="bg-muted/50 text-muted-foreground border-none font-bold px-3 py-1">
                            <University className="w-3 h-3 mr-2 opacity-50" />
                            {campus.etablishment?.etablishment_name || "---"}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-center">
                          {(campus.available_rooms_count ?? 0) > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">Actif</span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700">Maintenance</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="text-sm font-black text-foreground">{campus.available_rooms_count ?? 0}</div>
                          <div className="text-[10px] text-muted-foreground uppercase font-bold">sur {campus.rooms_count ?? 0}</div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-1 transition-all">
                            <button onClick={() => { setEditingData(campus); setShowForm(true); }} className="p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(campus.id)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            <button onClick={() => navigate(`/dashboard/campuses/${campus.id}`)} className="ml-2 px-4 py-1.5 text-[11px] font-black uppercase tracking-wider bg-foreground text-background rounded-full hover:scale-105 transition-all">Voir</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="p-4 md:p-6 border-t border-border/40 bg-muted/10">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* --- FORM MODAL RESPONSIVE --- */}
      {showForm && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-card h-[85vh] sm:h-auto rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-border/60 flex justify-between items-center bg-muted/30 shrink-0">
              <h3 className="font-black text-foreground flex items-center gap-2 uppercase text-sm tracking-widest">
                {editingData ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingData ? 'Modifier Campus' : 'Nouveau Campus'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-card rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto grow">
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