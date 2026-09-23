import React, { useState } from 'react';
import {
  Copy,
  Check,
  ArrowRight,
  ListTodo,
  FileText,
  RotateCcw,
  CheckSquare,
  Clock,
  Send,
  AlignLeft,
} from 'lucide-react';
import { SummarizerResult, KanbanTask, ActionItem } from '../types';
import { summarizeDocument } from '../utils/aiEngine';

interface SummarizerViewProps {
  onAddTasksToKanban: (tasks: KanbanTask[]) => void;
  onIncrementSummaries: () => void;
  onLogActivity: (type: 'summary', title: string, desc: string) => void;
}

const CLEAN_SAMPLE_TEXT = `Q4 Operational Strategy & Engineering Deliverables:
As modern organizations transition toward distributed cross-platform workstations, unified workspaces must eliminate cognitive friction caused by fragmented desktop tools.

Independent research indicates that knowledge workers lose up to 32% of active focus when switching between disparate note tools, task trackers, and asset repositories.

Immediate operational milestones:
1. Complete local-first database persistence to guarantee offline reliability across mobile and desktop.
2. Deploy semantic retrieval indexing for workspace photos, diagrams, and video files.
3. Establish weekly sprint reviews to audit system performance and memory footprints.
4. Schedule cross-functional stakeholder review for next Tuesday at 10:00 AM.`;

export const SummarizerView: React.FC<SummarizerViewProps> = ({
  onAddTasksToKanban,
  onIncrementSummaries,
  onLogActivity,
}) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SummarizerResult | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [tasksExported, setTasksExported] = useState(false);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  const handleSummarize = () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    setTasksExported(false);

    setTimeout(() => {
      const summary = summarizeDocument(inputText);
      setResult(summary);
      setIsProcessing(false);
      onIncrementSummaries();
      onLogActivity(
        'summary',
        'Document Summarized',
        `Processed ${summary.wordCount} words into executive takeaways & action items`
      );
    }, 450);
  };

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleToggleActionItem = (id: string) => {
    if (!result) return;
    const updated = result.actionItems.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setResult({ ...result, actionItems: updated });
  };

  const handleExportToKanban = () => {
    if (!result) return;
    const pendingItems = result.actionItems.filter((i) => !i.completed);
    if (pendingItems.length === 0) return;

    const newTasks: KanbanTask[] = pendingItems.map((item, idx) => ({
      id: 'task-sum-' + Date.now() + '-' + idx,
      title: item.text,
      description: `Extracted from Document Summarizer on ${new Date().toLocaleDateString()}`,
      status: 'todo',
      priority: idx === 0 ? 'high' : 'medium',
      dueDate: 'This Week',
      category: 'Work',
      createdAt: new Date().toISOString(),
    }));

    onAddTasksToKanban(newTasks);
    setTasksExported(true);
    setTimeout(() => setTasksExported(false), 3500);
  };

  const handleInsertSample = () => {
    setInputText(CLEAN_SAMPLE_TEXT);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white text-glow-sm">
            Document Summarizer Studio
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Extract executive summaries, bullet takeaways, and actionable to-dos from any text.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!inputText && (
            <button
              onClick={handleInsertSample}
              className="text-xs text-zinc-400 hover:text-white border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              Insert sample text
            </button>
          )}

          {inputText && (
            <button
              onClick={() => {
                setInputText('');
                setResult(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white border border-zinc-800 bg-zinc-900/80 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          <button
            onClick={handleSummarize}
            disabled={!inputText.trim() || isProcessing}
            className="btn-3d flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-b from-white to-zinc-200 text-zinc-950 text-xs sm:text-sm font-bold shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <AlignLeft className="w-4 h-4" />
            <span>{isProcessing ? 'Analyzing...' : 'Summarize Text'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Input Left, Results Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Input Textarea */}
        <div className="flex flex-col bg-zinc-900/75 rounded-2xl border border-zinc-800/90 p-4 h-[580px] backdrop-blur-xl specular-card">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80 text-xs text-zinc-400">
            <span className="font-semibold text-zinc-200">Source Document</span>
            <span className="font-mono text-[11px] text-zinc-400">{wordCount} words</span>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste research, meeting minutes, interview transcripts, or articles here..."
            className="flex-1 w-full bg-transparent text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 resize-none outline-none leading-relaxed"
          />

          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span>Supports rich articles &amp; minutes</span>
            <button
              onClick={handleSummarize}
              disabled={!inputText.trim() || isProcessing}
              className="text-xs font-semibold text-zinc-200 hover:text-white inline-flex items-center gap-1 disabled:opacity-40 cursor-pointer"
            >
              <span>Run Synthesis</span>
              <Send className="w-3 h-3 text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Right: Synthesis Results */}
        <div className="flex flex-col bg-zinc-900/60 rounded-xl border border-zinc-800/80 p-4 h-[580px] overflow-y-auto space-y-4">
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-400">
                <AlignLeft className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-zinc-200">No summary generated yet</h3>
                <p className="text-xs text-zinc-500 max-w-sm">
                  Paste or type source content on the left, then click Summarize Text to generate an executive overview, takeaways, and to-do checklist.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Metric bar */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 text-xs">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-mono">{result.readingTime}</span>
                  <span>·</span>
                  <span className="font-mono">{result.wordCount} words analyzed</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-medium">Completed</span>
              </div>

              {/* 1. Executive Summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    1. Executive Summary
                  </h3>
                  <button
                    onClick={() => handleCopy(result.executiveSummary, 'exec')}
                    className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                  >
                    {copiedSection === 'exec' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedSection === 'exec' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-xs sm:text-sm text-zinc-200 leading-relaxed">
                  {result.executiveSummary}
                </div>
              </div>

              {/* 2. Key Takeaways */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    2. Key Takeaways
                  </h3>
                  <button
                    onClick={() => handleCopy(result.keyTakeaways.join('\n• '), 'takeaways')}
                    className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                  >
                    {copiedSection === 'takeaways' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedSection === 'takeaways' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <ul className="space-y-1.5 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-300">
                  {result.keyTakeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-zinc-500 font-mono mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Action Items & To-Dos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    3. Action Items &amp; To-Dos
                  </h3>
                  <button
                    onClick={handleExportToKanban}
                    className="text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded"
                  >
                    <ListTodo className="w-3.5 h-3.5" />
                    <span>{tasksExported ? 'Added to Kanban!' : 'Export to Kanban'}</span>
                  </button>
                </div>

                <div className="space-y-1.5 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  {result.actionItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleActionItem(item.id)}
                      className="flex items-start gap-2 text-xs cursor-pointer group py-1"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => {}}
                        className="mt-0.5 rounded border-zinc-700 bg-zinc-800 text-zinc-300 focus:ring-0 cursor-pointer"
                      />
                      <span
                        className={`leading-relaxed ${
                          item.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
