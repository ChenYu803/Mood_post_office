<template>
  <div class="treehole-page">
    <main class="treehole-main">
      <div class="container">
        <div class="page-header">
          <h1 class="page-header__title">回声广场</h1>
          <p class="page-header__subtitle">倾听陌生人的心事</p>
          <button class="publish-header-btn" @click="$router.push('/creator/echo')" v-if="userStore.isLoggedIn">
            <span class="publish-icon">✏️</span>
            <span>发表心声</span>
          </button>
        </div>

        <div class="treehole-filters">
          <div class="filter-tabs">
            <button 
              :class="['filter-tab', { active: activeEmotion === '全部' }]"
              @click="activeEmotion = '全部'; fetchTreeholes()"
            >全部</button>
            <button 
              v-for="emotion in emotions"
              :key="emotion"
              :class="['filter-tab', { active: activeEmotion === emotion }]"
              @click="activeEmotion = emotion; fetchTreeholes()"
            >{{ emotion }}</button>
          </div>
          <div class="search-and-sort">
            <div class="search-box">
              <input 
                v-model="searchKeyword" 
                type="text" 
                placeholder="搜索心声..."
                @keyup.enter="fetchTreeholes()"
              />
              <button @click="fetchTreeholes()">搜索</button>
            </div>
            <div class="filter-sort">
              <button 
                :class="['sort-btn', { active: sortBy === '最新' }]"
                @click="sortBy = '最新'; fetchTreeholes()"
              >最新</button>
              <button 
                :class="['sort-btn', { active: sortBy === '热门' }]"
                @click="sortBy = '热门'; fetchTreeholes()"
              >热门</button>
            </div>
          </div>
        </div>

        <div class="treeholes-grid" v-loading="loading">
          <div 
            v-for="hole in treeholes" 
            :key="hole._id"
            class="treehole-card"
            :class="`treehole-card--${hole.emotion}`"
          >
            <router-link :to="`/plaza/${hole._id}`" class="card-link">
              <div class="treehole-card__header">
                <span class="treehole-card__avatar">{{ hole.anonymousCode.slice(0, 2) }}</span>
                <span class="treehole-card__code">{{ hole.anonymousCode }}</span>
                <span :class="['emotion-tag', `emotion-tag--${hole.emotion}`]">{{ hole.emotion }}</span>
              </div>
              <p class="treehole-card__content">{{ truncateContent(hole.content) }}</p>
            </router-link>
            <div class="treehole-card__footer">
              <span class="treehole-card__time">{{ formatTime(hole.createdAt) }}</span>
              <div class="card-actions">
                <button 
                  class="action-btn" 
                  :class="{ liked: hole.liked }"
                  @click="handleLike(hole)"
                  v-if="userStore.isLoggedIn"
                >
                  <span>{{ hole.liked ? '❤️' : '🤍' }}</span>
                  <span>{{ hole.likeCount || 0 }}</span>
                </button>
                <button 
                  class="action-btn" 
                  :class="{ bookmarked: hole.bookmarked }"
                  @click="handleBookmark(hole)"
                  v-if="userStore.isLoggedIn"
                >
                  <span>{{ hole.bookmarked ? '📌' : '📑' }}</span>
                </button>
                <span class="treehole-card__comments">💬 {{ hole.commentCount }}</span>
              </div>
            </div>
          </div>
          
          <div class="empty-state" v-if="!loading && treeholes.length === 0">
            <div class="empty-state__icon">🌙</div>
            <p class="empty-state__text">广场上还没有声音，成为第一个倾诉的人吧</p>
          </div>
        </div>

        <div class="load-more" v-if="treeholes.length < total">
          <button class="btn btn--outline" @click="loadMore">加载更多</button>
        </div>
      </div>
    </main>


    <el-dialog v-model="showCrisisDialog" title="我们在这里" width="450px" :close-on-click-modal="false">
      <div class="crisis-content">
        <div class="crisis-icon">💚</div>
        <p class="crisis-text">
          我们注意到你可能需要帮助。 <br>
          请相信，你并不孤单。
        </p>
        <div class="crisis-resources">
          <h4>心理援助资源</h4>
          <p><strong>全国心理援助热线：</strong>400-161-9995</p>
          <p><strong>北京心理危机研究与干预中心：</strong>010-82951332</p>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showCrisisDialog = false">我知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore, useTreeholeStore, api } from '@/stores'

const userStore = useUserStore()
const treeholeStore = useTreeholeStore()

