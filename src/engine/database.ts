import * as duckdb from '@duckdb/duckdb-wasm';
import mvpWasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import ehWasm from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import mvpWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import ehWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import { seedStatements } from '../data/finance';
import type { QueryResult } from '../types';
import { decodeTable } from './results';
import { assertReadOnly } from './sql';
export class DatabaseUnavailableError extends Error {}
export class AcademyDatabase {
  private db: duckdb.AsyncDuckDB | null = null;
  private connection: duckdb.AsyncDuckDBConnection | null = null;
  private worker: Worker | null = null;
  private busy = false;
  private initialising = false;
  private stopped = false;
  private cancel: ((error: Error) => void) | null = null;
  private async bounded<T>(operation: Promise<T>, milliseconds: number, message: string): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cancelled = new Promise<never>((_, reject) => {
      this.cancel = reject;
      timer = setTimeout(() => {
        this.stopped = true;
        // Worker termination is immediate even if DuckDB is in a long-running query.
        this.worker?.terminate();
        reject(new DatabaseUnavailableError(message));
      }, milliseconds);
    });
    try { return await Promise.race([operation, cancelled]); }
    finally { clearTimeout(timer); this.cancel = null; }
  }
  async initialise(): Promise<void> {
    this.initialising = true;
    try { await this.bounded(this.seed(), 60000, 'Database preparation timed out. Retry the database.'); }
    catch (error) { await this.dispose(); throw error; }
    finally { this.initialising = false; }
  }
  private async seed(): Promise<void> {
    const bundle = await duckdb.selectBundle({
      mvp: { mainModule: mvpWasm, mainWorker: mvpWorker },
      eh: { mainModule: ehWasm, mainWorker: ehWorker },
    });
    if (this.stopped) throw new DatabaseUnavailableError('Database preparation was cancelled.');
    if (!bundle.mainWorker) throw new Error('This browser cannot start the DuckDB worker.');
    this.worker = new Worker(bundle.mainWorker);
    this.db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING), this.worker);
    await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    await this.db.open({ query: { castBigIntToDouble: false, castDecimalToDouble: false } });
    this.connection = await this.db.connect();
    await this.connection.query('BEGIN TRANSACTION');
    try {
      for (const sql of seedStatements()) await this.connection.query(sql);
      await this.connection.query('COMMIT');
    } catch (error) { await this.connection.query('ROLLBACK'); throw error; }
    await this.connection.query("SET memory_limit = '128MB'; SET enable_external_access = false; SET lock_configuration = true;");
  }
  async query(sql: string): Promise<QueryResult> {
    assertReadOnly(sql);
    const connection = this.connection;
    if (!connection || this.stopped) throw new DatabaseUnavailableError('The training database is not ready. Retry initialisation.');
    if (this.busy) throw new Error('A query is already running. Wait for its result.');
    this.busy = true;
    try { return await this.bounded(this.execute(connection, sql), 15000, 'The query exceeded 15 seconds. Reset the database and simplify your query.'); }
    finally { this.busy = false; }
  }
  private async execute(connection: duckdb.AsyncDuckDBConnection, sql: string): Promise<QueryResult> {
    const start = performance.now();
    // Every learner query is rolled back, in addition to the SELECT-only guard.
    await connection.query('BEGIN TRANSACTION');
    try {
      const table = await connection.query(sql);
      if (table.numRows > 50000) throw new Error('This query returns more than 50,000 rows. Narrow it with WHERE or LIMIT.');
      return decodeTable(table, performance.now() - start);
    } finally { if (!this.stopped) await connection.query('ROLLBACK'); }
  }
  async dispose(): Promise<void> {
    const wasStopped = this.stopped;
    this.stopped = true;
    this.cancel?.(new DatabaseUnavailableError('Database reset or closed. Run your query again when it is ready.'));
    const connection = this.connection, db = this.db, worker = this.worker;
    this.connection = null; this.db = null; this.worker = null;
    try { if (!wasStopped && !this.busy && !this.initialising) await connection?.close(); }
    finally { try { await db?.terminate(); } finally { worker?.terminate(); } }
  }
}
