const mongoose = require('mongoose');

const operationLogSchema = new mongoose.Schema({
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  operatorUid: { type: String },
  action: { type: String, required: true },
  targetType: { type: String },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  detail: { type: String },
  result: { type: String },
  createdAt: { type: Date, default: Date.now }
});

operationLogSchema.index({ operatorId: 1, createdAt: -1 });
operationLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('OperationLog', operationLogSchema);
