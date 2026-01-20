import React, { useEffect, useMemo, useState } from "react";
import { History, Search } from "lucide-react";
import { auditLogService } from "@/services/auditLogService";
import Pagination from "@/components/Pagination";

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
  const [loading, setLoading] = useState(true);

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

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    const term = search.toLowerCase();
    return logs.filter((log) =>
      `${log.action} ${log.user?.name || ""}`.toLowerCase().includes(term)
    );
  }, [logs, search]);

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
          <span className="text-xs font-bold text-muted-foreground">
            {meta.total || filteredLogs.length} actions
          </span>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-muted-foreground/80">Chargement...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground/80">Aucune action trouvée.</div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredLogs.map((log) => (
              <div key={log.id} className="px-6 py-4">
                <p className="text-sm font-bold text-foreground">{log.action}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {log.user?.name || "Système"} • {new Date(log.created_at).toLocaleString("fr-FR")}
                </p>
              </div>
            ))}
          </div>
        )}
        <Pagination page={page} totalPages={meta.last_page || 1} onPageChange={setPage} />
      </div>
    </div>
  );
}
