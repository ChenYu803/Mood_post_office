<template>
  <div class="attic-page">
    <main class="attic-main">
      <div class="container">
        <div class="page-header">
          <router-link to="/deposit" class="page-back-btn">←</router-link>
          <h1 class="page-header__title">思绪阁楼</h1>
          <p class="page-header__subtitle">暂时存放，待日后处理</p>
        </div>

        <div class="attic-container">
          <div class="attic-shelves">
            <div 
              v-for="(note, index) in notes" 
              :key="note._id"
              class="floating-note"
              :style="getNoteStyle(note, index)"
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
                <div class="note-emotion" :class="`emotion-tag--${note.emotion}`">
                  {{ getEmotionIcon(note.emotion) }}
                </div>
                <p class="note-preview">{{ truncateContent(note.content) }}</p>
                <span class="note-date">{{ formatTime(note.createdAt) }}</span>
              </div>
              <button class="edit-btn" @click.stop="editNote(note)">✏️</button>
            </div>
            
            <div class="empty-shelf" v-if="notes.length === 0">
              <div class="empty-shelf__icon">🏠</div>
              <p>阁楼空空如也</p>
              <router-link to="/deposit/create" class="btn btn--outline btn--sm">放入思绪</router-link>
            </div>
          </div>

          <div class="action-panel">
            <h3>操作面板</h3>
            <div class="action-buttons">
              <button 
                class="action-btn" 
                :disabled="selectedNotes.length === 0"
                @click="moveToLog"
              >
                <span class="btn-icon">📝</span>
                <span>移入寄存柜</span>
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

    <el-dialog v-model="showDetail" title="思绪详情" width="500px">
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
            <button class="mini-btn" @click="moveSingleNote('日志')">移到寄存柜</button>
            <button class="mini-btn" @click="moveSingleNote('流星信箱')">移到流星信箱</button>
            <button class="mini-btn mini-btn--danger" @click="deleteSingleNote">删除</button>
            <button class="mini-btn" @click="editNote">编辑</button>
            <button class="mini-btn" @click="publishSingleToTreehole">发表到回声广场</button>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="showEditDialog" title="编辑思绪" width="450px">
      <div class="edit-form">
        <div class="form-group">
          <label>内容</label>
          <textarea 
            v-model="editContent" 
            placeholder="写下你的思绪..."
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
        <el-button type="primary" @click="saveNoteEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore, useNoteStore, api } from '@/stores'

const userStore = useUserStore()
const noteStore = useNoteStore()

const notes = ref([])
const selectedNotes = ref([])
const showDetail = ref(false)
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

async function fetchNotes() {
  await noteStore.fetchNotes({ status: '思绪阁楼', limit: 100 })
  notes.value = noteStore.notes
}

function getNoteStyle(note, index = 0) {
  const positions = [
    { top: '10%', left: '5%', rotate: -3 },
    { top: '20%', left: '35%', rotate: 2 },
    { top: '15%', left: '65%', rotate: -1 },
    { top: '50%', left: '10%', rotate: 4 },
    { top: '45%', left: '45%', rotate: -2 },
    { top: '55%', left: '75%', rotate: 1 },
    { top: '75%', left: '20%', rotate: -4 },
    { top: '70%', left: '55%', rotate: 3 },
    { top: '80%', left: '80%', rotate: -1 }
  ]
  const pos = positions[index % positions.length]
  return {
    top: pos.top,
    left: pos.left,
    transform: `rotate(${pos.rotate}deg)`
  }
}

function getEmotionIcon(emotion) {
  return emotionIcons[emotion] || '📝'
}

function truncateContent(content) {
  return content.length > 30 ? content.slice(0, 30) + '...' : content
}

