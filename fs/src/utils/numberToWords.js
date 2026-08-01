const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen"
];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const convertHundreds = (num) => {
  let result = "";
  if (num >= 100) {
    result += `${ones[Math.floor(num / 100)]} Hundred `;
    num %= 100;
  }
  if (num >= 20) {
    result += `${tens[Math.floor(num / 10)]} `;
    num %= 10;
  }
  if (num > 0) result += `${ones[num]} `;
  return result.trim();
};

export const amountToWords = (amount = 0) => {
  const value = Math.round(Number(amount) * 100) / 100;
  if (!Number.isFinite(value) || value === 0) return "Zero Rupees Only";

  const rupees = Math.floor(value);
  const paise = Math.round((value - rupees) * 100);

  const parts = [];
  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const hundred = rupees % 1000;

  if (crore) parts.push(`${convertHundreds(crore)} Crore`);
  if (lakh) parts.push(`${convertHundreds(lakh)} Lakh`);
  if (thousand) parts.push(`${convertHundreds(thousand)} Thousand`);
  if (hundred) parts.push(convertHundreds(hundred));

  let words = `${parts.join(" ")} Rupees`;
  if (paise) words += ` and ${convertHundreds(paise)} Paise`;
  return `${words} Only`;
};
