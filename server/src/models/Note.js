const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 800 },
  emotion: { type: String, enum: ['开心', '平静', '焦虑', '愤怒', '难过', '感动', '迷茫'], required: true },
  intensity: { type: Number, min: 0, max: 100, default: 50 },
  status: { type: String, enum: ['思绪阁楼', '流星信箱', '留声匣'], required: true, default: '思绪阁楼' },
  story: { type: String, maxlength: 200, default: '' },
  reminderDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ emotion: 1 });
noteSchema.index({ status: 1 });

module.exports = mongoose.model('Note', noteSchema);