const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { auth } = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { content, emotion, intensity, status, story, reminderDate } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ code: 400, message: '内容不能为空' });
    }

    if (content.length > 800) {
      return res.status(400).json({ code: 400, message: '内容不能超过800字' });
    }

    if (!emotion) {
      return res.status(400).json({ code: 400, message: '请选择情绪标签' });
    }

    const note = new Note({
      userId: req.user._id,
      content: content.trim(),
      emotion,
      intensity: intensity || 50,
      status: status || '思绪阁楼',
      story: story || '',
      reminderDate: reminderDate || null
    });

    await note.save();
    res.status(201).json({ code: 201, message: '保存成功', data: note });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ code: 500, message: '保存失败' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { status, emotion, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    const query = { userId: req.user._id };
    
    if (status) query.status = status;
    if (emotion) query.emotion = emotion;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [notes, total] = await Promise.all([
      Note.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Note.countDocuments(query)
    ]);

    res.json({ 
      code: 200, 
      data: { notes, total, page: parseInt(page), limit: parseInt(limit) } 
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

router.get('/stats/summary', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { days } = req.query;
    
    const query = { userId };
    if (days) {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(days));
      query.createdAt = { $gte: date };
    }
    
    const byEmotion = await Note.aggregate([
      { $match: query },
      { $group: { _id: '$emotion', count: { $sum: 1 } } }
    ]);

    const result = {};
    byEmotion.forEach(item => {
      result[item._id] = item.count;
    });

    res.json({ 
      code: 200, 
      data: result 
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取统计失败' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ code: 404, message: '便签不存在' });
    }
    res.json({ code: 200, data: note });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { content, emotion, intensity, status, story, reminderDate } = req.body;
    
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ code: 404, message: '便签不存在' });
    }

    if (content) note.content = content;
    if (emotion) note.emotion = emotion;
    if (intensity !== undefined) note.intensity = intensity;
    if (status) note.status = status;
    if (story !== undefined) note.story = story;
    if (reminderDate !== undefined) note.reminderDate = reminderDate;
    note.updatedAt = Date.now();

    await note.save();
    res.json({ code: 200, message: '更新成功', data: note });
  } catch (error) {
    res.status(500).json({ code: 500, message: '更新失败' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ code: 404, message: '便签不存在' });
    }
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '删除失败' });
  }
});

module.exports = router;