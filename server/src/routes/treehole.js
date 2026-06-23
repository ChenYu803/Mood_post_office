const express = require('express');
const router = express.Router();
const Treehole = require('../models/Treehole');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { auth, optionalAuth, adminAuth } = require('../middleware/auth');
const { generateAnonymousCode, containsSensitiveWords } = require('../utils/helpers');

const CRISIS_KEYWORDS = ['自杀', '自残', '无助', '绝望', '不想活', '想死'];

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { emotion, sort = '最新', keyword, page = 1, limit = 20 } = req.query;
    
    const query = { status: '已发布' };
    if (emotion && emotion !== '全部') query.emotion = emotion;
    if (keyword) {
      query.content = { $regex: keyword, $options: 'i' };
    }

    const sortOption = sort === '热门' ? { likeCount: -1, createdAt: -1 } : { createdAt: -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [treeholes, total] = await Promise.all([
      Treehole.find(query).sort(sortOption).skip(skip).limit(parseInt(limit)),
      Treehole.countDocuments(query)
    ]);

    let likedTreeholes = [];
    let bookmarkedTreeholes = [];
    if (req.user) {
      const user = await User.findById(req.user._id);
      likedTreeholes = user.likedTreeholes || [];
      bookmarkedTreeholes = user.bookmarkedTreeholes || [];
    }

    const treeholesWithStatus = treeholes.map(hole => ({
      ...hole.toObject(),
      liked: likedTreeholes.includes(hole._id.toString()),
      bookmarked: bookmarkedTreeholes.includes(hole._id.toString())
    }));

    res.json({ 
      code: 200, 
      data: { treeholes: treeholesWithStatus, total, page: parseInt(page), limit: parseInt(limit) } 
    });
  } catch (error) {
    console.error('Get treeholes error:', error);
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

router.get('/my/posts', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [treeholes, total] = await Promise.all([
      Treehole.find({ userId: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Treehole.countDocuments({ userId: req.user._id })
    ]);

    res.json({ 
      code: 200, 
      data: { treeholes, total, page: parseInt(page), limit: parseInt(limit) } 
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const treehole = await Treehole.findOne({ _id: req.params.id, status: '已发布' });
    if (!treehole) {
      return res.status(404).json({ code: 404, message: '内容不存在' });
    }

    const comments = await Comment.find({ treeholeId: treehole._id, status: '已发布' })
      .populate('userId', 'nickname')
      .sort({ createdAt: 1 });

    res.json({ code: 200, data: { treehole, comments } });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { content, emotion, isAnonymous = true } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ code: 400, message: '内容不能为空' });
    }

    if (content.length > 500) {
      return res.status(400).json({ code: 400, message: '内容不能超过500字' });
    }

    const hasCrisis = CRISIS_KEYWORDS.some(keyword => content.includes(keyword));
    if (hasCrisis) {
      return res.json({ 
        code: 200, 
        message: '发布成功',
        crisis: true,
        data: { crisis: true }
      });
    }

    let anonymousCode;
    if (isAnonymous) {
      anonymousCode = "匿名邮民";
    } else {
      const user = await User.findById(req.user._id);
      anonymousCode = user.nickname || user.username;
    }

    const treehole = new Treehole({
      userId: req.user._id,
      anonymousCode,
      content: content.trim(),
      emotion,
      isAnonymous,
      status: '待审核'
    });

    await treehole.save();
    res.status(201).json({ 
      code: 201, 
      message: '发布成功，内容正在审核中',
      data: treehole 
    });
  } catch (error) {
    console.error('Create treehole error:', error);
    res.status(500).json({ code: 500, message: '发布失败' });
  }
});

router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const treeholeId = req.params.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ code: 400, message: '评论内容不能为空' });
    }

    const treehole = await Treehole.findOne({ _id: treeholeId, status: '已发布' });
    if (!treehole) {
      return res.status(404).json({ code: 404, message: '树洞不存在' });
    }

    const comment = new Comment({
      treeholeId,
      userId: req.user._id,
      content: content.trim(),
      status: '待审核'
    });

    await comment.save();
    res.status(201).json({ 
      code: 201, 
      message: '评论已提交，审核通过后将显示',
      data: comment 
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ code: 500, message: '评论失败' });
  }
});

