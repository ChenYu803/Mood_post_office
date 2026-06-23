<template>
  <div class="voicebox-page">
    <main class="voicebox-main">
      <div class="container">
        <div class="page-header">
          <router-link to="/deposit" class="page-back-btn">←</router-link>
          <h1 class="page-header__title">留声匣</h1>
          <p class="page-header__subtitle">珍藏温暖瞬间，留住美好回忆</p>
        </div>

        <div class="voicebox-container">
          <div class="wall">
            <div 
              v-for="(note, index) in notes" 
              :key="note._id"
              class="wish-card"
              :style="getCardStyle(index)"
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
              <div class="wish-card__heart">💝</div>
              <div class="wish-card__content" @click="showDetail(note)">
                <div class="wish-emotion">{{ getEmotionIcon(note.emotion) }}</div>
                <p>{{ note.content }}</p>
                <p class="wish-story" v-if="note.story">{{ note.story }}</p>
              </div>
              <div class="wish-card__date">{{ formatDate(note.createdAt) }}</div>
              <button class="edit-btn" @click.stop="editNote(note)">✏️</button>
            </div>
            
            <div class="empty-wall" v-if="notes.length === 0">
              <div class="empty-wall__icon">📻</div>
              <p>留声匣空空如也</p>
              <router-link to="/deposit" class="btn btn--outline btn--sm">记录美好</router-link>
            </div>
          </div>

          <div class="sidebar">
            <div class="stats-card">
              <h3>美好统计</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-value">{{ notes.length }}</span>
                  <span class="stat-label">美好总数</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ happyCount }}</span>
                  <span class="stat-label">开心时刻</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ movedCount }}</span>
                  <span class="stat-label">感动瞬间</span>
                </div>
              </div>
            </div>

            <div class="action-card">
              <h3>管理回忆</h3>
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
                  @click="moveToMeteorMailbox"
                >
                  <span class="btn-icon">🌠</span>
                  <span>移入流星信箱</span>
                </button>
                <button 
                  class="action-btn" 
                  :disabled="selectedNotes.length === 0"
                  @click="publishToTreehole"
                >
                  <span class="btn-icon">🌊</span>
                  <span>发表到回声广场</span>
                </button>
                <button 
                  class="action-btn action-btn--danger" 
                  :disabled="selectedNotes.length === 0"
                  @click="deleteSelected"
                >
                  <span class="btn-icon">🗑️</span>
                  <span>删除</span>
                </button>
              </div>
              <div class="selected-info" v-if="selectedNotes.length > 0">
                <p>已选择 {{ selectedNotes.length }} 条（最多9条）</p>
                <button class="clear-btn" @click="clearSelection">取消选择</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <el-dialog v-model="showDetailDialog" title="回忆详情" width="500px">
      <div class="wish-detail" v-if="currentNote">
        <div class="detail-header">
          <span class="emotion-tag">{{ currentNote.emotion }}</span>
          <span class="detail-intensity">强度: {{ currentNote.intensity }}%</span>
        </div>
        <p class="detail-content">{{ currentNote.content }}</p>
        <p class="detail-story" v-if="currentNote.story">{{ currentNote.story }}</p>
        <div class="detail-footer">
          <span>{{ formatDate(currentNote.createdAt) }}</span>
          <div class="detail-actions">
            <button class="mini-btn" @click="moveSingle('思绪阁楼')">移到思绪阁楼</button>
            <button class="mini-btn" @click="moveSingle('流星信箱')">移到流星信箱</button>
            <button class="mini-btn mini-btn--danger" @click="deleteSingle">删除</button>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="showEditDialog" title="编辑回忆" width="450px">
      <div class="edit-form">
        <div class="form-group">
          <label>内容</label>
          <textarea 
            v-model="editContent" 
            placeholder="记录美好瞬间..."
            :rows="5"
            :maxlength="800"
          ></textarea>
        </div>
        <div class="form-group">
          <label>情绪标签</label>
          <div class="emotion-selector">
            <button
              v-for="emotion in emotions"
              :key="emotion"
              :class="['emotion-btn', { active: editEmotion === emotion }]"
              @click="editEmotion = emotion"
            >{{ emotion }}</button>
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useNoteStore, api } from '@/stores'

const noteStore = useNoteStore()

const notes = ref([])
const selectedNotes = ref([])
const showDetailDialog = ref(false)
const currentNote = ref(null)
const showEditDialog = ref(false)
const editContent = ref('')
const editEmotion = ref('')
const editIntensity = ref(50)
const editStory = ref('')
const editId = ref('')

const emotions = ['开心', '平静', '焦虑', '愤怒', '难过', '感动', '迷茫']
const emotionIcons = {
  '开心': '😊', '平静': '🍃', '焦虑': '☁️', '愤怒': '🔥', '难过': '💧', '感动': '💕', '迷茫': '🌫️'
}

const happyCount = computed(() => notes.value.filter(n => n.emotion === '开心').length)
const movedCount = computed(() => notes.value.filter(n => n.emotion === '感动').length)

