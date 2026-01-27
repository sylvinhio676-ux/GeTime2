import React, { useEffect, useMemo, useState } from "react";
import { History, Search, ArrowUpDown, Download } from "lucide-react";
import { auditLogService } from "@/services/auditLogService";
import Pagination from "@/components/Pagination";
import Papa from "papaparse";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MODULE_OPTIONS = [
  { value: "", label: "Tous les modules" },
  { value: "programmations", label: "Programmations" },
  { value: "disponibilities", label: "Disponibilités" },
  { value: "subjects", label: "Matières" },
  { value: "teachers", label: "Enseignants" },
  { value: "rooms", label: "Salles" },
  { value: "specialties", label: "Spécialités" },
  { value: "sectors", label: "Secteurs" },
  { value: "campuses", label: "Campus" },
  { value: "schools", label: "Écoles" },
  { value: "users", label: "Utilisateurs" },
  { value: "years", label: "Années" },
];

export default function AuditLogList() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [page, setPage] = useState(1);
  const [moduleFilter, setModuleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | unread | archived
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedLog, setSelectedLog] = useState(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data, meta: responseMeta } = await auditLogService.list({
        page,
        module: moduleFilter || undefined,
      });
      setLogs(data);
      setMeta(responseMeta);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, moduleFilter]);

  useEffect(() => {
    setPage(1);
  }, [moduleFilter]);

  const parsedLogs = useMemo(() => {
    return logs.map((log) => {
      const actionTypeMatch = log.action?.match(/\b(CREATE|UPDATE|DELETE|DESTROY|VIEW|LOGIN|LOGOUT)\b/i);
      const actionType = actionTypeMatch ? actionTypeMatch[0].toUpperCase() : "OTHER";
      return { ...log, actionType };
    });
  }, [logs]);

  const users = useMemo(() => {
    return ["all", ...new Set(parsedLogs.map((log) => log.user?.name || "Système"))];
  }, [parsedLogs]);

  const actionTypes = useMemo(() => {
    return ["all", ...new Set(parsedLogs.map((log) => log.actionType || "OTHER"))];
  }, [parsedLogs]);

  const filteredLogs = useMemo(() => {
    const term = search.toLowerCase();
    return parsedLogs
      .filter((log) => {
        if (filter === "all" && log.archived) return false;
        if (filter === "unread" && log.read_at) return false;
        if (filter === "archived" && !log.archived) return false;

        if (actionFilter !== "all" && log.actionType !== actionFilter) return false;
        if (userFilter !== "all" && (log.user?.name || "Système") !== userFilter) return false;
        if (dateFrom && new Date(log.created_at) < new Date(dateFrom)) return false;
        if (dateTo && new Date(log.created_at) > new Date(dateTo)) return false;

        if (!term) return true;
        const haystack = `${log.action} ${log.user?.name || ""} ${log.module}`;
        return haystack.toLowerCase().includes(term);
      })
      .sort((a, b) => {
        const fieldA = a[sortField];
        const fieldB = b[sortField];
        if (fieldA === fieldB) return 0;
        const comparison =
          sortField === "created_at"
            ? new Date(fieldA) - new Date(fieldB)
            : ("" + fieldA).localeCompare(fieldB);
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [
    parsedLogs,
    filter,
    search,
    actionFilter,
    userFilter,
    dateFrom,
    dateTo,
    sortField,
    sortDirection,
  ]);

  const groupedLogs = useMemo(() => {
    return filteredLogs.reduce((acc, log) => {
      const day = new Date(log.created_at).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
      if (!acc[day]) acc[day] = [];
      acc[day].push(log);
      return acc;
    }, {});
  }, [filteredLogs]);

  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleExport = () => {
    const csv = Papa.unparse(
      filteredLogs.map((log) => ({
        action: log.action,
        user: log.user?.name || "Système",
        module: log.module,
        created_at: log.created_at,
      }))
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Historique</h1>
            <p className="text-muted-foreground text-xs md:text-sm font-medium">Audit des actions sur la plateforme</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border/60 flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/40">
          <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-10 pr-3 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-4 focus:ring-muted/40 outline-none"
              />
            </div>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full md:w-56 px-3 py-2.5 border border-border rounded-xl text-sm text-foreground/80 bg-card"
            >
              {MODULE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <Button variant={filter === "all" ? "secondary" : "outline"} size="sm" onClick={() => setFilter("all")}>
              Toutes
            </Button>
            <Button variant={filter === "unread" ? "secondary" : "outline"} size="sm" onClick={() => setFilter("unread")}>
              Non lues
            </Button>
            <Button variant={filter === "archived" ? "secondary" : "outline"} size="sm" onClick={() => setFilter("archived")}>
              Archivées
            </Button>
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        </div>
        <div className="p-5 border-b border-border/60 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Action</label>
              <select
                value={actionFilter}
                onChange={(event) => setActionFilter(event.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm"
              >
                {actionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Utilisateur</label>
              <select
                value={userFilter}
                onChange={(event) => setUserFilter(event.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm"
              >
                {users.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-card text-xs"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-card text-xs"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => handleSortChange("created_at")}>
              <ArrowUpDown className="w-4 h-4" />
              Date
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleSortChange("action")}>
              <ArrowUpDown className="w-4 h-4" />
              Action
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-muted-foreground/80">Chargement...</div>
        ) : Object.keys(groupedLogs).length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground/80">Aucune action trouvée.</div>
        ) : (
          Object.entries(groupedLogs).map(([day, logsForDay]) => (
            <div key={day} className="border-b border-border/60">
              <div className="px-6 py-3 bg-muted/50 text-xs uppercase tracking-[0.4em] font-black text-muted-foreground">
                {day}
              </div>
              {logsForDay.map((log) => (
                <button
                  key={log.id}
                  type="button"
                  className="w-full px-6 py-4 grid grid-cols-[1fr_auto] gap-3 hover:bg-muted/60 transition-colors"
                  onClick={() => setSelectedLog(log)}
                >
                  <div>
                    <p className="text-sm font-bold text-foreground">{log.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {log.user?.name || "Système"} • {new Date(log.created_at).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Badge variant="ghost" className="text-[10px] uppercase tracking-[0.3em]">
                      {log.actionType}
                    </Badge>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{log.module}</span>
                  </div>
                </button>
              ))}
            </div>
          ))
        )}
        <Pagination page={page} totalPages={meta.last_page || 1} onPageChange={setPage} />
      </div>
      {selectedLog && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-[2.5rem] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Détail</p>
                <h3 className="text-lg font-black text-foreground">{selectedLog.action}</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-muted-foreground hover:text-foreground text-xl">
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p>
                <span className="font-black">Utilisateur :</span> {selectedLog.user?.name || "Système"}
              </p>
              <p>
                <span className="font-black">Module :</span> {selectedLog.module}
              </p>
              <p>
                <span className="font-black">Action :</span> {selectedLog.actionType}
              </p>
              <p>
                <span className="font-black">Horodatage :</span>{" "}
                {new Date(selectedLog.created_at).toLocaleString("fr-FR")}
              </p>
            </div>
            <pre className="max-h-60 overflow-y-auto text-xs text-muted-foreground bg-muted/40 rounded-xl p-3 border border-border">
              {JSON.stringify(selectedLog.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
