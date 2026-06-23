<template>
  <div class="settings-page">
    <main class="settings-main">
      <div class="container">
        <div class="page-header">
          <h1 class="page-header__title">设置</h1>
        </div>

        <div class="settings-layout">
          <aside class="settings-nav">
            <button 
              :class="['settings-nav__item', { active: activeSection === 'profile' }]"
              @click="activeSection = 'profile'"
            >基本信息</button>
            <button 
              :class="['settings-nav__item', { active: activeSection === 'privacy' }]"
              @click="activeSection = 'privacy'"
            >隐私设置</button>
            <button 
              :class="['settings-nav__item', { active: activeSection === 'data' }]"
              @click="activeSection = 'data'"
            >数据管理</button>
          </aside>

          <section class="settings-content">
            <div class="settings-card" v-if="activeSection === 'profile'">
              <h3>基本信息</h3>
              <div class="form-group">
                <label class="form-label">昵称</label>
                <el-input v-model="form.nickname" size="large" />
              </div>
              <div class="form-group">
                <label class="form-label">个性签名</label>
                <el-input v-model="form.signature" type="textarea" :rows="2" />
              </div>
              <div class="form-group">
                <label class="form-label">邮箱</label>
                <el-input v-model="form.email" size="large" />
              </div>
              <el-button type="primary" @click="saveProfile" :loading="saving">保存</el-button>
            </div>

            <div class="settings-card" v-if="activeSection === 'privacy'">
              <h3>隐私设置</h3>
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-title">允许他人查看心愿墙</span>
                  <span class="setting-desc">关闭后他人无法看到你的心愿墙内容</span>
                </div>
                <el-switch v-model="form.privacySettings.allowViewWishwall" />
              </div>
              <el-button type="primary" @click="savePrivacy" :loading="saving">保存</el-button>
            </div>

            <div class="settings-card" v-if="activeSection === 'data'">
              <h3>数据管理</h3>
              <div class="data-actions">
                <div class="data-action">
                  <div class="data-action__info">
                    <span class="data-action__title">导出情绪日志</span>
                    <span class="data-action__desc">导出为 JSON 格式文件</span>
                  </div>
                  <el-button @click="exportData" :loading="exporting">导出</el-button>
                </div>
                <div class="data-action data-action--danger">
                  <div class="data-action__info">
                    <span class="data-action__title">删除账号</span>
                    <span class="data-action__desc">永久删除所有数据，此操作不可逆</span>
                  </div>
                  <el-button type="danger" @click="deleteAccount">删除</el-button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore, api } from '@/stores'

const router = useRouter()
const userStore = useUserStore()

const activeSection = ref('profile')
const saving = ref(false)
const exporting = ref(false)

const form = reactive({
  nickname: '',
  signature: '',
  email: '',
  privacySettings: {
    allowViewWishwall: true
  }
})

function loadUserData() {
  if (userStore.user) {
    form.nickname = userStore.user.nickname || ''
    form.signature = userStore.user.signature || ''
    form.email = userStore.user.email || ''
    form.privacySettings = { ...userStore.user.privacySettings }
  }
}

async function saveProfile() {
  saving.value = true
  try {
    const result = await userStore.updateProfile({
      nickname: form.nickname,
      signature: form.signature,
      email: form.email
    })
    if (result.success) {
      ElMessage.success('保存成功')
    }
  } finally {
    saving.value = false
  }
}

async function savePrivacy() {
  saving.value = true
  try {
    const result = await userStore.updateProfile({
      privacySettings: form.privacySettings
    })
    if (result.success) {
      ElMessage.success('保存成功')
    }
  } finally {
    saving.value = false
  }
}

async function exportData() {
  exporting.value = true
  try {
    const res = await api.get('/users/export')
    if (res.data.code === 200) {
      const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mood-log-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      ElMessage.success('导出成功')
    }
  } catch {
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

async function deleteAccount() {
  try {
    await ElMessageBox.confirm('确定要删除账号吗？所有数据将被永久删除，此操作不可逆。', '危险操作', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'error'
    })
    await api.delete('/users/account')
    userStore.logout()
    ElMessage.success('账号已删除')
    router.push('/')
  } catch {}
}

onMounted(() => {
  loadUserData()
})
</script>

<style lang="scss" scoped>
.settings-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

.settings-main {
  padding-top: 88px;
  padding-bottom: 60px;
}

.settings-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 32px;
}

.settings-nav {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 16px;
  height: fit-content;
  box-shadow: var(--shadow-card);
  
  &__item {
    display: block;
    width: 100%;
    padding: 12px 16px;
    text-align: left;
    font-size: 15px;
    color: var(--color-text-secondary);
    background: transparent;
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
    
    &:hover {
      background: var(--bg-secondary);
    }
    
    &.active {
      background: rgba(255, 99, 33, 0.1);
      color: var(--color-primary);
    }
  }
}

.settings-content {
  max-width: 600px;
}

.settings-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: var(--shadow-card);
  
  h3 {
    font-size: 1.2rem;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-light);
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-label {
    display: block;
    font-size: 14px;
    color: var(--color-text-secondary);
    margin-bottom: 8px;
  }
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-light);
  
  .setting-title {
    display: block;
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .setting-desc {
    font-size: 13px;
    color: var(--color-text-muted);
  }
}

.data-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.data-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  
  &--danger {
    background: rgba(229, 57, 53, 0.05);
    border: 1px solid rgba(229, 57, 53, 0.2);
  }
  
  &__title {
    display: block;
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  &__desc {
    font-size: 13px;
    color: var(--color-text-muted);
  }
}

@media (max-width: 768px) {
  .settings-layout {
    grid-template-columns: 1fr;
  }
}
</style>