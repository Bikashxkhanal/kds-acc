import connectMongo from '../db/mongo.js';
import ActivityLog from '../models/activityLog.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { recordActivity } from '../services/activityLog.js';
import { parseISODate } from '../utils/isoDate.js';

export const createActivityEvent = asyncHandler(async (req, res) => {
  if (req.body?.action !== 'print') return res.status(400).json({ message: 'Unsupported activity event' });
  await recordActivity({ action: 'print', module: 'billings', userId: req.user.id, username: req.user.name, role: req.user.role, entityId: String(req.body.entityId || '').slice(0, 100), description: 'Printed invoice', ip: req.ip, userAgent: req.get('user-agent') });
  res.status(201).json(new ApiResponse(201, 'Activity recorded'));
});

export const getActivityLogs = asyncHandler(async (req, res) => {
  await connectMongo();
  const page = Math.max(1, Number(req.query.page) || 1);
  const exporting = req.query.export === '1';
  const limit = exporting ? 10000 : Math.min(100, Math.max(1, Number(req.query.limit) || 30));
  const filter = {};
  if (req.query.userId) {
    const userId = Number(req.query.userId);
    if (!Number.isInteger(userId) || userId < 1) return res.status(400).json({ message: 'Invalid user filter' });
    filter.userId = userId;
  }
  if (['create', 'update', 'delete', 'login', 'logout', 'download', 'print', 'denied', 'role_change', 'password_reset'].includes(req.query.action)) filter.action = req.query.action;
  if (req.query.module) filter.module = String(req.query.module).slice(0, 80);
  if (req.query.from || req.query.to) {
    filter.timestamp = {};
    let startDate;
    let endDate;
    if (req.query.from) {
      const start = parseISODate(req.query.from, 'from');
      filter.timestamp.$gte = start; startDate = start;
    }
    if (req.query.to) {
      const end = parseISODate(req.query.to, 'to');
      endDate = end;
      filter.timestamp.$lt = new Date(end.getTime() + 86400000);
    }
    if (startDate && endDate && startDate > endDate) return res.status(400).json({ message: 'Date range is reversed' });
  }
  if (req.query.q) {
    const term = String(req.query.q).slice(0, 120).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ username: { $regex: term, $options: 'i' } }, { description: { $regex: term, $options: 'i' } }, { entityName: { $regex: term, $options: 'i' } }];
  }
  const [rows, total] = await Promise.all([ActivityLog.find(filter).sort({ timestamp: -1 }).skip(exporting ? 0 : (page - 1) * limit).limit(limit).lean(), ActivityLog.countDocuments(filter)]);
  res.json(new ApiResponse(200, 'Activity log loaded', { rows, total, page, pages: Math.max(1, Math.ceil(total / limit)) }));
});
