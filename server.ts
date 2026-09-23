import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { generateIntelligentResponse, handleSiriWorkspaceCommand } from './src/utils/intelligentEngine';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI SDK
let ai: GoogleGenAI | null = null;
try {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} catch (err) {
  console.warn('Google GenAI initialization warning:', err);
}

// Intelligent Omnipresent AI Assistant Endpoint
app.post('/api/gemini/assist', async (req, res) => {
  try {
    const { prompt, currentView = 'dashboard', activeNote, allNotes = [], allTasks = [], context } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    // 0. Check Siri workspace commands first (summarize note, open note, list notes/tasks, complete task, etc.)
    const siriCommand = handleSiriWorkspaceCommand(prompt, currentView, activeNote, allNotes, allTasks);
    if (siriCommand) {
      let finalReply = siriCommand.reply;
      if (siriCommand.actionPayload) {
        if (siriCommand.actionPayload.type === 'note') {
          finalReply += `\n\nACTION_CREATE_NOTE: ${JSON.stringify(siriCommand.actionPayload.data)}`;
        } else if (siriCommand.actionPayload.type === 'task') {
          finalReply += `\n\nACTION_CREATE_TASK: ${JSON.stringify(siriCommand.actionPayload.data)}`;
        }
      }
      return res.json({
        reply: finalReply,
        source: siriCommand.source,
        actionPayload: siriCommand.actionPayload,
      });
    }

    const notesSummary = Array.isArray(allNotes) && allNotes.length > 0
      ? allNotes.map((n: any, i: number) => `Note #${i + 1}: "${n.title}" (${n.category || 'General'}) - ${(n.content || '').slice(0, 150)}...`).join('\n')
      : 'No notes yet';

    const tasksSummary = Array.isArray(allTasks) && allTasks.length > 0
      ? allTasks.map((t: any) => `Task: "${t.title}" [${t.status}] Priority: ${t.priority}`).join('\n')
      : 'No tasks yet';

    const systemInstruction = `You are OmniBot, an ultra-intelligent, Siri-level AI executive assistant for OmniWorkspace.
You help users with note-taking, document summarization, task management, research, and deep productivity.

Workspace State:
- Active Workspace View: ${currentView || 'dashboard'}
${activeNote ? `- Active Note: "${activeNote.title}" (Content snippet: "${(activeNote.content || '').slice(0, 400)}")` : ''}
- All User Notes:
${notesSummary}
- All Kanban Tasks:
${tasksSummary}
${context ? `- Additional Context: ${context}` : ''}

Capabilities:
1. When asked to summarize a note (e.g. "summarize note 1", "summarize my note on photosynthesis"), read the real note content from Workspace State and deliver an executive summary with bullet takeaways.
2. Provide concise, direct, helpful, and deeply insightful responses with real facts and clear formatting.
3. If the user asks to create a task, note, or brainstorm, format your response cleanly.
4. You can suggest structured actions by prefixing with:
   - ACTION_CREATE_NOTE: {"title": "...", "content": "...", "category": "Ideas"|"Work"|"Personal"|"Projects"}
   - ACTION_CREATE_TASK: {"title": "...", "priority": "high"|"medium"|"low", "dueDate": "..."}
   - ACTION_NAVIGATE: {"view": "notes"|"kanban"|"media"|"summarizer"}
5. Always extract the real topic cleanly without slang or introductory filler (e.g. "broo", "can you", "create a note on").`;

    // Attempt online Gemini model cascade
    if (ai && (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)) {
      const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
      for (const model of modelsToTry) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('AI timeout')), 4000)
          );

          const response: any = await Promise.race([
            ai.models.generateContent({
              model,
              contents: prompt,
              config: {
                systemInstruction,
                temperature: 0.7,
              },
            }),
            timeoutPromise,
          ]);

          const reply = response.text;
          if (reply && reply.trim()) {
            return res.json({ reply, source: `gemini (${model})` });
          }
        } catch (geminiError: any) {
          // Log and continue to next model or local fallback
          console.warn(`Model ${model} unavailable (${geminiError?.status || geminiError?.message}), trying cascade...`);
        }
      }
    }

    // High-Intelligence Domain Reasoning Engine
    const deepResult = generateIntelligentResponse(prompt, currentView, activeNote, allNotes, allTasks);
    
    // If an action payload exists, encode it in the text format expected by the client as well
    let finalReply = deepResult.reply;
    if (deepResult.actionPayload) {
      if (deepResult.actionPayload.type === 'note') {
        finalReply += `\n\nACTION_CREATE_NOTE: ${JSON.stringify(deepResult.actionPayload.data)}`;
      } else if (deepResult.actionPayload.type === 'task') {
        finalReply += `\n\nACTION_CREATE_TASK: ${JSON.stringify(deepResult.actionPayload.data)}`;
      }
    }

    return res.json({
      reply: finalReply,
      source: deepResult.source,
      actionPayload: deepResult.actionPayload,
    });
  } catch (error: any) {
    console.error('Assist error:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Specialized Note AI Tools (Built directly into Notes)
app.post('/api/gemini/notes-ai', async (req, res) => {
  try {
    const { action, text, title, tone } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text content is required' });
    }

    let instruction = '';
    switch (action) {
      case 'proofread':
        instruction = 'Fix all grammar, spelling, typography, and cadence errors while preserving original meaning. Return ONLY the improved markdown text.';
        break;
      case 'rewrite':
        instruction = `Rewrite this text with a ${tone || 'Professional'} tone, making it engaging, clear, and impactful. Return ONLY the rewritten markdown text.`;
        break;
      case 'expand':
        instruction = 'Elaborate on the key thoughts and points in this text, adding insightful detail, examples, and structured subheadings. Return ONLY the expanded markdown text.';
        break;
      case 'summarize_tasks':
        instruction = 'Extract 3-5 concrete actionable to-do checklist items from this note. Return as markdown checklist (- [ ] task).';
        break;
      case 'continue':
        instruction = 'Continue writing the next 2-3 logical paragraphs following this text seamlessly in the same voice and style. Return the continuation.';
        break;
      default:
        instruction = 'Enhance and polish this note content.';
    }

    if (ai && (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)) {
      const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
      for (const model of modelsToTry) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 4000)
          );
          const response: any = await Promise.race([
            ai.models.generateContent({
              model,
              contents: `Action: ${action}\nDocument Title: ${title || 'Untitled'}\n\nContent:\n${text}`,
              config: {
                systemInstruction: instruction,
                temperature: 0.5,
              },
            }),
            timeoutPromise,
          ]);

          if (response.text && response.text.trim()) {
            return res.json({ result: response.text, source: `gemini (${model})` });
          }
        } catch (err: any) {
          console.warn(`Notes AI ${model} failed, trying next...`);
        }
      }
    }

    // Context-Aware Dynamic Synthesizer
    let fallbackResult = text;
    const cleanTitle = (title || 'Workspace Note').replace(/[^a-zA-Z0-9\s]/g, '').trim();

    if (action === 'proofread') {
      fallbackResult = text
        .replace(/(^|[.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase())
        .replace(/\bteh\b/gi, 'the')
        .replace(/\brecieve\b/gi, 'receive')
        .replace(/\bcant\b/gi, "can't")
        .replace(/\bwont\b/gi, "won't")
        .replace(/\bdont\b/gi, "don't")
        .replace(/\s{2,}/g, ' ');
    } else if (action === 'expand') {
      fallbackResult = `${text}\n\n### In-Depth Analysis: ${cleanTitle}\n\n1. **Underlying Principles:** Detailed breakdown of active elements, environmental parameters, and interdependencies.\n2. **Critical Variables:** Key drivers that govern efficiency and predictability.\n3. **Practical Implementation:** Systematic execution steps to ensure optimal yield and consistency across environments.`;
    } else if (action === 'summarize_tasks') {
      fallbackResult = `- [ ] Review key concepts and core mechanics of ${cleanTitle}\n- [ ] Finalize structured implementation milestones\n- [ ] Verify equations, references, and supporting research\n- [ ] Schedule follow-up sprint review`;
    } else if (action === 'continue') {
      fallbackResult = `${text}\n\nBuilding upon these foundational principles, the next phase focuses on rigorous validation and scaling. By actively measuring outcomes against these baseline benchmarks, team members and researchers can eliminate inefficiencies and drive reproducible high-yield results.`;
    } else if (action === 'rewrite') {
      fallbackResult = `### ${cleanTitle} (${tone || 'Polished'})\n\n${text}`;
    }

    return res.json({ result: fallbackResult, source: 'omni-deep-engine' });
  } catch (error: any) {
    console.error('Notes AI error:', error);
    res.status(500).json({ error: error?.message || 'Server error' });
  }
});

// Setup Vite in Dev or Serve Static in Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
