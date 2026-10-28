/**
 * Previous Account Balance helpers.
 * Stored `type` is always from OUR BUSINESS's perspective:
 * - Customer debit = they owe us; credit = advance/payment reducing what they owe
 * - Supplier/Staff debit = we paid / advance; credit = we owe them
 */

/** Net contribution to outstanding balance for a party. Positive = money owed in the party's usual direction. */
export const netOpeningEffect = (entries = [], partyType) => {
  let debit = 0;
  let credit = 0;
  for (const entry of entries) {
    const amount = Number(entry.amount || 0);
    if (entry.type === 'debit') debit += amount;
    else if (entry.type === 'credit') credit += amount;
  }
  if (partyType === 'customer') return debit - credit; // receivable
  return credit - debit; // payable (supplier / staff)
};

/** Map stored type → ledger Debit/Credit columns used by each party UI. */
export const toLedgerAmounts = (entry, partyType) => {
  const amount = Number(entry.amount || 0);
  if (partyType === 'customer') {
    return entry.type === 'debit'
      ? { Debit: amount, Credit: 0 }
      : { Debit: 0, Credit: amount };
  }
  // Supplier & staff ledgers: Debit column = we owe more; Credit column = we paid
  return entry.type === 'credit'
    ? { Debit: amount, Credit: 0 }
    : { Debit: 0, Credit: amount };
};

export const openingBalanceLabel = (entry) => {
  const typeLabel = entry.type === 'debit' ? 'Debit' : 'Credit';
  const note = entry.notes ? ` | ${entry.notes}` : '';
  return `Previous Account Balance (${typeLabel})${note}`;
};

export const customerOpeningRows = (entries = []) =>
  entries.map((entry) => {
    const amounts = toLedgerAmounts(entry, 'customer');
    return {
      PaymentId: null,
      OpeningBalanceId: entry.id,
      kind: 'opening',
      Receipt: '',
      date: entry.date,
      discription: openingBalanceLabel(entry),
      Credit: amounts.Credit,
      Debit: amounts.Debit,
      openingType: entry.type,
      notes: entry.notes || ''
    };
  });

export const staffOpeningRows = (entries = []) =>
  entries.map((entry) => {
    const amounts = toLedgerAmounts(entry, 'staff');
    return {
      PaymentId: null,
      OpeningBalanceId: entry.id,
      kind: 'opening',
      Receipt: '',
      Date: entry.date,
      Discription: openingBalanceLabel(entry),
      Credit: amounts.Credit || null,
      Debit: amounts.Debit || null,
      openingType: entry.type,
      notes: entry.notes || ''
    };
  });

export const supplierOpeningLedgerEntries = (entries = []) =>
  entries.map((entry) => {
    const amounts = toLedgerAmounts(entry, 'supplier');
    return {
      _id: `opening-${entry.id}`,
      OpeningBalanceId: entry.id,
      date: entry.date,
      description: openingBalanceLabel(entry),
      debit: amounts.Debit,
      credit: amounts.Credit,
      kind: 'opening',
      openingType: entry.type,
      notes: entry.notes || '',
      sortId: `opening-${String(entry.id).padStart(10, '0')}`
    };
  });
