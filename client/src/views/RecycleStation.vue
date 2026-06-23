<template>
  <div class="heart-post-page">
    <div class="page-container">
      <div class="left-section">
        <router-link to="/deposit/locker" class="area-card locker-area">
          <div class="area-icon">🗄️</div>
          <div class="area-title">寄存柜</div>
          <div class="area-desc">所有心事信纸</div>
          <div class="area-glow"></div>
        </router-link>
        <router-link to="/deposit/attic" class="area-card attic-area">
          <div class="area-icon">🏚️</div>
          <div class="area-title">思绪阁楼</div>
          <div class="area-desc">沉重的心事</div>
          <div class="area-glow"></div>
        </router-link>
      </div>

      <div class="center-section">
        <div class="writing-desk">
          <div class="desk-lamp">
            <div class="lamp-light"></div>
          </div>
          <div class="paper-container">
            <RichTextEditor v-model="noteContent" placeholder="写下你的心事..." :style="{ minHeight: editorHeight + 'px' }" />
            <div class="resize-handle" @mousedown="startResize"></div>
          </div>
          
          <div class="emotion-row">
            <button
              v-for="emotion in emotions"
              :key="emotion.name"
              :class="['emotion-chip', { active: selectedEmotion === emotion.name }]"
              @click="selectedEmotion = emotion.name"
            >
              <span class="emotion-emoji">{{ emotion.emoji }}</span>
              <span class="emotion-label">{{ emotion.name }}</span>
            </button>
          </div>
          
          <div class="intensity-row" v-if="selectedEmotion">
            <span class="intensity-label">情绪强度</span>
            <input type="range" v-model="intensity" min="0" max="100" class="intensity-bar" />
            <span class="intensity-val">{{ intensity }}%</span>
          </div>

          <div class="story-row" v-if="selectedDestination === '留声匣'">
            <textarea
              v-model="noteStory"
              placeholder="记录背后的故事..."
              :maxlength="200"
              class="story-input"
            ></textarea>
          </div>

          <div class="destination-row">
            <button
              v-for="dest in destinations"
              :key="dest.status"
              :class="['dest-btn', { active: selectedDestination === dest.status }]"
              @click="selectedDestination = dest.status"
            >
              <span class="dest-icon">{{ dest.icon }}</span>
              <span class="dest-label">{{ dest.label }}</span>
            </button>
          </div>

          <button
            class="submit-btn"
            :class="{ ready: canSubmit }"
            :disabled="!canSubmit"
            @click="handleSubmit"
          >
            {{ submitText }}
          </button>
        </div>
      </div>

      <div class="right-section">
        <router-link to="/deposit/meteor-mailbox" class="area-card meteor-area">
          <div class="area-icon">🌠</div>
          <div class="area-title">流星信箱</div>
          <div class="area-desc">许下心愿</div>
          <div class="area-glow"></div>
        </router-link>
        <router-link to="/deposit/voice-box" class="area-card voicebox-area">
          <div class="area-icon">📻</div>
          <div class="area-title">留声匣</div>
          <div class="area-desc">珍藏美好</div>
          <div class="area-glow"></div>
        </router-link>
      </div>
    </div>

    <div class="incinerator-section">
      <div class="incinerator" :class="{ burning: isBurning }" @click="handleIncineratorClick">
        <div class="furnace">
          <div class="furnace-opening">
            <div class="fire-glow" v-if="isBurning"></div>
            <canvas ref="fireCanvas" class="fire-canvas" v-if="isBurning"></canvas>
          </div>
          <div class="furnace-body"></div>
        </div>
        <div class="incinerator-label">焚信炉</div>
        <div class="incinerator-hint">释放不需要的情绪</div>
      </div>
      <div class="feedback-text" v-if="showFeedback">
        {{ feedbackText }}
      </div>
    </div>

    <el-dialog 
      v-model="showIncineratorDialog" 
      :show-close="false"
      width="600px"
      class="incinerator-dialog"
      :close-on-click-modal="false"
    >
      <div class="burn-ceremony">
        <canvas ref="burnCanvas" class="burn-canvas"></canvas>
        <div class="burn-feedback" v-if="showBurnFeedback">
          {{ burnFeedbackText }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore, useNoteStore } from '@/stores'
