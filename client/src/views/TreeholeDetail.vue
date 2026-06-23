<template>
  <div class="treehole-detail-page">
    <main class="detail-main">
      <div class="container">
        <div class="detail-content" v-loading="loading">
          <div class="treehole-card" v-if="treehole">
            <div class="treehole-card__header">
              <span class="treehole-card__avatar">{{ treehole.anonymousCode.slice(0, 2) }}</span>
              <div class="treehole-card__info">
                <span class="treehole-card__code">{{ treehole.anonymousCode }}</span>
                <span class="treehole-card__time">{{ formatTime(treehole.createdAt) }}</span>
              </div>
              <span :class="['emotion-tag', `emotion-tag--${treehole.emotion}`]">{{ treehole.emotion }}</span>
            </div>
            <div class="treehole-card__body">
              <p>{{ treehole.content }}</p>
            </div>
          </div>

          <div class="comments-section">
            <h3 class="comments-title">回应 ({{ comments.length }})</h3>
            
            <div class="comment-form" v-if="userStore.isLoggedIn">
              <el-input
                v-model="commentContent"
                type="textarea"
                :rows="3"
                placeholder="写下你的回应..."
                :maxlength="300"
              />
              <div class="comment-form__actions">
                <span class="comment-hint">友善的回应是最好的安慰</span>
                <el-button type="primary" @click="handleComment" :disabled="!commentContent.trim()">
                  发送
                </el-button>
              </div>
            </div>
            <div class="comment-login-hint" v-else>
              <router-link to="/auth" class="btn btn--outline btn--sm">登录</router-link>
              <span>后参与回应</span>
            </div>

            <div class="comments-list">
              <div v-for="comment in comments" :key="comment._id" class="comment-item">
                <div class="comment-avatar">{{ comment.userId?.nickname?.[0] || '匿' }}</div>
                <div class="comment-body">
                  <div class="comment-header">
                    <span class="comment-code">{{ comment.userId?.nickname || '匿名用户' }}</span>
                    <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                  </div>
                  <p class="comment-content">{{ comment.content }}</p>
                </div>
              </div>
              
              <div class="empty-state" v-if="comments.length === 0">
                <p class="empty-state__text">还没有回应，成为第一个安慰TA的人吧</p>
              </div>
            </div>
          </div>

          <div class="report-action" v-if="userStore.isLoggedIn && treehole">
            <button class="report-btn" @click="showReportModal = true">
              <span class="report-icon">🚫</span>
              <span>举报此内容</span>
            </button>
          </div>
        </div>

        <div class="back-btn">
          <router-link to="/plaza" class="btn btn--ghost">
            ← 返回回声广场
          </router-link>
        </div>
      </div>
    </main>
  </div>

  <ReportModal
    v-model="showReportModal"
    :target-id="treehole?._id || ''"
    target-type="treehole"
    @submitted="onReportSubmitted"
  />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore, useTreeholeStore, api } from '@/stores'
import ReportModal from '@/components/ReportModal.vue'

const route = useRoute()
const userStore = useUserStore()
const treeholeStore = useTreeholeStore()

const treehole = ref(null)
const comments = ref([])
const loading = ref(false)
const commentContent = ref('')
const showReportModal = ref(false)

async function fetchDetail() {
  loading.value = true
  try {
    await treeholeStore.fetchTreeholeDetail(route.params.id)
    treehole.value = treeholeStore.currentTreehole
    comments.value = treeholeStore.comments
    
    if (userStore.isLoggedIn) {
      api.post('/users/reading-history', {
        id: treehole.value._id,
        type: 'treehole',
        title: treehole.value.content?.slice(0, 50),
        emotion: treehole.value.emotion
      }).catch(err => {
        console.error('Failed to record reading history:', err)
      })
    }
  } finally {
    loading.value = false
  }
}

