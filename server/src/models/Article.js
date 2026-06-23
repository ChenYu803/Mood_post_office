const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  cover: { type: String, default: '' },
  summary: { type: String, maxlength: 200 },
  content: { type: String, required: true },
  emotion: { type: String, enum: ['全部', '开心', '平静', '焦虑', '愤怒', '难过', '感动', '迷茫'] },
  category: { type: String, default: '情绪管理' },
  readCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  status: { type: String, enum: ['草稿', '已发布', 'pending', '已下架'], default: '已发布' },
  author: { type: String, default: '官方' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

articleSchema.index({ emotion: 1, status: 1 });
articleSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Article', articleSchema);