import connectMongo from '../db/mongo.js';
import ActivityLog from '../models/activityLog.model.js';

const SECRET_KEY = /password|token|secret|authorization|cookie/i;
const SENSITIVE_KEY = /password|token|secret|authorization|cookie|idproof|phone|email|address|emergency/i;
const safeValue = (key, value) => {
  if (SECRET_KEY.test(key)) return undefined;
  if (SENSITIVE_KEY.test(key) && value != null && value !== '') return '••••';
  if (Array.isArray(value)) return value.map((item) => safeValue('', item));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, safeValue(childKey, child)]).filter(([, child]) => child !== undefined));
  return value;
};
const safeObject = (value) => value && typeof value === 'object' ? safeValue('', value) : value;

export const buildActivityDiff = (before, after) => {
  const diff = {};
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  for (const key of keys) {
    if (SECRET_KEY.test(key) || key === '_id' || key === '__v' || key === 'updatedAt') continue;
    const oldValue = before?.[key]; const newValue = after?.[key];
    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) continue;
    diff[key] = { before: safeValue(key, oldValue), after: safeValue(key, newValue) };
  }
  return diff;
};

export async function recordActivity(entry) {
  try {
    await connectMongo();
    await ActivityLog.create({
      timestamp: new Date(), userId: entry.userId, username: entry.username || 'Unknown', role: entry.role || 'operator',
      action: entry.action, module: entry.module || 'system', entityId: entry.entityId,
      entityName: entry.entityName, description: String(entry.description || entry.action).slice(0, 500),
      ip: entry.ip, userAgent: entry.userAgent, diff: safeObject(entry.diff), snapshot: safeObject(entry.snapshot)
    });
  } catch { console.error('Activity log write failed'); }
}

export function captureActivity(req, res, next) {
  res.on('finish', () => {
    if (req.activityLogged) return;
    const method = req.method.toUpperCase();
    const path = req.originalUrl.split('?')[0];
    let action;
    if (/\/login$/.test(path) && method === 'POST') action = 'login';
    else if (/\/logout$/.test(path) && method === 'POST' && res.statusCode < 400) action = 'logout';
    else if (/\/(reset-password|change-password)$/.test(path) && method === 'POST' && res.statusCode < 400) action = 'password_reset';
    else if (/\/users\/\d+$/.test(path) && method === 'PATCH' && res.statusCode < 400 && req.body?.role) action = 'role_change';
    else if (res.statusCode === 403) action = 'denied';
    else if (/\/(download|pdf)(\/|$)/i.test(path) && method === 'GET' && res.statusCode < 400) action = 'download';
    else if (method === 'POST' && res.statusCode < 400) action = 'create';
    else if (['PUT', 'PATCH'].includes(method) && res.statusCode < 400) action = 'update';
    else if (method === 'DELETE' && res.statusCode < 400) action = 'delete';
    if (!action || path.startsWith('/api/logs')) return;
    const module = path.split('/').filter(Boolean)[2] || 'system';
    const body = safeObject(req.body || {});
    const actor = req.user || req.activityActor || {};
    const userId = actor.id;
    const username = actor.name || actor.email || (action === 'login' || action === 'denied' ? String(req.body?.phone_number || 'Unknown') : 'Unknown');
    const outcome = action === 'login' ? (res.statusCode < 400 ? 'successful login' : 'failed login') : `${action} ${module} (${res.statusCode})`;
    void recordActivity({ action, module, userId, username, role: actor.role, entityId: req.activityDetails?.entityId || req.params?.customerId || req.params?.staff_id || req.params?.billing_id || req.params?.id, entityName: req.activityDetails?.entityName || body.name || body.description || body.title, description: outcome, ip: req.ip, userAgent: req.get('user-agent'), diff: req.activityDetails?.diff || (['update', 'role_change'].includes(action) ? { submittedFields: Object.keys(body) } : undefined), snapshot: req.activityDetails?.snapshot });
  });
  next();
}
