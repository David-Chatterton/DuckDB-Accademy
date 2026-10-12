import { describe, expect, it } from 'vitest';
import { clearProgress, completeLesson, emptyProgress, PROGRESS_KEY, readProgress, recommendedLesson, saveProgress, type StoragePort } from '../src/hooks/progress';
function storage(): StoragePort & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: key => data.get(key) ?? null, setItem: (key, value) => { data.set(key, value); }, removeItem: key => { data.delete(key); } };
}
describe('learning progress', () => {
  it('persists completion separately from database state', () => {
    const store = storage(), progress = completeLesson(emptyProgress(), 'm1-1', '2026-01-01T00:00:00Z');
    expect(saveProgress(store, progress)).toBe(true);
    expect(readProgress(store)).toEqual(progress);
    expect(recommendedLesson(progress)).toBe('m1-2');
  });
  it('recovers from invalid data and storage failures', () => {
    const store = storage(); store.setItem(PROGRESS_KEY, '{broken'); expect(readProgress(store)).toEqual(emptyProgress());
    store.setItem(PROGRESS_KEY, JSON.stringify({ version: 1, current: 'unknown', completed: { 'm1-1': 'not a date', unrelated: '2026-01-01' } }));
    expect(readProgress(store)).toEqual(emptyProgress());
    const broken: StoragePort = { getItem: () => { throw new Error('Unavailable'); }, setItem: () => { throw new Error('Full'); }, removeItem: () => { throw new Error('Unavailable'); } };
    expect(readProgress(broken)).toEqual(emptyProgress()); expect(saveProgress(broken, emptyProgress())).toBe(false);
  });
  it('resets only academy progress and ignores unknown lesson completions', () => {
    const store = storage(); store.setItem('unrelated-app', 'keep'); saveProgress(store, completeLesson(emptyProgress(), 'm1-1'));
    expect(clearProgress(store)).toBe(true); expect(store.getItem('unrelated-app')).toBe('keep');
    expect(readProgress(store)).toEqual(emptyProgress()); expect(completeLesson(emptyProgress(), 'unknown')).toEqual(emptyProgress());
  });
});
