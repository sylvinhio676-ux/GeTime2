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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
            <p className="text-slate-500 text-xs md:text-sm font-medium">Suivi des actions clés</p>
          </div>
        </div>
        <Button
          onClick={markAll}
          className="bg-blue-700 hover:bg-blue-800 text-white rounded-xl px-6 py-3 h-auto shadow-md gap-2 font-bold"
        >
          <CheckCircle2 className="w-4 h-4" />
          Tout marquer comme lu
        </Button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-slate-400">Chargement...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-sm text-slate-400">Aucune notification.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => markAsRead(item.id)}
                className="w-full text-left p-5 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-sm font-bold ${item.read_at ? "text-slate-700" : "text-slate-900"}`}>
                      {item.data?.title || "Notification"}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">{item.data?.message}</p>
                  </div>
                  {!item.read_at && (
                    <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
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
