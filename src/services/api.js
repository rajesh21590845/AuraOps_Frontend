import axios from 'axios'
import toast from 'react-hot-toast'

const ACCESS_TOKEN_KEY = 'auraops_access_token'
const REFRESH_TOKEN_KEY = 'auraops_refresh_token'
const LEGACY_TOKEN_KEY = 'auraops_token'

const api = axios.create({
  baseURL: 'http://localhost:8081',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

const refreshApi = axios.create({
  baseURL: 'http://localhost:8081',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

const getRequestUrl = (config) => {
  try {
    return new URL(config.url || '', config.baseURL || window.location.origin).toString()
  } catch {
    return `${config.baseURL || ''}${config.url || ''}`
  }
}

const isAuthEndpoint = (config = {}) => {
  const url = config.url || ''
  return [
    '/api/auth/login',
    '/api/auth/send-otp',
    '/api/auth/verify-otp',
    '/api/auth/refresh-token',
  ].some((endpoint) => url.includes(endpoint))
}

export const logBackendRequest = (config) => {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return
  }

  const payload = JSON.stringify({
    method: (config.method || 'get').toUpperCase(),
    url: getRequestUrl(config),
    retried: Boolean(config._retry),
  })

  const logUrl = `${window.location.origin}/__backend-request-log`

  if (navigator.sendBeacon) {
    navigator.sendBeacon(logUrl, new Blob([payload], { type: 'application/json' }))
    return
  }

  fetch(logUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {})
}

export const getStoredAccessToken = () =>
  localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY)

export const getStoredRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY)

export const extractAuthTokens = (data = {}) => {
  const accessToken =
    data.accessToken ||
    data.accesstoken ||
    data.access_token ||
    data.token ||
    data.jwt ||
    null

  const refreshToken =
    data.refreshToken ||
    data.refreshtoken ||
    data.refresh_token ||
    null

  return { accessToken, refreshToken }
}

export const storeAuthTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(LEGACY_TOKEN_KEY, accessToken)
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }

  window.dispatchEvent(new Event('auraops-auth-token-change'))
}

export const clearAuthStorage = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
  localStorage.removeItem('auraops_user')
  localStorage.removeItem('auraops_meta')
  window.dispatchEvent(new Event('auraops-auth-token-change'))
}

let isRedirectingToLogin = false

const redirectToLogin = () => {
  clearAuthStorage()

  if (window.location.pathname !== '/login' && !isRedirectingToLogin) {
    isRedirectingToLogin = true
    toast.error('Session expired. Please log in again.')
    window.location.href = '/login'
  }
}

let refreshPromise = null

const isStoredAccessTokenExpired = (skewSeconds = 30) => {
  const accessToken = getStoredAccessToken()
  if (!accessToken) return true

  const payload = parseJwtPayload(accessToken)
  if (!payload?.exp) return false

  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000
}

// Attach JWT
api.interceptors.request.use(
  (config) => {
    const accessToken = getStoredAccessToken()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    logBackendRequest(config)
    return config
  },
  (error) => Promise.reject(error)
)

refreshApi.interceptors.request.use(
  (config) => {
    logBackendRequest(config)
    return config
  },
  (error) => Promise.reject(error)
)

// Error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const isTokenExpired = error.response?.data?.error === 'TOKEN_EXPIRED'
    const isUnauthorized = status === 401
    const isProtectedRequest = originalRequest && !isAuthEndpoint(originalRequest)
    const shouldRefreshAuth = isProtectedRequest && (isTokenExpired || (isUnauthorized && isStoredAccessTokenExpired()))
    const shouldRedirectAuth = isProtectedRequest && isUnauthorized && !getStoredAccessToken()

    if (shouldRefreshAuth && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = getStoredRefreshToken()
      if (!refreshToken) {
        redirectToLogin()
        return Promise.reject(error)
      }

      try {
        if (!refreshPromise) {
          refreshPromise = refreshApi
            .post('/api/auth/refresh-token', { refreshToken })
            .then((response) => {
              const tokens = extractAuthTokens(response.data)

              if (!tokens.accessToken || !tokens.refreshToken) {
                throw new Error('Refresh response did not include both tokens')
              }

              storeAuthTokens(tokens)
              return tokens
            })
            .finally(() => {
              refreshPromise = null
            })
        }

        const { accessToken } = await refreshPromise
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        redirectToLogin()
        return Promise.reject(refreshError)
      }
    }

    if (shouldRefreshAuth || shouldRedirectAuth) {
      redirectToLogin()
    } else if (isUnauthorized) {
      if (import.meta.env.DEV) {
        console.warn('[backend] 401', {
          url: getRequestUrl(originalRequest || {}),
          message: error.response?.data?.message,
          error: error.response?.data?.error,
        })
      }
    } else if (status >= 500) {
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
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

export const getUserIdFromToken = (tokenOverride) => {
  const token = tokenOverride || getStoredAccessToken()
  if (!token) return null
  const payload = parseJwtPayload(token)
  return payload?.userId || payload?.userID || payload?.user_id || payload?.id || payload?.sub || payload?.uid || null
}

// ─── Auth ──────────────────────────────────────────────
export const registerUser = (data) =>
  api.post('/api/auth/send-otp', data)
export const loginUser = (data) => api.post('/api/auth/login', data)
export const verifyOtp = (data) =>
  api.post('/api/auth/verify-otp', data)
export const getMeta = (userId) => api.get(`/api/dashboard/users/${userId}/meta`)

// ─── Projects ──────────────────────────────────────────
export const getProjects = (userId) => api.get(`/api/users/${userId}/projects`)
export const getDashboardProjects = (userId) => api.get(`/api/dashboard/users/${userId}/projects`)
export const getProject = (id) => api.get(`/api/project/${id}`)
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
