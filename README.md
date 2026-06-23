# 🌙 心事邮局 · Whisper Post Office

> **"让情绪找到归处"** — 一座深夜营业、替人暂时保管情绪的虚拟邮局

[![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

---

## 📖 项目简介

**心事邮局（Whisper Post Office）** 是一款以「深夜邮局」为美学主题的情绪记录与匿名倾诉平台。在这里，用户可以：

- ✍️ **书写心事信纸** — 用"写信→投递到不同归宿"的隐喻记录情绪
- 🌌 **匿名倾诉心声** — 在回声广场匿名发布，获得陌生人的善意回应
- 📊 **回顾成长轨迹** — 在成长归档室回顾情绪历史、查看心情分布
- 📚 **阅读心理文章** — 夜灯书房提供专业心理健康内容

产品营造温暖、安静、不评判的情绪空间 — 羊皮纸色背景、暖灯光影、飘尘粒子、信纸质感卡片。

---

## ✨ 核心功能

| 模块 | 说明 |
|------|------|
| 🏠 **门厅** | 心情分布饼图、4-7-8 呼吸引导、冥想引导、推荐树洞 |
| ✍️ **心事寄存处** | 富文本写作台，选择归宿（思绪阁楼/流星信箱/留声匣/焚信炉） |
| 🎙️ **回声广场** | 匿名树洞列表、点赞/收藏/评论、情绪筛选与搜索 |
| 📚 **夜灯书房** | 心理健康文章阅读、分类筛选、用户投稿 |
| 🎨 **创作者中心** | 管理个人回声与文章、灵感便利贴 |
| 🗄️ **成长归档室** | 收藏夹、我的信纸、阅读记录时间线 |
| 🛡️ **审核中心** | 管理员审核树洞/评论/文章内容 |
| 👤 **个人中心** | 资料编辑、隐私设置、数据导出、账号管理 |

---

## 🛠️ 技术栈

### 前端

| 技术 | 作用 |
|------|------|
| [Vue 3](https://vuejs.org/) (Composition API) | 前端框架 |
| [Vite](https://vitejs.dev/) | 构建工具 |
| [Vue Router 4](https://router.vuejs.org/) | 路由管理 |
| [Pinia](https://pinia.vuejs.org/) | 状态管理 |
| [TipTap](https://tiptap.dev/) | 富文本编辑器 |
| [Element Plus](https://element-plus.org/) | UI 组件库 |
| [Axios](https://axios-http.com/) | HTTP 客户端 |
| SCSS | 样式预处理 |

### 后端

| 技术 | 作用 |
|------|------|
| [Express.js](https://expressjs.com/) | Web 框架 |
| [Mongoose](https://mongoosejs.com/) | MongoDB ODM |
| [JWT](https://jwt.io/) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 认证与加密 |
| [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) | 请求限流 |

---

## 📁 项目结构

```
Mood_post_office/
├── client/                        # Vue 3 前端
│   ├── src/
│   │   ├── assets/styles/         # 全局 SCSS 样式
│   │   ├── components/            # 公共组件（飘尘粒子、导航栏、富文本编辑器）
│   │   ├── router/index.js        # 路由配置（18条路由）
│   │   ├── stores/index.js        # Pinia 状态管理（user/notes/treehole）
│   │   ├── views/                 # 16 个页面视图
│   │   ├── App.vue                # 根组件
│   │   └── main.js                # 入口
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                        # Express 后端
│   ├── src/
│   │   ├── middleware/auth.js     # 认证中间件（auth/optionalAuth/adminAuth）
│   │   ├── models/                # 5 个 Mongoose 模型（User/Note/Treehole/Article/Comment）
│   │   ├── routes/                # 5 个路由模块（auth/articles/treehole/notes/users）
│   │   ├── utils/helpers.js       # 工具函数
│   │   ├── index.js               # 服务器入口
│   │   └── migrate-notes.js       # 数据迁移脚本
│   ├── scripts/
│   │   ├── initData.js            # 样例数据初始化
│   │   └── createAdmin.js         # 创建管理员
│   ├── package.json
│   └── .env.example               # 环境变量示例
├── PRD.md                         # 产品需求文档
├── PM_Tech_Literacy.md            # 产品经理技术扫盲手册
├── .gitignore
└── README.md
```

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.x
- **MongoDB** >= 6.x（本地运行或 [MongoDB Atlas](https://www.mongodb.com/atlas)）
- **npm** >= 9.x

### 1. 克隆项目

```bash
git clone https://github.com/ChenYu803/Mood_post_office.git
cd Mood_post_office
```

### 2. 配置后端环境变量

```bash
cp server/.env.example server/.env
```

编辑 `server/.env`，填入你的 MongoDB 连接地址和 JWT 密钥：

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/mood_memo2
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
```

### 3. 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 4. 初始化数据（可选）

```bash
cd server

# 创建管理员账号
node scripts/createAdmin.js

# 导入样例数据（10条树洞 + 文章）
node scripts/initData.js
```

### 5. 启动开发服务器

在两个终端中分别运行：

```bash
# 终端 1：启动后端（端口 3001）
cd server
npm run dev

# 终端 2：启动前端（端口 5173）
cd client
npm run dev
```

浏览器访问 `http://localhost:5173` 即可使用。

---

## 🌍 页面路由

| 路由 | 页面 | 权限 |
|------|------|------|
| `/` | 门厅首页 | 公开 |
| `/auth` | 登录/注册 | 公开 |
| `/deposit` | 心事寄存处 | 需登录 |
| `/deposit/locker` | 寄存柜 | 需登录 |
| `/deposit/attic` | 思绪阁楼 | 需登录 |
| `/deposit/meteor-mailbox` | 流星信箱 | 需登录 |
| `/deposit/voice-box` | 留声匣 | 需登录 |
| `/plaza` | 回声广场 | 公开 |
| `/plaza/:id` | 回声详情 | 需登录 |
| `/study` | 夜灯书房 | 公开 |
| `/study/:id` | 文章详情 | 公开 |
| `/archive` | 成长归档室 | 需登录 |
| `/creator` | 创作者中心 | 需登录 |
| `/creator/echo` | 发表心声 | 需登录 |
| `/creator/article` | 投稿文章 | 需登录 |
| `/profile` | 个人中心 | 需登录 |
| `/profile/settings` | 设置 | 需登录 |
| `/admin` | 审核中心 | 管理员 |

---

## 🔐 角色权限

| 角色 | 权限 |
|------|------|
| **游客** | 浏览回声广场列表、阅读文章 |
| **注册用户** | 书写信纸、发布树洞、评论/点赞/收藏、查看成长归档室 |
| **创作者** | 管理个人回声与投稿文章 |
| **管理员** | 审核中心：审核所有 UGC 内容（树洞/评论/文章） |

---

## 📄 相关文档

- [产品需求文档 (PRD)](./PRD.md) — 完整的功能说明、数据模型、API 设计
- [PM 技术扫盲手册](./PM_Tech_Literacy.md) — 非技术人员理解项目的入门指南

---

## 🎨 视觉风格

项目遵循深夜邮局美学规范：
- 全局色彩体系：羊皮纸 / 暖棕 / 月光灰 / 暗夜蓝 / 琥珀暖光
- 飘尘粒子背景动画
- 信纸质感卡片（CSS 渐变模拟纸张纹理）
- 7 种情绪标签各具独立色彩
- 设计禁令：禁用纯白、荧光色、高饱和色

---

## 📝 许可证

本项目基于 [MIT License](./LICENSE) 开源。

---

> 💌 *心事邮局 — 温暖每一个需要被倾听的心*
