import NepaliDateModule from 'nepali-date-converter';
const NepaliDate = NepaliDateModule.default || NepaliDateModule;
const dateConfigMap = NepaliDateModule.dateConfigMap || NepaliDateModule.default?.dateConfigMap || {};

const pad = (value) => String(value).padStart(2, '0');
export function parseBS(value) {
  value = String(value || '').replace(/[०-९]/g, (digit) => String('०१२३४५६७८९'.indexOf(digit)));
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  try {
    const date = new NepaliDate(value);
    const fields = date.getBS();
    if (!dateConfigMap[fields.year]) return null;
    if (`${fields.year}-${pad(fields.month + 1)}-${pad(fields.date)}` !== value) return null;
    const ad = date.getAD();
    return new Date(Date.UTC(ad.year, ad.month, ad.date));
  } catch { return null; }
}
export function formatBS(value, format = 'long', lang = 'en') {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return '—';
  try {
    const bs = new NepaliDate(date);
    if (format === 'year') return bs.format('YYYY', lang);
    if (format === 'month') return bs.format('MMMM YYYY', lang);
    return bs.format('YYYY MMMM D', lang);
  } catch { return '—'; }
}
export function bsKey(value) { return new NepaliDate(value).format('YYYY-MM-DD'); }
