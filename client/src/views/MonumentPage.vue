<template>
  <div class="monument-page">
    <main class="monument-main">
      <div class="container">
        <div class="page-header">
          <h1 class="page-header__title">成长归档室</h1>
          <p class="page-header__subtitle">记录成长的足迹</p>
        </div>

        <div class="monument-tabs">
          <button :class="['monument-tab', { active: activeTab === 'bookmarks' }]" @click="activeTab = 'bookmarks'">
            <span class="tab-icon">📌</span>
            <span>收藏夹</span>
          </button>
          <button :class="['monument-tab', { active: activeTab === 'notes' }]" @click="activeTab = 'notes'">
            <span class="tab-icon">📝</span>
            <span>我的信纸</span>
          </button>
          <button :class="['monument-tab', { active: activeTab === 'history' }]" @click="activeTab = 'history'">
            <span class="tab-icon">📖</span>
            <span>阅读记录</span>
          </button>
        </div>

        <div class="monument-content">
          <div v-if="activeTab === 'bookmarks'" class="bookmarks-section">
            <div class="bookmarks-tabs">
              <button :class="['bookmarks-tab', { active: bookmarkType === 'articles' }]" @click="bookmarkType = 'articles'; fetchBookmarks()">
                文章收藏
              </button>
              <button :class="['bookmarks-tab', { active: bookmarkType === 'treeholes' }]" @click="bookmarkType = 'treeholes'; fetchBookmarks()">
                心声收藏
              </button>
            </div>

            <div v-if="bookmarks.length === 0" class="empty-state">
              <span class="empty-icon">🗄️</span>
              <p>档案柜里还没有收藏</p>
            </div>

            <div v-else class="bookmarks-list">
              <div v-for="item in bookmarks" :key="item._id" class="bookmark-card" :class="{ 'bookmark-card--delisted': item.delisted }" @click="goToDetail(item)">
                <div class="bookmark-card__header">
                  <span v-if="bookmarkType === 'articles'" class="bookmark-type-tag article-tag">📚</span>
                  <span v-else class="bookmark-type-tag treehole-tag">🌙</span>
                  <span v-if="bookmarkType === 'articles'" class="bookmark-category">{{ item.category }}</span>
                  <span v-if="bookmarkType === 'articles' && item.emotion" class="emotion-tag" :class="`emotion-tag--${item.emotion}`">{{ item.emotion }}</span>
                  <span v-else-if="bookmarkType === 'treeholes'" class="emotion-tag" :class="`emotion-tag--${item.emotion}`">{{ getEmotionText(item.emotion) }}</span>
                  <span v-if="item.delisted" class="delisted-tag">已下架</span>
                </div>
                <h3 class="bookmark-card__title">{{ item.title || truncate(item.content, 30) }}</h3>
                <p class="bookmark-card__desc" v-if="!item.delisted">{{ bookmarkType === 'articles' ? item.summary : truncate(item.content, 60) }}</p>
                <p class="bookmark-card__delisted-notice" v-if="item.delisted">该内容已被下架，无法查看原文</p>
                <div class="bookmark-card__footer">
                  <span v-if="bookmarkType === 'articles' && !item.delisted" class="bookmark-author">作者：{{ item.author?.nickname || '管理员' }}</span>
                  <span class="bookmark-date">{{ formatTime(item.createdAt) }}</span>
                  <span v-if="bookmarkType === 'articles' && item.readCount" class="bookmark-stats">👁️ {{ item.readCount }}</span>
                  <span v-if="bookmarkType === 'articles' && item.likeCount" class="bookmark-stats">❤️ {{ item.likeCount }}</span>
                  <button v-if="item.delisted" class="bookmark-remove delisted-remove" @click.stop="removeBookmark(item)">删除此收藏</button>
                  <button v-else class="bookmark-remove" @click.stop="removeBookmark(item)">取消收藏</button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'notes'" class="notes-section">
            <div v-if="notes.length === 0" class="empty-state">
              <span class="empty-icon">📝</span>
              <p>档案柜里还没有信纸</p>
            </div>

            <div v-else class="notes-list">
              <div v-for="note in notes" :key="note._id" class="note-card">
                <div class="note-card__header">
                  <span class="emotion-tag" :class="`emotion-tag--${note.emotion}`">{{ getEmotionText(note.emotion) }}</span>
                  <span class="note-status" :class="`status-${note.status}`">{{ getStatusText(note.status) }}</span>
                </div>
                <p class="note-card__content">{{ note.content }}</p>
                <div class="note-card__footer">
                  <span class="note-date">{{ formatTime(note.createdAt) }}</span>
                  <div class="note-actions">
                    <button class="note-action-btn" @click="editNote(note)">编辑</button>
                    <button class="note-action-btn delete" @click="deleteNote(note)">删除</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'history'" class="history-section">
            <div v-if="history.length === 0" class="empty-state">
              <span class="empty-icon">📖</span>
              <p>档案柜里还没有阅读记录</p>
            </div>

            <div v-else class="timeline-list">
              <div v-for="item in history" :key="item.id" class="timeline-item" @click="goToHistoryDetail(item)">
                <div class="timeline-marker">
                  <span v-if="item.type === 'article'" class="marker-icon article-icon">📚</span>
                  <span v-else class="marker-icon treehole-icon">🌙</span>
                </div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="content-type-tag" :class="item.type === 'article' ? 'article-tag' : 'treehole-tag'">
                      {{ item.type === 'article' ? '文章' : '心声' }}
                    </span>
                    <span v-if="item.emotion" class="emotion-tag" :class="`emotion-tag--${item.emotion}`">{{ item.emotion }}</span>
                    <span class="read-time">阅读于 {{ formatTime(item.readAt) }}</span>
                  </div>
                  <h4 class="timeline-title">{{ item.title || truncate(item.content, 40) }}</h4>
                  <p v-if="item.content" class="timeline-preview">{{ truncate(item.content, 80) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑信纸</h3>
          <button class="modal-close" @click="showEditModal = false">×</button>
        </div>
        <div class="modal-body">
          <textarea v-model="editingNote.content" class="edit-textarea" placeholder="写下你的心情..."></textarea>
          <div class="emotion-selector">
            <button v-for="emotion in emotions" :key="emotion" :class="['emotion-btn', { active: editingNote.emotion === emotion }]" @click="editingNote.emotion = emotion">
              {{ getEmotionEmoji(emotion) }} {{ emotion }}
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn--outline" @click="showEditModal = false">取消</button>
          <button class="btn btn--primary" @click="saveEdit">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore, api } from '@/stores'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('bookmarks')
const bookmarkType = ref('articles')
const bookmarks = ref([])
const notes = ref([])
const history = ref([])

const showEditModal = ref(false)
const editingNote = ref({ _id: '', content: '', emotion: '平静' })

const emotions = ['开心', '平静', '焦虑', '悲伤', '愤怒', '迷茫', '感动', '疲惫']

const emotionEmojis = {
  '开心': '😊',
  '平静': '😌',
  '焦虑': '😰',
  '悲伤': '😢',
  '愤怒': '😤',
  '迷茫': '😕',
  '感动': '🥹',
  '疲惫': '😴'
}

const statusMap = {
  '日志': '已记录',
  '悬置': '思绪阁楼',
  '纪念': '心愿墙',
  '粉碎': '已粉碎'
}

async function fetchBookmarks() {
  try {
    const res = await api.get(`/users/bookmarks?type=${bookmarkType.value}`)
    if (res.data.code === 200) {
      bookmarks.value = res.data.data || []
    }
  } catch (e) {
    console.error('Failed to fetch bookmarks:', e)
  }
}

async function fetchNotes() {
  try {
    const res = await api.get('/notes', { params: { limit: 100 } })
    if (res.data.code === 200) {
      notes.value = res.data.data.notes || []
    }
  } catch (e) {
    console.error('Failed to fetch notes:', e)
  }
}

async function fetchHistory() {
  console.log('fetchHistory called, activeTab:', activeTab.value)
  try {
    const res = await api.get('/users/reading-history')
    console.log('Reading history response:', res.data)
    if (res.data.code === 200) {
      history.value = res.data.data || []
      console.log('History loaded:', history.value.length, 'items')
    }
  } catch (e) {
    console.error('Failed to fetch reading history:', e)
  }
}

async function removeBookmark(item) {
  try {
    await ElMessageBox.confirm('确定取消收藏吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    const type = bookmarkType.value === 'articles' ? 'article' : 'treehole'
    await api.delete(`/users/bookmarks/${type}/${item._id}`)
    
    bookmarks.value = bookmarks.value.filter(b => b._id !== item._id)
    ElMessage.success('已取消收藏')
  } catch {
  }
}

function editNote(note) {
  editingNote.value = { ...note }
  showEditModal.value = true
}

async function saveEdit() {
  if (!editingNote.value.content.trim()) {
    ElMessage.error('内容不能为空')
    return
  }
  
  try {
    const res = await api.put(`/notes/${editingNote.value._id}`, {
      content: editingNote.value.content,
      emotion: editingNote.value.emotion
    })
    
    if (res.data.code === 200) {
      showEditModal.value = false
      const index = notes.value.findIndex(n => n._id === editingNote.value._id)
      if (index > -1) {
        notes.value[index] = { ...notes.value[index], ...editingNote.value }
      }
      ElMessage.success('保存成功')
    }
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

async function deleteNote(note) {
  try {
    await ElMessageBox.confirm('确定删除这张信纸吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await api.delete(`/notes/${note._id}`)
    notes.value = notes.value.filter(n => n._id !== note._id)
    ElMessage.success('删除成功')
  } catch {
  }
}

function goToDetail(item) {
  if (item.delisted) return
  if (item.type === 'article' || bookmarkType.value === 'articles') {
    router.push(`/study/${item._id}`)
  } else {
    router.push(`/plaza/${item._id}`)
  }
}

function goToHistoryDetail(item) {
  if (item.type === 'article') {
    router.push(`/study/${item.id}`)
  } else {
    router.push(`/plaza/${item.id}`)
  }
}

function getEmotionText(emotion) {
  return emotion || '未知'
}

function getEmotionEmoji(emotion) {
  return emotionEmojis[emotion] || '📌'
}

function getStatusText(status) {
  return statusMap[status] || status
}

function truncate(text, length) {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '...' : text
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

watch(activeTab, (newTab) => {
  if (newTab === 'bookmarks') {
    fetchBookmarks()
  } else if (newTab === 'notes') {
    fetchNotes()
  } else if (newTab === 'history') {
    fetchHistory()
  }
})

onMounted(() => {
  fetchBookmarks()
})
</script>

<style lang="scss" scoped>
.monument-page {
  min-height: 100vh;
  background: 
    radial-gradient(ellipse at 20% 30%, rgba(107, 68, 35, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(139, 115, 85, 0.08) 0%, transparent 50%),
    linear-gradient(180deg, #1A1410 0%, #2D2418 50%, #1A1410 100%);
}

.monument-main {
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

.monument-tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
}

.monument-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 4px;
  border: none;
  background: linear-gradient(145deg, rgba(62, 50, 38, 0.8) 0%, rgba(45, 36, 24, 0.9) 100%);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 165, 116, 0.1);
  
  .tab-icon {
    font-size: 18px;
  }
  
  color: var(--color-ash);
  
  &:hover {
    background: linear-gradient(145deg, rgba(72, 60, 48, 0.8) 0%, rgba(55, 46, 34, 0.9) 100%);
    border-color: rgba(212, 165, 116, 0.2);
  }
  
  &.active {
    background: linear-gradient(145deg, rgba(212, 165, 116, 0.2) 0%, rgba(139, 115, 85, 0.15) 100%);
    color: var(--color-amber-glow);
    border-color: rgba(212, 165, 116, 0.3);
  }
}

.monument-content {
  background: linear-gradient(145deg, rgba(62, 50, 38, 0.6) 0%, rgba(45, 36, 24, 0.7) 100%);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 165, 116, 0.1);
}

.bookmarks-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(212, 165, 116, 0.1);
}

.bookmarks-tab {
  padding: 8px 20px;
  border-radius: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--color-ash);
  
  &:hover {
    background: rgba(212, 165, 116, 0.1);
  }
  
  &.active {
    background: rgba(212, 165, 116, 0.15);
    color: var(--color-amber-glow);
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    display: block;
    opacity: 0.5;
  }
  
  p {
    color: var(--color-ash);
  }
}

.bookmarks-list, .notes-list, .history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bookmark-card {
  padding: 20px;
  background: linear-gradient(145deg, rgba(72, 58, 42, 0.6) 0%, rgba(55, 44, 32, 0.7) 100%);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(212, 165, 116, 0.08);
  position: relative;
  
  &--delisted {
    opacity: 0.6;
    cursor: default;
    border-color: rgba(229, 115, 115, 0.2);
    
    &:hover {
      background: linear-gradient(145deg, rgba(72, 58, 42, 0.6) 0%, rgba(55, 44, 32, 0.7) 100%);
      border-color: rgba(229, 115, 115, 0.2);
      
      &::before {
        opacity: 0;
      }
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 12px;
    bottom: 12px;
    width: 3px;
    background: linear-gradient(180deg, var(--color-amber-glow), var(--color-warm-brown));
    border-radius: 2px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    background: linear-gradient(145deg, rgba(82, 68, 52, 0.6) 0%, rgba(65, 54, 42, 0.7) 100%);
    border-color: rgba(212, 165, 116, 0.15);
    
    &::before {
      opacity: 1;
    }
  }
  
  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  &__title {
    font-size: 1.1rem;
    font-weight: 400;
    margin-bottom: 8px;
    color: var(--color-candle);
    padding-left: 8px;
  }
  
  &__desc {
    color: var(--color-ash);
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 12px;
    padding-left: 8px;
  }
  
  &__footer {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 13px;
    color: var(--color-ash);
    padding-left: 8px;
  }
}

.bookmark-type-tag {
  font-size: 16px;
  
  &.article-tag {
    color: var(--color-amber-glow);
  }
  
  &.treehole-tag {
    color: #B5A088;
  }
}

.bookmark-category {
  font-size: 12px;
  padding: 4px 8px;
  background: rgba(212, 165, 116, 0.1);
  color: var(--color-amber-glow);
  border-radius: 3px;
}

.emotion-tag {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 3px;
  background: rgba(158, 158, 158, 0.1);
  color: #9E9E9E;
  
  &--开心 {
    background: rgba(255, 217, 61, 0.15);
    color: #FFD93D;
  }
  
  &--平静 {
    background: rgba(107, 203, 119, 0.15);
    color: #6BCB77;
  }
  
  &--焦虑 {
    background: rgba(255, 152, 0, 0.15);
    color: #FF9800;
  }
  
  &--悲伤 {
    background: rgba(103, 58, 183, 0.15);
    color: #673AB7;
  }
  
  &--愤怒 {
    background: rgba(244, 67, 54, 0.15);
    color: #F44336;
  }
  
  &--迷茫 {
    background: rgba(158, 158, 158, 0.15);
    color: #9E9E9E;
  }
  
  &--感动 {
    background: rgba(233, 30, 99, 0.15);
    color: #E91E63;
  }
  
  &--疲惫 {
    background: rgba(255, 193, 7, 0.15);
    color: #FFC107;
  }
}

.bookmark-stats {
  font-size: 13px;
  color: var(--color-ash);
}

.bookmark-author {
  color: var(--color-ash);
}

.bookmark-remove {
  margin-left: auto;
  padding: 6px 12px;
  font-size: 12px;
  color: #E57373;
  background: rgba(229, 115, 115, 0.1);
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(229, 115, 115, 0.2);
  }
}

.note-card {
  padding: 20px;
  background: linear-gradient(145deg, rgba(72, 58, 42, 0.6) 0%, rgba(55, 44, 32, 0.7) 100%);
  border-radius: 4px;
  border: 1px solid rgba(212, 165, 116, 0.08);
  
  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  
  &__content {
    color: var(--color-moonlight);
    line-height: 1.6;
    margin-bottom: 16px;
    padding-left: 8px;
    border-left: 2px solid rgba(212, 165, 116, 0.2);
  }
  
  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: var(--color-ash);
  }
}

.note-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 3px;
  
  &.status-日志 {
    background: rgba(107, 203, 119, 0.15);
    color: #6BCB77;
  }
  
  &.status-悬置 {
    background: rgba(156, 39, 176, 0.15);
    color: #9C27B0;
  }
  
  &.status-纪念 {
    background: rgba(255, 193, 7, 0.15);
    color: #FFC107;
  }
  
  &.status-粉碎 {
    background: rgba(158, 158, 158, 0.15);
    color: #9E9E9E;
  }
}

.note-actions {
  display: flex;
  gap: 8px;
}

.note-action-btn {
  padding: 6px 12px;
  font-size: 12px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  background: rgba(62, 50, 38, 0.8);
  color: var(--color-ash);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(212, 165, 116, 0.15);
    color: var(--color-amber-glow);
  }
  
  &.delete {
    &:hover {
      background: rgba(229, 115, 115, 0.15);
      color: #E57373;
    }
  }
}

