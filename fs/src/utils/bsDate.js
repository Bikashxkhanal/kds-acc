import NepaliDateModule from 'nepali-date-converter';
const NepaliDate = NepaliDateModule.default || NepaliDateModule;
const dateConfigMap = NepaliDateModule.dateConfigMap || NepaliDateModule.default?.dateConfigMap || {};

const BS_MONTHS_EN = ['Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];
const BS_MONTHS_NP = ['वैशाख', 'जेठ', 'असार', 'श्रावण', 'भदौ', 'आश्विन', 'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फाल्गुन', 'चैत'];
const pad = (n) => String(n).padStart(2, '0');
const isValidDate = (date) => date instanceof Date && Number.isFinite(date.getTime());
const kathmanduDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (!isValidDate(date)) return null;
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kathmandu', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(date);
  const part = (type) => Number(parts.find((item) => item.type === type)?.value);
  return new Date(part('year'), part('month') - 1, part('day'));
};

export function toBS(value) {
  const date = kathmanduDate(value);
  if (!isValidDate(date)) return null;
  try { const bs = new NepaliDate(date); return dateConfigMap[bs.getYear()] ? bs.format('YYYY-MM-DD') : null; } catch { return null; }
}

export function fromBS(value) {
  value = normalizeDigits(value);
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  try {
    const bs = new NepaliDate(value);
    const fields = bs.getBS();
    if (!dateConfigMap[fields.year]) return null;
    if (`${fields.year}-${pad(fields.month + 1)}-${pad(fields.date)}` !== value) return null;
    const date = bs.toJsDate();
    return isValidDate(date) ? date : null;
  } catch { return null; }
}

export function bsToday() { return toBS(new Date()); }

export function formatBS(value, format = 'long', lang = 'en') {
  const date = kathmanduDate(value);
  if (!isValidDate(date)) return '—';
  try {
    const bs = new NepaliDate(date);
    const parts = bs.getBS();
    if (format === 'year') return bs.format('YYYY', lang === 'np' ? 'np' : 'en');
    if (format === 'month') return `${bs.format('MMMM', lang === 'np' ? 'np' : 'en')} ${bs.format('YYYY', lang === 'np' ? 'np' : 'en')}`;
    if (format === 'short') return `${bs.format('DD', lang === 'np' ? 'np' : 'en')} ${lang === 'np' ? BS_MONTHS_NP[parts.month] : BS_MONTHS_EN[parts.month]}`;
    return `${bs.format('YYYY', lang === 'np' ? 'np' : 'en')} ${lang === 'np' ? BS_MONTHS_NP[parts.month] : BS_MONTHS_EN[parts.month]} ${bs.format('D', lang === 'np' ? 'np' : 'en')}`;
  } catch { return '—'; }
}

export function bsFormatInput(value) { return toBS(value) || ''; }

export function bsToIso(value) {
  const date = fromBS(value);
  if (!date) return null;
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
}

export function isoToBsInput(value) { return value ? toBS(value) || '' : ''; }

export function normalizeDigits(value) {
  return String(value ?? '').replace(/[०-९]/g, (digit) => String('०१२३४५६७८९'.indexOf(digit)));
}

export function formatAmount(value, lang = 'en', currency = 'Rs.') {
  return `${currency} ${formatNumber(value, lang)}`;
}

export function formatNumber(value, lang = 'en') {
  const formatted = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(value || 0));
  return lang === 'np' ? formatted.replace(/\d/g, (digit) => '०१२३४५६७८९'[Number(digit)]) : formatted;
}

export { BS_MONTHS_EN, BS_MONTHS_NP };
