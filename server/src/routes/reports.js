const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Treehole = require('../models/Treehole');
const Article = require('../models/Article');
const Comment = require('../models/Comment');
const User = require('../models/User');
const OperationLog = require('../models/OperationLog');
const { auth, adminAuth } = require('../middleware/auth');

// 用户提交举报
router.post('/', auth, async (req, res) => {
  try {
    const { targetId, targetType, reason } = req.body;

    if (!targetId || !targetType || !reason) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' });
    }

    if (!['treehole', 'article'].includes(targetType)) {
      return res.status(400).json({ code: 400, message: '类型参数错误' });
    }

    // 验证举报理由：仅允许中英文字符及标点
    const allowedPattern = /^[\u4e00-\u9fa5a-zA-Z\s，。！？、；：""''（）《》【】…—\-,.\!?\;:\"\'()\[\]\/]+$/;
    if (!allowedPattern.test(reason)) {
      return res.status(400).json({ code: 400, message: '举报理由仅支持中英文字符及标点符号' });
    }

    if (reason.length > 200) {
      return res.status(400).json({ code: 400, message: '举报理由不能超过200字' });
    }

    // 验证被举报内容是否存在
    const Model = targetType === 'treehole' ? Treehole : Article;
    const target = await Model.findById(targetId);
    if (!target) {
      return res.status(404).json({ code: 404, message: '被举报内容不存在' });
    }

    // 获取举报者uid
    const reporter = await User.findById(req.user._id);
    if (!reporter) {
      return res.status(401).json({ code: 401, message: '用户不存在' });
    }

    const report = new Report({
      targetId,
      targetType,
      reporterId: req.user._id,
      reporterUid: reporter.uid,
      reason: reason.trim(),
      status: '待处理'
    });

    await report.save();
    res.status(201).json({ code: 201, message: '举报已提交', data: report });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ code: 500, message: '举报提交失败' });
  }
});

// 管理员获取举报列表
router.get('/admin/list', auth, adminAuth, async (req, res) => {
  try {
    const { targetType, status, sort = '最新', page = 1, limit = 20 } = req.query;

    const query = {};
    if (targetType && targetType !== '全部') query.targetType = targetType;
    if (status && status !== '全部') query.status = status;

    const sortOption = sort === '最早' ? { createdAt: 1 } : { createdAt: -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, total] = await Promise.all([
      Report.find(query).sort(sortOption).skip(skip).limit(parseInt(limit)),
      Report.countDocuments(query)
    ]);

    // 附加被举报内容的标题/预览
    const reportsWithContent = await Promise.all(reports.map(async (report) => {
      const r = report.toObject();
      if (report.targetType === 'treehole') {
        const treehole = await Treehole.findById(report.targetId);
        if (treehole) {
          r.targetTitle = treehole.content.slice(0, 50);
          r.targetPreview = treehole.content;
          r.targetEmotion = treehole.emotion;
          r.targetExists = true;
        } else {
          r.targetTitle = '内容已被删除';
          r.targetExists = false;
        }
      } else {
        const article = await Article.findById(report.targetId);
        if (article) {
          r.targetTitle = article.title;
          r.targetPreview = article.summary || article.content?.slice(0, 100);
          r.targetEmotion = article.emotion;
          r.targetExists = true;
        } else {
          r.targetTitle = '文章已被删除';
          r.targetExists = false;
        }
      }
      return r;
    }));

    res.json({ code: 200, data: { reports: reportsWithContent, total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ code: 500, message: '获取举报列表失败' });
  }
});

// 管理员获取待处理举报数量
router.get('/admin/count', auth, adminAuth, async (req, res) => {
  try {
    const count = await Report.countDocuments({ status: '待处理' });
    const treeholeCount = await Report.countDocuments({ status: '待处理', targetType: 'treehole' });
    const articleCount = await Report.countDocuments({ status: '待处理', targetType: 'article' });
    res.json({ code: 200, data: { total: count, treehole: treeholeCount, article: articleCount } });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

// 管理员不予采纳举报
router.put('/admin/:id/reject', auth, adminAuth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ code: 404, message: '举报记录不存在' });
    }

    await Report.findByIdAndDelete(req.params.id);

    // 记录操作日志
    await OperationLog.create({
      operatorId: req.user._id,
      operatorUid: req.user.uid,
      action: '举报不予采纳',
      targetType: report.targetType,
      targetId: report.targetId,
      detail: `举报理由: ${report.reason}`,
      result: '已删除举报记录'
    });

    res.json({ code: 200, message: '已不予采纳，举报记录已删除' });
  } catch (error) {
    console.error('Reject report error:', error);
    res.status(500).json({ code: 500, message: '操作失败' });
  }
});

