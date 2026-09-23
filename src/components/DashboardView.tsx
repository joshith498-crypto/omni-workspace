import React from 'react';
import {
  FileText,
  AlignLeft,
  Image as ImageIcon,
  Kanban,
  Plus,
  ArrowUpRight,
  Clock,
  HardDrive,
  CheckCircle2,
  Calendar,
  Layers,
  Terminal,
  Sparkles,
} from 'lucide-react';
import { Note, MediaItem, KanbanTask, ActivityLog, ActiveView, User } from '../types';
import { CommandBar } from './CommandBar';
import { CommandExecutionResult } from '../utils/aiEngine';
import { GlowCard } from './GlowCard';

interface DashboardViewProps {
  currentUser: User | null;
  notes: Note[];
  media: MediaItem[];
  tasks: KanbanTask[];
  activity: ActivityLog[];
  summariesCount: number;
  setActiveView: (view: ActiveView) => void;
  onSelectNote: (note: Note) => void;
  onSelectMedia: (media: MediaItem) => void;
  onNewNote: () => void;
  onNewTask: () => void;
  onUploadMedia: () => void;
  onCommandExecute: (result: CommandExecutionResult) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  notes,
  media,
  tasks,
  activity,
  summariesCount,
  setActiveView,
  onSelectNote,
  onSelectMedia,
  onNewNote,
  onNewTask,
  onUploadMedia,
  onCommandExecute,
}) => {
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const userName = currentUser?.name?.split(' ')[0] || 'Friend';

  const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Top Header with 3D Depth */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-900/90 border border-zinc-700/80 text-zinc-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Personal Workspace Connected</span>
            </span>
            <span className="text-xs text-zinc-500 hidden sm:inline">
              · Offline PWA Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2 text-glow-sm">
            <span>{timeGreeting}, {userName}</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Real-time status of your notes, visual assets, action tasks, and AI summaries.
          </p>
        </div>

        {/* Quick Shortcut Buttons with 3D Tactile Elevation */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onNewNote}
            className="btn-3d flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-b from-white to-zinc-200 text-zinc-950 shadow-[0_4px_16px_rgba(255,255,255,0.15)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>

          <button
            onClick={() => setActiveView('summarizer')}
            className="btn-3d flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/70 shadow-sm cursor-pointer"
          >
            <AlignLeft className="w-4 h-4 text-zinc-400" />
            <span>Summarizer</span>
          </button>

          <button
            onClick={onUploadMedia}
            className="btn-3d flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/70 shadow-sm cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-zinc-400" />
            <span>Import Media</span>
          </button>
        </div>
      </div>

      {/* Volumetric Command Bar with 3D Aura */}
      <CommandBar onExecute={onCommandExecute} activeView="dashboard" />

      {/* 4 Core Interactive 3D Glow Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Notes - Indigo 3D Glow */}
        <GlowCard
          glow="indigo"
          onClick={() => setActiveView('notes')}
          className="p-4 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Notes Stored
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/80 text-indigo-300 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.3)] group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono text-glow-indigo">
            {notes.length}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-zinc-500">
            <span>{notes.filter((n) => n.pinned).length} pinned</span>
            <span>·</span>
            <span className="text-zinc-300 group-hover:text-indigo-300 transition-colors flex items-center font-medium">
              Open editor <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </GlowCard>

        {/* Media Files - Cyan 3D Glow */}
        <GlowCard
          glow="cyan"
          onClick={() => setActiveView('media')}
          className="p-4 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Media Assets
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
            {media.length}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-zinc-500">
            <span>{media.filter((m) => m.favorite).length} starred</span>
            <span>·</span>
            <span className="text-zinc-300 group-hover:text-cyan-300 transition-colors flex items-center font-medium">
              Gallery <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </GlowCard>

        {/* Summaries Run - Emerald 3D Glow */}
        <GlowCard
          glow="emerald"
          onClick={() => setActiveView('summarizer')}
          className="p-4 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Summaries Run
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform">
              <AlignLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
            {summariesCount}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-zinc-500">
            <span>Insights extracted</span>
            <span>·</span>
            <span className="text-zinc-300 group-hover:text-emerald-300 transition-colors flex items-center font-medium">
              Summarize <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </GlowCard>

        {/* Active Tasks - Violet 3D Glow */}
        <GlowCard
          glow="violet"
          onClick={() => setActiveView('kanban')}
          className="p-4 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Pending Tasks
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-800/80 text-purple-300 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.3)] group-hover:scale-105 transition-transform">
              <Kanban className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
            {pendingTasks}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="text-emerald-400">{completedTasks} done</span>
            <span>·</span>
            <span className="text-zinc-300 group-hover:text-purple-300 transition-colors flex items-center font-medium">
              Kanban <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </GlowCard>
      </div>

      {/* Two Columns: Recent Notes / Media & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Notes or Quick Access */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Recent Notes
            </h2>
            <button
              onClick={() => setActiveView('notes')}
              className="text-xs text-zinc-400 hover:text-white font-medium flex items-center gap-1 transition"
            >
              <span>View all notes</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {notes.length === 0 ? (
            <GlowCard glow="neutral" className="p-8 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-800/90 border border-zinc-700/80 flex items-center justify-center text-zinc-300 shadow-md">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-zinc-100">Clean Slate</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Start drafting notes, capturing ideas, or dictating with voice.
                </p>
              </div>
              <button
                onClick={onNewNote}
                className="btn-3d px-4 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-semibold shadow-md inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Note</span>
              </button>
            </GlowCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {notes.slice(0, 4).map((note) => (
                <GlowCard
                  key={note.id}
                  glow="indigo"
                  onClick={() => onSelectNote(note)}
                  className="p-4 cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800/90 text-zinc-300 border border-zinc-700/60 font-medium">
                      {note.category}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-indigo-200 line-clamp-1 transition-colors">
                    {note.title}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {note.content.replace(/[#*`_\[\]]/g, '') || 'No content yet...'}
                  </p>
                </GlowCard>
              ))}
            </div>
          )}

          {/* Priority Tasks with 3D Row Effects */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                Priority Tasks
              </h2>
              <button
                onClick={() => setActiveView('kanban')}
                className="text-xs text-zinc-400 hover:text-white font-medium flex items-center gap-1 transition"
              >
                <span>Full board</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {tasks.length === 0 ? (
              <GlowCard glow="neutral" className="p-6 text-center space-y-2">
                <p className="text-xs text-zinc-400">No project tasks created yet.</p>
                <button
                  onClick={onNewTask}
                  className="text-xs font-semibold text-zinc-200 hover:text-white inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add first task</span>
                </button>
              </GlowCard>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setActiveView('kanban')}
                    className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/90 flex items-center justify-between text-xs hover:border-zinc-700 hover:bg-zinc-850/80 transition-all cursor-pointer specular-card group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${
                          task.status === 'completed'
                            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                            : task.priority === 'high'
                            ? 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                            : 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                        }`}
                      />
                      <span
                        className={`truncate font-medium transition-colors ${
                          task.status === 'completed'
                            ? 'line-through text-zinc-500'
                            : 'text-zinc-200 group-hover:text-white'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-500 shrink-0 ml-2 font-mono">
                      {task.dueDate || 'No date'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 3D Activity Timeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Workspace Activity
            </h2>
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/75 border border-zinc-800/90 backdrop-blur-xl specular-card space-y-3.5">
            {activity.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">
                Activity events will log automatically as you create notes, manage tasks, and import media.
              </p>
            ) : (
              activity.slice(0, 6).map((item) => (
                <div key={item.id} className="flex items-start gap-3 text-xs group">
                  <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center shrink-0 mt-0.5 text-zinc-300 shadow-inner group-hover:border-zinc-500 transition-colors">
                    {item.type === 'note' && <FileText className="w-3 h-3 text-indigo-400" />}
                    {item.type === 'task' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    {item.type === 'media' && <ImageIcon className="w-3 h-3 text-cyan-400" />}
                    {item.type === 'summary' && <AlignLeft className="w-3 h-3 text-amber-400" />}
                    {item.type === 'command' && <Terminal className="w-3 h-3 text-violet-400" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">{item.description}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 whitespace-nowrap shrink-0 font-mono">
                    {item.timestamp}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
