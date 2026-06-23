<template>
  <div class="creator-page">
    <main class="creator-main">
      <div class="container">
        <div class="page-header">
          <router-link to="/creator" class="back-btn">← 返回</router-link>
          <h1 class="page-header__title">发表心声</h1>
          <p class="page-header__subtitle">写下你想倾诉的话</p>
        </div>

        <div class="echo-form">
          <div class="form-group">
            <label class="form-label">选择身份</label>
            <div class="identity-selector">
              <button
                :class="['identity-btn', { active: isAnonymous === true }]"
                @click="isAnonymous = true"
              >🎭 匿名发表</button>
              <button
                :class="['identity-btn', { active: isAnonymous === false }]"
                @click="isAnonymous = false"
              >👤 实名发表</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">心声内容</label>
            <RichTextEditor v-model="content" placeholder="写下你想倾诉的话..." />
          </div>

          <div class="form-group">
            <label class="form-label">选择情绪</label>
            <div class="emotion-selector">
              <button
                v-for="emotion in emotions"
                :key="emotion"
                :class="['emotion-btn', { active: selectedEmotion === emotion }]"
                @click="selectedEmotion = emotion"
              >{{ emotion }}</button>
            </div>
          </div>

          <div class="form-actions">
            <button
              class="submit-btn"
              :disabled="!canSubmit || submitting"
              @click="handleSubmit"
            >{{ submitting ? '发布中...' : '发布心声' }}</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore, useTreeholeStore } from '@/stores'
import RichTextEditor from '@/components/RichTextEditor.vue'

const router = useRouter()
const userStore = useUserStore()
const treeholeStore = useTreeholeStore()

const content = ref('')
const selectedEmotion = ref('')
const isAnonymous = ref(true)
const submitting = ref(false)
const emotions = ['开心', '平静', '焦虑', '愤怒', '难过', '感动', '迷茫']

const canSubmit = computed(() => {
  return content.value.trim().length > 0 && selectedEmotion.value
})

async function handleSubmit() {
  if (!canSubmit.value) return

  submitting.value = true
  const result = await treeholeStore.publishTreehole({
    content: content.value,
    emotion: selectedEmotion.value,
    isAnonymous: isAnonymous.value
  })
  submitting.value = false

  if (result.success) {
    ElMessage.success('发布成功，内容正在审核中')
    router.push('/creator')
  } else {
    ElMessage.error(result.message || '发布失败')
  }
}
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

.back-btn {
  display: inline-block;
  margin-bottom: 16px;
  color: var(--color-ash);
  font-size: 14px;
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: var(--color-amber-glow);
  }
}

.echo-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: var(--color-ash);
  margin-bottom: 12px;
}

.identity-selector {
  display: flex;
  gap: 12px;
}

.identity-btn {
  padding: 8px 16px;
  background: rgba(45, 36, 24, 0.8);
  border-radius: 4px;
  font-size: 14px;
  color: var(--color-ash);
  transition: all 0.3s ease;
  border: 1px solid rgba(212, 165, 116, 0.15);
  flex: 1;
  text-align: center;

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

.form-actions {
  text-align: center;
  margin-top: 32px;
}

.submit-btn {
  padding: 14px 48px;
  background: linear-gradient(135deg, var(--color-amber-glow) 0%, var(--color-warm-brown) 100%);
  color: var(--color-night-blue);
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--color-candle) 0%, var(--color-amber-glow) 100%);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
