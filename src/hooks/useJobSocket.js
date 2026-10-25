/**
 * Real-time Job Monitoring Hook
 * =============================
 * Establishes a WebSocket connection to the backend to receive live updates 
 * for a specific job. 
 * 
 * Handled events:
 * - heartbeats: Used for live CPU/RAM charts.
 * - log_line: Consolidates stdout/stderr from the remote node.
 * - status_change: Invalidates React Query cache to refresh UI components.
 * - job_complete/failed: Finalizes the connection and triggers a final data refresh.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function useJobSocket(jobId) {
  const [liveData, setLiveData] = useState([])     // Data points for live resource charts
  const [logs, setLogs] = useState([])             // Consolidated remote execution logs
  const [currentStats, setCurrentStats] = useState(null)
  const [socketStatus, setSocketStatus] = useState('idle')
  const ws = useRef(null)
  const queryClient = useQueryClient()

  /**
   * Initializes the WebSocket connection.
   */
  const connect = useCallback(() => {
    if (!jobId) return
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
    const url = `${wsUrl}/ws/jobs/${jobId}`

    ws.current = new WebSocket(url)
    setSocketStatus('connecting')

    ws.current.onopen = () => setSocketStatus('connected')
    ws.current.onclose = () => setSocketStatus('closed')
    ws.current.onerror = () => setSocketStatus('error')

    ws.current.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)

        // Remote node heartbeat: Update live charts and stats
        if (msg.type === 'heartbeat') {
          setCurrentStats(msg)
          setLiveData((prev) => [
            // Keep only the last 30 data points for the trend chart
            ...prev.slice(-29),
            { cpu: msg.cpu_used_pct, ram: msg.ram_used_mb, t: Date.now() },
          ])
        }

        // New log line from the container
        if (msg.type === 'log_line') {
          // Cap log buffer at 1000 lines to prevent memory bloat
          setLogs((prev) => [...prev.slice(-999), msg.line])
        }

        // Backend signaled a high-level status change
        if (msg.type === 'status_change') {
          // Invalidate job cache so UI components (JobDetails, JobTable) update immediately
          queryClient.invalidateQueries({ queryKey: ['job', jobId] })
          queryClient.invalidateQueries({ queryKey: ['jobs'] })
        }

        // Terminal states: Refresh cache and close the connection
        if (msg.type === 'job_complete' || msg.type === 'job_failed') {
          queryClient.invalidateQueries({ queryKey: ['job', jobId] })
          queryClient.invalidateQueries({ queryKey: ['jobs'] })
          setSocketStatus('closed')
          ws.current?.close()
        }

        // Incremental progress for split/sharded jobs
        if (msg.type === 'chunk_done') {
          // Refresh job detail to update chunk progress bar
          queryClient.invalidateQueries({ queryKey: ['job', jobId] })
        }
      } catch (err) {
        // Robustness: Ignore malformed JSON messages
      }
    }
  }, [jobId, queryClient])

  // Lifecycle: Connect on mount or when jobId changes; disconnect on unmount.
  useEffect(() => {
    connect()
    return () => {
      ws.current?.close()
    }
  }, [connect])

  return { liveData, logs, currentStats, socketStatus }
}
