const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../utils/helpers');
const { auth } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
    }

    if (password.length < 6) {
      return res.status(400).json({ code: 400, message: '密码至少6位' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ code: 400, message: '用户名已存在' });
    }

    const user = new User({ username, password, email, nickname: username });
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({ code: 201, message: '注册成功', data: { user, token } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ code: 500, message: '注册失败' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({ 
        code: 403, 
        message: `账号已锁定，请${Math.ceil((user.lockUntil - Date.now()) / 60000)}分钟后重试`,
        lockUntil: user.lockUntil
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginFailCount += 1;
      if (user.loginFailCount >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }

    user.loginFailCount = 0;
    user.lockUntil = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({ code: 200, message: '登录成功', data: { user, token } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ code: 500, message: '登录失败' });
  }
});

router.post('/logout', auth, async (req, res) => {
  res.json({ code: 200, message: '已退出登录' });
});

router.get('/me', auth, async (req, res) => {
  res.json({ code: 200, data: req.user });
});

router.put('/me', auth, async (req, res) => {
  try {
    const { nickname, avatar, signature, email, privacySettings } = req.body;
    const user = req.user;

    if (nickname) user.nickname = nickname;
    if (avatar) user.avatar = avatar;
    if (signature) user.signature = signature;
    if (email) user.email = email;
    if (privacySettings) user.privacySettings = { ...user.privacySettings, ...privacySettings };

    await user.save();
    res.json({ code: 200, message: '更新成功', data: user });
  } catch (error) {
    res.status(500).json({ code: 500, message: '更新失败' });
  }
});

module.exports = router;