<template>
  <div class="creator-page">
    <main class="creator-main">
      <div class="container">
        <div class="page-header">
          <h1 class="page-header__title">创作者中心</h1>
          <p class="page-header__subtitle">管理你的作品，记录创作灵感</p>
        </div>

        <div class="creator-tabs">
          <button 
            :class="['tab', { active: activeTab === 'treeholes' }]"
            @click="activeTab = 'treeholes'; fetchMyTreeholes()"
          >我的回声</button>
          <button 
            :class="['tab', { active: activeTab === 'articles' }]"
            @click="activeTab = 'articles'; fetchMyArticles()"
          >我的文章</button>
          <button 
            :class="['tab', { active: activeTab === 'inspiration' }]"
            @click="activeTab = 'inspiration'"
          >灵感便利贴</button>
        </div>

        <div class="creator-actions">
          <router-link to="/creator/echo" class="action-card">
            <span class="action-card__icon">✏️</span>
            <span class="action-card__label">发表心声</span>
          </router-link>
          <router-link to="/creator/article" class="action-card">
            <span class="action-card__icon">📝</span>
            <span class="action-card__label">投稿文章</span>
          </router-link>
        </div>

        <div class="creator-content" v-loading="loading">
          <div v-if="activeTab === 'treeholes'" class="my-treeholes">
            <div 
              v-for="hole in treeholes" 
              :key="hole._id"
              class="treehole-item"
            >
              <div class="treehole-item__header">
                <span :class="['emotion-tag', `emotion-tag--${hole.emotion}`]">{{ hole.emotion }}</span>
                <span :class="['status-badge', `status-badge--${hole.status}`]">{{ hole.status }}</span>
                <span class="treehole-item__stats">👁️ {{ hole.viewCount || 0 }} 💬 {{ hole.commentCount }}</span>
              </div>
              <p class="treehole-item__content">{{ hole.content }}</p>
              <div class="treehole-item__footer">
                <span class="treehole-item__time">{{ formatTime(hole.createdAt) }}</span>
                <div class="treehole-item__actions">
                  <button class="action-btn" @click="editTreehole(hole)">编辑</button>
                  <button class="action-btn action-btn--danger" @click="deleteTreehole(hole._id)">删除</button>
                  <button class="action-btn" @click="viewComments(hole._id)">查看留言 ({{ hole.commentCount }})</button>
                </div>
              </div>
            </div>
            
            <div class="empty-state" v-if="!loading && treeholes.length === 0">
              <div class="empty-state__icon">🌊</div>
              <p class="empty-state__text">还没有发布过回声</p>
              <router-link to="/plaza" class="btn btn--primary">去发布</router-link>
            </div>
          </div>

          <div v-if="activeTab === 'articles'" class="my-articles">
            <div 
              v-for="article in articles" 
              :key="article._id"
              class="article-item"
            >
              <div class="article-item__header">
                <span :class="['emotion-tag', `emotion-tag--${article.emotion}`]">{{ article.emotion }}</span>
                <span class="article-item__stats">👁️ {{ article.readCount }} ❤️ {{ article.likeCount || 0 }}</span>
              </div>
              <h3 class="article-item__title">{{ article.title }}</h3>
              <p class="article-item__summary">{{ article.summary }}</p>
              <div class="article-item__footer">
                <span class="article-item__time">{{ formatTime(article.createdAt) }}</span>
                <div class="article-item__actions">
                  <button class="action-btn" @click="editArticle(article)">编辑</button>
                  <button class="action-btn action-btn--danger" @click="deleteArticle(article._id)">删除</button>
                  <button class="action-btn" @click="viewArticleComments(article._id)">查看评论</button>
                </div>
              </div>
            </div>
            
            <div class="empty-state" v-if="!loading && articles.length === 0">
              <div class="empty-state__icon">📝</div>
              <p class="empty-state__text">还没有发布过文章</p>
            </div>
          </div>

          <div v-if="activeTab === 'inspiration'" class="inspiration-board">
            <div class="inspiration-header">
              <h3>灵感便利贴</h3>
              <button class="btn btn--primary btn--sm" @click="addInspiration">+ 添加灵感</button>
            </div>
            
            <div class="inspiration-grid">
              <div 
                v-for="note in inspirations" 
                :key="note.id"
                class="inspiration-note"
                :style="{ background: note.color }"
              >
                <p>{{ note.content }}</p>
                <div class="inspiration-actions">
                  <button class="delete-btn" @click="deleteInspiration(note.id)">×</button>
                </div>
              </div>
            </div>
            
            <div class="empty-state" v-if="inspirations.length === 0">
              <div class="empty-state__icon">💡</div>
              <p class="empty-state__text">记录你的灵感火花</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <el-dialog v-model="showEditDialog" title="编辑回声" width="500px" class="edit-dialog">
      <div class="edit-form">
        <el-input
          v-model="editContent"
          type="textarea"
          :rows="6"
          placeholder="写下你的想法..."
          :maxlength="500"
          show-word-limit
        />
        <div class="form-group">
          <label class="form-label">选择情绪</label>
          <div class="emotion-selector">
            <button
              v-for="emotion in emotions"
              :key="emotion"
              :class="['emotion-btn', { active: editEmotion === emotion }]"
              @click="editEmotion = emotion"
            >{{ emotion }}</button>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showAddInspiration" title="添加灵感" width="400px" class="inspiration-dialog">
      <el-input
        v-model="newInspiration"
        type="textarea"
        :rows="4"
        placeholder="记录你的灵感..."
        :maxlength="200"
        show-word-limit
      />
      <template #footer>
        <el-button @click="showAddInspiration = false">取消</el-button>
        <el-button type="primary" @click="saveInspiration">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showCommentsDialog" title="留言" width="500px" class="comments-dialog">
      <div class="comments-list">
        <div v-for="comment in currentComments" :key="comment._id" class="comment-item">
          <div class="comment-avatar">{{ comment.userId?.nickname?.[0] || '匿' }}</div>
          <div class="comment-body">
            <div class="comment-header">
              <span class="comment-code">{{ comment.userId?.nickname || '匿名用户' }}</span>
              <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
            </div>
            <p class="comment-content">{{ comment.content }}</p>
          </div>
        </div>
        <div class="empty-state" v-if="currentComments.length === 0">
          <p class="empty-state__text">暂无留言</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="showCommentsDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore, useTreeholeStore, api } from '@/stores'

