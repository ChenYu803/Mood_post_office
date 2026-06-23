<template>
  <div class="articles-page">
    <main class="articles-main">
      <div class="container">
        <div class="page-header">
          <h1 class="page-header__title">夜灯书房</h1>
          <p class="page-header__subtitle">在暖灯下阅读与思考</p>
          <button class="submit-btn" @click="$router.push('/creator/article')">📝 投稿文章</button>
        </div>

        <div class="filter-bar">
          <div class="filter-tabs">
            <button 
              :class="['filter-tab', { active: currentFilter === 'all' }]"
              @click="currentFilter = 'all'; fetchArticles()"
            >全部</button>
            <button 
              v-for="category in categories" 
              :key="category"
              :class="['filter-tab', { active: currentFilter === category }]"
              @click="currentFilter = category; fetchArticles()"
            >{{ category }}</button>
          </div>
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="搜索文章..."
              @keyup.enter="fetchArticles()"
            />
            <button @click="fetchArticles()">搜索</button>
          </div>
        </div>

        <div class="articles-grid" v-loading="loading">
          <div 
            v-for="article in articles" 
            :key="article._id"
            class="article-card"
          >
            <div 
              class="article-card__cover" 
              :style="{ background: getCategoryColor(article.category) }"
              @click="viewArticle(article)"
            >
              <span class="cover-icon">{{ getCategoryIcon(article.category) }}</span>
            </div>
            <div class="article-card__content">
              <span :class="['emotion-tag', `emotion-tag--${article.emotion}`]">{{ article.emotion }}</span>
              <h3 class="article-card__title" @click="viewArticle(article)">{{ article.title }}</h3>
              <p class="article-card__summary" @click="viewArticle(article)">{{ article.summary }}</p>
              <div class="article-card__meta">
                <span class="meta-item author">✍️ {{ article.author?.nickname || '管理员' }}</span>
                <span class="meta-item">👁️ {{ article.readCount }}</span>
                <button 
                  class="meta-item meta-item--btn" 
                  :class="{ bookmarked: article.bookmarked }"
                  @click.stop="handleBookmark(article)"
                  v-if="userStore.isLoggedIn"
                >
                  <span>{{ article.bookmarked ? '📌' : '📑' }}</span>
                </button>
                <span class="meta-item">💬 {{ article.commentCount || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="empty-state" v-if="!loading && articles.length === 0">
          <div class="empty-state__icon">🕯️</div>
          <p class="empty-state__text">书架上还没有文章</p>
        </div>
      </div>
    </main>

    <el-dialog v-model="showArticleDetail" title="" width="600px">
      <div class="article-detail" v-if="currentArticle">
        <div class="detail-header">
          <span :class="['emotion-tag', `emotion-tag--${currentArticle.emotion}`]">{{ currentArticle.emotion }}</span>
          <span :class="['category-badge', `category-badge--${currentArticle.category}`]">{{ currentArticle.category }}</span>
        </div>
        <h2 class="detail-title">{{ currentArticle.title }}</h2>
        <div class="detail-meta">
          <span>✍️ {{ currentArticle.author?.nickname || '管理员' }}</span>
          <span>阅读量: {{ currentArticle.readCount }}</span>
          <span>发布时间: {{ formatTime(currentArticle.createdAt) }}</span>
        </div>
        <div class="detail-content" v-html="currentArticle.content"></div>
        
        <div class="detail-actions">
          <button 
            :class="['action-btn', { bookmarked: isBookmarked }]" 
            @click="toggleBookmark"
          >
            <span class="action-icon">{{ isBookmarked ? '📌' : '📑' }}</span>
            <span>{{ isBookmarked ? '已收藏' : '收藏' }}</span>
          </button>
          <button class="action-btn" @click="showCommentForm = true">
            <span class="action-icon">💬</span>
            <span>评论 ({{ currentArticle.commentCount || 0 }})</span>
          </button>
        </div>

        <div class="comments-section" v-if="showComments">
          <h3>评论 ({{ comments.length }})</h3>
          <div class="comments-list">
            <div v-for="comment in comments" :key="comment._id" class="comment-item">
              <div class="comment-avatar">{{ comment.author?.nickname?.[0] || '匿' }}</div>
              <div class="comment-body">
                <div class="comment-header">
                  <span>{{ comment.author?.nickname || comment.anonymousCode }}</span>
                  <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                </div>
                <p>{{ comment.content }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="comment-form" v-if="showCommentForm">
          <textarea 
            v-model="newComment" 
            placeholder="写下你的评论..."
            :rows="3"
            :maxlength="500"
          ></textarea>
          <div class="form-actions">
            <button class="btn btn--outline" @click="showCommentForm = false">取消</button>
            <button class="btn btn--primary" @click="submitComment">发表评论</button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore, api } from '@/stores'

const userStore = useUserStore()
const router = useRouter()

const articles = ref([])
const currentArticle = ref(null)
const currentFilter = ref('all')
const searchQuery = ref('')
const loading = ref(false)
const showArticleDetail = ref(false)
const showComments = ref(false)
const showCommentForm = ref(false)
const newComment = ref('')
const comments = ref([])
const isBookmarked = ref(false)

const categories = ['情绪管理', '人际关系', '自我成长', '职场心理', '亲子关系']

const categoryIcons = {
  '情绪管理': '🎭', '人际关系': '👥', '自我成长': '🌱', '职场心理': '💼', '亲子关系': '👨👩👧👦'
}

const categoryColors = {
  '情绪管理': 'linear-gradient(135deg, #8B6914 0%, #A67C00 100%)',
  '人际关系': 'linear-gradient(135deg, #5D4E37 0%, #6B5B3D 100%)',
  '自我成长': 'linear-gradient(135deg, #4A4A3A 0%, #5C5C4A 100%)',
  '职场心理': 'linear-gradient(135deg, #3D3D3D 0%, #4A4A4A 100%)',
  '亲子关系': 'linear-gradient(135deg, #6B4423 0%, #8B5A2B 100%)'
}

async function fetchArticles() {
  loading.value = true
  try {
    const params = {
      category: currentFilter.value === 'all' ? '' : currentFilter.value,
      keyword: searchQuery.value
    }
    const res = await api.get('/articles', { params })
    if (res.data.code === 200) {
      articles.value = res.data.data.articles
      
      if (userStore.isLoggedIn) {
        for (const article of articles.value) {
          await checkArticleBookmarkStatus(article)
        }
      }
    }
  } catch {
    ElMessage.error('获取文章失败')
  } finally {
    loading.value = false
  }
}

async function checkArticleBookmarkStatus(article) {
  try {
    const res = await api.get(`/articles/${article._id}/bookmark/status`)
    if (res.data.code === 200) {
      article.bookmarked = res.data.data.bookmarked
    }
  } catch {
    article.bookmarked = false
  }
}

function getCategoryIcon(category) {
  return categoryIcons[category] || '📖'
}

function getCategoryColor(category) {
  return categoryColors[category] || '#4A4A3A'
}

function formatTime(dateStr) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function viewArticle(article) {
  router.push(`/study/${article._id}`)
}

async function fetchComments(articleId) {
  try {
    const res = await api.get(`/articles/${articleId}/comments`)
    if (res.data.code === 200) {
      comments.value = res.data.data.comments
    }
  } catch {
    comments.value = []
  }
}

async function checkBookmarkStatus(articleId) {
  try {
    const res = await api.get(`/articles/${articleId}/bookmark/status`)
    isBookmarked.value = res.data.code === 200 && res.data.data.bookmarked
  } catch {
    isBookmarked.value = false
  }
}

async function toggleBookmark() {
  if (!currentArticle.value) return
  try {
    const res = await api.post(`/articles/${currentArticle.value._id}/bookmark`)
    if (res.data.code === 200) {
      isBookmarked.value = !isBookmarked.value
      ElMessage.success(isBookmarked.value ? '已收藏' : '已取消收藏')
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

async function handleBookmark(article) {
  try {
    const res = await api.post(`/articles/${article._id}/bookmark`)
    if (res.data.code === 200) {
      article.bookmarked = res.data.data.bookmarked
      ElMessage.success(article.bookmarked ? '收藏成功' : '取消收藏成功')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

async function submitComment() {
  if (!newComment.value.trim() || !currentArticle.value) return
  try {
    await api.post(`/articles/${currentArticle.value._id}/comments`, { content: newComment.value })
    ElMessage.success('评论成功')
    newComment.value = ''
    showCommentForm.value = false
    await fetchComments(currentArticle.value._id)
    currentArticle.value.commentCount++
  } catch {
    ElMessage.error('评论失败')
  }
}

onMounted(() => {
  fetchArticles()
})
</script>

<style lang="scss" scoped>
.articles-page {
  min-height: 100vh;
  background: 
    radial-gradient(ellipse at 30% 20%, rgba(212, 165, 116, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(139, 115, 85, 0.06) 0%, transparent 50%),
    linear-gradient(180deg, #1F1A14 0%, #2D261E 50%, #1F1A14 100%);
}

.articles-main {
  padding-top: 88px;
  padding-bottom: 60px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  
  &__title {
    font-size: 2.2rem;
    font-weight: 300;
    color: var(--color-candle);
    margin-bottom: 8px;
    letter-spacing: 0.15em;
    text-shadow: 0 0 30px rgba(232, 201, 160, 0.3);
  }
  
  &__subtitle {
    color: var(--color-ash);
    font-size: 1rem;
    letter-spacing: 0.05em;
  }
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 8px 16px;
  background: rgba(62, 50, 38, 0.6);
  border-radius: 4px;
  font-size: 14px;
  color: var(--color-ash);
  transition: all 0.3s ease;
  border: 1px solid rgba(212, 165, 116, 0.1);
  
  &.active, &:hover {
    background: rgba(212, 165, 116, 0.15);
    color: var(--color-amber-glow);
    border-color: rgba(212, 165, 116, 0.3);
  }
}

.search-box {
  display: flex;
  gap: 8px;
  
  input {
    padding: 8px 12px;
    border: 1px solid rgba(212, 165, 116, 0.2);
    border-radius: 4px;
    font-size: 14px;
    width: 200px;
    background: rgba(62, 50, 38, 0.6);
    color: var(--color-moonlight);
    
    &::placeholder {
      color: var(--color-ash);
    }
  }
  
  button {
    padding: 8px 16px;
    background: rgba(212, 165, 116, 0.2);
    color: var(--color-amber-glow);
    border-radius: 4px;
    font-size: 14px;
    border: 1px solid rgba(212, 165, 116, 0.3);
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(212, 165, 116, 0.3);
    }
  }
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.article-card {
  background: linear-gradient(145deg, rgba(62, 50, 38, 0.8) 0%, rgba(45, 38, 30, 0.9) 100%);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(212, 165, 116, 0.05);
  cursor: pointer;
  transition: all 0.4s ease;
  border: 1px solid rgba(212, 165, 116, 0.1);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.4),
      0 0 30px rgba(232, 201, 160, 0.1);
    border-color: rgba(212, 165, 116, 0.2);
  }
  
  &__cover {
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 30px;
      background: linear-gradient(transparent, rgba(45, 38, 30, 0.9));
    }
  }
  
  .cover-icon {
    font-size: 48px;
    opacity: 0.9;
  }
  
  &__content {
    padding: 20px;
    background: 
      linear-gradient(transparent 27px, rgba(197, 193, 185, 0.03) 27px, rgba(197, 193, 185, 0.03) 28px);
    background-size: 100% 28px;
  }
  
  &__title {
    font-size: 1.1rem;
    margin: 12px 0;
    line-height: 1.4;
    color: var(--color-candle);
    font-weight: 400;
  }
  
  &__summary {
    font-size: 14px;
    color: var(--color-ash);
    line-height: 1.6;
    margin-bottom: 12px;
  }
  
  &__meta {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    
    .meta-item {
      font-size: 13px;
      color: var(--color-ash);
      
      &--btn {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
        transition: color 0.3s ease;
        
        &:hover {
          color: var(--color-amber-glow);
        }
        
        &.bookmarked {
          color: var(--color-amber-glow);
        }
      }
    }
  }
}

.article-detail {
  .detail-header {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .detail-title {
    font-size: 1.5rem;
    margin-bottom: 12px;
    color: var(--color-candle);
    font-weight: 400;
  }
  
  .detail-meta {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
    font-size: 14px;
    color: var(--color-ash);
    flex-wrap: wrap;
  }
  
  .detail-content {
    font-size: 15px;
    line-height: 1.9;
    color: var(--color-moonlight);
    margin-bottom: 24px;
    background: 
      linear-gradient(transparent 27px, rgba(197, 193, 185, 0.03) 27px, rgba(197, 193, 185, 0.03) 28px);
    background-size: 100% 28px;
    padding: 16px 0;
    
    p {
      margin-bottom: 16px;
    }
  }
  
  .detail-actions {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: rgba(62, 50, 38, 0.5);
    border-radius: 6px;
    margin-bottom: 24px;
    border: 1px solid rgba(212, 165, 116, 0.1);
  }
  
  .action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(45, 38, 30, 0.8);
    border-radius: 4px;
    font-size: 14px;
    color: var(--color-ash);
    transition: all 0.3s ease;
    border: 1px solid rgba(212, 165, 116, 0.1);
    
    &:hover {
      background: rgba(212, 165, 116, 0.15);
      color: var(--color-amber-glow);
      border-color: rgba(212, 165, 116, 0.3);
    }
    
    &.bookmarked {
      color: var(--color-amber-glow);
    }
    
    .action-icon {
      font-size: 18px;
    }
  }
}

.category-badge {
  padding: 4px 10px;
  border-radius: 3px;
  font-size: 12px;
  
  &--情绪管理 {
    background: rgba(139, 105, 20, 0.3);
    color: #D4A574;
  }
  
  &--人际关系 {
    background: rgba(93, 78, 55, 0.3);
    color: #B5A088;
  }
  
  &--自我成长 {
    background: rgba(74, 74, 58, 0.3);
    color: #A0A088;
  }
  
  &--职场心理 {
    background: rgba(61, 61, 61, 0.3);
    color: #9E9E9E;
  }
  
  &--亲子关系 {
    background: rgba(107, 68, 35, 0.3);
    color: #C4956A;
  }
}

.comments-section {
  border-top: 1px solid rgba(212, 165, 116, 0.1);
  padding-top: 20px;
  
  h3 {
    font-size: 1rem;
    margin-bottom: 16px;
    color: var(--color-candle);
    font-weight: 400;
  }
}

.comments-list {
  max-height: 300px;
  overflow-y: auto;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(212, 165, 116, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #4A3D32 0%, #2D261E 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-amber-glow);
  font-size: 12px;
  font-weight: 400;
  flex-shrink: 0;
  border: 1px solid rgba(212, 165, 116, 0.2);
}

.comment-body {
  flex: 1;
  
  .comment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    
    span:first-child {
      font-size: 13px;
      font-weight: 400;
      color: var(--color-candle);
    }
    
    .comment-time {
      font-size: 12px;
      color: var(--color-ash);
    }
  }
  
  p {
    font-size: 14px;
    color: var(--color-moonlight);
  }
}

.comment-form {
  margin-top: 20px;
  
  textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid rgba(212, 165, 116, 0.2);
    border-radius: 4px;
    font-size: 14px;
    resize: vertical;
    background: rgba(62, 50, 38, 0.5);
    color: var(--color-moonlight);
    
    &::placeholder {
      color: var(--color-ash);
    }
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 12px;
  }
}

.submit-btn {
  padding: 10px 20px;
  background: rgba(212, 165, 116, 0.2);
  color: var(--color-amber-glow);
  border-radius: 4px;
  font-size: 14px;
  margin-top: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(212, 165, 116, 0.3);
  
  &:hover {
    background: rgba(212, 165, 116, 0.3);
  }
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &--primary {
    background: linear-gradient(135deg, var(--color-amber-glow) 0%, var(--color-warm-brown) 100%);
    color: var(--color-night-blue);
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, var(--color-candle) 0%, var(--color-amber-glow) 100%);
    }
  }
  
  &--outline {
    background: transparent;
    color: var(--color-amber-glow);
    border: 1px solid rgba(212, 165, 116, 0.3);
    
    &:hover {
      background: rgba(212, 165, 116, 0.1);
    }
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  
  .empty-state__icon {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.5;
  }
  
  .empty-state__text {
    color: var(--color-ash);
    font-size: 16px;
  }
}

.emotion-tag {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 3px;
  font-weight: 400;
  
  &--开心 {
    background: rgba(255, 217, 61, 0.15);
    color: #FFD93D;
  }
  
  &--平静 {
    background: rgba(107, 203, 119, 0.15);
    color: #6BCB77;
  }
  
  &--焦虑 {
    background: rgba(255, 107, 107, 0.15);
    color: #FF6B6B;
  }
  
  &--悲伤 {
    background: rgba(77, 150, 255, 0.15);
    color: #4D96FF;
  }
  
  &--愤怒 {
    background: rgba(255, 140, 66, 0.15);
    color: #FF8C42;
  }
  
  &--迷茫 {
    background: rgba(155, 89, 182, 0.15);
    color: #9B59B6;
  }
  
  &--感动 {
    background: rgba(255, 179, 186, 0.15);
    color: #FFB3BA;
  }
  
  &--疲惫 {
    background: rgba(149, 165, 166, 0.15);
    color: #95A5A6;
  }
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box input {
    flex: 1;
    width: auto;
  }
}
</style>
