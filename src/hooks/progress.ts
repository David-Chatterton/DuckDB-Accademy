import type { Progress } from '../types';
import { lessons } from '../content/lessons';
export const PROGRESS_KEY = 'duckdb-academy:progress:v1';
export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
export const emptyProgress = (): Progress => ({ version: 1, current: lessons[0].id, completed: {} });
export function readProgress(storage: StoragePort): Progress {
  try {
    const raw: unknown = JSON.parse(storage.getItem(PROGRESS_KEY) ?? 'null');
    if (!raw || typeof raw !== 'object' || !('version' in raw) || raw.version !== 1 || !('current' in raw) || !('completed' in raw)) return emptyProgress();
    const completed: Record<string, string> = {};
    if (raw.completed && typeof raw.completed === 'object') {
      for (const [id, value] of Object.entries(raw.completed)) if (lessons.some(l => l.id === id) && typeof value === 'string' && !Number.isNaN(Date.parse(value))) completed[id] = value;
    }
    return { version: 1, current: lessons.some(l => l.id === raw.current) ? String(raw.current) : lessons[0].id, completed };
  } catch { return emptyProgress(); }
}
export function saveProgress(storage: StoragePort, progress: Progress): boolean {
  try { storage.setItem(PROGRESS_KEY, JSON.stringify(progress)); return true; } catch { return false; }
}
export function completeLesson(progress: Progress, id: string, now = new Date().toISOString()): Progress {
  if (!lessons.some(l => l.id === id)) return progress;
  return { ...progress, completed: { ...progress.completed, [id]: now } };
}
export function clearProgress(storage: StoragePort): boolean {
  try { storage.removeItem(PROGRESS_KEY); return true; } catch { return false; }
}
export function recommendedLesson(progress: Progress): string { return lessons.find(l => !progress.completed[l.id])?.id ?? lessons[0].id; }
