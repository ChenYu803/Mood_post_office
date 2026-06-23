const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const treeholeRoutes = require('./routes/treehole');
const articleRoutes = require('./routes/articles');
const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');

const app = express();

app.use(cors());
app.use(express.json());

const dbStates = {
  0: '已断开',
  1: '已连接',
  2: '正在连接',
  3: '正在断开'
};

app.get('/api/health', (req, res) => {
  const readyState = mongoose.connection.readyState;
  res.json({
    code: 200,
    message: '服务正常运行',
    database: {
      status: readyState,
      statusText: dbStates[readyState] || '未知'
    }
  });
});

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  handler: (req, res) => {
    console.warn(`[限流] 请求被拦截: ${req.method} ${req.url}`);
    res.status(429).json({ code: 429, message: '请求过于频繁，请稍后再试' });
  }
});
// app.use('/api/', limiter);

const db = mongoose.connection;

db.on('connected', () => {
  console.log('[MongoDB] 连接成功');
});

db.on('disconnected', () => {
  console.warn('[MongoDB] 连接断开！数据将无法读取');
});

db.on('reconnected', () => {
  console.log('[MongoDB] 重新连接成功');
});

db.on('error', (err) => {
  console.error('[MongoDB] 连接错误:', err.message);
});

mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000
}).catch(err => {
  console.error('[MongoDB] 初始连接失败:', err.message);
  process.exit(1);
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/treehole', treeholeRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ code: 500, message: '服务器内部错误' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});