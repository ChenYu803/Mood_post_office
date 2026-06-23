import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(username, password) {
    const res = await api.post('/auth/login', { username, password })
    if (res.data.code === 200) {
      token.value = res.data.data.token
      user.value = res.data.data.user
      localStorage.setItem('token', token.value)
      return { success: true }
    }
    return { success: false, message: res.data.message }
  }

  async function register(username, password, email) {
    const res = await api.post('/auth/register', { username, password, email })
    if (res.data.code === 201) {
      token.value = res.data.data.token
      user.value = res.data.data.user
      localStorage.setItem('token', token.value)
      return { success: true }
    }
    return { success: false, message: res.data.message }
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      const res = await api.get('/auth/me')
      if (res.data.code === 200) {
        user.value = res.data.data
      }
    } catch (error) {
      logout()
    }
  }

  async function updateProfile(data) {
    const res = await api.put('/auth/me', data)
    if (res.data.code === 200) {
      user.value = res.data.data
      return { success: true }
    }
    return { success: false, message: res.data.message }
  }

  function logout() {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
  }

  if (token.value) {
    fetchUser()
  }

  return {
    user,
    token,
    isLoggedIn,
    isAdmin,
    login,
    register,
    fetchUser,
    updateProfile,
    logout
  }
})

export const useNoteStore = defineStore('notes', () => {
  const notes = ref([])
  const total = ref(0)
  const loading = ref(false)

  async function fetchNotes(params = {}) {
    loading.value = true
    try {
      const res = await api.get('/notes', { params })
      if (res.data.code === 200) {
        notes.value = res.data.data.notes
        total.value = res.data.data.total
      }
    } finally {
      loading.value = false
    }
  }

  async function createNote(data) {
    const res = await api.post('/notes', data)
    if (res.data.code === 201) {
      return { success: true, data: res.data.data }
    }
    return { success: false, message: res.data.message }
  }

  async function updateNote(id, data) {
    const res = await api.put(`/notes/${id}`, data)
    if (res.data.code === 200) {
      return { success: true, data: res.data.data }
    }
    return { success: false, message: res.data.message }
  }

  async function deleteNote(id) {
    const res = await api.delete(`/notes/${id}`)
    if (res.data.code === 200) {
      notes.value = notes.value.filter(n => n._id !== id)
      return { success: true }
    }
    return { success: false, message: res.data.message }
  }

  return { notes, total, loading, fetchNotes, createNote, updateNote, deleteNote }
})

export const useTreeholeStore = defineStore('treehole', () => {
  const treeholes = ref([])
  const total = ref(0)
  const currentTreehole = ref(null)
  const comments = ref([])
  const loading = ref(false)

  async function fetchTreeholes(params = {}) {
    loading.value = true
    try {
      const res = await api.get('/treehole', { params })
      if (res.data.code === 200) {
        treeholes.value = res.data.data.treeholes
        total.value = res.data.data.total
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchTreeholeDetail(id) {
    loading.value = true
    try {
      const res = await api.get(`/treehole/${id}`)
      if (res.data.code === 200) {
        currentTreehole.value = res.data.data.treehole
        comments.value = res.data.data.comments
        return { success: true }
      }
    } finally {
      loading.value = false
    }
    return { success: false }
  }

  async function publishTreehole(data) {
    const res = await api.post('/treehole', {
      content: data.content,
      emotion: data.emotion,
      isAnonymous: data.isAnonymous
    })
    if (res.data.code === 201) {
      return { success: true, crisis: res.data.crisis }
    }
    return { success: false, message: res.data.message }
  }

  async function postComment(treeholeId, content) {
    const res = await api.post(`/treehole/${treeholeId}/comments`, { content })
    if (res.data.code === 201) {
      return { success: true }
    }
    return { success: false, message: res.data.message }
  }

  async function fetchMyTreeholes(params = {}) {
    const res = await api.get('/treehole/my/posts', { params })
    if (res.data.code === 200) {
      return { success: true, data: res.data.data }
    }
    return { success: false }
  }

  return {
    treeholes, total, currentTreehole, comments, loading,
    fetchTreeholes, fetchTreeholeDetail, publishTreehole, postComment, fetchMyTreeholes
  }
})

export const useArticleStore = defineStore('articles', () => {
  const articles = ref([])
  const total = ref(0)
  const currentArticle = ref(null)
  const relatedArticles = ref([])
  const loading = ref(false)

  async function fetchArticles(params = {}) {
    loading.value = true
    try {
      const res = await api.get('/articles', { params })
      if (res.data.code === 200) {
        articles.value = res.data.data.articles
        total.value = res.data.data.total
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchArticleDetail(id) {
    loading.value = true
    try {
      const res = await api.get(`/articles/${id}`)
      if (res.data.code === 200) {
        currentArticle.value = res.data.data.article
        relatedArticles.value = res.data.data.relatedArticles
        return { success: true }
      }
    } finally {
      loading.value = false
    }
    return { success: false }
  }

  return { articles, total, currentArticle, relatedArticles, loading, fetchArticles, fetchArticleDetail }
})

export { api }
export default api