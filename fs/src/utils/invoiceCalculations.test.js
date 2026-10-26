import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateInvoiceTotals, calculateLineTotal } from './invoiceCalculations.js';

test('unit selection does not change invoice amounts or totals', () => {
  const base = { quantity: 5, rate: 20, discount: 0 };
  assert.equal(calculateLineTotal({ ...base, unit: null }), calculateLineTotal({ ...base, unit: 'Kilograms (Kgs)' }));
  const withoutUnit = calculateInvoiceTotals([{ ...base, unit: null }], 0, 0);
  const withUnit = calculateInvoiceTotals([{ ...base, unit: 'Kilograms (Kgs)' }], 0, 0);
  assert.deepEqual(withoutUnit.totals, withUnit.totals);
});