function formatTime(dateStr) {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function showNoteDetail(note) {
  currentNote.value = note
  showDetail.value = true
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
  if (selectedNotes.value.length === 0) {
    ElMessage.warning('请先选择要移动的思绪')
    return
  }
  try {
    for (const noteId of selectedNotes.value) {
      await api.put(`/notes/${noteId}`, { status })
    }
    ElMessage.success(`已移至${status === '日志' ? '日志' : '心愿墙'}`)
    selectedNotes.value = []
    fetchNotes()
  } catch {
    ElMessage.error('移动失败')
  }
}

function moveToLog() {
  moveNotes('日志')
}

function moveToWall() {
  moveNotes('纪念')
}

async function deleteSelected() {
  if (selectedNotes.value.length === 0) {
    ElMessage.warning('请先选择要删除的思绪')
    return
  }
  try {
    await ElMessageBox.confirm('确定要删除选中的思绪吗？', '提示', { type: 'warning' })
    for (const noteId of selectedNotes.value) {
      await api.delete(`/notes/${noteId}`)
    }
    ElMessage.success('删除成功')
    selectedNotes.value = []
    fetchNotes()
  } catch {}
}

async function publishToTreehole() {
  if (selectedNotes.value.length === 0) {
    ElMessage.warning('请先选择要发表的思绪')
    return
  }
  try {
    const notesToPublish = notes.value.filter(n => selectedNotes.value.includes(n._id))
    for (const note of notesToPublish) {
      await api.post('/treehole', {
        content: note.content,
        emotion: note.emotion
      })
    }
    ElMessage.success('已发布到树洞')
    selectedNotes.value = []
    fetchNotes()
  } catch {
    ElMessage.error('发布失败')
  }
}

function editNote(note) {
  editId.value = note._id
  editContent.value = note.content
  editEmotion.value = note.emotion
  editIntensity.value = note.intensity
  editStory.value = note.story || ''
  showDetail.value = false
  showEditDialog.value = true
}

async function saveNoteEdit() {
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

async function moveSingleNote(status) {
  if (!currentNote.value) return
  try {
    await api.put(`/notes/${currentNote.value._id}`, { status })
    ElMessage.success(`已移至${status === '日志' ? '寄存柜' : '流星信箱'}`)
    showDetail.value = false
    fetchNotes()
  } catch {
    ElMessage.error('移动失败')
  }
}

async function deleteSingleNote() {
  if (!currentNote.value) return
  try {
    await ElMessageBox.confirm('确定要删除这条思绪吗？', '提示', { type: 'warning' })
    await api.delete(`/notes/${currentNote.value._id}`)
    ElMessage.success('删除成功')
    showDetail.value = false
    fetchNotes()
  } catch {}
}

async function publishSingleToTreehole() {
  if (!currentNote.value) return
  try {
    await api.post('/treehole', {
      content: currentNote.value.content,
      emotion: currentNote.value.emotion
    })
    ElMessage.success('已发布到回声广场')
    showDetail.value = false
  } catch {
    ElMessage.error('发布失败')
  }
}

onMounted(() => {
  fetchNotes()
})
</script>

<style lang="scss" scoped>
.attic-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #3d3632 0%, #2a2520 50%, #1f1a17 100%);
}

.attic-main {
  padding-top: 88px;
  padding-bottom: 60px;
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

.attic-container {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 32px;
}

.attic-shelves {
  position: relative;
  min-height: 600px;
  background: linear-gradient(180deg, rgba(74, 67, 58, 0.3) 0%, rgba(58, 52, 45, 0.2) 100%);
  border-radius: var(--radius-xl);
  border: 2px solid rgba(139, 115, 85, 0.3);
  overflow: hidden;
  box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.3);
}

.floating-note {
  position: absolute;
  width: 180px;
  padding: 16px;
  background: linear-gradient(135deg, #e8dfd4 0%, #d4c8b8 100%);
  border-radius: var(--radius-lg);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 23px,
        rgba(139, 115, 85, 0.1) 23px,
        rgba(139, 115, 85, 0.1) 24px
      );
    border-radius: var(--radius-lg);
    pointer-events: none;
  }
  
  &:hover {
    transform: scale(1.1) !important;
    z-index: 10;
    box-shadow: 
      0 8px 24px rgba(0, 0, 0, 0.4),
      0 4px 8px rgba(0, 0, 0, 0.3);
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
  
  input {
    display: none;
  }
  
  .checkmark {
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-warm-brown);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
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
    background: var(--color-amber-glow);
    border-color: var(--color-amber-glow);
    
    &::after {
      opacity: 1;
    }
  }
  
  input:disabled + .checkmark {
    opacity: 0.5;
  }
}

.note-content {
  cursor: pointer;
}

.edit-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(139, 115, 85, 0.2);
  border-radius: var(--radius-sm);
  font-size: 12px;
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--transition-fast);
  
  .floating-note:hover & {
    opacity: 1;
  }
  
  &:hover {
    background: rgba(139, 115, 85, 0.4);
  }
}

.note-emotion {
  font-size: 24px;
  margin-bottom: 8px;
}

.note-preview {
  font-size: 14px;
  color: var(--color-night-blue);
  line-height: 1.5;
  margin-bottom: 8px;
}

.note-date {
  font-size: 12px;
  color: var(--color-ash);
}

.empty-shelf {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--color-moonlight);
  
  .empty-shelf__icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.6;
  }
  
  p {
    margin-bottom: 16px;
    opacity: 0.8;
  }
}

.action-panel {
  background: rgba(74, 67, 58, 0.4);
  border-radius: var(--radius-xl);
  padding: 24px;
  border: 1px solid rgba(139, 115, 85, 0.3);
  position: sticky;
  top: 88px;
  height: fit-content;
  
  h3 {
    font-size: 1.1rem;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(139, 115, 85, 0.3);
    color: var(--color-amber-glow);
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
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--color-moonlight);
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--color-amber-glow);
    color: var(--color-night-blue);
  }
  
  &--danger:hover {
    background: #E53935;
    color: white;
  }
  
  .btn-icon {
    font-size: 20px;
  }
}

.selected-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid rgba(139, 115, 85, 0.3);
  
  p {
    font-size: 14px;
    color: var(--color-moonlight);
  }
  
  .clear-btn {
    font-size: 13px;
    color: var(--color-amber-glow);
    text-decoration: underline;
  }
}

.note-detail {
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .detail-intensity {
      font-size: 14px;
      color: var(--color-text-muted);
    }
  }
  
  .detail-content {
    font-size: 16px;
    line-height: 1.8;
    color: var(--color-text);
    margin-bottom: 16px;
  }
  
  .detail-story {
    font-size: 14px;
    color: var(--color-text-secondary);
    padding: 12px;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    margin-bottom: 20px;
  }
  
  .detail-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid var(--border-light);
    
    span {
      font-size: 13px;
      color: var(--color-text-muted);
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
  color: var(--color-text-secondary);
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--color-amber-glow);
    color: var(--color-night-blue);
  }
  
  &--danger:hover {
    background: #E53935;
    color: white;
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
  border: 2px solid transparent;
  
  &.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }
}

.form-group {
  margin-top: 20px;
  
  .form-label {
    display: block;
    font-size: 14px;
    color: var(--color-text-secondary);
    margin-bottom: 12px;
  }
}

@media (max-width: 768px) {
  .attic-container {
    grid-template-columns: 1fr;
  }
  
  .action-panel {
    position: static;
  }
}
</style>
