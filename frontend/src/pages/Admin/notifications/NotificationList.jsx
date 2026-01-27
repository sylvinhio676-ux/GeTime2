import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  RefreshCcw,
  Archive,
  Trash2,
  Search,
  Wifi,
  FileText,
  BarChart3,
  Clock,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Select from "react-select";
import { notificationService } from "@/services/notificationService";
import { deviceTokenService } from "@/services/deviceTokenService";
import api from "@/services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

const StatusBadge = ({ type, children }) => (
  <span
    className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
      type === "unread" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
    }`}
  >
    {children}
  </span>
);

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | unread | archived
  const [mutating, setMutating] = useState(false);
  const [activeNotification, setActiveNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [advancedFilter, setAdvancedFilter] = useState({
    category: "all",
    entity: "all",
    user: "all",
    from: "",
    to: "",
  });
  const [templates, setTemplates] = useState([]);
  const [statsData, setStatsData] = useState({ total: 0, unread: 0, archived: 0, per_type: {}, per_day: {} });
  const [tokens, setTokens] = useState([]);
  const [history, setHistory] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    message: "",
    scheduled_at: "",
    category: "",
    entity: "",
  });
  const [pushForm, setPushForm] = useState({ title: "", message: "", category: "", tokens: [] });
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const showNotify = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 4000);
  }, []);

  const loadAuditHistory = useCallback(async () => {
    try {
      const response = await api.get("/audit-logs", { params: { module: "notifications", per_page: 5 } });
      setHistory(response.data.data || []);
    } catch (error) {
      console.error("Impossible de charger l'historique", error);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const [list, templateList, statsResponse, tokenList] = await Promise.all([
        notificationService.list(),
        notificationService.templates(),
        notificationService.stats(),
        deviceTokenService.list(),
      ]);
      setNotifications(list);
      setTemplates(templateList);
      setStatsData(statsResponse);
      setTokens(tokenList);
    } catch (error) {
      console.error("Erreur de chargement des notifications", error);
      showNotify("Impossible de charger les notifications", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotify]);

  useEffect(() => {
    loadNotifications();
    loadAuditHistory();
  }, [loadNotifications, loadAuditHistory]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read_at).length, [notifications]);

  const categories = useMemo(() => {
    const set = new Set();
    notifications.forEach((notification) => {
      const category = notification.data?.category ?? "général";
      set.add(category);
    });
    return ["all", ...Array.from(set)];
  }, [notifications]);

  const entities = useMemo(() => {
    const set = new Set();
    notifications.forEach((notification) => {
      const entity = notification.data?.entity ?? notification.data?.etablissement ?? notification.data?.location;
      if (entity) set.add(entity);
    });
    return ["all", ...Array.from(set)];
  }, [notifications]);

  const users = useMemo(() => {
    const set = new Set();
    notifications.forEach((notification) => {
      const userName =
        notification.data?.user?.name ??
        notification.data?.initiator ??
        notification.data?.created_by ??
        notification.data?.owner ??
        "Système";
      if (userName) set.add(userName);
    });
    return ["all", ...Array.from(set)];
  }, [notifications]);

  const tokenOptions = useMemo(
    () =>
      tokens.map((token) => ({
        value: token.token,
        label: `${token.platform ?? "web"} · ${token.token.slice(-6)}`,
      })),
    [tokens]
  );

  const filteredNotifications = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return notifications.filter((notification) => {
      if (filter === "unread" && notification.read_at) return false;
      if (filter === "archived" && !notification.archived_at) return false;
      if (filter === "all" && notification.archived_at) return false;

      if (advancedFilter.category !== "all") {
        if ((notification.data?.category ?? "général") !== advancedFilter.category) return false;
      }
      if (advancedFilter.entity !== "all") {
        const entity = (notification.data?.entity ?? notification.data?.etablissement ?? "").toLowerCase();
        if (!entity.includes(advancedFilter.entity.toLowerCase())) return false;
      }
      if (advancedFilter.user !== "all") {
        const userName =
          notification.data?.user?.name ??
          notification.data?.initiator ??
          notification.data?.created_by ??
          notification.data?.owner ??
          "Système";
        if (userName !== advancedFilter.user) return false;
      }
      if (advancedFilter.from) {
        const from = new Date(advancedFilter.from);
        if (new Date(notification.created_at) < from) return false;
      }
      if (advancedFilter.to) {
        const to = new Date(advancedFilter.to);
        if (new Date(notification.created_at) > to) return false;
      }

      if (!term) return true;
      const haystack = `${notification.data?.title ?? ""} ${notification.data?.message ?? ""} ${
        notification.data?.entity ?? ""
      }`.toLowerCase();
      return haystack.includes(term);
    });
  }, [notifications, filter, advancedFilter, searchTerm]);

  const handleMarkAsRead = async (id, payloadNotification = null) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, read_at: new Date().toISOString() } : item
        )
      );
      if (payloadNotification) {
        setActiveNotification({ ...payloadNotification, read_at: new Date().toISOString() });
      }
    } catch (error) {
      console.error("Erreur lors du marquage comme lu", error);
    }
  };

  const handleArchive = async (id) => {
    try {
      await notificationService.archive(id);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      showNotify("Notification archivée");
    } catch (error) {
      console.error("Impossible d'archiver", error);
      showNotify("Échec de l'archivage", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.destroy(id);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      showNotify("Notification supprimée");
    } catch (error) {
      console.error("Impossible de supprimer", error);
      showNotify("Échec de la suppression", "error");
    }
  };

  const markAll = async () => {
    setMutating(true);
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read_at: new Date().toISOString() })));
      showNotify("Toutes les notifications sont marquées comme lues");
    } catch (error) {
      console.error("Erreur markAll", error);
      showNotify("Impossible de marquer tout comme lu", "error");
    } finally {
      setMutating(false);
    }
  };

  const handleScheduleSubmit = async (event) => {
    event.preventDefault();
    if (!scheduleForm.title || !scheduleForm.message || !scheduleForm.scheduled_at) {
      showNotify("Remplissez tous les champs de planification", "error");
      return;
    }
    setScheduleLoading(true);
    try {
      await notificationService.schedule(scheduleForm);
      showNotify("Notification planifiée");
      setScheduleForm({ title: "", message: "", scheduled_at: "", category: "", entity: "" });
      loadNotifications();
    } catch (error) {
      console.error("Erreur de planification", error);
      showNotify("Échec de la planification", "error");
    } finally {
      setScheduleLoading(false);
    }
  };

  const handlePushSubmit = async (event) => {
    event.preventDefault();
    if (!pushForm.title || !pushForm.message) {
      showNotify("Titre et message obligatoires pour un push", "error");
      return;
    }
    setPushLoading(true);
    try {
      await notificationService.push({
        title: pushForm.title,
        message: pushForm.message,
        category: pushForm.category || "push",
        tokens: pushForm.tokens.length > 0 ? pushForm.tokens : undefined,
      });
      showNotify("Push envoyé");
      setPushForm({ title: "", message: "", category: "", tokens: [] });
    } catch (error) {
      console.error("Impossible d'envoyer le push", error);
      showNotify("Erreur lors de l'envoi du push", "error");
    } finally {
      setPushLoading(false);
    }
  };

  const applyTemplate = (template) => {
    setScheduleForm((prev) => ({
      ...prev,
      title: template.title,
      message: template.message,
      category: template.category ?? prev.category,
    }));
  };

  const scheduleSeries = useMemo(() => {
    return Object.entries(statsData.per_day || {}).map(([day, value]) => ({
      name: day,
      value,
    }));
  }, [statsData]);

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Notifications GeTime2</h1>
            <p className="text-muted-foreground text-xs md:text-sm font-medium">Gérez les alertes, filtres et suivi</p>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <Wifi className="w-4 h-4 text-green-500" />
              <span>Synchronisation automatique</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="secondary" className="text-xs font-black uppercase tracking-[0.4em]">
            {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => loadNotifications()} className="rounded-xl gap-2">
            <RefreshCcw className="w-4 h-4" /> Rafraîchir
          </Button>
          <Button
            onClick={markAll}
            disabled={!unreadCount || mutating}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-3 h-auto shadow-md gap-2 font-bold"
          >
            <CheckCircle2 className="w-4 h-4" /> Tout marquer
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="flex flex-wrap gap-3 items-center p-5 bg-muted/30 border-b border-border/60">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-card text-xs font-medium focus:ring-2 ring-primary/20 outline-none transition-all"
                placeholder="Rechercher par titre, message ou entité..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <Button variant={filter === "all" ? "secondary" : "outline"} size="sm" onClick={() => setFilter("all")}>
              Toutes
            </Button>
            <Button variant={filter === "unread" ? "secondary" : "outline"} size="sm" onClick={() => setFilter("unread")}>
              Non lues
            </Button>
            <Button variant={filter === "archived" ? "secondary" : "outline"} size="sm" onClick={() => setFilter("archived")}>
              Archivées
            </Button>
          </div>
          <div className="p-5 border-b border-border/60 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Catégorie</label>
              <Select
                options={categories.map((item) => ({ value: item, label: item }))}
                value={{ value: advancedFilter.category, label: advancedFilter.category }}
                onChange={(option) => setAdvancedFilter((prev) => ({ ...prev, category: option?.value ?? "all" }))}
                isSearchable={false}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Structure</label>
              <Select
                options={entities.map((item) => ({ value: item, label: item }))}
                value={{ value: advancedFilter.entity, label: advancedFilter.entity }}
                onChange={(option) => setAdvancedFilter((prev) => ({ ...prev, entity: option?.value ?? "all" }))}
                isSearchable={false}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Initiateur</label>
              <Select
                options={users.map((item) => ({ value: item, label: item }))}
                value={{ value: advancedFilter.user, label: advancedFilter.user }}
                onChange={(option) => setAdvancedFilter((prev) => ({ ...prev, user: option?.value ?? "all" }))}
                isSearchable={false}
              />
            </div>
          </div>
          <div className="p-5 border-b border-border/60 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Date de début</label>
              <input
                type="date"
                value={advancedFilter.from}
                onChange={(event) => setAdvancedFilter((prev) => ({ ...prev, from: event.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Date de fin</label>
              <input
                type="date"
                value={advancedFilter.to}
                onChange={(event) => setAdvancedFilter((prev) => ({ ...prev, to: event.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-10 text-center text-xs text-muted-foreground uppercase tracking-[0.4em]">
                <RefreshCcw className="w-6 h-6 mx-auto animate-spin text-primary/60" />
                Chargement...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">Aucune notification</div>
            ) : (
              <div className="divide-y divide-border/60">
                {filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 hover:bg-muted/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className={`text-sm ${item.read_at ? "text-foreground/70" : "text-foreground"} font-black`}>
                          {item.data?.title || "Notification"}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.data?.message}</p>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mt-2">
                          {item.data?.entity ?? "Général"} · {formatDate(item.created_at)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2 items-center">
                          {!item.read_at && <StatusBadge type="unread">Nouveau</StatusBadge>}
                          <Badge variant="ghost" className="text-[10px] font-black uppercase tracking-[0.4em]">
                            {item.data?.category ?? "général"}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleMarkAsRead(item.id, item)}>
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleArchive(item.id)}>
                            <Archive className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-card rounded-[2rem] border border-border shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-foreground/80" />
              <p className="text-sm font-black uppercase tracking-[0.4em] text-muted-foreground">Statistiques</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-muted rounded-2xl">
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Total</p>
                <h3 className="text-2xl font-black">{statsData.total || 0}</h3>
              </div>
              <div className="p-4 bg-muted rounded-2xl">
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Non lus</p>
                <h3 className="text-2xl font-black">{statsData.unread || 0}</h3>
              </div>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scheduleSeries}>
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-2">
              {Object.entries(statsData.per_type || {}).map(([key, value]) => (
                <Badge key={key} variant="secondary" className="text-[10px] font-black uppercase tracking-[0.3em]">
                  {key}: {value}
                </Badge>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-[2rem] border border-border shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-foreground/80" />
              <p className="text-sm font-black uppercase tracking-[0.4em] text-muted-foreground">Templates</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="w-full text-left rounded-2xl border border-border p-4 bg-muted/30 hover:bg-muted transition-colors"
                >
                  <p className="font-bold text-sm">{template.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{template.message}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleScheduleSubmit} className="bg-card rounded-[2rem] border border-border shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-foreground/80" />
              <p className="text-sm font-black uppercase tracking-[0.4em] text-muted-foreground">Planifier</p>
            </div>
            <input
              className="w-full px-4 py-2 rounded-xl border border-border text-sm bg-muted/30 outline-none"
              placeholder="Titre de la notification"
              value={scheduleForm.title}
              onChange={(event) => setScheduleForm((prev) => ({ ...prev, title: event.target.value }))}
            />
            <textarea
              className="w-full px-4 py-2 rounded-xl border border-border text-sm bg-muted/30 outline-none resize-none"
              rows={3}
              placeholder="Contenu détaillé..."
              value={scheduleForm.message}
              onChange={(event) => setScheduleForm((prev) => ({ ...prev, message: event.target.value }))}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="datetime-local"
                className="w-full px-4 py-2 rounded-xl border border-border text-sm bg-muted/30 outline-none"
                value={scheduleForm.scheduled_at}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, scheduled_at: event.target.value }))}
              />
              <input
                className="w-full px-4 py-2 rounded-xl border border-border text-sm bg-muted/30 outline-none"
                placeholder="Catégorie"
                value={scheduleForm.category}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, category: event.target.value }))}
              />
            </div>
            <input
              className="w-full px-4 py-2 rounded-xl border border-border text-sm bg-muted/30 outline-none"
              placeholder="Entité ciblée"
              value={scheduleForm.entity}
              onChange={(event) => setScheduleForm((prev) => ({ ...prev, entity: event.target.value }))}
            />
            <Button type="submit" disabled={scheduleLoading} className="w-full bg-primary text-white rounded-xl font-bold">
              {scheduleLoading ? "Planification..." : "Planifier la notification"}
            </Button>
          </form>

          <form onSubmit={handlePushSubmit} className="bg-card rounded-[2rem] border border-border shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-foreground/80" />
              <p className="text-sm font-black uppercase tracking-[0.4em] text-muted-foreground">Push / Notifications mobiles</p>
            </div>
            <input
              className="w-full px-4 py-2 rounded-xl border border-border text-sm bg-muted/30 outline-none"
              placeholder="Titre du push"
              value={pushForm.title}
              onChange={(event) => setPushForm((prev) => ({ ...prev, title: event.target.value }))}
            />
            <textarea
              className="w-full px-4 py-2 rounded-xl border border-border text-sm bg-muted/30 outline-none resize-none"
              rows={3}
              placeholder="Message du push"
              value={pushForm.message}
              onChange={(event) => setPushForm((prev) => ({ ...prev, message: event.target.value }))}
            />
            <Select
              isMulti
              options={tokenOptions}
              className="text-xs"
              placeholder="Sélectionner des tokens (facultatif)"
              value={tokenOptions.filter((opt) => pushForm.tokens.includes(opt.value))}
              onChange={(selected) =>
                setPushForm((prev) => ({ ...prev, tokens: selected.map((opt) => opt.value) }))
              }
            />
            <Button type="submit" disabled={pushLoading} className="w-full bg-primary text-white rounded-xl font-bold">
              {pushLoading ? "Envoi push..." : "Envoyer un push instantané"}
            </Button>
          </form>

          <div className="bg-card rounded-[2rem] border border-border shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-foreground/80" />
              <p className="text-sm font-black uppercase tracking-[0.4em] text-muted-foreground">Historique audit</p>
            </div>
            <div className="space-y-3">
              {history.map((entry) => (
                <article key={entry.id} className="rounded-xl border border-border/60 p-3 bg-muted/30 text-xs">
                  <p className="font-bold text-foreground">{entry.user?.name || "Système"}</p>
                  <p className="text-muted-foreground">{entry.action}</p>
                  <p className="text-muted-foreground/80 text-[11px]">{formatDate(entry.created_at)}</p>
                </article>
              ))}
              {!history.length && <p className="text-xs text-muted-foreground">Aucun événement récent.</p>}
            </div>
          </div>
        </section>
      </div>

      {notification.show && (
        <div
          className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom-10 ${
            notification.type === "error"
              ? "bg-delta-negative/10 border-delta-negative/20 text-delta-negative"
              : "bg-delta-positive/10 border-delta-positive/20 text-delta-positive"
          }`}
        >
          {notification.type === "error" ? (
            <RefreshCcw className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
          <p className="text-sm font-bold">{notification.message}</p>
        </div>
      )}

      {activeNotification && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm" onClick={() => setActiveNotification(null)}>
          <section className="relative w-full max-w-2xl bg-card border border-border rounded-[2.5rem] shadow-2xl p-6 space-y-4 pointer-events-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Notification</p>
                <h3 className="text-lg font-black">{activeNotification.data?.title}</h3>
              </div>
              <button onClick={() => setActiveNotification(null)} className="text-muted-foreground hover:text-foreground">
                ×
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{activeNotification.data?.message}</p>
            <div className="text-xs text-muted-foreground">Envoyée le {formatDate(activeNotification.created_at)}</div>
          </section>
        </div>
      )}
    </div>
  );
}