async function handleComment() {
  if (!commentContent.value.trim()) return
  
  const result = await treeholeStore.postComment(route.params.id, commentContent.value)
  if (result.success) {
    ElMessage.success('评论已提交，审核通过后将显示')
    commentContent.value = ''
  } else {
    ElMessage.error(result.message || '评论失败')
  }
}

function formatTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}

function onReportSubmitted() {
  showReportModal.value = false
}

onMounted(() => {
  fetchDetail()
})

watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    fetchDetail()
  }
})
</script>

<style lang="scss" scoped>
.treehole-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--color-night-blue) 0%, #1a202c 100%);
}

.detail-main {
  padding-top: 88px;
  padding-bottom: 60px;
}

.detail-content {
  max-width: 680px;
  margin: 0 auto;
}

.treehole-card {
  background: var(--color-cream);
  background-image: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 27px,
      rgba(197, 193, 185, 0.15) 27px,
      rgba(197, 193, 185, 0.15) 28px
    );
  border-radius: var(--radius-xl);
  padding: 48px;
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.3),
    0 0 60px rgba(212, 165, 116, 0.08);
  margin-bottom: 32px;
  border: 1px solid rgba(212, 165, 116, 0.2);
  
  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
  }
  
  &__avatar {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-round);
    background: linear-gradient(135deg, var(--color-amber-glow) 0%, var(--color-candle) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-night-blue);
    font-size: 16px;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.3);
  }
  
  &__info {
    flex: 1;
  }
  
  &__code {
    display: block;
    font-size: 15px;
    font-weight: 500;
    color: var(--color-night-blue);
  }
  
  &__time {
    font-size: 13px;
    color: var(--color-ash);
  }
  
  &__body {
    p {
      font-size: 16px;
      line-height: 2;
      color: var(--color-night-blue);
    }
  }
}

.comments-section {
  background: rgba(45, 55, 72, 0.6);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(212, 165, 116, 0.1);
  border: 1px solid rgba(212, 165, 116, 0.15);
}

.comments-title {
  font-size: 1.2rem;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(212, 165, 116, 0.2);
  color: var(--color-candle);
}

.comment-form {
  margin-bottom: 32px;
  
  &__actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
  }
  
  .comment-hint {
    font-size: 13px;
    color: var(--color-moonlight);
  }
}

.comment-login-hint {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: rgba(45, 55, 72, 0.4);
  border-radius: var(--radius-md);
  margin-bottom: 24px;
  border: 1px solid rgba(212, 165, 116, 0.1);
  
  span {
    color: var(--color-moonlight);
    font-size: 14px;
  }
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-round);
  background: linear-gradient(135deg, var(--color-amber-glow) 0%, var(--color-warm-brown) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-cream);
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(212, 165, 116, 0.25);
}

.comment-body {
  flex: 1;
  background: rgba(250, 246, 240, 0.95);
  border-radius: var(--radius-md);
  padding: 12px 16px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.comment-code {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-night-blue);
}

.comment-time {
  font-size: 12px;
  color: var(--color-ash);
}

.comment-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-night-blue);
}

.back-btn {
  max-width: 680px;
  margin: 32px auto 0;
  
  .btn--ghost {
    color: var(--color-candle);
    border-color: rgba(212, 165, 116, 0.4);
    
    &:hover {
      background: rgba(212, 165, 116, 0.15);
      border-color: var(--color-amber-glow);
      color: var(--color-amber-glow);
    }
  }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  
  &__text {
    color: var(--color-moonlight);
    font-size: 14px;
  }
}

.report-action {
  margin-top: 20px;
  text-align: right;
}

.report-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid rgba(229, 115, 115, 0.3);
  border-radius: var(--radius-md);
  color: rgba(229, 115, 115, 0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(229, 115, 115, 0.1);
    border-color: rgba(229, 115, 115, 0.5);
    color: #E57373;
  }

  .report-icon {
    font-size: 14px;
  }
}
</style>
