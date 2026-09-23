import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  AlignLeft,
  Image as ImageIcon,
  Kanban,
  Plus,
  Mic,
  Upload,
  CheckSquare,
  X,
} from 'lucide-react';
import { ActiveView } from '../types';

interface MobileNavProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onQuickNewNote: () => void;
  onQuickNewTask: () => void;
  onQuickUploadMedia: () => void;
  onQuickVoiceDictate: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeView,
  setActiveView,
  onQuickNewNote,
  onQuickNewTask,
  onQuickUploadMedia,
  onQuickVoiceDictate,
}) => {
  const [showQuickSheet, setShowQuickSheet] = useState(false);

  const navItems = [
    { id: 'dashboard' as ActiveView, label: 'Home', icon: LayoutDashboard },
    { id: 'notes' as ActiveView, label: 'Notes', icon: FileText },
    { id: 'summarizer' as ActiveView, label: 'Summarizer', icon: AlignLeft },
    { id: 'media' as ActiveView, label: 'Media', icon: ImageIcon },
    { id: 'kanban' as ActiveView, label: 'Tasks', icon: Kanban },
  ];

  return (
    <>
      {/* Quick Action Sheet Modal for Mobile */}
      {showQuickSheet && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setShowQuickSheet(false)} />
          <div className="relative bg-zinc-900 border-t border-zinc-800 rounded-t-2xl p-4 pb-7 space-y-3 shadow-2xl z-10">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-100 text-sm">Quick Actions</h3>
              <button
                onClick={() => setShowQuickSheet(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => {
                  setShowQuickSheet(false);
                  onQuickVoiceDictate();
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-left text-zinc-200 hover:bg-zinc-800 transition active:scale-95"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center text-zinc-200 shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Voice Dictate</div>
                  <div className="text-[10px] text-zinc-400">Speak new note</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickSheet(false);
                  onQuickNewNote();
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-left text-zinc-200 hover:bg-zinc-800 transition active:scale-95"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center text-zinc-200 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">New Note</div>
                  <div className="text-[10px] text-zinc-400">Editor</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickSheet(false);
                  onQuickNewTask();
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-left text-zinc-200 hover:bg-zinc-800 transition active:scale-95"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center text-zinc-200 shrink-0">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Add Task</div>
                  <div className="text-[10px] text-zinc-400">Kanban item</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickSheet(false);
                  onQuickUploadMedia();
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-left text-zinc-200 hover:bg-zinc-800 transition active:scale-95"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center text-zinc-200 shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Import Media</div>
                  <div className="text-[10px] text-zinc-400">Photo or video</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) on mobile */}
      <div className="fixed bottom-16 right-4 z-40 md:hidden">
        <button
          onClick={() => setShowQuickSheet(true)}
          className="w-11 h-11 rounded-full bg-zinc-100 text-zinc-950 shadow-xl flex items-center justify-center border border-zinc-300 active:scale-90 transition-transform"
          aria-label="Quick Action"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Fixed Bottom Navigation Bar for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-zinc-950/95 border-t border-zinc-800/90 px-2 py-1.5 backdrop-blur-md">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
                  isActive ? 'text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
