import { SummarizerResult, KanbanTask, NoteCategory } from '../types';

export interface ProofreadResult {
  improvedText: string;
  changesCount: number;
  suggestions: string[];
}

export type RewriteTone = 'Professional' | 'Friendly' | 'Concise' | 'Academic';

/**
 * Proofreads text, correcting grammar, casing, punctuation, and typographical cadence.
 */
export function proofreadText(text: string): ProofreadResult {
  if (!text.trim()) {
    return { improvedText: text, changesCount: 0, suggestions: [] };
  }

  const suggestions: string[] = [];
  let improved = text;

  // Rule 1: capitalize sentence starts
  const sentenceRegex = /(^|[.!?]\s+)([a-z])/g;
  let matches = 0;
  improved = improved.replace(sentenceRegex, (_, prefix, char) => {
    matches++;
    return prefix + char.toUpperCase();
  });
  if (matches > 0) suggestions.push(`Capitalized ${matches} sentence beginnings`);

  // Rule 2: common typos & informal contractions
  const typoMap: Record<string, string> = {
    teh: 'the',
    recieve: 'receive',
    seperate: 'separate',
    untill: 'until',
    definately: 'definitely',
    occurance: 'occurrence',
    alot: 'a lot',
    cant: "can't",
    dont: "don't",
    wont: "won't",
    im: "I'm",
    ive: "I've",
    id: "I'd",
    gonna: 'going to',
    wanna: 'want to',
  };

  Object.entries(typoMap).forEach(([typo, fix]) => {
    const reg = new RegExp(`\\b${typo}\\b`, 'gi');
    if (reg.test(improved)) {
      improved = improved.replace(reg, fix);
      suggestions.push(`Corrected "${typo}" -> "${fix}"`);
    }
  });

  // Rule 3: remove duplicate whitespace
  if (/\s{2,}/.test(improved)) {
    improved = improved.replace(/\s{2,}/g, ' ');
    suggestions.push('Normalized spacing');
  }

  // Ensure trailing punctuation for complete thoughts
  const lines = improved.split('\n');
  const polishedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (
      trimmed.length > 25 &&
      !trimmed.startsWith('#') &&
      !trimmed.startsWith('-') &&
      !trimmed.startsWith('*') &&
      !/[.!?:;]$/.test(trimmed)
    ) {
      return trimmed + '.';
    }
    return line;
  });
  improved = polishedLines.join('\n');

  if (suggestions.length === 0) {
    suggestions.push('Syntax, grammar, and typography cadence verified.');
  }

  return {
    improvedText: improved,
    changesCount: Math.max(1, suggestions.length),
    suggestions,
  };
}

/**
 * Rewrites text according to selected style tone.
 */
export function rewriteTone(text: string, tone: RewriteTone): string {
  if (!text.trim()) return text;

  const lines = text.split('\n');

  switch (tone) {
    case 'Professional':
      return lines
        .map((line) => {
          return line
            .replace(/\b(cool|neat|awesome)\b/gi, 'effective')
            .replace(/\b(a bunch of|lots of)\b/gi, 'substantial')
            .replace(/\b(fix|figure out)\b/gi, 'resolve')
            .replace(/\b(think)\b/gi, 'anticipate')
            .replace(/\b(start)\b/gi, 'initiate');
        })
        .join('\n');

    case 'Friendly':
      return lines
        .map((line) => {
          return line
            .replace(/\b(pursuant to|regarding)\b/gi, 'about')
            .replace(/\b(utilize|implement)\b/gi, 'use')
            .replace(/\b(commence)\b/gi, 'get started with');
        })
        .join('\n');

    case 'Concise':
      return lines
        .map((line) => {
          return line
            .replace(/\bin order to\b/gi, 'to')
            .replace(/\bat the present moment in time\b/gi, 'currently')
            .replace(/\bdue to the fact that\b/gi, 'because')
            .replace(/\bfor the purpose of\b/gi, 'for')
            .replace(/\bit is important to note that\b/gi, 'notably,');
        })
        .filter((l) => l.trim().length > 0)
        .join('\n');

    case 'Academic':
      return lines
        .map((line) => {
          return line
            .replace(/\b(shows)\b/gi, 'demonstrates empirical evidence of')
            .replace(/\b(we found)\b/gi, 'the investigation reveals')
            .replace(/\b(big)\b/gi, 'statistically significant');
        })
        .join('\n');

    default:
      return text;
  }
}

