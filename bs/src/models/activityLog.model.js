import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, immutable: true },
  userId: { type: Number, immutable: true },
  username: { type: String, immutable: true },
  role: { type: String, immutable: true },
  action: { type: String, enum: ['create', 'update', 'delete', 'login', 'logout', 'download', 'print', 'denied', 'role_change', 'password_reset'], required: true, immutable: true },
  module: { type: String, required: true, immutable: true },
  entityId: { type: String, immutable: true },
  entityName: { type: String, immutable: true },
  description: { type: String, required: true, immutable: true },
  ip: { type: String, immutable: true },
  userAgent: { type: String, immutable: true },
  diff: { type: mongoose.Schema.Types.Mixed, immutable: true },
  snapshot: { type: mongoose.Schema.Types.Mixed, immutable: true },
  isDummy: { type: Boolean, default: false, index: true }
}, { collection: 'activitylogs', versionKey: false });

activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ userId: 1, action: 1, module: 1, timestamp: -1 });
export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
