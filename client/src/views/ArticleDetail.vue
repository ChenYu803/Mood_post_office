<template>
  <div class="article-detail-page">
    <main class="detail-main">
      <div class="container">
        <div class="article-layout" v-loading="loading">
          <article class="article-content" v-if="article">
            <div class="article-header">
              <span :class="['emotion-tag', `emotion-tag--${article.emotion}`]">{{ article.emotion }}</span>
              <h1 class="article-title">{{ article.title }}</h1>
              <div class="article-meta">
                <span class="article-author">{{ article.author }}</span>
                <span class="article-date">{{ formatDate(article.createdAt) }}</span>
                <span class="article-read">阅读 {{ article.readCount }}</span>
              </div>
            </div>
            
            <div class="article-cover" v-if="article.cover">
              <img :src="article.cover" :alt="article.title" />
            </div>
            
            <div class="article-body" v-html="article.content"></div>
          </article>

          <aside class="related-articles" v-if="relatedArticles.length > 0">
            <h3 class="related-title">相关阅读</h3>
            <div class="related-list">
              <router-link 
                v-for="item in relatedArticles" 
                :key="item._id"
                :to="`/study/${item._id}`"
                class="related-item"
              >
                <h4>{{ item.title }}</h4>
                <span>{{ item.author }}</span>
              </router-link>
            </div>
          </aside>
        </div>

        <div class="detail-actions" v-if="article">
          <button 
            :class="['action-btn', { bookmarked: isBookmarked }]" 
            @click="handleBookmark"
            v-if="userStore.isLoggedIn"
          >
            <span class="action-icon">{{ isBookmarked ? '📌' : '📑' }}</span>
            <span>{{ isBookmarked ? '已收藏' : '收藏' }}</span>
          </button>
          <button class="action-btn" @click="showComments = !showComments">
            <span class="action-icon">💬</span>
            <span>{{ article.commentCount || 0 }} 评论</span>
          </button>
          <button class="action-btn report-action-btn" @click="showReportModal = true" v-if="userStore.isLoggedIn">
            <span class="action-icon">🚫</span>
            <span>举报</span>
          </button>
        </div>

        <div class="comments-section" v-if="showComments && article">
          <div class="comments-header">
            <h3>评论区</h3>
          </div>
          
          <div class="comment-form" v-if="userStore.isLoggedIn">
            <textarea 
              v-model="commentContent" 
              placeholder="写下你的评论..."
              rows="3"
              maxlength="300"
            ></textarea>
            <div class="comment-form-footer">
              <span class="char-count">{{ commentContent.length }}/300</span>
              <button class="btn btn--primary" @click="submitComment" :disabled="!commentContent.trim()">
                发表评论
              </button>
            </div>
          </div>
          <div class="login-tip" v-else>
            <router-link to="/auth">登录后参与评论</router-link>
          </div>

          <div class="comments-list">
            <div v-for="comment in comments" :key="comment._id" class="comment-item">
              <div class="comment-avatar">{{ comment.userId?.nickname?.[0] || '匿' }}</div>
              <div class="comment-body">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.userId?.nickname || '匿名用户' }}</span>
                  <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                </div>
                <p class="comment-content">{{ comment.content }}</p>
              </div>
            </div>
            <div class="empty-comments" v-if="comments.length === 0">
              <span>暂无评论，来抢沙发吧~</span>
            </div>
          </div>
        </div>

        <div class="back-btn">
          <router-link to="/study" class="btn btn--ghost">
            ← 返回夜灯书房
          </router-link>
        </div>
      </div>
    </main>

    <ReportModal
      v-model="showReportModal"
      :target-id="article?._id || ''"
      target-type="article"
      @submitted="onReportSubmitted"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore, useArticleStore, api } from '@/stores'
import ReportModal from '@/components/ReportModal.vue'

const route = useRoute()
const userStore = useUserStore()
const articleStore = useArticleStore()

const article = ref(null)
const relatedArticles = ref([])
const loading = ref(false)
const isBookmarked = ref(false)
const showComments = ref(false)
const comments = ref([])
const commentContent = ref('')
const showReportModal = ref(false)

async function fetchDetail() {
  loading.value = true
  try {
    await articleStore.fetchArticleDetail(route.params.id)
    article.value = articleStore.currentArticle
    relatedArticles.value = articleStore.relatedArticles
    
    if (userStore.isLoggedIn && article.value) {
      await checkBookmarkStatus(article.value._id)
      
      api.post('/users/reading-history', {
        id: article.value._id,
        type: 'article',
        title: article.value.title,
        emotion: article.value.emotion
      }).catch(err => {
        console.error('Failed to record reading history:', err)
      })
    }
  } finally {
    loading.value = false
  }
}

