<template>
  <div class="logs-page">
    <main class="logs-main">
      <div class="container">
        <div class="page-header">
          <router-link to="/deposit" class="page-back-btn">←</router-link>
          <h1 class="page-header__title">寄存柜</h1>
          <p class="page-header__subtitle">所有心事信纸的归宿</p>
          <router-link to="/deposit/create" class="btn btn--primary btn--sm">
            <span>📝</span> 写信
          </router-link>
        </div>

        <div class="logs-container">
          <div class="logs-content">
            <div class="logs-filters">
              <div class="filter-tabs">
                <button 
                  v-for="emotion in emotions" 
                  :key="emotion"
                  :class="['filter-tab', { active: activeEmotion === emotion }]"
                  @click="activeEmotion = emotion; fetchLogs()"
                >
                  {{ emotionEmojis[emotion] }} {{ emotion }}
                </button>
              </div>
            </div>

            <div class="notes-list" v-loading="loading">
              <div 
                v-for="note in notes" 
                :key="note._id"
                class="note-card"
                :class="`note-card--${note.emotion}`"
              >
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    :checked="selectedNotes.includes(note._id)"
                    :disabled="selectedNotes.length >= 9 && !selectedNotes.includes(note._id)"
                    @change="toggleSelect(note._id)"
                  />
                  <span class="checkmark"></span>
                </label>
                <div class="note-content" @click="showNoteDetail(note)">
                  <div class="note-card__header">
                    <span :class="['emotion-tag', `emotion-tag--${note.emotion}`]">
                      {{ emotionEmojis[note.emotion] }} {{ note.emotion }}
                    </span>
                    <span class="note-card__intensity">{{ note.intensity }}%</span>
                  </div>
                  <p class="note-card__content">{{ note.content }}</p>
                  <p class="note-card__story" v-if="note.story">{{ note.story }}</p>
                  <div class="note-card__footer">
                    <span class="note-card__time">{{ formatTime(note.createdAt) }}</span>
                    <button class="edit-btn" @click.stop="editNote(note)">✏️ 编辑</button>
                  </div>
                </div>
              </div>
              
              <div class="empty-state" v-if="!loading && notes.length === 0">
                <div class="empty-state__icon">📬</div>
                <p class="empty-state__text">寄存柜空空如也</p>
                <router-link to="/deposit/create" class="btn btn--outline btn--sm">写下第一封信</router-link>
              </div>
            </div>

            <div class="load-more" v-if="notes.length < total">
              <button class="btn btn--outline" @click="loadMore">加载更多</button>
            </div>
          </div>

          <div class="action-panel">
            <h3>操作面板</h3>
            <div class="action-buttons">
              <button 
                class="action-btn" 
                :disabled="selectedNotes.length === 0"
                @click="moveToAttic"
              >
                <span class="btn-icon">🏠</span>
                <span>移入思绪阁楼</span>
              </button>
              <button 
                class="action-btn" 
                :disabled="selectedNotes.length === 0"
                @click="moveToWall"
              >
                <span class="btn-icon">✨</span>
                <span>移入流星信箱</span>
              </button>
              <button 
                class="action-btn action-btn--danger" 
                :disabled="selectedNotes.length === 0"
                @click="deleteSelected"
              >
                <span class="btn-icon">🗑️</span>
                <span>删除</span>
              </button>
              <button 
                class="action-btn" 
                :disabled="selectedNotes.length === 0"
                @click="publishToTreehole"
              >
                <span class="btn-icon">🌳</span>
                <span>发表到回声广场</span>
              </button>
            </div>
            <div class="selected-info" v-if="selectedNotes.length > 0">
              <p>已选择 {{ selectedNotes.length }} 条（最多9条）</p>
              <button class="clear-btn" @click="clearSelection">取消选择</button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <el-dialog v-model="showDetail" title="日志详情" width="500px">
      <div class="note-detail" v-if="currentNote">
        <div class="detail-header">
          <span :class="['emotion-tag', `emotion-tag--${currentNote.emotion}`]">{{ currentNote.emotion }}</span>
          <span class="detail-intensity">强度: {{ currentNote.intensity }}%</span>
        </div>
        <p class="detail-content">{{ currentNote.content }}</p>
        <p class="detail-story" v-if="currentNote.story">{{ currentNote.story }}</p>
        <div class="detail-footer">
          <span>{{ formatTime(currentNote.createdAt) }}</span>
          <div class="detail-actions">
            <button class="mini-btn" @click="moveSingleNote('悬置')">移到阁楼</button>
            <button class="mini-btn" @click="moveSingleNote('纪念')">移到心愿墙</button>
            <button class="mini-btn mini-btn--danger" @click="deleteSingleNote">删除</button>
            <button class="mini-btn" @click="editNote(currentNote)">编辑</button>
            <button class="mini-btn" @click="publishSingleToTreehole">发表到树洞</button>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="showEditDialog" title="编辑信纸" width="450px">
      <div class="edit-form">
        <div class="form-group">
          <label>内容</label>
          <textarea 
            v-model="editContent" 
            placeholder="写下你的心情..."
            :rows="5"
            :maxlength="800"
            show-word-limit
          ></textarea>
        </div>
        <div class="form-group">
          <label>情绪</label>
          <div class="emotion-selector">
            <button
              v-for="emotion in emotions"
              :key="emotion"
              :class="['emotion-btn', { active: editEmotion === emotion }]"
              @click="editEmotion = emotion"
            >
              {{ emotionEmojis[emotion] }} {{ emotion }}
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>强度: {{ editIntensity }}%</label>
          <input type="range" v-model="editIntensity" min="0" max="100" />
        </div>
        <div class="form-group">
          <label>故事（可选）</label>
          <textarea 
            v-model="editStory" 
            placeholder="记录背后的故事..."
            :rows="2"
            :maxlength="200"
          ></textarea>
        </div>
      </div>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore, api } from '@/stores'