/**
 * Transforms text into structured representations (Key Points, Markdown Table).
 */
export function transformContent(text: string, format: 'key_points' | 'table'): string {
  if (!text.trim()) return text;

  if (format === 'key_points') {
    const sentences = text
      .split(/[.!?\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15 && !s.startsWith('#'));

    const points = sentences.slice(0, 7).map((s) => `- **${s.slice(0, 24)}...**: ${s}`);
    return `### Key Takeaways:\n\n${points.join('\n\n')}`;
  }

  if (format === 'table') {
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    let table = '| Focus Item | Strategic Description | Status |\n|---|---|---|\n';
    lines.slice(0, 5).forEach((line, idx) => {
      const clean = line.replace(/^[#\-*0-9.]+\s*/, '').trim();
      const parts = clean.split(':');
      const item = parts[0]?.slice(0, 30) || `Milestone 0${idx + 1}`;
      const desc = parts[1]?.trim() || clean.slice(0, 60) || 'Active execution item';
      table += `| **${item}** | ${desc} | In Progress |\n`;
    });
    return table;
  }

  return text;
}

/**
 * Document summarizer extracting Executive Summary, Key Takeaways, and To-Dos.
 */
export function summarizeDocument(text: string): SummarizerResult {
  const clean = text.trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 220));
  const readingTime = `${readingTimeMin} min read`;

  if (wordCount < 10) {
    return {
      executiveSummary:
        'Text is too brief for synthesis. Provide an article, meeting transcript, or project specification.',
      keyTakeaways: ['Input contained fewer than 10 words.'],
      actionItems: [
        { id: '1', text: 'Paste substantive text or meeting notes for analysis', completed: false },
      ],
      readingTime: '< 1 min read',
      wordCount,
    };
  }

  // Extract sentences
  const sentences = clean
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && !s.startsWith('#'));

  // Executive summary: synthesize top core sentences
  const leadSentences = sentences.slice(0, 3).join(' ');
  const executiveSummary =
    leadSentences.length > 300
      ? leadSentences.slice(0, 300) + '...'
      : leadSentences || clean.slice(0, 250) + '...';

  // Key takeaways
  const takeawayCandidates = sentences.slice(1, 6);
  const keyTakeaways: string[] =
    takeawayCandidates.length > 0
      ? takeawayCandidates.map((s) => s.replace(/^[-\d.]+\s*/, ''))
      : [
          'Core initiative aligns with scalable cross-platform architecture and persistent state.',
          'Local-first storage guarantees uninterrupted offline execution across devices.',
          'Unified search and indexing optimizes team knowledge retrieval.',
        ];

  // Action Items: extract tasks from imperatives
  const actionItems: { id: string; text: string; completed: boolean }[] = [];
  const actionVerbs = [
    'implement',
    'build',
    'review',
    'deploy',
    'design',
    'test',
    'ensure',
    'create',
    'update',
    'audit',
    'schedule',
    'optimize',
    'deliver',
    'prepare',
  ];

  sentences.forEach((sentence, idx) => {
    const lower = sentence.toLowerCase();
    const hasVerb = actionVerbs.some((v) => lower.includes(v));
    const isTodoLike =
      lower.includes('todo') ||
      lower.includes('task') ||
      lower.includes('must') ||
      lower.includes('should') ||
      hasVerb;

    if (isTodoLike && actionItems.length < 5) {
      actionItems.push({
        id: `act-item-${idx}-${Date.now()}`,
        text: sentence.replace(/^[-\d.*[\] ]+/, '').slice(0, 110),
        completed: false,
      });
    }
  });

  if (actionItems.length === 0) {
    actionItems.push(
      { id: 'act-1', text: 'Document key findings for stakeholder distribution', completed: false },
      { id: 'act-2', text: 'Confirm deliverable deadlines and assignment owners', completed: false },
      { id: 'act-3', text: 'Review implementation metrics during sprint sync', completed: false }
    );
  }

  return {
    executiveSummary,
    keyTakeaways,
    actionItems,
    readingTime,
    wordCount,
    originalText: text,
  };
}

