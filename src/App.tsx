/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ActiveView,
  Note,
  MediaItem,
  KanbanTask,
  ActivityLog,
  User,
  NoteCategory,
} from './types';
import {
  getCurrentUser,
  setCurrentUser as persistCurrentUser,
  clearCurrentUser,
  getStoredNotes,
  saveNotes,
  getStoredMedia,
  saveMedia,
  getStoredTasks,
  saveTasks,
  getStoredActivity,
  logActivity,
  getSummariesCount,
  incrementSummariesCount,
} from './utils/storage';
import { CommandExecutionResult } from './utils/aiEngine';
import { AuthView } from './components/AuthView';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { DashboardView } from './components/DashboardView';
import { NotesView } from './components/NotesView';
import { SummarizerView } from './components/SummarizerView';
import { VisualMediaView } from './components/VisualMediaView';
import { KanbanView } from './components/KanbanView';
import { PWAInstallModal } from './components/PWAInstallModal';
import { OmniAssistantBot } from './components/OmniAssistantBot';
import { Layers, Download, LogOut, HardDrive } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => getCurrentUser());
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Core application state
  const [notes, setNotes] = useState<Note[]>(() => getStoredNotes());
  const [media, setMedia] = useState<MediaItem[]>(() => getStoredMedia());
  const [tasks, setTasks] = useState<KanbanTask[]>(() => getStoredTasks());
  const [activity, setActivity] = useState<ActivityLog[]>(() => getStoredActivity());
  const [summariesCount, setSummariesCount] = useState<number>(() => getSummariesCount());

  // Navigation and selection context
  const [selectedNoteId, setSelectedNoteId] = useState<string | undefined>(undefined);
  const [selectedMediaItem, setSelectedMediaItem] = useState<MediaItem | null>(null);
  const [mediaSearchQuery, setMediaSearchQuery] = useState<string>('');
  const [triggerDictation, setTriggerDictation] = useState<boolean>(false);

  // PWA install prompt handler
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setIsInstallModalOpen(true);
    }
  };

  const handleLogin = (user: User) => {
    persistCurrentUser(user);
    setCurrentUserState(user);
    handleLogActivity('command', 'User Session Started', `Signed in as ${user.name}`);
  };

  const handleSignOut = () => {
    clearCurrentUser();
    setCurrentUserState(null);
  };

  // State persistence handlers
  const handleSaveNotes = (updated: Note[]) => {
    setNotes(updated);
    saveNotes(updated);
  };

  const handleSaveMedia = (updated: MediaItem[]) => {
    setMedia(updated);
    saveMedia(updated);
  };

  const handleSaveTasks = (updated: KanbanTask[]) => {
    setTasks(updated);
    saveTasks(updated);
  };

  const handleLogActivity = (
    type: ActivityLog['type'],
    title: string,
    description: string
  ) => {
    logActivity({ type, title, description });
    setActivity(getStoredActivity());
  };

  const handleIncrementSummaries = () => {
    const updated = incrementSummariesCount();
    setSummariesCount(updated);
  };

  // Command bar execution dispatcher
  const handleCommandExecute = (result: CommandExecutionResult) => {
    if (result.targetView) {
      setActiveView(result.targetView);
    }

    if (result.createdNote) {
      const newNote: Note = {
        id: 'note-' + Date.now(),
        title: result.createdNote.title,
        content: result.createdNote.content,
        category: result.createdNote.category,
        updatedAt: new Date().toISOString(),
        tags: [result.createdNote.category],
      };
      const updated = [newNote, ...notes];
      handleSaveNotes(updated);
      setSelectedNoteId(newNote.id);
      handleLogActivity('note', 'Note Created', `Created "${newNote.title}"`);
    }

    if (result.createdTask) {
      const newTask: KanbanTask = {
        id: 'task-' + Date.now(),
        title: result.createdTask.title || 'Workspace Task',
        description: result.createdTask.description || 'Created via command bar.',
        status: result.createdTask.status || 'todo',
        priority: result.createdTask.priority || 'medium',
        category: result.createdTask.category || 'Work',
        dueDate: result.createdTask.dueDate || 'Today',
        createdAt: new Date().toISOString(),
      };
      const updated = [newTask, ...tasks];
      handleSaveTasks(updated);
      handleLogActivity('task', 'Task Added', `Added "${newTask.title}"`);
    }

    if (result.searchQuery) {
      setMediaSearchQuery(result.searchQuery);
    }
  };

  // Quick action helpers
  const handleQuickNewNote = () => {
    const newNote: Note = {
      id: 'note-' + Date.now(),
      title: 'Quick Note',
      content: '',
      category: 'Work',
      updatedAt: new Date().toISOString(),
      tags: [],
    };
    handleSaveNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    setActiveView('notes');
    setTriggerDictation(false);
  };

  const handleQuickVoiceDictate = () => {
    const newNote: Note = {
      id: 'note-' + Date.now(),
      title: 'Dictated Note ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: '',
      category: 'Work',
      updatedAt: new Date().toISOString(),
      tags: ['Voice'],
    };
    handleSaveNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    setActiveView('notes');
    setTriggerDictation(true);
  };

  const handleQuickNewTask = () => {
    setActiveView('kanban');
  };

  const handleQuickUploadMedia = () => {
    setActiveView('media');
  };

  const handleAddTasksFromSummary = (newTasks: KanbanTask[]) => {
    const updated = [...newTasks, ...tasks];
    handleSaveTasks(updated);
    handleLogActivity(
      'task',
      'Tasks Imported',
      `Imported ${newTasks.length} action item(s) from Document Summarizer`
    );
  };

  const handleAddNoteFromBot = (newNoteData: {
    title: string;
    content: string;
    category: NoteCategory;
  }) => {
    const newNote: Note = {
      id: 'note-' + Date.now(),
      title: newNoteData.title,
      content: newNoteData.content,
      category: newNoteData.category,
      updatedAt: new Date().toISOString(),
      pinned: false,
      tags: ['ai-bot'],
    };
    const updated = [newNote, ...notes];
    handleSaveNotes(updated);
    setSelectedNoteId(newNote.id);
    setActiveView('notes');
    handleLogActivity('note', 'Note Created via OmniBot', `Created "${newNote.title}"`);
  };

  const handleAddTaskFromBot = (taskData: Partial<KanbanTask>) => {
    const newTask: KanbanTask = {
      id: 'task-' + Date.now(),
      title: taskData.title || 'OmniBot Task',
      description: taskData.description || 'Generated via OmniBot 3D Assistant',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || 'This Week',
      category: taskData.category || 'Work',
      createdAt: new Date().toISOString(),
    };
    const updated = [newTask, ...tasks];
    handleSaveTasks(updated);
    handleLogActivity('task', 'Task Added via OmniBot', `Added "${newTask.title}"`);
  };

  const handleUpdateActiveNoteContent = (newContent: string) => {
    const noteToUpdate = notes.find((n) => n.id === selectedNoteId) || notes[0];
    if (noteToUpdate) {
      const updated = notes.map((n) =>
        n.id === noteToUpdate.id
          ? { ...n, content: newContent, updatedAt: new Date().toISOString() }
          : n
      );
      handleSaveNotes(updated);
      handleLogActivity('note', 'Note Updated via OmniBot', `Enhanced "${noteToUpdate.title}"`);
    }
  };

  // If user is not authenticated, render Login / Register view
  if (!currentUser) {
    return <AuthView onLogin={handleLogin} />;
  }

  return (
    <div className="relative min-h-screen bg-[#07080a] text-zinc-100 flex flex-col md:flex-row antialiased selection:bg-indigo-600 selection:text-white overflow-x-hidden bg-dot-matrix">
      {/* 3D Ambient Volumetric Light Orbs */}
      <div className="pointer-events-none fixed -top-32 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] animate-ambient-1 z-0" />
      <div className="pointer-events-none fixed top-1/3 -right-32 w-96 h-96 bg-cyan-600/15 rounded-full blur-[140px] animate-ambient-2 z-0" />
      <div className="pointer-events-none fixed -bottom-32 left-1/3 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] animate-ambient-pulse z-0" />

      {/* Desktop Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        notesCount={notes.length}
        mediaCount={media.length}
        tasksCount={tasks.filter((t) => t.status !== 'completed').length}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onInstallClick={() => setIsInstallModalOpen(true)}
        canInstall={true}
      />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Desktop & Mobile Header Bar with 3D Specular Rim */}
        <header className="h-14 border-b border-zinc-800/90 px-4 sm:px-6 flex items-center justify-between bg-[#0a0b0e]/80 sticky top-0 z-30 backdrop-blur-xl">
          {/* Specular Rim Line */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.3)]">
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="font-bold text-xs sm:text-sm text-white text-glow-sm">OmniWorkspace</span>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400">
              <span className="text-zinc-500 font-mono">Workspace</span>
              <span>/</span>
              <span className="text-zinc-200 font-semibold capitalize flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.6)]" />
                {activeView === 'summarizer' ? 'Document Summarizer' : activeView}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/70 text-[11px] text-zinc-300 font-mono shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Offline Ready</span>
            </div>

            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-zinc-300 hover:text-white hover:border-zinc-500 shadow-sm transition cursor-pointer"
              title="Install Desktop PWA"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Mobile Sign out button */}
            <button
              onClick={handleSignOut}
              className="md:hidden p-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Main Viewport */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeView === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              notes={notes}
              media={media}
              tasks={tasks}
              activity={activity}
              summariesCount={summariesCount}
              setActiveView={setActiveView}
              onSelectNote={(note) => {
                setSelectedNoteId(note.id);
                setActiveView('notes');
              }}
              onSelectMedia={(item) => {
                setSelectedMediaItem(item);
                setActiveView('media');
              }}
              onNewNote={handleQuickNewNote}
              onNewTask={handleQuickNewTask}
              onUploadMedia={handleQuickUploadMedia}
              onCommandExecute={handleCommandExecute}
            />
          )}

          {activeView === 'notes' && (
            <NotesView
              notes={notes}
              onSaveNotes={handleSaveNotes}
              selectedNoteId={selectedNoteId}
              onLogActivity={handleLogActivity}
              triggerDictationOnLoad={triggerDictation}
            />
          )}

          {activeView === 'summarizer' && (
            <SummarizerView
              onAddTasksToKanban={handleAddTasksFromSummary}
              onIncrementSummaries={handleIncrementSummaries}
              onLogActivity={handleLogActivity}
            />
          )}

          {activeView === 'media' && (
            <VisualMediaView
              media={media}
              onSaveMedia={handleSaveMedia}
              selectedMediaItem={selectedMediaItem}
              onLogActivity={handleLogActivity}
              initialSearchQuery={mediaSearchQuery}
            />
          )}

          {activeView === 'kanban' && (
            <KanbanView
              tasks={tasks}
              onSaveTasks={handleSaveTasks}
              onLogActivity={handleLogActivity}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar & Quick Action FAB */}
      <MobileNav
        activeView={activeView}
        setActiveView={setActiveView}
        onQuickNewNote={handleQuickNewNote}
        onQuickNewTask={handleQuickNewTask}
        onQuickUploadMedia={handleQuickUploadMedia}
        onQuickVoiceDictate={handleQuickVoiceDictate}
      />

      {/* Ubiquitous 3D OmniBot Assistant (Everywhere in Workspace) */}
      <OmniAssistantBot
        currentView={activeView}
        activeNote={notes.find((n) => n.id === selectedNoteId) || notes[0] || null}
        allNotes={notes}
        allTasks={tasks}
        onNavigate={setActiveView}
        onAddNote={handleAddNoteFromBot}
        onAddTask={handleAddTaskFromBot}
        onSelectNote={(noteId) => {
          setSelectedNoteId(noteId);
          setActiveView('notes');
        }}
        onDeleteNote={(noteId) => {
          const updated = notes.filter((n) => n.id !== noteId);
          handleSaveNotes(updated);
          if (selectedNoteId === noteId) {
            setSelectedNoteId(updated[0]?.id);
          }
          handleLogActivity('note', 'Note Deleted via OmniBot', 'Removed note from workspace');
        }}
        onUpdateTaskStatus={(taskId, newStatus) => {
          const updated = tasks.map((t) =>
            t.id === taskId ? { ...t, status: newStatus } : t
          );
          handleSaveTasks(updated);
          handleLogActivity('task', 'Task Updated via OmniBot', `Changed status to ${newStatus}`);
        }}
        onUpdateActiveNoteContent={handleUpdateActiveNoteContent}
      />

      {/* PWA Install Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onInstall={handleInstallPWA}
        isInstallable={!!deferredPrompt}
      />
    </div>
  );
}
