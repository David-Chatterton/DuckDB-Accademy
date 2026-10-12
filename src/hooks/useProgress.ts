import { useState } from 'react';
import type { Progress } from '../types';
import { readProgress, saveProgress, emptyProgress, completeLesson, clearProgress } from './progress';
export function useProgress() {
  const [progress, setProgress] = useState(() => { try { return readProgress(localStorage); } catch { return emptyProgress(); } });
  const [persisted, setPersisted] = useState(true);
  const update = (change: (previous: Progress) => Progress) => {
    setProgress(previous => {
      const next = change(previous);
      try { setPersisted(saveProgress(localStorage, next)); } catch { setPersisted(false); }
      return next;
    });
  };
  return { progress, persisted,
    select: (id: string) => update(previous => ({ ...previous, current: id })),
    complete: (id: string) => update(previous => completeLesson(previous, id)),
    retry: (id: string) => update(previous => { const completed = { ...previous.completed }; delete completed[id]; return { ...previous, completed }; }),
    reset: () => { try { setPersisted(clearProgress(localStorage)); } catch { setPersisted(false); } setProgress(emptyProgress()); },
  };
}