.timeline-list {
  position: relative;
  padding-left: 20px;
  
  &::before {
    content: '';
    position: absolute;
    left: 19px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, var(--color-amber-glow) 0%, var(--color-warm-brown) 100%);
    border-radius: 2px;
    opacity: 0.3;
  }
}

.timeline-item {
  position: relative;
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(145deg, rgba(72, 58, 42, 0.6) 0%, rgba(55, 44, 32, 0.7) 100%);
  border-radius: 4px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(212, 165, 116, 0.08);
  
  &:hover {
    background: linear-gradient(145deg, rgba(82, 68, 52, 0.6) 0%, rgba(65, 54, 42, 0.7) 100%);
    border-color: rgba(212, 165, 116, 0.15);
    transform: translateX(4px);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
}

.timeline-marker {
  position: absolute;
  left: -25px;
  width: 32px;
  height: 32px;
  background: linear-gradient(145deg, rgba(62, 50, 38, 0.9) 0%, rgba(45, 36, 24, 1) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 1;
  border: 1px solid rgba(212, 165, 116, 0.2);
}

.marker-icon {
  font-size: 16px;
  
  &.article-icon {
    color: var(--color-amber-glow);
  }
  
  &.treehole-icon {
    color: #B5A088;
  }
}

.timeline-content {
  flex: 1;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.content-type-tag {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 3px;
  font-weight: 400;
  
  &.article-tag {
    background: rgba(212, 165, 116, 0.15);
    color: var(--color-amber-glow);
  }
  
  &.treehole-tag {
    background: rgba(181, 160, 136, 0.15);
    color: #B5A088;
  }
}

.read-time {
  font-size: 13px;
  color: var(--color-ash);
  margin-left: auto;
}

.timeline-title {
  font-size: 1.05rem;
  font-weight: 400;
  color: var(--color-candle);
  margin-bottom: 6px;
  line-height: 1.4;
}

.timeline-preview {
  font-size: 14px;
  color: var(--color-ash);
  line-height: 1.5;
  margin: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(145deg, rgba(62, 50, 38, 0.95) 0%, rgba(45, 36, 24, 0.98) 100%);
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  border: 1px solid rgba(212, 165, 116, 0.15);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(212, 165, 116, 0.1);
  
  h3 {
    margin: 0;
    color: var(--color-candle);
    font-weight: 400;
  }
  
  .modal-close {
    font-size: 24px;
    border: none;
    background: none;
    cursor: pointer;
    color: var(--color-ash);
    
    &:hover {
      color: var(--color-amber-glow);
    }
  }
}

.modal-body {
  padding: 24px;
}

.edit-textarea {
  width: 100%;
  height: 120px;
  padding: 12px;
  border: 1px solid rgba(212, 165, 116, 0.2);
  border-radius: 4px;
  resize: none;
  font-family: inherit;
  margin-bottom: 16px;
  background: rgba(45, 36, 24, 0.8);
  color: var(--color-moonlight);
  
  &:focus {
    outline: none;
    border-color: var(--color-amber-glow);
  }
  
  &::placeholder {
    color: var(--color-ash);
  }
}

.emotion-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.emotion-btn {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid rgba(212, 165, 116, 0.15);
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--color-ash);
  
  &:hover {
    border-color: rgba(212, 165, 116, 0.4);
    color: var(--color-amber-glow);
  }
  
  &.active {
    background: rgba(212, 165, 116, 0.15);
    border-color: rgba(212, 165, 116, 0.4);
    color: var(--color-amber-glow);
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(212, 165, 116, 0.1);
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

.delisted-tag {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 3px;
  background: rgba(229, 115, 115, 0.2);
  color: #E57373;
  font-weight: 500;
}

.bookmark-card__delisted-notice {
  color: #E57373;
  font-size: 13px;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 2px solid rgba(229, 115, 115, 0.3);
}

.delisted-remove {
  color: #E57373 !important;
  background: rgba(229, 115, 115, 0.15) !important;
  
  &:hover {
    background: rgba(229, 115, 115, 0.25) !important;
  }
}
</style>
