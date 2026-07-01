/**
 * Axios instance — single place for base URL, headers, and error handling.
 *
 * All API modules import `apiClient` from here.
 * The session ID is injected per-request via a request interceptor so
 * individual call sites don't have to remember to add it.
 */
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 120_000,   // 120 s — LLM + SQL can be slow
})

/**
 * Request interceptor: attach X-Session-ID from sessionStorage if present.
 *
 * sessionStorage persists for the life of the browser tab, not across tabs.
 * That matches the in-memory session store on the server — perfect.
 */
apiClient.interceptors.request.use((config) => {
  const sessionId = sessionStorage.getItem('sessionId')
  if (sessionId) {
    config.headers['X-Session-ID'] = sessionId
  }
  return config
})

/**
 * Response interceptor: turn 401 → clear session so the UI resets to
 * the connection screen automatically.
 */
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('sessionId')
      window.location.reload()
    }
    return Promise.reject(error)
  },
)

export default apiClient
