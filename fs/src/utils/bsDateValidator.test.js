import test from 'node:test';
import assert from 'node:assert/strict';
import { dateField } from './bsDateValidator.js';

test('shared validator accepts only canonical ISO date-only form values', () => {
  const schema = dateField({ required: true });
  assert.equal(schema.safeParse('2026-10-26').success, true);
  assert.equal(schema.safeParse('2083-07-09').success, true);
  assert.equal(schema.safeParse('२०८३-०७-०९').success, false);
  assert.equal(schema.safeParse('2026-02-30').success, false);
  assert.equal(schema.safeParse('').error.issues[0].message, 'date.required');
  assert.equal(dateField({ required: false }).safeParse('').success, true);
  assert.equal(dateField({ min: '2026-10-27' }).safeParse('2026-10-26').error.issues[0].message, 'date.min');
});
