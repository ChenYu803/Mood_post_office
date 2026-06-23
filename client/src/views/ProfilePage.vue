<template>
  <div class="profile-page">
    <main class="profile-main">
      <div class="container">
        <div class="profile-layout">
          <aside class="profile-sidebar">
            <div class="user-card">
              <div class="user-card__avatar">{{ userStore.user?.nickname?.[0] }}</div>
              <h2 class="user-card__name">{{ userStore.user?.nickname }}</h2>
              <p class="user-card__signature">{{ userStore.user?.signature || '暂无签名' }}</p>
            </div>
            
            <nav class="profile-nav">
              <router-link to="/archive" class="profile-nav__item">
                <span class="nav-icon">🗄️</span>
                <span>成长归档室</span>
              </router-link>
              <router-link to="/creator" class="profile-nav__item">
                <span class="nav-icon">✍️</span>
                <span>创作者中心</span>
              </router-link>
              <router-link to="/admin" class="profile-nav__item profile-nav__item--admin" v-if="userStore.user?.role === 'admin'">
                <span class="nav-icon">🛡️</span>
                <span>审核中心</span>
              </router-link>
              <router-link to="/profile/settings" class="profile-nav__item">
                <span class="nav-icon">⚙️</span>
                <span>设置</span>
              </router-link>
              <button class="profile-nav__item profile-nav__item--danger" @click="handleLogout">
                <span class="nav-icon">🚪</span>
                <span>退出登录</span>
              </button>
            </nav>
          </aside>

          <section class="profile-content">
            <div class="welcome-card">
              <h1>欢迎回来，{{ userStore.user?.nickname }}</h1>
              <p>每一次情绪记录都是你成长的足迹</p>
            </div>

            <div class="stats-grid">
              <div class="stat-card">
                <span class="stat-icon">📊</span>
                <div class="stat-info">
                  <span class="stat-value">{{ stats.total }}</span>
                  <span class="stat-label">情绪记录</span>
                </div>
              </div>
              <div class="stat-card">
                <span class="stat-icon">🏠</span>
                <div class="stat-info">
                  <span class="stat-value">{{ stats.attic }}</span>
                  <span class="stat-label">思绪阁楼</span>
                </div>
              </div>
              <div class="stat-card">
                <span class="stat-icon">✨</span>
                <div class="stat-info">
                  <span class="stat-value">{{ stats.wishwall }}</span>
                  <span class="stat-label">心愿墙</span>
                </div>
              </div>
              <div class="stat-card">
                <span class="stat-icon">🌊</span>
                <div class="stat-info">
                  <span class="stat-value">{{ stats.treeholes }}</span>
                  <span class="stat-label">我的回声</span>
                </div>
              </div>
            </div>

            <div class="quick-actions">
              <h3>快捷操作</h3>
              <div class="actions-grid">
                <router-link to="/deposit/create" class="action-card">
                  <span class="action-icon">✏️</span>
                  <span class="action-text">写便签</span>
                </router-link>
                <router-link to="/archive" class="action-card">
                  <span class="action-icon">🗄️</span>
                  <span class="action-text">成长归档室</span>
                </router-link>
                <router-link to="/plaza" class="action-card">
                  <span class="action-icon">💬</span>
                  <span class="action-text">回声广场</span>
                </router-link>
                <router-link to="/study" class="action-card">
                  <span class="action-icon">📚</span>
                  <span class="action-text">阅读文章</span>
                </router-link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore, api } from '@/stores'

const router = useRouter()
const userStore = useUserStore()

const stats = ref({
  total: 0,
  attic: 0,
  wishwall: 0,
  treeholes: 0
})

async function fetchStats() {
  try {
    const [notesRes, treeholesRes] = await Promise.all([
      api.get('/notes', { params: { limit: 1 } }),
      api.get('/treehole/my/posts', { params: { limit: 1 } })
    ])
    
    stats.value.total = notesRes.data.data.total || 0
    stats.value.treeholes = treeholesRes.data.data.total || 0
    
    const statusRes = await api.get('/notes', { params: { status: '悬置', limit: 100 } })
    stats.value.attic = statusRes.data.data.notes?.length || 0
    
    const wishRes = await api.get('/notes', { params: { status: '纪念', limit: 100 } })
    stats.value.wishwall = wishRes.data.data.notes?.length || 0
  } catch (e) {
    console.error('Failed to fetch stats:', e)
  }
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/')
  } catch {}
}

