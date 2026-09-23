import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  Mic,
  CheckCheck,
  Wand2,
  Table as TableIcon,
  List,
  Eye,
  Edit3,
  ChevronDown,
  Copy,
  Hash,
  Bold,
  Italic,
  Code,
  Quote,
  Check,
  FileText,
  Sparkles,
  CheckSquare,
  Bot,
} from 'lucide-react';
import { Note, NoteCategory } from '../types';
import { proofreadText, rewriteTone, transformContent, RewriteTone } from '../utils/aiEngine';

interface NotesViewProps {
  notes: Note[];
  onSaveNotes: (notes: Note[]) => void;
  selectedNoteId?: string;
  onLogActivity: (type: 'note' | 'command', title: string, desc: string) => void;
  triggerDictationOnLoad?: boolean;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onSaveNotes,
  selectedNoteId,
  onLogActivity,
  triggerDictationOnLoad,
}) => {
  const [activeNoteId, setActiveNoteId] = useState<string>(
    selectedNoteId || (notes[0]?.id ?? '')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [dictationInterim, setDictationInterim] = useState('');
  const [showRewriteMenu, setShowRewriteMenu] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAiWorking, setIsAiWorking] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (selectedNoteId) {
      setActiveNoteId(selectedNoteId);
    } else if (notes.length > 0 && (!activeNoteId || !notes.some((n) => n.id === activeNoteId))) {
      setActiveNoteId(notes[0].id);
    }
  }, [selectedNoteId, notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  // Speech Recognition init
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        setDictationInterim(interim);

        if (final && activeNote) {
          handleAppendContent('\n' + final.trim());
          setDictationInterim('');
        }
      };

      recognition.onerror = () => {
        setIsDictating(false);
        setDictationInterim('');
      };

      recognition.onend = () => {
        setIsDictating(false);
        setDictationInterim('');
      };

      recognitionRef.current = recognition;
    }

    if (triggerDictationOnLoad) {
      startDictation();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [activeNoteId]);

  const startDictation = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsDictating(true);
      } catch {
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current.start();
          setIsDictating(true);
        }, 150);
      }
    } else {
      setIsDictating(true);
      setDictationInterim('Speech dictation active in simulation mode...');
      setTimeout(() => {
        handleAppendContent('\nDictated insight: Focus on modular workflow architecture.');
        setIsDictating(false);
        setDictationInterim('');
      }, 1500);
    }
  };

  const stopDictation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsDictating(false);
    setDictationInterim('');
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: 'note-' + Date.now(),
      title: 'Untitled Note',
      content: '',
      category: (selectedCategory === 'All' ? 'Work' : selectedCategory) as NoteCategory,
      updatedAt: new Date().toISOString(),
      pinned: false,
      tags: [],
    };

    const updated = [newNote, ...notes];
    onSaveNotes(updated);
    setActiveNoteId(newNote.id);
    onLogActivity('note', 'New Note Created', `Created "${newNote.title}"`);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const toDelete = notes.find((n) => n.id === id);
    const updated = notes.filter((n) => n.id !== id);
    onSaveNotes(updated);

    if (activeNoteId === id) {
      setActiveNoteId(updated[0]?.id || '');
    }

    if (toDelete) {
      onLogActivity('note', 'Note Removed', `Deleted "${toDelete.title}"`);
    }
  };

  const handleTogglePin = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = notes.map((n) =>
      n.id === id ? { ...n, pinned: !n.pinned } : n
    );
    onSaveNotes(updated);
  };

  const updateActiveNote = (patch: Partial<Note>) => {
    if (!activeNote) return;
    const updated = notes.map((n) =>
      n.id === activeNote.id
        ? {
            ...n,
            ...patch,
            updatedAt: new Date().toISOString(),
          }
        : n
    );
    onSaveNotes(updated);
  };

  const handleAppendContent = (extra: string) => {
    if (!activeNote) return;
    updateActiveNote({
      content: (activeNote.content || '') + extra,
    });
  };

  // Full-Stack Gemini AI Notes Actions
  const runAiNoteAction = async (
    action: 'proofread' | 'rewrite' | 'expand' | 'summarize_tasks' | 'continue',
    tone?: RewriteTone
  ) => {
    if (!activeNote || !activeNote.content.trim() || isAiWorking) return;
    setIsAiWorking(true);
    setShowRewriteMenu(false);
    setNotice(`OmniBot AI is processing (${action.replace('_', ' ')})...`);

    try {
      const res = await fetch('/api/gemini/notes-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          text: activeNote.content,
          title: activeNote.title,
          tone,
        }),
      });

      const data = await res.json();
      if (data && data.result) {
        if (action === 'expand' || action === 'continue') {
          updateActiveNote({ content: data.result });
        } else if (action === 'summarize_tasks') {
          updateActiveNote({
            content: activeNote.content + '\n\n### Extracted Action Items\n' + data.result,
          });
        } else {
          updateActiveNote({ content: data.result });
        }
        setNotice(`Gemini AI ${action.replace('_', ' ')} completed successfully.`);
        onLogActivity('note', `AI ${action}`, `Enhanced "${activeNote.title}" using Gemini AI`);
      }
    } catch (e) {
      // Local fallback
      if (action === 'proofread') {
        const result = proofreadText(activeNote.content);
        updateActiveNote({ content: result.improvedText });
        setNotice(`Proofread completed locally.`);
      } else if (action === 'rewrite' && tone) {
        const rewritten = rewriteTone(activeNote.content, tone);
        updateActiveNote({ content: rewritten });
        setNotice(`Tone adjusted to ${tone}.`);
      }
    } finally {
      setIsAiWorking(false);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  // Proofread shortcut
  const handleProofread = () => {
    runAiNoteAction('proofread');
  };

  // Rewrite Tone shortcut
  const handleRewrite = (tone: RewriteTone) => {
    runAiNoteAction('rewrite', tone);
  };

  // Transform
  const handleTransform = (format: 'key_points' | 'table') => {
    if (!activeNote || !activeNote.content.trim()) return;
    const transformed = transformContent(activeNote.content, format);
    updateActiveNote({ content: transformed });
    setNotice(
      format === 'key_points'
        ? 'Transformed content into key points.'
        : 'Transformed content into table.'
    );
    onLogActivity('note', 'Transform Content', `Generated structured representation in "${activeNote.title}"`);
    setTimeout(() => setNotice(null), 4000);
  };

  const insertMarkdown = (prefix: string, suffix = '') => {
    if (!textareaRef.current || !activeNote) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = activeNote.content.substring(start, end);
    const replacement = prefix + (selected || 'text') + suffix;
    const newContent =
      activeNote.content.substring(0, start) +
      replacement +
      activeNote.content.substring(end);

    updateActiveNote({ content: newContent });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected ? selected.length : 4)
      );
    }, 50);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim() && activeNote) {
      e.preventDefault();
      const tag = newTagInput.trim().replace(/^#/, '');
      if (!activeNote.tags.includes(tag)) {
        updateActiveNote({ tags: [...activeNote.tags, tag] });
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!activeNote) return;
    updateActiveNote({
      tags: activeNote.tags.filter((t) => t !== tagToRemove),
    });
  };

  const categories: NoteCategory[] = ['Work', 'School', 'Personal', 'Ideas'];
  const filteredNotes = notes.filter((n) => {
    const matchCat = selectedCategory === 'All' || n.category === selectedCategory;
    const matchSearch =
      searchQuery === '' ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-140px)] min-h-[600px] pb-16 lg:pb-0">
      {/* Left List Column */}
      <div className="w-full lg:w-76 flex flex-col bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/80 shrink-0">
        {/* Header & New Note Button */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <h2 className="font-semibold text-white text-sm">Notes</h2>
            <span className="text-[11px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
              {filteredNotes.length}
            </span>
          </div>
          <button
            onClick={handleCreateNote}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition active:scale-95 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter notes..."
            className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-zinc-700"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-1.5 no-scrollbar">
          {['All', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[11px] px-2 py-0.5 rounded-md shrink-0 transition font-medium ${
                selectedCategory === cat
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'bg-zinc-900/40 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-10 px-2 space-y-2">
              <FileText className="w-6 h-6 mx-auto text-zinc-600" />
              <p className="text-xs text-zinc-500">
                {notes.length === 0 ? 'No notes created yet.' : 'No notes match search.'}
              </p>
              {notes.length === 0 && (
                <button
                  onClick={handleCreateNote}
                  className="text-xs text-zinc-300 hover:text-white font-medium inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Create first note</span>
                </button>
              )}
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isSelected = activeNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`p-2.5 rounded-lg text-left transition cursor-pointer border relative group ${
                    isSelected
                      ? 'bg-zinc-800/90 border-zinc-700 text-white'
                      : 'bg-zinc-950/40 border-transparent text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                      {note.category}
                    </span>
                    <div className="flex items-center gap-1">
                      {note.pinned && <Pin className="w-3 h-3 text-amber-400 fill-amber-400" />}
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(note.updatedAt).toLocaleDateString([], {
                          month: 'numeric',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-semibold truncate text-zinc-200">
                    {note.title || 'Untitled Note'}
                  </h3>

                  <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                    {note.content.replace(/[#*`_\[\]]/g, '') || 'Empty note...'}
                  </p>

                  <div className="absolute right-2 bottom-2 hidden group-hover:flex items-center gap-1">
                    <button
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Active Note Editor */}
      <div className="flex-1 flex flex-col bg-zinc-900/60 rounded-xl border border-zinc-800/80 p-3 sm:p-4 min-w-0">
        {!activeNote ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">No active note selected</h3>
              <p className="text-xs text-zinc-500 max-w-sm">
                Create a note to start writing with markdown support, voice dictation, and syntax tools.
              </p>
            </div>
            <button
              onClick={handleCreateNote}
              className="px-3.5 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-sm transition active:scale-95 inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Note</span>
            </button>
          </div>
        ) : (
          <>
            {/* Editor Header: Title, Category, Action Tools */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => updateActiveNote({ title: e.target.value })}
                placeholder="Note Title..."
                className="bg-transparent text-base sm:text-lg font-semibold text-white placeholder-zinc-500 outline-none flex-1 min-w-0"
              />

              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                <select
                  value={activeNote.category}
                  onChange={(e) =>
                    updateActiveNote({ category: e.target.value as NoteCategory })
                  }
                  className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2 py-1 outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleTogglePin(activeNote.id)}
                  className={`p-1.5 rounded-lg border text-xs transition ${
                    activeNote.pinned
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                  title={activeNote.pinned ? 'Unpin' : 'Pin'}
                >
                  <Pin className={`w-3.5 h-3.5 ${activeNote.pinned ? 'fill-amber-300' : ''}`} />
                </button>

                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
                    isPreviewMode
                      ? 'bg-zinc-800 text-white border-zinc-700'
                      : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-900'
                  }`}
                >
                  {isPreviewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{isPreviewMode ? 'Edit' : 'Preview'}</span>
                </button>
              </div>
            </div>

            {/* Smart Writing Tools Bar with Gemini AI Built-in */}
            <div className="py-2 border-b border-zinc-800/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-[10px] font-mono font-semibold mr-1 shadow-[0_0_10px_rgba(99,102,241,0.25)]">
                  <Sparkles className={`w-3 h-3 ${isAiWorking ? 'animate-spin text-white' : 'text-indigo-400'}`} />
                  <span>{isAiWorking ? 'AI Processing...' : 'AI Writing'}</span>
                </div>

                <button
                  onClick={handleProofread}
                  disabled={isAiWorking}
                  className="btn-3d flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-750 border border-zinc-700/70 text-zinc-100 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                  title="Fix typos, punctuation, grammar, and elevate syntax"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Proofread</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowRewriteMenu(!showRewriteMenu)}
                    disabled={isAiWorking}
                    className="btn-3d flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-750 border border-zinc-700/70 text-zinc-100 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Rewrite Tone</span>
                    <ChevronDown className="w-3 h-3 text-zinc-400" />
                  </button>

                  {showRewriteMenu && (
                    <div className="absolute left-0 top-full mt-1.5 w-40 bg-zinc-900 border border-zinc-700 rounded-xl p-1 shadow-2xl z-30 text-xs specular-card">
                      {(['Professional', 'Friendly', 'Concise', 'Academic'] as RewriteTone[]).map(
                        (tone) => (
                          <button
                            key={tone}
                            onClick={() => handleRewrite(tone)}
                            className="w-full text-left px-2.5 py-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800/90 rounded-lg transition font-medium cursor-pointer"
                          >
                            {tone}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => runAiNoteAction('expand')}
                  disabled={isAiWorking}
                  className="btn-3d flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-750 border border-zinc-700/70 text-zinc-100 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                  title="Elaborate key points with AI"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Expand</span>
                </button>

                <button
                  onClick={() => runAiNoteAction('summarize_tasks')}
                  disabled={isAiWorking}
                  className="btn-3d flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-750 border border-zinc-700/70 text-zinc-100 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                  title="Extract action items to-do checklist"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Extract To-Dos</span>
                </button>

                <button
                  onClick={() => runAiNoteAction('continue')}
                  disabled={isAiWorking}
                  className="btn-3d flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-750 border border-zinc-700/70 text-zinc-100 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                  title="Continue drafting text"
                >
                  <span className="text-cyan-400 font-mono text-xs">⏩</span>
                  <span>Continue</span>
                </button>

                <button
                  onClick={() => handleTransform('key_points')}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 text-xs transition cursor-pointer"
                  title="Transform to key points"
                >
                  <List className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="hidden sm:inline">Key Points</span>
                </button>

                <button
                  onClick={() => handleTransform('table')}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 text-xs transition cursor-pointer"
                  title="Transform to table"
                >
                  <TableIcon className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="hidden sm:inline">Table</span>
                </button>
              </div>

              {/* Dictation Voice Button */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={isDictating ? stopDictation : startDictation}
                  className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isDictating
                      ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse'
                      : 'bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/80'
                  }`}
                  title={isDictating ? 'Stop dictating' : 'Start speech-to-text dictation'}
                >
                  <Mic className={`w-3.5 h-3.5 ${isDictating ? 'animate-pulse text-white' : 'text-rose-400'}`} />
                  <span>{isDictating ? 'Listening...' : 'Voice Dictate'}</span>
                </button>
              </div>
            </div>

            {/* Markdown Toolbar (only in edit mode) */}
            {!isPreviewMode && (
              <div className="py-1.5 border-b border-zinc-800/60 flex items-center gap-1 text-zinc-400 text-xs">
                <button
                  onClick={() => insertMarkdown('**', '**')}
                  className="p-1 rounded hover:bg-zinc-800 hover:text-white"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => insertMarkdown('*', '*')}
                  className="p-1 rounded hover:bg-zinc-800 hover:text-white"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => insertMarkdown('`', '`')}
                  className="p-1 rounded hover:bg-zinc-800 hover:text-white"
                  title="Inline Code"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => insertMarkdown('\n> ')}
                  className="p-1 rounded hover:bg-zinc-800 hover:text-white"
                  title="Blockquote"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => insertMarkdown('\n- ')}
                  className="p-1 rounded hover:bg-zinc-800 hover:text-white"
                  title="Bullet List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Feedback notification */}
            {notice && (
              <div className="my-1.5 p-1.5 px-2.5 rounded-lg bg-zinc-800 text-zinc-200 text-xs flex items-center justify-between">
                <span>{notice}</span>
                <button onClick={() => setNotice(null)} className="text-zinc-500 hover:text-white">
                  ✕
                </button>
              </div>
            )}

            {/* Dictation Interim Preview */}
            {isDictating && dictationInterim && (
              <div className="my-1 p-2 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs">
                {dictationInterim}
              </div>
            )}

            {/* Main Editor Textarea or Markdown Preview */}
            <div className="flex-1 min-h-0 py-2">
              {isPreviewMode ? (
                <div className="h-full overflow-y-auto prose prose-invert max-w-none text-xs sm:text-sm text-zinc-200 leading-relaxed pr-2">
                  {activeNote.content ? (
                    <div className="whitespace-pre-wrap font-sans">
                      {activeNote.content}
                    </div>
                  ) : (
                    <p className="text-zinc-500 italic">No content to preview.</p>
                  )}
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={activeNote.content}
                  onChange={(e) => updateActiveNote({ content: e.target.value })}
                  placeholder="Type notes, meeting takeaways, or click Dictate..."
                  className="w-full h-full bg-transparent text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 resize-none outline-none font-sans leading-relaxed"
                />
              )}
            </div>

            {/* Tags & Meta Footer */}
            <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
              <div className="flex items-center gap-1 flex-wrap">
                <Hash className="w-3.5 h-3.5 text-zinc-500" />
                {activeNote.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50 text-[11px] flex items-center gap-1"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-400"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="+ tag (Enter)"
                  className="bg-transparent border-none outline-none text-[11px] text-zinc-400 placeholder-zinc-600 w-24"
                />
              </div>

              <div className="text-[11px] text-zinc-500 font-mono">
                {activeNote.content ? activeNote.content.split(/\s+/).filter(Boolean).length : 0} words
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
