import { Router } from 'express';
import { verifyJWT, requireAdmin } from '../middlewares/auth.middleware.js';
import { createActivityEvent, getActivityLogs } from '../controllers/activity.controller.js';

const activityRouter = Router();
activityRouter.get('/', verifyJWT, requireAdmin, getActivityLogs);
activityRouter.post('/event', verifyJWT, createActivityEvent);
export default activityRouter;
