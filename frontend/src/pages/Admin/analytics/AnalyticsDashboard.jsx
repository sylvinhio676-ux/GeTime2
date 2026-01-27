import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { CalendarDays, MapPin, Sparkles, Clock } from "lucide-react";
import { analyticsService } from "@/services/analyticsService";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const formatSeconds = (seconds) => {
  if (!seconds) return "0s";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
};

const formatDistance = (meters) => `${(meters / 1000).toFixed(2)} km`;

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [topCampuses, setTopCampuses] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [usage, campuses, sessions] = await Promise.all([
        analyticsService.getUsageMetrics(),
        analyticsService.getTopCampuses(),
        analyticsService.getRecentSessions(),
      ]);
      setMetrics(usage);
      setTopCampuses(campuses);
      setRecentSessions(sessions);
    } catch (error) {
      console.error("Erreur lors du chargement des analyses", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">Chargement des statistiques...</div>
    );
  }

  const sessionsPerDay = metrics?.sessions_per_day ?? [];
  const totalSessions = metrics?.total_sessions ?? 0;

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-[2rem] border border-border shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Tableau analytique</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Usage & tracking</p>
        </div>
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.4em]">
          <Sparkles className="w-4 h-4 text-primary" />
          Derniers {recentSessions.length} sessions
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5 space-y-2">
          <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Sessions</div>
          <div className="text-3xl font-black">{totalSessions}</div>
          <p className="text-xs text-muted-foreground">Total depuis la création</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 space-y-2">
          <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Durée moyenne</div>
          <div className="text-3xl font-black">{formatSeconds(metrics?.avg_duration_seconds)}</div>
          <p className="text-xs text-muted-foreground">Temps moyen de session</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 space-y-2">
          <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Distance / session</div>
          <div className="text-3xl font-black">{formatDistance(metrics?.avg_distance_m)}</div>
          <p className="text-xs text-muted-foreground">Métrique moyenne parcourue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="bg-card rounded-[2rem] border border-border shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-[0.3em] text-muted-foreground">Sessions par jour</h3>
            <Clock className="w-5 h-5 text-foreground/80" />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionsPerDay}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(value) => `${value} session(s)`} />
                <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-[2rem] border border-border shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-[0.3em] text-muted-foreground">Top campus</h3>
            <MapPin className="w-5 h-5 text-foreground/80" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={topCampuses}
                dataKey="sessions"
                nameKey="campus_name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {topCampuses.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} session(s)`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {topCampuses.map((campus) => (
              <div key={campus.campus_name} className="flex items-center justify-between text-sm">
                <span>{campus.campus_name}</span>
                <span className="text-muted-foreground">{campus.sessions} sessions</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border/60">
          <h3 className="text-lg font-black uppercase tracking-[0.3em] text-muted-foreground">Dernières sessions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-[0.4em]">
              <tr>
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Campus</th>
                <th className="px-4 py-3">Durée</th>
                <th className="px-4 py-3">Distance</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {recentSessions.map((session) => (
                <tr key={session.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">{session.user || "Anonyme"}</td>
                  <td className="px-4 py-3">{session.campus || "—"}</td>
                  <td className="px-4 py-3">{formatSeconds(session.duration_seconds)}</td>
                  <td className="px-4 py-3">{formatDistance(session.distance_m)}</td>
                  <td className="px-4 py-3">{new Date(session.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!recentSessions.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-xs text-muted-foreground">
                    Aucun enregistrement récent.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