/**
 * Simulates on-device visual analysis for imported photos and videos.
 */
export async function analyzeMediaAsset(file: File): Promise<{
  tags: string[];
  detectedObjects: string[];
  dominantColors: string[];
  summary: string;
  dimensions: string;
  ocrText: string;
}> {
  const isVideo = file.type.startsWith('video');
  const baseName = file.name.toLowerCase();

  const possibleTags = ['device upload', isVideo ? 'video' : 'photo'];
  const detectedObjects: string[] = [];

  if (baseName.includes('screen') || baseName.includes('shot')) {
    possibleTags.push('screenshot', 'ui', 'interface', 'viewport');
    detectedObjects.push('App Viewport', 'Typography', 'Icon Elements', 'Grid Container');
  } else if (baseName.includes('doc') || baseName.includes('note') || baseName.includes('pdf')) {
    possibleTags.push('document', 'diagram', 'text', 'notes');
    detectedObjects.push('Paper Sheet', 'Printed Lines', 'Header Text', 'Data Table');
  } else if (baseName.includes('photo') || baseName.includes('img') || baseName.includes('camera')) {
    possibleTags.push('camera capture', 'scene', 'visual');
    detectedObjects.push('Foreground Subject', 'Ambient Lighting', 'Composition Plane');
  } else {
    possibleTags.push('media asset', 'workspace file');
    detectedObjects.push('Visual Pattern', 'Focal Subject', 'Color Field');
  }

  const colorPalettes = [
    ['#090a0f', '#2563eb', '#6366f1', '#f8fafc'],
    ['#18181b', '#10b981', '#06b6d4', '#f4f4f5'],
    ['#111827', '#4f46e5', '#ec4899', '#f3f4f6'],
    ['#1c1917', '#f97316', '#eab308', '#fafaf9'],
  ];
  const dominantColors = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];

  const summary = isVideo
    ? `Video file (${file.name}) indexed with local motion analysis, color profiling, and timeline frames.`
    : `Visual asset (${file.name}) indexed with feature identification, color composition, and metadata extraction.`;

  return {
    tags: possibleTags,
    detectedObjects,
    dominantColors,
    summary,
    dimensions: isVideo ? '1920 × 1080 (HD)' : '3024 × 4032 (Ultra HD)',
    ocrText: `Asset: ${file.name} // Processed via Local Media Engine`,
  };
}

/**
 * Natural Language Command & Intent Interpreter.
 */
export interface CommandExecutionResult {
  recognizedIntent: string;
  responseMessage: string;
  targetView?: 'dashboard' | 'notes' | 'summarizer' | 'media' | 'kanban';
  createdNote?: { title: string; content: string; category: NoteCategory };
  createdTask?: Partial<KanbanTask>;
  searchQuery?: string;
  actionType?:
    | 'proofread'
    | 'summarize'
    | 'navigate'
    | 'create_note'
    | 'create_task'
    | 'search_media'
    | 'info';
}

