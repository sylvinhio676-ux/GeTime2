import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { specialtyService } from '../../../services/specialtyService';
import { sectorService } from '../../../services/sectorService';
import { programmersService } from '../../../services/programmerService';
import { levelService } from '../../../services/levelService';
import SpecialtyForm from './SpecialtyForm';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/useAuth';
import Pagination from '@/components/Pagination';
import {
  DeleteIcon,
  EditIcon,
  GraduationCap,
  Search,
  AlertCircle,
  CheckCircle2,
  X,
  Upload,
  DownloadCloud,
  Bell,
} from 'lucide-react';

const RESPONSIBLE_OPTIONS = [
  { value: 'all', label: 'Responsable' },
  { value: 'assigned', label: 'Affecté' },
  { value: 'unassigned', label: 'Non affecté' },
];

export default function SpecialtyList() {
  const [specialties, setSpecialties] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [programmers, setProgrammers] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    sectorId: '',
    levelId: '',
    responsible: 'all',
    code: '',
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [drawerSpecialty, setDrawerSpecialty] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin') || hasRole('super_admin');

  const getErrorMessage = (error, fallback) => {
    if (!error) return fallback;
    if (typeof error === 'string') return error;
    return error.message || error.error || fallback;
  };

  const showNotify = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const fetchSectors = async () => {
    try {
      const data = await (isAdmin ? sectorService.getAll() : sectorService.getForTeacher());
      setSectors(data || []);
    } catch (error) {
      console.error('Failed to fetch sectors', error);
    }
  };

  const fetchProgrammers = async () => {
    try {
      const data = await (isAdmin ? programmersService.getAll() : programmersService.getForTeacher());
      setProgrammers(data || []);
    } catch (error) {
      console.error('Failed to fetch programmers', error);
    }
  };

  const fetchLevels = async () => {
    try {
      const data = await (isAdmin ? levelService.getAll() : levelService.getForTeacher());
      setLevels(data || []);
    } catch (error) {
      console.error('Failed to fetch levels', error);
    }
  };

  const fetchSpecialties = async () => {
    try {
      setLoading(true);
      const data = await specialtyService.getAll();
      setSpecialties(data || []);
    } catch (error) {
      showNotify(getErrorMessage(error, 'Erreur de chargement des spécialités'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
    fetchProgrammers();
    fetchLevels();
    fetchSpecialties();
  }, []);

  const startEdit = (specialty) => {
    setEditingId(specialty.id);
    setEditingData(specialty);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData(null);
    setShowForm(false);
  };

  const handleCreate = async (formData) => {
    try {
      await specialtyService.create(formData);
      showNotify('Spécialité créée avec succès');
      setShowForm(false);
      fetchSpecialties();
    } catch (error) {
      showNotify(getErrorMessage(error, 'Erreur lors de la création'), 'error');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await specialtyService.update(editingId, formData);
      showNotify('Spécialité mise à jour');
      setEditingId(null);
      setEditingData(null);
      setShowForm(false);
      fetchSpecialties();
    } catch (error) {
      showNotify(getErrorMessage(error, 'Erreur lors de la modification'), 'error');
    }
  };

  const handleStaticDelete = async (id) => {
    if (!window.confirm('Supprimer cette spécialité ?')) return;
    try {
      await specialtyService.delete(id);
      showNotify('Spécialité supprimée');
      fetchSpecialties();
    } catch (error) {
      showNotify(getErrorMessage(error, 'Erreur de suppression'), 'error');
    }
  };

  const schools = useMemo(() => {
    const map = new Map();
    sectors.forEach((sector) => {
      const school = sector.school;
      if (school && !map.has(school.id)) {
        map.set(school.id, school);
      }
    });
    return Array.from(map.values());
  }, [sectors]);

  const filteredSpecialties = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return specialties.filter((specialty) => {
      if (
        term &&
        ![
          specialty.specialty_name,
          specialty.code,
          specialty.description,
          specialty.sector?.sector_name,
          specialty.programmer?.user?.name,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term))
      ) {
        return false;
      }

      if (filters.sectorId && String(specialty.sector?.id) !== filters.sectorId) {
        return false;
      }
      if (filters.levelId && String(specialty.level?.id) !== filters.levelId) {
        return false;
      }
      if (filters.responsible === 'assigned' && !specialty.programmer) {
        return false;
      }
      if (filters.responsible === 'unassigned' && specialty.programmer) {
        return false;
      }
      if (filters.code && String(specialty.code).toLowerCase() !== filters.code.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [specialties, filters, searchTerm]);

  const PAGE_SIZE = 10;
  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    filters.sectorId,
    filters.levelId,
    filters.responsible,
    filters.code,
    specialties.length,
  ]);
  const totalPages = Math.max(1, Math.ceil(filteredSpecialties.length / PAGE_SIZE));
  const pagedSpecialties = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredSpecialties.slice(start, start + PAGE_SIZE);
  }, [filteredSpecialties, page]);

  const totalSpecialties = specialties.length;
  const planningCount = useMemo(
    () => specialties.filter((specialty) => (specialty.programmations?.length ?? 0) > 0).length,
    [specialties]
  );
  const percentWithPlanning = totalSpecialties ? Math.round((planningCount / totalSpecialties) * 100) : 0;
  const withoutRoomCount = useMemo(
    () =>
      specialties.filter((specialty) =>
        (specialty.programmations ?? []).some((programmation) => !programmation.room_id)
      ).length,
    [specialties]
  );
  const percentWithoutRoom = totalSpecialties ? Math.round((withoutRoomCount / totalSpecialties) * 100) : 0;
  const levelsDistribution = useMemo(() => {
    if (!specialties.length) return [];
    const map = new Map();
    specialties.forEach((specialty) => {
      const label = specialty.level?.level_name || 'Sans niveau';
      map.set(label, (map.get(label) ?? 0) + 1);
    });
    return Array.from(map, ([name, count]) => ({
      name,
      count,
      percent: totalSpecialties ? Math.round((count / totalSpecialties) * 100) : 0,
    })).slice(0, 4);
  }, [specialties, totalSpecialties]);

  const coverageByLevel = levelsDistribution;

  const allSelected = pagedSpecialties.length > 0 && pagedSpecialties.every((specialty) => selectedIds.includes(specialty.id));

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (!pagedSpecialties.length) return;
    if (allSelected) {
      const pageIds = pagedSpecialties.map((specialty) => specialty.id);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
      return;
    }
    setSelectedIds((prev) => [...new Set([...prev, ...pagedSpecialties.map((specialty) => specialty.id)])]);
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Supprimer ${selectedIds.length} spécialité(s) ?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => specialtyService.delete(id)));
      showNotify('Sélection supprimée');
      setSelectedIds([]);
      fetchSpecialties();
    } catch (error) {
      showNotify(getErrorMessage(error, 'Impossible de supprimer la sélection'), 'error');
    }
  };

  const handleBulkNotify = () => {
    if (!selectedIds.length) {
      showNotify('Sélectionnez d’abord des spécialités', 'error');
      return;
    }
    showNotify(`Notifications prêtes pour ${selectedIds.length} spécialité(s)`);
  };

  const handleExport = () => {
    if (!filteredSpecialties.length) {
      showNotify('Aucune spécialité à exporter', 'error');
      return;
    }
    const rows = [
      ['Nom', 'Code', 'Secteur', 'École', 'Niveau'],
      ...filteredSpecialties.map((specialty) => [
        specialty.specialty_name || '',
        specialty.code || '',
        specialty.sector?.sector_name || '',
        specialty.sector?.school?.school_name || '',
        specialty.level?.level_name || 'N/A',
      ]),
    ];
    const csvContent = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'specialites_export.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    showNotify(`${filteredSpecialties.length} spécialité(s) exportée(s)`);
  };

  const handleImport = (event) => {
    const file = event.target?.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result || '';
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length);
      if (lines.length <= 1) {
        showNotify('Fichier invalide', 'error');
        setImporting(false);
        return;
      }
      const delimiter = lines[0].includes(';') ? ';' : ',';
      const headers = lines[0]
        .split(delimiter)
        .map((header) => header.trim().toLowerCase());
      const rows = lines.slice(1).map((line) => line.split(delimiter).map((cell) => cell.trim()));
      const payloads = rows
        .map((cells) => {
        const record = {};
        headers.forEach((header, index) => {
          record[header] = cells[index] ?? '';
        });
        const sectorName = record.sector;
        const levelName = record.level;
        const programmerReg = record.programmer || record.programmer_registration_number;
        const sector = sectors.find((item) =>
          item.sector_name?.toLowerCase() === (sectorName || '').toLowerCase()
        );
        const level = levels.find((item) =>
          item.level_name?.toLowerCase() === (levelName || '').toLowerCase()
        );
        const programmer = programmers.find((item) =>
          item.registration_number?.toLowerCase() === (programmerReg || '').toLowerCase()
        );
        const specialtyName = record.specialty_name || record.name;
        if (!specialtyName || !record.code) return null;
          return {
            specialty_name: specialtyName,
            code: record.code,
            description: record.description || '',
            number_student: Number(record.number_student) || 0,
            sector_id: sector?.id ?? null,
            level_id: level?.id ?? null,
            programmer_id: programmer?.id ?? null,
          };
      })
        .filter(Boolean);
      try {
        if (!payloads.length) {
          showNotify('Aucune ligne valide trouvée', 'error');
          return;
        }
        await Promise.all(payloads.map((payload) => specialtyService.create(payload)));
        showNotify(`${payloads.length} spécialité(s) importée(s)`);
        fetchSpecialties();
      } catch (error) {
        showNotify(getErrorMessage(error, 'Import partiel ou échoué'), 'error');
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      showNotify('Impossible de lire le fichier', 'error');
      setImporting(false);
    };
    reader.readAsText(file, 'utf-8');
  };

  const openDrawer = (specialty) => setDrawerSpecialty(specialty);
  const closeDrawer = () => setDrawerSpecialty(null);

  const handleRowClick = (specialty) => {
    openDrawer(specialty);
  };

  if (loading && !specialties.length) {
    return <div className="p-4 md:p-8 max-w-[1600px] mx-auto"><Progress value={30} className="h-1" /></div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Spécialités</h1>
            <p className="text-muted-foreground text-xs md:text-sm font-medium">Gestion des filières spécialisées</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <Button
              onClick={() => {
                setEditingId(null);
                setEditingData(null);
                setShowForm(true);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-6 h-auto shadow-md gap-2 font-bold transition-all active:scale-95"
            >
              Ajouter une spécialité
            </Button>
          )}
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="rounded-xl gap-2"
          >
            <Upload className="w-4 h-4" /> Import CSV
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            className="rounded-xl gap-2"
          >
            <DownloadCloud className="w-4 h-4" /> Export CSV
          </Button>
        </div>
        <input ref={fileInputRef} type="file" className="hidden" accept=".csv" onChange={handleImport} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Total</p>
          <h2 className="text-3xl font-black text-foreground">{totalSpecialties}</h2>
          <p className="text-sm text-muted-foreground">Spécialités enregistrées</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Planning</p>
          <div className="flex items-center justify-between text-sm text-foreground">
            <span>{planningCount} avec programme</span>
            <span className="text-xs text-muted-foreground">{percentWithPlanning}%</span>
          </div>
          <Progress value={percentWithPlanning} className="h-2" />
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Sans salle</p>
          <div className="flex items-center justify-between text-sm text-foreground">
            <span>{withoutRoomCount} à vérifier</span>
            <span className="text-xs text-muted-foreground">{percentWithoutRoom}%</span>
          </div>
          <Progress value={percentWithoutRoom} className="h-2" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {coverageByLevel.map((levelData) => (
          <div key={levelData.name} className="rounded-2xl border border-border bg-card/60 p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-muted-foreground">
              <span>{levelData.name}</span>
              <span>{levelData.percent}%</span>
            </div>
            <Progress value={levelData.percent} className="h-2" />
          </div>
        ))}
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
        <div className="p-5 grid gap-3 md:grid-cols-4 items-end">
          <div className="flex flex-col space-y-1">
            <p className="text-[9px] uppercase tracking-[0.5em] text-muted-foreground">Secteur</p>
            <select
              value={filters.sectorId}
              onChange={(event) => setFilters((prev) => ({ ...prev, sectorId: event.target.value }))}
              className="rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground"
            >
              <option value="">Tous les secteurs</option>
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>{sector.sector_name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-1">
            <p className="text-[9px] uppercase tracking-[0.5em] text-muted-foreground">Niveau</p>
            <select
              value={filters.levelId}
              onChange={(event) => setFilters((prev) => ({ ...prev, levelId: event.target.value }))}
              className="rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground"
            >
              <option value="">Tous les niveaux</option>
              {levels.map((level) => (
                <option key={level.id} value={level.id}>{level.level_name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-1">
            <p className="text-[9px] uppercase tracking-[0.5em] text-muted-foreground">Responsable</p>
            <select
              value={filters.responsible}
              onChange={(event) => setFilters((prev) => ({ ...prev, responsible: event.target.value }))}
              className="rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground"
            >
              {RESPONSIBLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-1 md:col-span-2">
            <p className="text-[9px] uppercase tracking-[0.5em] text-muted-foreground">Code</p>
            <input
              type="text"
              value={filters.code}
              onChange={(event) => setFilters((prev) => ({ ...prev, code: event.target.value }))}
              placeholder="Filtrer par code exact"
              className="rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground"
            />
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="p-4 border-b border-border/60 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">{selectedIds.length} sélectionnée(s)</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2" onClick={handleBulkNotify}>
                <Bell className="w-4 h-4" /> Notifier
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleBulkDelete}>
                <DeleteIcon className="w-4 h-4" /> Supprimer
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {filteredSpecialties.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-muted-foreground/80">
              <GraduationCap className="w-12 h-12 mb-3 opacity-10" />
              <p className="text-sm font-bold">Aucune spécialité trouvée</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[950px]">
              <thead className="bg-muted/50 text-muted-foreground/80 text-[10px] uppercase font-black tracking-widest border-b border-border/60">
                <tr>
                  <th className="px-5 py-4">
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                  </th>
                  <th className="px-8 py-5">Spécialité</th>
                  <th className="px-8 py-5">Code</th>
                  <th className="px-8 py-5">Niveau</th>
                  <th className="px-8 py-5">Secteur / École</th>
                  <th className="px-8 py-5">Responsable</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {pagedSpecialties.map((specialty) => {
                  return (
                    <tr
                      key={specialty.id}
                      className="group hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(specialty)}
                    >
                      <td className="px-5 py-4" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(specialty.id)}
                          onChange={() => toggleSelect(specialty.id)}
                        />
                      </td>
                      <td className="px-8 py-5">
                        <div className="font-bold text-foreground">{specialty.specialty_name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <span>{specialty.number_student ?? '—'} étudiants</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <Badge variant="outline" className="font-mono text-muted-foreground border-border/60 bg-muted/30">
                          {specialty.code || '—'}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-muted-foreground font-medium">{specialty.level?.level_name || '—'}</td>
                      <td className="px-8 py-5">
                        <div className="text-muted-foreground font-medium">{specialty.sector?.sector_name || '—'}</div>
                        <div className="text-xs text-muted-foreground/70">{specialty.sector?.school?.school_name || 'École non assignée'}</div>
                      </td>
                      <td className="px-8 py-5 text-muted-foreground font-medium">
                        {specialty.programmer?.user?.name || 'Sans responsable'}
                      </td>
                      <td className="px-8 py-5 text-right" onClick={(event) => event.stopPropagation()}>
                        {isAdmin && (
                          <div className="flex justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEdit(specialty)}
                              className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                            >
                              <EditIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStaticDelete(specialty.id)}
                              className="p-2 text-delta-negative hover:bg-delta-negative/10 rounded-lg transition-colors"
                            >
                              <DeleteIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showForm && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={cancelEdit} />
          <div className="relative w-full max-w-lg bg-card rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-6 border-b border-border/60 flex justify-between items-center bg-muted/50">
              <h3 className="font-black text-foreground tracking-tight">
                {editingId ? 'Modifier la spécialité' : 'Nouvelle spécialité'}
              </h3>
              <button onClick={cancelEdit} className="p-2 hover:bg-card rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8">
              <SpecialtyForm
                initialData={editingData}
                sectors={sectors}
                programmers={programmers}
                levels={levels}
                onSubmit={editingId ? handleUpdate : handleCreate}
                onCancel={cancelEdit}
                isLoading={loading}
              />
            </div>
          </div>
        </div>
      )}

      {drawerSpecialty && (
        <div className="fixed inset-0 z-[90] flex">
          <div className="flex-1" onClick={closeDrawer} />
          <div className="w-full max-w-md bg-card border border-border rounded-l-[2rem] shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Détails</p>
                <h2 className="text-xl font-black text-foreground">{drawerSpecialty.specialty_name}</h2>
              </div>
              <button onClick={closeDrawer} className="text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p><span className="font-semibold text-foreground">Code : </span>{drawerSpecialty.code || '—'}</p>
              <p><span className="font-semibold text-foreground">Secteur : </span>{drawerSpecialty.sector?.sector_name || '—'}</p>
              <p><span className="font-semibold text-foreground">École : </span>{drawerSpecialty.sector?.school?.school_name || '—'}</p>
              <p><span className="font-semibold text-foreground">Responsable : </span>{drawerSpecialty.programmer?.user?.name || '—'}</p>
            </div>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground uppercase tracking-[0.3em]">Enseignants & disponibilités</div>
              {(drawerSpecialty.subjects || []).map((subject) => (
                <div key={subject.id} className="rounded-xl border border-border/60 bg-card/50 p-3">
                  <p className="font-semibold text-foreground">{subject.subject_name}</p>
                  <p className="text-xs text-muted-foreground">Enseignant : {subject.teacher?.user?.name || 'Non assigné'}</p>
                  <p className="text-xs text-muted-foreground">Heures hebdo : {subject.hour_by_week ?? 0}</p>
                  {(subject.disponibilities || []).map((disp) => (
                    <p key={disp.id} className="text-[11px] text-muted-foreground">{disp.day?.toString() || disp.day} · {disp.hour_star} - {disp.hour_end}</p>
                  ))}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.assign(`/dashboard/disponibilities?specialty=${drawerSpecialty.id}`)}
            >
              Voir les disponibilités
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => window.location.assign(`/dashboard/programmations?specialty=${drawerSpecialty.id}`)}
            >
              Voir les emplois du temps
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
