export const calculateSupplierTotals = (purchases = [], payments = []) => {
  const totalPurchased = purchases.reduce((sum, purchase) => sum + Number(purchase.totalValue || 0), 0);
  // Supplier payments are the canonical cash payments. Purchase.payments are
  // bill-level payment details and must not be counted again in this ledger.
  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  return { totalPurchased, totalPaid, balance: totalPurchased - totalPaid };
};
