/**
 * Jobs API Service
 * ================
 * Provides methods for interacting with the backend job scheduler.
 * All requests are routed through the synchronized 'api' (axios) instance 
 * which handles JWT headers automatically.
 */

import api from './axios'

/**
 * Dispatches a new computational workload to the grid.
 * @param {Object} payload - Job configuration (image, cpu, memory, params).
 */
export const submitJob = (payload) =>
  api.post('/jobs', payload).then((r) => r.data)

/**
 * Retrieves the full history of workloads belonging to the current user.
 */
export const getJobs = () =>
  api.get('/jobs').then((r) => r.data)

/**
 * Fetches the metadata and static logs for a specific job identifier.
 */
export const getJob = (id) =>
  api.get(`/jobs/${id}`).then((r) => r.data)

/**
 * Retrieves historical logs stored in the primary database.
 * Note: For real-time logs, use the WebSocket hook instead.
 */
export const getJobLogs = (id) =>
  api.get(`/jobs/${id}/logs`).then((r) => r.data)

/**
 * Permanently removes a job record and its associated artifacts 
 * from the grid management layer.
 */
export const deleteJob = (id) =>
  api.delete(`/jobs/${id}`).then((r) => r.data)

/**
 * Triggers a browser-level download of a job's output artifacts.
 * Handles binary stream conversion to a downloadable ZIP blob.
 */
export const downloadResults = async (id) => {
  const res = await api.get(`/jobs/${id}/results`, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = `results_${id.slice(0, 8)}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