import RichTextEditor from '@/components/RichTextEditor.vue'

const router = useRouter()
const userStore = useUserStore()
const noteStore = useNoteStore()

const noteContent = ref('')
const selectedEmotion = ref('')
const intensity = ref(50)
const noteStory = ref('')
const selectedDestination = ref('思绪阁楼')
const editorHeight = ref(400)
const isResizing = ref(false)

function startResize(e) {
  isResizing.value = true
  const startY = e.clientY
  const startHeight = editorHeight.value

  const onMouseMove = (e) => {
    const delta = e.clientY - startY
    editorHeight.value = Math.max(200, Math.min(800, startHeight + delta))
  }

  const onMouseUp = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const isBurning = ref(false)
const showFeedback = ref(false)
const feedbackText = ref('')
const showIncineratorDialog = ref(false)
const showBurnFeedback = ref(false)
const burnFeedbackText = ref('')
const fireCanvas = ref(null)
const burnCanvas = ref(null)
let burnAnimationId = null
let fireAnimationId = null

const emotions = [
  { name: '开心', emoji: '😊' },
  { name: '平静', emoji: '🍃' },
  { name: '焦虑', emoji: '☁️' },
  { name: '愤怒', emoji: '🔥' },
  { name: '难过', emoji: '💧' },
  { name: '感动', emoji: '💕' },
  { name: '迷茫', emoji: '🌫️' }
]

const destinations = [
  { status: '思绪阁楼', icon: '🏚️', label: '思绪阁楼' },
  { status: '流星信箱', icon: '🌠', label: '流星信箱' },
  { status: '留声匣', icon: '📻', label: '留声匣' },
  { status: '焚信炉', icon: '🔥', label: '焚信炉' }
]

const canSubmit = computed(() => {
  return noteContent.value.trim().length > 0 && selectedEmotion.value && selectedDestination.value
})

const submitText = computed(() => {
  if (!selectedDestination.value) return '选择去向'
  const dest = destinations.find(d => d.status === selectedDestination.value)
  return dest ? `投入${dest.label}` : '保存'
})

const feedbackMessages = [
  '这封心事已经替你处理好了。',
  '愿今晚的风，也带走一点难过。',
  '有些情绪，不必一直留下。',
  '晚安，辛苦了。'
]

async function handleSubmit() {
  if (!canSubmit.value) return
  
  if (!userStore.isLoggedIn) {
    router.push('/auth?redirect=/deposit')
    return
  }

  if (selectedDestination.value === '焚信炉') {
    startBurnCeremony()
    return
  }

  const result = await noteStore.createNote({
    content: noteContent.value,
    emotion: selectedEmotion.value,
    intensity: intensity.value,
    status: selectedDestination.value,
    story: noteStory.value
  })

  if (result.success) {
    const messages = {
      '思绪阁楼': '心事已存入思绪阁楼',
      '流星信箱': '心愿已投入流星信箱',
      '留声匣': '美好已珍藏于留声匣'
    }
    ElMessage.success(messages[selectedDestination.value] || '保存成功')
    resetForm()
  }
}

function startBurnCeremony() {
  showIncineratorDialog.value = true
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    setTimeout(() => {
      showBurnFeedback.value = true
      burnFeedbackText.value = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]
      setTimeout(() => {
        showIncineratorDialog.value = false
        showBurnFeedback.value = false
        resetForm()
      }, 2000)
    }, 500)
    return
  }
  nextTick(() => {
    initBurnAnimation()
  })
}

