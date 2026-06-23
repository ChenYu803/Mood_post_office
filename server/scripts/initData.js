require('dotenv').config();
const mongoose = require('mongoose');
const Treehole = require('../src/models/Treehole');
const Article = require('../src/models/Article');

async function initData() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  const treeholeSamples = [
    {
      content: '今天工作压力好大，感觉喘不过气来。项目deadline快到了，但进度还差很多，不知道该怎么办...',
      emotion: '焦虑',
      status: '已发布',
      anonymousCode: '匿名人A12',
      likeCount: 12,
      commentCount: 0
    },
    {
      content: '刚刚收到了大学室友的消息，说下个月要结婚了。时间过得真快啊，一转眼我们都长大了。',
      emotion: '感动',
      status: '已发布',
      anonymousCode: '匿名人B34',
      likeCount: 28,
      commentCount: 0
    },
    {
      content: '周末一个人去了公园，坐在长椅上看落叶。阳光透过树叶洒下来，那一刻感觉特别平静。',
      emotion: '平静',
      status: '已发布',
      anonymousCode: '匿名人C56',
      likeCount: 45,
      commentCount: 0
    },
    {
      content: '和男朋友吵架了，因为一点小事。明明不是什么大问题，但就是控制不住发脾气。',
      emotion: '愤怒',
      status: '已发布',
      anonymousCode: '匿名人D78',
      likeCount: 15,
      commentCount: 0
    },
    {
      content: '考研二战失败了，不知道接下来该怎么办。感觉自己很没用，辜负了家人的期望...',
      emotion: '难过',
      status: '已发布',
      anonymousCode: '匿名人E90',
      likeCount: 56,
      commentCount: 0
    },
    {
      content: '今天终于把拖延了很久的项目完成了！原来只要开始做，也没有想象中那么难。',
      emotion: '开心',
      status: '已发布',
      anonymousCode: '匿名人F11',
      likeCount: 34,
      commentCount: 0
    },
    {
      content: '毕业后留在了大城市工作，但感觉自己好像不属于这里。不知道未来在哪里...',
      emotion: '迷茫',
      status: '已发布',
      anonymousCode: '匿名人G22',
      likeCount: 41,
      commentCount: 0
    },
    {
      content: '养了三年的猫咪昨天走了，到现在还不敢相信。谢谢你陪我度过了这么美好的时光。',
      emotion: '难过',
      status: '已发布',
      anonymousCode: '匿名人H33',
      likeCount: 89,
      commentCount: 0
    },
    {
      content: '今天和父母视频，妈妈说爸爸学会了用手机发朋友圈，还发了我的照片。心里暖暖的。',
      emotion: '感动',
      status: '已发布',
      anonymousCode: '匿名人I44',
      likeCount: 67,
      commentCount: 0
    },
    {
      content: '连续加班两周了，身体好累，但又不敢请假。成年人的世界真的没有容易二字。',
      emotion: '难过',
      status: '已发布',
      anonymousCode: '匿名人J55',
      likeCount: 72,
      commentCount: 0
    }
  ];

  const existingCount = await Treehole.countDocuments({ status: '已发布' });
  if (existingCount === 0) {
    await Treehole.insertMany(treeholeSamples);
    console.log('树洞样例数据已添加');
  } else {
    console.log('树洞已有数据，跳过初始化');
  }

  const articleSamples = [
    {
      title: '如何应对工作压力：5个实用技巧',
      summary: '工作压力是每个人都会遇到的问题，本文介绍了5个简单有效的方法来帮助你缓解压力，保持身心健康。',
      content: '<p>在现代快节奏的工作环境中，压力已经成为了许多人生活的一部分。适当的压力可以激励我们前进，但长期处于高压状态会对身心健康造成负面影响。</p><p><strong>技巧一：学会时间管理</strong></p><p>合理规划工作时间，使用番茄工作法等工具帮助自己保持专注。将大任务分解成小目标，每次专注完成一小部分。</p><p><strong>技巧二：建立边界</strong></p><p>学会在工作和生活之间建立清晰的界限。下班后尽量不要查看工作邮件，给自己留出休息和充电的时间。</p><p><strong>技巧三：运动释放压力</strong></p><p>运动是释放压力的有效方式。每天抽出30分钟进行有氧运动，可以有效降低压力激素水平。</p><p><strong>技巧四：培养兴趣爱好</strong></p><p>拥有一项与工作无关的爱好可以帮助你转移注意力，在工作之余找到乐趣和成就感。</p><p><strong>技巧五：寻求支持</strong></p><p>不要独自承受压力。与同事、朋友或家人交流，寻求他们的支持和建议。必要时可以寻求专业心理咨询。</p>',
      emotion: '平静',
      category: '情绪管理',
      status: '已发布',
      readCount: 1234,
      likeCount: 89,
      commentCount: 0,
    },
    {
      title: '人际关系中的边界感：学会说不',
      summary: '在人际关系中保持适当的边界感是非常重要的。本文探讨了为什么说\"不\"如此困难，以及如何优雅地拒绝他人。',
      content: '<p>在人际交往中，很多人都难以拒绝他人的请求。我们害怕伤害别人的感情，担心被认为自私，或者仅仅是不知道如何说\"不\"。</p><p><strong>为什么说\"不\"这么难？</strong></p><p>说\"不\"困难的原因有很多。可能是我们害怕冲突，可能是我们想被他人喜欢，也可能是我们对自己的价值感不确定。</p><p><strong>学会说\"不\"的好处</strong></p><p>保持健康的边界感对身心健康至关重要。它可以帮助你：</p><ul><li>保护自己的时间和精力</li><li>减少不必要的压力</li><li>建立更健康的人际关系</li><li>增强自我价值感</li></ul><p><strong>如何优雅地说\"不\"</strong></p><p>说\"不\"并不意味着粗鲁或冷漠。你可以：</p><ol><li>感谢对方的信任</li><li>清晰地表达自己的决定</li><li>如果合适，可以提供替代方案</li><li>保持友好的态度</li></ol>',
      emotion: '平静',
      category: '人际关系',
      status: '已发布',
      readCount: 856,
      likeCount: 67,
      commentCount: 0,
    },
    {
      title: '自我接纳：拥抱不完美的自己',
      summary: '自我接纳是心理健康的基石。本文探讨了什么是自我接纳，为什么它如此重要，以及如何开始接纳自己。',
      content: '<p>在这个追求完美的社会中，我们很容易对自己产生不满。我们总是关注自己的缺点，忘记了欣赏自己的优点。</p><p><strong>什么是自我接纳？</strong></p><p>自我接纳是指无条件地接受自己的全部，包括优点和缺点。这并不意味着我们不需要成长和改进，而是意味着我们在努力成长的同时，也接受当下的自己。</p><p><strong>自我接纳的好处</strong></p><p>研究表明，自我接纳与更高的幸福感、更低的焦虑水平和更好的心理健康相关。</p><p><strong>如何培养自我接纳</strong></p><p>培养自我接纳是一个持续的过程。你可以尝试：</p><ul><li>练习自我同情，像对待朋友一样对待自己</li><li>关注自己的优点和成就</li><li>接受自己的情绪，无论是积极还是消极</li><li>设定现实的期望</li><li>学会原谅自己的错误</li></ul>',
      emotion: '平静',
      category: '自我成长',
      status: '已发布',
      readCount: 2156,
      likeCount: 156,
      commentCount: 0
    },
    {
      title: '职场中的情绪管理：保持专业与真实的平衡',
      summary: '在职场中，我们常常需要在保持专业形象和表达真实情感之间找到平衡。本文提供了一些实用的建议。',
      content: '<p>职场是一个需要专业素养的地方，但这并不意味着我们需要完全压抑自己的情感。找到专业与真实之间的平衡点是关键。</p><p><strong>认识情绪的重要性</strong></p><p>情绪是我们内心状态的反映，忽视它们可能会导致更大的问题。学会识别和理解自己的情绪是情绪管理的第一步。</p><p><strong>在职场中表达情绪的技巧</strong></p><p>表达情绪并不意味着失控。你可以：</p><ol><li>选择合适的时机和场合</li><li>用\"我\"语言表达感受</li><li>保持冷静和尊重</li><li>寻求建设性的解决方案</li></ol><p><strong>管理压力和情绪的策略</strong></p><p>建立健康的应对机制，如深呼吸、短暂休息、与同事交流等，可以帮助你在职场中保持良好的情绪状态。</p>',
      emotion: '平静',
      category: '职场心理',
      status: '已发布',
      readCount: 987,
      likeCount: 78,
      commentCount: 0
    },
    {
      title: '亲子沟通：如何与青春期孩子建立良好关系',
      summary: '青春期是孩子成长的关键时期，也是亲子关系面临挑战的时期。本文分享了与青春期孩子沟通的有效方法。',
      content: '<p>青春期的孩子正在经历身体和心理上的巨大变化，他们渴望独立但又需要支持。作为父母，如何与他们建立良好的沟通是一个重要的课题。</p><p><strong>理解青春期的特点</strong></p><p>青春期的孩子正在形成自我认同，他们开始质疑权威，更加关注同伴关系。了解这些特点可以帮助你更好地理解他们的行为。</p><p><strong>有效的沟通技巧</strong></p><p>与青春期孩子沟通需要耐心和技巧：</p><ul><li>倾听比说教更重要</li><li>尊重他们的隐私和边界</li><li>用平等的态度交流</li><li>寻找共同话题</li><li>给予适当的空间</li></ul><p><strong>建立信任的基础</strong></p><p>信任是良好沟通的基础。当孩子感到被信任和尊重时，他们更愿意分享自己的想法和感受。</p>',
      emotion: '平静',
      category: '亲子关系',
      status: '已发布',
      readCount: 1567,
      likeCount: 123,
      commentCount: 0
    }
  ];

  const existingArticles = await Article.countDocuments({ status: '已发布' });
  if (existingArticles === 0) {
    await Article.insertMany(articleSamples);
    console.log('文章样例数据已添加');
  } else {
    console.log('文章已有数据，跳过初始化');
  }

  await mongoose.disconnect();
  console.log('数据初始化完成');
}

initData().catch(err => {
  console.error('初始化失败:', err);
  process.exit(1);
});