import React, { useEffect, useState, useMemo } from "react";
import {
  Users, BookOpen, School, Activity, CalendarCheck,
  GraduationCap, MapPin, TrendingUp, Plus, Download, 
  ArrowUpRight, CheckCircle2, AlertTriangle, 
  University, BarChart2, Factory, Clock, Calendar
} from "lucide-react";

// Services
import { userService } from "@/services/userService";
import { roomService } from "@/services/roomService";
import { subjectService } from "@/services/subjectService";
import { specialtyService } from "@/services/specialtyService";
import { campusService } from "@/services/campusService";
import { programmersService } from "@/services/programmerService";
import { etablishmentService } from "@/services/etablishmentService";
// Ajoute tes nouveaux services ici (sectorService, levelService, etc.)

// UI Components
import ChartPlaceholder from '@/components/ui/ChartPlaceholder';
import ActivityList from '@/components/ui/ActivityList';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const [data, setData] = useState({
    users: [], rooms: [], subjects: [], specialities: [], 
    campuses: [], programmers: [], etablishments: [],
    sectors: [], levels: [], years: [] 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Simule l'appel à tous tes services incluant les nouveaux
      const [u, r, s, sp, c, p, e] = await Promise.all([
        userService.getAll(), roomService.getAll(),
        subjectService.getAll(), specialtyService.getAll(),
        campusService.getAll(), programmersService.getAll(),
        etablishmentService.getAll(),
      ]);
      
      setData(prev => ({ 
        ...prev,
        users: u, rooms: r, subjects: s, 
        specialities: sp, campuses: c, 
        programmers: p, etablishments: e 
      }));
    } catch (error) {
      console.error("Erreur de chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- CALCULS ANALYTIQUES AVANCÉS ---
  const analytics = useMemo(() => {
    const totalRooms = data.rooms.length;
    const busyRooms = data.programmers.filter(p => p.status === 'active').length; // Logique exemple
    
    return {
      teacherCount: data.users.length,
      subjectCount: data.subjects.length,
      roomUsage: totalRooms > 0 ? Math.round((busyRooms / totalRooms) * 100) : 0,
      conflictCount: 3, // À lier à une fonction de détection réelle
      activeYear: "2024-2025"
    };
  }, [data]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* ================= HEADER AVANCÉ ================= */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">
                <Calendar className="w-3 h-3 mr-1" /> Année Académique: {analytics.activeYear}
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vue d'Ensemble Académique</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden lg:block mr-4">
                <p className="text-xs text-slate-500 font-bold uppercase">Établissement</p>
                <p className="text-sm font-bold text-slate-900">{data.etablishments[0]?.name || "Université Centrale"}</p>
             </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 shadow-lg">
              <Plus className="w-4 h-4 mr-2" /> Nouvelle Programmation
            </Button>
          </div>
        </header>

        {/* ================= KPI GRID (Basé sur tes Sidebar Items) ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatWidget title="Enseignants" value={analytics.teacherCount} icon={Users} trend="+2" color="indigo" />
          <StatWidget title="Écoles / Campus" value={`${data.etablishments.length} / ${data.campuses.length}`} icon={University} color="blue" />
          <StatWidget title="Secteurs & Niveaux" value={`${data.specialities.length} Filières`} icon={Factory} color="orange" />
          <StatWidget title="Taux d'Occupation" value={`${analytics.roomUsage}%`} icon={TrendingUp} trend="+5%" up={true} color="emerald" />
        </div>

        {/* ================= MAIN ANALYTICS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Widget de Conflits / Alertes */}
            {analytics.conflictCount > 0 && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-rose-500 p-2 rounded-lg text-white">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-rose-900 font-bold">Attention : {analytics.conflictCount} conflits de programmation</h4>
                    <p className="text-rose-700 text-sm">Des enseignants sont programmés sur des plages d'indisponibilité.</p>
                  </div>
                </div>
                <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white border-none">Résoudre</Button>
              </div>
            )}

            {/* Graphique d'activité */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <ChartPlaceholder title="Charge de Cours Hebdomadaire" subtitle="Analyse des heures programmées par jour" />
            </div>

            {/* Tableau des Programmations Récentes */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-indigo-500" /> Programmations Récentes
                </h3>
                <Button variant="ghost" size="sm">Voir tout le planning</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Matière / Niveau</th>
                      <th className="px-6 py-4">Enseignant</th>
                      <th className="px-6 py-4">Salle & Campus</th>
                      <th className="px-6 py-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {data.programmers.slice(0, 5).map((p, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {p.subject?.name || "Matière"}
                          <div className="text-[10px] text-slate-400 font-medium">Niveau: Master 1 • {p.speciality?.name}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">Dr. {p.user?.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium">{p.room?.name || "Salle 102"}</span>
                            <span className="text-xs text-slate-400">Campus Principal</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold">Validé</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Right Sidebar: Quick Actions & Status */}
          <div className="space-y-8">
            {/* Actions Rapides Système */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl">
              <h3 className="font-bold flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-indigo-400" /> Gestion Rapide
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <QuickAction icon={Clock} label="Dispos" count={2} />
                <QuickAction icon={BarChart2} label="Niveaux" />
                <QuickAction icon={School} label="Salles" count={1} />
                <QuickAction icon={BookOpen} label="Syllabus" />
              </div>
              <Button className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 border-none h-12">
                 Générer Emploi du Temps
              </Button>
            </div>

            {/* Statistiques par Secteur */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Progression par Secteur</h3>
              <div className="space-y-5">
                {[
                  { label: 'Informatique', val: 75, col: 'bg-indigo-500' },
                  { label: 'Génie Civil', val: 40, col: 'bg-orange-500' },
                  { label: 'Management', val: 90, col: 'bg-emerald-500' }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600 uppercase tracking-tighter">{item.label}</span>
                      <span className="text-slate-900">{item.val}%</span>
                    </div>
                    <Progress value={item.val} className={`h-1.5 ${item.col}`} />
                  </div>
                ))}
              </div>
            </div>

            <ActivityList />
          </div>

        </div>
      </div>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function StatWidget({ title, value, icon: Icon, trend, color, up }) {
  const colorStyles = {
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    orange: "bg-orange-50 text-orange-600 ring-orange-100"
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md group">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ring-4 ${colorStyles[color]} transition-transform group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <Badge variant="secondary" className={`${up ? 'text-emerald-600' : 'text-slate-500'} bg-slate-50 border-none font-bold`}>
            {trend} <ArrowUpRight className="w-3 h-3 ml-1" />
          </Badge>
        )}
      </div>
      <div className="mt-5">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, count }) {
  return (
    <button className="relative flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all gap-2 group">
      {count && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full text-[10px] flex items-center justify-center font-bold shadow-lg">
          {count}
        </span>
      )}
      <Icon className="w-5 h-5 text-indigo-300 group-hover:scale-110 transition-transform" />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-8 animate-pulse bg-slate-50 min-h-screen">
      <div className="h-20 w-full bg-slate-200 rounded-2xl" />
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 h-[500px] bg-slate-200 rounded-2xl" />
        <div className="h-[500px] bg-slate-200 rounded-2xl" />
      </div>
    </div>
  );
}