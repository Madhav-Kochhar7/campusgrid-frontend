/**
 * Job Data Management Hooks
 * =========================
 * Provides unified access to job data using TanStack Query.
 * Includes hooks for listing all jobs, fetching a single job's details, 
 * and submitting new compute tasks to the grid.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getJobs, getJob, submitJob } from '../api/jobs'
import { useToast } from '../context/ToastContext'

/**
 * Hook to fetch and synchronize the list of all historic and active jobs.
 */
export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: getJobs,
    // Safely poll the backend every 3 seconds to keep the dashboard live.
    // This provides fallback reactivity even if WebSockets fail.
    refetchInterval: 3000,
    // CRITICAL: Ensure the dashboard stays live even when the window is not 
    // focused (e.g. while the user is monitoring logs in a terminal).
    refetchIntervalInBackground: true,
  })
}

/**
 * Hook to fetch static details for a specific job.
 * Note: Live metrics (CPU/RAM) are handled separately via useJobSocket.
 */
export function useJob(id) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => getJob(id),
    // Poll every 3 seconds so status transitions (queued → dispatched → running → done)
    // are reflected in the UI even when the WebSocket connection is unavailable.
    // Polling stops automatically once the job reaches a terminal state.
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'done' || status === 'failed') return false
      return 3000
    },
    refetchIntervalInBackground: true,
    staleTime: 5000,             // Allow short-lived cache to reduce flicker
    enabled: !!id,               // Prevent query execution if no ID is provided
  })
}

/**
 * Hook to handle the submission of new jobs.
 * Manages the transition from form submission to active monitoring.
 */
export function useSubmitJob() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { addToast } = useToast()

  return useMutation({
    mutationFn: submitJob,
    onSuccess: (data) => {
      // Invalidate the jobs list so the new entry appears immediately
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      addToast('Job submitted successfully!', 'success')
      
      // Auto-navigate to the detailed monitoring view for the new job
      navigate(`/jobs/${data.job_id}`)
    },
    onError: (err) => {
      // Extract backend error message if available
      const errMsg = err.response?.data?.detail || 'Failed to submit job'
      addToast(errMsg, 'error')
    },
  })
}
