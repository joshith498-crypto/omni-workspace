# OmniWorkspace - 3D AI-Powered Productivity Suite

OmniWorkspace is a modern, high-performance, full-featured personal productivity suite featuring a Siri-style 3D omnipresent AI assistant (**OmniBot**), rich Markdown notes with inline AI copilot actions, an interactive Kanban board, media asset organizer, text summarizer, and full Progressive Web App (PWA) offline capabilities.

---

## 🌟 Key Features

- 🤖 **OmniBot (Siri-Style AI Assistant)**
  - Natural language voice dictation and spoken audio responses (via Web Speech API & SpeechSynthesis).
  - Siri-grade commands: *"summarize note 1"*, *"open note 2"*, *"list my notes"*, *"show Kanban tasks"*, *"mark task X as completed"*.
  - Direct workspace action dispatching (one-click "Save as Note", "Add to Kanban", "Insert into Note").
  - Instant local reasoning engine fallback + Google Gemini API.

- 📝 **Intelligent Notes & Document Editor**
  - Markdown editor with live preview, category tagging, search, and export (Markdown / JSON).
  - Built-in AI Writing Copilot (Proofread, Expand, Extract Tasks Checklist, Continue Writing, Tone Rewrite).

- ⚡ **Interactive Kanban Board**
  - Drag-and-drop task workflow (To Do, In Progress, Done).
  - Priority badges, deadlines, categories, and AI task generation.

- 🎨 **Media & Asset Gallery**
  - Visual asset collection with tag filters and preview modal.

- 📱 **Progressive Web App (PWA) & Offline Ready**
  - Installable on desktop & mobile with service worker caching and offline fallback.

---
                Web App Link : https://omni-workspace-pi.vercel.app/
## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion
- **Build Tool**: Vite 8
- **Backend / Serverless**: Express, `@google/genai` (Google Gemini SDK)
- **Deployment**: Vercel (Static SPA + Serverless Functions via `/api`)
- **PWA**: `vite-plugin-pwa`, Service Workers, Web App Manifest
