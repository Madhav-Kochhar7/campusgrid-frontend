/**
 * CampusGrid Application Root
 * ===========================
 * The central orchestration point for the frontend ecosystem.
 * 
 * Responsibilities:
 * - State Orchestration: Initializes TanStack Query (React Query) for server-state management.
 * - Context Nesting: Manages the hierarchy of Auth, Toast, and Router providers.
 * - Security: Enforces route-level authentication via the PrivateRoute guard.
 * - Layout: Wraps protected features in the global dashboard shell.
 */

import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SubmitJobPage from './pages/SubmitJobPage'
import JobDetailPage from './pages/JobDetailPage'
import ContributePage from './pages/ContributePage'
import JobsPage from './pages/JobsPage'
import { Spinner } from './components/ui/index'

// TanStack Query Client: Handles caching, pre-fetching, and background synchronization.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { 
      retry: 1,           // Be conservative with retries to avoid backend flooding
      staleTime: 2000     // Consider data fresh for 2 seconds
    },
  },
})

/**
 * Higher-Order Component (HOC) for protecting internal application routes.
 * Redirects unauthenticated sessions back to the login induction flow.
 */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  
  // Show a global loader while restoring the session from sessionStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  
  if (!user) return <Navigate to="/login" replace />
  return children
}

/**
 * Navigation Layout & Route Definitions
 * Defines the mapping between URLs and UI pages.
 */
function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      {/* Public: Authentication Entry Point */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      
      {/* Protected: Main Application Shell */}
      <Route
        element={
          <PrivateRoute>
             {/* The 'Layout' component provides the persistent Sidebar and Navbar */}
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard"     element={<DashboardPage />} />
        <Route path="/submit"        element={<SubmitJobPage />} />
        <Route path="/jobs"          element={<JobsPage />} />
        <Route path="/jobs/:id"      element={<JobDetailPage />} />
        <Route path="/contribute"    element={<ContributePage />} />
        
        {/* Index Redirection */}
        <Route path="/"              element={<Navigate to="/dashboard" replace />} />
      </Route>
      
      {/* Fallback: Catch-all for undefined routes */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

/**
 * Root Component: Initializes the provider forest.
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
