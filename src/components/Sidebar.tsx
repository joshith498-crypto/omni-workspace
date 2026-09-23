import React from 'react';
import {
  LayoutDashboard,
  FileText,
  AlignLeft,
  Image as ImageIcon,
  Kanban,
  Download,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ActiveView, User } from '../types';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  notesCount: number;
  mediaCount: number;
  tasksCount: number;
  currentUser: User | null;
  onSignOut: () => void;
  onInstallClick: () => void;
  canInstall: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  collapsed,
  setCollapsed,
  notesCount,
  mediaCount,
  tasksCount,
  currentUser,
  onSignOut,
  onInstallClick,
  canInstall,
}) => {
  const navItems: {
    id: ActiveView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge: number | null;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'notes',
      label: 'Notes & Ideas',
      icon: FileText,
      badge: notesCount,
    },
    {
      id: 'summarizer',
      label: 'Summarizer',
      icon: AlignLeft,
      badge: null,
    },
    {
      id: 'media',
      label: 'Visual Media',
      icon: ImageIcon,
      badge: mediaCount,
    },
    {
      id: 'kanban',
      label: 'Kanban Tasks',
      icon: Kanban,
      badge: tasksCount,
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-zinc-800/80 bg-[#0a0b0e]/90 backdrop-blur-2xl h-screen sticky top-0 transition-all duration-200 z-30 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Specular Rim Line on Sidebar Edge */}
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-white/10 via-transparent to-white/5 pointer-events-none" />

      {/* Brand Header */}
      <div className="h-14 border-b border-zinc-800/80 px-3.5 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm tracking-tight text-white truncate block text-glow-sm">
                OmniWorkspace
              </span>
              <span className="text-[10px] text-zinc-400 font-mono truncate block">
                {currentUser?.email || 'Personal Account'}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.3)]">
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition cursor-pointer ${
            collapsed ? 'hidden' : ''
          }`}
          title="Toggle sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation list with 3D Luminous Active States */}
      <div className="flex-1 py-3 px-2 space-y-1.5 overflow-y-auto">
        {!collapsed && (
          <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Navigation
          </div>
        )}

        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 text-left group cursor-pointer ${
                isActive
                  ? 'bg-zinc-800/90 text-white border border-indigo-500/40 shadow-[0_0_18px_rgba(99,102,241,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850/60 border border-transparent'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-indigo-400' : 'text-zinc-400 group-hover:text-zinc-200'
                }`}
              />

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== null && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-colors ${
                        isActive
                          ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60'
                          : 'bg-zinc-800/90 text-zinc-400 border-zinc-700/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer User Profile & System Status */}
      <div className="p-3 border-t border-zinc-800/80 space-y-2.5">
        {canInstall && (
          <button
            onClick={onInstallClick}
            className={`btn-3d w-full flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/80 text-zinc-200 text-xs font-semibold shadow-sm transition cursor-pointer ${
              collapsed ? 'px-1' : ''
            }`}
            title="Install as native desktop app"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && <span>Install App (PWA)</span>}
          </button>
        )}

        {/* User Profile Card with 3D Aura */}
        {currentUser && (
          <div className="relative">
            {!collapsed ? (
              <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800/90 flex items-center justify-between gap-2 specular-card">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.35)]">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-zinc-400 truncate leading-tight font-mono">
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onSignOut}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/90 transition cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignOut}
                className="w-8 h-8 mx-auto rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 flex items-center justify-center transition cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Collapsed expand toggle */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
