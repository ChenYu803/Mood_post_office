# 心事邮局 | Whisper Post Office — 产品需求文档 (PRD)

> **版本**：v1.1  
> **更新日期**：2026-05-22  
> **产品定位**：一款以「深夜邮局」为美学主题的情绪记录与匿名倾诉平台，帮助用户"邮寄心事、安放情绪"

---

## 目录

1. [产品概述](#1-产品概述)
2. [用户分析](#2-用户分析)
3. [核心功能架构](#3-核心功能架构)
4. [页面功能详细说明](#4-页面功能详细说明)
5. [数据模型设计](#5-数据模型设计)
6. [API 接口设计](#6-api接口设计)
7. [交互与视觉设计](#7-交互与视觉设计)
8. [非功能性需求](#8-非功能性需求)
9. [技术架构](#9-技术架构)
10. [版本路线规划](#10-版本路线规划)

---

## 1. 产品概述

### 1.1 产品简介

**心事邮局（Whisper Post Office）** 是一座"深夜营业、替人暂时保管情绪"的虚拟邮局。用户在这里可以书写心事信纸、匿名倾诉心声、阅读情绪管理文章、回顾自己的成长足迹。

产品营造出一座温暖、安静、不评判情绪空间的沉浸式体验——羊皮纸色背景、暖灯光影、飘尘粒子、信纸质感卡片，让用户进入后产生"终于有地方愿意替我保管情绪了"的归属感。

### 1.2 产品slogan

**"让情绪找到归处"**

### 1.3 核心价值

| 维度 | 说明 |
|------|------|
| **情绪寄存** | 用"写信→投递到不同归宿"的隐喻，替代传统的笔记记录，降低情绪表达门槛 |
| **匿名倾诉** | 在回声广场匿名发布心声，获得陌生人的善意回应，构建安全的情绪释放空间 |
| **自我成长** | 通过成长归档室回顾情绪历史、统计心情分布，觉察自身情绪变化轨迹 |
| **知识滋养** | 夜灯书房提供专业心理健康文章，帮助用户理解和管理情绪 |

### 1.4 产品定位对比

巨人没入喧嚣的社交媒体、冷冰冰的SaaS工具，心事邮局以"文学化、沉浸感、邮件隐喻"作为差异化定位——它不是功能列表，而是一座情绪庇护所。

---

## 2. 用户分析

### 2.1 目标用户画像

| 画像 | 场景 | 痛点 |
|------|------|------|
| **城市独居青年** | 下班后独自面对压力情绪，无处倾诉 | 缺乏安全、不评判的情绪出口 |
| **有情绪觉察需求者** | 想记录并回顾自己的情绪变化 | 普通笔记App缺乏情绪分类和统计 |
| **轻度心理困扰人群** | 偶尔感到焦虑/迷茫/难过，需要温和引导 | 不愿直接使用心理咨询，需要低门槛入口 |
| **喜欢写作表达的人** | 有日常写作习惯，想将情绪创作分享 | 朋友圈/社交媒体太重，需要轻表达空间 |

### 2.2 用户角色

| 角色 | 权限说明 |
|------|----------|
| **游客** | 可浏览回声广场内容（需要登录后查看详情）、阅读夜灯书房文章。不可发布内容、不可评论 |
| **注册用户** | 可书写心事信纸、发布树洞心声、评论互动、收藏内容、查看个人成长归档室 |
| **创作者** | 在注册用户基础上，可在创作中心管理自己发布的心声和投稿文章 |
| **管理员** | 通过审核中心审核所有待审核内容（树洞、树洞评论、文章、文章评论），具有审批通过/驳回权限 |

### 2.3 用户旅程

```
首页门厅 → 注册/登录 → 
  ├─ 写一封信（心事寄存处） → 选择归属（思绪阁楼/流星信箱/留声匣/焚毁）
  ├─ 回声广场 → 浏览心声 → 详情页互动（点赞/收藏/评论）
  ├─ 夜灯书房 → 阅读文章 → 详情页收藏/评论
  ├─ 成长归档室 → 收藏夹/我的信纸/阅读记录
  └─ 个人中心 → 创作者中心/设置/数据导出
```

---

## 3. 核心功能架构

### 3.1 功能全景图

```
心事邮局
├── 1. 门厅 (首页HomePage)
│   ├── 心情分布饼图（7天/30天）
│   ├── 呼吸引导动画
│   ├── 冥想引导步骤
│   └── 推荐树洞（需要帮助的TA）
│
├── 2. 心事寄存处 (RecycleStation)
│   ├── 中央写作台（富文本编辑器 + 情绪选择 + 强度滑块）
│   ├── 左侧：寄存柜 入口 + 思绪阁楼 入口
│   ├── 右侧：流星信箱 入口 + 留声匣 入口
│   └── 底部：焚信炉（Canvas燃烧动画）
│
├── 3. 寄存柜 (LogsPage)
│   ├── 所有心事信纸列表（情绪筛选）
│   ├── 批量操作（移入思绪阁楼/流星信箱/留声匣/删除/发表）
│   └── 信纸详情查看与编辑
│
├── 4. 思绪阁楼 (AtticPage)
│   ├── 浮漂信纸展示（暂存性质）
│   ├── 批量操作（移入寄存柜/流星信箱/发表/删除）
│   └── 信纸详情与编辑
│
├── 5. 流星信箱 (MeteorMailboxPage)
│   ├── 心愿卡片墙展示（星形装饰）
│   ├── 心愿统计
│   └── 批量操作（移入思绪阁楼/留声匣/发表/删除）
│
├── 6. 留声匣 (VoiceBoxPage)
│   ├── 美好回忆卡片墙展示（心形装饰）
│   ├── 美好统计（开心时刻数/感动瞬间数）
│   └── 批量操作（移入思绪阁楼/流星信箱/发表/删除）
│
├── 7. 回声广场 (TreeholePage)
│   ├── 心声列表卡片（匿名码展示）
│   ├── 情绪筛选 + 关键词搜索
│   ├── 排序切换（最新/热门）
│   ├── 点赞/收藏/评论计数
│   └── 分页加载
│
├── 8. 回声详情 (TreeholeDetail)
│   ├── 树洞完整内容展示
│   ├── 评论区（发表/查看回复）
│   └── 阅读历史记录
│
├── 9. 夜灯书房 (ArticlesPage)
│   ├── 文章列表卡片（情绪标签/分类）
│   ├── 分类筛选 + 关键词搜索
│   ├── 文章详情（富文本内容）
│   ├── 收藏/评论/相关推荐
│   └── 用户投稿入口
│
├── 10. 创作者中心 (CreatorPage)
│   ├── 我的回声（个人发布的树洞列表）
│   ├── 我的文章（投稿文章管理）
│   ├── 灵感便利贴（本地存储的灵感记录）
│   ├── 发声/投稿快捷入口
│   └── 编辑/删除/查看评论
│
├── 11. 发表心声 (CreatorEchoPage)
│   ├── 匿名/实名身份选择
│   ├── 富文本编辑心声内容
│   ├── 情绪标签选择
│   └── 提交审核
│
├── 12. 投稿文章 (CreatorArticlePage)
│   ├── 标题/分类/摘要/正文
│   ├── 富文本编辑
│   ├── 情绪标签选择
│   └── 提交审核
│
├── 13. 成长归档室 (MonumentPage)
│   ├── 收藏夹（文章收藏 + 心声收藏）
│   ├── 我的信纸（按情绪/状态浏览）
│   └── 阅读记录（时间线形式）
│
├── 14. 个人中心 (ProfilePage)
│   ├── 用户信息卡片（昵称/签名/头像首字）
│   ├── 数据统计（情绪记录数/思绪阁楼/流星信箱/回声数）
│   ├── 快捷操作入口
│   └── 导航（管理员可见审核中心入口）
│
├── 15. 设置 (SettingsPage)
│   ├── 基本信息编辑（昵称/签名/邮箱）
│   ├── 隐私设置（心愿墙可见开关）
│   └── 数据管理（导出JSON/删除账号）
│
└── 16. 审核中心 (AdminPage)
    ├── 待审核回声（通过/驳回）
    ├── 待审核回声评论（通过/驳回）
    ├── 待审核文章（预览/通过/驳回）
    └── 待审核文章评论（通过/驳回）
```

### 3.2 心流信纸生命周期

```
用户写信 → 选择归属 →
  ├─ 思绪阁楼（暂存，待日后处理）→ 可移至寄存柜/流星信箱/发表/删除
  ├─ 流星信箱（许愿性质，温暖期待感）→ 可移至思绪阁楼/留声匣/发表/删除
  ├─ 留声匣（珍藏美好记忆）→ 可移至思绪阁楼/流星信箱/发表/删除
  └─ 焚信炉（立即释放，不保存）→ 燃烧动画后消失，象征情绪释放

所有保存的信纸同时出现在「寄存柜」中（统一收件箱）
```

---

## 4. 页面功能详细说明

### 4.1 门厅 (HomePage)

**路由**：`/`  
**访问权限**：所有人

**功能点**：
| 功能 | 描述 | 实现细节 |
|------|------|----------|
| Hero区 | 品牌展示+快捷入口 | 3张浮动情绪卡片装饰（开心/平静/感动），"写一封信"和"去回声广场"按钮 |
| 心情分布 | 饼图展示7天/30天情绪分布 | 调用 `/users/notes` 获取用户Note数据，按emotion分组统计；使用SVG绘制饼图 |
| 呼吸引导 | 4-7-8呼吸法动画 | 圆形呼吸动画，吸气→屏息→呼气三阶段，文字提示跟随 |
| 冥想引导 | 5步冥想引导 | 按钮切换步骤：找位置→闭眼→专注呼吸→感受气息→保持平静 |
| 推荐树洞 | 随机推荐4条心声 | 调用 `GET /treehole/recommend` 接口，展示标题+情绪标签，点击跳转详情 |
| 功能卡片 | 三大模块入口 | 心事寄存处📬 / 回声广场🌙 / 夜灯书房🕯️ |
| CTA区 | 注册/登录引导 | 未登录用户显示"立即开始"，已登录显示"写一封信" |
| 页脚 | 版权信息 | "心事邮局 2024 | 温暖每一个需要被倾听的心" |

**状态说明**：
- 未登录状态：心情分布/呼吸引导/冥想引导/推荐树洞隐藏，仅显示CTA引导注册
- 已登录状态：展示完整的"今日关怀"区块

---

### 4.2 心事寄存处 (RecycleStation)

**路由**：`/deposit`  
**访问权限**：需要登录

**布局结构**：
```
┌──────────────┬──────────────────────┬──────────────┐
│  寄存柜入口   │    中央写作台 (Center) │  流星信箱入口  │
│  (LockBox)   │                      │  (Meteor)    │
│              │  [富文本编辑器区域]      │              │
├──────────────┤  [情绪标签选择器]       ├──────────────┤
│  思绪阁楼入口 │  [情绪强度滑块]         │  留声匣入口    │
│  (Attic)     │  [故事输入框(留声匣)]   │  (VoiceBox)  │
│              │  [归宿选择按钮]         │              │
│              │  [提交按钮]            │              │
└──────────────┴──────────────────────┴──────────────┘
                        ┌──────────────┐
                        │   焚信炉      │
                        │ (Incinerator)│
                        └──────────────┘
```

**功能点**：
| 功能 | 描述 | 实现细节 |
|------|------|----------|
| 中央写作台 | 主书写区域 | 使用 TipTap RichTextEditor 富文本编辑器，支持拖拽调整高度（200-800px） |
| 情绪选择器 | 7种情绪标签 | 开心😊/平静🍃/焦虑☁️/愤怒🔥/难过💧/感动💕/迷茫🌫️ |
| 情绪强度滑块 | 0-100%强度 | 仅在选择了情绪后显示，默认50% |
| 故事输入框 | 记录背后故事 | 仅在选择"留声匣"归宿时显示，最多200字 |
| 归宿选择 | 4种处理方式 | 思绪阁楼/流星信箱/留声匣/焚信炉（焚信炉不保存，触发燃烧动画） |
| 焚信炉 | Canvas燃烧动画 | 点击焚信炉→弹出燃烧仪式对话框→Canvas绘制火焰粒子动画→显示情绪反馈文字→自动关闭 |
| 提交校验 | 内容+情绪+归宿三项必选 | 任意为空时提交按钮disabled |

**创建便签数据结构**：
```json
{
  "content": "富文本HTML内容",
  "emotion": "开心|平静|焦虑|愤怒|难过|感动|迷茫",
  "intensity": 50,
  "status": "思绪阁楼|流星信箱|留声匣",
  "story": "背后的故事文本"
}
```

---

### 4.3 寄存柜 (LogsPage)

**路由**：`/deposit/locker`  
**访问权限**：需要登录

**功能点**：
| 功能 | 描述 | 实现细节 |
|------|------|----------|
| 信纸列表 | 展示用户所有Note | 按情绪emoji+标签分类展示，情绪筛选tabs（全部+7种情绪） |
| 批量操作 | 多选信纸后操作 | checkbox选择（最多9条），可批量移入思绪阁楼/流星信箱/留声匣/删除/发表到回声广场 |
| 信纸详情 | 查看完整内容 | 弹窗展示内容/故事/时间，支持编辑 |
| 分页加载 | 点击加载更多 | 基于 `page` 和 `limit` 参数分页 |

---

### 4.4 思绪阁楼 (AtticPage)

**路由**：`/deposit/attic`  
**访问权限**：需要登录

**功能点**：
| 功能 | 描述 | 实现细节 |
|------|------|----------|
| 浮漂信纸展示 | 每张信纸独立悬浮，随机微偏移 | 过滤 `status === '思绪阁楼'` 的Note，卡片风格偏沉静 |
| 批量操作 | 多选信纸 | 移入寄存柜/流星信箱/发表/删除 |
| 信纸详情/编辑 | 查看+编辑 | 同寄存柜逻辑 |

**数据过滤**：`GET /notes?status=思绪阁楼`

---

### 4.5 流星信箱 (MeteorMailboxPage)

**路由**：`/deposit/meteor-mailbox`  
**访问权限**：需要登录

**功能点**：
| 功能 | 描述 | 实现细节 |
|------|------|----------|
| 心愿卡片墙 | 星形⭐装饰的信纸卡片 | 过滤 `status === '流星信箱'` 的Note，温韚色调 |
| 心愿统计 | 心愿总数展示 | 侧边栏统计卡片 |
| 批量操作 | 移入思绪阁楼/留声匣/发表/删除 | 最多选9条 |

---

### 4.6 留声匣 (VoiceBoxPage)

**路由**：`/deposit/voice-box`  
**访问权限**：需要登录

**功能点**：
| 功能 | 描述 | 实现细节 |
|------|------|----------|
| 美好卡片墙 | 心形💝装饰的信纸卡片 | 过滤 `status === '留声匣'` 的Note |
| 美好统计 | 总数/开心时刻/感动瞬间 | 前端按emotion过滤计算 |
| 批量操作 | 移入思绪阁楼/流星信箱/发表/删除 | 最多选9条 |

---

### 4.7 回声广场 (TreeholePage)

**路由**：`/plaza`  
**访问权限**：所有人可浏览列表，登录后才可查看详情

**功能点**：
| 功能 | 描述 | 实现细节 |
|------|------|----------|
| 情绪筛选 | 全部+7种情绪标签 | 切换触发重新请求 |
| 搜索 | 按内容关键词搜索 | 支持回车触发搜索 |
| 排序 | 最新/热门切换 | 热门按 `likeCount` 降序，最新按 `createdAt` 降序 |
| 心声卡片 | 匿名码+情绪标签+内容预览 | 头像取匿名码前2字，内容截断显示 |
| 点赞 | 红色❤️/白色🤍切换 | 需要登录，调用 `POST /treehole/:id/like` |
| 收藏 | 📌/📑切换 | 需要登录，调用 `POST /treehole/:id/bookmark` |
| 评论计数 | 💬 + 评论数 | 直接展示 `commentCount` 字段 |
| 分页加载 | 加载更多按钮 | 每页20条 |

**匿名码格式**：`形容词 + 名词 + 三位数字`（如：安静星星001、温柔微风099）

**发表心声入口**：页面顶部按钮，登录用户可见，跳转 `/creator/echo`

---

### 4.8 回声详情 (TreeholeDetail)

**路由**：`/plaza/:id`  
**访问权限**：需要登录

**功能点**：
| 功能 | 描述 | 实现细节 |
|------|------|----------|
| 树洞内容 | 完整展示心声内容 | 匿名码+情绪标签+发布时间+完整正文 |
| 评论区 | 评论列表 | 展示所有已审核通过的评论（头像首字+昵称+时间+内容） |
| 发表评论 | 文本输入提交 | 最多300字，提交后状态为"待审核" |
| 阅读历史 | 自动记录 | 访问详情页时自动写入用户阅读历史 |

---

### 4.9 夜灯书房 (ArticlesPage)

**路由**：`/study`  
**访问权限**：所有人可浏览

**功能点**：
| 功能 | 描述 | 实现细节 |
|------|------|----------|
| 分类筛选 | 全部+文章分类tabs | 动态获取分类列表 |
| 关键词搜索 | 标题/摘要搜索 | `$regex` 模糊匹配 |
| 文章卡片 | 情绪标签+分类+标题+摘要 | 卡片点击弹出详情Dialog |
| 详情Dialog | 完整文章阅读 | 标题/作者/分类/阅读量/富文本正文 |
| 收藏 | 📌/📑切换 | 需要登录 |
| 评论 | 弹窗发表评论 | 最多300字，提交后待审核 |
| 投稿入口 | 页面顶部按钮 | 跳转 `/creator/article` |

---

### 4.10 文章详情 (ArticleDetail)

**路由**：`/study/:id`  
**访问权限**：所有人可查看

**功能点**：
| 功能 | 描述 | 实现细节 |
|------|------|----------|
| 文章内容 | 标题/作者/日期/阅读量/正文 | 富文本渲染，访问时自动阅读计数+1 |
| 相关推荐 | 同情绪标签的其他文章 | 最多5篇，排除当前文章 |
| 收藏 | 登录用户可操作 | 切换收藏状态 |
| 评论区 | 评论列表+发表评论 | 300字限制，待审核 |
| 阅读历史 | 自动记录 | 记录到用户阅读历史中 |

---

### 4.11 创作者中心 (CreatorPage)

**路由**：`/creator`  
**访问权限**：需要登录

**功能点**：
| 功能 | 描述 | 实现细节 |
|------|------|----------|
| 快捷入口 | 发表心声/投稿文章 | 跳转对应创建页面 |
| 我的回声 | 个人发布树洞列表 | 展示状态标签（待审核/已发布/已驳回），支持编辑/删除/查看留言 |
| 我的文章 | 投稿文章列表 | 展示阅读量/点赞数，支持编辑/删除/查看评论 |
| 灵感便利贴 | 本地灵感记录 | 存储在localStorage（非服务端），彩色便签样式，支持添加/删除 |

---

### 4.12 发表心声 (CreatorEchoPage)

**路由**：`/creator/echo`  
**访问权限**：需要登录

**功能点**：
| 功能 | 描述 | 实现细节 |
|------|------|----------|
| 身份选择 | 匿名/实名 | 匿名显示"匿名邮民"，实名显示用户昵称 |
| 内容编辑 | 富文本编辑 | TipTap编辑器 |
| 情绪选择 | 7种情绪 | 按钮多选一 |
| 提交 | 提交审核 | 调用 `POST /treehole`，201表示成功，触发审核流程 |
| 危机检测 | 敏感词检测 | 含"自杀/自残/无助/绝望/不想活/想死"时返回 `crisis: true` |

---

### 4.13 投稿文章 (CreatorArticlePage)

**路由**：`/creator/article`  
**访问权限**：需要登录

**功能点**：
| 功能 | 描述 | 实现细节 |
|------|------|----------|
| 标题 | 最多50字 | Element Plus Input |
| 分类 | 下拉选择 | Element Plus Select |
| 情绪标签 | 7种情绪带emoji | 按钮多选一 |
| 摘要 | 最多100字 | Element Plus Textarea，显示字数统计 |
| 正文 | 富文本编辑器 | TipTap编辑器 |
| 提交 | 提交审核 | 调用 `POST /articles/submit`，文章状态为 `pending` |

---

### 4.14 成长归档室 (MonumentPage)

**路由**：`/archive`  
**访问权限**：需要登录

**功能点**：
| 功能 | 描述 | 实现细节 |
|------|------|----------|
| 收藏夹 | 文章收藏/心声收藏切换 | 调用 `GET /users/bookmarks?type=articles` 和 `?type=treeholes` |
| 我的信纸 | 所有Note列表 | 展示情绪标签+状态+内容+时间，支持编辑/删除 |
| 阅读记录 | 时间线展示 | 文章📚/树洞🌙类型区分，按阅读时间倒序 |

---

### 4.15 个人中心 (ProfilePage)

**路由**：`/profile`  
**访问权限**：需要登录

**功能点**：
| 功能 | 描述 | 实现细节 |
|------|------|----------|
| 用户卡片 | 头像首字+昵称+签名 | 头像为首字圆形，渐变色背景 |
| 数据统计 | 4维度统计 | 情绪记录总数/思绪阁楼数/流星信箱数/回声数 |
| 快捷操作 | 写便签/归档室/回声广场/阅读文章 | 4个快捷入口卡片 |
| 管理入口 | 审核中心 | 仅admin角色可见 |
| 导航 | 归档室/创作者中心/设置/退出 | 侧边栏菜单 |

---

### 4.16 设置 (SettingsPage)

**路由**：`/profile/settings`  
**访问权限**：需要登录

**功能点**：
| 功能 | 描述 | 实现细节 |
|------|------|----------|
| 基本信息 | 昵称/签名/邮箱编辑 | Element Plus表单，调用 `PUT /auth/me` |
| 隐私设置 | 心愿墙可见开关 | el-switch组件，调用 `PUT /auth/me` |
| 数据导出 | JSON格式下载 | 调用 `GET /users/export`，浏览器触发下载 |
| 删除账号 | 永久删除所有数据 | 二次确认弹窗，调用 `DELETE /users/account` |

---

### 4.17 审核中心 (AdminPage)

**路由**：`/admin`  
**访问权限**：管理员

**功能点**：
| 功能 | 描述 | 实现细节 |
|------|------|----------|
| 审核tabs | 4类待审核内容 | 树洞/树洞评论/文章/文章评论，各自显示待审核数量 |
| 树洞审核 | 展示匿名码+情绪+内容 | 通过/驳回按钮 |
| 树洞评论审核 | 展示评论人+所属树洞+内容 | 通过/驳回按钮 |
| 文章审核 | 展示标题+作者+摘要 | 预览/通过/驳回按钮，预览以Dialog展示完整文章 |
| 文章评论审核 | 展示评论人+所属文章+内容 | 通过/驳回按钮 |
| 评论计数同步 | 审核通过时自增count | 树洞评论通过→treehole.commentCount+1，文章评论通过→article.commentCount+1 |

---

## 5. 数据模型设计

### 5.1 User（用户表）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `_id` | ObjectId | 是 | 自动生成 |
| `username` | String(3-20) | 是 | 唯一，登录名 |
| `password` | String(≥6) | 是 | bcrypt加密存储 |
| `email` | String | 否 | 稀疏索引，用于找回密码 |
| `nickname` | String(≤30) | 否 | 展示名称，默认同username |
| `avatar` | String | 否 | 头像URL（当前版本未使用） |
| `signature` | String(≤100) | 否 | 个性签名 |
| `role` | String | 是 | `user` 或 `admin`，默认 `user` |
| `loginFailCount` | Number | 否 | 登录失败计数，达到5次锁定15分钟 |
| `lockUntil` | Date | 否 | 账号锁定截止时间 |
| `privacySettings.allowViewWishwall` | Boolean | 否 | 心愿墙隐私开关，默认true |
| `likedArticles` | [String] | 否 | 点赞的文章ID数组 |
| `likedTreeholes` | [String] | 否 | 点赞的树洞ID数组 |
| `bookmarkedArticles` | [String] | 否 | 收藏的文章ID数组 |
| `bookmarkedTreeholes` | [String] | 否 | 收藏的树洞ID数组 |
| `readingHistory` | [Embedded] | 否 | 阅读历史子文档数组 |
| `createdAt` | Date | 是 | 自动生成 |
| `updatedAt` | Date | 是 | 自动更新 |

**阅读历史子文档**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | String | 文章/树洞ID |
| `type` | String(`article`\|`treehole`) | 内容类型 |
| `title` | String | 标题/内容摘要 |
| `emotion` | String | 情绪标签 |
| `readAt` | Date | 阅读时间 |

**密码安全**：
- 存储前使用 `bcryptjs` 进行 `saltRounds=10` 的哈希
- `toJSON()` 方法自动剔除 `password`、`loginFailCount`、`lockUntil` 字段
- 登录失败5次后账号锁定15分钟

---

### 5.2 Note（便签/信纸表）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `_id` | ObjectId | 是 | 自动生成 |
| `userId` | ObjectId(ref:User) | 是 | 所属用户 |
| `content` | String(≤800) | 是 | 信纸内容（富文本HTML） |
| `emotion` | String(enum) | 是 | `开心\|平静\|焦虑\|愤怒\|难过\|感动\|迷茫` |
| `intensity` | Number(0-100) | 否 | 情绪强度，默认50 |
| `status` | String(enum) | 是 | `思绪阁楼\|流星信箱\|留声匣`，默认`思绪阁楼` |
| `story` | String(≤200) | 否 | 背后故事（仅留声匣使用） |
| `reminderDate` | Date | 否 | 提醒日期（预留字段） |
| `createdAt` | Date | 是 | 自动生成 |
| `updatedAt` | Date | 是 | 自动更新 |

**索引**：`{ userId: 1, createdAt: -1 }`、`{ emotion: 1 }`、`{ status: 1 }`

**历史迁移记录**：旧版 `status` 值 `['日志','悬置','纪念']` 已通过 `migrate-notes.js` 迁移为新值：
- `日志` / `悬置` → `思绪阁楼`
- `纪念`（开心/感动）→ `留声匣`
- `纪念`（其他情绪）→ `流星信箱`

---

### 5.3 Treehole（树洞/心声表）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `_id` | ObjectId | 是 | 自动生成 |
| `userId` | ObjectId(ref:User) | 否 | 发布者用户ID |
| `anonymousCode` | String | 是 | 匿名显示码 |
| `content` | String(≤500) | 是 | 心声内容 |
| `emotion` | String(enum) | 是 | `开心\|平静\|焦虑\|愤怒\|难过\|感动\|迷茫` |
| `status` | String(enum) | 是 | `待审核\|已发布\|已驳回`，默认`待审核` |
| `isAnonymous` | Boolean | 否 | 是否匿名，默认true |
| `rejectReason` | String | 否 | 驳回原因 |
| `commentCount` | Number | 否 | 评论计数，默认0 |
| `likeCount` | Number | 否 | 点赞计数，默认0 |
| `createdAt` | Date | 是 | 自动生成 |
| `updatedAt` | Date | 是 | 自动更新 |

**索引**：`{ status: 1, createdAt: -1 }`、`{ emotion: 1 }`

---

### 5.4 Article（文章表）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `_id` | ObjectId | 是 | 自动生成 |
| `title` | String(≤100) | 是 | 文章标题 |
| `cover` | String | 否 | 封面图片URL |
| `summary` | String(≤200) | 否 | 文章摘要 |
| `content` | String | 是 | 文章正文（富文本HTML） |
| `emotion` | String(enum) | 否 | `全部\|开心\|平静\|焦虑\|愤怒\|难过\|感动\|迷茫` |
| `category` | String | 否 | 分类，默认`情绪管理` |
| `readCount` | Number | 否 | 阅读量，默认0 |
| `commentCount` | Number | 否 | 评论计数，默认0 |
| `status` | String(enum) | 否 | `草稿\|已发布`，默认`已发布` |
| `author` | String | 否 | 作者，默认`官方` |
| `createdAt` | Date | 是 | 自动生成 |
| `updatedAt` | Date | 是 | 自动更新 |

**索引**：`{ emotion: 1, status: 1 }`、`{ createdAt: -1 }`

---

### 5.5 Comment（评论表）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `_id` | ObjectId | 是 | 自动生成 |
| `treeholeId` | ObjectId(ref:Treehole) | 否 | 所属树洞（树洞评论） |
| `articleId` | ObjectId(ref:Article) | 否 | 所属文章（文章评论） |
| `userId` | ObjectId(ref:User) | 否 | 评论者ID |
| `anonymousCode` | String | 否 | 匿名码（预留） |
| `content` | String(≤300) | 是 | 评论内容 |
| `status` | String(enum) | 是 | `待审核\|已发布\|已驳回`，默认`待审核` |
| `createdAt` | Date | 是 | 自动生成 |

**索引**：`{ treeholeId: 1, status: 1, createdAt: -1 }`、`{ articleId: 1, status: 1, createdAt: -1 }`

---

## 6. API 接口设计

### 6.1 认证模块 `/api/auth`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/register` | 无 | 用户注册（username+password+email） |
| POST | `/login` | 无 | 用户登录，返回JWT token |
| POST | `/logout` | auth | 退出登录（客户端清除token） |
| GET | `/me` | auth | 获取当前用户信息 |
| PUT | `/me` | auth | 更新个人信息（nickname/avatar/signature/email/privacySettings） |

**登录安全机制**：
- 连续失败5次 → 锁定15分钟
- 登录成功后重置失败计数和锁定状态

---

### 6.2 便签模块 `/api/notes`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/` | auth | 创建便签（content/emotion/intensity/status/story/reminderDate） |
| GET | `/` | auth | 获取便签列表（支持status/emotion/日期范围筛选，分页） |
| GET | `/stats/summary` | auth | 情绪统计（支持days参数：7天/30天） |
| GET | `/:id` | auth | 获取单条便签详情 |
| PUT | `/:id` | auth | 编辑便签 |
| DELETE | `/:id` | auth | 删除便签 |

---

### 6.3 树洞模块 `/api/treehole`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/` | auth | 发布心声（content/emotion/isAnonymous）→状态为"待审核" |
| GET | `/` | optionalAuth | 获取已发布树洞列表（emotion/sort/keyword筛选，分页） |
| GET | `/recommend` | 无 | 随机推荐4条树洞 |
| GET | `/my/posts` | auth | 获取当前用户发布的所有树洞 |
| GET | `/:id` | optionalAuth | 获取树洞详情+已发布评论 |
| POST | `/:id/comments` | auth | 发表评论（→待审核） |
| PUT | `/:id/resubmit` | auth | 重新提交被驳回的树洞 |
| DELETE | `/:id` | auth | 删除自己的树洞（同时删除评论） |
| POST | `/:id/like` | auth | 点赞/取消点赞 |
| GET | `/:id/like/status` | auth | 点赞状态查询 |
| POST | `/:id/bookmark` | auth | 收藏/取消收藏 |
| GET | `/:id/bookmark/status` | auth | 收藏状态查询 |

---

### 6.4 文章模块 `/api/articles`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/` | optionalAuth | 获取已发布文章列表（emotion/category/keyword筛选，分页） |
| GET | `/:id` | optionalAuth | 获取文章详情（自动阅读+1，记录阅读历史，返回相关推荐） |
| POST | `/` | auth+adminAuth | 管理员直接创建已发布文章 |
| POST | `/submit` | auth | 用户投稿（→pending状态，待审核） |
| PUT | `/:id` | auth+adminAuth | 编辑文章 |
| DELETE | `/:id` | auth+adminAuth | 删除文章（同时删除文章评论） |
| POST | `/:id/like` | auth | 点赞/取消点赞 |
| GET | `/:id/like/status` | auth | 点赞状态查询 |
| POST | `/:id/bookmark` | auth | 收藏/取消收藏 |
| GET | `/:id/bookmark/status` | auth | 收藏状态查询 |
| GET | `/admin/pending` | auth+adminAuth | 获取待审核文章 |
| GET | `/admin/pending-comments` | auth+adminAuth | 获取待审核文章评论 |
| PUT | `/admin/:id/review` | auth+adminAuth | 审核文章（status+rejectReason） |
| PUT | `/admin/comments/:id/review` | auth+adminAuth | 审核文章评论（通过时article.commentCount+1） |

---

### 6.5 用户模块 `/api/users`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/profile` | auth | 获取个人资料 |
| GET | `/notes` | auth | 获取用户便签（status/emotion筛选） |
| GET | `/treeholes` | auth | 获取用户树洞列表 |
| GET | `/bookmarks` | auth | 获取收藏列表（type=articles\|treeholes） |
| DELETE | `/bookmarks/:type/:id` | auth | 取消收藏 |
| GET | `/reading-history` | auth | 获取阅读历史（最多100条） |
| POST | `/reading-history` | auth | 记录阅读历史（id/type/title/emotion） |
| GET | `/export` | auth | 导出用户数据（JSON） |
| DELETE | `/account` | auth | 删除账号及所有关联数据 |
| GET | `/admin/users` | auth+adminAuth | 管理员获取用户列表 |
| GET | `/admin/pending/treeholes` | auth+adminAuth | 管理员获取待审核树洞 |
| GET | `/admin/pending/comments` | auth+adminAuth | 管理员获取待审核树洞评论 |
| PUT | `/admin/treeholes/:id/review` | auth+adminAuth | 审核树洞 |
| PUT | `/admin/comments/:id/review` | auth+adminAuth | 审核树洞评论（通过时treehole.commentCount+1） |

---

### 6.6 健康检查

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 服务健康检查，返回数据库连接状态 |

---

### 6.7 通用规范

**请求/响应格式**：
```json
// 成功响应
{ "code": 200, "message": "成功", "data": { ... } }

// 创建成功
{ "code": 201, "message": "创建成功", "data": { ... } }

// 错误响应
{ "code": 400, "message": "参数错误" }
{ "code": 401, "message": "请先登录" }
{ "code": 403, "message": "需要管理员权限" }
{ "code": 404, "message": "内容不存在" }
{ "code": 500, "message": "服务器错误" }
```

**认证方式**：Bearer Token，Header格式 `Authorization: Bearer <jwt_token>`，Token有效期7天

**限流**：全局限流中间件已配置（当前被注释），1分钟最多1000次请求

---

## 7. 交互与视觉设计

### 7.1 全局色彩体系

| CSS变量 | 色值 | 用途 |
|---------|------|------|
| `--color-parchment` | #F5F0E8 | 羊皮纸/主背景 |
| `--color-cream` | #FAF6F0 | 米白/次级背景 |
| `--color-mist-gray` | #C5C1B9 | 雾灰/边框分割 |
| `--color-deep-blue-gray` | #4A5568 | 深蓝灰/主文字 |
| `--color-warm-brown` | #8B7355 | 暖棕/强调色 |
| `--color-moonlight` | #D1CDC7 | 月光灰/辅助文字 |
| `--color-night-blue` | #2D3748 | 暗夜蓝/深色背景 |
| `--color-amber-glow` | #D4A574 | 琥珀暖光/高亮 |
| `--color-candle` | #E8C9A0 | 烛光/卡片高亮 |
| `--color-ash` | #A09890 | 灰烬/次要信息 |

**设计禁令**：纯白(#FFF)、荧光色、高饱和色、霓虹色统统不允许使用。

### 7.2 全局动效

| 动效 | 说明 |
|------|------|
| **飘尘粒子** | 全站背景层 DustParticles.vue 组件，Canvas绘制微小粒子，极缓飘动，低透明度 |
| **NavBar指示器** | 导航栏底部滑动指示条，transition 0.4s ease |
| **卡片Hover** | 缓慢点亮效果，柔和阴影增强 |

### 7.3 页面主题色

不同页面采用独特的深色背景渐变，与功能情绪匹配：

| 页面 | 背景风格 |
|------|----------|
| 门厅/设置 | 浅色羊皮纸背景 |
| 心事寄存处 | 深色夜蓝渐变（模拟深夜邮局氛围） |
| 回声广场 | 舒缓暗调 |
| 夜灯书房 | 暖棕暗色（烛光阅读氛围） |
| 个人中心 | 深色暖棕渐变 |
| 成长归档室 | 档案室暗色 |

### 7.4 信纸质感卡片规范

- 纸张纹理背景（CSS渐变模拟）
- 暖灯光影阴影
- 大圆角 12px+
- 充足内边距 24px+
- 边框 1px rgba半透明暖色

### 7.5 排版规范

- 字体：`system-ui, -apple-system, "PingFang SC", "Microsoft YaHei"` 系列
- 行高：正文 1.8，标题适当收紧
- 字间距：0.01em
- 标题字体：衬线体（`font-family: var(--font-serif)`）用于品牌标题

### 7.6 情绪标签系统

7种情绪各具独立色彩：

| 情绪 | emoji | CSS类后缀 | 关联颜色 |
|------|-------|-----------|----------|
| 开心 | 😊 | `emotion-tag--开心` | #FFD93D（暖黄） |
| 平静 | 🍃 | `emotion-tag--平静` | #6BCB77（柔和绿） |
| 焦虑 | ☁️ | `emotion-tag--焦虑` | #FF6B6B（浅红） |
| 愤怒 | 🔥 | `emotion-tag--愤怒` | #FF8C42（橙红） |
| 难过 | 💧 | `emotion-tag--难过` | #4D96FF（蓝） |
| 感动 | 💕 | `emotion-tag--感动` | #FFB3BA（粉） |
| 迷茫 | 🌫️ | `emotion-tag--迷茫` | #9B59B6（紫） |

### 7.7 响应式布局

- 桌面端优先设计
- 心事寄存处使用三栏布局（left-center-right）
- 其他页面采用单栏/双栏自适应
- 最小宽度兼容至 768px

---

## 8. 非功能性需求

### 8.1 安全性

| 需求 | 实现 |
|------|------|
| 密码存储 | bcrypt哈希，saltRounds=10 |
| JWT认证 | jsonwebtoken签名，7天过期 |
| 账号防暴力破解 | 连续5次登录失败锁定15分钟 |
| 管理员鉴权 | adminAuth中间件，role===admin校验 |
| 内容审核 | 所有UGC（树洞/评论/文章）默认"待审核"状态 |
| 危机干预 | 树洞发布时检测"自杀/自残/无助/绝望/不想活/想死"关键词 |
| 敏感词过滤 | helpers.js 定义 SENSITIVE_WORDS |

### 8.2 数据隐私

| 需求 | 实现 |
|------|------|
| 用户密码不可见 | toJSON()自动剔除 |
| 登录失败信息不可见 | toJSON()自动剔除 |
| 心愿墙隐私 | privacySettings.allowViewWishwall 开关 |
| 匿名倾诉 | 匿名码替代真实昵称 |
| 数据导出 | JSON格式，用户可随时导出 |
| 账号删除 | 彻底删除用户及所有关联数据（Note/Treehole/Comment） |

### 8.3 性能

| 需求 | 实现 |
|------|------|
| 分页加载 | 列表默认20条/页，支持加载更多 |
| 数据库索引 | 所有常用查询字段均已建立索引 |
| 连接池 | MongoDB maxPoolSize=10 |
| 超时配置 | serverSelectionTimeoutMS=5000, socketTimeoutMS=45000 |
| 限流保护 | express-rate-limit，1000次/分钟（当前注释） |
| 前端代码分割 | Vue Router懒加载（动态import） |

### 8.4 可维护性

- 前端使用 Pinia 状态管理，store按模块划分（user/notes/treehole）
- 后端路由按职责划分（auth/articles/treehole/notes/users）
- 数据迁移脚本（migrate-notes.js）支持平滑升级
- 初始化数据脚本（initData.js）包含10条样例树洞数据
- 创建管理员脚本（createAdmin.js）用于初始化管理员账号
- 已有完整的 Spec/checklist/tasks 研发文档8套

---

## 9. 技术架构

### 9.1 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| **前端框架** | Vue 3 (Composition API) | ^3.x |
| **构建工具** | Vite | ^5.x |
| **路由** | Vue Router 4 | ^4.x |
| **状态管理** | Pinia | ^2.x |
| **HTTP客户端** | Axios | - |
| **富文本编辑器** | TipTap (基于ProseMirror) | - |
| **UI组件库** | Element Plus | - |
| **后端框架** | Express.js | ^4.x |
| **数据库** | MongoDB + Mongoose | - |
| **认证** | JWT (jsonwebtoken) + bcryptjs | - |
| **运行时** | Node.js | - |

### 9.2 项目结构

```
Mood_post_office/
├── client/                        # Vue 3 前端
│   ├── src/
│   │   ├── assets/styles/         # 全局SCSS样式
│   │   ├── components/            # 公共组件
│   │   │   ├── DustParticles.vue  # 飘尘粒子
│   │   │   ├── NavBar.vue         # 导航栏
│   │   │   └── RichTextEditor.vue # TipTap富文本
│   │   ├── router/index.js        # 路由配置
│   │   ├── stores/index.js        # Pinia状态管理
│   │   ├── views/                 # 16个页面视图
│   │   ├── App.vue                # 根组件
│   │   └── main.js                # 入口
│   ├── index.html
│   └── vite.config.js
├── server/                        # Express 后端
│   ├── src/
│   │   ├── middleware/auth.js     # 认证中间件
│   │   ├── models/                # 5个Mongoose模型
│   │   ├── routes/                # 5个路由模块
│   │   ├── utils/helpers.js       # 工具函数
│   │   ├── index.js               # 服务器入口
│   │   └── migrate-notes.js       # 数据迁移脚本
│   ├── scripts/
│   │   ├── initData.js            # 样例数据初始化
│   │   └── createAdmin.js         # 创建管理员
│   └── .env                       # 环境变量
└── .trae/specs/                   # 8套研发规范文档
```

### 9.3 路由映射（前端）

| 路由路径 | 路由名称 | 页面组件 | 权限 |
|----------|----------|----------|------|
| `/` | Lobby | HomePage | 公开 |
| `/auth` | Auth | AuthPage | 公开 |
| `/deposit` | HeartPost | RecycleStation | 需登录 |
| `/deposit/locker` | Locker | LogsPage | 需登录 |
| `/deposit/attic` | Attic | AtticPage | 需登录 |
| `/deposit/meteor-mailbox` | MeteorMailbox | MeteorMailboxPage | 需登录 |
| `/deposit/voice-box` | VoiceBox | VoiceBoxPage | 需登录 |
| `/plaza` | EchoSquare | TreeholePage | 公开 |
| `/plaza/:id` | EchoDetail | TreeholeDetail | 需登录 |
| `/study` | NightStudy | ArticlesPage | 公开 |
| `/study/:id` | NightStudyDetail | ArticleDetail | 公开 |
| `/profile` | Profile | ProfilePage | 需登录 |
| `/archive` | Archive | MonumentPage | 需登录 |
| `/profile/settings` | Settings | SettingsPage | 需登录 |
| `/admin` | Admin | AdminPage | 需登录+管理员 |
| `/creator` | Creator | CreatorPage | 需登录 |
| `/creator/echo` | CreatorEcho | CreatorEchoPage | 需登录 |
| `/creator/article` | CreatorArticle | CreatorArticlePage | 需登录 |

---

## 10. 版本路线规划

### v1.0（当前版本 - 已完成）

- [x] 用户注册/登录（含防暴力破解）
- [x] 心事寄存处（写作台 + 4种归宿 + 焚信炉）
- [x] 寄存柜/思绪阁楼/流星信箱/留声匣（便签CRUD + 批量操作）
- [x] 回声广场（树洞列表/详情/发布/评论/点赞/收藏/搜索/排序）
- [x] 夜灯书房（文章列表/详情/评论/收藏/搜索/投稿/相关推荐）
- [x] 创作者中心（我的回声/我的文章/灵感便利贴）
- [x] 成长归档室（收藏夹/我的信纸/阅读记录）
- [x] 个人中心 + 设置（基本信息/隐私/数据导出/删除账号）
- [x] 审核中心（树洞/评论/文章/文章评论四类审核）
- [x] 全站UI重构（深夜邮局美学/飘尘粒子/信纸质感）
- [x] 门厅首页（心情分布/呼吸引导/冥想引导/推荐树洞）
- [x] 全局NavBar（5大板块导航指示器）
- [x] 数据迁移脚本（status枚举值更新）

### v1.1（建议后续迭代）

- [ ] 密码找回（邮箱验证）
- [ ] 头像上传功能
- [ ] 文章封面图片上传
- [ ] 树洞/文章举报功能
- [ ] 管理员用户管理页面（当前仅API）
- [ ] 通知系统（审核结果通知/评论回复通知）
- [ ] 提醒日期功能（流星信箱心愿到期提醒）

### v2.0（长期规划）

- [ ] 移动端适配 / PWA
- [ ] AI情绪分析（根据信纸内容自动推荐情绪标签）
- [ ] 情绪趋势图表（周报/月报）
- [ ] 音频引导冥想
- [ ] 社区圈子功能
- [ ] 专业心理咨询师入驻
- [ ] 白噪声/背景音乐播放器

---

## 附录

### A. 环境配置

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/mood_memo2
JWT_SECRET=mood_memo_secret_key_2024
JWT_EXPIRES_IN=7d
```

### B. 研发规范文档列表

项目在 `.trae/specs/` 目录下包含以下规范文档：

1. `enhance-creator-writing/` — 创作者写作体验增强
2. `feature-optimization-001/` — 功能优化
3. `fix-comment-count/` — 评论计数修复
4. `fix-mongodb-connection/` — MongoDB连接修复
5. `fix-rate-limiter-429/` — 限流429修复
6. `rebrand-heart-post-office/` — 品牌重构为心事邮局
7. `site-polish-002/` — 站点打磨
8. `unify-writing-experience/` — 统一写作体验

### C. 启动命令

```bash
# 前端
cd client
npm install
npm run dev

# 后端
cd server
npm install
npm run dev
```