import { ApiError } from './ApiError.js';

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseISODate(value, field, { required = true } = {}) {
  if ((value == null || value === '') && !required) return undefined;
  const match = typeof value === 'string' && value.match(DATE_ONLY);
  if (!match) throw new ApiError(400, `${field} must be an ISO date in YYYY-MM-DD format`, [{ field, code: 'invalid_date' }]);
  const [, yyyy, mm, dd] = match;
  const year = Number(yyyy), month = Number(mm), day = Number(dd);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (year < 1900 || year > 2100 || date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) {
    throw new ApiError(400, `${field} is not a valid calendar date`, [{ field, code: 'invalid_date' }]);
  }
  return date;
}

export function isISODate(value) {
  try { parseISODate(value, 'date'); return true; } catch { return false; }
}
