import test from 'node:test';
import assert from 'node:assert/strict';
import { buildInvoiceHtml } from './invoiceTemplate.js';

const sample = {
  invoiceNumber: 'INV-TEST',
  billNumber: 'BILL-TEST',
  company: { name: 'Business Ltd', address: 'Main Road', phone: '9800000000', email: 'a@example.com', pan: '123456789', logoUrl: 'https://example.com/logo.png' },
  customer: { name: 'Customer', address: 'Customer Road', phone: '9811111111', pan: '987654321' },
  billDate: new Date('2025-01-01T00:00:00Z'),
  items: [{ productName: 'Service', description: 'Item detail', quantity: 2, unit: 'Hours', rate: 100, discount: 10, total: 190 }],
  totals: { subtotal: 200, discount: 10, taxableAmount: 190, taxRate: 13, tax: 24.7, grandTotal: 214.7, paidAmount: 50, remainingAmount: 164.7 },
  paymentStatus: 'partial', creator: { name: 'Issuer' }, lastUpdatedBy: { name: 'Editor' }, updatedAt: new Date('2025-01-02T00:00:00Z')
};

test('invoice PDF includes the PANs and content shown in the preview', () => {
  const html = buildInvoiceHtml(sample);
  for (const value of ['123456789', '987654321', 'logo.png', 'Business Ltd', 'Customer Road', '9811111111', 'INV-TEST', 'Service', 'Item detail', '214.70', 'Issuer', 'Editor']) {
    assert.ok(html.includes(value), `expected generated invoice HTML to include ${value}`);
  }
  assert.match(html, /PAN: 123456789/);
  assert.match(html, /PAN Number: 987654321/);
});

test('invoice PDF shows N/A for missing PANs', () => {
  const html = buildInvoiceHtml({ ...sample, company: { name: 'Business' }, customer: { name: 'Customer', address: 'Address' } });
  assert.match(html, /PAN: N\/A/);
  assert.match(html, /PAN Number: N\/A/);
});

test('invoice PDF leaves a missing item unit blank', () => {
  const html = buildInvoiceHtml({ ...sample, items: [{ ...sample.items[0], unit: null }] });
  assert.doesNotMatch(html, /<td class="center">null<\/td>/);
  assert.match(html, /<td class="center"><\/td>/);
});
