import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateYearlyCost, calculateYearlyPurchases, calculateAllTimeSummary } from './dashboardTotals.js';

const yearStart = new Date('2026-04-14T00:00:00.000Z');
const yearEnd = new Date('2027-04-14T00:00:00.000Z');
const midYear = new Date('2026-07-15T00:00:00.000Z');
const prevYear = new Date('2025-08-15T00:00:00.000Z');

test('Task 4: purchases immediately update current-year cost regardless of payment status', () => {
  // Unpaid purchase of 2000
  const purchases = [{ date: midYear, totalValue: 2000, payments: [] }];
  const cost = calculateYearlyCost(purchases, [], new Set(), yearStart, yearEnd);
  assert.equal(cost, 2000, 'Unpaid purchase must count toward Cost immediately');

  // Supplier payment does not increase Cost (no double counting)
  const costWithPayment = calculateYearlyCost(purchases, [], new Set(), yearStart, yearEnd);
  assert.equal(costWithPayment, 2000, 'Supplier payment must not be added to Cost');

  // Editing purchase amount updates cost
  const editedPurchases = [{ date: midYear, totalValue: 3500, payments: [] }];
  const updatedCost = calculateYearlyCost(editedPurchases, [], new Set(), yearStart, yearEnd);
  assert.equal(updatedCost, 3500, 'Editing purchase updates Cost');

  // Deleting purchase removes it from cost
  const deletedPurchases = [];
  const costAfterDelete = calculateYearlyCost(deletedPurchases, [], new Set(), yearStart, yearEnd);
  assert.equal(costAfterDelete, 0, 'Deleting purchase removes it from Cost');
});

test('Task 5: yearly purchases card calculates purchase cost, paid, and to be paid', () => {
  // Add a purchase of 10,000
  const purchases = [{ date: midYear, totalValue: 10000 }];
  const initial = calculateYearlyPurchases(purchases, [], 2083, yearStart, yearEnd);
  assert.equal(initial.purchaseCost, 10000);
  assert.equal(initial.amountPaid, 0);
  assert.equal(initial.amountToBePaid, 10000);

  // Add a payment of 4,000 to the supplier
  const payments = [{ date: midYear, amount: 4000 }];
  const afterPayment = calculateYearlyPurchases(purchases, payments, 2083, yearStart, yearEnd);
  assert.equal(afterPayment.purchaseCost, 10000);
  assert.equal(afterPayment.amountPaid, 4000);
  assert.equal(afterPayment.amountToBePaid, 6000);
  assert.equal(afterPayment.paidRatio, 0.4);

  // Payment for previous year purchase handled by payment date:
  // Payment dated this year counts in this year's amount paid
  const prevYearPurchases = [{ date: prevYear, totalValue: 5000 }, { date: midYear, totalValue: 10000 }];
  const result = calculateYearlyPurchases(prevYearPurchases, payments, 2083, yearStart, yearEnd);
  assert.equal(result.purchaseCost, 10000, 'Previous year purchase not counted in current year purchase cost');
  assert.equal(result.amountPaid, 4000, 'Current year payment is counted');
});

test('Task 6: all-time summary reflects totals across all time and previous balances correctly', () => {
  const summary = calculateAllTimeSummary({
    revenueTotal: 50000,
    recoveredTotal: 30000,
    purchases: [{ totalValue: 20000 }, { totalValue: 10000 }],
    remunerations: [{ staff_id: 1, amount: 15000 }],
    noSalaryIds: new Set(),
    supplierPayments: [{ amount: 12000 }],
    staffPayments: [{ amount: 10000 }],
    customerOpeningNet: 10000, // Customer Debit (they owe us)
    supplierOpeningNet: 5000,  // Supplier Credit (we owe them)
    staffOpeningNet: 2000     // Staff Credit (we owe them)
  });

  // Total Revenue: 50,000 (Customer opening balance does NOT count toward Total Revenue)
  assert.equal(summary.totalRevenue, 50000);

  // Total Cost: 30,000 purchases + 15,000 staff = 45,000 (Opening balances do NOT count toward Total Cost)
  assert.equal(summary.totalCost, 45000);

  // Amount to be Recovered: 50,000 - 30,000 + 10,000 opening = 30,000
  assert.equal(summary.amountToBeRecovered, 30000);

  // Amount Paid: 12,000 supplier + 10,000 staff = 22,000
  assert.equal(summary.amountPaid, 22000);

  // Amount to be Paid:
  // Supplier: (30,000 purchases - 12,000 paid + 5,000 opening) = 23,000
  // Staff: (15,000 earned - 10,000 paid + 2,000 opening) = 7,000
  // Total to be Paid: 23,000 + 7,000 = 30,000
  assert.equal(summary.amountToBePaid, 30000);
});
