<template>
  <div class="admin-page">
    <main class="admin-main">
      <div class="container">
        <div class="page-header">
          <h1 class="page-header__title">审核中心</h1>
          <p class="page-header__subtitle">管理待审核内容</p>
        </div>

        <div class="admin-tabs">
          <button 
            :class="['tab', { active: activeTab === 'treeholes' }]"
            @click="activeTab = 'treeholes'; fetchData()"
          >
            待审核回声 ({{ counts.treeholes }})
          </button>
          <button 
            :class="['tab', { active: activeTab === 'treeholeComments' }]"
            @click="activeTab = 'treeholeComments'; fetchData()"
          >
            待审核回声评论 ({{ counts.treeholeComments }})
          </button>
          <button 
            :class="['tab', { active: activeTab === 'articles' }]"
            @click="activeTab = 'articles'; fetchData()"
          >
            待审核文章 ({{ counts.articles }})
          </button>
          <button 
            :class="['tab', { active: activeTab === 'articleComments' }]"
            @click="activeTab = 'articleComments'; fetchData()"
          >
            待审核文章评论 ({{ counts.articleComments }})
          </button>
          <button 
            :class="['tab', { active: activeTab === 'reports' }]"
            @click="activeTab = 'reports'; fetchReports()"
          >
            举报信息 ({{ counts.reports }})
          </button>
        </div>

        <div class="admin-content" v-loading="loading">
          <!-- 待审核回声 -->
          <div class="pending-list" v-if="activeTab === 'treeholes'">
            <div 
              v-for="item in pendingTreeholes" 
              :key="item._id"
              class="pending-item"
            >
              <div class="pending-item__header">
                <span class="pending-item__code">{{ item.anonymousCode }}</span>
                <span :class="['emotion-tag', `emotion-tag--${item.emotion}`]">{{ item.emotion }}</span>
                <span class="pending-item__time">{{ formatTime(item.createdAt) }}</span>
              </div>
              <p class="pending-item__content">{{ item.content }}</p>
              <div class="pending-item__actions">
                <button class="btn btn--success" @click="approveTreehole(item._id)">通过</button>
                <button class="btn btn--danger" @click="rejectTreehole(item._id)">驳回</button>
              </div>
            </div>
            <div class="empty-state" v-if="pendingTreeholes.length === 0">
              <div class="empty-state__icon">✅</div>
              <p class="empty-state__text">暂无待审核回声</p>
            </div>
          </div>

          <!-- 待审核回声评论 -->
          <div class="pending-list" v-if="activeTab === 'treeholeComments'">
            <div 
              v-for="item in pendingTreeholeComments" 
              :key="item._id"
              class="pending-item"
            >
              <div class="pending-item__header">
                <span class="pending-item__code">{{ item.anonymousCode }}</span>
                <span class="pending-item__source">评论于: {{ item.treeholeContent?.slice(0, 30) }}...</span>
                <span class="pending-item__time">{{ formatTime(item.createdAt) }}</span>
              </div>
              <p class="pending-item__content">{{ item.content }}</p>
              <div class="pending-item__actions">
                <button class="btn btn--success" @click="approveTreeholeComment(item._id)">通过</button>
                <button class="btn btn--danger" @click="rejectTreeholeComment(item._id)">驳回</button>
              </div>
            </div>
            <div class="empty-state" v-if="pendingTreeholeComments.length === 0">
              <div class="empty-state__icon">✅</div>
              <p class="empty-state__text">暂无待审核回声评论</p>
            </div>
          </div>

          <!-- 待审核文章 -->
          <div class="pending-list" v-if="activeTab === 'articles'">
            <div 
              v-for="item in pendingArticles" 
              :key="item._id"
              class="pending-item pending-item--article"
            >
              <div class="pending-item__header">
                <span class="pending-item__title">{{ item.title }}</span>
                <span class="pending-item__author">作者: {{ item.author?.nickname || item.author || '未知' }}</span>
                <span class="pending-item__time">{{ formatTime(item.createdAt) }}</span>
              </div>
              <p class="pending-item__summary">{{ item.summary }}</p>
              <div class="pending-item__actions">
                <button class="btn btn--primary" @click="previewArticle(item)">预览</button>
                <button class="btn btn--success" @click="approveArticle(item._id)">通过</button>
                <button class="btn btn--danger" @click="rejectArticle(item._id)">驳回</button>
              </div>
            </div>
            <div class="empty-state" v-if="pendingArticles.length === 0">
              <div class="empty-state__icon">✅</div>
              <p class="empty-state__text">暂无待审核文章</p>
            </div>
          </div>

          <!-- 待审核文章评论 -->
          <div class="pending-list" v-if="activeTab === 'articleComments'">
            <div 
              v-for="item in pendingArticleComments" 
              :key="item._id"
              class="pending-item"
            >
              <div class="pending-item__header">
                <span class="pending-item__author">{{ item.userId?.nickname || '匿名用户' }}</span>
                <span class="pending-item__source">评论于: {{ item.articleTitle || '未知文章' }}</span>
                <span class="pending-item__time">{{ formatTime(item.createdAt) }}</span>
              </div>
              <p class="pending-item__content">{{ item.content }}</p>
              <div class="pending-item__actions">
                <button class="btn btn--success" @click="approveArticleComment(item._id)">通过</button>
                <button class="btn btn--danger" @click="rejectArticleComment(item._id)">驳回</button>
              </div>
            </div>
            <div class="empty-state" v-if="pendingArticleComments.length === 0">
              <div class="empty-state__icon">✅</div>
              <p class="empty-state__text">暂无待审核文章评论</p>
            </div>
          </div>

          <!-- 举报信息 -->
          <div class="pending-list" v-if="activeTab === 'reports'">
            <div class="report-filters">
              <select v-model="reportFilter" @change="fetchReports()" class="filter-select">
                <option value="全部">全部模块</option>
                <option value="treehole">回声广场</option>
                <option value="article">夜灯书房</option>
              </select>
              <select v-model="reportSort" @change="fetchReports()" class="filter-select">
                <option value="最新">最新优先</option>
                <option value="最早">最早优先</option>
              </select>
              <button 
                class="btn btn--danger btn--sm" 
                @click="batchRejectReports" 
                :disabled="selectedReports.length === 0"
                v-if="selectedReports.length > 0"
              >
                批量不予采纳 ({{ selectedReports.length }})
              </button>
              <button 
                class="btn btn--warning btn--sm" 
                @click="batchAdoptReports" 
                :disabled="selectedReports.length === 0"
                v-if="selectedReports.length > 0"
              >
                批量采纳 ({{ selectedReports.length }})
              </button>
            </div>

            <div 
              v-for="item in reports" 
              :key="item._id"
              class="pending-item report-item"
            >
              <div class="pending-item__header">
                <input 
                  type="checkbox" 
                  :value="item._id" 
                  v-model="selectedReports"
                  class="report-checkbox"
                />
                <span class="pending-item__module-tag" :class="item.targetType === 'treehole' ? 'module-treehole' : 'module-article'">
                  {{ item.targetType === 'treehole' ? '回声广场' : '夜灯书房' }}
                </span>
                <span class="pending-item__title">{{ item.targetTitle }}</span>
                <span class="pending-item__time">{{ formatTime(item.createdAt) }}</span>
              </div>
              <div class="report-detail">
                <div class="report-detail__row">
                  <span class="report-label">举报用户ID:</span>
                  <span class="report-value">{{ item.reporterUid }}</span>
                </div>
                <div class="report-detail__row">
                  <span class="report-label">举报理由:</span>
                  <span class="report-value">{{ item.reason }}</span>
                </div>
                <div class="report-detail__row" v-if="item.targetPreview">
                  <span class="report-label">内容预览:</span>
                  <span class="report-value report-preview">{{ item.targetPreview.slice(0, 100) }}</span>
                </div>
              </div>
              <div class="pending-item__actions">
                <router-link 
                  v-if="item.targetType === 'treehole' && item.targetExists"
                  :to="`/plaza/${item.targetId}`" 
                  class="btn btn--primary btn--sm"
                  target="_blank"
                >
                  查看原文
                </router-link>
                <router-link 
                  v-if="item.targetType === 'article' && item.targetExists"
                  :to="`/study/${item.targetId}`" 
                  class="btn btn--primary btn--sm"
                  target="_blank"
                >
                  查看原文
                </router-link>
                <button class="btn btn--danger" @click="adoptReport(item._id)">采纳（下架内容）</button>
                <button class="btn btn--ghost" @click="rejectReport(item._id)">不予采纳</button>
              </div>
            </div>
            <div class="empty-state" v-if="reports.length === 0">
              <div class="empty-state__icon">✅</div>
              <p class="empty-state__text">暂无举报信息</p>
            </div>
          </div>
        </div>

        <div class="back-btn">
          <router-link to="/profile" class="btn btn--ghost">
            ← 返回个人中心
          </router-link>
        </div>
      </div>
    </main>

    <el-dialog v-model="showPreview" title="文章预览" width="700px" class="preview-dialog">
      <div class="preview-content" v-if="previewArticleData">
        <h2 class="preview-title">{{ previewArticleData.title }}</h2>
        <div class="preview-meta">
          <span>作者: {{ previewArticleData.author?.nickname || previewArticleData.author }}</span>
          <span>分类: {{ previewArticleData.category }}</span>
        </div>
        <div class="preview-body" v-html="previewArticleData.content"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api } from '@/stores'

