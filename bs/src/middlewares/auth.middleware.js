import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { findSysUser } from '../controllers/user.controller.js';
import { recordActivity } from '../services/activityLog.js';

const verifyJWT = asyncHandler(async (req, _res, next) => {
  try {
    const token = req?.cookies?.accessToken || req?.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new ApiError(401, 'Unauthorized request');
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await findSysUser({ id: decodedToken?.id });
    if (!user.length || user[0].isActive === false) throw new ApiError(401, 'Unauthorized request');
    // Role and active state come from Mongo on every request, so a role change
    // takes effect immediately even while an old JWT remains valid.
    req.user = user[0];
    next();
  } catch (error) { throw new ApiError(401, error?.message || 'Invalid request'); }
});

const requireAdmin = asyncHandler(async (req, _res, next) => {
  if (req.user?.role === 'admin') return next();
  void recordActivity({ action: 'denied', module: req.originalUrl.split('/').filter(Boolean)[2] || 'system', userId: req.user?.id, username: req.user?.name, role: req.user?.role, entityId: req.params?.id || req.params?.customerId || req.params?.staff_id, description: `Permission denied for ${req.method} ${req.originalUrl.split('?')[0]}`, ip: req.ip, userAgent: req.get('user-agent') });
  req.activityLogged = true;
  throw new ApiError(403, 'Forbidden');
});

export { verifyJWT, requireAdmin };
