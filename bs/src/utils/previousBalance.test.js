import test from 'node:test';
import assert from 'node:assert/strict';
import { netOpeningEffect, toLedgerAmounts } from './previousBalance.js';

test('customer debit increases receivable; credit decreases it', () => {
  assert.equal(netOpeningEffect([{ type: 'debit', amount: 10000 }], 'customer'), 10000);
  assert.equal(netOpeningEffect([{ type: 'debit', amount: 10000 }, { type: 'credit', amount: 2000 }], 'customer'), 8000);
});

test('supplier/staff credit increases payable; debit decreases it', () => {
  assert.equal(netOpeningEffect([{ type: 'credit', amount: 5000 }], 'supplier'), 5000);
  assert.equal(netOpeningEffect([{ type: 'debit', amount: 1000 }], 'staff'), -1000);
  assert.equal(netOpeningEffect([{ type: 'credit', amount: 5000 }, { type: 'debit', amount: 2000 }], 'staff'), 3000);
});

test('ledger column mapping matches party conventions', () => {
  assert.deepEqual(toLedgerAmounts({ type: 'debit', amount: 10 }, 'customer'), { Debit: 10, Credit: 0 });
  assert.deepEqual(toLedgerAmounts({ type: 'credit', amount: 10 }, 'customer'), { Debit: 0, Credit: 10 });
  assert.deepEqual(toLedgerAmounts({ type: 'credit', amount: 10 }, 'supplier'), { Debit: 10, Credit: 0 });
  assert.deepEqual(toLedgerAmounts({ type: 'debit', amount: 10 }, 'staff'), { Debit: 0, Credit: 10 });
});