function initBurnAnimation() {
  const canvas = burnCanvas.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  canvas.width = 560
  canvas.height = 400
  
  let phase = 0
  let paperY = 0
  let paperOpacity = 1
  let particles = []
  let flames = []
  let startTime = Date.now()
  
  const paperText = noteContent.value.substring(0, 100)
  
  function drawPaper(y, opacity) {
    ctx.save()
    ctx.globalAlpha = opacity
    ctx.fillStyle = '#FAF6F0'
    ctx.shadowColor = 'rgba(139, 115, 85, 0.3)'
    ctx.shadowBlur = 20
    ctx.beginPath()
    ctx.roundRect(180, y, 200, 250, 8)
    ctx.fill()
    
    ctx.fillStyle = '#4A5568'
    ctx.font = '14px system-ui'
    ctx.globalAlpha = opacity * 0.8
    const lines = paperText.split('').reduce((acc, char, i) => {
      const lineIndex = Math.floor(i / 18)
      if (!acc[lineIndex]) acc[lineIndex] = ''
      acc[lineIndex] += char
      return acc
    }, [])
    lines.slice(0, 10).forEach((line, i) => {
      ctx.fillText(line, 195, y + 30 + i * 20)
    })
    ctx.restore()
  }
  
  function drawFlame(x, y, size) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size)
    gradient.addColorStop(0, 'rgba(255, 200, 100, 0.9)')
    gradient.addColorStop(0.4, 'rgba(255, 120, 50, 0.7)')
    gradient.addColorStop(0.8, 'rgba(200, 50, 20, 0.3)')
    gradient.addColorStop(1, 'rgba(100, 20, 10, 0)')
    
    ctx.beginPath()
    ctx.fillStyle = gradient
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }
  
  function drawAsh(x, y, size, opacity) {
    ctx.save()
    ctx.globalAlpha = opacity
    ctx.fillStyle = '#A09890'
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  
  function animate() {
    const elapsed = Date.now() - startTime
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    if (elapsed < 1500) {
      paperY = Math.min(100, elapsed / 15)
      drawPaper(paperY, 1)
    } else if (elapsed < 4000) {
      const burnProgress = (elapsed - 1500) / 2500
      paperOpacity = 1 - burnProgress
      
      if (Math.random() > 0.7) {
        flames.push({
          x: 280 + (Math.random() - 0.5) * 180,
          y: 150 + Math.random() * 100,
          size: 20 + Math.random() * 40,
          life: 1
        })
      }
      
      flames = flames.filter(f => {
        f.y -= 2
        f.life -= 0.02
        return f.life > 0
      })
      
      flames.forEach(f => drawFlame(f.x, f.y, f.size * f.life))
      drawPaper(paperY, paperOpacity)
      
      if (Math.random() > 0.8) {
        particles.push({
          x: 280 + (Math.random() - 0.5) * 150,
          y: 200,
          vx: (Math.random() - 0.5) * 2,
          vy: -1 - Math.random() * 2,
          size: 2 + Math.random() * 3,
          opacity: 1
        })
      }
    } else {
      particles = particles.filter(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy -= 0.02
        p.opacity -= 0.005
        return p.opacity > 0 && p.y > -50
      })
    }
    
    particles.forEach(p => drawAsh(p.x, p.y, p.size, p.opacity))
    
    if (elapsed > 4500 && particles.length === 0) {
      showBurnFeedback.value = true
      burnFeedbackText.value = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]
      
      setTimeout(() => {
        showIncineratorDialog.value = false
        showBurnFeedback.value = false
        resetForm()
      }, 2500)
      return
    }
    
    burnAnimationId = requestAnimationFrame(animate)
  }
  
  animate()
}

function handleIncineratorClick() {
  if (noteContent.value.trim() && selectedEmotion.value) {
    selectedDestination.value = '焚信炉'
    handleSubmit()
  } else {
    ElMessage.warning('请先写下心事并选择情绪')
  }
}

function resetForm() {
  noteContent.value = ''
  selectedEmotion.value = ''
  intensity.value = 50
  noteStory.value = ''
  selectedDestination.value = '思绪阁楼'
  if (burnAnimationId) {
    cancelAnimationFrame(burnAnimationId)
    burnAnimationId = null
  }
}

watch(showIncineratorDialog, (val) => {
  if (!val && burnAnimationId) {
    cancelAnimationFrame(burnAnimationId)
    burnAnimationId = null
  }
})

onUnmounted(() => {
  if (burnAnimationId) cancelAnimationFrame(burnAnimationId)
  if (fireAnimationId) cancelAnimationFrame(fireAnimationId)
})
</script>

<style lang="scss" scoped>
.heart-post-page {
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
}

.page-container {
  flex: 1;
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  gap: 40px;
  padding: 100px 40px 40px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.left-section, .right-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 60px;
}