const activeTab = ref('treeholes')
const loading = ref(false)
const showPreview = ref(false)
const previewArticleData = ref(null)

const counts = reactive({
  treeholes: 0,
  treeholeComments: 0,
  articles: 0,
  articleComments: 0,
  reports: 0
})

const pendingTreeholes = ref([])
const pendingTreeholeComments = ref([])
const pendingArticles = ref([])
const pendingArticleComments = ref([])
const reports = ref([])
const selectedReports = ref([])
const reportFilter = ref('全部')
const reportSort = ref('最新')

async function fetchCounts() {
  try {
    const [tRes, tcRes, aRes, acRes, rRes] = await Promise.all([
      api.get('/users/admin/pending/treeholes').catch(() => ({ data: { data: [] } })),
      api.get('/users/admin/pending/comments').catch(() => ({ data: { data: [] } })),
      api.get('/articles/admin/pending').catch(() => ({ data: { data: [] } })),
      api.get('/articles/admin/pending-comments').catch(() => ({ data: { data: [] } })),
      api.get('/reports/admin/count').catch(() => ({ data: { data: { total: 0 } } }))
    ])
    
    counts.treeholes = tRes.data.data?.length || 0
    counts.treeholeComments = tcRes.data.data?.length || 0
    counts.articles = aRes.data.data?.length || 0
    counts.articleComments = acRes.data.data?.length || 0
    counts.reports = rRes.data.data?.total || 0
  } catch (e) {
    console.error('Failed to fetch counts:', e)
  }
}

