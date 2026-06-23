const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  treeholeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Treehole' },
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  anonymousCode: { type: String },
  content: { type: String, required: true, maxlength: 300 },
  status: { type: String, enum: ['待审核', '已发布', '已驳回'], default: '待审核' },
  createdAt: { type: Date, default: Date.now }
});

commentSchema.index({ treeholeId: 1, status: 1, createdAt: -1 });
commentSchema.index({ articleId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);