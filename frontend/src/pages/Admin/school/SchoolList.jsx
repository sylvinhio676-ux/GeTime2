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
        <div className={`fixed bottom-4 left-4 right-4 sm:bottom-4 sm:right-4 sm:left-auto z-[100] flex items-center gap-3 p-3 sm:p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom-4 max-w-sm sm:max-w-md ${
          notification.type === 'error' ? 'bg-delta-negative/10 border-delta-negative/20 text-delta-negative' : 'bg-delta-positive/10 border-delta-positive/20 text-delta-positive'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
          <p className="text-xs sm:text-sm font-bold flex-1">{notification.message}</p>
          <button onClick={() => setNotification({ ...notification, show: false })} className="ml-2 sm:ml-4 opacity-50 hover:opacity-100 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
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

        {/* VUE TABLETTE / DESKTOP */}
        <div className="overflow-x-auto hidden md:block">
          {filteredSchools.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-muted-foreground/80">
              <School2 className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-bold tracking-tight">Aucun résultat trouvé</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[600px] lg:min-w-[700px]">
              <thead className="bg-muted/50 text-muted-foreground/80 text-[10px] uppercase font-black tracking-[0.15em] border-b border-border/60">
                <tr>
                  <th className="px-4 lg:px-8 py-4">Nom de l'École</th>
                  <th className="px-4 lg:px-8 py-4 hidden lg:table-cell">Description</th>
                  <th className="px-4 lg:px-8 py-4">Responsable</th>
                  <th className="px-4 lg:px-8 py-4 text-right">Filiere</th>
                  <th className="px-4 lg:px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {pagedSchools.map((school) => (
                  <tr key={school.id} className="group hover:bg-muted/50 transition-colors">
                    <td className="px-4 lg:px-8 py-4 lg:py-5">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs">
                            {school.school_name?.substring(0, 2).toUpperCase()}
                         </div>
                         <div className="min-w-0 flex-1">
                           <p className="font-bold text-foreground tracking-tight text-sm lg:text-base truncate">{school.school_name}</p>
                           <p className="text-xs text-muted-foreground lg:hidden line-clamp-1">{school.description || 'Aucune description'}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-8 py-4 hidden lg:table-cell">
                      <p className="text-sm text-muted-foreground font-medium line-clamp-2 max-w-xs">
                        {school.description || 'Aucune description'}
                      </p>
                    </td>
                    <td className="px-4 lg:px-8 py-4 text-sm text-foreground font-semibold">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-bold text-sm lg:text-base">{school.responsible?.name || 'Non attribué'}</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">{school.responsible?.email || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-8 py-4 text-right">
                      <Badge className="rounded-lg bg-muted text-muted-foreground text-xs font-black uppercase tracking-[0.25em]">
                        {school.sectors_count ?? 0} {school.sectors_count > 1 ? 'Filieres' : 'Filiere'}
                      </Badge>
                    </td>
                    <td className="px-4 lg:px-8 py-4 text-right">
                      <div className="flex justify-end gap-1 lg:gap-2">
                        <button 
                          onClick={() => { setEditingData(school); setShowForm(true); }}
                          className="p-1.5 lg:p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(school.id)}
                          className="p-1.5 lg:p-2 text-delta-negative hover:bg-delta-negative/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        </button>
                        <button
                          onClick={() => setDetailSchool(school)}
                          className="text-xs rounded-full border border-border/60 px-2 lg:px-3 py-1 text-muted-foreground hover:border-primary hover:text-primary transition-all hidden lg:inline-flex"
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

        {/* VUE MOBILE */}
        <div className="md:hidden px-4 sm:px-5 py-4 sm:py-6 space-y-4">
          {filteredSchools.length === 0 ? (
            <div className="flex flex-col items-center text-muted-foreground/80 py-12">
              <School2 className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-bold tracking-tight">Aucun résultat trouvé</p>
            </div>
          ) : (
            pagedSchools.map((school) => (
              <article key={`mobile-${school.id}`} className="border border-border/60 rounded-[1.5rem] bg-card/80 p-4 space-y-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground flex-shrink-0">
                      {school.school_name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-base text-foreground truncate">{school.school_name}</p>
                      <Badge variant="secondary" className="text-xs uppercase tracking-wide mt-1 inline-block">
                        {school.sectors_count ?? 0} {school.sectors_count > 1 ? 'secteurs' : 'secteur'}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant={school.status === 'active' ? 'secondary' : 'destructive'} className="capitalize text-xs flex-shrink-0">
                    {school.status || 'Actif'}
                  </Badge>
                </div>
                
                {school.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {school.description}
                  </p>
                )}
                
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Responsable</span>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{school.responsible?.name || 'Non attribué'}</p>
                    {school.responsible?.email && (
                      <p className="text-xs text-muted-foreground truncate">{school.responsible.email}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border/40">
                  <button
                    onClick={() => { setEditingData(school); setShowForm(true); }}
                    className="flex-1 text-center rounded-xl border border-border/60 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(school.id)}
                    className="flex-1 text-center rounded-xl border border-delta-negative/50 px-4 py-2.5 text-sm font-medium text-delta-negative hover:bg-delta-negative/10 transition-all"
                  >
                    Supprimer
                  </button>
                  <button
                    onClick={() => setDetailSchool(school)}
                    className="flex-1 text-center rounded-xl border border-primary/50 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-all"
                  >
                    Voir détails
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* --- FORM MODAL RESPONSIVE --- */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl animate-in zoom-in-95 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-6 border-b border-border/60 flex justify-between items-center bg-muted/50 flex-shrink-0">
              <h3 className="font-black text-foreground text-lg sm:text-xl">{editingData ? 'Modifier l\'école' : 'Ajouter une école'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-card rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setDetailSchool(null)} />
          <div className="relative w-full max-w-4xl bg-card rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-6 border-b border-border/60 flex items-start sm:items-center justify-between bg-muted/50 flex-shrink-0 gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4" /> Campus principal
                </p>
                <h3 className="text-xl sm:text-2xl font-black text-foreground truncate">{detailSchool.school_name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{detailSchool.description || 'Aucune description du moment'}</p>
              </div>
              <button
                className="text-muted-foreground hover:text-foreground p-2 hover:bg-card rounded-full transition-colors flex-shrink-0"
                onClick={() => setDetailSchool(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-[1.25rem] border border-border/60 p-4 bg-muted/30 space-y-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Responsable</p>
                  <div>
                    <p className="font-bold text-foreground text-sm sm:text-base">{detailSchool.responsible?.name || 'Non attribué'}</p>
                    <p className="text-xs text-muted-foreground mt-1">{detailSchool.responsible?.email || '—'}</p>
                  </div>
                </div>
                <div className="rounded-[1.25rem] border border-border/60 p-4 bg-muted/30 space-y-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Secteurs rattachés</p>
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
                <div className="rounded-[1.25rem] border border-border/60 p-4 bg-muted/30 space-y-3 sm:col-span-2 lg:col-span-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Contacts clés</p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {detailSchool.responsible?.phone || 'Téléphone non fourni'}
                    </p>
                    <p className="text-xs text-muted-foreground">Visites & rendez-vous sur demande</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Détails complémentaires</p>
                <div className="rounded-[1rem] border border-border/40 p-4 bg-card/70">
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