// 管理员采纳举报（下架内容）
router.put('/admin/:id/adopt', auth, adminAuth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ code: 404, message: '举报记录不存在' });
    }

    const targetId = report.targetId;
    const targetType = report.targetType;

    // 删除举报记录
    await Report.findByIdAndDelete(req.params.id);

    if (targetType === 'treehole') {
      // 将树洞标记为已下架
      await Treehole.findByIdAndUpdate(targetId, { status: '已下架', updatedAt: Date.now() });

      // 删除该树洞的所有评论
      await Comment.deleteMany({ treeholeId: targetId });

      // 对所有收藏该树洞的用户，标记收藏为已下架
      const usersWithBookmark = await User.find({ bookmarkedTreeholes: targetId.toString() });
      for (const user of usersWithBookmark) {
        // 在bookmarkedTreeholes中保留ID但添加下架标记
        // 使用新的数组结构: [{id, delisted}] 
        // 为了兼容现有结构，我们在User模型中添加bookmarkedTreeholesDelisted字段
        if (!user.bookmarkedTreeholesDelisted) {
          user.bookmarkedTreeholesDelisted = [];
        }
        if (!user.bookmarkedTreeholesDelisted.includes(targetId.toString())) {
          user.bookmarkedTreeholesDelisted.push(targetId.toString());
        }
        await user.save();
      }
    } else {
      // 将文章标记为已下架
      await Article.findByIdAndUpdate(targetId, { status: '已下架', updatedAt: Date.now() });

      // 删除该文章的所有评论
      await Comment.deleteMany({ articleId: targetId });

      // 从所有用户的点赞列表中移除
      await User.updateMany(
        { likedArticles: targetId.toString() },
        { $pull: { likedArticles: targetId.toString() } }
      );

      // 对所有收藏该文章的用户，标记收藏为已下架
      const usersWithBookmark = await User.find({ bookmarkedArticles: targetId.toString() });
      for (const user of usersWithBookmark) {
        if (!user.bookmarkedArticlesDelisted) {
          user.bookmarkedArticlesDelisted = [];
        }
        if (!user.bookmarkedArticlesDelisted.includes(targetId.toString())) {
          user.bookmarkedArticlesDelisted.push(targetId.toString());
        }
        await user.save();
      }
    }

    // 记录操作日志
    await OperationLog.create({
      operatorId: req.user._id,
      operatorUid: req.user.uid,
      action: '举报采纳-内容下架',
      targetType,
      targetId,
      detail: `举报理由: ${report.reason}`,
      result: '内容已下架，关联评论已删除，收藏已标记'
    });

    res.json({ code: 200, message: '已采纳，内容已下架' });
  } catch (error) {
    console.error('Adopt report error:', error);
    res.status(500).json({ code: 500, message: '操作失败' });
  }
});

// 管理员批量处理举报
router.put('/admin/batch', auth, adminAuth, async (req, res) => {
  try {
    const { reportIds, action } = req.body;

    if (!Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({ code: 400, message: '请选择要处理的举报' });
    }

    if (!['adopt', 'reject'].includes(action)) {
      return res.status(400).json({ code: 400, message: '操作类型错误' });
    }

    const results = [];
    for (const id of reportIds) {
      try {
        if (action === 'reject') {
          const report = await Report.findById(id);
          if (report) {
            await Report.findByIdAndDelete(id);
            await OperationLog.create({
              operatorId: req.user._id,
              operatorUid: req.user.uid,
              action: '批量举报不予采纳',
              targetType: report.targetType,
              targetId: report.targetId,
              detail: `举报理由: ${report.reason}`,
              result: '已删除举报记录'
            });
            results.push({ id, success: true });
          }
        } else {
          // adopt - 复用单条逻辑
          const report = await Report.findById(id);
          if (report) {
            await Report.findByIdAndDelete(id);

            if (report.targetType === 'treehole') {
              await Treehole.findByIdAndUpdate(report.targetId, { status: '已下架', updatedAt: Date.now() });
              await Comment.deleteMany({ treeholeId: report.targetId });
              const users = await User.find({ bookmarkedTreeholes: report.targetId.toString() });
              for (const user of users) {
                if (!user.bookmarkedTreeholesDelisted) user.bookmarkedTreeholesDelisted = [];
                if (!user.bookmarkedTreeholesDelisted.includes(report.targetId.toString())) {
                  user.bookmarkedTreeholesDelisted.push(report.targetId.toString());
                }
                await user.save();
              }
            } else {
              await Article.findByIdAndUpdate(report.targetId, { status: '已下架', updatedAt: Date.now() });
              await Comment.deleteMany({ articleId: report.targetId });
              await User.updateMany(
                { likedArticles: report.targetId.toString() },
                { $pull: { likedArticles: report.targetId.toString() } }
              );
              const users = await User.find({ bookmarkedArticles: report.targetId.toString() });
              for (const user of users) {
                if (!user.bookmarkedArticlesDelisted) user.bookmarkedArticlesDelisted = [];
                if (!user.bookmarkedArticlesDelisted.includes(report.targetId.toString())) {
                  user.bookmarkedArticlesDelisted.push(report.targetId.toString());
                }
                await user.save();
              }
            }

            await OperationLog.create({
              operatorId: req.user._id,
              operatorUid: req.user.uid,
              action: '批量举报采纳-内容下架',
              targetType: report.targetType,
              targetId: report.targetId,
              detail: `举报理由: ${report.reason}`,
              result: '内容已下架'
            });
            results.push({ id, success: true });
          }
        }
      } catch (e) {
        results.push({ id, success: false, error: e.message });
      }
    }

    res.json({ code: 200, message: `批量处理完成，成功${results.filter(r => r.success).length}条`, data: results });
  } catch (error) {
    console.error('Batch process error:', error);
    res.status(500).json({ code: 500, message: '批量处理失败' });
  }
});

module.exports = router;
