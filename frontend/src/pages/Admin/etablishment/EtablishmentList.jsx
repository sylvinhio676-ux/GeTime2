import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { etablishmentService } from '../../../services/etablishmentService';
import EtablishmentForm from './EtablishmentForm';
import { Progress } from '@/components/ui/progress';
import { 
  Pencil, Trash2, Plus, Search, Building2, AlertCircle, CheckCircle2, X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/Pagination';

export default function EtablishmentList() {
  const [etablishments, setEtablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const fetchEtablishments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await etablishmentService.getAll();
      setEtablishments(Array.isArray(data) ? data : []);
    } catch (error) {
      showNotify('Erreur lors de la récupération des établissements', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEtablishments();
  }, [fetchEtablishments]);

  const showNotify = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    const timer = setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleFormSubmit = async (formData) => {
    try {
      if (editingData) {
        await etablishmentService.update(editingData.id, formData);
        showNotify('Établissement mis à jour');
      } else {
        await etablishmentService.create(formData);
        showNotify('Établissement ajouté');
      }
      setShowForm(false);
      setEditingData(null);
      fetchEtablishments();
    } catch (error) {
      showNotify(error?.message || 'Une erreur est survenue', 'error');
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer définitivement cet établissement ?')) return;
    try {
      await etablishmentService.delete(id);
      showNotify('Établissement supprimé');
      fetchEtablishments();
    } catch (error) {
      showNotify('Erreur lors de la suppression', 'error');
    }
  };

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return etablishments;
    return etablishments.filter((etab) => {
      return (
        etab.etablishment_name?.toLowerCase().includes(term) ||
        etab.description?.toLowerCase().includes(term) ||
        etab.city?.toLowerCase().includes(term)
      );
    });
  }, [etablishments, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, etablishments.length]);

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-[2rem] border border-border/60 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Établissements</h1>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Gérez les sites et villes</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            onClick={() => { setEditingData(null); setShowForm(true); }}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 py-3 gap-2 flex items-center justify-center font-bold"
          >
            <Plus className="w-4 h-4" /> Ajouter un établissement
          </Button>
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              disabled={bulkDeleting}
              onClick={async () => {
                if (!window.confirm(`Supprimer ${selectedIds.length} établissement(s) ?`)) return;
                setBulkDeleting(true);
                try {
                  await Promise.all(selectedIds.map((id) => etablishmentService.delete(id)));
                  showNotify(`${selectedIds.length} établissement(s) supprimé(s)`);
                  setSelectedIds([]);
                  fetchEtablishments();
                } catch (error) {
                  showNotify(error?.message || 'Erreur de suppression multiple', 'error');
                } finally {
                  setBulkDeleting(false);
                }
              }}
            >
              {bulkDeleting ? 'Suppression...' : `Supprimer (${selectedIds.length})`}
            </Button>
          )}
        </div>
      </div>

      {notification.show && (
        <div className={`fixed bottom-4 right-4 z-[100] flex items-center gap-3 p-3 rounded-2xl border shadow-2xl ${
          notification.type === 'error'
            ? 'bg-delta-negative/10 border-delta-negative/20 text-delta-negative'
            : 'bg-delta-positive/10 border-delta-positive/20 text-delta-positive'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <p className="text-xs font-bold">{notification.message}</p>
          <button onClick={() => setNotification({ ...notification, show: false })} className="text-muted-foreground opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border/40 flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
            <input
              type="text"
              placeholder="Rechercher par nom, ville ou description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:ring-2 focus:ring-muted/40 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="outline" className="px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.4em]">
            {filtered.length} établissements
          </Badge>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground/70 uppercase tracking-[0.4em]">
              <Progress value={55} className="h-1 mb-3" />
              Chargement...
            </div>
          ) : paged.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-muted-foreground/70 gap-2">
              <Building2 className="w-12 h-12 opacity-20" />
              <p className="text-sm font-bold">Aucun établissement trouvé</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[640px]">
              <thead className="bg-muted/50 text-muted-foreground/80 text-[10px] uppercase font-black tracking-[0.2em] border-b border-border/60">
                <tr>
                  <th className="px-4 py-4 w-10">
                    <input
                      type="checkbox"
                      className="rounded border border-border"
                      disabled={bulkDeleting}
                      checked={selectedIds.length > 0 && selectedIds.length === paged.length}
                      onChange={(event) => {
                        setSelectedIds(event.target.checked ? paged.map((row) => row.id) : []);
                      }}
                    />
                  </th>
                  <th className="px-4 py-4">Nom</th>
                  <th className="px-4 py-4">Ville</th>
                  <th className="px-4 py-4">Description</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-sm">
                {paged.map((etab) => (
                  <tr key={etab.id} className="group hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        className="rounded border border-border"
                        checked={selectedIds.includes(etab.id)}
                        disabled={bulkDeleting}
                        onChange={() =>
                          setSelectedIds((prev) =>
                            prev.includes(etab.id)
                              ? prev.filter((id) => id !== etab.id)
                              : [...prev, etab.id]
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-foreground">{etab.etablishment_name}</span>
                    </td>
                    <td className="px-4 py-4">{etab.city || '—'}</td>
                    <td className="px-4 py-4 text-muted-foreground line-clamp-2">{etab.description || 'Aucune description'}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setEditingData(etab); setShowForm(true); }}
                          className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(etab.id)}
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

        <div className="px-4 py-4 bg-muted/30 border-t border-border/60">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-xl bg-card rounded-[2rem] border border-border shadow-2xl p-6">
            <EtablishmentForm
              initialData={editingData}
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditingData(null); }}
              isLoading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
