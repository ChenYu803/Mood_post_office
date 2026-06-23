const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { optionalAuth, adminAuth, auth } = require('../middleware/auth');

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { emotion, category, keyword, page = 1, limit = 20 } = req.query;
    
    const query = { status: '已发布' };
    if (emotion && emotion !== '全部') query.emotion = emotion;
    if (category && category !== 'all') query.category = category;
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { summary: { $regex: keyword, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [articles, total] = await Promise.all([
      Article.find(query).populate('author', 'nickname').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Article.countDocuments(query)
    ]);

    res.json({ 
      code: 200, 
      data: { articles, total, page: parseInt(page), limit: parseInt(limit) } 
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

router.get('/admin/pending', auth, adminAuth, async (req, res) => {
  try {
    console.log('GET /articles/admin/pending');
    const articles = await Article.find({ status: 'pending' }).populate('author', 'nickname').sort({ createdAt: 1 });
    res.json({ code: 200, data: articles });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

router.get('/admin/pending-comments', auth, adminAuth, async (req, res) => {
  try {
    console.log('GET /articles/admin/pending-comments');
    const comments = await Comment.find({ status: '待审核', articleId: { $exists: true } })
      .populate('userId', 'nickname')
      .sort({ createdAt: 1 });
    console.log('Found article comments:', comments.length);
    res.json({ code: 200, data: comments });
  } catch (error) {
    console.error('Error fetching pending comments:', error);
    res.status(500).json({ code: 500, message: '获取失败' });
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

    if (status === '已发布' && comment.articleId) {
      await Article.findByIdAndUpdate(comment.articleId, { $inc: { commentCount: 1 } });
    }

    res.json({ code: 200, message: '审核完成', data: comment });
  } catch (error) {
    res.status(500).json({ code: 500, message: '操作失败' });
  }
});

router.put('/admin/:id/review', auth, adminAuth, async (req, res) => {
  try {
    const { status, rejectReason } = req.body;
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { status, rejectReason: rejectReason || '', updatedAt: Date.now() },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ code: 404, message: '文章不存在' });
    }

    res.json({ code: 200, message: '审核完成', data: article });
  } catch (error) {
    res.status(500).json({ code: 500, message: '操作失败' });
  }
});

router.post('/submit', auth, async (req, res) => {
  try {
    const { title, summary, content, emotion, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({ code: 400, message: '标题和内容不能为空' });
    }

    const article = new Article({
      title,
      summary: summary || '',
      content,
      emotion: emotion || '平静',
      category: category || '情绪管理',
      author: req.user._id,
      status: 'pending'
    });

    await article.save();
    res.json({ code: 200, message: '投稿成功，等待审核', data: article });
  } catch (error) {
    console.error('Submit article error:', error);
    res.status(500).json({ code: 500, message: '投稿失败' });
  }
});

router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { title, cover, summary, content, emotion, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({ code: 400, message: '标题和内容不能为空' });
    }

    const article = new Article({
      title,
      cover: cover || '',
      summary: summary || '',
      content,
      emotion: emotion || '平静',
      category: category || '情绪管理',
      status: '已发布'
    });

    await article.save();
    res.status(201).json({ code: 201, message: '创建成功', data: article });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ code: 500, message: '创建失败' });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const article = await Article.findOne({ _id: req.params.id, status: '已发布' }).populate('author', 'nickname');
    if (!article) {
      return res.status(404).json({ code: 404, message: '文章不存在' });
    }

    article.readCount += 1;
    await article.save();

    if (req.user) {
      const user = await User.findById(req.user._id);
      user.readingHistory = user.readingHistory || [];
      
      const existingIndex = user.readingHistory.findIndex(h => h.id.toString() === req.params.id && h.type === 'article');
      if (existingIndex > -1) {
        user.readingHistory.splice(existingIndex, 1);
      }
      
      user.readingHistory.unshift({ 
        id: req.params.id, 
        type: 'article', 
        title: article.title,
        emotion: article.emotion,
        readAt: new Date() 
      });
      
      if (user.readingHistory.length > 100) {
        user.readingHistory = user.readingHistory.slice(0, 100);
      }
      await user.save();
    }

    const relatedArticles = await Article.find({ 
      emotion: article.emotion, 
      _id: { $ne: article._id },
      status: '已发布'
    }).limit(5);

    res.json({ code: 200, data: { article, relatedArticles } });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ code: 404, message: '文章不存在' });
    }

    res.json({ code: 200, message: '更新成功', data: article });
  } catch (error) {
    res.status(500).json({ code: 500, message: '更新失败' });
  }
});

