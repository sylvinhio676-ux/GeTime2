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
import { automationService } from "@/services/automationService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock3, AlertTriangle, ListChecks } from "lucide-react";

const COLORS = ["#0088FE", "#FF8042", "#00C49F"];

export default function AutomationReport() {
  const [latest, setLatest] = useState(null);
  const [runs, setRuns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [latestRun, history, statData] = await Promise.all([
          automationService.getLatestRun(),
          automationService.getRuns(),
          automationService.getStats(),
        ]);
        setLatest(latestRun);
        setRuns(history);
        setStats(statData);
      } catch (error) {
        console.error("Erreur analytics", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pieData = [
    { name: "Publié", value: latest?.published_count || 0, color: COLORS[0] },
    { name: "Conflits", value: latest?.conflicts_count || 0, color: COLORS[1] },
    { name: "Alertes quota", value: latest?.quota_alerts_count || 0, color: COLORS[2] },
  ];

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground">Chargement...</div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6 animate-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-foreground">Automation Report</h1>
        <p className="text-sm text-muted-foreground">
          Statistiques et anomalies de la publication automatique des programmations.
        </p>
      </div>

      {latest && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-muted-foreground">
              <ListChecks className="w-4 h-4 text-primary" /> Séances publiées
            </div>
            <div className="text-3xl font-black">{latest.published_count}</div>
            <div className="text-xs text-muted-foreground">
              exécution #{latest.id} le {new Date(latest.created_at).toLocaleString()}
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-muted-foreground">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Conflits
            </div>
            <div className="text-3xl font-black">{latest.conflicts_count}</div>
            <div className="text-xs text-muted-foreground">Détails dans le tableau</div>
          </Card>
          <Card>
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-muted-foreground">
              <Clock3 className="w-4 h-4 text-emerald-500" /> Alertes quotas
            </div>
            <div className="text-3xl font-black">{latest.quota_alerts_count}</div>
            <div className="text-xs text-muted-foreground">Notifications déclenchées</div>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black">Répartition du run</h2>
            <Badge variant="secondary" className="uppercase text-[10px]">Dernier run</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black">Trends</h2>
            {stats && (
              <span className="text-xs text-muted-foreground uppercase tracking-[0.3em]">
                Moyennes (run)
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Moyenne publiés</p>
              <p className="text-2xl font-black">{stats?.avg_published ?? 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Moyenne conflits</p>
              <p className="text-2xl font-black">{stats?.avg_conflicts ?? 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">Historique des exécutions</h2>
          <Badge variant="outline" className="text-[10px] uppercase">10 dernières</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground border-b border-border/40">
                <tr>
                  <th className="px-3 py-2">Run ID</th>
                  <th className="px-3 py-2">Publié</th>
                  <th className="px-3 py-2">Conflits</th>
                  <th className="px-3 py-2">Alertes</th>
                  <th className="px-3 py-2">Créée le</th>
                </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} className="border-b border-border/40">
                  <td className="px-3 py-2 font-bold">{run.id}</td>
                  <td className="px-3 py-2">{run.published_count}</td>
                  <td className="px-3 py-2">{run.conflicts_count}</td>
                  <td className="px-3 py-2">{run.quota_alerts_count}</td>
                  <td className="px-3 py-2">{new Date(run.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!runs.length && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-xs text-muted-foreground">
                    Aucune exécution enregistrée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
