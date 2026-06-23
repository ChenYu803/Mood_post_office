require('dotenv').config();
const mongoose = require('mongoose');
const Note = require('./models/Note');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  const r1 = await Note.updateMany(
    { status: '日志' },
    { $set: { status: '思绪阁楼' } }
  );
  console.log(`日志 → 思绪阁楼: ${r1.modifiedCount} documents updated`);

  const r2 = await Note.updateMany(
    { status: '悬置' },
    { $set: { status: '思绪阁楼' } }
  );
  console.log(`悬置 → 思绪阁楼: ${r2.modifiedCount} documents updated`);

  const happyNotes = await Note.find({ status: '纪念', emotion: { $in: ['开心', '感动'] } });
  if (happyNotes.length > 0) {
    const happyIds = happyNotes.map(n => n._id);
    const r3 = await Note.updateMany(
      { _id: { $in: happyIds } },
      { $set: { status: '留声匣' } }
    );
    console.log(`纪念 (开心/感动) → 留声匣: ${r3.modifiedCount} documents updated`);
  } else {
    console.log('纪念 (开心/感动) → 留声匣: 0 documents updated');
  }

  const otherNotes = await Note.find({ status: '纪念', emotion: { $nin: ['开心', '感动'] } });
  if (otherNotes.length > 0) {
    const otherIds = otherNotes.map(n => n._id);
    const r4 = await Note.updateMany(
      { _id: { $in: otherIds } },
      { $set: { status: '流星信箱' } }
    );
    console.log(`纪念 (其他) → 流星信箱: ${r4.modifiedCount} documents updated`);
  } else {
    console.log('纪念 (其他) → 流星信箱: 0 documents updated');
  }

  await mongoose.disconnect();
  console.log('Migration completed');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
