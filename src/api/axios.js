/**
 * Frontend-Only API Client & Token Manager
 * ========================================
 * Simulates the centralized HTTP client interface without making 
 * external network requests. Keeps state, token references, and 
 * download blob compatibility intact.
 */

// Memory-persisted token reference
let _token = null

/**
 * Updates the internal Bearer token reference.
 */
export const setToken = (t) => { _token = t }

/**
 * Retrieves the current session token.
 */
export const getToken = () => _token

/**
 * Purges the session token from memory.
 */
export const clearToken = () => { _token = null }

/**
 * Mock API client providing Axios-compatible methods for pure frontend operation.
 */
const api = {
  get: async (url, config = {}) => {
    if (url.includes('/results')) {
      const dummyData = new Blob([
        `CAMPUSGRID WORKLOAD ARTIFACT\nTimestamp: ${new Date().toISOString()}\nStatus: SUCCESS\nPayload: [Simulation output completed]`
      ], { type: 'text/plain' })
      return { data: dummyData }
    }
    return { data: {} }
  },
  post: async (url, data) => ({ data: {} }),
  delete: async (url) => ({ data: { success: true } }),
  put: async (url, data) => ({ data: {} }),
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },
}

export default api
