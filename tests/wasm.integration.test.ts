import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import * as duckdb from '@duckdb/duckdb-wasm/blocking';
import { generateTransactions, nativeSeedSQL, seedStatements } from '../src/data/finance';
import { lessons } from '../src/content/lessons';
import { decodeTable, validateResult } from '../src/engine/results';
import { assertReadOnly } from '../src/engine/sql';
const require = createRequire(import.meta.url);
let database: Awaited<ReturnType<typeof duckdb.createDuckDB>>;
let connection: ReturnType<typeof database.connect>;
function run(sql: string) {
  assertReadOnly(sql);
  connection.query('BEGIN TRANSACTION');
  try { return decodeTable(connection.query(sql)); }
  finally { connection.query('ROLLBACK'); }
}
beforeAll(async () => {
  database = await duckdb.createDuckDB({
    mvp: { mainModule: require.resolve('@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm'), mainWorker: require.resolve('@duckdb/duckdb-wasm/dist/duckdb-node-mvp.worker.cjs') },
    eh: { mainModule: require.resolve('@duckdb/duckdb-wasm/dist/duckdb-eh.wasm'), mainWorker: require.resolve('@duckdb/duckdb-wasm/dist/duckdb-node-eh.worker.cjs') },
  }, new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING), duckdb.NODE_RUNTIME);
  await database.instantiate(() => {});
  database.open({ query: { castDecimalToDouble: false, castBigIntToDouble: false } });
  connection = database.connect();
  connection.query('BEGIN TRANSACTION');
  for (const statement of seedStatements()) connection.query(statement);
  connection.query('COMMIT');
  connection.query("SET memory_limit = '128MB'; SET enable_external_access = false; SET lock_configuration = true;");
}, 30000);
afterAll(() => { connection?.close(); database?.reset(); });
describe('real DuckDB-Wasm SQL integration under Node (browser worker is covered by Playwright)', () => {
  const counts = [10000, 10000, 265, 329, 410, 10, 13, 3];
  const alternatives = [
    'SELECT transactions.* FROM transactions;',
    'SELECT date, payee, amount FROM transactions WHERE TRUE;',
    "SELECT date, payee, category, amount FROM transactions WHERE amount < 0 AND ABS(amount) > 30 AND category = 'Groceries';",
    'SELECT date, payee, amount FROM transactions WHERE amount BETWEEN -100 AND -50;',
    "SELECT date, payee, category, amount FROM transactions WHERE (amount < -50 AND category = 'Restaurants') OR (amount < -30 AND category = 'Groceries');",
    "SELECT id, date, payee, amount FROM transactions WHERE category <> 'Transfers' AND amount < 0 ORDER BY amount, id LIMIT 10;",
    'SELECT DISTINCT category FROM transactions ORDER BY category;',
    "SELECT id, date, payee, category, amount FROM transactions WHERE category <> 'Housing' AND category <> 'Transfers' AND amount < -1000 ORDER BY amount, id;",
  ];
  for (const [index, lesson] of lessons.entries()) {
    it(`executes ${lesson.id} with its fixed row count and accepts alternative SQL`, () => {
      const expected = run(lesson.solution);
      expect(expected.rows).toHaveLength(counts[index]);
      expect(validateResult(run(alternatives[index]), expected, lesson, alternatives[index]).ok).toBe(true);
    });
  }
  it('decodes real Arrow dates and decimal pennies exactly', () => {
    const boundary = generateTransactions().find(row => row.pence === -3001 && row.category === 'Groceries')!;
    const actual = run(`SELECT date, amount FROM transactions WHERE id = ${boundary.id};`);
    expect(actual.rows).toEqual([['2024-01-02', '-30.01']]);
    expect(actual.columns[1].type).toContain('Decimal');
  });
  it('rejects incorrect inclusive boundaries and recovers after SQL errors', () => {
    const wrong = 'SELECT date, payee, amount FROM transactions WHERE amount > -100 AND amount < -50;';
    expect(validateResult(run(wrong), run(lessons[3].solution), lessons[3], wrong).ok).toBe(false);
    expect(() => run('SELECT missing_column FROM transactions;')).toThrow();
    expect(run('SELECT COUNT(*) AS total FROM transactions;').rows).toEqual([['10000']]);
    expect(() => connection.query("SELECT * FROM read_csv('untrusted.csv');")).toThrow();
  });
  it('resets the engine and reproduces the data using the downloaded native SQL seed', () => {
    const original = run(lessons[7].solution);
    connection.close(); database.reset();
    database.open({ query: { castDecimalToDouble: false, castBigIntToDouble: false } });
    connection = database.connect(); connection.query(nativeSeedSQL());
    expect(run('SELECT COUNT(*) AS total FROM transactions;').rows).toEqual([['10000']]);
    expect(run(lessons[7].solution).rows).toEqual(original.rows);
  });
});