async function fetchNotes() {
  await noteStore.fetchNotes({ status: '留声匣', limit: 100 })
  notes.value = noteStore.notes
}

function getCardStyle(index = 0) {
  const positions = [
    { top: '5%', left: '8%', rotate: -2 },
    { top: '8%', left: '35%', rotate: 1 },
    { top: '5%', left: '62%', rotate: -1 },
    { top: '30%', left: '15%', rotate: 3 },
    { top: '32%', left: '50%', rotate: -2 },
    { top: '28%', left: '78%', rotate: 2 },
    { top: '55%', left: '5%', rotate: -1 },
    { top: '58%', left: '40%', rotate: 1 },
    { top: '55%', left: '70%', rotate: -3 },
    { top: '78%', left: '20%', rotate: 2 },
    { top: '80%', left: '55%', rotate: -1 },
    { top: '75%', left: '82%', rotate: 1 }
  ]
  const pos = positions[index % positions.length]
  return {
    top: pos.top,
    left: pos.left,
    transform: `rotate(${pos.rotate}deg)`
  }
}

function getEmotionIcon(emotion) {
  return emotionIcons[emotion] || '✨'
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

function showDetail(note) {
  currentNote.value = note
  showDetailDialog.value = true
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

async function moveNotes(status) {
  if (selectedNotes.value.length === 0) return
  try {
    for (const noteId of selectedNotes.value) {
      await api.put(`/notes/${noteId}`, { status })
    }
    ElMessage.success('移动成功')
    selectedNotes.value = []
    fetchNotes()
  } catch {
    ElMessage.error('移动失败')
  }
}

function moveToAttic() {
  moveNotes('思绪阁楼')
}

function moveToMeteorMailbox() {
  moveNotes('流星信箱')
}

async function deleteSelected() {
  if (selectedNotes.value.length === 0) return
  try {
    await ElMessageBox.confirm('确定要删除选中的回忆吗？', '提示', { type: 'warning' })
    for (const noteId of selectedNotes.value) {
      await api.delete(`/notes/${noteId}`)
    }
    ElMessage.success('删除成功')
    selectedNotes.value = []
    fetchNotes()
  } catch {}
}

async function publishToTreehole() {
  if (selectedNotes.value.length === 0) return
  try {
    const notesToPublish = notes.value.filter(n => selectedNotes.value.includes(n._id))
    for (const note of notesToPublish) {
      await api.post('/treehole', {
        content: note.content,
        emotion: note.emotion
      })
    }
    ElMessage.success('发表成功')
    selectedNotes.value = []
    fetchNotes()
  } catch {
    ElMessage.error('发表失败')
  }
}

async function moveSingle(status) {
  if (!currentNote.value) return
  try {
    await api.put(`/notes/${currentNote.value._id}`, { status })
    ElMessage.success('移动成功')
    showDetailDialog.value = false
    fetchNotes()
  } catch {
    ElMessage.error('移动失败')
  }
}

async function deleteSingle() {
  if (!currentNote.value) return
  try {
    await ElMessageBox.confirm('确定要删除这个回忆吗？', '提示', { type: 'warning' })
    await api.delete(`/notes/${currentNote.value._id}`)
    ElMessage.success('删除成功')
    showDetailDialog.value = false
    fetchNotes()
  } catch {}
}

function editNote(note) {
  editId.value = note._id
  editContent.value = note.content
  editEmotion.value = note.emotion
  editIntensity.value = note.intensity
  editStory.value = note.story || ''
  showDetailDialog.value = false
  showEditDialog.value = true
}

async function saveEdit() {
  try {
    await api.put(`/notes/${editId.value}`, { 
      content: editContent.value, 
      emotion: editEmotion.value,
      intensity: editIntensity.value,
      story: editStory.value
    })
    ElMessage.success('修改成功')
    showEditDialog.value = false
    fetchNotes()
  } catch {
    ElMessage.error('修改失败')
  }
}

onMounted(() => {
  fetchNotes()
})
</script>

<style lang="scss" scoped>
.voicebox-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #2d1f1f 0%, #3d2a2a 50%, #4a3535 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(232, 201, 160, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
}

.voicebox-main {
  padding-top: 88px;
  padding-bottom: 60px;
  position: relative;
  z-index: 1;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  
  &__title {
    font-size: 2rem;
    font-weight: 300;
    color: var(--color-candle);
    letter-spacing: 0.1em;
    margin-bottom: 8px;
  }
  
  &__subtitle {
    font-size: 1rem;
    color: var(--color-moonlight);
    letter-spacing: 0.05em;
  }
}

.page-back-btn {
  position: absolute;
  left: 24px;
  top: 0;
  font-size: 1.5rem;
  color: var(--color-moonlight);
  text-decoration: none;
  transition: color 0.3s;
  
  &:hover {
    color: var(--color-candle);
  }
}

.voicebox-container {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 32px;
}

.wall {
  position: relative;
  min-height: 700px;
  background: rgba(45, 31, 31, 0.6);
  border-radius: 20px;
  border: 1px solid rgba(232, 201, 160, 0.2);
  overflow: hidden;
}

.wish-card {
  position: absolute;
  width: 220px;
  padding: 20px;
  background: rgba(250, 246, 240, 0.95);
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.4s ease;
  
  &:hover {
    transform: scale(1.05) !important;
    z-index: 10;
    box-shadow: 0 8px 30px rgba(232, 201, 160, 0.3);
  }
  
  &__heart {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 24px;
    z-index: 5;
  }
  
  &__content {
    text-align: center;
    cursor: pointer;
    
    p {
      font-size: 14px;
      color: var(--color-deep-blue-gray);
      line-height: 1.6;
      margin-top: 12px;
    }
  }
  
  .wish-emotion {
    font-size: 32px;
  }
  
  .wish-story {
    font-size: 13px !important;
    color: var(--color-moonlight) !important;
    padding: 8px;
    background: var(--color-parchment);
    border-radius: 8px;
    margin-top: 8px !important;
  }
  
  &__date {
    font-size: 12px;
    color: var(--color-ash);
    text-align: center;
    margin-top: 12px;
  }
}

.checkbox-label {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  
  input { display: none; }
  
  .checkmark {
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-mist-gray);
    border-radius: 4px;
    transition: all 0.2s;
    position: relative;
    
    &::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 10px;
      color: white;
      opacity: 0;
    }
  }
  
  input:checked + .checkmark {
    background: var(--color-candle);
    border-color: var(--color-candle);
    &::after { opacity: 1; }
  }
  
  input:disabled + .checkmark { opacity: 0.5; }
}

