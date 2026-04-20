import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: 'http://localhost:8081',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auraops_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auraops_token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
        toast.error('Session expired. Please log in again.')
      }
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (!error.response) {
      toast.error('Network error. Check your connection.')
    }
    return Promise.reject(error)
  }
)

const parseJwtPayload = (token) => {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)})`)
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

export const getUserIdFromToken = () => {
  const token = localStorage.getItem('auraops_token')
  if (!token) return null
  const payload = parseJwtPayload(token)
  return payload?.userId || payload?.id || payload?.sub || null
}

// ─── Auth ──────────────────────────────────────────────
export const loginUser = (data) => api.post('/api/auth/login', data)
export const registerUser = (data) => api.post('/api/auth/register', data)
export const verifyOtp = (data) => api.post('/api/auth/verify-otp', data)

// ─── Projects ──────────────────────────────────────────
export const getProjects = () => api.get('/api/projects')
export const getDashboardProjects = (userId) => api.get(`/api/dashboard/users/${userId}/projects`)
export const getProject = (id) => api.get(`/api/projects/${id}`)
export const createProject = (data) => api.post('/api/projects', data)
export const updateProject = (id, data) => api.put(`/api/projects/${id}`, data)
export const deleteProject = (id) => api.delete(`/api/projects/${id}`)

// ─── Dashboard ─────────────────────────────────────────
export const getDashboardPullRequests = (userId) => api.get(`/api/dashboard/users/${userId}/pull-requests`)
export const getUserSummary = (userId) => api.get(`/api/dashboard/users/${userId}/summary`)
export const getProjectPullRequests = (projectId) => api.get(`/api/dashboard/projects/${projectId}/pull-requests`)

// ─── Stats ─────────────────────────────────────────────
export const getProjectStats = (id) => api.get(`/api/projects/${id}/stats`)

export default api