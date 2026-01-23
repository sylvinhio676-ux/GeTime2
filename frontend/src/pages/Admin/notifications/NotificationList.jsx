import React, { useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notificationService } from "@/services/notificationService";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [mutating, setMutating] = useState(false);
  const [activeNotification, setActiveNotification] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.list();
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read_at).length, [notifications]);
  const filteredNotifications = useMemo(
    () => notifications.filter((item) => (filter === "unread" ? !item.read_at : true)),
    [filter, notifications]
  );

  const markAsRead = async (id, payloadNotification = null) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read_at: new Date().toISOString() } : item))
      );
      if (payloadNotification) {
        setActiveNotification({ ...payloadNotification, read_at: new Date().toISOString() });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const markAll = async () => {
    setMutating(true);
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read_at: new Date().toISOString() })));
    } catch (error) {
      console.error(error);
    } finally {
      setMutating(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Notifications</h1>
            <p className="text-muted-foreground text-xs md:text-sm font-medium">Suivi des actions clés</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs font-black uppercase tracking-[0.4em]">
            {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
          </Badge>
          <Button
            onClick={fetchNotifications}
            variant="outline"
            className="rounded-xl px-4 py-2 h-auto gap-2 border-border"
          >
            <RefreshCcw className="w-4 h-4" /> Rafraîchir
          </Button>
          <Button
            onClick={markAll}
            disabled={!unreadCount || mutating}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-3 h-auto shadow-md gap-2 font-bold"
          >
            <CheckCircle2 className="w-4 h-4" /> Tout marquer comme lu
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 p-4 bg-muted/10 border-b border-border/60">
          <Button variant={filter === "all" ? "secondary" : "outline"} size="sm" onClick={() => setFilter("all")}>
            Toutes
          </Button>
          <Button variant={filter === "unread" ? "secondary" : "outline"} size="sm" onClick={() => setFilter("unread")}>
            Non lues
          </Button>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground/80">Chargement...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground/80">
            {filter === "unread" ? "Aucune notification non lue." : "Aucune notification."}
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredNotifications.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => markAsRead(item.id, item)}
                className="w-full text-left p-5 hover:bg-muted/60 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-sm font-bold ${item.read_at ? "text-foreground/70" : "text-foreground"}`}>
                      {item.data?.title || "Notification"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{item.data?.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(item.created_at)}</p>
                  </div>
                  {!item.read_at && (
                    <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Nouveau
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {activeNotification && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveNotification(null)} />
          <section className="relative w-full max-w-md mx-4 bg-card border border-border shadow-2xl rounded-[2rem] overflow-hidden pointer-events-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Notification</p>
                <h3 className="text-lg font-black text-foreground">{activeNotification.data?.title}</h3>
              </div>
              <button onClick={() => setActiveNotification(null)} className="text-muted-foreground hover:text-foreground">
                ×
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{activeNotification.data?.message}</p>
            <div className="space-y-3">
              {(activeNotification.data?.slots ?? []).map((slot, index) => (
                <article key={index} className="border border-border rounded-2xl p-4 bg-muted/20">
                  <div className="flex items-center justify-between text-[12px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
                    <span>Créneau #{index + 1}</span>
                    <span>{slot.day ?? "Demain"}</span>
                  </div>
                  <p className="font-semibold text-foreground">
                    {slot.subject} · {slot.hour_star} - {slot.hour_end}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Spécialité : {slot.specialty ?? "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Salle : {slot.room ?? "—"} · Campus : {slot.campus ?? "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Établissement : {slot.etablishment ?? "—"}
                  </p>
                </article>
              ))}
            </div>
            <div className="text-right">
              <Button onClick={() => setActiveNotification(null)} variant="secondary">
                Fermer
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
