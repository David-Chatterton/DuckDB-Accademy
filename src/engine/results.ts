import type { Cell, Column, QueryResult, Lesson } from '../types';
import { hasTechnique, tokens } from './sql';
export function decodeCell(value: unknown, type: string, scale?: number): Cell {
  if (value === null || value === undefined) return null;
  if (scale !== undefined && (ArrayBuffer.isView(value) || Array.isArray(value))) {
    const limbs = Array.from(value as ArrayLike<number>);
    let integer = 0n;
    for (let i = limbs.length - 1; i >= 0; i--) integer = (integer << 32n) | BigInt(limbs[i] >>> 0);
    if (limbs.length && (limbs[limbs.length - 1] & 0x80000000)) integer -= 1n << BigInt(limbs.length * 32);
    const negative = integer < 0n;
    const digits = (negative ? -integer : integer).toString().padStart(scale + 1, '0');
    return `${negative ? '-' : ''}${scale ? `${digits.slice(0, -scale)}.${digits.slice(-scale)}` : digits}`;
  }
  if (/Date/.test(type)) {
    const date = value instanceof Date ? value : new Date(Number(value));
    return Number.isNaN(date.valueOf()) ? String(value) : date.toISOString().slice(0, 10);
  }
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') return value;
  return String(value);
}
export interface ArrowTableLike {
  schema: { fields: { name: string; type: { toString(): string; scale?: number } }[] };
  numRows: number;
  getChildAt(index: number): { get(index: number): unknown } | null;
}
export function decodeTable(table: ArrowTableLike, elapsedMs = 0): QueryResult {
  const columns = table.schema.fields.map(field => ({
    name: field.name, type: field.type.toString(), numeric: /Int|Float|Decimal/.test(field.type.toString()),
  }));
  const rows = Array.from({ length: table.numRows }, (_, row) => table.schema.fields.map((field, col) =>
    decodeCell(table.getChildAt(col)?.get(row), field.type.toString(), field.type.scale),
  ));
  return { columns, rows, elapsedMs };
}
function numericKey(value: Cell): string {
  const text = String(value);
  if (/^-?\d+(\.\d+)?$/.test(text)) {
    const [whole, fraction = ''] = text.split('.');
    const trimmed = fraction.replace(/0+$/, '');
    const normalWhole = BigInt(whole).toString();
    const prefix = text.startsWith('-') && normalWhole === '0' && /[1-9]/.test(trimmed) ? '-0' : normalWhole;
    return `${prefix}${trimmed ? `.${trimmed}` : ''}`;
  }
  return text;
}
function rowKey(row: Cell[], columns: Column[]): string {
  return JSON.stringify(row.map((cell, i) => cell === null ? ['null'] : [columns[i].numeric ? 'number' : 'value', columns[i].numeric ? numericKey(cell) : cell]));
}
export interface Validation { ok: boolean; message: string }
export function validateResult(actual: QueryResult, expected: QueryResult, lesson: Lesson, sql: string): Validation {
  const names = expected.columns.map(c => c.name);
  if (actual.columns.length !== names.length || actual.columns.some((c, i) => c.name !== names[i])) {
    return { ok: false, message: `Return these columns in this order: ${names.join(', ')}. Your query returned ${actual.columns.map(c => c.name).join(', ') || 'no columns'}.` };
  }
  if (actual.columns.some((c, i) => c.numeric !== expected.columns[i].numeric || (!c.numeric && c.type !== expected.columns[i].type))) {
    return { ok: false, message: 'The column data types differ. Select the original columns rather than formatting or converting them.' };
  }
  if (actual.rows.length !== expected.rows.length) return { ok: false, message: `Your query returned ${actual.rows.length.toLocaleString('en-GB')} rows; the task needs ${expected.rows.length.toLocaleString('en-GB')}. Check the filters, signs and any LIMIT.` };
  const actualKeys = actual.rows.map(row => rowKey(row, expected.columns));
  const expectedKeys = expected.rows.map(row => rowKey(row, expected.columns));
  if (!lesson.expected.ordered) { actualKeys.sort(); expectedKeys.sort(); }
  if (actualKeys.some((key, i) => key !== expectedKeys[i])) return { ok: false, message: lesson.expected.ordered ? 'The rows or their order differ. Check DESC, the tie-breaker and the filter.' : 'The row count is right, but the values differ. Check the selected rows and comparison boundaries.' };
  const list = tokens(sql);
  const missing = lesson.expected.technique?.filter(technique => !hasTechnique(list, technique)) ?? [];
  if (missing.length) return { ok: false, message: `The result is correct. To practise this lesson, also use ${missing.join(' and ')} in your query.` };
  return { ok: true, message: 'Correct — your actual DuckDB results match the task. Lesson completed.' };
}