async function fetchComments() {
  if (!article.value) return
  try {
    const res = await api.get(`/articles/${article.value._id}/comments`)
    if (res.data.code === 200) {
      comments.value = res.data.data.comments || []
    }
  } catch (e) {
    console.error('Failed to fetch comments:', e)
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

async function handleBookmark() {
  if (!article.value) return
  try {
    const res = await api.post(`/articles/${article.value._id}/bookmark`)
    if (res.data.code === 200) {
      isBookmarked.value = res.data.data.bookmarked
      ElMessage.success(isBookmarked.value ? '收藏成功' : '取消收藏成功')
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

async function submitComment() {
  if (!commentContent.value.trim() || !article.value) return
  
  try {
    const res = await api.post(`/articles/${article.value._id}/comments`, {
      content: commentContent.value.trim()
    })
    if (res.data.code === 200) {
      ElMessage.success('评论已提交，审核通过后将显示')
      commentContent.value = ''
      fetchComments()
      if (article.value) {
        article.value.commentCount = (article.value.commentCount || 0) + 1
      }
    }
  } catch {
    ElMessage.error('评论失败')
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${date.getMonth() + 1}/${date.getDate()}`
}

watch(showComments, (val) => {
  if (val && comments.value.length === 0) {
    fetchComments()
  }
})

function onReportSubmitted() {
  showReportModal.value = false
}

onMounted(() => {
  fetchDetail()
})

watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    fetchDetail()
    showComments.value = false
    comments.value = []
  }
})
</script>

<style lang="scss" scoped>
.article-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #3d2f24 0%, #2a1f17 100%);
}

.detail-main {
  padding-top: 88px;
  padding-bottom: 60px;
}

.article-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 40px;
  max-width: 1000px;
  margin: 0 auto;
}

.article-content {
  background: linear-gradient(145deg, #f5ebe0 0%, #ede4d8 100%);
  border-radius: var(--radius-xl);
  padding: 40px 48px;
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.4),
    0 0 80px rgba(212, 165, 116, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(212, 165, 116, 0.2);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 32px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(180deg, transparent 0%, rgba(139, 115, 85, 0.2) 10%, rgba(139, 115, 85, 0.2) 90%, transparent 100%);
  }
}

.article-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(139, 115, 85, 0.2);
  padding-left: 24px;
  
  .emotion-tag {
    margin-bottom: 16px;
  }
}

.article-title {
  font-size: 2rem;
  line-height: 1.3;
  margin-bottom: 16px;
  color: #3d2f24;
  font-weight: 500;
}

.article-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #6B5A48;
}

.article-cover {
  margin-bottom: 32px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  
  img {
    width: 100%;
    display: block;
  }
}

.article-body {
  font-size: 16px;
  line-height: 2;
  color: #3d2f24;
  padding-left: 24px;
  
  :deep(p) {
    margin-bottom: 1.8em;
    text-indent: 2em;
  }
  
  :deep(h2) {
    font-size: 1.5rem;
    margin: 2.5em 0 1.2em;
    color: #3d2f24;
    padding-bottom: 8px;
    border-bottom: 2px solid rgba(212, 165, 116, 0.3);
  }
  
  :deep(h3) {
    font-size: 1.2rem;
    margin: 2em 0 1em;
    color: #4a3728;
  }
  
  :deep(ul), :deep(ol) {
    margin: 1.2em 0;
    padding-left: 1.5em;
  }
  
  :deep(li) {
    margin-bottom: 0.6em;
  }
  
  :deep(blockquote) {
    margin: 1.5em 0;
    padding: 16px 20px;
    background: rgba(212, 165, 116, 0.1);
    border-left: 3px solid var(--color-amber-glow);
    border-radius: 0 8px 8px 0;
    font-style: italic;
    color: #5a4a3a;
  }
}

.related-articles {
  position: sticky;
  top: 88px;
  height: fit-content;
}

.related-title {
  font-size: 1.1rem;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(212, 165, 116, 0.3);
  color: #F5E6D3;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.related-item {
  padding: 16px;
  background: rgba(62, 47, 36, 0.6);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(212, 165, 116, 0.15);
  transition: all var(--transition-fast);
  
  &:hover {
    box-shadow: 0 4px 16px rgba(212, 165, 116, 0.2);
    border-color: rgba(212, 165, 116, 0.3);
    
    h4 {
      color: var(--color-amber-glow);
    }
  }
  
  h4 {
    font-size: 14px;
    font-family: var(--font-sans);
    font-weight: 500;
    line-height: 1.4;
    margin-bottom: 8px;
    transition: color var(--transition-fast);
    color: #F5E6D3;
  }
  
  span {
    font-size: 12px;
    color: #C9B8A8;
  }
}

.back-btn {
  max-width: 1000px;
  margin: 32px auto 0;
  
  .btn--ghost {
    color: #F5E6D3;
    border-color: rgba(212, 165, 116, 0.4);
    
    &:hover {
      background: rgba(212, 165, 116, 0.15);
      border-color: var(--color-amber-glow);
      color: var(--color-amber-glow);
    }
  }
}

.detail-actions {
  display: flex;
  gap: 16px;
  max-width: 1000px;
  margin: 24px auto 0;
  padding: 20px;
  background: rgba(62, 47, 36, 0.6);
  border-radius: var(--radius-xl);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(212, 165, 116, 0.15);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(250, 246, 240, 0.1);
  border-radius: var(--radius-md);
  font-size: 14px;
  transition: all var(--transition-fast);
  border: 1px solid rgba(212, 165, 116, 0.2);
  cursor: pointer;
  color: #F5E6D3;
  
  &:hover {
    background: rgba(212, 165, 116, 0.2);
    border-color: var(--color-amber-glow);
    color: var(--color-amber-glow);
  }
  
  &.bookmarked {
    color: var(--color-amber-glow);
    background: rgba(212, 165, 116, 0.15);
    border-color: rgba(212, 165, 116, 0.3);
    
    &:hover {
      background: rgba(212, 165, 116, 0.25);
    }
  }
  
  .action-icon {
    font-size: 18px;
  }
}

.report-action-btn {
  &:hover {
    background: rgba(229, 115, 115, 0.15) !important;
    border-color: rgba(229, 115, 115, 0.4) !important;
    color: #E57373 !important;
  }
}

.comments-section {
  max-width: 1000px;
  margin: 24px auto 0;
  padding: 24px;
  background: rgba(62, 47, 36, 0.6);
  border-radius: var(--radius-xl);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(212, 165, 116, 0.15);
}

.comments-header {
  margin-bottom: 20px;
  
  h3 {
    font-size: 1.1rem;
    color: #F5E6D3;
  }
}

.comment-form {
  margin-bottom: 24px;
  
  textarea {
    width: 100%;
    padding: 16px;
    background: rgba(45, 36, 24, 0.8);
    border: 1px solid rgba(212, 165, 116, 0.2);
    border-radius: var(--radius-md);
    color: #F5E6D3;
    font-size: 14px;
    resize: none;
    
    &::placeholder {
      color: #A09890;
    }
    
    &:focus {
      outline: none;
      border-color: var(--color-amber-glow);
    }
  }
  
  .comment-form-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    
    .char-count {
      font-size: 12px;
      color: #A09890;
    }
  }
}

.login-tip {
  padding: 20px;
  text-align: center;
  background: rgba(45, 36, 24, 0.6);
  border-radius: var(--radius-md);
  
  a {
    color: var(--color-amber-glow);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(45, 36, 24, 0.6);
  border-radius: var(--radius-md);
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-amber-glow) 0%, var(--color-warm-brown) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-night-blue);
  font-weight: 600;
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
  
  .comment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  
  .comment-author {
    font-size: 14px;
    font-weight: 500;
    color: #F5E6D3;
  }
  
  .comment-time {
    font-size: 12px;
    color: #A09890;
  }
  
  .comment-content {
    font-size: 14px;
    line-height: 1.6;
    color: #D1CDC7;
  }
}

.empty-comments {
  text-align: center;
  padding: 40px 20px;
  color: #A09890;
}

.btn--primary {
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--color-amber-glow) 0%, var(--color-warm-brown) 100%);
  color: var(--color-night-blue);
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@media (max-width: 768px) {
  .article-layout {
    grid-template-columns: 1fr;
  }
  
  .related-articles {
    position: static;
  }
  
  .article-content {
    padding: 32px 24px;
    
    &::before {
      left: 16px;
    }
  }
  
  .article-header,
  .article-body {
    padding-left: 16px;
  }
}
</style>
