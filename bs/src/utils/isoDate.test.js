import test from 'node:test';
import assert from 'node:assert/strict';
import { parseISODate, isISODate } from './isoDate.js';

test('parses canonical ISO date-only strings into UTC midnight', () => {
  const date = parseISODate('2026-10-26', 'work_date');
  assert.equal(date.toISOString(), '2026-10-26T00:00:00.000Z');
  assert.equal(isISODate('2024-02-29'), true);
});

test('rejects impossible, noncanonical, and out-of-range dates with field details', () => {
  for (const value of ['2026-02-29', '2026-13-01', '2026-01-32', '2026-1-01', '2083-07-09T00:00:00.000Z', '1800-01-01', '']) {
    assert.throws(() => parseISODate(value, 'date'), (error) => error.statusCode === 400 && error.errors[0].field === 'date');
  }
  assert.equal(parseISODate('', 'dueDate', { required: false }), undefined);
});
