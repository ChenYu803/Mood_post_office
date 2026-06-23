const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Note = require('../models/Note');
const Treehole = require('../models/Treehole');
const Comment = require('../models/Comment');
const Article = require('../models/Article');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ code: 200, data: user });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

router.get('/notes', auth, async (req, res) => {
  try {
    const { status, emotion, page = 1, limit = 50 } = req.query;
    const query = { userId: req.user._id };
    
    if (status) query.status = status;
    if (emotion) query.emotion = emotion;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [notes, total] = await Promise.all([
      Note.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Note.countDocuments(query)
    ]);

    res.json({ code: 200, data: { notes, total } });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

router.get('/treeholes', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [treeholes, total] = await Promise.all([
      Treehole.find({ userId: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Treehole.countDocuments({ userId: req.user._id })
    ]);

    res.json({ code: 200, data: { treeholes, total } });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

router.get('/export', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        username: req.user.username,
        nickname: req.user.nickname
      },
      notes: notes.map(n => ({
        content: n.content,
        emotion: n.emotion,
        intensity: n.intensity,
        status: n.status,
        story: n.story,
        createdAt: n.createdAt
      })),
      totalCount: notes.length
    };

    res.json({ code: 200, data: exportData });
  } catch (error) {
    res.status(500).json({ code: 500, message: '导出失败' });
  }
});

router.delete('/account', auth, async (req, res) => {
  try {
    await Promise.all([
      Note.deleteMany({ userId: req.user._id }),
      Treehole.deleteMany({ userId: req.user._id }),
      Comment.deleteMany({ userId: req.user._id }),
      User.findByIdAndDelete(req.user._id)
    ]);

    res.json({ code: 200, message: '账号已删除' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '删除失败' });
  }
});

router.get('/admin/users', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments()
    ]);

    res.json({ code: 200, data: { users, total } });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

router.get('/admin/pending/treeholes', auth, adminAuth, async (req, res) => {
  try {
    const treeholes = await Treehole.find({ status: '待审核' }).sort({ createdAt: 1 });
    res.json({ code: 200, data: treeholes });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

router.get('/admin/pending/comments', auth, adminAuth, async (req, res) => {
  try {
    const comments = await Comment.find({ 
      status: '待审核',
      treeholeId: { $exists: true }
    })
    .populate('userId', 'nickname')
    .sort({ createdAt: 1 });
    res.json({ code: 200, data: comments });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

router.put('/admin/treeholes/:id/review', auth, adminAuth, async (req, res) => {
  try {
    const { status, rejectReason } = req.body;
    const treehole = await Treehole.findByIdAndUpdate(
      req.params.id,
      { status, rejectReason: rejectReason || '', updatedAt: Date.now() },
      { new: true }
    );

    if (!treehole) {
      return res.status(404).json({ code: 404, message: '内容不存在' });
    }

    res.json({ code: 200, message: '审核完成', data: treehole });
  } catch (error) {
    res.status(500).json({ code: 500, message: '操作失败' });
  }
});

router.put('/admin/comments/:id/review', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ code: 404, message: '评论不存在' });
    }

    if (status === '已发布' && comment.treeholeId) {
      await Treehole.findByIdAndUpdate(comment.treeholeId, { $inc: { commentCount: 1 } });
    }

    res.json({ code: 200, message: '审核完成', data: comment });
  } catch (error) {
    res.status(500).json({ code: 500, message: '操作失败' });
  }
});

router.get('/bookmarks', auth, async (req, res) => {
  try {
    const { type } = req.query;
    const user = await User.findById(req.user._id);
    
    if (type === 'article') {
      const articleIds = user.bookmarkedArticles || [];
      const delistedIds = user.bookmarkedArticlesDelisted || [];
      const articles = await Article.find({
        _id: { $in: articleIds },
        status: { $in: ['已发布', '已下架'] }
      }).sort({ createdAt: -1 });
      const result = articles.map(a => ({
        ...a.toObject(),
        delisted: delistedIds.includes(a._id.toString())
      }));
      res.json({ code: 200, data: result });
    } else if (type === 'treehole') {
      const treeholeIds = user.bookmarkedTreeholes || [];
      const delistedIds = user.bookmarkedTreeholesDelisted || [];
      const treeholes = await Treehole.find({ 
        _id: { $in: treeholeIds }, 
        status: { $in: ['已发布', '已下架'] }
      }).sort({ createdAt: -1 });
      const result = treeholes.map(t => ({
        ...t.toObject(),
        delisted: delistedIds.includes(t._id.toString())
      }));
      res.json({ code: 200, data: result });
    } else {
      res.status(400).json({ code: 400, message: '请指定类型' });
    }
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

router.delete('/bookmarks/:type/:id', auth, async (req, res) => {
  try {
    const { type, id } = req.params;
    const user = await User.findById(req.user._id);
    
    if (type === 'article') {
      user.bookmarkedArticles = (user.bookmarkedArticles || []).filter(
        articleId => articleId.toString() !== id
      );
      user.bookmarkedArticlesDelisted = (user.bookmarkedArticlesDelisted || []).filter(
        articleId => articleId.toString() !== id
      );
    } else if (type === 'treehole') {
      user.bookmarkedTreeholes = (user.bookmarkedTreeholes || []).filter(
        treeholeId => treeholeId.toString() !== id
      );
      user.bookmarkedTreeholesDelisted = (user.bookmarkedTreeholesDelisted || []).filter(
        treeholeId => treeholeId.toString() !== id
      );
    } else {
      return res.status(400).json({ code: 400, message: '类型错误' });
    }
    
    await user.save();
    res.json({ code: 200, message: '取消收藏成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '操作失败' });
  }
});

router.get('/reading-history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const history = (user.readingHistory || []).slice(0, 100);
    
    const result = await Promise.all(history.map(async item => {
      if (item.type === 'article') {
        const article = await Article.findById(item.id);
        return article ? {
          id: article._id,
          type: 'article',
          title: article.title,
          emotion: article.emotion,
          readAt: item.readAt
        } : null;
      } else {
        const treehole = await Treehole.findById(item.id);
        return treehole ? {
          id: treehole._id,
          type: 'treehole',
          content: treehole.content,
          emotion: treehole.emotion,
          readAt: item.readAt
        } : null;
      }
    }));
    
    res.json({ code: 200, data: result.filter(Boolean) });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

router.post('/reading-history', auth, async (req, res) => {
  try {
    const { id, type, title, emotion } = req.body;

    if (!id || !type) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    user.readingHistory = user.readingHistory || [];

    const existingIndex = user.readingHistory.findIndex(
      item => item.id.toString() === id && item.type === type
    );

    if (existingIndex > -1) {
      user.readingHistory.splice(existingIndex, 1);
    }

    user.readingHistory.unshift({
      id,
      type,
      title: title || '',
      emotion: emotion || '',
      readAt: new Date()
    });

    if (user.readingHistory.length > 100) {
      user.readingHistory = user.readingHistory.slice(0, 100);
    }

    await user.save();
    res.json({ code: 200, message: '阅读记录已添加' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '添加失败' });
  }
});

module.exports = router;