async function fetchData() {
  loading.value = true
  try {
    if (activeTab.value === 'treeholes') {
      const res = await api.get('/users/admin/pending/treeholes')
      pendingTreeholes.value = res.data.data || []
    } else if (activeTab.value === 'treeholeComments') {
      const res = await api.get('/users/admin/pending/comments')
      pendingTreeholeComments.value = res.data.data || []
    } else if (activeTab.value === 'articles') {
      const res = await api.get('/articles/admin/pending')
      pendingArticles.value = res.data.data || []
    } else if (activeTab.value === 'articleComments') {
      const res = await api.get('/articles/admin/pending-comments')
      pendingArticleComments.value = res.data.data || []
    }
  } finally {
    loading.value = false
  }
}

async function approveTreehole(id) {
  try {
    await api.put(`/users/admin/treeholes/${id}/review`, { status: '已发布' })
    ElMessage.success('已通过')
    fetchData()
    fetchCounts()
  } catch {
    ElMessage.error('操作失败')
  }
}

async function rejectTreehole(id) {
  try {
    await api.put(`/users/admin/treeholes/${id}/review`, { status: '已驳回' })
    ElMessage.success('已驳回')
    fetchData()
    fetchCounts()
  } catch {
    ElMessage.error('操作失败')
  }
}

async function approveTreeholeComment(id) {
  try {
    await api.put(`/users/admin/comments/${id}/review`, { status: '已发布' })
    ElMessage.success('已通过')
    fetchData()
    fetchCounts()
  } catch {
    ElMessage.error('操作失败')
  }
}

async function rejectTreeholeComment(id) {
  try {
    await api.put(`/users/admin/comments/${id}/review`, { status: '已驳回' })
    ElMessage.success('已驳回')
    fetchData()
    fetchCounts()
  } catch {
    ElMessage.error('操作失败')
  }
}

async function approveArticle(id) {
  try {
    await api.put(`/articles/admin/${id}/review`, { status: '已发布' })
    ElMessage.success('已通过')
    fetchData()
    fetchCounts()
  } catch {
    ElMessage.error('操作失败')
  }
}

async function rejectArticle(id) {
  try {
    await api.put(`/articles/admin/${id}/review`, { status: '已驳回' })
    ElMessage.success('已驳回')
    fetchData()
    fetchCounts()
  } catch {
    ElMessage.error('操作失败')
  }
}

async function approveArticleComment(id) {
  try {
    await api.put(`/articles/admin/comments/${id}/review`, { status: '已发布' })
    ElMessage.success('已通过')
    fetchData()
    fetchCounts()
  } catch {
    ElMessage.error('操作失败')
  }
}

