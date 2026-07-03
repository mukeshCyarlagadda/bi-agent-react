import axios from 'axios'
import { supabase } from '@/lib/supabase'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 120_000,
})

// Attach X-Session-ID (DB session) and Authorization: Bearer <JWT> on every request.
// getSession() returns the cached in-memory token — no network call.
apiClient.interceptors.request.use(async (config) => {
  const sessionId = sessionStorage.getItem('sessionId')
  if (sessionId) config.headers['X-Session-ID'] = sessionId

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers['Authorization'] = `Bearer ${session.access_token}`
  }
  return config
})

// 401 → JWT expired or invalid → send to login, clear DB session
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('sessionId')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default apiClient
