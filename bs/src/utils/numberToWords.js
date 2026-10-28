const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen"
];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const nepaliWords = [
  "शून्य", "एक", "दुई", "तीन", "चार", "पाँच", "छ", "सात", "आठ", "नौ",
  "दश", "एघार", "बाह्र", "तेह्र", "चौध", "पन्ध्र", "सोह्र", "सत्र", "अठार", "उन्नाइस",
  "बीस", "एक्काइस", "बाइस", "तेइस", "चौबीस", "पच्चीस", "छब्बीस", "सत्ताइस", "अठ्ठाइस", "उनन्तिस",
  "तीस", "एकतीस", "बत्तीस", "तेत्तीस", "चौँतिस", "पैँतिस", "छत्तीस", "सैँतिस", "अड्तीस", "उनन्चालीस",
  "चालीस", "एकचालीस", "बयालीस", "त्रिचालीस", "चौवालिस", "पैँतालीस", "छयालीस", "सत्तचालीस", "अड्चालीस", "उनन्पचास",
  "पचास", "एकाउन्न", "बाउन्न", "त्रिपन्न", "चौवन्न", "पचपन्न", "छपन्न", "सत्ताउन्न", "अट्ठाउन्न", "उनन्साट्ठी",
  "साट्ठी", "एकसट्ठी", "बासट्ठी", "त्रिसट्ठी", "चौंसट्ठी", "पैंसट्ठी", "छयसट्ठी", "सतसट्ठी", "अठसट्ठी", "उनन्सत्तरी",
  "सत्तरी", "एकहत्तर", "बहत्तर", "त्रिहत्तर", "चौहत्तर", "पचहत्तर", "छहत्तर", "सतहत्तर", "अठहत्तर", "उनासी",
  "असी", "एकासी", "बयासी", "त्रियासी", "चौरासी", "पचासी", "छयासी", "सत्तासी", "अठासी", "उनन्नब्बे",
  "नब्बे", "एकानब्बे", "बयानब्बे", "त्रियानब्बे", "चौरानब्बे", "पञ्चानब्बे", "छयानब्बे", "सन्तानब्बे", "अन्ठानब्बे", "उनान्सय"
];

const convertHundredsEn = (num) => {
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

const convertHundredsNp = (num) => {
  let result = "";
  if (num >= 100) {
    const h = Math.floor(num / 100);
    result += `${nepaliWords[h] || ""} सय `;
    num %= 100;
  }
  if (num > 0) {
    result += `${nepaliWords[num] || ""} `;
  }
  return result.trim();
};

export const amountToWords = (amount = 0, language = 'en') => {
  const value = Math.round(Number(amount) * 100) / 100;
  if (language === 'np') {
    if (!Number.isFinite(value) || value === 0) return "शून्य रुपैयाँ मात्र";
    const rupees = Math.floor(value);
    const paise = Math.round((value - rupees) * 100);
    const parts = [];
    const crore = Math.floor(rupees / 10000000);
    const lakh = Math.floor((rupees % 10000000) / 100000);
    const thousand = Math.floor((rupees % 100000) / 1000);
    const hundred = rupees % 1000;

    if (crore) parts.push(`${nepaliWords[crore] || convertHundredsNp(crore)} करोड`);
    if (lakh) parts.push(`${nepaliWords[lakh] || convertHundredsNp(lakh)} लाख`);
    if (thousand) parts.push(`${nepaliWords[thousand] || convertHundredsNp(thousand)} हजार`);
    if (hundred) parts.push(convertHundredsNp(hundred));

    let words = `${parts.join(" ")} रुपैयाँ`;
    if (paise) words += ` ${nepaliWords[paise] || convertHundredsNp(paise)} पैसा`;
    return `${words.trim()} मात्र`;
  }

  if (!Number.isFinite(value) || value === 0) return "Zero Rupees Only";
  const rupees = Math.floor(value);
  const paise = Math.round((value - rupees) * 100);
  const parts = [];
  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const hundred = rupees % 1000;

  if (crore) parts.push(`${convertHundredsEn(crore)} Crore`);
  if (lakh) parts.push(`${convertHundredsEn(lakh)} Lakh`);
  if (thousand) parts.push(`${convertHundredsEn(thousand)} Thousand`);
  if (hundred) parts.push(convertHundredsEn(hundred));

  let words = `${parts.join(" ")} Rupees`;
  if (paise) words += ` and ${convertHundredsEn(paise)} Paise`;
  return `${words} Only`;
};
