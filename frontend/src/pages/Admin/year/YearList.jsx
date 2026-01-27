import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search, Plus, Download, CheckCircle2, Archive, Trash2,
  ArrowBigDown, ArrowUpDown, Calendar, X
} from "lucide-react";
import { yearService } from "@/services/yearService";
import { schoolService } from "@/services/schoolService";
import { campusService } from "@/services/campusService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import YearForm from "@/pages/Admin/year/YearForm";
import Pagination from "@/components/Pagination";
import Select from "react-select";
import Papa from "papaparse";
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
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [schoolFilter, setSchoolFilter] = useState(null);
  const [campusFilter, setCampusFilter] = useState(null);
  const [sortField, setSortField] = useState("date_star");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(1);
  const [schools, setSchools] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [notification, setNotification] = useState({ visible: false, message: "", type: "success" });

  const navigate = useNavigate();

  const showToast = useCallback((message, type = "success") => {
    setNotification({ visible: true, message, type });
    const timer = setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 4000);
    return () => clearTimeout(timer);
  }, []);

  const loadYears = useCallback(async () => {
    setLoading(true);
    try {
      const data = await yearService.getAll();
      setYears(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast("Erreur lors du chargement des données", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadFilters = useCallback(async () => {
    try {
      const [schoolList, campusList] = await Promise.all([
        schoolService.getAll(),
        campusService.getAll()
      ]);
      setSchools(schoolList || []);
      setCampuses(campusList || []);
    } catch (error) {
      console.error("Filtres non chargés", error);
    }
  }, []);

  useEffect(() => {
    loadYears();
    loadFilters();
  }, [loadYears, loadFilters]);

  const enhanceYears = useMemo(() => {
    const now = new Date();
    return years.map((year) => {
      const start = new Date(year.date_star || year.start_date);
      const end = new Date(year.date_end || year.end_date);
      
      let status = year.status || "active";
      if (status !== "archived") {
        if (!isNaN(end.getTime()) && end < now) status = "archived";
        else if (!isNaN(start.getTime()) && start > now) status = "upcoming";
      }

      return {
        ...year,
        start,
        end,
        status,
        displayName: year.name || ( (!isNaN(start.getTime()) && !isNaN(end.getTime())) ? `${start.getFullYear()}-${end.getFullYear()}` : "Année sans nom")
      };
    });
  }, [years]);

  const filteredYears = useMemo(() => {
    return enhanceYears
      .filter((year) => {
        if (statusFilter !== "all" && year.status !== statusFilter) return false;
        if (schoolFilter && year.school_id !== schoolFilter.value) return false;
        if (campusFilter && year.campus_id !== campusFilter.value) return false;
        
        if (dateRange.from && year.start < new Date(dateRange.from)) return false;
        if (dateRange.to && year.end > new Date(dateRange.to)) return false;

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          return (
            year.displayName.toLowerCase().includes(term) ||
            (year.description?.toLowerCase() || "").includes(term)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const valA = a[sortField] || "";
        const valB = b[sortField] || "";
        const res = (valA instanceof Date) ? valA - valB : String(valA).localeCompare(String(valB));
        return sortDirection === "asc" ? res : -res;
      });
  }, [enhanceYears, statusFilter, schoolFilter, campusFilter, dateRange, searchTerm, sortField, sortDirection]);

  // Pagination
  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredYears.length / PAGE_SIZE));
  const pagedYears = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredYears.slice(start, start + PAGE_SIZE);
  }, [filteredYears, page]);

  const handleSortChange = (field) => {
    setSortDirection(sortField === field && sortDirection === "desc" ? "asc" : "desc");
    setSortField(field);
  };

  const handleSubmit = async (payload) => {
    try {
      editingYear ? await yearService.update(editingYear.id, payload) : await yearService.create(payload);
      showToast(editingYear ? "Année mise à jour" : "Année créée");
      setShowForm(false);
      loadYears();
    } catch (error) {
      showToast("Erreur lors de l'enregistrement", "error");
    }
  };

  const handleExport = () => {
    const data = filteredYears.map(y => ({
      Nom: y.displayName,
      Debut: formatDate(y.start),
      Fin: formatDate(y.end),
      Statut: y.status
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "export_annees.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-card border border-border p-6 rounded-[2rem] shadow-sm">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3">
            <Calendar className="text-primary w-8 h-8" /> Années Académiques
          </h1>
          <p className="text-muted-foreground text-sm font-medium">Gestion et planification des cycles d'études</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <Button onClick={() => { setEditingYear(null); setShowForm(true); }} className="flex-1 lg:flex-none rounded-xl gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Ajouter
          </Button>
          <Button variant="outline" onClick={handleExport} className="flex-1 lg:flex-none rounded-xl gap-2">
            <Download className="w-4 h-4" /> Exporter
          </Button>
        </div>
      </div>

      {/* FILTERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-border space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 ring-primary/20 outline-none text-sm"
              placeholder="Rechercher une année..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleSortChange("displayName")} className="flex-1 text-[10px] font-bold uppercase tracking-widest">
              Nom <ArrowUpDown className="ml-2 w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleSortChange("date_star")} className="flex-1 text-[10px] font-bold uppercase tracking-widest">
              Date <ArrowUpDown className="ml-2 w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border space-y-3">
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-border bg-background text-sm outline-none"
          >
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" className="p-2 rounded-lg border text-xs" value={dateRange.from} onChange={e => setDateRange(p => ({...p, from: e.target.value}))} />
            <input type="date" className="p-2 rounded-lg border text-xs" value={dateRange.to} onChange={e => setDateRange(p => ({...p, to: e.target.value}))} />
          </div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border flex flex-col justify-center gap-2">
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
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 border-b border-border">
              <tr className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">
                <th className="px-6 py-4">Année & Période</th>
                <th className="px-6 py-4 text-center">Statut</th>
                <th className="px-6 py-4 text-center">Actions</th>
                <th className="px-6 py-4 text-right">Programmation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {loading ? (
                <tr><td colSpan="4" className="p-12 text-center text-muted-foreground animate-pulse font-medium">Chargement des données...</td></tr>
              ) : pagedYears.length === 0 ? (
                <tr><td colSpan="4" className="p-12 text-center text-muted-foreground">Aucun résultat trouvé</td></tr>
              ) : (
                pagedYears.map((year) => (
                  <tr key={year.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">{year.displayName}</div>
                      <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
                        {formatDate(year.start)} — {formatDate(year.end)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={year.status === "archived" ? "outline" : "secondary"} className="capitalize font-bold text-[9px] px-2 py-0">
                        {year.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setEditingYear(year); setShowForm(true); }} className="h-8 w-8 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => navigate(`/admin/years/archive/${year.id}`)} className="h-8 w-8 rounded-lg">
                          <Archive className="w-4 h-4 text-orange-500" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => { if(window.confirm('Supprimer ?')) yearService.delete(year.id).then(loadYears) }} className="h-8 w-8 rounded-lg hover:bg-red-50 text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="link" size="sm" onClick={() => navigate(`/dashboard/programmations?year=${year.id}`)} className="text-[10px] font-black uppercase tracking-widest text-primary opacity-70 group-hover:opacity-100 transition-opacity">
                        Voir programmations
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border bg-muted/20">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-card rounded-[2.5rem] border border-border shadow-2xl relative">
            <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full transition-colors z-10">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="p-8">
              <YearForm
                initialData={editingYear}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                isLoading={loading}
              />
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION TOAST */}
      {notification.visible && (
        <div className={`fixed bottom-8 right-8 z-[110] flex items-center p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-right-10 ${
          notification.type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-emerald-50 border-emerald-200 text-emerald-600"
        }`}>
          <span className="text-xs font-black uppercase tracking-widest">{notification.message}</span>
        </div>
      )}
    </div>
  );
}