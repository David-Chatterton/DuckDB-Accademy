import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { accounts, categories, generateTransactions, money, nativeSeedSQL, payees, seedStatements } from '../src/data/finance';
describe('deterministic financial dataset', () => {
  it('reproduces exactly 10,000 rows for a fixed seed', () => {
    expect(generateTransactions()).toEqual(generateTransactions());
    expect(generateTransactions()).toHaveLength(10000);
    expect(createHash('sha256').update(JSON.stringify(generateTransactions())).digest('hex')).toBe('3baaebf80b50e301f7457166f9eb47c285f783ab81b78ba07d223f63228988ae');
    expect(generateTransactions(42)).not.toEqual(generateTransactions());
  });
  it('keeps money as integer pence and relationships valid', () => {
    const rows = generateTransactions();
    expect(new Set(rows.map(r => r.id)).size).toBe(10000);
    for (const row of rows) {
      expect(Number.isInteger(row.pence)).toBe(true);
      expect(accounts.some(a => a.id === row.accountId)).toBe(true);
      expect(payees.some(p => p.id === row.payeeId)).toBe(true);
      expect(row.categoryId === null || categories[row.categoryId - 1] === row.category).toBe(true);
      expect(row.date >= '2024-01-01' && row.date <= '2025-12-31').toBe(true);
    }
  });
  it('creates balanced paired transfers and controlled anomalies', () => {
    const rows = generateTransactions();
    for (let id = 1; id <= 48; id++) {
      const pair = rows.filter(r => r.transferId === id);
      expect(pair).toHaveLength(2);
      expect(pair[0].pence + pair[1].pence).toBe(0);
    }
    expect(rows.some(r => r.category === null)).toBe(true);
    expect(rows.some(r => r.payee !== r.payee.trim())).toBe(true);
    expect(rows.some(r => r.duplicateOf !== null)).toBe(true);
    expect(rows.filter(r => r.pence < -100000 && r.category !== 'Housing' && r.category !== 'Transfers')).toHaveLength(3);
    for (const boundary of [-3000, -3001, -5000, -10000, -10001, -4999]) expect(rows.some(r => r.pence === boundary && r.category === 'Groceries')).toBe(true);
  });
  it('exports exact native-compatible decimal literals and matching rows', () => {
    expect(money(-1)).toBe('-0.01'); expect(money(100)).toBe('1.00'); expect(money(-249999)).toBe('-2499.99');
    const seed = nativeSeedSQL();
    expect(seed).toContain('amount DECIMAL(12,2)');
    expect(seed).toContain('BEGIN TRANSACTION;'); expect(seed).toContain('COMMIT;');
    expect(seedStatements().filter(s => s.startsWith('INSERT INTO transactions'))).toHaveLength(20);
    expect(seed).not.toMatch(/Math\.random|read_csv|https?:/);
  });
});
