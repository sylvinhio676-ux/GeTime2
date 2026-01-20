import React, { useEffect, useState, useMemo } from "react";
import {
  Users, BookOpen, School, Activity, CalendarCheck,
  GraduationCap, TrendingUp, Plus, 
  ArrowUpRight, AlertTriangle, 
  University, BarChart2, Factory, Clock, Calendar,
  ClipboardList, CalendarClock, UserCheck, Layers
} from "lucide-react";

// Services
import { userService } from "@/services/userService";
import { roomService } from "@/services/roomService";
import { subjectService } from "@/services/subjectService";
import { specialtyService } from "@/services/specialtyService";
import { campusService } from "@/services/campusService";
import { programmersService } from "@/services/programmerService";
import { etablishmentService } from "@/services/etablishmentService";
import { programmationService } from "@/services/programmationService";
import { teacherService } from "@/services/teacherService";
import { levelService } from "@/services/levelService";
import { yearService } from "@/services/yearService";
import { disponibilityService } from "@/services/disponibilityService";
// Ajoute tes nouveaux services ici (sectorService, levelService, etc.)

// UI Components
import ChartPlaceholder from '@/components/ui/ChartPlaceholder';
import ActivityList from '@/components/ui/ActivityList';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/useAuth";

export default function Dashboard() {
  const { user, loading: authLoading, hasRole } = useAuth();
  const isAdmin = hasRole("super_admin") || hasRole("admin");
  const isProgrammer = hasRole("programmer");
  const isTeacher = hasRole("teacher");
  const [adminData, setAdminData] = useState({
    users: [], rooms: [], subjects: [], specialities: [], 
    campuses: [], programmers: [], etablishments: [],
    sectors: [], levels: [], years: [] 
  });
  const [roleData, setRoleData] = useState({
    programmations: [],
    subjects: [],
    rooms: [],
    specialties: [],
    levels: [],
    years: [],
    teachers: [],
    disponibilities: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    if (isAdmin) {
      loadAdminDashboardData();
    } else if (isTeacher) {
      loadRoleDashboardData({ includeTeachers: false, includeDisponibilities: true });
    } else {
      loadRoleDashboardData({ includeTeachers: isProgrammer, includeDisponibilities: false });
    }
  }, [authLoading, user, isAdmin, isProgrammer, isTeacher]);

  const loadAdminDashboardData = async () => {
    try {
      setLoading(true);
      // Simule l'appel à tous tes services incluant les nouveaux
      const [u, r, s, sp, c, p, e] = await Promise.all([
        userService.getAll(), roomService.getAll(),
        subjectService.getAll(), specialtyService.getAll(),
        campusService.getAll(), programmersService.getAll(),
        etablishmentService.getAll(),
      ]);
      
      setAdminData(prev => ({ 
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

  const loadRoleDashboardData = async ({ includeTeachers, includeDisponibilities }) => {
    try {
      setLoading(true);
      const requests = [
        programmationService.getAll(),
        subjectService.getAll(),
        roomService.getAll(),
        specialtyService.getAll(),
        levelService.getAll(),
        yearService.getAll(),
      ];
      if (includeTeachers) {
        requests.push(teacherService.getAll());
      }
      if (includeDisponibilities) {
        requests.push(disponibilityService.getAll());
      }
      const [
        programmations,
        subjects,
        rooms,
        specialties,
        levels,
        years,
        teachers,
        disponibilities,
      ] = await Promise.all(requests);
      setRoleData({
        programmations: programmations || [],
        subjects: subjects || [],
        rooms: rooms || [],
        specialties: specialties || [],
        levels: levels || [],
        years: years || [],
        teachers: teachers || [],
        disponibilities: disponibilities || [],
      });
    } catch (error) {
      console.error("Erreur de chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (isAdmin) return <AdminDashboard data={adminData} />;
  if (isTeacher) return <TeacherDashboard data={roleData} />;
  return <ProgrammerDashboard data={roleData} isProgrammer={isProgrammer} />;
}

function AdminDashboard({ data }) {
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

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* ================= HEADER AVANCÉ ================= */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-muted-foreground border-border bg-muted">
                <Calendar className="w-3 h-3 mr-1" /> Année Académique: {analytics.activeYear}
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Vue d'Ensemble Académique</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden lg:block mr-4">
                <p className="text-xs text-muted-foreground font-bold uppercase">Établissement</p>
                <p className="text-sm font-bold text-foreground">{data.etablishments[0]?.name || "Université Centrale"}</p>
             </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 shadow-lg">
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
              <div className="bg-delta-negative/10 border border-delta-negative/20 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-delta-negative/100 p-2 rounded-lg text-primary-foreground">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-delta-negative font-bold">Attention : {analytics.conflictCount} conflits de programmation</h4>
                    <p className="text-delta-negative text-sm">Des enseignants sont programmés sur des plages d'indisponibilité.</p>
                  </div>
                </div>
                <Button size="sm" className="bg-delta-negative hover:bg-delta-negative/90 text-primary-foreground border-none">Résoudre</Button>
              </div>
            )}

            {/* Graphique d'activité */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <ChartPlaceholder title="Charge de Cours Hebdomadaire" subtitle="Analyse des heures programmées par jour" />
            </div>

            {/* Tableau des Programmations Récentes */}
            <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border/40 flex justify-between items-center bg-muted/30">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-muted-foreground" /> Programmations Récentes
                </h3>
                <Button variant="ghost" size="sm">Voir tout le planning</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-muted/50 text-muted-foreground/80 text-[10px] uppercase font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Matière / Niveau</th>
                      <th className="px-6 py-4">Enseignant</th>
                      <th className="px-6 py-4">Salle & Campus</th>
                      <th className="px-6 py-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-sm">
                    {data.programmers.slice(0, 5).map((p, i) => (
                      <tr key={i} className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <td className="px-6 py-4 font-bold text-foreground">
                          {p.subject?.name || "Matière"}
                          <div className="text-[10px] text-muted-foreground/80 font-medium">Niveau: Master 1 • {p.speciality?.name}</div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">Dr. {p.user?.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium">{p.room?.name || "Salle 102"}</span>
                            <span className="text-xs text-muted-foreground/80">Campus Principal</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-delta-positive/10 text-delta-positive border-delta-positive/20 font-bold">Validé</Badge>
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
            <div className="bg-primary rounded-3xl p-6 text-primary-foreground shadow-2xl">
              <h3 className="font-bold flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-primary-foreground/70" /> Gestion Rapide
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <QuickAction icon={Clock} label="Dispos" count={2} />
                <QuickAction icon={BarChart2} label="Niveaux" />
                <QuickAction icon={School} label="Salles" count={1} />
                <QuickAction icon={BookOpen} label="Syllabus" />
              </div>
              <Button className="w-full mt-6 bg-primary hover:bg-primary/80 border-none h-12">
                 Générer Emploi du Temps
              </Button>
            </div>

            {/* Statistiques par Secteur */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h3 className="font-bold text-foreground mb-4">Progression par Secteur</h3>
              <div className="space-y-5">
                {[
                  { label: 'Informatique', val: 75, col: 'bg-muted/60' },
                  { label: 'Génie Civil', val: 40, col: 'bg-accent' },
                  { label: 'Management', val: 90, col: 'bg-delta-positive' }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-muted-foreground uppercase tracking-tighter">{item.label}</span>
                      <span className="text-foreground">{item.val}%</span>
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

function ProgrammerDashboard({ data, isProgrammer }) {
  const title = isProgrammer ? "Tableau de bord Programmeur" : "Tableau de bord Enseignant";
  const subtitle = isProgrammer
    ? "Planification, salles et matières à portée de main"
    : "Suivi des matières et de l'emploi du temps";
  const activeYear = data.years[data.years.length - 1];

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-delta-positive/20 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-delta-positive border-delta-positive/30 bg-delta-positive/10">
                <CalendarClock className="w-3 h-3 mr-1" />
                Année active: {activeYear ? `${activeYear.date_star} → ${activeYear.date_end}` : "—"}
              </Badge>
            </div>
            <h1 className="text-3xl font-dark text-foreground tracking-tight">{title}</h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">{subtitle}</p>
          </div>
          <Button className="bg-delta-positive hover:bg-delta-positive/90 text-primary-foreground shadow-primary/20 shadow-lg">
            <ClipboardList className="w-4 h-4 mr-2" /> Nouvelle Programmation
          </Button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatWidget title="Programmations" value={data.programmations.length} icon={ClipboardList} color="emerald" />
          <StatWidget title="Matières" value={data.subjects.length} icon={BookOpen} color="blue" />
          <StatWidget title="Salles" value={data.rooms.length} icon={School} color="orange" />
          <StatWidget title="Spécialités" value={data.specialties.length} icon={GraduationCap} color="indigo" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border/40 flex justify-between items-center bg-muted/30">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-delta-positive" /> Séances à venir
                </h3>
                <Button variant="ghost" size="sm">Voir tout</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-muted/50 text-muted-foreground/80 text-[10px] uppercase font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Matière</th>
                      <th className="px-6 py-4">Jour & Horaire</th>
                      <th className="px-6 py-4">Salle</th>
                      <th className="px-6 py-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-sm">
                    {data.programmations.slice(0, 6).map((prog) => (
                      <tr key={prog.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">
                          {prog.subject?.subject_name || "Matière"}
                          <div className="text-[10px] text-muted-foreground/80 font-medium">
                            {prog.subject?.specialty?.level?.name_level || "Niveau —"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <div className="font-bold">{prog.day}</div>
                          <div className="text-xs text-muted-foreground/80">{prog.hour_star} — {prog.hour_end}</div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {prog.room?.code || "Salle auto"}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-delta-positive/10 text-delta-positive border-delta-positive/20 font-bold">Planifié</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <ChartPlaceholder title="Répartition des séances" subtitle="Vue rapide par niveau et spécialité" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-delta-positive rounded-3xl p-6 text-primary-foreground shadow-2xl">
              <h3 className="font-bold flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-primary-foreground/70" /> Raccourcis
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <QuickAction icon={UserCheck} label="Enseignants" count={isProgrammer ? data.teachers.length : undefined} />
                <QuickAction icon={Layers} label="Niveaux" count={data.levels.length} />
                <QuickAction icon={BookOpen} label="Matières" count={data.subjects.length} />
                <QuickAction icon={School} label="Salles" count={data.rooms.length} />
              </div>
              <Button className="w-full mt-6 bg-delta-positive hover:bg-delta-positive border-none h-12">
                Générer Planning
              </Button>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h3 className="font-bold text-foreground mb-4">Charge par niveau</h3>
              <div className="space-y-5">
                {data.levels.slice(0, 3).map((level) => (
                  <div key={level.id} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-muted-foreground uppercase tracking-tighter">{level.name_level}</span>
                      <span className="text-foreground">—</span>
                    </div>
                    <Progress value={40} className="h-1.5 bg-delta-positive/20" />
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

function TeacherDashboard({ data }) {
  const activeYear = data.years[data.years.length - 1];

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-primary/20 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">
                <CalendarClock className="w-3 h-3 mr-1" />
                Année active: {activeYear ? `${activeYear.date_star} → ${activeYear.date_end}` : "—"}
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Tableau de bord Enseignant</h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">Vos cours, disponibilités et emploi du temps</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 shadow-lg">
            <CalendarClock className="w-4 h-4 mr-2" /> Voir l'emploi du temps
          </Button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatWidget title="Matières" value={data.subjects.length} icon={BookOpen} color="blue" />
          <StatWidget title="Spécialités" value={data.specialties.length} icon={GraduationCap} color="indigo" />
          <StatWidget title="Disponibilités" value={data.disponibilities.length} icon={CalendarCheck} color="emerald" />
          <StatWidget title="Séances" value={data.programmations.length} icon={ClipboardList} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border/40 flex justify-between items-center bg-muted/30">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary/80" /> Séances planifiées
                </h3>
                <Button variant="ghost" size="sm">Tout voir</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-muted/50 text-muted-foreground/80 text-[10px] uppercase font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Matière</th>
                      <th className="px-6 py-4">Jour & Horaire</th>
                      <th className="px-6 py-4">Salle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-sm">
                    {data.programmations.slice(0, 6).map((prog) => (
                      <tr key={prog.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">
                          {prog.subject?.subject_name || "Matière"}
                          <div className="text-[10px] text-muted-foreground/80 font-medium">
                            {prog.subject?.specialty?.level?.name_level || "Niveau —"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <div className="font-bold">{prog.day}</div>
                          <div className="text-xs text-muted-foreground/80">{prog.hour_star} — {prog.hour_end}</div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {prog.room?.code || "Salle auto"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <ChartPlaceholder title="Charge hebdomadaire" subtitle="Résumé des heures par semaine" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-primary rounded-3xl p-6 text-primary-foreground shadow-2xl">
              <h3 className="font-bold flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-primary-foreground/70" /> Raccourcis
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <QuickAction icon={CalendarCheck} label="Dispos" count={data.disponibilities.length} />
                <QuickAction icon={BookOpen} label="Matières" count={data.subjects.length} />
                <QuickAction icon={GraduationCap} label="Spécialités" count={data.specialties.length} />
                <QuickAction icon={CalendarClock} label="Emploi du temps" />
              </div>
              <Button className="w-full mt-6 bg-primary hover:bg-primary/90 border-none h-12">
                Ajouter disponibilités
              </Button>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h3 className="font-bold text-foreground mb-4">Progression par niveau</h3>
              <div className="space-y-5">
                {data.levels.slice(0, 3).map((level) => (
                  <div key={level.id} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-muted-foreground uppercase tracking-tighter">{level.name_level}</span>
                      <span className="text-foreground">—</span>
                    </div>
                    <Progress value={50} className="h-1.5 bg-primary/15" />
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
    indigo: "bg-muted text-muted-foreground ring-border/40",
    emerald: "bg-delta-positive/10 text-delta-positive ring-delta-positive/20",
    blue: "bg-primary/10 text-primary ring-primary/20",
    orange: "bg-accent/10 text-accent ring-accent/20"
  };

  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm transition-all hover:shadow-md group">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ring-4 ${colorStyles[color]} transition-transform group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <Badge variant="secondary" className={`${up ? 'text-delta-positive' : 'text-muted-foreground'} bg-muted border-none font-bold`}>
            {trend} <ArrowUpRight className="w-3 h-3 ml-1" />
          </Badge>
        )}
      </div>
      <div className="mt-5">
        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-foreground mt-1">{value}</h3>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, count }) {
  return (
    <button className="relative flex flex-col items-center justify-center p-4 rounded-2xl bg-card/5 border border-primary-foreground/15 hover:bg-card/10 transition-all gap-2 group">
      {count && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-muted/60 rounded-full text-[10px] flex items-center justify-center font-bold shadow-lg">
          {count}
        </span>
      )}
      <Icon className="w-5 h-5 text-primary-foreground/70 group-hover:scale-110 transition-transform" />
      <span className="text-[10px] font-bold text-primary-foreground/80 uppercase tracking-tighter">{label}</span>
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-8 animate-pulse bg-muted min-h-screen">
      <div className="h-20 w-full bg-muted/80 rounded-2xl" />
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted/80 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 h-[500px] bg-muted/80 rounded-2xl" />
        <div className="h-[500px] bg-muted/80 rounded-2xl" />
      </div>
    </div>
  );
}
