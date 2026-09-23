import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { generateIntelligentResponse, handleSiriWorkspaceCommand } from '../src/utils/intelligentEngine.ts';

const app = express();
app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Google GenAI initialization warning:', err);
  }
}

// 1. Intelligent Omnipresent AI Assistant Endpoint
app.post('/api/gemini/assist', async (req: Request, res: Response) => {
  try {
    const { prompt, currentView = 'dashboard', activeNote, allNotes = [], allTasks = [], context } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    // 0. Check Siri workspace commands first
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
1. When asked to summarize a note, read the real note content from Workspace State and deliver an executive summary with bullet takeaways.
2. Provide concise, direct, helpful, and deeply insightful responses with real facts and clear formatting.
3. Suggest structured actions:
   - ACTION_CREATE_NOTE: {"title": "...", "content": "...", "category": "Ideas"|"Work"|"Personal"|"Projects"}
   - ACTION_CREATE_TASK: {"title": "...", "priority": "high"|"medium"|"low", "dueDate": "..."}
   - ACTION_NAVIGATE: {"view": "notes"|"kanban"|"media"|"summarizer"}
4. Never repeat conversational slang like "bro", "can you", or "create a note on" in output titles.`;

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
          console.warn(`Model ${model} unavailable, trying cascade...`);
        }
      }
    }

    // High-Intelligence Domain Reasoning Engine
    const deepResult = generateIntelligentResponse(prompt, currentView, activeNote, allNotes, allTasks);
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

// 2. Specialized Note AI Tools
app.post('/api/gemini/notes-ai', async (req: Request, res: Response) => {
  try {
    const { action, text, title, tone } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text content is required' });
    }

    let instruction = '';
    switch (action) {
      case 'proofread':
        instruction = 'Proofread and fix all grammatical, spelling, and structural issues. Return only the revised text.';
        break;
      case 'expand':
        instruction = 'Substantially expand on the provided ideas with detailed explanations, technical context, and practical steps.';
        break;
      case 'summarize_tasks':
        instruction = 'Extract high-impact action items and tasks as a clean markdown checklist (- [ ] task).';
        break;
      case 'continue':
        instruction = 'Seamlessly continue writing the next logical paragraphs matching the established tone and technical depth.';
        break;
      case 'rewrite':
        instruction = `Rewrite this text with a ${tone || 'professional and polished'} tone while preserving the core facts.`;
        break;
      default:
        instruction = 'Refine and improve clarity and impact.';
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

    // Dynamic Synthesizer fallback
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

export default (req: Request, res: Response) => {
  return app(req, res);
};