onMounted(() => {
  fetchStats()
})
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: 
    radial-gradient(ellipse at 20% 30%, rgba(107, 68, 35, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(139, 115, 85, 0.08) 0%, transparent 50%),
    linear-gradient(180deg, #1A1410 0%, #2D2418 50%, #1A1410 100%);
}

.profile-main {
  padding-top: 88px;
  padding-bottom: 60px;
}

.profile-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
}

.profile-sidebar {
  position: sticky;
  top: 88px;
  height: fit-content;
}

.user-card {
  background: linear-gradient(145deg, rgba(62, 50, 38, 0.8) 0%, rgba(45, 36, 24, 0.9) 100%);
  border-radius: 8px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  margin-bottom: 20px;
  border: 1px solid rgba(212, 165, 116, 0.15);
  
  &__avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-amber-glow) 0%, var(--color-warm-brown) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-night-blue);
    font-size: 28px;
    font-weight: 600;
    margin: 0 auto 16px;
    box-shadow: 0 4px 15px rgba(212, 165, 116, 0.3);
  }
  
  &__name {
    font-size: 1.3rem;
    margin-bottom: 8px;
    color: var(--color-candle);
  }
  
  &__signature {
    font-size: 14px;
    color: var(--color-ash);
  }
}

.profile-nav {
  background: linear-gradient(145deg, rgba(62, 50, 38, 0.8) 0%, rgba(45, 36, 24, 0.9) 100%);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 165, 116, 0.15);
  
  &__item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 4px;
    font-size: 15px;
    color: var(--color-ash);
    transition: all 0.3s ease;
    width: 100%;
    text-align: left;
    background: transparent;
    border: none;
    cursor: pointer;
    
    &:hover {
      background: rgba(212, 165, 116, 0.1);
      color: var(--color-amber-glow);
    }
    
    &.router-link-active {
      background: rgba(212, 165, 116, 0.15);
      color: var(--color-amber-glow);
    }
    
    &--danger {
      margin-top: 8px;
      padding-top: 14px;
      border-top: 1px solid rgba(212, 165, 116, 0.1);
      
      &:hover {
        background: rgba(229, 57, 53, 0.1);
        color: #E57373;
      }
    }
  }
  
  .nav-icon {
    font-size: 20px;
  }
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.welcome-card {
  background: linear-gradient(135deg, rgba(212, 165, 116, 0.2) 0%, rgba(139, 115, 85, 0.15) 100%);
  border-radius: 8px;
  padding: 32px 40px;
  border: 1px solid rgba(212, 165, 116, 0.2);
  
  h1 {
    font-size: 1.6rem;
    margin-bottom: 8px;
    color: var(--color-candle);
  }
  
  p {
    color: var(--color-ash);
    font-size: 15px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: linear-gradient(145deg, rgba(62, 50, 38, 0.8) 0%, rgba(45, 36, 24, 0.9) 100%);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 165, 116, 0.1);
  
  .stat-icon {
    font-size: 32px;
  }
  
  .stat-info {
    display: flex;
    flex-direction: column;
  }
  
  .stat-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--color-candle);
    line-height: 1;
  }
  
  .stat-label {
    font-size: 13px;
    color: var(--color-ash);
    margin-top: 4px;
  }
}

.quick-actions {
  background: linear-gradient(145deg, rgba(62, 50, 38, 0.8) 0%, rgba(45, 36, 24, 0.9) 100%);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 165, 116, 0.15);
  
  h3 {
    font-size: 1.1rem;
    margin-bottom: 20px;
    color: var(--color-candle);
  }
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  background: rgba(45, 36, 24, 0.6);
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid rgba(212, 165, 116, 0.1);
  
  &:hover {
    background: rgba(212, 165, 116, 0.15);
    border-color: rgba(212, 165, 116, 0.3);
    
    .action-icon {
      transform: scale(1.1);
    }
  }
  
  .action-icon {
    font-size: 32px;
    margin-bottom: 8px;
    transition: transform 0.3s ease;
  }
  
  .action-text {
    font-size: 14px;
    color: var(--color-ash);
  }
}

@media (max-width: 1024px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }
  
  .profile-sidebar {
    position: static;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
