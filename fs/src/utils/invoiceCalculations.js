export const UNIT_OPTIONS = ["Cubic Meter", "Hours", "Kilograms (Kgs)", "Trips"];

export const emptyLineItem = () => ({
  productName: "",
  description: "",
  quantity: 1,
  unit: "Cubic Meter",
  rate: 0,
  discount: 0,
  tax: 0,
  total: 0
});

export const calculateLineTotal = (item) => {
  const quantity = Number(item.quantity) || 0;
  const rate = Number(item.rate) || 0;
  const discount = Number(item.discount) || 0;
  const tax = Number(item.tax) || 0;
  return Math.max(quantity * rate - discount + tax, 0);
};

export const calculateInvoiceTotals = (items = [], paidAmount = 0) => {
  const normalized = items.map((item) => ({
    ...item,
    total: calculateLineTotal(item)
  }));

  const subtotal = normalized.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);
  const discount = normalized.reduce((sum, item) => sum + (Number(item.discount) || 0), 0);
  const tax = normalized.reduce((sum, item) => sum + (Number(item.tax) || 0), 0);
  const grandTotal = Math.max(subtotal - discount + tax, 0);
  const paid = Math.min(Math.max(Number(paidAmount) || 0, 0), grandTotal);
  const remainingAmount = Math.max(grandTotal - paid, 0);

  let paymentStatus = "unpaid";
  if (grandTotal === 0 || remainingAmount === 0) paymentStatus = "paid";
  else if (paid > 0) paymentStatus = "partial";

  return {
    items: normalized,
    totals: { subtotal, discount, tax, grandTotal, paidAmount: paid, remainingAmount },
    paymentStatus
  };
};
