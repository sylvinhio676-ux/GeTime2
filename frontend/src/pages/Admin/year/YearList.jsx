import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search, Plus, CheckCircle2, Trash2,
  ArrowUpDown, Calendar, X, CheckSquare, Square,
  PencilIcon
} from "lucide-react";
import { yearService } from "@/services/yearService";
import { schoolService } from "@/services/schoolService";
import { campusService } from "@/services/campusService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import YearForm from "@/pages/Admin/year/YearForm";
import Pagination from "@/components/Pagination";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

const STATUSES = [
  { value: "all", label: "Tous les statuts" },
  { value: "active", label: "Actif" },
  { value: "archived", label: "Archivé" },
  { value: "upcoming", label: "À venir" },
];

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return isNaN(date.getTime()) ? "—" : date.toLocaleDateString("fr-FR");
};

export default function YearList() {
  const [years, setYears] = useState([]);
  const [schools, setSchools] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [notification, setNotification] = useState({ visible: false, message: "", type: "success" });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState(null);
  const [campusFilter, setCampusFilter] = useState(null);
  const [sortField, setSortField] = useState("date_star");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  const PAGE_SIZE = 10;
  const navigate = useNavigate();

  const showToast = useCallback((message, type = "success") => {
    setNotification({ visible: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 4000);
  }, []);

  const loadYears = useCallback(async () => {
    setLoading(true);
    try {
      const data = await yearService.getAll();
      setYears(Array.isArray(data) ? data : []);
      setSelectedIds([]); 
    } catch {
      showToast("Erreur de chargement", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [sList, cList] = await Promise.all([schoolService.getAll(), campusService.getAll()]);
        setSchools(sList || []);
        setCampuses(cList || []);
      } catch (err) { console.error(err); }
    };
    loadYears();
    loadFilters();
  }, [loadYears]);

  const filteredYears = useMemo(() => {
    return years
      .map(y => ({
        ...y,
        displayName: y.name || "Année Académique",
        // On utilise la valeur réelle de la BDD. Si c'est vide, on met 'inconnu'
        cStatus: y.status || "inconnu" 
      }))
      .filter(y => {
        if (statusFilter !== "all" && y.cStatus !== statusFilter) return false;
        // ... reste du filtre (school, campus, search)
        return true;
      })
      .sort((a, b) => {
        const res = String(a[sortField]).localeCompare(String(b[sortField]));
        return sortDirection === "asc" ? res : -res;
      });
  }, [years, statusFilter, schoolFilter, campusFilter, searchTerm, sortField, sortDirection]);
    const pagedYears = filteredYears.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleBulkDelete = async () => {
    if (!window.confirm(`Supprimer ${selectedIds.length} éléments ?`)) return;
    try {
      await Promise.all(selectedIds.map(id => yearService.delete(id)));
      showToast("Suppression réussie");
      loadYears();
    } catch { showToast("Erreur lors de la suppression", "error"); }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 landing-rise">
      
      {/* Barre flottante Premium */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-dark text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-subtle-in border border-primary/30">
          <span className="text-sm font-bold tracking-wider">{selectedIds.length} SÉLECTIONNÉS</span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="rounded-xl">Supprimer</Button>
          <button onClick={() => setSelectedIds([])}><X className="w-5 h-5 opacity-50 hover:opacity-100" /></button>
        </div>
      )}

      {/* Header avec ton style .premium-card */}
      <div className="flex justify-between items-center premium-card p-6">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3 text-primary">
            <Calendar className="w-8 h-8" /> Années Académiques
          </h1>
          <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] mt-1 font-bold">Gestion des cycles d'études</p>
        </div>
        <Button onClick={() => { setEditingYear(null); setShowForm(true); }} className="rounded-xl gap-2 px-6">
          <Plus className="w-4 h-4" /> Ajouter
        </Button>
      </div>

      {/* Grille de Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="premium-card p-3 flex items-center px-4 bg-surface">
          <Search className="w-4 h-4 text-muted-foreground mr-3" />
          <input className="bg-transparent text-sm outline-none w-full" placeholder="Recherche rapide..." onChange={e => setSearchTerm(e.target.value)} />
        </div>
        
        <Select 
          placeholder="École..." 
          className="text-sm"
          isClearable 
          options={schools.map(s => ({ value: s.id, label: s.school_name }))} 
          onChange={setSchoolFilter} 
        />

        <Select 
          placeholder="Campus..." 
          className="text-sm"
          isClearable 
          options={campuses.map(c => ({ value: c.id, label: c.campus_name }))} 
          onChange={setCampusFilter} 
        />

        <select className="premium-card p-2.5 text-sm bg-surface outline-none" onChange={e => setStatusFilter(e.target.value)}>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Tableau Style Academic */}
      <div className="premium-card overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-muted/50 border-b border-border">
            <tr className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
              <th className="px-6 py-4 w-12">
                <button onClick={() => setSelectedIds(selectedIds.length === pagedYears.length ? [] : pagedYears.map(y => y.id))}>
                  {selectedIds.length === pagedYears.length && pagedYears.length > 0 ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5" />}
                </button>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:text-primary transition-colors" onClick={() => {
                setSortField("displayName");
                setSortDirection(sortDirection === "asc" ? "desc" : "asc");
              }}>Année & Période <ArrowUpDown className="inline w-3 h-3 ml-1" /></th>
              <th className="px-6 py-4 text-center">Statut</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-sm">
            {loading ? (
              <tr><td colSpan="4" className="p-12 text-center animate-pulse text-muted-foreground font-bold">Synchronisation...</td></tr>
            ) : pagedYears.map(year => (
              <tr key={year.id} className={`transition-all ${selectedIds.includes(year.id) ? 'bg-primary/5' : 'hover:bg-muted/30'}`}>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => setSelectedIds(prev => prev.includes(year.id) ? prev.filter(id => id !== year.id) : [...prev, year.id])}>
                    {selectedIds.includes(year.id) ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5" />}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-foreground cursor-pointer" onClick={() => navigate(`/dashboard/programmations?year=${year.id}`)}>{year.displayName}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{formatDate(year.date_star)} — {formatDate(year.date_end)}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <Badge 
                    variant="outline" 
                    className={`text-[9px] font-bold uppercase px-3 py-1 rounded-full ${
                      year.cStatus === 'active' 
                        ? 'border-green-500 text-green-500 bg-green-50/50' 
                        : year.cStatus === 'upcoming'
                        ? 'border-blue-500 text-blue-500 bg-blue-50/50'
                        : 'border-slate-400 text-slate-400 bg-slate-50'
                    }`}
                  >
                    {/* Traduction rapide pour l'affichage */}
                    {year.cStatus === 'active' ? 'Actif' : 
                    year.cStatus === 'upcoming' ? 'À venir' : 
                    year.cStatus === 'unactive' ? 'Inactive' : year.cStatus}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-center">
                   <div className="flex justify-center gap-1">
                     <Button size="icon" variant="ghost" onClick={() => { setEditingYear(year); setShowForm(true); }} className="hover:bg-primary/10 transition-colors">
                       <PencilIcon className="w-4 h-4 text-secondary" />
                     </Button>
                     <Button size="icon" variant="ghost" onClick={() => { if(window.confirm('Supprimer cette année ?')) yearService.delete(year.id).then(loadYears); }} className="hover:bg-destructive/10">
                       <Trash2 className="w-4 h-4 text-destructive" />
                     </Button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 bg-muted/20 border-t border-border">
          <Pagination page={page} totalPages={Math.max(1, Math.ceil(filteredYears.length / PAGE_SIZE))} onPageChange={setPage} />
        </div>
      </div>

      {/* Modal avec .form-card */}
      {showForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-subtle-in">
          <div className="relative w-full max-w-lg sm:w-[480px]">
            <div className="form-card w-full relative">
              <button className="absolute top-5 right-5 p-2 hover:bg-muted rounded-full" onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
              <h2 className="text-xl font-black text-primary mb-2">{editingYear ? "Modifier" : "Nouvelle Année"}</h2>
              <YearForm initialData={editingYear} onSubmit={(p) => {
                const action = editingYear ? yearService.update(editingYear.id, p) : yearService.create(p);
                action.then(() => { loadYears(); setShowForm(false); showToast("Enregistré"); });
              }} onCancel={() => setShowForm(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification.visible && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-2xl border-2 z-[120] animate-subtle-in shadow-2xl bg-surface ${notification.type === 'error' ? 'border-danger text-danger' : 'border-delta-positive text-delta-positive'}`}>
          <p className="text-xs font-black uppercase tracking-widest">{notification.message}</p>
        </div>
      )}
    </div>
  );
}
