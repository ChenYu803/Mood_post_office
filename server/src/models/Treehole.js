const mongoose = require('mongoose');

const treeholeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  anonymousCode: { type: String, required: true },
  content: { type: String, required: true, maxlength: 500 },
  emotion: { type: String, enum: ['开心', '平静', '焦虑', '愤怒', '难过', '感动', '迷茫'], required: true },
  status: { type: String, enum: ['待审核', '已发布', '已驳回', '已下架'], default: '待审核' },
  isAnonymous: { type: Boolean, default: true },
  rejectReason: { type: String, default: '' },
  commentCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

treeholeSchema.index({ status: 1, createdAt: -1 });
treeholeSchema.index({ emotion: 1 });

module.exports = mongoose.model('Treehole', treeholeSchema);