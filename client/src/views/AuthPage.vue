<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-card__header">
        <router-link to="/" class="auth-card__logo">心事邮局</router-link>
        <p class="auth-card__tagline">让情绪找到归处</p>
      </div>
      
      <div class="auth-card__tabs">
        <button 
          :class="['auth-tab', { active: mode === 'login' }]" 
          @click="mode = 'login'"
        >
          登录
        </button>
        <button 
          :class="['auth-tab', { active: mode === 'register' }]" 
          @click="mode = 'register'"
        >
          注册
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <el-input 
            v-model="form.username" 
            placeholder="3-20个字符"
            size="large"
          />
        </div>
        
        <div class="form-group" v-if="mode === 'register'">
          <label class="form-label">邮箱</label>
          <el-input 
            v-model="form.email" 
            type="email"
            placeholder="用于找回密码"
            size="large"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">密码</label>
          <el-input 
            v-model="form.password" 
            type="password"
            placeholder="至少6位"
            show-password
            size="large"
          />
        </div>

        <div class="form-error" v-if="error">
          {{ error }}
        </div>

        <button type="submit" class="btn btn--primary btn--lg" style="width: 100%;" :disabled="loading">
          {{ loading ? '处理中...' : (mode === 'login' ? '登录' : '注册') }}
        </button>
      </form>

      <div class="auth-card__footer">
        <router-link to="/">返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const mode = ref('login')
const loading = ref(false)
const error = ref('')
const form = reactive({
  username: '',
  password: '',
  email: ''
})

async function handleSubmit() {
  error.value = ''
  loading.value = true
  
  try {
    let result
    if (mode.value === 'login') {
      result = await userStore.login(form.username, form.password)
    } else {
      if (!form.email) {
        error.value = '请输入邮箱'
        loading.value = false
        return
      }
      result = await userStore.register(form.username, form.password, form.email)
    }
    
    if (result.success) {
      ElMessage.success(mode.value === 'login' ? '登录成功' : '注册成功')
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } else {
      error.value = result.message
    }
  } catch (e) {
    error.value = '请求失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 48px 40px;
  box-shadow: var(--shadow-card);
  
  &__header {
    text-align: center;
    margin-bottom: 40px;
  }
  
  &__logo {
    font-family: var(--font-serif);
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--color-primary);
    display: block;
    margin-bottom: 8px;
  }
  
  &__tagline {
    color: var(--color-text-muted);
    font-size: 14px;
  }
  
  &__tabs {
    display: flex;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    padding: 4px;
    margin-bottom: 32px;
  }
  
  &__footer {
    text-align: center;
    margin-top: 24px;
    
    a {
      color: var(--color-text-muted);
      font-size: 14px;
      
      &:hover {
        color: var(--color-primary);
      }
    }
  }
}

.auth-tab {
  flex: 1;
  padding: 10px;
  background: transparent;
  border-radius: var(--radius-sm);
  font-size: 15px;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  
  &.active {
    background: var(--bg-card);
    color: var(--color-text);
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
}

.auth-form {
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-label {
    display: block;
    font-size: 14px;
    color: var(--color-text-secondary);
    margin-bottom: 8px;
  }
  
  .form-error {
    background: rgba(229, 57, 53, 0.1);
    color: #C62828;
    padding: 12px 16px;
    border-radius: var(--radius-md);
    font-size: 14px;
    margin-bottom: 20px;
  }
}
</style>