const userStore = useUserStore()

const notes = ref([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const activeEmotion = ref('全部')
const selectedNotes = ref([])
const showDetail = ref(false)
const currentNote = ref(null)
const showEditDialog = ref(false)
const editContent = ref('')
const editEmotion = ref('平静')
const editIntensity = ref(50)
const editStory = ref('')
const editingNoteId = ref(null)

const emotions = ['全部', '开心', '平静', '焦虑', '愤怒', '难过', '感动', '迷茫']
const emotionEmojis = {
  '开心': '😊', '平静': '😌', '焦虑': '😰', '愤怒': '😤', 
  '难过': '😢', '感动': '🥹', '迷茫': '😕'
}

async function fetchLogs() {
  loading.value = true
  try {
    const params = {
      emotion: activeEmotion.value === '全部' ? '' : activeEmotion.value,
      page: 1,
      limit: 20
    }
    const res = await api.get('/users/notes', { params })
    if (res.data.code === 200) {
      notes.value = res.data.data.notes
      total.value = res.data.data.total
      page.value = 1
    }
  } catch {
    ElMessage.error('获取失败')
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  page.value++
  loading.value = true
  try {
    const params = {
      status: '日志',
      emotion: activeEmotion.value === '全部' ? '' : activeEmotion.value,
      page: page.value,
      limit: 20
    }
    const res = await api.get('/users/notes', { params })
    if (res.data.code === 200) {
      notes.value = [...notes.value, ...res.data.data.notes]
    }
  } catch {
    ElMessage.error('获取失败')
  } finally {
    loading.value = false
  }
}

function toggleSelect(noteId) {
  const index = selectedNotes.value.indexOf(noteId)
  if (index > -1) {
    selectedNotes.value.splice(index, 1)
  } else if (selectedNotes.value.length < 9) {
    selectedNotes.value.push(noteId)
  }
}

function clearSelection() {
  selectedNotes.value = []
}

function showNoteDetail(note) {
  currentNote.value = note
  showDetail.value = true
}

function editNote(note) {
  editingNoteId.value = note._id
  editContent.value = note.content
  editEmotion.value = note.emotion
  editIntensity.value = note.intensity
  editStory.value = note.story || ''
  showEditDialog.value = true
}

async function saveEdit() {
  if (!editContent.value.trim()) {
    ElMessage.error('内容不能为空')
    return
  }
  
  try {
    await api.put(`/notes/${editingNoteId.value}`, {
      content: editContent.value,
      emotion: editEmotion.value,
      intensity: parseInt(editIntensity.value),
      story: editStory.value
    })
    ElMessage.success('保存成功')
    showEditDialog.value = false
    fetchLogs()
  } catch {
    ElMessage.error('保存失败')
  }
}

async function moveSingleNote(newStatus) {
  if (!currentNote.value) return
  
  try {
    await api.put(`/notes/${currentNote.value._id}`, { status: newStatus })
    ElMessage.success('移动成功')
    showDetail.value = false
    fetchLogs()
  } catch {
    ElMessage.error('操作失败')
  }
}

async function deleteSingleNote() {
  if (!currentNote.value) return
  
  await ElMessageBox.confirm('确定要删除这条信纸吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await api.delete(`/notes/${currentNote.value._id}`)
      ElMessage.success('删除成功')
      showDetail.value = false
      fetchLogs()
    } catch {
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 用户取消
  })
}

async function publishSingleToTreehole() {
  if (!currentNote.value) return
  
  await ElMessageBox.confirm('确定要将这条信纸发表到回声广场吗？内容将匿名发布。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      await api.post('/treehole', {
        content: currentNote.value.content,
        emotion: currentNote.value.emotion
      })
      ElMessage.success('发布成功，等待审核')
      showDetail.value = false
      fetchLogs()
    } catch {
      ElMessage.error('发布失败')
    }
  }).catch(() => {
    // 用户取消
  })
}

