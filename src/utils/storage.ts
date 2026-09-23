import { Note, MediaItem, KanbanTask, ActivityLog, User } from '../types';

const STORAGE_KEYS = {
  USER: 'omni_user_session_v2',
  NOTES: 'omni_notes_v2',
  MEDIA: 'omni_media_v2',
  TASKS: 'omni_tasks_v2',
  ACTIVITY: 'omni_activity_v2',
  SUMMARIES_COUNT: 'omni_summaries_count_v2',
};

export const DEFAULT_USER: User = {
  id: 'user_default',
  name: 'Joshith',
  email: 'joshith498@gmail.com',
  role: 'Personal',
  provider: 'google',
  createdAt: new Date().toISOString(),
};

// Clean, empty initial state curated for the user's personal workflow
export const INITIAL_NOTES: Note[] = [];

export const INITIAL_MEDIA: MediaItem[] = [];

export const INITIAL_TASKS: KanbanTask[] = [];

export const INITIAL_ACTIVITY: ActivityLog[] = [];

/* --- USER SESSION STORAGE --- */
export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to store user session', e);
  }
}

export function clearCurrentUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
  } catch (e) {
    console.error('Failed to clear user session', e);
  }
}

/* --- NOTES STORAGE --- */
export function getStoredNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) return INITIAL_NOTES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_NOTES;
  } catch {
    return INITIAL_NOTES;
  }
}

export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes to localStorage', e);
  }
}

/* --- MEDIA STORAGE --- */
export function getStoredMedia(): MediaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEDIA);
    if (!raw) return INITIAL_MEDIA;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_MEDIA;
  } catch {
    return INITIAL_MEDIA;
  }
}

export function saveMedia(media: MediaItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(media));
  } catch (e) {
    console.error('Failed to save media to localStorage', e);
  }
}

/* --- TASKS STORAGE --- */
export function getStoredTasks(): KanbanTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) return INITIAL_TASKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TASKS;
  } catch {
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: KanbanTask[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage', e);
  }
}

/* --- ACTIVITY STORAGE --- */
export function getStoredActivity(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
    if (!raw) return INITIAL_ACTIVITY;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ACTIVITY;
  } catch {
    return INITIAL_ACTIVITY;
  }
}

export function logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): void {
  try {
    const current = getStoredActivity();
    const newEntry: ActivityLog = {
      ...activity,
      id: 'act-' + Date.now(),
      timestamp: 'Just now',
    };
    const updated = [newEntry, ...current].slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to log activity', e);
  }
}

/* --- SUMMARIES METRIC --- */
export function getSummariesCount(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.SUMMARIES_COUNT);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export function incrementSummariesCount(): number {
  try {
    const current = getSummariesCount() + 1;
    localStorage.setItem(STORAGE_KEYS.SUMMARIES_COUNT, current.toString());
    return current;
  } catch {
    return 1;
  }
}
