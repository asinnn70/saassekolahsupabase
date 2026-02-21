import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  ShieldAlert, 
  Trophy, 
  Settings, 
  LogOut,
  School,
  Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
      active 
        ? "bg-indigo-600 text-white" 
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    )}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const menuItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['super_admin', 'school_admin', 'teacher', 'student'] },
    { to: '/tenants', icon: School, label: 'Schools', roles: ['super_admin'] },
    { to: '/teachers', icon: Users, label: 'Teachers', roles: ['school_admin'] },
    { to: '/students', icon: GraduationCap, label: 'Students', roles: ['school_admin', 'teacher'] },
    { to: '/classes', icon: BookOpen, label: 'Classes', roles: ['school_admin', 'teacher'] },
    { to: '/attendance', icon: Calendar, label: 'Attendance', roles: ['teacher', 'student'] },
    { to: '/grades', icon: Trophy, label: 'Grades', roles: ['teacher', 'student'] },
    { to: '/monitoring', icon: ShieldAlert, label: 'Monitoring', roles: ['school_admin', 'teacher', 'student'] },
    { to: '/announcements', icon: Bell, label: 'Announcements', roles: ['school_admin', 'teacher', 'student'] },
  ];

  const filteredMenu = menuItems.filter(item => 
    profile && item.roles.includes(profile.role)
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="text-indigo-400" />
            <span>EduFlow</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredMenu.map((item) => (
            <SidebarItem 
              key={item.to} 
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.to} 
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
              {profile?.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name}</p>
              <p className="text-xs text-slate-400 capitalize">{profile?.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-slate-800">
            {menuItems.find(i => i.to === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600">
              <Bell size={20} />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <Settings size={20} className="text-slate-400 cursor-pointer hover:text-slate-600" />
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
