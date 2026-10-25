/**
 * Toast Notification System
 * =========================
 * Provides non-blocking feedback messages to the user.
 * Features auto-dismissal, concurrency limits, and smooth CSS animations.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ToastContext = createContext(null)

// Sequential ID counter for unique toast keys
let _id = 0

/**
 * Global provider for toast notifications.
 * Renders a fixed container at the bottom-right of the screen.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  /**
   * Dispatches a new toast message.
   * Automatically prunes the list to keep only the 3 most recent toasts.
   */
  const addToast = useCallback((message, type = 'info') => {
    const id = ++_id
    setToasts((prev) => {
      const newToasts = [...prev, { id, message, type }]
      // Maintain a maximum of 3 concurrent toasts to prevent UI clutter
      if (newToasts.length > 3) newToasts.shift()
      return newToasts
    })

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  /**
   * Manually dismisses a specific toast.
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Color mapping based on toast severity/purpose
  const colors = {
    success: 'bg-status-doneBg border-accent-mint/30 text-status-doneText',
    error: 'bg-status-failedBg border-accent-red/30 text-status-failedText',
    info: 'bg-status-dispatchedBg border-primary-blue/30 text-status-dispatchedText',
    warning: 'bg-status-runningBg border-accent-amber/30 text-status-runningText',
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* 
         Toast Rendering Layer
         Positioned fixed at the viewport corner.
      */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm font-medium cursor-pointer shadow-lg pointer-events-auto transform transition-all duration-300 ease-out animate-slide-in ${colors[t.type] || colors.info}`}
            onClick={() => removeToast(t.id)}
          >
            <span className="flex-1">{t.message}</span>
            <span className="opacity-60 text-xs mt-0.5 hover:opacity-100 transition-opacity">✕</span>
          </div>
        ))}
      </div>

      {/* Slide-in animation styles */}
      <style>{`
        @keyframes slide-in {
          0% { transform: translateX(120%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </ToastContext.Provider>
  )
}

/**
 * Access the toast dispatcher to show notifications.
 */
export const useToast = () => useContext(ToastContext)
