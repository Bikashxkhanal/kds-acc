import test from 'node:test';
import assert from 'node:assert/strict';
import { dateBounds, bsToISO, bsToIso, isoToBS, parseBSInput, isValidBS, validateBSInput, normalizeISODate, bsToday, formatBS } from './bsDate.js';

test('supports every configured BS month boundary and variable 29–32 day months', () => {
  const { minBSYear, maxBSYear } = dateBounds();
  const lengths = new Set();
  for (let year = minBSYear; year <= maxBSYear; year += 1) {
    for (let month = 1; month <= 12; month += 1) {
      const first = { year, month, day: 1 };
      const firstISO = bsToISO(first);
      assert.deepEqual(parseBSInput(isoToBS(firstISO)), first);
      const lastDay = [29, 30, 31, 32].filter((day) => isValidBS(year, month, day)).at(-1);
      assert.ok(isValidBS(year, month, lastDay), `${year}/${month}/${lastDay}`);
      assert.equal(isValidBS(year, month, lastDay + 1), false);
      assert.deepEqual(parseBSInput(isoToBS(bsToISO({ year, month, day: lastDay }))), { year, month, day: lastDay });
      lengths.add(lastDay);
    }
  }
  assert.deepEqual([...lengths].sort(), [29, 30, 31, 32]);
});

test('parses Devanagari digits, separators, whitespace, padding, and month names', () => {
  for (const input of ['2083-07-09', ' 2083/7/9 ', '2083.07.09', '२०८३-०७-०९', '२०८३/७/९', '2083 Baisakh 15', '२०८३ वैशाख १५']) {
    assert.ok(bsToISO(input), input);
    assert.equal(validateBSInput(input), null, input);
  }
  assert.deepEqual(parseBSInput('2083-07-09'), { year: 2083, month: 7, day: 9 });
  assert.equal(bsToIso('2026-10-26'), '2026-10-26');
  assert.equal(bsToISO('2083-07-09'), '2026-10-26');
});

test('rejects invalid values and distinguishes unsupported range and empty optional fields', () => {
  assert.equal(parseBSInput(''), null);
  assert.equal(validateBSInput('', { required: false }), null);
  assert.equal(validateBSInput('', { required: true }), 'required');
  assert.equal(validateBSInput('2083-13-01'), 'invalid');
  assert.equal(validateBSInput('2083-02-33'), 'invalid');
  assert.equal(validateBSInput('2083-02-32'), 'invalid');
  assert.equal(validateBSInput('2083-07-31'), 'invalid');
  assert.equal(validateBSInput('2083-01-33'), 'invalid');
  assert.equal(isValidBS(dateBounds().minBSYear, 1, 1), true);
  assert.equal(isValidBS(dateBounds().maxBSYear, 12, 1), true);
  assert.equal(validateBSInput('2091-01-01'), 'range');
  assert.equal(validateBSInput('not a date'), 'format');
});

test('round trips a large range and preserves date-only ISO values', () => {
  const start = new Date(Date.UTC(2000, 0, 1));
  for (let day = 0; day < 3653; day += 1) {
    const current = new Date(start.getTime() + day * 86400000);
    const iso = normalizeISODate(current);
    const bs = isoToBS(iso);
    assert.ok(bs, iso);
    assert.equal(bsToISO(bs), iso);
  }
});

test('handles Kathmandu midnight boundaries and canonical today defaults', () => {
  const before = new Date('2026-10-25T18:14:59.000Z');
  const after = new Date('2026-10-25T18:15:00.000Z');
  assert.equal(bsToday(before), '2026-10-25');
  assert.equal(bsToday(after), '2026-10-26');
  assert.equal(isoToBS(bsToday(after)), '2083-07-09');
  assert.equal(formatBS('2026-10-26', 'long', 'en'), '2083 Kartik 9');
  assert.equal(formatBS('2026-10-26', 'long', 'np'), '२०८३ कार्तिक ९');
});
