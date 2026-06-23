<template>
  <div class="creator-page">
    <main class="creator-main">
      <div class="container">
        <div class="page-header">
          <router-link to="/creator" class="back-btn">← 返回</router-link>
          <h1 class="page-header__title">投稿文章</h1>
          <p class="page-header__subtitle">分享你的思考与见解</p>
        </div>

        <div class="article-form">
          <div class="form-group">
            <label class="form-label">标题</label>
            <el-input
              v-model="submitForm.title"
              placeholder="请输入文章标题"
              :maxlength="50"
            />
          </div>

          <div class="form-group">
            <label class="form-label">分类</label>
            <el-select v-model="submitForm.category" placeholder="请选择分类" style="width: 100%">
              <el-option
                v-for="cat in categories"
                :key="cat"
                :label="cat"
                :value="cat"
              />
            </el-select>
          </div>

          <div class="form-group">
            <label class="form-label">情绪标签</label>
            <div class="emotion-selector">
              <button
                v-for="emotion in emotions"
                :key="emotion"
                :class="['emotion-btn', { active: submitForm.emotion === emotion }]"
                @click="submitForm.emotion = emotion"
              >{{ emotionEmojis[emotion] }} {{ emotion }}</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">摘要</label>
            <el-input
              v-model="submitForm.summary"
              type="textarea"
              :rows="2"
              placeholder="文章摘要（100字以内）"
              :maxlength="100"
              show-word-limit
            />
          </div>

          <div class="form-group">
            <label class="form-label">正文</label>
            <RichTextEditor v-model="submitForm.content" />
          </div>

          <div class="form-actions">
            <button
              class="submit-btn"
              :disabled="!canSubmit || submitting"
              @click="handleSubmit"
            >{{ submitting ? '提交中...' : '提交审核' }}</button>
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
import { useUserStore, api } from '@/stores'
import RichTextEditor from '@/components/RichTextEditor.vue'

const router = useRouter()
const userStore = useUserStore()

const submitting = ref(false)
const categories = ['情绪管理', '人际关系', '自我成长', '职场心理', '亲子关系']
const emotions = ['开心', '平静', '焦虑', '悲伤', '愤怒', '迷茫', '感动', '疲惫']
const emotionEmojis = {
  '开心': '😊', '平静': '😌', '焦虑': '😰', '悲伤': '😢',
  '愤怒': '😤', '迷茫': '😕', '感动': '🥹', '疲惫': '😴'
}

const submitForm = ref({
  title: '',
  category: '',
  emotion: '平静',
  summary: '',
  content: ''
})

const canSubmit = computed(() => {
  return submitForm.value.title.trim() &&
    submitForm.value.category &&
    submitForm.value.content.trim()
})

async function handleSubmit() {
  if (!canSubmit.value) return

  submitting.value = true
  try {
    const res = await api.post('/articles/submit', submitForm.value)
    if (res.data.code === 200) {
      ElMessage.success('投稿成功，等待审核')
      router.push('/creator')
    }
  } catch {
    ElMessage.error('投稿失败')
  } finally {
    submitting.value = false
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

.article-form {
  max-width: 700px;
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

.emotion-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.emotion-btn {
  padding: 8px 12px;
  background: rgba(45, 36, 24, 0.8);
  border-radius: 4px;
  font-size: 14px;
  color: var(--color-ash);
  border: 1px solid rgba(212, 165, 116, 0.15);
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
