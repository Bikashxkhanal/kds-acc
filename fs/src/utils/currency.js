const isNp = () => typeof localStorage !== 'undefined' && localStorage.getItem('kds-language') === 'np';

const withLanguageDigits = (value) => isNp()
  ? String(value).replace(/\d/g, (digit) => '०१२३४५६७८९'[Number(digit)])
  : String(value);

export const formatCurrency = (amount = 0) => {
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount) || 0);

  return isNp()
    ? `रु. ${formatted.replace(/\d/g, (digit) => '०१२३४५६७८९'[Number(digit)])}`
    : `Rs. ${formatted}`;
};

export const formatNumber = (amount = 0) =>
  withLanguageDigits(new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount) || 0));