router.put('/:id/resubmit', auth, async (req, res) => {
  try {
    const { content, emotion } = req.body;
    
    const treehole = await Treehole.findOne({ _id: req.params.id, userId: req.user._id, status: '已驳回' });
    if (!treehole) {
      return res.status(404).json({ code: 404, message: '内容不存在或无法重新提交' });
    }

    treehole.content = content || treehole.content;
    treehole.emotion = emotion || treehole.emotion;
    treehole.status = '待审核';
    treehole.rejectReason = '';
    treehole.updatedAt = Date.now();

    await treehole.save();
    res.json({ code: 200, message: '重新提交成功', data: treehole });
  } catch (error) {
    res.status(500).json({ code: 500, message: '操作失败' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const treehole = await Treehole.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!treehole) {
      return res.status(404).json({ code: 404, message: '内容不存在' });
    }
    await Comment.deleteMany({ treeholeId: req.params.id });
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '删除失败' });
  }
});

router.get('/recommend', async (req, res) => {
  try {
    const treeholes = await Treehole.find({ status: '已发布' })
      .sort({ createdAt: -1 })
      .limit(20);
    
    const shuffled = treeholes.sort(() => Math.random() - 0.5).slice(0, 4);
    
    res.json({ 
      code: 200, 
      data: { treeholes: shuffled } 
    });
  } catch (error) {
    console.error('Get recommend treeholes error:', error);
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    const treehole = await Treehole.findById(req.params.id);
    if (!treehole) {
      return res.status(404).json({ code: 404, message: '树洞不存在' });
    }

    const user = await User.findById(req.user._id);
    const likedTreeholes = user.likedTreeholes || [];
    const treeholeIndex = likedTreeholes.indexOf(req.params.id);

    if (treeholeIndex > -1) {
      likedTreeholes.splice(treeholeIndex, 1);
      treehole.likeCount = Math.max(0, treehole.likeCount - 1);
    } else {
      likedTreeholes.push(req.params.id);
      treehole.likeCount += 1;
    }

    user.likedTreeholes = likedTreeholes;
    await user.save();
    await treehole.save();

    res.json({ code: 200, data: { liked: treeholeIndex === -1, likeCount: treehole.likeCount } });
  } catch (error) {
    res.status(500).json({ code: 500, message: '操作失败' });
  }
});

router.get('/:id/like/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const liked = (user.likedTreeholes || []).includes(req.params.id);
    res.json({ code: 200, data: { liked } });
  } catch (error) {
    res.json({ code: 200, data: { liked: false } });
  }
});

router.post('/:id/bookmark', auth, async (req, res) => {
  try {
    const treehole = await Treehole.findById(req.params.id);
    if (!treehole) {
      return res.status(404).json({ code: 404, message: '树洞不存在' });
    }

    const user = await User.findById(req.user._id);
    const bookmarkedTreeholes = user.bookmarkedTreeholes || [];
    const treeholeIndex = bookmarkedTreeholes.indexOf(req.params.id);

    if (treeholeIndex > -1) {
      bookmarkedTreeholes.splice(treeholeIndex, 1);
    } else {
      bookmarkedTreeholes.push(req.params.id);
    }

    user.bookmarkedTreeholes = bookmarkedTreeholes;
    await user.save();

    res.json({ code: 200, data: { bookmarked: treeholeIndex === -1 } });
  } catch (error) {
    res.status(500).json({ code: 500, message: '操作失败' });
  }
});

router.get('/:id/bookmark/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const bookmarked = (user.bookmarkedTreeholes || []).includes(req.params.id);
    res.json({ code: 200, data: { bookmarked } });
  } catch (error) {
    res.json({ code: 200, data: { bookmarked: false } });
  }
});

module.exports = router;