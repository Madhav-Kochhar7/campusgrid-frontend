/**
 * Global Authentication Context
 * ===========================
 * Manages user sessions, JWT tokens, and identity state across the application.
 * Synchronizes with the Axios client to ensure all requests are authenticated.
 */

import React, { createContext, useContext, useState, useEffect } from 'react'
import { setToken, clearToken } from '../api/axios'

const AuthContext = createContext(null)

/**
 * High-level provider that wraps the app to provide auth state.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setTokenState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check sessionStorage for persisted session on initial mount
    try {
      const saved = sessionStorage.getItem('cg_session')
      if (saved) {
        const { token: t, user: u, exp } = JSON.parse(saved)
        // Only restore if the token has not yet expired
        if (exp && Date.now() < exp * 1000) {
          setTokenState(t)
          setUser(u)
          setToken(t)
        } else {
          // Clean up stale or expired sessions
          sessionStorage.removeItem('cg_session')
        }
      }
    } catch (e) {
      // JSON parse failures or missing fields are ignored
    }
    setLoading(false)
  }, [])

  /**
   * Initializes a new session after successful login.
   * Stores the token in state, Axios headers, and persistent storage.
   */
  const login = (token, user) => {
    setTokenState(token)
    setUser(user)
    setToken(token)

    // Decode JWT payload to find expiration time
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      sessionStorage.setItem('cg_session', JSON.stringify({
        token, user, exp: payload.exp
      }))
    } catch (e) {
      // Fallback if JWT parsing fails (non-standard token)
      sessionStorage.setItem('cg_session', JSON.stringify({ token, user }))
    }
  }

  /**
   * Clears all session data and redirects the application to an unauthenticated state.
   */
  const logout = () => {
    setTokenState(null)
    setUser(null)
    clearToken()
    sessionStorage.removeItem('cg_session')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Access the current user session and authentication primitives.
 */
export const useAuth = () => useContext(AuthContext)
