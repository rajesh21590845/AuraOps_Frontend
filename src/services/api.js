import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api', // Ensure this matches your backend proxy
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor – attach JWT
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

// Response interceptor – global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auraops_token')
      localStorage.removeItem('auraops_user')
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

// ─── Auth ──────────────────────────────────────────────
export const loginUser = (data) => api.post('/auth/login', data)
export const registerUser = (data) => api.post('/auth/register', data)
export const forgotPassword = (data) => api.post('/auth/forgot-password', data)
export const resetPassword = (data) => api.post('/auth/reset-password', data)

// ─── Projects ──────────────────────────────────────────
export const getProjects = () => api.get('/projects')
export const getProject = (id) => api.get(`/projects/${id}`)
export const createProject = (data) => api.post('/projects', data)
export const updateProject = (id, data) => api.put(`/projects/${id}`, data)
export const deleteProject = (id) => api.delete(`/projects/${id}`)

// ─── Stats ─────────────────────────────────────────────
export const getProjectStats = (id) => api.get(`/projects/${id}/stats`)

export default api
