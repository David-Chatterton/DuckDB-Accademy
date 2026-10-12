import { useEffect, useState } from 'react';
export function useTheme() {
  const [mode, setMode] = useState<'system' | 'light' | 'dark'>(() => { try { const saved = localStorage.getItem('duckdb-academy:theme'); return saved === 'light' || saved === 'dark' ? saved : 'system'; } catch { return 'system'; } });
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const dark = mode === 'dark' || (mode === 'system' && systemDark);
  useEffect(() => { const media = window.matchMedia('(prefers-color-scheme: dark)'); const change = () => setSystemDark(media.matches); media.addEventListener('change', change); return () => media.removeEventListener('change', change); }, []);
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; try { localStorage.setItem('duckdb-academy:theme', mode); } catch { /* Theme still works without storage. */ } }, [mode, dark]);
  return { mode, setMode, dark };
}
