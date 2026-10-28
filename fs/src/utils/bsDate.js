import NepaliDateModule, { dateConfigMap as converterDateConfigMap } from 'nepali-date-converter';

const NepaliDate = NepaliDateModule.default || NepaliDateModule;
// Vite exposes the converter's calendar table as a named export. Reading it
// from the default import silently produces an empty table in the browser.
const dateConfigMap = converterDateConfigMap;
const BS_MONTHS_EN = ['Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];
const BS_MONTHS_NP = ['वैशाख', 'जेठ', 'असार', 'श्रावण', 'भदौ', 'आश्विन', 'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फाल्गुन', 'चैत'];
const pad = (n) => String(n).padStart(2, '0');
const supportedYears = Object.keys(dateConfigMap).map(Number).filter(Number.isFinite);
const minBSYear = Math.min(...supportedYears);
const maxBSYear = Math.max(...supportedYears);
const devDigits = '०१२३४५६७८९';
const EN_MONTHS = Object.fromEntries(BS_MONTHS_EN.map((name, i) => [name.toLowerCase(), i + 1]));
const NP_MONTHS = Object.fromEntries(BS_MONTHS_NP.map((name, i) => [name, i + 1]));

export function normalizeDigits(value) {
  return String(value ?? '').replace(/[०-९]/g, (digit) => String(devDigits.indexOf(digit)));
}

export function parseBSInput(input) {
  if (typeof input !== 'string') return null;
  let value = input.trim();
  if (!value) return null;
  value = normalizeDigits(value).replace(/[/.]/g, '-').replace(/\s+/g, ' ');
  let match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  match = value.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (match) return { year: Number(match[3]), month: Number(match[2]), day: Number(match[1]) };
  const named = value.match(/^(\d{4})\s+([^\d\s]+)\s+(\d{1,2})$/u);
  if (named) {
    const monthName = named[2].toLowerCase();
    const month = EN_MONTHS[monthName] || NP_MONTHS[named[2]];
    return month ? { year: Number(named[1]), month, day: Number(named[3]) } : null;
  }
  return null;
}

export function validateBSInput(input, { required = false, min, max } = {}) {
  if (input == null || input === '') return required ? 'required' : null;
  const parsed = typeof input === 'object' && input && 'year' in input ? input : parseBSInput(input);
  if (!parsed) return 'format';
  if (parsed.year < minBSYear || parsed.year > maxBSYear) return 'range';
  if (!isValidBS(parsed.year, parsed.month, parsed.day)) return 'invalid';
  const iso = bsToISO(parsed);
  if (!iso) return 'invalid';
  if (min && iso < normalizeISODate(min)) return 'min';
  if (max && iso > normalizeISODate(max)) return 'max';
  return null;
}

export function isValidBS(year, month, day) {
  year = Number(year); month = Number(month); day = Number(day);
  const daysInMonth = Number.isInteger(month) ? Object.values(dateConfigMap[year] || {})[month - 1] : 0;
  return Number.isInteger(year) && year >= minBSYear && year <= maxBSYear && Number.isInteger(month) && month >= 1 && month <= 12 && Number.isInteger(day) && day >= 1 && day <= daysInMonth;
}

export function bsToISO(value) {
  const parsed = typeof value === 'object' && value && 'year' in value ? value : parseBSInput(value);
  if (!parsed || !isValidBS(parsed.year, parsed.month, parsed.day)) return null;
  try {
    // The converter's string constructor differs between CJS and Vite ESM interop.
    // Set BS parts on an instance, then return date-only Gregorian UTC data.
    const bs = new NepaliDate(new Date(2000, 0, 1, 12));
    bs.setYear(parsed.year);
    bs.setMonth(parsed.month - 1);
    bs.setDate(parsed.day);
    const ad = bs.getAD();
    const result = `${String(ad.year).padStart(4, '0')}-${pad(ad.month + 1)}-${pad(ad.date)}`;
    return isISODate(result) ? result : null;
  } catch { return null; }
}

export function normalizeISODate(value) {
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) return '';
    return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`;
  }
  if (typeof value !== 'string') return '';
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);
  if (!match) return '';
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day
    ? `${match[1]}-${match[2]}-${match[3]}` : '';
}

export function isISODate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && normalizeISODate(value) === value;
}

export function isoToBS(value) {
  const iso = normalizeISODate(value);
  if (!iso) return null;
  const [year, month, day] = iso.split('-').map(Number);
  try {
    // Noon avoids crossing calendar days when the library reads local Date fields.
    const bs = new NepaliDate(new Date(year, month - 1, day, 12));
    const fields = bs.getBS();
    if (!dateConfigMap[fields.year]) return null;
    return `${fields.year}-${pad(fields.month + 1)}-${pad(fields.date)}`;
  } catch { return null; }
}

export function toBS(value) { return isoToBS(value); }
export function fromBS(value) {
  const iso = bsToISO(value);
  return iso ? new Date(`${iso}T00:00:00.000Z`) : null;
}
export function todayISO(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kathmandu', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const ad = `${parts.find((part) => part.type === 'year')?.value}-${parts.find((part) => part.type === 'month')?.value}-${parts.find((part) => part.type === 'day')?.value}`;
  return isISODate(ad) ? ad : '';
}
export function bsToday(now = new Date()) { return todayISO(now); }
export function addDaysISO(iso, amount) {
  if (!isISODate(iso) || !Number.isInteger(amount)) return '';
  const date = new Date(`${iso}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return normalizeISODate(date);
}
export function defaultBSRange(granularity = 'day', now = new Date()) {
  const to = todayISO(now);
  if (!to) return { from: '', to: '' };
  if (granularity === 'day') return { from: addDaysISO(to, -29), to };
  const current = parseBSInput(isoToBS(to));
  if (!current) return { from: '', to };
  if (granularity === 'month') {
    const absoluteMonth = current.year * 12 + current.month - 1 - 11;
    const year = Math.floor(absoluteMonth / 12);
    const month = ((absoluteMonth % 12) + 12) % 12 + 1;
    return { from: bsToISO({ year, month, day: 1 }) || '', to };
  }
  const year = current.year - 4;
  return { from: bsToISO({ year, month: 1, day: 1 }) || '', to };
}
// Legacy call-site name retained while forms move over. Form values are ISO
// only; BS display strings must go through bsToISO explicitly at the boundary.
export function bsToIso(value) { return isISODate(value) ? value : null; }
export function isoToBsInput(value) { return isoToBS(value) || ''; }
export function normalizeBSInput(value) {
  const parsed = parseBSInput(value);
  if (!parsed || validateBSInput(parsed)) return '';
  return `${parsed.year}-${pad(parsed.month)}-${pad(parsed.day)}`;
}

