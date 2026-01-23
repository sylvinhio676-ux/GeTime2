import React, { useEffect, useState, useMemo } from 'react';
import { disponibilityService } from '../../../services/disponibilityService';
import { subjectService } from '../../../services/subjectService';
import { etablishmentService } from '../../../services/etablishmentService';
import DisponibilityForm from './DisponibilityForm';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DeleteIcon, EditIcon, CalendarClock, Search, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/Pagination';
import { specialtyService } from '@/services/specialtyService';
import { levelService } from '@/services/levelService';

export default function DisponibilityList() {
  const [disponibilities, setDisponibilities] = useState([]);
  const [speciality, setSpeciality] = useState([]);
  const [level, SetLevel] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [etablishments, setEtablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [convertingId, setConvertingId] = useState(null);

  const getErrorMessage = (error, fallback) => {
    if (!error) return fallback;
    if (typeof error === 'string') return error;
    return error.message || error.error || fallback;
  };

  const showNotify = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  useEffect(() => {
    fetchSubjects();
    fetchEtablishments();
    fetchDisponibilities();
    fetchSpeciality();
    fetchLevel();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await subjectService.getAll();
      setSubjects(data || []);
    } catch (error) {
      console.error('Failed to fetch subjects', error);
    }
  };

  const fetchEtablishments = async () => {
    try {
      const data = await etablishmentService.getAll();
      setEtablishments(data || []);
    } catch (error) {
      console.error('Failed to fetch etablishments', error);
    }
  };

  const fetchDisponibilities = async () => {
    try {
      setLoading(true);
      const data = await disponibilityService.getAll();
      setDisponibilities(data);
    } catch (error) {
      showNotify(getErrorMessage(error, 'Erreur de chargement des disponibilités'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpeciality = async () => {
    try {
      setLoading(true);
      const data = await specialtyService.getAll();
      setSpeciality(data);
    } catch (error) {
      showNotify(getErrorMessage(error, "Erreur de chargement des disponibilites"), 'error');
    } finally {
      setLoading(false);
    }
  }

  const fetchLevel = async () => {
    try {
      setLoading(true);
      const data = await levelService.getAll();
      SetLevel(data);
    } catch (error) {
      showNotify(getErrorMessage(error, "Erreur de chargement des niveax"), 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (formData) => {
    try {
      await disponibilityService.create(formData);
      showNotify('Disponibilité créée avec succès');
      setShowForm(false);
      fetchDisponibilities();
    } catch (error) {
      showNotify(getErrorMessage(error, 'Erreur lors de la création'), 'error');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await disponibilityService.update(editingId, formData);
      showNotify('Disponibilité mise à jour');
      setEditingId(null);
      setEditingData(null);
      fetchDisponibilities();
      setShowForm(false);
    } catch (error) {
      showNotify(getErrorMessage(error, 'Erreur lors de la modification'), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this disponibility?')) {
      try {
        await disponibilityService.delete(id);
        showNotify('Disponibilité supprimée');
        fetchDisponibilities();
      } catch (error) {
        showNotify(getErrorMessage(error, 'Erreur de suppression'), 'error');
      }
    }
  };

  const handleConvert = async (id) => {
    if (convertingId) return;
    try {
      setConvertingId(id);
      await disponibilityService.convert(id);
      showNotify('Programmation créée à partir de la disponibilité');
      fetchDisponibilities();
    } catch (error) {
      showNotify(getErrorMessage(error, 'Erreur lors de la conversion'), 'error');
    } finally {
      setConvertingId(null);
    }
  };

  const startEdit = (disponibility) => {
    setEditingId(disponibility.id);
    setEditingData(disponibility);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData(null);
    setShowForm(false);
  };

  const filteredDisponibilities = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return disponibilities.filter((d) =>
      d.day?.toLowerCase().includes(term) ||
      d.subject?.subject_name?.toLowerCase().includes(term) ||
      d.etablishment?.etablishment_name?.toLowerCase().includes(term) ||
      d.speciality?.speciality_name?.toLowerCase().includes(term) ||
      d.level?.name_level?.toLowerCase().includes(term)
    );
  }, [disponibilities, searchTerm]);
  const PAGE_SIZE = 10;
  useEffect(() => {
    setPage(1);
  }, [searchTerm, disponibilities.length]);
  const totalPages = Math.max(1, Math.ceil(filteredDisponibilities.length / PAGE_SIZE));
  const pagedDisponibilities = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredDisponibilities.slice(start, start + PAGE_SIZE);
  }, [filteredDisponibilities, page]);
  const currentPageIds = pagedDisponibilities.map((disp) => disp.id);
  const allCurrentSelected =
    currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id));

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllCurrentPage = (value) => {
    if (value) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    } else {
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length || bulkDeleting) return;
    if (!window.confirm('Supprimer toutes les disponibilités sélectionnées ?')) {
      return;
    }
    try {
      setBulkDeleting(true);
      await Promise.all(selectedIds.map((id) => disponibilityService.delete(id)));
      showNotify(`${selectedIds.length} disponibilité(s) supprimée(s)`);
      setSelectedIds([]);subjects
      fetchDisponibilities();
    } catch (error) {
      showNotify(getErrorMessage(error, 'Erreur lors de la suppression groupée'), 'error');
    } finally {
      setBulkDeleting(false);
    }
  };

  if (loading && disponibilities.length === 0) {
    return <div className="p-4 md:p-8 max-w-[1600px] mx-auto"><Progress value={25} className="h-1" /></div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shrink-0">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Disponibilités</h1>
            <p className="text-muted-foreground text-xs md:text-sm font-medium">Gestion des créneaux enseignants</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setEditingData(null);
            setShowForm(true);
          }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-6 h-auto shadow-md gap-2 font-bold transition-all active:scale-95"
        >
          Ajouter une disponibilité
        </Button>
      </div>

      {notification.show && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom-10 ${
          notification.type === 'error' ? 'bg-delta-negative/10 border-delta-negative/20 text-delta-negative' : 'bg-delta-positive/10 border-delta-positive/20 text-delta-positive'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <p className="text-sm font-bold">{notification.message}</p>
          <button onClick={() => setNotification({ ...notification, show: false })} className="ml-4 opacity-50"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border/40 flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
            <input
              type="text"
              placeholder="Rechercher une disponibilité..."
              className="w-full pl-12 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-4 focus:ring-muted/40 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="secondary" className="bg-muted text-foreground/80 border-none font-bold px-4 py-1">
            {filteredDisponibilities.length} Disponibilités
          </Badge>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={!selectedIds.length || bulkDeleting}
              className="rounded-xl px-4 py-2 text-xs font-semibold"
            >
              {bulkDeleting ? 'Suppression...' : 'Supprimer la sélection'}
            </Button>
            {selectedIds.length > 0 && (
              <span className="text-xs font-semibold text-muted-foreground/80">
                {selectedIds.length} sélectionné(s)
              </span>
            )}
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={cancelEdit} />
            <div className="relative w-full max-w-lg bg-card rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
              <div className="p-6 border-b border-border/60 flex justify-between items-center bg-muted/50">
                <h3 className="font-black text-foreground flex items-center gap-2">
                  {editingId ? 'Modifier une disponibilité' : 'Nouvelle disponibilité'}
                </h3>
                <button onClick={cancelEdit} className="p-2 hover:bg-card rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8">
                <DisponibilityForm
                  initialData={editingData}
                  subjects={subjects}
                  etablishments={etablishments}
                  onSubmit={editingId ? handleUpdate : handleCreate}
                  onCancel={cancelEdit}
                  isLoading={loading}
                />
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {filteredDisponibilities.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-muted-foreground/80">
              <CalendarClock className="w-12 h-12 mb-3 opacity-10" />
              <p className="text-sm font-bold">Aucune disponibilité trouvée</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-muted/50 text-muted-foreground/80 text-[10px] uppercase font-black tracking-widest border-b border-border/60">
                <tr>
                  <th className="px-4 py-5">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={allCurrentSelected}
                      onChange={(event) => handleSelectAllCurrentPage(event.target.checked)}
                      aria-label="Sélectionner toutes les disponibilités"
                    />
                  </th>
                  <th className="px-8 py-5">Jour</th>
                  <th className="px-8 py-5">Heure</th>
                  <th className="px-8 py-5">Matière</th>
                  <th className="px-8 py-5">Établissement</th>
                  <th className='px-8 py-5'>Specialite</th>
                  <th className='px-8 py-5'>Niveau</th>
                  <th className="px-8 py-5">Statut</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {pagedDisponibilities.map((disp) => (
                  <tr key={disp.id} className="group transition-colors">
                    <td className="px-4 py-5">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={selectedIds.includes(disp.id)}
                        onChange={() => toggleSelection(disp.id)}
                        aria-label={`Sélectionner la disponibilité ${disp.id}`}
                      />
                    </td>
                    <td className="px-8 py-5 font-bold text-foreground">{disp.day}</td>
                    <td className="px-8 py-5 text-muted-foreground font-medium">
                      {disp.hour_star} - {disp.hour_end}
                    </td>
                    <td className="px-8 py-5 text-foreground font-bold">
                      {disp.subject?.subject_name || '—'}
                    </td>
                    <td className="px-8 py-5 text-muted-foreground font-medium">
                      {disp.etablishment?.etablishment_name || '—'}
                    </td>
                    <td className="px-8 py-5 text-foreground font-bold">
                      {disp.subject?.specialty?.specialty_name || '-'}
                    </td>
                    <td className="px-8 py-5 text-foreground font-bold">
                      {disp.subject?.specialty?.level?.name_level || '-'}
                    </td>
                    <td className="px-8 py-5">
                      <Badge
                        className={`px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] border ${
                          disp.used
                            ? 'border-delta-positive/20 bg-delta-positive/10 text-delta-positive'
                            : 'border-border/40 bg-muted/10 text-muted-foreground'
                        }`}
                      >
                        {disp.used ? 'Programmée' : 'Disponible'}
                      </Badge>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(disp)}
                          className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleConvert(disp.id)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={disp.used || convertingId === disp.id}
                          title="Créer la programmation"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(disp.id)}
                          className="p-2 text-delta-negative hover:bg-delta-negative/10 rounded-lg transition-colors"
                        >
                          <DeleteIcon className="w-4 h-4" />
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
    </div>
  );
}
