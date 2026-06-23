<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-left">
        <router-link to="/" class="navbar-brand">
          <span class="brand-icon">📮</span>
          <span class="brand-text">心事邮局</span>
        </router-link>
      </div>
      
      <div class="navbar-center">
        <div class="nav-items">
          <router-link 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path" 
            class="nav-item"
            :class="{ active: isActive(item.path) }"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.name }}</span>
          </router-link>
          <div 
            class="nav-indicator" 
            :style="indicatorStyle"
          ></div>
        </div>
      </div>
      
      <div class="navbar-right">
        <router-link to="/creator" class="nav-action" v-if="userStore.isLoggedIn">
          <span class="action-icon">✍️</span>
          <span class="action-text">创作者中心</span>
        </router-link>
        <router-link to="/profile" class="nav-action">
          <span class="action-icon">👤</span>
          <span class="action-text">个人中心</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores'

const userStore = useUserStore()
const route = useRoute()

const indicatorPosition = ref(0)
const indicatorWidth = ref(100)

const navItems = [
  { name: '门厅', path: '/', icon: '🏠' },
  { name: '心事寄存处', path: '/deposit', icon: '📬' },
  { name: '回声广场', path: '/plaza', icon: '🌊' },
  { name: '夜灯书房', path: '/study', icon: '📖' },
  { name: '成长归档室', path: '/archive', icon: '🗄️' }
]

function isActive(path) {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const indicatorStyle = computed(() => ({
  transform: `translateX(${indicatorPosition.value}px)`,
  width: `${indicatorWidth.value}px`,
  transition: 'transform 0.4s ease, width 0.4s ease'
}))

function updateIndicator() {
  nextTick(() => {
    const activeItem = document.querySelector('.nav-item.active')
    if (activeItem) {
      const navItemsContainer = document.querySelector('.nav-items')
      const containerRect = navItemsContainer.getBoundingClientRect()
      const itemRect = activeItem.getBoundingClientRect()
      
      indicatorPosition.value = itemRect.left - containerRect.left
      indicatorWidth.value = itemRect.width
    }
  })
}

onMounted(() => {
  setTimeout(updateIndicator, 100)
})

watch(() => route.path, () => {
  setTimeout(updateIndicator, 50)
})
</script>

<style lang="scss" scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  background: rgba(22, 30, 44, 0.92);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-light);
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 24px;
}

.navbar-left {
  flex: 1;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  
  .brand-icon {
    font-size: 26px;
  }
  
  .brand-text {
    font-family: var(--font-brand);
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--color-primary);
  }
}

.navbar-center {
  flex: 2;
  display: flex;
  justify-content: center;
}

.nav-items {
  position: relative;
  display: flex;
  gap: 2px;
  padding: 5px 6px;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
}

.nav-item {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  text-decoration: none;
  color: var(--color-text-secondary);
  border-radius: var(--radius-full);
  transition: color var(--dur-fast) ease;
  font-size: 13px;
  font-weight: 500;

  &:hover {
    color: var(--color-text);
  }

  &.active {
    color: var(--color-primary);
  }

  .nav-icon {
    font-size: 16px;
  }

  .nav-text {
    white-space: nowrap;
  }
}

.nav-indicator {
  position: absolute;
  top: 5px;
  height: calc(100% - 10px);
  background: var(--color-primary-muted);
  border-radius: var(--radius-full);
  pointer-events: none;
  z-index: 0;
}

.navbar-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.nav-action {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  text-decoration: none;
  color: var(--color-text-secondary);
  border-radius: var(--radius-full);
  transition: background var(--dur-fast) ease,
              color var(--dur-fast) ease;
  font-size: 13px;
  font-weight: 500;

  &:hover {
    background: var(--color-primary-muted);
    color: var(--color-primary);
  }

  .action-icon {
    font-size: 16px;
  }

  .action-text {
    white-space: nowrap;
  }
}
</style>