const userStore = useUserStore()
const treeholeStore = useTreeholeStore()

const activeTab = ref('treeholes')
const loading = ref(false)
const treeholes = ref([])
const articles = ref([])
const inspirations = ref([])

const showEditDialog = ref(false)
const showAddInspiration = ref(false)
const showCommentsDialog = ref(false)
const editContent = ref('')
const editEmotion = ref('')
const editId = ref('')
const newInspiration = ref('')
const currentComments = ref([])
const currentCommentType = ref('')

const emotions = ['开心', '平静', '焦虑', '愤怒', '难过', '感动', '迷茫']
const noteColors = ['#FFF3E0', '#E3F2FD', '#E8F5E9', '#FCE4EC', '#F3E5F5', '#E0F2F1']

async function fetchMyTreeholes() {
  loading.value = true
  try {
    const res = await api.get('/treehole/my/posts', { params: { limit: 50 } })
    if (res.data.code === 200) {
      treeholes.value = res.data.data.treeholes
    }
  } catch (e) {
    console.error('Failed to fetch treeholes:', e)
  } finally {
    loading.value = false
  }
}

async function fetchMyArticles() {
  loading.value = true
  try {
    const res = await api.get('/articles/my')
    if (res.data.code === 200) {
      articles.value = res.data.data.articles
    }
  } catch (e) {
    console.error('Failed to fetch articles:', e)
  } finally {
    loading.value = false
  }
}

function editTreehole(hole) {
  editId.value = hole._id
  editContent.value = hole.content
  editEmotion.value = hole.emotion
  currentCommentType.value = 'treehole'
  showEditDialog.value = true
}

