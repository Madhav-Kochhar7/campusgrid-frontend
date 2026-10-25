/**
 * Centralized API Client
 * ======================
 * Manages all outgoing HTTP traffic to the CampusGrid backend.
 * 
 * Features:
 * - Base URL configuration via environment variables.
 * - JWT Injection: Automatically attaches 'Authorization' headers to all requests.
 * - Global Error Handling: Intercepts 401 Unauthorized responses to trigger session cleanup.
 */

import axios from 'axios'

const api = axios.create({
  // Use VITE_API_URL if defined, otherwise fallback to the production cloud endpoint (Render).
  baseURL: import.meta.env.VITE_API_URL || 'https://campusgrid-api.onrender.com',
})

// Memory-persisted token reference
let _token = null

/**
 * Updates the internal Bearer token reference for subsequent requests.
 */
export const setToken = (t) => { _token = t }

/**
 * Retrieves the current session token if available.
 */
export const getToken = () => _token

/**
 * Purges the session token from memory.
 */
export const clearToken = () => { _token = null }

/**
 * Request Interceptor:
 * Ensures every outgoing request includes the current JWT in the headers.
 */
api.interceptors.request.use((config) => {
  if (_token) config.headers.Authorization = `Bearer ${_token}`
  return config
})

/**
 * Response Interceptor:
 * Monitors for authentication failure (401). If the token has expired 
 * or been revoked, it clears the local state and redirects the user to login.
 */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearToken()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
