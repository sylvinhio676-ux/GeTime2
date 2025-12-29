import React, { useState } from "react";
import { 
  LayoutDashboard, Users, GraduationCap, BookOpen, Building, 
  Calendar, Settings, LogOut, Building2, Clock1, CircleUser, 
  University, BarChart2, ClipboardListIcon, Factory, Menu, X, CalendarClock
} from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* --- BOUTON MENU MOBILE --- */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <button 
          onClick={toggleSidebar}
          className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* --- OVERLAY (Flou d'arrière-plan sur mobile) --- */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white border-r border-slate-100 z-50
        transition-transform duration-300 ease-in-out w-64
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* LOGO */}
          <div className="px-6 py-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
              <Clock1 className="text-white w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-black text-slate-900 leading-none truncate">GeTime</h1>
              <p className="text-[10px] font-bold text-indigo-500 uppercase mt-1 tracking-wider">Academic ERP</p>
            </div>
          </div>

          {/* NAVIGATION (Scrollable) */}
          <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar space-y-6 pb-6">
            <div>
              <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={toggleSidebar} />
            </div>

            <NavSection title="Structure">
              <SidebarItem to="/dashboard/schools" icon={University} label="Écoles" badge={1} onClick={toggleSidebar} />
              <SidebarItem to="/dashboard/campuses" icon={Building} label="Campus" onClick={toggleSidebar} />
              <SidebarItem to="/dashboard/sectors" icon={Factory} label="Secteurs" onClick={toggleSidebar} />
              <SidebarItem to="/dashboard/levels" icon={BarChart2} label="Niveaux" onClick={toggleSidebar} />
              <SidebarItem to="/dashboard/specialties" icon={GraduationCap} label="Spécialités" onClick={toggleSidebar} />
            </NavSection>

            <NavSection title="Ressources">
              <SidebarItem to="/dashboard/teachers" icon={Users} label="Enseignants" onClick={toggleSidebar} />
              <SidebarItem to="/dashboard/subjects" icon={BookOpen} label="Matières" onClick={toggleSidebar} />
              <SidebarItem to="/dashboard/rooms" icon={Building2} label="Salles" onClick={toggleSidebar} />
              <SidebarItem to="/dashboard/programmers" icon={CircleUser} label="Programmeurs" onClick={toggleSidebar} />
            </NavSection>

            <NavSection title="Planification">
              <SidebarItem to="/dashboard/years" icon={Calendar} label="Années" onClick={toggleSidebar} />
              <SidebarItem to="/dashboard/programmations" icon={ClipboardListIcon} label="Plannings" badge={3} onClick={toggleSidebar} />
              <SidebarItem to="/dashboard/disponibilities" icon={CalendarClock} label="Disponibilités" onClick={toggleSidebar} />
            </NavSection>
          </nav>

          {/* FOOTER */}
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <SidebarItem to="/dashboard/settings" icon={Settings} label="Paramètres" onClick={toggleSidebar} />
            <SidebarItem to="/logout" icon={LogOut} label="Déconnexion" danger onClick={toggleSidebar} />
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
      <p className="px-3 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">{title}</p>
      {children}
    </div>
  );
}

function SidebarItem({ to, icon: Icon, label, badge, danger, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => `
        group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
        ${danger ? "text-rose-500 hover:bg-rose-50" : 
          isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"}
      `}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {badge > 0 && (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${danger ? "bg-rose-100" : "bg-indigo-100 text-indigo-600"}`}>
          {badge}
        </span>
      )}
    </NavLink>
  );
}
