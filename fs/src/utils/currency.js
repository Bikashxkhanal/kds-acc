const withLanguageDigits = (value) => localStorage.getItem('kds-language') === 'np'
  ? value.replace(/\d/g, (digit) => '०१२३४५६७८९'[Number(digit)])
  : value;

export const formatCurrency = (amount = 0) =>
  withLanguageDigits(new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount) || 0));

export const formatNumber = (amount = 0) =>
  withLanguageDigits(new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount) || 0));