router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ code: 404, message: '文章不存在' });
    }
    await Comment.deleteMany({ articleId: req.params.id });
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '删除失败' });
  }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ code: 404, message: '文章不存在' });
    }

    const user = await User.findById(req.user._id);
    const likedArticles = user.likedArticles || [];
    const articleIndex = likedArticles.indexOf(req.params.id);

    if (articleIndex > -1) {
      likedArticles.splice(articleIndex, 1);
      article.likeCount = Math.max(0, article.likeCount - 1);
    } else {
      likedArticles.push(req.params.id);
      article.likeCount += 1;
    }

    user.likedArticles = likedArticles;
    await user.save();
    await article.save();

    res.json({ code: 200, data: { liked: articleIndex === -1, likeCount: article.likeCount } });
  } catch (error) {
    res.status(500).json({ code: 500, message: '操作失败' });
  }
});

router.get('/:id/like/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const article = await Article.findById(req.params.id);
    const liked = (user.likedArticles || []).includes(req.params.id);
    res.json({ code: 200, data: { liked, likeCount: article ? article.likeCount : 0 } });
  } catch (error) {
    res.json({ code: 200, data: { liked: false, likeCount: 0 } });
  }
});

router.post('/:id/bookmark', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ code: 404, message: '文章不存在' });
    }

    const user = await User.findById(req.user._id);
    const bookmarkedArticles = user.bookmarkedArticles || [];
    const articleIndex = bookmarkedArticles.indexOf(req.params.id);

    if (articleIndex > -1) {
      bookmarkedArticles.splice(articleIndex, 1);
    } else {
      bookmarkedArticles.push(req.params.id);
    }

    user.bookmarkedArticles = bookmarkedArticles;
    await user.save();

    res.json({ code: 200, data: { bookmarked: articleIndex === -1 } });
  } catch (error) {
    res.status(500).json({ code: 500, message: '操作失败' });
  }
});

router.get('/:id/bookmark/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const bookmarked = (user.bookmarkedArticles || []).includes(req.params.id);
    res.json({ code: 200, data: { bookmarked } });
  } catch (error) {
    res.json({ code: 200, data: { bookmarked: false } });
  }
});

router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    console.log('POST /articles/:id/comments - articleId:', req.params.id, 'content:', content);
    
    if (!content || !content.trim()) {
      return res.status(400).json({ code: 400, message: '评论内容不能为空' });
    }

    const article = await Article.findById(req.params.id);
    if (!article || article.status !== '已发布') {
      return res.status(404).json({ code: 404, message: '文章不存在' });
    }

    const comment = new Comment({
      articleId: req.params.id,
      userId: req.user._id,
      content: content.trim(),
      status: '待审核'
    });

    await comment.save();
    console.log('Comment saved:', comment._id, 'articleId:', comment.articleId, 'status:', comment.status);
    
    res.json({ code: 200, message: '评论已提交，审核通过后将显示' });
  } catch (error) {
    console.error('Error saving comment:', error);
    res.status(500).json({ code: 500, message: '评论失败' });
  }
});

router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ articleId: req.params.id, status: '已发布' })
      .populate('userId', 'nickname')
      .sort({ createdAt: 1 });
    res.json({ code: 200, data: { comments } });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

router.post('/:id/read', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ code: 404, message: '文章不存在' });
    }

    article.readCount += 1;
    await article.save();

    const user = await User.findById(req.user._id);
    const existingIndex = user.readingHistory.findIndex(h => h.id === req.params.id && h.type === 'article');
    if (existingIndex > -1) {
      user.readingHistory[existingIndex].readAt = Date.now();
    } else {
      user.readingHistory.unshift({ id: req.params.id, type: 'article', readAt: Date.now() });
      if (user.readingHistory.length > 100) {
        user.readingHistory = user.readingHistory.slice(0, 100);
      }
    }
    await user.save();

    res.json({ code: 200, message: '记录成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '操作失败' });
  }
});

module.exports = router;
