require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  const existingAdmin = await User.findOne({ username: 'admin' });
  if (existingAdmin) {
    console.log('管理员账号已存在');
    console.log('用户名: admin');
    console.log('密码: admin123');
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = new User({
    username: 'admin',
    password: hashedPassword,
    nickname: '管理员',
    role: 'admin',
    signature: '心事邮局管理员'
  });

  await admin.save();
  console.log('管理员账号创建成功！');
  console.log('用户名: admin');
  console.log('密码: admin123');
  console.log('');
  console.log('请登录后在"个人中心"找到"审核中心"入口');

  await mongoose.disconnect();
}

createAdmin().catch(err => {
  console.error('创建失败:', err);
  process.exit(1);
});
