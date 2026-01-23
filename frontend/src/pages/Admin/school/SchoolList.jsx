import React, { useEffect, useState, useMemo } from 'react';
import { schoolService } from '../../../services/schoolService';
import SchoolForm from './SchoolForm';
import { Progress } from '@/components/ui/progress';
import { 
  Pencil, Trash2, Plus, Search, University, 
  AlertCircle, CheckCircle2, X, School2, MapPin, User
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
  const [detailSchool, setDetailSchool] = useState(null);
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
    return schools.filter(s => {
      const term = searchTerm.toLowerCase();
      return (
        s.school_name?.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term) ||
        s.responsible?.name?.toLowerCase().includes(term)
      );
    });
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 md:p-8 rounded-[2rem] border border-border/60 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
            <University className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Écoles</h1>
            <p className="text-muted-foreground text-xs md:text-sm font-medium">Gestion des établissements</p>
          </div>
        </div>
        <Button 
          onClick={() => { setEditingData(null); setShowForm(true); }}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-2 h-auto shadow-lg shadow-primary/20 gap-2"
        >
          <Plus className="w-5 h-5" /> Ajouter
        </Button>
      </div>

      {/* --- NOTIFICATIONS --- */}
      {notification.show && (
        <div className={`fixed bottom-4 right-4 z-[100] flex items-center gap-3 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom-4 ${
          notification.type === 'error' ? 'bg-delta-negative/10 border-delta-negative/20 text-delta-negative' : 'bg-delta-positive/10 border-delta-positive/20 text-delta-positive'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <p className="text-sm font-bold">{notification.message}</p>
          <button onClick={() => setNotification({ ...notification, show: false })} className="ml-4 opacity-50"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* --- CONTENT AREA --- */}
      <div className="bg-card rounded-[2rem] border border-border/60 shadow-sm overflow-hidden">
        
        {/* BARRE DE RECHERCHE */}
        <div className="p-5 border-b border-border/40 flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
            <input 
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-muted/400 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="secondary" className="bg-card text-muted-foreground border-border">{filteredSchools.length} Total</Badge>
        </div>

        {/* TABLEAU AVEC SCROLL HORIZONTAL MOBILE */}
        <div className="overflow-x-auto">
          {filteredSchools.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-muted-foreground/80">
              <School2 className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-bold tracking-tight">Aucun résultat trouvé</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-muted/50 text-muted-foreground/80 text-[10px] uppercase font-black tracking-[0.15em] border-b border-border/60">
                <tr>
                  <th className="px-8 py-4">Nom de l'École</th>
                  <th className="px-8 py-4">Description</th>
                  <th className="px-8 py-4">Responsable</th>
                  <th className="px-8 py-4 text-right">Secteurs</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {pagedSchools.map((school) => (
                  <tr key={school.id} className="group hover:bg-muted/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs">
                            {school.school_name?.substring(0, 2).toUpperCase()}
                         </div>
                         <p className="font-bold text-foreground tracking-tight">{school.school_name}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm text-muted-foreground font-medium line-clamp-2 max-w-xs">
                        {school.description || 'Aucune description'}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-sm text-foreground font-semibold">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-bold">{school.responsible?.name || 'Non attribué'}</span>
                        <span className="text-xs text-muted-foreground">{school.responsible?.email || '—'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Badge className="rounded-lg bg-muted text-muted-foreground text-xs font-black uppercase tracking-[0.25em]">
                        {school.sectors_count ?? 0} {school.sectors_count > 1 ? 'secteurs' : 'secteur'}
                      </Badge>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setEditingData(school); setShowForm(true); }}
                          className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(school.id)}
                          className="p-2 text-delta-negative hover:bg-delta-negative/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDetailSchool(school)}
                          className="text-xs rounded-full border border-border/60 px-3 py-1 text-muted-foreground hover:border-primary hover:text-primary transition-all"
                        >
                          Voir
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
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-[2rem] shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-6 border-b border-border/60 flex justify-between items-center bg-muted/50">
              <h3 className="font-black text-foreground">{editingData ? 'Modifier l\'école' : 'Ajouter une école'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-card rounded-full"><X className="w-5 h-5" /></button>
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

      {detailSchool && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setDetailSchool(null)} />
          <div className="relative w-full max-w-3xl bg-card rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-border/60 flex items-center justify-between bg-muted/50">
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Campus principal
                </p>
                <h3 className="text-2xl font-black text-foreground">{detailSchool.school_name}</h3>
                <p className="text-xs text-muted-foreground">{detailSchool.description || 'Aucune description du moment'}</p>
              </div>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setDetailSchool(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-[1.5rem] border border-border/60 p-4 bg-muted/30 space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">Responsable</p>
                  <p className="font-bold text-foreground">{detailSchool.responsible?.name || 'Non attribué'}</p>
                  <p className="text-xs text-muted-foreground">{detailSchool.responsible?.email || '—'}</p>
                </div>
                <div className="rounded-[1.5rem] border border-border/60 p-4 bg-muted/30 space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">Secteurs</p>
                  <div className="flex flex-wrap gap-2">
                    {(detailSchool.sectors || []).length ? (
                      detailSchool.sectors.map((sector) => (
                        <Badge key={sector.id} className="flex items-center gap-1 border-border/40 text-xs">
                          {sector.sector_name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">Aucun secteur rattaché</span>
                    )}
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-border/60 p-4 bg-muted/30 space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">Contacts clés</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    {detailSchool.responsible?.phone || 'Téléphone non fourni'}
                  </p>
                  <p className="text-xs text-muted-foreground">Visites & rendez-vous sur demande</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">Détails complémentaires</p>
                <div className="rounded-[1.25rem] border border-border/40 p-4 bg-card/70">
                  <p className="text-sm text-muted-foreground">
                    Le campus principal est estimé via les secteurs rattachés. Pour modifier la carte des campus ou ajouter un emplacement, utilisez la fiche de secteur.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
