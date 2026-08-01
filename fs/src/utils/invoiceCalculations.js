export const UNIT_OPTIONS = ["Cubic Meter", "Hours", "Kilograms (Kgs)", "Trips"];

export const emptyLineItem = () => ({
  productName: "",
  description: "",
  quantity: 1,
  unit: "Cubic Meter",
  rate: 0,
  discount: 0,
  total: 0
});

export const calculateLineTotal = (item) => {
  const quantity = Number(item.quantity) || 0;
  const rate = Number(item.rate) || 0;
  const discount = Number(item.discount) || 0;
  return Math.max(quantity * rate - discount, 0);
};

export const TAX_RATE_OPTIONS = [0, 5, 10, 13, 15];

export const calculateInvoiceTotals = (items = [], paidAmount = 0, taxRate = 0) => {
  const normalized = items.map((item) => ({
    ...item,
    total: calculateLineTotal(item)
  }));

  const subtotal = normalized.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);
  const discount = normalized.reduce((sum, item) => sum + (Number(item.discount) || 0), 0);
  const taxableAmount = Math.max(subtotal - discount, 0);
  const normalizedTaxRate = TAX_RATE_OPTIONS.includes(Number(taxRate)) ? Number(taxRate) : 0;
  const tax = taxableAmount * (normalizedTaxRate / 100);
  const grandTotal = taxableAmount + tax;
  const paid = Math.min(Math.max(Number(paidAmount) || 0, 0), grandTotal);
  const remainingAmount = Math.max(grandTotal - paid, 0);

  let paymentStatus = "unpaid";
  if (grandTotal === 0 || remainingAmount === 0) paymentStatus = "paid";
  else if (paid > 0) paymentStatus = "partial";

  return {
    items: normalized,
    totals: { subtotal, discount, taxableAmount, taxRate: normalizedTaxRate, tax, grandTotal, paidAmount: paid, remainingAmount },
    paymentStatus
  };
};