export function formatBS(value, format = 'long', lang = 'en') {
  const iso = value instanceof Date || (typeof value === 'string' && value.includes('T'))
    ? (() => {
      const date = value instanceof Date ? value : new Date(value);
      if (!Number.isFinite(date.getTime())) return '';
      const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kathmandu', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
      return `${parts.find((part) => part.type === 'year')?.value}-${parts.find((part) => part.type === 'month')?.value}-${parts.find((part) => part.type === 'day')?.value}`;
    })()
    : normalizeISODate(value);
  if (!iso) return '—';
  const [year, month, day] = iso.split('-').map(Number);
  try {
    const bs = new NepaliDate(new Date(year, month - 1, day, 12));
    const parts = bs.getBS();
    const monthName = lang === 'np' ? BS_MONTHS_NP[parts.month] : BS_MONTHS_EN[parts.month];
    const num = (value) => lang === 'np' ? String(value).replace(/\d/g, (digit) => devDigits[Number(digit)]) : String(value);
    if (format === 'input') return `${num(parts.year)}-${num(pad(parts.month + 1))}-${num(pad(parts.date))}`;
    if (format === 'year') return num(parts.year);
    if (format === 'month') return `${monthName} ${num(parts.year)}`;
    if (format === 'short') return `${num(parts.date)} ${monthName}`;
    return `${num(parts.year)} ${monthName} ${num(parts.date)}`;
  } catch { return '—'; }
}

export function formatAmount(value, lang = 'en', currency = null) {
  const sym = currency || (lang === 'np' ? 'रु.' : 'Rs.');
  return `${sym} ${formatNumber(value, lang)}`;
}
export function formatNumber(value, lang = 'en') {
  const formatted = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(value || 0));
  return lang === 'np' ? formatted.replace(/\d/g, (digit) => devDigits[Number(digit)]) : formatted;
}
export function dateBounds() { return { minBSYear, maxBSYear }; }

export { BS_MONTHS_EN, BS_MONTHS_NP };