.edit-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(232, 201, 160, 0.3);
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  
  .wish-card:hover & { opacity: 1; }
  &:hover { background: rgba(232, 201, 160, 0.5); }
}

.empty-wall {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--color-moonlight);
  
  .empty-wall__icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  p { margin-bottom: 16px; }
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-card, .action-card {
  background: rgba(45, 31, 31, 0.7);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(232, 201, 160, 0.15);
  
  h3 {
    font-size: 1.1rem;
    font-weight: 400;
    color: var(--color-candle);
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(232, 201, 160, 0.2);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-item {
  text-align: center;
  
  .stat-value {
    display: block;
    font-size: 1.8rem;
    font-weight: 300;
    color: var(--color-candle);
  }
  
  .stat-label {
    font-size: 12px;
    color: var(--color-moonlight);
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(250, 246, 240, 0.1);
  border-radius: 10px;
  font-size: 14px;
  color: var(--color-cream);
  transition: all 0.3s;
  
  &:hover:not(:disabled) {
    background: rgba(232, 201, 160, 0.3);
    color: var(--color-candle);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &--danger:hover:not(:disabled) {
    background: rgba(229, 57, 53, 0.3);
    color: #ff8a80;
  }
  
  .btn-icon { font-size: 20px; }
}

.selected-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid rgba(232, 201, 160, 0.2);
  
  p {
    font-size: 14px;
    color: var(--color-moonlight);
  }
  
  .clear-btn {
    font-size: 13px;
    color: var(--color-candle);
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: underline;
  }
}

.wish-detail {
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .emotion-tag {
    padding: 4px 12px;
    background: var(--color-parchment);
    border-radius: 8px;
    font-size: 14px;
    color: var(--color-deep-blue-gray);
  }
  
  .detail-intensity {
    font-size: 14px;
    color: var(--color-moonlight);
  }
  
  .detail-content {
    font-size: 16px;
    line-height: 1.8;
    color: var(--color-deep-blue-gray);
    margin-bottom: 16px;
  }
  
  .detail-story {
    font-size: 14px;
    color: var(--color-moonlight);
    padding: 12px;
    background: var(--color-parchment);
    border-radius: 10px;
    margin-bottom: 20px;
  }
  
  .detail-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid var(--color-mist-gray);
    
    span {
      font-size: 13px;
      color: var(--color-ash);
    }
  }
  
  .detail-actions {
    display: flex;
    gap: 8px;
  }
}

.mini-btn {
  padding: 4px 12px;
  font-size: 12px;
  color: var(--color-moonlight);
  background: var(--color-parchment);
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: var(--color-candle);
    color: var(--color-night-blue);
  }
  
  &--danger:hover {
    background: #E53935;
    color: white;
  }
}

.edit-form {
  .form-group {
    margin-bottom: 16px;
  }
  
  label {
    display: block;
    font-size: 13px;
    color: var(--color-moonlight);
    margin-bottom: 8px;
  }
  
  textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--color-mist-gray);
    border-radius: 10px;
    font-size: 14px;
    background: var(--color-cream);
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
  background: var(--color-parchment);
  border-radius: 8px;
  font-size: 13px;
  color: var(--color-deep-blue-gray);
  border: 1px solid var(--color-mist-gray);
  cursor: pointer;
  transition: all 0.2s;
  
  &.active {
    background: var(--color-candle);
    color: var(--color-night-blue);
    border-color: var(--color-candle);
  }
}

@media (max-width: 768px) {
  .voicebox-container {
    grid-template-columns: 1fr;
  }
}
</style>