.area-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 20px;
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: background var(--dur-normal) ease,
              transform var(--dur-normal) ease;
  overflow: hidden;
  
  .area-icon {
    font-size: 36px;
    margin-bottom: 12px;
    transition: transform var(--dur-normal) ease;
  }

  .area-title {
    font-size: 15px;
    font-weight: 500;
    color: var(--color-primary);
    margin-bottom: 4px;
  }

  .area-desc {
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  .area-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(ellipse at center, var(--color-primary-glow) 0%, transparent 70%);
    opacity: 0;
    transition: opacity var(--dur-slow) ease;
    pointer-events: none;
  }

  &:hover {
    background: var(--color-primary-muted);
    transform: translateY(-3px);

    .area-icon {
      transform: scale(1.08);
    }

    .area-glow {
      opacity: 1;
    }
  }
}

.locker-area, .attic-area {
  background: linear-gradient(180deg, rgba(45, 55, 72, 0.7) 0%, rgba(35, 45, 58, 0.8) 100%);
}

.meteor-area {
  background: linear-gradient(180deg, rgba(26, 26, 46, 0.7) 0%, rgba(15, 52, 96, 0.5) 100%);
}

.voicebox-area {
  background: linear-gradient(180deg, rgba(45, 31, 31, 0.6) 0%, rgba(74, 53, 53, 0.4) 100%);
}

.center-section {
  display: flex;
  justify-content: center;
  padding-top: 20px;
}

.writing-desk {
  position: relative;
  width: 100%;
  max-width: 680px;
  background: linear-gradient(175deg, var(--bg-paper) 0%, var(--bg-paper-dark) 100%);
  border-radius: var(--radius-xl);
  padding: 48px 40px 40px;
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.45),
    0 0 120px var(--color-primary-glow);
}

.desk-lamp {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 60px;
  
  .lamp-light {
    width: 100%;
    height: 100%;
    background: radial-gradient(ellipse at center bottom, rgba(232, 201, 160, 0.4) 0%, transparent 70%);
    animation: lampGlow 4s ease-in-out infinite;
  }
}

@keyframes lampGlow {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.paper-container {
  position: relative;
  margin-bottom: 24px;
}

.resize-handle {
  width: 60px;
  height: 12px;
  margin: 8px auto;
  cursor: ns-resize;
  background: rgba(139, 115, 85, 0.2);
  border-radius: 6px;
  transition: background var(--dur-fast) ease;

  &:hover {
    background: var(--color-primary);
  }
}

:deep(.rich-text-editor) {
  border-radius: var(--radius-md);

  .toolbar {
    background: rgba(139, 115, 85, 0.12);
    border-color: rgba(139, 115, 85, 0.15);
  }

  .toolbar-btn {
    color: var(--color-text-inverse);

    &:hover {
      color: #8B6914;
      background: rgba(139, 115, 85, 0.12);
    }

    &.is-active {
      color: #8B6914;
      background: rgba(139, 115, 85, 0.18);
    }
  }

  .separator {
    background: rgba(139, 115, 85, 0.15);
  }

  .editor-content {
    background: transparent;
    border-color: rgba(139, 115, 85, 0.12);

    :deep(.tiptap) {
      color: var(--color-text-inverse);

      h1, h2, h3 {
        color: #3D4A5C;
      }

      blockquote {
        border-left-color: #8B6914;
        color: #6B5B3D;
      }

      pre {
        background: rgba(45, 36, 24, 0.06);

        code {
          color: var(--color-text-inverse);
        }
      }

      code {
        background: rgba(45, 36, 24, 0.06);
        color: #6B5B3D;
      }
    }
  }
}

.emotion-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.emotion-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  background: rgba(139, 115, 85, 0.08);
  cursor: pointer;
  transition: border-color var(--dur-fast) ease,
              background var(--dur-fast) ease,
              transform var(--dur-fast) ease;

  .emotion-emoji {
    font-size: 22px;
  }

  .emotion-label {
    font-size: 11px;
    color: var(--color-text-inverse);
    white-space: nowrap;
  }

  &:hover {
    transform: scale(1.05);
    border-color: var(--border-color);
  }

  &.active {
    border-color: var(--color-primary);
    background: var(--color-primary-muted);

    .emotion-label {
      color: var(--color-primary);
      font-weight: 600;
    }
  }
}

