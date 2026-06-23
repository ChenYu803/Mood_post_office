const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetType: { type: String, enum: ['treehole', 'article'], required: true },
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reporterUid: { type: String, required: true },
  reason: { type: String, required: true, maxlength: 200 },
  status: { type: String, enum: ['待处理', '已采纳', '不予采纳'], default: '待处理' },
  createdAt: { type: Date, default: Date.now }
});

reportSchema.index({ targetType: 1, status: 1, createdAt: -1 });
reportSchema.index({ reporterId: 1 });

module.exports = mongoose.model('Report', reportSchema);
