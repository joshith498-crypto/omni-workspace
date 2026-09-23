export type NoteCategory = 'Work' | 'School' | 'Personal' | 'Ideas';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  workspaceName?: string;
  avatar?: string;
  provider?: 'google' | 'email';
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  updatedAt: string;
  pinned?: boolean;
  tags: string[];
}

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  tags: string[];
  detectedObjects: string[];
  dominantColors: string[];
  summary: string;
  fileSize: string;
  dimensions?: string;
  duration?: string;
  ocrText?: string;
  createdAt: string;
  favorite?: boolean;
  isUserUploaded?: boolean;
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  category: string;
  createdAt: string;
}

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface SummarizerResult {
  executiveSummary: string;
  keyTakeaways: string[];
  actionItems: ActionItem[];
  readingTime: string;
  wordCount: number;
  originalText?: string;
}

export interface ActivityLog {
  id: string;
  type: 'note' | 'media' | 'summary' | 'task' | 'command';
  title: string;
  description: string;
  timestamp: string;
}

export type ActiveView = 'dashboard' | 'notes' | 'summarizer' | 'media' | 'kanban';

