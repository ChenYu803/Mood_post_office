import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'

const routes = [
  {
    path: '/',
    name: 'Lobby',
    component: () => import('@/views/HomePage.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('@/views/AuthPage.vue'),
    meta: { title: '登录注册' }
  },
  {
    path: '/deposit',
    name: 'HeartPost',
    component: () => import('@/views/RecycleStation.vue'),
    meta: { requiresAuth: true, title: '心事邮局' }
  },
  {
    path: '/deposit/locker',
    name: 'Locker',
    component: () => import('@/views/LogsPage.vue'),
    meta: { requiresAuth: true, title: '心事信箱' }
  },
  {
    path: '/deposit/attic',
    name: 'Attic',
    component: () => import('@/views/AtticPage.vue'),
    meta: { requiresAuth: true, title: '时光阁楼' }
  },
  {
    path: '/deposit/meteor-mailbox',
    name: 'MeteorMailbox',
    component: () => import('@/views/MeteorMailboxPage.vue'),
    meta: { requiresAuth: true, title: '流星信箱' }
  },
  {
    path: '/deposit/voice-box',
    name: 'VoiceBox',
    component: () => import('@/views/VoiceBoxPage.vue'),
    meta: { requiresAuth: true, title: '心声盒子' }
  },
  {
    path: '/plaza',
    name: 'EchoSquare',
    component: () => import('@/views/TreeholePage.vue'),
    meta: { title: '回声广场' }
  },
  {
    path: '/plaza/:id',
    name: 'EchoDetail',
    component: () => import('@/views/TreeholeDetail.vue'),
    meta: { title: '回声详情' }
  },
  {
    path: '/study',
    name: 'NightStudy',
    component: () => import('@/views/ArticlesPage.vue'),
    meta: { title: '夜灯书房' }
  },
  {
    path: '/study/:id',
    name: 'NightStudyDetail',
    component: () => import('@/views/ArticleDetail.vue'),
    meta: { title: '文章详情' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfilePage.vue'),
    meta: { requiresAuth: true, title: '个人中心' }
  },
  {
    path: '/archive',
    name: 'Archive',
    component: () => import('@/views/MonumentPage.vue'),
    meta: { requiresAuth: true, title: '成长归档室' }
  },
  {
    path: '/profile/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsPage.vue'),
    meta: { requiresAuth: true, title: '设置' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: '审核中心' }
  },
  {
    path: '/creator/echo',
    name: 'CreatorEcho',
    component: () => import('@/views/CreatorEchoPage.vue'),
    meta: { requiresAuth: true, title: '发表心声' }
  },
  {
    path: '/creator/article',
    name: 'CreatorArticle',
    component: () => import('@/views/CreatorArticlePage.vue'),
    meta: { requiresAuth: true, title: '投稿文章' }
  },
  {
    path: '/creator',
    name: 'Creator',
    component: () => import('@/views/CreatorPage.vue'),
    meta: { requiresAuth: true, title: '创作者中心' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  const baseTitle = '心事邮局 | Whisper Post Office'
  if (to.meta.title) {
    document.title = `${to.meta.title} - ${baseTitle}`
  } else {
    document.title = baseTitle
  }
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Auth', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresAdmin && userStore.user?.role !== 'admin') {
    next({ name: 'Lobby' })
  } else {
    next()
  }
})

export default router