async function moveToAttic() {
  await ElMessageBox.confirm(`确定要将选中的 ${selectedNotes.value.length} 条信纸移入思绪阁楼吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      await Promise.all(selectedNotes.value.map(id => 
        api.put(`/notes/${id}`, { status: '思绪阁楼' })
      ))
      ElMessage.success('移动成功')
      clearSelection()
      fetchLogs()
    } catch {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

async function moveToWall() {
  await ElMessageBox.confirm(`确定要将选中的 ${selectedNotes.value.length} 条信纸移入流星信箱吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      await Promise.all(selectedNotes.value.map(id => 
        api.put(`/notes/${id}`, { status: '流星信箱' })
      ))
      ElMessage.success('移动成功')
      clearSelection()
      fetchLogs()
    } catch {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

async function deleteSelected() {
  await ElMessageBox.confirm(`确定要删除选中的 ${selectedNotes.value.length} 条信纸吗？此操作不可恢复。`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await Promise.all(selectedNotes.value.map(id => 
        api.delete(`/notes/${id}`)
      ))
      ElMessage.success('删除成功')
      clearSelection()
      fetchLogs()
    } catch {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

async function publishToTreehole() {
  await ElMessageBox.confirm(`确定要将选中的 ${selectedNotes.value.length} 条信纸发表到回声广场吗？内容将匿名发布。`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      const notesToPublish = notes.value.filter(n => selectedNotes.value.includes(n._id))
      for (const note of notesToPublish) {
        await api.post('/treehole', {
          content: note.content,
          emotion: note.emotion
        })
      }
      ElMessage.success('发布成功，等待审核')
      clearSelection()
      fetchLogs()
    } catch {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

function formatTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

onMounted(() => {
  fetchLogs()
})
</script>

<style lang="scss" scoped>
.logs-page {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--color-night-blue) 0%, #1a202c 100%);
}

.logs-main {
  padding-top: 88px;
  padding-bottom: 40px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  
  .page-header__title {
    font-size: 2rem;
    color: var(--color-amber-glow);
    margin-bottom: 8px;
  }
  
  .page-header__subtitle {
    color: var(--color-moonlight);
    font-size: 1rem;
  }
}

.logs-container {
  display: flex;
  gap: 24px;
}

.logs-content {
  flex: 1;
}

.logs-filters {
  margin-bottom: 20px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--color-moonlight);
  transition: all var(--transition-fast);
  
  &.active, &:hover {
    background: var(--color-amber-glow);
    color: var(--color-night-blue);
  }
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.note-card {
  display: flex;
  gap: 12px;
  background: var(--color-cream);
  background-image: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 27px,
      rgba(197, 193, 185, 0.15) 27px,
      rgba(197, 193, 185, 0.15) 28px
    );
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: 
    0 2px 12px rgba(139, 115, 85, 0.08),
    0 1px 4px rgba(139, 115, 85, 0.04);
  transition: all var(--transition-normal);
  
  &:hover {
    box-shadow: 
      0 4px 20px rgba(212, 165, 116, 0.15),
      0 2px 8px rgba(212, 165, 116, 0.1);
    transform: translateY(-2px);
  }
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  &__content {
    font-size: 14px;
    line-height: 1.6;
    color: var(--color-night-blue);
    margin-bottom: 8px;
  }
  
  &__story {
    font-size: 13px;
    line-height: 1.5;
    color: var(--color-deep-blue-gray);
    margin-bottom: 12px;
    padding-left: 12px;
    border-left: 3px solid var(--color-amber-glow);
  }
  
  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  &__time {
    font-size: 12px;
    color: var(--color-ash);
  }
  
  &__intensity {
    font-size: 12px;
    color: var(--color-warm-brown);
    font-weight: 500;
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  
  input {
    display: none;
  }
  
  .checkmark {
    width: 20px;
    height: 20px;
    border: 2px solid var(--color-mist-gray);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
    position: relative;
    
    &::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 12px;
      color: white;
      opacity: 0;
      transition: opacity var(--transition-fast);
    }
  }
  
  input:checked + .checkmark {
    background: var(--color-amber-glow);
    border-color: var(--color-amber-glow);
    
    &::after {
      opacity: 1;
    }
  }
  
  input:disabled + .checkmark {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.note-content {
  flex: 1;
  cursor: pointer;
}

.edit-btn {
  font-size: 12px;
  color: var(--color-warm-brown);
  padding: 4px 8px;
  background: rgba(139, 115, 85, 0.1);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  
  &:hover {
    background: rgba(139, 115, 85, 0.2);
  }
}

.action-panel {
  width: 280px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-lg);
  padding: 20px;
  border: 1px solid rgba(212, 165, 116, 0.2);
  position: sticky;
  top: 100px;
}

.action-panel h3 {
  margin-bottom: 16px;
  font-size: 16px;
  color: var(--color-amber-glow);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--color-moonlight);
  transition: all var(--transition-fast);
  
  &:hover:not(:disabled) {
    background: var(--color-amber-glow);
    color: var(--color-night-blue);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &--danger {
    &:hover:not(:disabled) {
      background: #e57373;
      color: white;
    }
  }
}

.btn-icon {
  font-size: 16px;
}

.selected-info {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(212, 165, 116, 0.2);
  
  p {
    font-size: 13px;
    color: var(--color-moonlight);
    margin-bottom: 8px;
  }
}

.clear-btn {
  font-size: 12px;
  color: var(--color-amber-glow);
  text-decoration: underline;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  
  .empty-state__icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .empty-state__text {
    color: var(--color-moonlight);
    font-size: 16px;
    margin-bottom: 20px;
  }
}

.edit-form {
  .form-group {
    margin-bottom: 16px;
  }
  
  label {
    display: block;
    font-size: 13px;
    color: var(--color-text-secondary);
    margin-bottom: 8px;
  }
  
  textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    font-size: 14px;
    resize: vertical;
  }
}

.emotion-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.emotion-btn {
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  
  &.active {
    background: var(--color-primary);
    color: white;
  }
}

.detail-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.mini-btn {
  padding: 6px 12px;
  font-size: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--color-amber-glow);
    color: var(--color-night-blue);
  }
  
  &--danger:hover {
    background: #e57373;
    color: white;
  }
}

@media (max-width: 900px) {
  .logs-container {
    flex-direction: column;
  }
  
  .action-panel {
    width: 100%;
    position: static;
  }
}
</style>