const treeholes = ref([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const activeEmotion = ref('全部')
const sortBy = ref('最新')
const searchKeyword = ref('')
const emotions = ['开心', '平静', '焦虑', '愤怒', '难过', '感动', '迷茫']

const showCrisisDialog = ref(false)

async function fetchTreeholes(append = false) {
  loading.value = true
  try {
    await treeholeStore.fetchTreeholes({
      emotion: activeEmotion.value,
      sort: sortBy.value,
      keyword: searchKeyword.value,
      page: append ? page.value : 1,
      limit: 12
    })
    if (append) {
      treeholes.value = [...treeholes.value, ...treeholeStore.treeholes]
    } else {
      treeholes.value = treeholeStore.treeholes
      page.value = 1
    }
    total.value = treeholeStore.total
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  page.value++
  await fetchTreeholes(true)
}


function truncateContent(content) {
  if (content.length > 100) {
    return content.slice(0, 100) + '...'
  }
  return content
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

async function handleLike(hole) {
  try {
    const res = await api.post(`/treehole/${hole._id}/like`)
    if (res.data.code === 200) {
      hole.liked = res.data.data.liked
      hole.likeCount = res.data.data.likeCount
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

async function handleBookmark(hole) {
  try {
    const res = await api.post(`/treehole/${hole._id}/bookmark`)
    if (res.data.code === 200) {
      hole.bookmarked = res.data.data.bookmarked
      ElMessage.success(hole.bookmarked ? '收藏成功' : '取消收藏成功')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  fetchTreeholes()
})
</script>

<style lang="scss" scoped>
.treehole-page {
  min-height: 100vh;
  background: 
    radial-gradient(ellipse at 50% 0%, rgba(74, 85, 104, 0.3) 0%, transparent 50%),
    linear-gradient(180deg, #1A202C 0%, #2D3748 50%, #1A202C 100%);
  padding-bottom: 80px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 30%, rgba(212, 165, 116, 0.02) 0%, transparent 25%),
      radial-gradient(circle at 80% 60%, rgba(212, 165, 116, 0.02) 0%, transparent 25%),
      radial-gradient(circle at 40% 80%, rgba(212, 165, 116, 0.015) 0%, transparent 20%);
    pointer-events: none;
  }
}

.treehole-main {
  padding-top: 88px;
  position: relative;
  z-index: 1;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  
  &__title {
    font-size: 2.2rem;
    font-weight: 300;
    color: var(--color-moonlight);
    margin-bottom: 8px;
    letter-spacing: 0.15em;
    text-shadow: 0 0 30px rgba(212, 165, 116, 0.2);
  }
  
  &__subtitle {
    color: var(--color-ash);
    font-size: 1rem;
    letter-spacing: 0.05em;
    margin-bottom: 20px;
  }
}

.publish-header-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: linear-gradient(135deg, var(--color-amber-glow) 0%, var(--color-warm-brown) 100%);
  color: var(--color-night-blue);
  border-radius: 50px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  box-shadow: 
    0 4px 20px rgba(212, 165, 116, 0.3),
    0 0 30px rgba(212, 165, 116, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 6px 25px rgba(212, 165, 116, 0.4),
      0 0 40px rgba(212, 165, 116, 0.2);
  }
  
  .publish-icon {
    font-size: 18px;
  }
}

.treehole-filters {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 8px 16px;
  background: rgba(45, 55, 72, 0.6);
  border-radius: 4px;
  font-size: 14px;
  color: var(--color-ash);
  transition: all 0.3s ease;
  border: 1px solid rgba(212, 165, 116, 0.1);
  
  &.active, &:hover {
    background: rgba(212, 165, 116, 0.15);
    color: var(--color-amber-glow);
    border-color: rgba(212, 165, 116, 0.3);
  }
}

.search-and-sort {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  gap: 8px;
  
  input {
    padding: 8px 12px;
    border: 1px solid rgba(212, 165, 116, 0.2);
    border-radius: 4px;
    font-size: 14px;
    width: 180px;
    background: rgba(45, 55, 72, 0.6);
    color: var(--color-moonlight);
    
    &::placeholder {
      color: var(--color-ash);
    }
  }
  
  button {
    padding: 8px 16px;
    background: rgba(212, 165, 116, 0.2);
    color: var(--color-amber-glow);
    border-radius: 4px;
    font-size: 14px;
    border: 1px solid rgba(212, 165, 116, 0.3);
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(212, 165, 116, 0.3);
    }
  }
}

.filter-sort {
  display: flex;
  gap: 4px;
  background: rgba(45, 55, 72, 0.6);
  padding: 4px;
  border-radius: 4px;
  border: 1px solid rgba(212, 165, 116, 0.1);
}

.sort-btn {
  padding: 6px 12px;
  border-radius: 3px;
  font-size: 13px;
  color: var(--color-ash);
  transition: all 0.3s ease;
  
  &.active {
    background: rgba(212, 165, 116, 0.15);
    color: var(--color-amber-glow);
  }
}

.treeholes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.treehole-card {
  background: linear-gradient(145deg, rgba(61, 74, 92, 0.8) 0%, rgba(45, 55, 72, 0.9) 100%);
  border-radius: 4px;
  padding: 20px;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(212, 165, 116, 0.05);
  transition: all 0.4s ease;
  border: 1px solid rgba(212, 165, 116, 0.1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: 20px;
    right: 20px;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(212, 165, 116, 0.3), transparent);
  }
  
  &:hover {
    transform: translateY(-4px) rotate(0.5deg);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.4),
      0 0 30px rgba(212, 165, 116, 0.1);
    border-color: rgba(212, 165, 116, 0.2);
  }
  
  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  &__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #4A5568 0%, #2D3748 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-amber-glow);
    font-size: 12px;
    font-weight: 400;
    border: 1px solid rgba(212, 165, 116, 0.2);
  }
  
  &__code {
    font-size: 13px;
    color: var(--color-ash);
    flex: 1;
  }
  
  &__content {
    font-size: 14px;
    line-height: 1.7;
    color: var(--color-moonlight);
    margin-bottom: 16px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
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
  
  &__comments {
    font-size: 12px;
    color: var(--color-ash);
  }
}

.card-link {
  text-decoration: none;
  color: inherit;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: transparent;
  border: none;
  font-size: 12px;
  color: var(--color-ash);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 3px;
  
  &:hover {
    background: rgba(212, 165, 116, 0.1);
    color: var(--color-amber-glow);
  }
  
  &.liked {
    color: #E57373;
  }
  
  &.bookmarked {
    color: var(--color-amber-glow);
  }
}

.load-more {
  text-align: center;
  margin-top: 40px;
  
  .btn--outline {
    padding: 12px 32px;
    background: transparent;
    color: var(--color-amber-glow);
    border: 1px solid rgba(212, 165, 116, 0.3);
    border-radius: 4px;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(212, 165, 116, 0.1);
      border-color: var(--color-amber-glow);
    }
  }
}


.crisis-content {
  text-align: center;
  padding: 20px 0;
  
  .crisis-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .crisis-text {
    font-size: 16px;
    line-height: 1.8;
    color: var(--color-moonlight);
    margin-bottom: 24px;
  }
  
  .crisis-resources {
    background: rgba(45, 55, 72, 0.6);
    border-radius: 4px;
    padding: 16px;
    text-align: left;
    border: 1px solid rgba(212, 165, 116, 0.1);
    
    h4 {
      font-size: 14px;
      margin-bottom: 12px;
      color: var(--color-moonlight);
    }
    
    p {
      font-size: 13px;
      color: var(--color-ash);
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  
  .empty-state__icon {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.5;
  }
  
  .empty-state__text {
    color: var(--color-ash);
    font-size: 16px;
  }
}

.emotion-tag {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 3px;
  font-weight: 400;
  
  &--开心 {
    background: rgba(255, 217, 61, 0.15);
    color: #FFD93D;
  }
  
  &--平静 {
    background: rgba(107, 203, 119, 0.15);
    color: #6BCB77;
  }
  
  &--焦虑 {
    background: rgba(255, 107, 107, 0.15);
    color: #FF6B6B;
  }
  
  &--悲伤 {
    background: rgba(77, 150, 255, 0.15);
    color: #4D96FF;
  }
  
  &--愤怒 {
    background: rgba(255, 140, 66, 0.15);
    color: #FF8C42;
  }
  
  &--迷茫 {
    background: rgba(155, 89, 182, 0.15);
    color: #9B59B6;
  }
  
  &--感动 {
    background: rgba(255, 179, 186, 0.15);
    color: #FFB3BA;
  }
  
  &--疲惫 {
    background: rgba(149, 165, 166, 0.15);
    color: #95A5A6;
  }
  
  &--难过 {
    background: rgba(100, 149, 237, 0.15);
    color: #6495ED;
  }
}

@media (max-width: 1024px) {
  .treeholes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .treeholes-grid {
    grid-template-columns: 1fr;
  }
  
  .publish-header-btn {
    padding: 12px 24px;
    font-size: 14px;
  }
}
</style>
