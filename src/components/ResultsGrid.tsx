import { useEffect, useState } from 'react';
import type { QueryResult, Cell } from '../types';
export function displayCell(value: Cell): string { return value === null ? 'NULL' : String(value); }
export function ResultsGrid({ result }: { result: QueryResult | null }) {
  const [page, setPage] = useState(0);
  useEffect(() => setPage(0), [result]);
  if (!result) return <div className="empty-result"><span className="table-glyph">▦</span><strong>Your data will appear here</strong><p>Run a query to see real DuckDB results.</p></div>;
  const size = 50, pages = Math.max(1, Math.ceil(result.rows.length / size));
  const active = Math.min(page, pages - 1);
  return <section aria-label="Query results">
    <div className="result-meta"><strong>{result.rows.length.toLocaleString('en-GB')} rows</strong><span>{result.columns.length} columns · {Math.round(result.elapsedMs)} ms</span></div>
    <div className="grid-scroll" tabIndex={0} role="region" aria-label="Scrollable query result table"><table><thead><tr>{result.columns.map((col, i) => <th key={i} scope="col">{col.name}<small>{col.type}</small></th>)}</tr></thead>
      <tbody>{result.rows.slice(active * size, (active + 1) * size).map((row, i) => <tr key={i}>{row.map((value, j) => <td className={`${result.columns[j].numeric ? 'numeric' : ''} ${value === null ? 'null-value' : ''}`} key={j}>{displayCell(value)}</td>)}</tr>)}</tbody>
    </table>{result.rows.length === 0 && <p className="empty-note">The query ran successfully and matched no rows.</p>}</div>
    <div className="pagination"><span>{result.rows.length ? `${active * size + 1}–${Math.min((active + 1) * size, result.rows.length)} of ${result.rows.length.toLocaleString('en-GB')}` : '0 rows'}</span><div><button disabled={active === 0} onClick={() => setPage(active - 1)}>Previous page</button><span>{active + 1} / {pages}</span><button disabled={active + 1 >= pages} onClick={() => setPage(active + 1)}>Next page</button></div></div>
  </section>;
}
