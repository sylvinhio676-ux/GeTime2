import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCircle2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "@/services/notificationService";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [prevUnread, setPrevUnread] = useState(0);
  const [pulse, setPulse] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read_at).length,
    [notifications]
  );

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

  useEffect(() => {
    const timer = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (unreadCount > prevUnread) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const oscillator = ctx.createOscillator();
          const gain = ctx.createGain();
          oscillator.type = "sine";
          oscillator.frequency.value = 880;
          gain.gain.value = 0.08;
          oscillator.connect(gain);
          gain.connect(ctx.destination);
          oscillator.start();
          oscillator.stop(ctx.currentTime + 0.12);
          oscillator.onended = () => ctx.close();
        }
      } catch {
        // ignore audio errors (autoplay restrictions)
      }
      setPulse(true);
      setTimeout(() => setPulse(false), 1200);
    }
    setPrevUnread(unreadCount);
  }, [unreadCount, prevUnread]);

  useEffect(() => {
    if (!open) return;
    const planning = notifications.find(
      (item) => item.data?.type?.startsWith("programmation_")
    );
    if (planning) {
      setSelected(planning);
    }
  }, [open, notifications]);

  useEffect(() => {
    const handleClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAsRead = async (item) => {
    if (!item.read_at) {
      await notificationService.markRead(item.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
    }
  };

  const openNotification = async (item) => {
    await markAsRead(item);
    setSelected(item);
    if (item.data?.action_url) {
      try {
        const target = new URL(item.data.action_url, window.location.origin);
        const path = `${target.pathname}${target.search}${target.hash}`;
        if (target.origin === window.location.origin) {
          navigate(path);
        } else {
          window.location.href = target.href;
        }
      } catch {
        navigate(item.data.action_url);
      }
      setOpen(false);
    }
  };

  const markAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, read_at: new Date().toISOString() }))
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 ${
          pulse ? "ring-2 ring-blue-300" : ""
        }`}
      >
        <Bell className="h-5 w-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-700 text-[10px] font-black text-white shadow ${
            pulse ? "animate-pulse" : ""
          }`}>
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[360px] max-w-[90vw] rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Notifications
            </p>
            <button
              type="button"
              onClick={markAllRead}
              className="flex items-center gap-1 text-[10px] font-bold text-blue-700"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Tout lire
            </button>
          </div>
          {loading ? (
            <div className="p-4 text-xs text-slate-400">Chargement...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-xs text-slate-400">Aucune notification.</div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openNotification(item)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50"
                >
                  <p className={`text-sm font-bold ${item.read_at ? "text-slate-700" : "text-slate-900"}`}>
                    {item.data?.title || "Notification"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{item.data?.message}</p>
                </button>
              ))}
            </div>
          )}
          {selected && (
            <div className="border-t border-slate-100 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Détail
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900">
                {selected.data?.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">{selected.data?.message}</p>
              {selected.data?.action_url && (
                <button
                  type="button"
                  onClick={() => openNotification(selected)}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Ouvrir le planning
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
