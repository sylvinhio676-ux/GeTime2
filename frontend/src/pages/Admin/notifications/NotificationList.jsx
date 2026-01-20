import React, { useEffect, useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationService } from "@/services/notificationService";

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const markAsRead = async (id) => {
    await notificationService.markRead(id);
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read_at: new Date().toISOString() } : item))
    );
  };

  const markAll = async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((item) => ({ ...item, read_at: new Date().toISOString() })));
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
        <Button
          onClick={markAll}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-3 h-auto shadow-md gap-2 font-bold"
        >
          <CheckCircle2 className="w-4 h-4" />
          Tout marquer comme lu
        </Button>
      </div>

      <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground/80">Chargement...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground/80">Aucune notification.</div>
        ) : (
          <div className="divide-y divide-border/60">
            {notifications.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => markAsRead(item.id)}
                className="w-full text-left p-5 hover:bg-muted/60 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-sm font-bold ${item.read_at ? "text-foreground/80" : "text-foreground"}`}>
                      {item.data?.title || "Notification"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{item.data?.message}</p>
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
    </div>
  );
}
