import React, { useEffect, useMemo, useState, useRef } from 'react';
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
  Tag,
  DownloadCloud,
  Upload,
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
  const [selectedIds, setSelectedIds] = useState([]);
  const totalSectors = sectors.length;
  const fileInputRef = useRef(null);

  const selectedSectors = useMemo(
    () => sectors.filter((sector) => selectedIds.includes(sector.id)),
    [sectors, selectedIds]
  );

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => sectors.some((sector) => sector.id === id)));
  }, [sectors]);

  const withPlanningCount = useMemo(
    () => sectors.filter((sector) => (sector.specialities?.length ?? 0) > 0).length,
    [sectors]
  );

  const percentWithPlanning = totalSectors ? Math.round((withPlanningCount / totalSectors) * 100) : 0;
  const percentValidated = percentWithPlanning;
  const percentPending = totalSectors ? 100 - percentValidated : 0;

  const coverageBySchool = useMemo(() => {
    if (totalSectors === 0) return [];
    const grouped = sectors.reduce((acc, sector) => {
      const name = sector.school?.school_name || 'Sans école';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.min(100, Math.round((count / totalSectors) * 100)),
      }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 4);
  }, [sectors, totalSectors]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length || !window.confirm(`Supprimer ${selectedIds.length} filière(s) ?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => sectorService.delete(id)));
      showNotify('Sélection supprimée');
      setSelectedIds([]);
      refreshSectors();
    } catch (error) {
      showNotify(getErrorMessage(error, 'Impossible de supprimer la sélection'), 'error');
    }
  };

  const handleExportSelected = () => {
    if (!selectedSectors.length) {
      showNotify('Sélectionnez des filières à exporter', 'error');
      return;
    }
    const csvRows = [
      ['Filière', 'Code', 'École', 'Spécialités'],
      ...selectedSectors.map((sector) => [
        sector.sector_name || '',
        sector.code || '',
        sector.school?.school_name || '',
        (sector.specialities || []).map((spec) => spec.specialty_name).join(' / '),
      ]),
    ];
    const csvContent = csvRows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'secteurs_export.csv';
    a.click();
    URL.revokeObjectURL(url);
    showNotify(`${selectedSectors.length} filière(s) exportée(s)`);
  };

  const handleExportAll = () => {
    if (!filteredSectors.length) {
      showNotify('Aucune filière à exporter', 'error');
      return;
    }
    const csvRows = [
      ['Filière', 'Code', 'École', 'Spécialités'],
      ...filteredSectors.map((sector) => [
        sector.sector_name || '',
        sector.code || '',
        sector.school?.school_name || '',
        (sector.specialities || []).map((spec) => spec.specialty_name).join(' / '),
      ]),
    ];
    const csvContent = csvRows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'secteurs_export.csv';
    a.click();
    URL.revokeObjectURL(url);
    showNotify(`Export terminé (${filteredSectors.length} filière(s))`);
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result || '';
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length);
      if (lines.length <= 1) {
        showNotify('Fichier invalide ou vide', 'error');
        return;
      }
      const delimiter = lines[0].includes(';') ? ';' : ',';
      const headers = lines[0]
        .split(delimiter)
        .map((header) => header.trim().toLowerCase());
      const rows = lines.slice(1).map((line) => line.split(delimiter).map((cell) => cell.trim()));
      const payloads = rows.map((values) => {
        const record = {};
        headers.forEach((header, index) => {
          record[header] = values[index] ?? '';
        });
        const schoolName = record.school;
        const school = schools.find((item) => item.school_name?.toLowerCase() === (schoolName || '').toLowerCase());
        return {
          sector_name: record.sector_name || record.name,
          code: record.code,
          school_id: school?.id ?? null,
        };
      });
      try {
        await Promise.all(payloads.map((payload) => sectorService.create(payload)));
        showNotify(`${payloads.length} filière(s) importée(s)`);
        refreshSectors();
      } catch (error) {
        showNotify(getErrorMessage(error, 'Erreur lors de l’import CSV'), 'error');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      showNotify('Impossible de lire le fichier', 'error');
    };
    reader.readAsText(file, 'utf-8');
  };

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
    return sectors.filter((s) =>
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

  const allSelected = pagedSectors.length > 0 && pagedSectors.every((sector) => selectedIds.includes(sector.id));

  const toggleSelectAll = () => {
    if (!pagedSectors.length) return;
    if (allSelected) {
      const pageIds = pagedSectors.map((sector) => sector.id);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pagedSectors.map((sector) => sector.id)])]);
    }
  };

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
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              setEditingData(null);
              setShowForm(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-6 h-auto shadow-md gap-2 font-bold transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" /> Ajouter une filière
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="rounded-xl gap-2"
          >
            <Upload className="w-4 h-4" /> Import CSV
          </Button>
          <Button
            onClick={handleExportAll}
            variant="outline"
            className="rounded-xl gap-2"
          >
            <DownloadCloud className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />

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
            {filteredSectors.length} Secteur{filteredSectors.length > 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card/70 p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Secteurs totaux</p>
            <h3 className="text-3xl font-black text-foreground">{totalSectors}</h3>
            <p className="text-sm text-muted-foreground">Actifs dans le système</p>
          </div>
          <div className="rounded-2xl border border-border bg-card/70 p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Avec planning</p>
            <div className="flex items-center justify-between text-sm text-foreground">
              <span>{withPlanningCount} filière{withPlanningCount > 1 ? 's' : ''}</span>
              <span className="text-xs text-muted-foreground">{percentWithPlanning}%</span>
            </div>
            <Progress value={percentWithPlanning} className="h-2" />
          </div>
          <div className="rounded-2xl border border-border bg-card/70 p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Statut validation</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{percentValidated}% validés</span>
              <span className="text-xs text-muted-foreground">{percentPending}% en attente</span>
            </div>
            <Progress value={percentValidated} className="h-2" />
          </div>
        </div>

        <div className="p-5 grid gap-4 md:grid-cols-2 border-b border-border/60">
          {coverageBySchool.length === 0 ? (
            <div className="text-sm text-muted-foreground">Aucune école associée</div>
          ) : (
            coverageBySchool.map((school) => (
              <div key={school.name} className="space-y-2">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-muted-foreground">
                  <span>{school.name}</span>
                  <span>{school.percent}%</span>
                </div>
                <Progress value={school.percent} className="h-2" />
              </div>
            ))
          )}
        </div>

        {selectedIds.length > 0 && (
          <div className="p-4 border-b border-border/60 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-semibold text-foreground">{selectedIds.length} sélectionnée(s)</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleBulkDelete} className="gap-2">
                <Trash2 className="w-4 h-4" /> Supprimer la sélection
              </Button>
              <Button variant="secondary" onClick={handleExportSelected} className="gap-2">
                <DownloadCloud className="w-4 h-4" /> Exporter la sélection
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {filteredSectors.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-muted-foreground/80">
              <Tag className="w-12 h-12 mb-3 opacity-10" />
              <p className="text-sm font-bold">Aucune filière trouvée</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-muted/50 text-muted-foreground/80 text-[10px] uppercase font-black tracking-widest border-b border-border/60">
                <tr>
                  <th className="px-5 py-4">
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                  </th>
                  <th className="px-8 py-5">Filière / Secteur</th>
                  <th className="px-8 py-5">Code</th>
                  <th className="px-8 py-5">École de rattachement</th>
                  <th className="px-8 py-5">Statut</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {pagedSectors.map((sector) => {
                  const hasPlanning = (sector.specialities?.length ?? 0) > 0;
                  return (
                    <tr key={sector.id} className="group  transition-colors">
                      <td className="px-5 py-4" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(sector.id)}
                          onChange={() => toggleSelect(sector.id)}
                        />
                      </td>
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
                      <td className="px-8 py-5">
                        <Badge
                          variant="outline"
                          className={`font-black text-[11px] uppercase tracking-[0.3em] border px-3 py-1 ${
                            hasPlanning
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-amber-200 bg-amber-50 text-amber-700'
                          }`}
                        >
                          {hasPlanning ? 'Planifié' : 'En attente'}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingData(sector);
                              setShowForm(true);
                            }}
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
                  );
                })}
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