async function rejectArticleComment(id) {
  try {
    await api.put(`/articles/admin/comments/${id}/review`, { status: '已驳回' })
    ElMessage.success('已驳回')
    fetchData()
    fetchCounts()
  } catch {
    ElMessage.error('操作失败')
  }
}

function previewArticle(article) {
  previewArticleData.value = article
  showPreview.value = true
}

async function fetchReports() {
  loading.value = true
  selectedReports.value = []
  try {
    const params = { page: 1, limit: 50 }
    if (reportFilter.value !== '全部') params.targetType = reportFilter.value
    params.sort = reportSort.value
    const res = await api.get('/reports/admin/list', { params })
    if (res.data.code === 200) {
      reports.value = res.data.data.reports || []
    }
  } catch (e) {
    console.error('Failed to fetch reports:', e)
  } finally {
    loading.value = false
  }
}

async function adoptReport(id) {
  try {
    await ElMessageBox.confirm(
      '采纳举报后，被举报内容将被标记为"已下架"，所有关联评论将被删除，收藏该内容的用户将收到下架提示。此操作不可撤销，确认采纳？',
      '确认采纳举报',
      { confirmButtonText: '确认采纳', cancelButtonText: '取消', type: 'warning' }
    )
    const res = await api.put(`/reports/admin/${id}/adopt`)
    if (res.data.code === 200) {
      ElMessage.success('已采纳，内容已下架')
      fetchReports()
      fetchCounts()
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('操作失败')
  }
}

async function rejectReport(id) {
  try {
    await ElMessageBox.confirm(
      '不予采纳后，该举报记录将被永久删除。确认不予采纳？',
      '确认不予采纳',
      { confirmButtonText: '确认', cancelButtonText: '取消' }
    )
    const res = await api.put(`/reports/admin/${id}/reject`)
    if (res.data.code === 200) {
      ElMessage.success('已不予采纳')
      fetchReports()
      fetchCounts()
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('操作失败')
  }
}

async function batchRejectReports() {
  try {
    await ElMessageBox.confirm(
      `确认对选中的 ${selectedReports.value.length} 条举报不予采纳？举报记录将被永久删除。`,
      '批量不予采纳',
      { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' }
    )
    const res = await api.put('/reports/admin/batch', {
      reportIds: selectedReports.value,
      action: 'reject'
    })
    if (res.data.code === 200) {
      ElMessage.success(res.data.message)
      selectedReports.value = []
      fetchReports()
      fetchCounts()
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('操作失败')
  }
}

async function batchAdoptReports() {
  try {
    await ElMessageBox.confirm(
      `确认采纳选中的 ${selectedReports.value.length} 条举报？被举报内容将被下架，关联评论将被删除。此操作不可撤销！`,
      '批量采纳举报',
      { confirmButtonText: '确认采纳', cancelButtonText: '取消', type: 'warning' }
    )
    const res = await api.put('/reports/admin/batch', {
      reportIds: selectedReports.value,
      action: 'adopt'
    })
    if (res.data.code === 200) {
      ElMessage.success(res.data.message)
      selectedReports.value = []
      fetchReports()
      fetchCounts()
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('操作失败')
  }
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  fetchCounts()
  fetchData()
})
</script>

<style lang="scss" scoped>
.admin-page {
  min-height: 100vh;
  background: 
    radial-gradient(ellipse at 20% 30%, rgba(107, 68, 35, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(139, 115, 85, 0.08) 0%, transparent 50%),
    linear-gradient(180deg, #1A1410 0%, #2D2418 50%, #1A1410 100%);
}

.admin-main {
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

.admin-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  justify-content: center;
}

.tab {
  padding: 12px 24px;
  background: linear-gradient(145deg, rgba(62, 50, 38, 0.8) 0%, rgba(45, 36, 24, 0.9) 100%);
  border-radius: 4px;
  font-size: 14px;
  color: var(--color-ash);
  transition: all 0.3s ease;
  border: 1px solid rgba(212, 165, 116, 0.1);
  
  &:hover {
    background: rgba(212, 165, 116, 0.15);
    color: var(--color-amber-glow);
  }
  
  &.active {
    background: rgba(212, 165, 116, 0.2);
    color: var(--color-amber-glow);
    border-color: rgba(212, 165, 116, 0.3);
  }
}

.pending-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 900px;
  margin: 0 auto;
}

.pending-item {
  background: linear-gradient(145deg, rgba(62, 50, 38, 0.8) 0%, rgba(45, 36, 24, 0.9) 100%);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 165, 116, 0.1);
  
  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }
  
  &__code, &__author {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-candle);
  }
  
  &__title {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-candle);
  }
  
  &__source {
    font-size: 12px;
    color: var(--color-ash);
  }
  
  &__time {
    font-size: 13px;
    color: var(--color-ash);
    margin-left: auto;
  }
  
  &__content {
    font-size: 15px;
    line-height: 1.6;
    color: var(--color-moonlight);
    margin-bottom: 16px;
  }
  
  &__summary {
    font-size: 14px;
    line-height: 1.6;
    color: var(--color-ash);
    margin-bottom: 16px;
  }
  
  &__actions {
    display: flex;
    gap: 8px;
  }
  
  &--article {
    .pending-item__header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  
  &--success {
    background: rgba(107, 203, 119, 0.2);
    color: #6BCB77;
    border-color: rgba(107, 203, 119, 0.3);
    
    &:hover {
      background: rgba(107, 203, 119, 0.3);
    }
  }
  
  &--danger {
    background: rgba(229, 115, 115, 0.2);
    color: #E57373;
    border-color: rgba(229, 115, 115, 0.3);
    
    &:hover {
      background: rgba(229, 115, 115, 0.3);
    }
  }
  
  &--primary {
    background: rgba(91, 141, 239, 0.2);
    color: #5B8DEF;
    border-color: rgba(91, 141, 239, 0.3);
    
    &:hover {
      background: rgba(91, 141, 239, 0.3);
    }
  }
  
  &--ghost {
    background: transparent;
    color: var(--color-ash);
    border-color: rgba(212, 165, 116, 0.3);
    
    &:hover {
      background: rgba(212, 165, 116, 0.1);
      color: var(--color-amber-glow);
    }
  }

  &--warning {
    background: rgba(255, 193, 7, 0.2);
    color: #FFC107;
    border-color: rgba(255, 193, 7, 0.3);

    &:hover {
      background: rgba(255, 193, 7, 0.3);
    }
  }

  &--sm {
    padding: 6px 12px;
    font-size: 12px;
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  
  &__icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  &__text {
    color: var(--color-ash);
    font-size: 15px;
  }
}

.back-btn {
  max-width: 900px;
  margin: 32px auto 0;
}

.emotion-tag {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 3px;
  
  &--开心 { background: rgba(255, 217, 61, 0.15); color: #FFD93D; }
  &--平静 { background: rgba(107, 203, 119, 0.15); color: #6BCB77; }
  &--焦虑 { background: rgba(255, 107, 107, 0.15); color: #FF6B6B; }
  &--愤怒 { background: rgba(255, 140, 66, 0.15); color: #FF8C42; }
  &--难过 { background: rgba(100, 149, 237, 0.15); color: #6495ED; }
  &--感动 { background: rgba(255, 179, 186, 0.15); color: #FFB3BA; }
  &--迷茫 { background: rgba(155, 89, 182, 0.15); color: #9B59B6; }
}

.preview-dialog {
  .preview-content {
    max-height: 60vh;
    overflow-y: auto;
  }
  
  .preview-title {
    font-size: 1.5rem;
    margin-bottom: 12px;
    color: #3d2f24;
  }
  
  .preview-meta {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    font-size: 14px;
    color: #666;
  }
  
  .preview-body {
    font-size: 15px;
    line-height: 1.8;
    color: #333;
    
    :deep(p) {
      margin-bottom: 1em;
    }
  }
}

.report-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  background: rgba(45, 36, 24, 0.8);
  border: 1px solid rgba(212, 165, 116, 0.2);
  border-radius: 4px;
  color: var(--color-candle);
  font-size: 13px;
  cursor: pointer;

  option {
    background: #2D2418;
    color: var(--color-candle);
  }
}

.report-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--color-amber-glow);
}

.pending-item__module-tag {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 3px;
  font-weight: 500;

  &.module-treehole {
    background: rgba(181, 160, 136, 0.2);
    color: #B5A088;
  }

  &.module-article {
    background: rgba(212, 165, 116, 0.2);
    color: var(--color-amber-glow);
  }
}

.report-detail {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(45, 36, 24, 0.5);
  border-radius: 4px;
  border: 1px solid rgba(212, 165, 116, 0.08);
}

.report-detail__row {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 14px;
  line-height: 1.6;

  &:last-child {
    margin-bottom: 0;
  }
}

.report-label {
  color: var(--color-ash);
  flex-shrink: 0;
  min-width: 80px;
}

.report-value {
  color: var(--color-moonlight);
  word-break: break-all;
}

.report-preview {
  color: var(--color-ash);
  font-size: 13px;
}

.report-item {
  .pending-item__header {
    gap: 10px;
  }
}
</style>
