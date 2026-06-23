const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const readingHistorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true, enum: ['article', 'treehole'] },
  title: { type: String, default: '' },
  emotion: { type: String, default: '' },
  readAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
  uid: { type: String, unique: true, sparse: true },
  username: { type: String, required: true, unique: true, minlength: 3, maxlength: 20 },
  password: { type: String, required: true, minlength: 6 },
  email: { type: String, sparse: true },
  nickname: { type: String, maxlength: 30 },
  avatar: { type: String, default: '' },
  signature: { type: String, maxlength: 100, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  loginFailCount: { type: Number, default: 0 },
  lockUntil: { type: Date },
  privacySettings: {
    allowViewWishwall: { type: Boolean, default: true }
  },
  likedArticles: { type: [String], default: [] },
  likedTreeholes: { type: [String], default: [] },
  bookmarkedArticles: { type: [String], default: [] },
  bookmarkedTreeholes: { type: [String], default: [] },
  bookmarkedArticlesDelisted: { type: [String], default: [] },
  bookmarkedTreeholesDelisted: { type: [String], default: [] },
  readingHistory: { type: [readingHistorySchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (!this.uid) {
    const crypto = require('crypto');
    this.uid = crypto.randomBytes(6).toString('hex').toUpperCase();
  }
  this.updatedAt = Date.now();
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.loginFailCount;
  delete obj.lockUntil;
  delete obj.uid;
  return obj;
};

module.exports = mongoose.model('User', userSchema);