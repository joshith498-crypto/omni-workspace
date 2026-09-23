import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Mic, ArrowRight, CornerDownLeft, X, Sparkles, Command } from 'lucide-react';
import { parseCommandIntent, CommandExecutionResult } from '../utils/aiEngine';
import { ActiveView } from '../types';

interface CommandBarProps {
  onExecute: (result: CommandExecutionResult) => void;
  activeView: ActiveView;
}

export const CommandBar: React.FC<CommandBarProps> = ({ onExecute }) => {
  const [command, setCommand] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [lastResult, setLastResult] = useState<CommandExecutionResult | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const suggestions = [
    'Create note about System Architecture in Work',
    'Add task Deliver sprint release with high priority',
    'Summarize meeting transcripts',
    'Search media for architecture diagram',
    'Go to Kanban task board',
  ];

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
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setCommand(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  // Global hotkey: Cmd+K / Ctrl+K to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setShowSuggestions(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleVoiceToggle = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch {
          recognitionRef.current.stop();
          setTimeout(() => {
            recognitionRef.current.start();
            setIsListening(true);
          }, 150);
        }
      } else {
        setIsListening(true);
        setTimeout(() => {
          setCommand('Create note about Project Roadmap in Work');
          setIsListening(false);
        }, 1200);
      }
    }
  };

  const handleExecute = (cmdText?: string) => {
    const textToRun = cmdText || command;
    if (!textToRun.trim()) return;

    const result = parseCommandIntent(textToRun);
    setLastResult(result);
    onExecute(result);
    setCommand('');
    setShowSuggestions(false);
  };

  return (
    <div className="w-full relative z-20">
      {/* 3D Volumetric Background Aura Glow */}
      <div
        className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-cyan-500/20 to-purple-500/20 blur-xl transition-opacity duration-500 pointer-events-none ${
          isFocused || isListening ? 'opacity-100' : 'opacity-40 hover:opacity-70'
        }`}
      />

      <div
        className={`relative rounded-xl p-1.5 sm:p-2 backdrop-blur-2xl transition-all duration-300 flex items-center gap-2 border ${
          isListening
            ? 'bg-zinc-950/90 border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]'
            : isFocused
            ? 'bg-zinc-900/95 border-indigo-500/70 shadow-[0_0_35px_-5px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.25)]'
            : 'bg-zinc-900/85 border-zinc-800 hover:border-zinc-700/80 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.1)]'
        }`}
      >
        {/* Specular Light Rim */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

        {/* 3D Tactile Terminal Icon */}
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors shadow-inner ${
            isListening
              ? 'bg-rose-950/60 border border-rose-800 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
              : isFocused
              ? 'bg-indigo-950/60 border border-indigo-800/80 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
              : 'bg-zinc-800/90 border border-zinc-700/60 text-zinc-300'
          }`}
        >
          <Terminal className="w-4 h-4" />
        </div>

        {/* Input or Voice indicator */}
        {isListening ? (
          <div className="flex-1 flex items-center gap-3 px-2">
            <span className="text-xs font-semibold text-rose-300 tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping inline-block" />
              Listening to voice input...
            </span>
            <div className="flex items-center gap-1 h-4">
              <span className="w-1 bg-rose-400 rounded-full animate-voice-1" />
              <span className="w-1 bg-rose-400 rounded-full animate-voice-2" />
              <span className="w-1 bg-rose-400 rounded-full animate-voice-3" />
              <span className="w-1 bg-rose-400 rounded-full animate-voice-4" />
              <span className="w-1 bg-rose-400 rounded-full animate-voice-5" />
            </div>
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleExecute();
              if (e.key === 'Escape') setShowSuggestions(false);
            }}
            placeholder="Type a command or natural action (e.g. 'new note about sprint', 'add task', 'find diagrams')..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none px-2 min-w-0"
          />
        )}

        {/* Keyboard Shortcut Badge (Hidden on mobile or while typing) */}
        {!command && !isListening && (
          <div className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-[10px] text-zinc-400 font-mono shadow-sm">
            <span>⌘</span>
            <span>K</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {command && (
            <button
              onClick={() => setCommand('')}
              className="p-1 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-800 transition cursor-pointer"
              title="Clear"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Voice button with 3D glow */}
          <button
            onClick={handleVoiceToggle}
            className={`p-1.5 rounded-lg text-xs transition flex items-center justify-center cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white shadow-[0_0_16px_rgba(244,63,94,0.6)] animate-pulse'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title={isListening ? 'Stop listening' : 'Voice command'}
          >
            <Mic className="w-3.5 h-3.5" />
          </button>

          {/* Execute button with 3D tactile push */}
          <button
            onClick={() => handleExecute()}
            disabled={!command.trim() && !isListening}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition btn-3d ${
              command.trim()
                ? 'bg-gradient-to-b from-white to-zinc-200 text-zinc-950 shadow-[0_4px_16px_rgba(255,255,255,0.15)] cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
            }`}
          >
            <span className="hidden sm:inline">Run</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Autocomplete / Suggested Intents Dropdown */}
      {showSuggestions && !command && (
        <div className="absolute left-0 right-0 mt-2 p-2 bg-zinc-900/95 border border-zinc-700/80 rounded-xl shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 specular-card">
          <div className="px-2.5 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Suggested Actions
            </span>
            <span className="text-[10px] text-zinc-500">Press ESC to dismiss</span>
          </div>

          <div className="mt-1 space-y-0.5">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleExecute(suggestion)}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/90 transition flex items-center justify-between group cursor-pointer"
              >
                <span>{suggestion}</span>
                <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Toast */}
      {lastResult?.responseMessage && (
        <div className="mt-2 px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] animate-in fade-in">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>{lastResult.responseMessage}</span>
        </div>
      )}
    </div>
  );
};
