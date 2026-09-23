import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Send,
  X,
  Bot,
  Copy,
  Check,
  Plus,
  Volume2,
  VolumeX,
  CornerDownLeft,
  ChevronRight,
  FileText,
  Kanban,
  CheckCircle2,
  Wand2,
} from 'lucide-react';
import { ActiveView, Note, KanbanTask, NoteCategory } from '../types';
import { generateIntelligentResponse } from '../utils/intelligentEngine';

interface OmniAssistantBotProps {
  currentView: ActiveView;
  activeNote?: Note | null;
  allNotes?: Note[];
  allTasks?: KanbanTask[];
  onNavigate: (view: ActiveView) => void;
  onAddNote: (note: { title: string; content: string; category: NoteCategory }) => void;
  onAddTask: (task: Partial<KanbanTask>) => void;
  onSelectNote?: (noteId: string) => void;
  onDeleteNote?: (noteId: string) => void;
  onUpdateTaskStatus?: (taskId: string, status: KanbanTask['status']) => void;
  onUpdateActiveNoteContent?: (newContent: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  actionPayload?: {
    type: 'note' | 'task' | 'open_note' | 'navigate' | 'delete_note' | 'update_task_status';
    data: any;
  };
}

export const OmniAssistantBot: React.FC<OmniAssistantBotProps> = ({
  currentView,
  activeNote,
  allNotes = [],
  allTasks = [],
  onNavigate,
  onAddNote,
  onAddTask,
  onSelectNote,
  onDeleteNote,
  onUpdateTaskStatus,
  onUpdateActiveNoteContent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [executedActions, setExecutedActions] = useState<Record<string, boolean>>({});

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I'm OmniBot, your intelligent 3D workspace assistant powered by Gemini. You can speak or type to brainstorm, draft notes, manage tasks, or refine your writing.",
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputQuery(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Keyboard shortcut (⌘J or Ctrl+J to toggle bot)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. You can type your request directly.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const speakText = (text: string) => {
    if (!speechEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      // Clean markdown tags for spoken audio
      const clean = text
        .replace(/ACTION_[A-Z_]+:\s*\{.*?\}/gs, '')
        .replace(/[#*`_~]/g, '')
        .trim();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
    }
  };

  const handleSendMessage = async (queryToSend?: string) => {
    const query = (queryToSend || inputQuery).trim();
    if (!query || isProcessing) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);

    try {
      const response = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          currentView,
          activeNote: activeNote
            ? { id: activeNote.id, title: activeNote.title, content: activeNote.content, category: activeNote.category }
            : null,
          allNotes: (allNotes || []).map((n, i) => ({
            id: n.id,
            title: n.title,
            category: n.category,
            content: n.content,
            updatedAt: n.updatedAt,
            index: i + 1,
          })),
          allTasks: (allTasks || []).map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            dueDate: t.dueDate,
          })),
          context: `User is working in ${currentView} view.`,
        }),
      });

      const data = await response.json();
      let replyText = data.reply || 'Request completed.';

      // Parse possible actions from structured payload or embedded text
      let actionPayload: Message['actionPayload'] | undefined = data.actionPayload;

      if (!actionPayload) {
        const noteMatch = replyText.match(/ACTION_CREATE_NOTE:\s*(\{[\s\S]*?\})/);
        if (noteMatch) {
          try {
            const parsed = JSON.parse(noteMatch[1]);
            actionPayload = { type: 'note', data: parsed };
          } catch (e) {}
        }
        const taskMatch = replyText.match(/ACTION_CREATE_TASK:\s*(\{[\s\S]*?\})/);
        if (taskMatch) {
          try {
            const parsed = JSON.parse(taskMatch[1]);
            actionPayload = { type: 'task', data: parsed };
          } catch (e) {}
        }
      }

      // Clean ACTION_ tags from the chat message display
      replyText = replyText
        .replace(/ACTION_CREATE_NOTE:\s*\{[\s\S]*?\}/g, '')
        .replace(/ACTION_CREATE_TASK:\s*\{[\s\S]*?\}/g, '')
        .replace(/ACTION_NAVIGATE:\s*\{[\s\S]*?\}/g, '')
        .trim();

      const botMsg: Message = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: replyText,
        timestamp: 'Now',
        actionPayload,
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(replyText);

      // Auto-execute immediate Siri commands (e.g. "open note 1" or "go to kanban")
      if (actionPayload) {
        if (actionPayload.type === 'open_note' && /(open|show|select|view)\s+(?:the\s+)?note/i.test(query)) {
          if (actionPayload.data.noteId && onSelectNote) {
            onSelectNote(actionPayload.data.noteId);
          }
          onNavigate('notes');
        } else if (actionPayload.type === 'navigate') {
          onNavigate(actionPayload.data.view);
        } else if (actionPayload.type === 'update_task_status') {
          if (actionPayload.data.taskId && onUpdateTaskStatus) {
            onUpdateTaskStatus(actionPayload.data.taskId, actionPayload.data.status);
          }
        } else if (actionPayload.type === 'delete_note') {
          if (actionPayload.data.noteId && onDeleteNote) {
            onDeleteNote(actionPayload.data.noteId);
          }
        }
      }
    } catch (err: any) {
      // High-intelligence offline/local reasoning fallback
      const localResult = generateIntelligentResponse(query, currentView, activeNote, allNotes || [], allTasks || []);
      const botMsg: Message = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: localResult.reply,
        timestamp: 'Now',
        actionPayload: localResult.actionPayload as Message['actionPayload'],
      };
      setMessages((prev) => [...prev, botMsg]);
      speakText(localResult.reply);

      if (localResult.actionPayload) {
        if (localResult.actionPayload.type === 'open_note' && /(open|show|select|view)\s+(?:the\s+)?note/i.test(query)) {
          if (localResult.actionPayload.data.noteId && onSelectNote) {
            onSelectNote(localResult.actionPayload.data.noteId);
          }
          onNavigate('notes');
        } else if (localResult.actionPayload.type === 'navigate') {
          onNavigate(localResult.actionPayload.data.view);
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteAction = (msgId: string, payload: NonNullable<Message['actionPayload']>) => {
    if (payload.type === 'note') {
      onAddNote({
        title: payload.data.title || 'AI Generated Note',
        content: payload.data.content || '',
        category: payload.data.category || 'Ideas',
      });
      onNavigate('notes');
    } else if (payload.type === 'task') {
      onAddTask({
        title: payload.data.title || 'AI Task',
        priority: payload.data.priority || 'medium',
        dueDate: payload.data.dueDate || 'This Week',
        status: 'todo',
        category: 'Work',
      });
      onNavigate('kanban');
    } else if (payload.type === 'open_note') {
      if (payload.data.noteId && onSelectNote) {
        onSelectNote(payload.data.noteId);
      }
      onNavigate('notes');
    } else if (payload.type === 'navigate') {
      onNavigate(payload.data.view);
    } else if (payload.type === 'update_task_status') {
      if (payload.data.taskId && onUpdateTaskStatus) {
        onUpdateTaskStatus(payload.data.taskId, payload.data.status);
      }
    } else if (payload.type === 'delete_note') {
      if (payload.data.noteId && onDeleteNote) {
        onDeleteNote(payload.data.noteId);
      }
    }
    setExecutedActions((prev) => ({ ...prev, [msgId]: true }));
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <>
      {/* Floating 3D Bot Orb Launcher (Always Accessible Everywhere) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Hover Hint Bubble */}
        {!isOpen && (
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-indigo-500/30 text-xs text-zinc-300 backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            <span>Ask OmniBot</span>
            <kbd className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400 border border-zinc-700">
              ⌘J
            </kbd>
          </div>
        )}

        {/* 3D Holographic Bot Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`relative group w-14 h-14 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 active:scale-95 ${
            isOpen
              ? 'bg-zinc-800 text-white shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-indigo-400'
              : 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-[0_10px_30px_-5px_rgba(99,102,241,0.6)] hover:shadow-[0_15px_35px_rgba(99,102,241,0.8)] border border-white/20'
          }`}
          style={{
            transformStyle: 'preserve-3d',
            perspective: '800px',
          }}
          title="Toggle OmniBot Assistant (⌘J)"
        >
          {/* 3D Orbital Glow Rings */}
          <div
            className={`absolute -inset-2 rounded-3xl bg-indigo-500/20 blur-lg transition-opacity duration-300 pointer-events-none ${
              isHovered || isOpen ? 'opacity-100 animate-pulse' : 'opacity-40'
            }`}
          />

          {/* Gyroscopic 3D Ring Effect */}
          <div className="absolute inset-0 rounded-2xl border border-white/30 pointer-events-none transition-transform duration-700 group-hover:rotate-12 group-hover:scale-105" />

          {/* Center Icon */}
          <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Bot className="w-6 h-6 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] animate-bounce" />
            )}
          </div>

          {/* Active Status Beacon */}
          <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-zinc-950 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        </button>
      </div>

      {/* 3D Glassmorphic AI Assistant Cockpit Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[640px] h-[82vh] z-50 flex flex-col rounded-3xl bg-[#0a0b0f]/95 border border-zinc-700/80 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(99,102,241,0.25)] overflow-hidden specular-card animate-in fade-in slide-in-from-bottom-6 duration-300"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Top Specular Neon Light Bar */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-purple-400" />

          {/* Header */}
          <div className="px-4 py-3.5 border-b border-zinc-800/90 flex items-center justify-between bg-zinc-900/60">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                <Bot className="w-4 h-4 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-zinc-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white tracking-tight">OmniBot</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                    Gemini 3.8
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">
                  {isListening ? '🎙️ Listening to your voice...' : isProcessing ? '⚡ Synthesizing response...' : 'Ready for queries & commands'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSpeechEnabled(!speechEnabled)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  speechEnabled
                    ? 'text-indigo-400 hover:bg-zinc-800'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                }`}
                title={speechEnabled ? 'Mute AI voice output' : 'Enable AI voice output'}
              >
                {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                title="Close OmniBot (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Context Pill */}
          <div className="px-4 py-1.5 bg-zinc-950/60 border-b border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="truncate">
              Context: <strong className="text-zinc-200 capitalize">{currentView}</strong>
              {activeNote ? ` · "${activeNote.title}"` : ''}
            </span>
            <span className="text-[10px] font-mono text-indigo-400 shrink-0">Local + Cloud</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-indigo-300" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-sm transition-all ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-[0_4px_15px_rgba(99,102,241,0.3)]'
                      : 'bg-zinc-900/90 text-zinc-200 border border-zinc-800 rounded-bl-none specular-card'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Action Card Button (e.g. Create Note, Add Task, Open Note) */}
                  {msg.actionPayload && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] min-w-0">
                        {msg.actionPayload.type === 'note' || msg.actionPayload.type === 'open_note' ? (
                          <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        ) : msg.actionPayload.type === 'task' ? (
                          <Kanban className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                        <span className="font-semibold text-zinc-200 truncate">
                          {msg.actionPayload.data.title || msg.actionPayload.data.noteTitle || 'Workspace Action'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {msg.actionPayload.type === 'open_note' && msg.actionPayload.data.summaryText && onUpdateActiveNoteContent && (
                          <button
                            onClick={() => {
                              onUpdateActiveNoteContent(
                                (activeNote?.content || '') +
                                  `\n\n## AI Executive Summary\n${msg.actionPayload!.data.summaryText}`
                              );
                              setExecutedActions((prev) => ({ ...prev, [msg.id + '-insert']: true }));
                            }}
                            disabled={executedActions[msg.id + '-insert']}
                            className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                              executedActions[msg.id + '-insert']
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                            }`}
                          >
                            {executedActions[msg.id + '-insert'] ? 'Inserted' : 'Insert into Note'}
                          </button>
                        )}

                        <button
                          onClick={() => handleExecuteAction(msg.id, msg.actionPayload!)}
                          disabled={executedActions[msg.id]}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer shrink-0 ${
                            executedActions[msg.id]
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                              : 'btn-3d bg-white text-zinc-950 hover:bg-zinc-100'
                          }`}
                        >
                          {executedActions[msg.id] ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Done</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>
                                {msg.actionPayload.type === 'note'
                                  ? 'Save as Note'
                                  : msg.actionPayload.type === 'task'
                                  ? 'Add to Kanban'
                                  : msg.actionPayload.type === 'open_note'
                                  ? 'Open Note'
                                  : msg.actionPayload.type === 'update_task_status'
                                  ? 'Mark Completed'
                                  : 'Execute'}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bottom Message Actions */}
                  {msg.sender === 'bot' && (
                    <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                      <span>{msg.timestamp}</span>
                      <div className="flex items-center gap-1.5">
                        {activeNote && onUpdateActiveNoteContent && (
                          <button
                            onClick={() => {
                              onUpdateActiveNoteContent(
                                (activeNote.content || '') + '\n\n' + msg.text
                              );
                            }}
                            className="hover:text-zinc-200 flex items-center gap-0.5 cursor-pointer"
                            title="Insert into current note"
                          >
                            <Wand2 className="w-2.5 h-2.5" />
                            <span>Insert</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="hover:text-zinc-200 flex items-center gap-0.5 cursor-pointer"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-2.5 h-2.5" />
                          )}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2.5 text-zinc-400 text-xs p-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-spin">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                </div>
                <div className="flex items-center gap-1 font-mono text-[11px] text-indigo-300">
                  <span>OmniBot thinking</span>
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Interactive Siri-grade Suggestion Pills */}
          <div className="px-3 py-2 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              ...(allNotes && allNotes.length > 0 ? ['📋 Summarize note 1', '📂 List my notes'] : []),
              '⚡ Show Kanban tasks',
              '🔥 High priority tasks',
              '✨ Create note on Photosynthesis',
              '📝 Draft project plan note',
            ].map((s, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(s.replace(/^[^a-zA-Z0-9]+/, '').trim())}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-[11px] text-zinc-400 hover:text-zinc-100 transition cursor-pointer shrink-0"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Voice Soundwave Indicator (When Listening) */}
          {isListening && (
            <div className="px-4 py-2 bg-indigo-950/40 border-t border-indigo-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-1 h-3 bg-indigo-400 animate-pulse rounded-full" />
                  <span className="w-1 h-5 bg-purple-400 animate-bounce rounded-full" />
                  <span className="w-1 h-2 bg-indigo-300 animate-pulse rounded-full" />
                  <span className="w-1 h-4 bg-pink-400 animate-bounce rounded-full" />
                </div>
                <span className="text-[11px] text-indigo-300 font-medium">Listening... speak now</span>
              </div>
              <button
                onClick={toggleListening}
                className="text-[10px] text-rose-400 hover:underline cursor-pointer"
              >
                Stop
              </button>
            </div>
          )}

          {/* Input & Voice Controls */}
          <div className="p-3 border-t border-zinc-800/90 bg-zinc-900/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center gap-2"
            >
              {/* Voice Dictation Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse'
                    : 'bg-zinc-800/90 text-zinc-300 hover:text-white hover:bg-zinc-700/80 border border-zinc-700/60'
                }`}
                title={isListening ? 'Stop listening' : 'Dictate with your voice'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input Field */}
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask OmniBot or dictate a task/note..."
                className="flex-1 bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:shadow-[0_0_15px_rgba(99,102,241,0.2)]"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputQuery.trim() || isProcessing}
                className="btn-3d p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition cursor-pointer shrink-0 shadow-md"
                title="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