async function saveEdit() {
  try {
    await api.put(`/treehole/${editId.value}`, { content: editContent.value, emotion: editEmotion.value })
    ElMessage.success('修改成功')
    showEditDialog.value = false
    fetchMyTreeholes()
  } catch {
    ElMessage.error('修改失败')
  }
}

async function deleteTreehole(id) {
  try {
    await ElMessageBox.confirm('确定要删除吗？', '提示', { type: 'warning' })
    await api.delete(`/treehole/${id}`)
    ElMessage.success('删除成功')
    fetchMyTreeholes()
  } catch {}
}

async function deleteArticle(id) {
  try {
    await ElMessageBox.confirm('确定要删除吗？', '提示', { type: 'warning' })
    await api.delete(`/articles/${id}`)
    ElMessage.success('删除成功')
    fetchMyArticles()
  } catch {}
}

async function viewComments(id) {
  currentCommentType.value = 'treehole'
  try {
    const res = await api.get(`/treehole/${id}/comments`)
    if (res.data.code === 200) {
      currentComments.value = res.data.data.comments
    }
    showCommentsDialog.value = true
  } catch {
    ElMessage.error('获取评论失败')
  }
}

async function viewArticleComments(id) {
  currentCommentType.value = 'article'
  try {
    const res = await api.get(`/articles/${id}/comments`)
    if (res.data.code === 200) {
      currentComments.value = res.data.data.comments
    }
    showCommentsDialog.value = true
  } catch {
    ElMessage.error('获取评论失败')
  }
}

function addInspiration() {
  newInspiration.value = ''
  showAddInspiration.value = true
}

function saveInspiration() {
  if (!newInspiration.value.trim()) {
    ElMessage.warning('请输入内容')
    return
  }
  const savedInspirations = JSON.parse(localStorage.getItem('inspirations') || '[]')
  savedInspirations.push({
    id: Date.now(),
    content: newInspiration.value,
    color: noteColors[Math.floor(Math.random() * noteColors.length)],
    createdAt: new Date().toISOString()
  })
  localStorage.setItem('inspirations', JSON.stringify(savedInspirations))
  loadInspirations()
  showAddInspiration.value = false
  ElMessage.success('已保存')
}

function deleteInspiration(id) {
  const savedInspirations = JSON.parse(localStorage.getItem('inspirations') || '[]')
  const filtered = savedInspirations.filter(n => n.id !== id)
  localStorage.setItem('inspirations', JSON.stringify(filtered))
  loadInspirations()
}

function loadInspirations() {
  inspirations.value = JSON.parse(localStorage.getItem('inspirations') || '[]')
}

function formatTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}

fetchMyTreeholes()
loadInspirations()
</script>

<style lang="scss" scoped>
.creator-page {
  min-height: 100vh;
  background: 
    radial-gradient(ellipse at 20% 30%, rgba(107, 68, 35, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(139, 115, 85, 0.08) 0%, transparent 50%),
    linear-gradient(180deg, #1A1410 0%, #2D2418 50%, #1A1410 100%);
}

.creator-main {
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
    text-shadow: 0 0 30px rgba(232, 201, 160, 0.2);
  }
  
  &__subtitle {
    color: var(--color-ash);
    font-size: 1rem;
    letter-spacing: 0.05em;
  }
}

.creator-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  justify-content: center;
}

.creator-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  justify-content: center;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  background: linear-gradient(145deg, rgba(62, 50, 38, 0.8) 0%, rgba(45, 36, 24, 0.9) 100%);
  border-radius: 8px;
  border: 1px solid rgba(212, 165, 116, 0.15);
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(212, 165, 116, 0.3);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3), 0 0 20px rgba(212, 165, 116, 0.1);
  }

  &__icon {
    font-size: 24px;
  }

  &__label {
    font-size: 16px;
    color: var(--color-candle);
    font-weight: 400;
  }
}

.tab {
  padding: 10px 20px;
  background: linear-gradient(145deg, rgba(62, 50, 38, 0.8) 0%, rgba(45, 36, 24, 0.9) 100%);
  border-radius: 4px;
  font-size: 14px;
  color: var(--color-ash);
  transition: all 0.3s ease;
  border: 1px solid rgba(212, 165, 116, 0.1);
  
  &:hover {
    background: rgba(212, 165, 116, 0.15);
    color: var(--color-amber-glow);
  }
  
  &.active {
    background: rgba(212, 165, 116, 0.2);
    color: var(--color-amber-glow);
    border-color: rgba(212, 165, 116, 0.3);
  }
}

