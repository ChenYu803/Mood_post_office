// 为所有现有用户生成唯一uid的迁移脚本
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[MongoDB] 连接成功');

    const User = mongoose.model('User', new mongoose.Schema({
      uid: { type: String, unique: true, sparse: true },
      username: String,
    }));

    const users = await User.find({ uid: { $exists: false } });
    console.log(`找到 ${users.length} 个需要分配uid的用户`);

    let success = 0;
    for (const user of users) {
      try {
        let uid;
        let exists = true;
        // 确保uid唯一
        while (exists) {
          uid = crypto.randomBytes(6).toString('hex').toUpperCase();
          exists = !!(await User.findOne({ uid }));
        }
        user.uid = uid;
        await user.save({ validateBeforeSave: false });
        success++;
        console.log(`用户 ${user.username} 分配uid: ${uid}`);
      } catch (e) {
        console.error(`用户 ${user.username} uid分配失败:`, e.message);
      }
    }

    console.log(`\n迁移完成: 成功 ${success}/${users.length}`);
    process.exit(0);
  } catch (error) {
    console.error('迁移失败:', error);
    process.exit(1);
  }
}

migrate();
