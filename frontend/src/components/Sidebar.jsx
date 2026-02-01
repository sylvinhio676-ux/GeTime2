import React, { useEffect, useState } from "react";
import { 
  LayoutDashboard, Users, GraduationCap, BookOpen, Building, 
  Calendar, LogOut, Building2, Clock1, CircleUser, 
  University, BarChart2, ClipboardListIcon, Factory, Menu, X, CalendarClock,
  Mail, Bell, History, MapPin, MapPinHouse, ListCheck, ChevronLeft, ChevronRight
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "@/services/auth";
import { useAuth } from "@/context/useAuth";
import { notificationService } from "@/services/notificationService";
import getimeLogo from "@/assets/getime-logo.svg";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebar-collapsed") === "true";
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { can, hasRole, loading } = useAuth();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", next);
      return next;
    });
  };

  const handleLogout = async () => {
    logout();
    navigate("/", { replace: true });
  };

  const canAny = (...permissions) => permissions.some((perm) => can(perm));
  const isAdmin = hasRole("admin") || hasRole("super_admin");

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

  return (
    <>
      {/* --- MOBILE TOGGLE --- */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <button onClick={toggleSidebar} className="p-2 bg-primary text-primary-foreground rounded-lg shadow-lg">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* --- MOBILE OVERLAY --- */}
      {isOpen && <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-40 lg:hidden" onClick={toggleSidebar} />}

      {/* --- SIDEBAR ASIDE --- */}
      <aside className={`
        fixed top-0 left-0 h-full bg-sidebar border-r border-border/60 z-50
        transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "lg:w-20" : "w-72 lg:w-64"}
      `}>
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* LOGO & COLLAPSE BUTTON */}
          <div className={`px-4 py-8 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-card shadow-lg shadow-primary/20 shrink-0 flex items-center justify-center">
                <img src={getimeLogo} alt="GeTime" className="w-8 h-8" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0 animate-in fade-in duration-300">
                  <h1 className="text-xl font-black text-foreground truncate">GeTime</h1>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Academic ERP</p>
                </div>
              )}
            </div>
            <button onClick={toggleCollapse} className="hidden lg:flex p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 px-3 overflow-y-auto custom-scrollbar space-y-6 pb-6">
            <div>
              <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" end isCollapsed={isCollapsed} onClick={toggleSidebar} />
            </div>

            {!loading && (
              <>
                <NavSection title="Structure" isCollapsed={isCollapsed}>
                  {isAdmin && (
                    <>
                      <SidebarItem to="/dashboard/schools" icon={University} label="Écoles" badge={1} isCollapsed={isCollapsed} onClick={toggleSidebar} />
                      <SidebarItem to="/dashboard/etablishments" icon={Building2} label="Établissements" isCollapsed={isCollapsed} onClick={toggleSidebar} />
                      <SidebarItem to="/dashboard/campuses" icon={Building} label="Campus" isCollapsed={isCollapsed} onClick={toggleSidebar} />
                      <SidebarItem to="/dashboard/locations" icon={MapPin} label="Locations" isCollapsed={isCollapsed} onClick={toggleSidebar} />
                      <SidebarItem to="/dashboard/tracking" icon={MapPinHouse} label="Tracking" isCollapsed={isCollapsed} onClick={toggleSidebar} />
                    </>
                  )}
                  {canAny("view-sector") && <SidebarItem to="/dashboard/sectors" icon={Factory} label="Secteurs" isCollapsed={isCollapsed} onClick={toggleSidebar} />}
                  {canAny("view-level") && <SidebarItem to="/dashboard/levels" icon={BarChart2} label="Niveaux" isCollapsed={isCollapsed} onClick={toggleSidebar} />}
                  {canAny("view-specialty") && <SidebarItem to="/dashboard/specialties" icon={GraduationCap} label="Spécialités" isCollapsed={isCollapsed} onClick={toggleSidebar} />}
                </NavSection>

                <NavSection title="Ressources" isCollapsed={isCollapsed}>
                  {isAdmin ? (
                    <SidebarItem to="/dashboard/users" icon={Users} label="Utilisateurs" isCollapsed={isCollapsed} onClick={toggleSidebar} />
                  ) : (
                    canAny("view-teacher") && <SidebarItem to="/dashboard/teachers" icon={Users} label="Enseignants" isCollapsed={isCollapsed} onClick={toggleSidebar} />
                  )}
                  {hasRole("teacher") && <SidebarItem to="/dashboard/teacher-rooms" icon={MapPin} label="Salles attribuées" isCollapsed={isCollapsed} onClick={toggleSidebar} />}
                  {canAny("view-subject") && <SidebarItem to="/dashboard/subjects" icon={BookOpen} label="Matières" isCollapsed={isCollapsed} onClick={toggleSidebar} />}
                  {canAny("view-room") && !hasRole("teacher") && <SidebarItem to="/dashboard/rooms" icon={Building2} label="Salles" isCollapsed={isCollapsed} onClick={toggleSidebar} />}
                  {!isAdmin && canAny("view-teacher") && <SidebarItem to="/dashboard/programmers" icon={CircleUser} label="Programmeurs" isCollapsed={isCollapsed} onClick={toggleSidebar} />}
                </NavSection>

                <NavSection title="Communication" isCollapsed={isCollapsed}>
                  <SidebarItem to="/dashboard/email" icon={Mail} label="Envoyer un email" isCollapsed={isCollapsed} onClick={toggleSidebar} />
                  <SidebarItem to="/dashboard/notifications" icon={Bell} label="Notifications" badge={unreadCount} isCollapsed={isCollapsed} onClick={toggleSidebar} />
                </NavSection>

                {!loading && isAdmin && (
                  <NavSection title="Audit" isCollapsed={isCollapsed}>
                    <SidebarItem to="/dashboard/audit-logs" icon={History} label="Historique" isCollapsed={isCollapsed} onClick={toggleSidebar} />
                  </NavSection>
                )}

                <NavSection title="Planification" isCollapsed={isCollapsed}>
                  {canAny("view-year") && <SidebarItem to="/dashboard/years" icon={Calendar} label="Années" isCollapsed={isCollapsed} onClick={toggleSidebar} />}
                  {canAny("view-programmation") && !hasRole("teacher") && (
                    <SidebarItem to="/dashboard/programmations" icon={ClipboardListIcon} label="Planning" badge={3} isCollapsed={isCollapsed} onClick={toggleSidebar} />
                  )}
                  {canAny("view-programmation") && <SidebarItem to="/dashboard/timetable" icon={CalendarClock} label="Emploi du temps" isCollapsed={isCollapsed} onClick={toggleSidebar} />}
                  {canAny("view-programmation-list") && <SidebarItem to="/dashboard/programmationList" icon={Clock1} label="Liste programmations" isCollapsed={isCollapsed} onClick={toggleSidebar} />}
                  {canAny("view-disponibility") && <SidebarItem to="/dashboard/disponibilities" icon={CalendarClock} label="Disponibilités" isCollapsed={isCollapsed} onClick={toggleSidebar} />}
                </NavSection>

                {isAdmin && (
                  <>
                    <NavSection title="Analytique" isCollapsed={isCollapsed}>
                      <SidebarItem to="/dashboard/analytics" icon={BarChart2} label="Analytics" isCollapsed={isCollapsed} onClick={toggleSidebar} />
                    </NavSection>
                    <NavSection title="Automatisation" isCollapsed={isCollapsed}>
                      <SidebarItem to="/dashboard/automation-report" icon={ListCheck} label="Automation Report" isCollapsed={isCollapsed} onClick={toggleSidebar} />
                    </NavSection>
                  </>
                )}
              </>
            )}
          </nav>

          {/* FOOTER */}
          <div className="p-4 bg-muted border-t border-border/60">
            <SidebarAction icon={LogOut} label="Déconnexion" danger isCollapsed={isCollapsed} onClick={() => { handleLogout(); toggleSidebar(); }} />
          </div>
        </div>
      </aside>
    </>
  );
}

function NavSection({ title, children, isCollapsed }) {
  if (React.Children.count(children) === 0) return null;
  return (
    <div className="space-y-1">
      {!isCollapsed ? (
        <p className="px-3 text-[10px] font-black uppercase text-muted-foreground/80 tracking-widest mb-2 animate-in fade-in">{title}</p>
      ) : (
        <div className="h-px bg-border/40 my-4 mx-2" />
      )}
      {children}
    </div>
  );
}

function SidebarItem({ to, icon: Icon, label, badge, danger, end, onClick, isCollapsed }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      title={isCollapsed ? label : ""}
      className="w-full" // Conteneur pour s'assurer que le NavLink prend toute la place
    >
      {({ isActive }) => (
        <div className={`
          group flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative
          ${isCollapsed ? "justify-center" : "gap-3"}
          ${danger ? "text-delta-negative hover:bg-delta-negative/10" : 
            isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted"}
        `}>
          <Icon className="w-5 h-5 shrink-0" />
          
          {!isCollapsed && (
            <span className="flex-1 truncate animate-in slide-in-from-left-2 duration-300">
              {label}
            </span>
          )}

          {badge > 0 && (
            <span className={`
              flex items-center justify-center font-bold
              ${isCollapsed ? "absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[8px]" : "min-w-[20px] h-[20px] text-[10px] ml-auto"}
              rounded-full 
              ${isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}
            `}>
              {badge}
            </span>
          )}
        </div>
      )}
    </NavLink>
  );
}

function SidebarAction({ icon: Icon, label, danger, onClick, isCollapsed }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={isCollapsed ? label : ""}
      className={`group flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-all w-full
        ${isCollapsed ? "justify-center" : "gap-3"}
        ${danger ? "text-delta-negative hover:bg-delta-negative/10" : "text-muted-foreground hover:bg-muted"}
      `}
    >
      <Icon className="w-5 h-5 shrink-0" />
      {!isCollapsed && <span className="flex-1 truncate text-left">{label}</span>}
    </button>
  );
}