.intensity-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  background: rgba(139, 115, 85, 0.06);
  border-radius: var(--radius-md);
  margin-bottom: 20px;

  .intensity-label {
    font-size: 13px;
    color: var(--color-text-inverse);
    white-space: nowrap;
  }

  .intensity-bar {
    flex: 1;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(139, 115, 85, 0.15);
    border-radius: 3px;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      background: var(--color-primary);
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 8px var(--color-primary-glow);
    }
  }

  .intensity-val {
    font-size: 13px;
    color: var(--color-primary);
    min-width: 40px;
    text-align: right;
    font-weight: 600;
  }
}

.story-row {
  margin-bottom: 20px;
}

.story-input {
  width: 100%;
  min-height: 80px;
  padding: 14px;
  background: rgba(139, 115, 85, 0.06);
  border: 1px dashed rgba(139, 115, 85, 0.25);
  border-radius: var(--radius-md);
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-inverse);
  resize: none;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  &::placeholder {
    color: var(--color-text-muted);
  }
}

.destination-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.dest-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 20px;
  background: rgba(139, 115, 85, 0.06);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color var(--dur-fast) ease,
              background var(--dur-fast) ease;

  .dest-icon {
    font-size: 24px;
  }

  .dest-label {
    font-size: 12px;
    color: var(--color-text-inverse);
  }

  &:hover {
    background: var(--color-primary-muted);
    border-color: var(--border-color);
  }

  &.active {
    background: var(--color-primary-muted);
    border-color: var(--color-primary);

    .dest-label {
      color: var(--color-primary);
      font-weight: 600;
    }
  }
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: rgba(139, 115, 85, 0.15);
  color: var(--color-text-secondary);
  border: none;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--dur-fast) ease,
              color var(--dur-fast) ease,
              transform var(--dur-fast) ease;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &.ready {
    background: var(--color-primary);
    color: var(--bg-deep);

    &:hover {
      background: var(--color-primary-soft);
      transform: translateY(-1px);
    }
  }
}

.incinerator-section {
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.incinerator {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.4s ease;
  
  &:hover {
    transform: translateY(-4px);
    
    .furnace-opening {
      box-shadow: 0 0 30px rgba(255, 120, 50, 0.3);
    }
  }
}

.furnace {
  position: relative;
}

.furnace-opening {
  width: 120px;
  height: 60px;
  background: linear-gradient(180deg, #1a1a1a 0%, #2d1f1f 100%);
  border-radius: 60px 60px 0 0;
  border: 2px solid #3d2a2a;
  border-bottom: none;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.4s ease;
}

.fire-glow {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 40px;
  background: radial-gradient(ellipse at center bottom, rgba(255, 150, 50, 0.6) 0%, transparent 70%);
  animation: fireGlow 0.5s ease-in-out infinite alternate;
}

@keyframes fireGlow {
  0% { opacity: 0.6; transform: translateX(-50%) scaleY(0.9); }
  100% { opacity: 1; transform: translateX(-50%) scaleY(1.1); }
}

.fire-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.furnace-body {
  width: 140px;
  height: 40px;
  background: linear-gradient(180deg, #3d2a2a 0%, #2d1f1f 100%);
  border-radius: 0 0 12px 12px;
  border: 2px solid #4a3535;
  border-top: none;
}

.incinerator-label {
  margin-top: 12px;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-primary);
}

.incinerator-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.feedback-text {
  font-size: 16px;
  color: var(--color-primary-soft);
  text-align: center;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.incinerator-dialog {
  :deep(.el-dialog) {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
  }
  
  :deep(.el-dialog__header) {
    display: none;
  }
  
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.burn-ceremony {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.burn-canvas {
  width: 560px;
  height: 400px;
}

.burn-feedback {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  color: var(--color-primary-soft);
  text-align: center;
  animation: fadeIn 0.8s ease;
}

@media (max-width: 1200px) {
  .page-container {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 90px 24px 24px;
  }
  
  .left-section, .right-section {
    flex-direction: row;
    justify-content: center;
    padding-top: 0;
    
    .area-card {
      flex: 1;
      max-width: 200px;
    }
  }
}

@media (max-width: 640px) {
  .writing-desk {
    padding: 32px 24px 28px;
  }
  
  .emotion-chip {
    width: 38px;
    height: 38px;
    font-size: 18px;
  }
  
  .dest-btn {
    padding: 10px 14px;
    
    .dest-icon {
      font-size: 20px;
    }
  }
}
</style>
