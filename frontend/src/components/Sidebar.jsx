import React, { useEffect, useState } from "react";
import { 
  LayoutDashboard, Users, GraduationCap, BookOpen, Building, 
  Calendar, Settings, LogOut, Building2, Clock1, CircleUser, 
  University, BarChart2, ClipboardListIcon, Factory, Menu, X, CalendarClock,
  Sun, Moon, Home, Mail, Bell, History, MapPin,
  Navigation, TrainTrackIcon,
  MapPinHouse
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "@/services/auth";
import { useAuth } from "@/context/useAuth";
import { notificationService } from "@/services/notificationService";
import getimeLogo from "@/assets/getime-logo.svg";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { can, hasRole, loading } = useAuth();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const handleLogout = async () => {
    logout();
    navigate("/", { replace: true });
  };

  const canAny = (...permissions) => permissions.some((perm) => can(perm));
  const isAdmin = hasRole("admin") || hasRole("super_admin");
  const isDark = theme === "dark";

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const initialTheme = storedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const data = await notificationService.unread();
        if (isMounted) setUnreadCount(data.length || 0);
      } catch {
        if (isMounted) setUnreadCount(0);
      }
    };
    fetchUnread();
    const timer = setInterval(fetchUnread, 30000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  };

  return (
    <>
      {/* --- BOUTON MENU MOBILE --- */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <button 
          onClick={toggleSidebar}
          className="p-2 bg-primary text-primary-foreground rounded-lg shadow-lg"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* --- OVERLAY (Flou d'arrière-plan sur mobile) --- */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed top-0 left-0 h-full bg-sidebar border-r border-border/60 z-50
        transition-transform duration-300 ease-in-out w-72 max-w-[85vw] lg:w-64
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* LOGO */}
          <div className="px-6 py-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-card shadow-lg shadow-primary/20 shrink-0 flex items-center justify-center">
              <img src={getimeLogo} alt="GeTime" className="w-8 h-8" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-black text-foreground leading-none truncate">GeTime</h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-wider">Academic ERP</p>
            </div>
          </div>

          {/* NAVIGATION (Scrollable) */}
          <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar space-y-6 pb-6">
            <div>
              <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" end onClick={toggleSidebar} />
            </div>

            {!loading && (
              <NavSection title="Structure">
                {isAdmin && (
                  <>
                    <SidebarItem to="/dashboard/schools" icon={University} label="Écoles" badge={1} onClick={toggleSidebar} />
                    <SidebarItem to="/dashboard/campuses" icon={Building} label="Campus" onClick={toggleSidebar} />
                    <SidebarItem to="/dashboard/locations" icon={MapPin} label="Locations" onClick={toggleSidebar} />
                    <SidebarItem to="/dashboard/tracking" icon={MapPinHouse} label="Tracking" onClick={toggleSidebar} />
                  </>
                )}
                {canAny("view-sector") && (
                  <SidebarItem to="/dashboard/sectors" icon={Factory} label="Secteurs" onClick={toggleSidebar} />
                )}
                {canAny("view-level") && (
                  <SidebarItem to="/dashboard/levels" icon={BarChart2} label="Niveaux" onClick={toggleSidebar} />
                )}
                {canAny("view-specialty") && (
                  <SidebarItem to="/dashboard/specialties" icon={GraduationCap} label="Spécialités" onClick={toggleSidebar} />
                )}
              </NavSection>
            )}

            {!loading && (
              <NavSection title="Ressources">
                {isAdmin ? (
                  <SidebarItem to="/dashboard/users" icon={Users} label="Utilisateurs" onClick={toggleSidebar} />
                ) : (
                  canAny("view-teacher") && (
                    <SidebarItem to="/dashboard/teachers" icon={Users} label="Enseignants" onClick={toggleSidebar} />
                  )
                )}
                {canAny("view-subject") && (
                  <SidebarItem to="/dashboard/subjects" icon={BookOpen} label="Matières" onClick={toggleSidebar} />
                )}
                {canAny("view-room") && (
                  <SidebarItem to="/dashboard/rooms" icon={Building2} label="Salles" onClick={toggleSidebar} />
                )}
                {!isAdmin && canAny("view-teacher") && (
                  <SidebarItem to="/dashboard/programmers" icon={CircleUser} label="Programmeurs" onClick={toggleSidebar} />
                )}
              </NavSection>
            )}

            {!loading && (
              <NavSection title="Communication">
                <SidebarItem to="/dashboard/email" icon={Mail} label="Envoyer un email" onClick={toggleSidebar} />
                <SidebarItem to="/dashboard/notifications" icon={Bell} label="Notifications" badge={unreadCount} onClick={toggleSidebar} />
              </NavSection>
            )}

            {!loading && isAdmin && (
              <NavSection title="Audit">
                <SidebarItem to="/dashboard/audit-logs" icon={History} label="Historique" onClick={toggleSidebar} />
              </NavSection>
            )}

            {!loading && (
              <NavSection title="Planification">
                {canAny("view-year") && (
                  <SidebarItem to="/dashboard/years" icon={Calendar} label="Années" onClick={toggleSidebar} />
                )}
                {canAny("view-programmation") && (
                  <SidebarItem to="/dashboard/programmations" icon={ClipboardListIcon} label="Planning" badge={3} onClick={toggleSidebar} />
                )}
                {/* {canAny("view-programmation") && (
                  
                )} */}
                {canAny("view-programmation") && (
                  <SidebarItem to="/dashboard/timetable" icon={CalendarClock} label="Emploi du temps" onClick={toggleSidebar} />
                )}
                {canAny("view-programmation-list") && (
                  <SidebarItem to="/dashboard/programmationList" icon={Clock1} label="Liste programmations" onClick={toggleSidebar} />
                )}
                {canAny("view-disponibility") && (
                  <SidebarItem to="/dashboard/disponibilities" icon={CalendarClock} label="Disponibilités" onClick={toggleSidebar} />
                )}
              </NavSection>
            )}
          </nav>

          {/* FOOTER */}
          <div className="p-4 bg-muted border-t border-border/60">
            <SidebarAction icon={LogOut} label="Déconnexion" danger onClick={() => { handleLogout(); toggleSidebar(); }} />
          </div>
        </div>
      </aside>
    </>
  );
}

// Sous-composants pour la clarté
function NavSection({ title, children }) {
  return (
    <div className="space-y-1">
      <p className="px-3 text-[10px] font-black uppercase text-muted-foreground/80 tracking-widest mb-2">{title}</p>
      {children}
    </div>
  );
}

function SidebarItem({ to, icon: Icon, label, badge, danger, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => `
        group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
        ${danger ? "text-delta-negative hover:bg-delta-negative/10" : 
          isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-muted-foreground"}
      `}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {badge > 0 && (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${danger ? "bg-delta-negative/10" : "bg-muted text-muted-foreground"}`}>
          {badge}
        </span>
      )}
    </NavLink>
  );
}

function SidebarAction({ icon: Icon, label, danger, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        danger ? "text-delta-negative hover:bg-delta-negative/10" : "text-muted-foreground hover:bg-muted hover:text-muted-foreground"
      }`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
    </button>
  );
}
