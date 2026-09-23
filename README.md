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

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/<YOUR_USERNAME>/omni-workspace.git
cd omni-workspace
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Google Gemini API key:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```
*(Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey))*

### 4. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 How to Push to GitHub

If you haven't created a GitHub repository yet:

1. Go to [GitHub](https://github.com/new) and create a new repository (e.g. `omni-workspace`).
2. Run the following commands in your project terminal:

```bash
# Initialize git (if not already initialized)
git init -b main

# Add all files
git add .

# Commit changes
git commit -m "feat: initial commit of OmniWorkspace 3D AI productivity suite"

# Link to your remote GitHub repository
git remote add origin https://github.com/<YOUR_USERNAME>/omni-workspace.git

# Push your code
git push -u origin main
```

---

## 🌐 Deploy to Vercel in 3 Steps

This project is pre-configured with `vercel.json` and a serverless API handler (`api/index.ts`).

### Step 1: Import Project to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Click **"Add New..."** → **"Project"**.
3. Select your newly created GitHub repository (`omni-workspace`).

### Step 2: Configure Build Settings
Vercel will automatically detect the settings:
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Add Environment Variables
In the **Environment Variables** section on Vercel:
- **Key**: `GEMINI_API_KEY`
- **Value**: `your_actual_gemini_api_key`

Click **Deploy**! In less than 60 seconds, your site will be live on your custom `.vercel.app` URL with automated HTTPS and global edge CDN.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion
- **Build Tool**: Vite 8
- **Backend / Serverless**: Express, `@google/genai` (Google Gemini SDK)
- **Deployment**: Vercel (Static SPA + Serverless Functions via `/api`)
- **PWA**: `vite-plugin-pwa`, Service Workers, Web App Manifest
