import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSupplierTotals } from './supplierTotals.js';

test('supplier totals keep purchases and supplier payments separate', () => {
  const purchases = [{ totalValue: 100, payments: [{ amount: 100 }] }, { totalValue: 200 }];
  const payments = [{ amount: 50 }];
  assert.deepEqual(calculateSupplierTotals(purchases, payments), {
    totalPurchased: 300,
    totalPaid: 50,
    balance: 250
  });
});

test('adding a purchase changes purchased and balance, not paid', () => {
  const before = calculateSupplierTotals([{ totalValue: 100 }], [{ amount: 50 }]);
  const after = calculateSupplierTotals([{ totalValue: 100 }, { totalValue: 200, payments: [{ amount: 200 }] }], [{ amount: 50 }]);
  assert.equal(after.totalPurchased - before.totalPurchased, 200);
  assert.equal(after.totalPaid, before.totalPaid);
});

test('adding a supplier payment changes paid and balance, not purchased', () => {
  const before = calculateSupplierTotals([{ totalValue: 300 }], [{ amount: 50 }]);
  const after = calculateSupplierTotals([{ totalValue: 300 }], [{ amount: 50 }, { amount: 25 }]);
  assert.equal(after.totalPurchased, before.totalPurchased);
  assert.equal(after.totalPaid - before.totalPaid, 25);
  assert.equal(after.balance, 225);
});
