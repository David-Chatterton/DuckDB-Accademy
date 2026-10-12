import { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/sql/sql.contribution';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
const environment = { getWorker: () => new EditorWorker() };
Object.assign(globalThis, { MonacoEnvironment: environment });
interface Props { value: string; onChange(value: string): void; onRun(): void; dark: boolean }
export function SqlEditor({ value, onChange, onRun, dark }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const change = useRef(onChange), run = useRef(onRun);
  change.current = onChange; run.current = onRun;
  const [plain, setPlain] = useState(false);
  useEffect(() => {
    if (plain || !host.current) return;
    const instance = monaco.editor.create(host.current, {
      value: '', language: 'sql', automaticLayout: true,
      minimap: { enabled: false }, fontSize: 14, lineNumbersMinChars: 3,
      scrollBeyondLastLine: false, tabSize: 2, wordWrap: 'on',
      ariaLabel: 'SQL query editor', accessibilitySupport: 'auto',
      theme: 'vs-dark', padding: { top: 16, bottom: 12 },
    });
    editor.current = instance;
    instance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => run.current());
    const subscription = instance.onDidChangeModelContent(() => change.current(instance.getValue()));
    return () => { subscription.dispose(); const model = instance.getModel(); instance.dispose(); model?.dispose(); editor.current = null; };
  }, [plain]);
  useEffect(() => { if (editor.current && editor.current.getValue() !== value) editor.current.setValue(value); }, [value, plain]);
  useEffect(() => { monaco.editor.setTheme(dark ? 'vs-dark' : 'vs'); }, [dark, plain]);
  return <div className="editor-shell">
    <div className="editor-label"><span>query.sql <span className="muted">· DuckDB SQL</span></span><button onClick={() => setPlain(p => !p)}>{plain ? 'Use Monaco editor' : 'Use plain text editor'}</button></div>
    {plain ? <textarea className="plain-editor" aria-label="SQL query editor" value={value} spellCheck={false} onChange={e => onChange(e.target.value)} onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); onRun(); } }} /> : <div ref={host} className="monaco-host" />}
  </div>;
}