.treehole-item, .article-item {
  background: linear-gradient(145deg, rgba(62, 50, 38, 0.8) 0%, rgba(45, 36, 24, 0.9) 100%);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  margin-bottom: 16px;
  border: 1px solid rgba(212, 165, 116, 0.1);
  
  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  
  &__stats {
    font-size: 13px;
    color: var(--color-ash);
    margin-left: auto;
  }
  
  &__content, &__summary {
    font-size: 15px;
    line-height: 1.6;
    color: var(--color-moonlight);
    margin-bottom: 12px;
  }
  
  &__title {
    font-size: 1.1rem;
    margin-bottom: 8px;
    color: var(--color-candle);
  }
  
  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid rgba(212, 165, 116, 0.1);
  }
  
  &__time {
    font-size: 13px;
    color: var(--color-ash);
  }
  
  &__actions {
    display: flex;
    gap: 8px;
  }
}

.action-btn {
  padding: 4px 12px;
  font-size: 12px;
  color: var(--color-ash);
  background: rgba(45, 36, 24, 0.8);
  border-radius: 4px;
  transition: all 0.3s ease;
  border: 1px solid rgba(212, 165, 116, 0.1);
  
  &:hover {
    background: rgba(212, 165, 116, 0.15);
    color: var(--color-amber-glow);
  }
  
  &--danger:hover {
    background: rgba(229, 115, 115, 0.15);
    color: #E57373;
  }
}

.inspiration-board {
  max-width: 800px;
  margin: 0 auto;
}

.inspiration-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h3 {
    font-size: 1.2rem;
    color: var(--color-candle);
  }
}

.inspiration-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.inspiration-note {
  padding: 20px;
  border-radius: 8px;
  position: relative;
  min-height: 100px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  p {
    font-size: 14px;
    line-height: 1.6;
    color: var(--color-text);
  }
  
  .delete-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(0,0,0,0.1);
    color: var(--color-text-muted);
    font-size: 16px;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(229, 57, 53, 0.2);
      color: #E53935;
    }
  }
}

.comments-list {
  max-height: 400px;
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
  background: linear-gradient(135deg, var(--color-amber-glow) 0%, var(--color-warm-brown) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-night-blue);
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
  
  .comment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    
    .comment-code {
      font-size: 13px;
      font-weight: 500;
      color: var(--color-candle);
    }
    
    .comment-time {
      font-size: 12px;
      color: var(--color-ash);
    }
  }
  
  .comment-content {
    font-size: 14px;
    color: var(--color-moonlight);
  }
}

.emotion-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.emotion-btn {
  padding: 8px 16px;
  background: rgba(45, 36, 24, 0.8);
  border-radius: 4px;
  font-size: 14px;
  color: var(--color-ash);
  border: 1px solid rgba(212, 165, 116, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(212, 165, 116, 0.4);
    color: var(--color-amber-glow);
  }
  
  &.active {
    background: rgba(212, 165, 116, 0.2);
    color: var(--color-amber-glow);
    border-color: rgba(212, 165, 116, 0.4);
  }
}

.edit-form {
  .form-group {
    margin-top: 20px;
  }
  
  .form-label {
    display: block;
    font-size: 14px;
    color: var(--color-ash);
    margin-bottom: 12px;
  }
}

.status-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  
  &--待审核 {
    background: rgba(91, 141, 239, 0.15);
    color: #5B8DEF;
  }
  
  &--已发布 {
    background: rgba(107, 203, 119, 0.15);
    color: #6BCB77;
  }
  
  &--已驳回 {
    background: rgba(229, 115, 115, 0.15);
    color: #E57373;
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  
  .empty-state__icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  .empty-state__text {
    color: var(--color-ash);
    margin-bottom: 20px;
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
  
  &--sm {
    padding: 8px 16px;
    font-size: 13px;
  }
}
</style>
