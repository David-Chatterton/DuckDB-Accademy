import { useEffect, useRef, useState } from 'react';
import { AcademyDatabase, DatabaseUnavailableError } from '../engine/database';
import type { QueryResult } from '../types';
export function useDatabase() {
  const database = useRef<AcademyDatabase | null>(null);
  const [generation, setGeneration] = useState(0);
  const [state, setState] = useState<{ status: 'loading' | 'ready' | 'error'; error?: string }>({ status: 'loading' });
  useEffect(() => {
    let active = true;
    const instance = new AcademyDatabase(); database.current = instance;
    setState({ status: 'loading' });
    void instance.initialise().then(() => { if (active) setState({ status: 'ready' }); })
      .catch(error => { if (active) setState({ status: 'error', error: String(error) }); });
    return () => { active = false; if (database.current === instance) database.current = null; void instance.dispose(); };
  }, [generation]);
  const query = async (sql: string): Promise<QueryResult> => {
    const instance = database.current;
    if (state.status !== 'ready' || !instance) throw new Error('Wait for the database to finish loading.');
    try { return await instance.query(sql); }
    catch (error) {
      if (error instanceof DatabaseUnavailableError && database.current === instance) setState({ status: 'error', error: error.message });
      throw error;
    }
  };
  return { ...state, generation, query, reset: () => { setState({ status: 'loading' }); setGeneration(g => g + 1); } };
}
