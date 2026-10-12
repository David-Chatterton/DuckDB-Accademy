import { describe, expect, it } from 'vitest';
import { decodeCell, validateResult } from '../src/engine/results';
import { lessons } from '../src/content/lessons';
import type { QueryResult } from '../src/types';
const result = (rows: QueryResult['rows']): QueryResult => ({ columns: [{ name: 'amount', type: 'Decimal[12e+2]', numeric: true }], rows, elapsedMs: 1 });
const lesson = { ...lessons[0], expected: { ordered: false } };
describe('result-based validation', () => {
  it('accepts equivalent numeric values and unordered rows', () => {
    expect(validateResult(result([['-1.00'], [2]]), result([[2], [-1]]), lesson, 'SELECT amount FROM transactions').ok).toBe(true);
  });
  it('compares multiplicities, nulls and exact decimal precision', () => {
    expect(validateResult(result([[1], [1]]), result([[1], [2]]), lesson, 'SELECT amount FROM transactions').ok).toBe(false);
    expect(validateResult(result([[null]]), result([[0]]), lesson, 'SELECT amount FROM transactions').ok).toBe(false);
    expect(validateResult(result([['-0.01']]), result([['0.01']]), lesson, 'SELECT amount FROM transactions').ok).toBe(false);
    expect(validateResult(result([['9999999999.99']]), result([['9999999999.98']]), lesson, 'SELECT amount FROM transactions').ok).toBe(false);
  });
  it('rejects missing columns, wrong types, wrong row counts and order', () => {
    expect(validateResult({ ...result([[1]]), columns: [] }, result([[1]]), lesson, 'SELECT amount FROM transactions').message).toContain('columns');
    expect(validateResult({ ...result([[1]]), columns: [{ name: 'amount', type: 'Utf8', numeric: false }] }, result([[1]]), lesson, 'SELECT amount FROM transactions').message).toContain('types');
    expect(validateResult(result([[1]]), result([[1], [2]]), lesson, 'SELECT amount FROM transactions').ok).toBe(false);
    expect(validateResult(result([[2], [1]]), result([[1], [2]]), { ...lesson, expected: { ordered: true } }, 'SELECT amount FROM transactions').ok).toBe(false);
  });
  it('checks specified techniques after actual result correctness', () => {
    const distinct = { ...lesson, expected: { ordered: false, technique: ['DISTINCT'] } };
    expect(validateResult(result([[1]]), result([[1]]), distinct, "SELECT amount FROM transactions -- DISTINCT").ok).toBe(false);
    expect(validateResult(result([[1]]), result([[1]]), distinct, 'SELECT DISTINCT amount FROM transactions').ok).toBe(true);
  });
  it('decodes Arrow signed decimal limbs without floating point rounding', () => {
    expect(decodeCell(new Int32Array([12345, 0, 0, 0]), 'Decimal', 2)).toBe('123.45');
    expect(decodeCell(new Int32Array([-1, -1, -1, -1]), 'Decimal', 2)).toBe('-0.01');
    expect(decodeCell(null, 'Decimal', 2)).toBeNull();
    expect(decodeCell(Date.UTC(2024, 0, 1), 'Date32<DAY>')).toBe('2024-01-01');
    expect(decodeCell(9007199254740993n, 'Int64')).toBe('9007199254740993');
  });
});