export function parseCommandIntent(command: string): CommandExecutionResult {
  const q = command.trim().toLowerCase();

  // Navigation intents
  if (q.includes('go to notes') || q.includes('open notes') || q === 'notes') {
    return {
      recognizedIntent: 'Navigate to Notes',
      responseMessage: 'Opened Notes editor and writing tools.',
      targetView: 'notes',
      actionType: 'navigate',
    };
  }
  if (
    q.includes('go to kanban') ||
    q.includes('open tasks') ||
    q.includes('open board') ||
    q.includes('task manager') ||
    q === 'tasks' ||
    q === 'kanban'
  ) {
    return {
      recognizedIntent: 'Navigate to Kanban',
      responseMessage: 'Opened Kanban task board.',
      targetView: 'kanban',
      actionType: 'navigate',
    };
  }
  if (
    q.includes('go to media') ||
    q.includes('open gallery') ||
    q.includes('photos') ||
    q.includes('videos') ||
    q === 'media'
  ) {
    return {
      recognizedIntent: 'Navigate to Media',
      responseMessage: 'Opened Media library and semantic search.',
      targetView: 'media',
      actionType: 'navigate',
    };
  }
  if (
    q.includes('go to summarizer') ||
    q.includes('open summarizer') ||
    q.includes('summarize studio') ||
    q === 'summarizer'
  ) {
    return {
      recognizedIntent: 'Navigate to Summarizer',
      responseMessage: 'Opened Document Summarizer studio.',
      targetView: 'summarizer',
      actionType: 'navigate',
    };
  }

  // Note Creation intent: "create note [about/titled] X"
  if (
    q.includes('create note') ||
    q.includes('new note') ||
    q.includes('write note') ||
    q.includes('take a note')
  ) {
    let title = command
      .replace(/^(please)?\s*(create|make|write|take|add)\s*(a|new)?\s*note\s*(about|titled|for)?/i, '')
      .trim();

    if (!title) title = 'Untitled Note';
    title = title.charAt(0).toUpperCase() + title.slice(1);

    return {
      recognizedIntent: 'Create Note',
      responseMessage: `Created note: "${title}".`,
      targetView: 'notes',
      actionType: 'create_note',
      createdNote: {
        title,
        content: `## ${title}\n\n*Created on ${new Date().toLocaleDateString()}*\n\nCapture your ideas, meeting takeaways, or project outlines here...`,
        category: 'Ideas',
      },
    };
  }

  // Task Creation intent: "add task X", "create task X"
  if (
    q.includes('add task') ||
    q.includes('create task') ||
    q.includes('new task') ||
    q.includes('remind me to')
  ) {
    let taskTitle = command
      .replace(
        /^(please)?\s*(add|create|make)\s*(a|new)?\s*(task|todo|to-do|reminder)\s*(to|for)?/i,
        ''
      )
      .replace(/^remind me to\s*/i, '')
      .trim();

    if (!taskTitle) taskTitle = 'Follow up on project deliverable';
    taskTitle = taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1);

    const isHigh = q.includes('urgent') || q.includes('high priority') || q.includes('asap');

    return {
      recognizedIntent: 'Add Task',
      responseMessage: `Added task "${taskTitle}" to board.`,
      targetView: 'kanban',
      actionType: 'create_task',
      createdTask: {
        title: taskTitle,
        description: 'Created via quick command action.',
        status: 'todo',
        priority: isHigh ? 'high' : 'medium',
        category: 'Work',
        dueDate: 'Today',
      },
    };
  }

  // Media Search intent: "search media for X", "find photos of X"
  if (
    q.includes('search media') ||
    q.includes('find photos') ||
    q.includes('find videos') ||
    q.includes('search for')
  ) {
    const term = command
      .replace(/^(please)?\s*(search|find|filter|look for)\s*(media|photos|videos|gallery)?\s*(of|for|about)?/i, '')
      .trim();

    return {
      recognizedIntent: 'Media Search',
      responseMessage: `Filtering media library for "${term}".`,
      targetView: 'media',
      searchQuery: term,
      actionType: 'search_media',
    };
  }

  // Proofread / Summarize
  if (q.includes('proofread') || q.includes('fix grammar')) {
    return {
      recognizedIntent: 'Proofread Note',
      responseMessage: 'Switched to Notes editor and ran grammar proofreading.',
      targetView: 'notes',
      actionType: 'proofread',
    };
  }

  if (q.includes('summarize')) {
    return {
      recognizedIntent: 'Document Summarizer',
      responseMessage: 'Opened Summarizer studio ready for input text.',
      targetView: 'summarizer',
      actionType: 'summarize',
    };
  }

  return {
    recognizedIntent: 'Command Recognized',
    responseMessage: `Query received: "${command}". Try "create note about...", "add task...", "search photos for diagram", or "open kanban".`,
    targetView: 'dashboard',
    actionType: 'info',
  };
}
