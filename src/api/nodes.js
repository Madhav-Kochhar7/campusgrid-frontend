/**
 * Compute Nodes API Service
 * =========================
 * Manages the discovery of active workers in the distributed network.
 */

import api from './axios'

/**
 * Fetches the list of all currently heartbeat-active compute nodes.
 * Used by the dashboard to visualize system health and capacity.
 */
export const getAvailableNodes = () =>
  api.get('/nodes/available').then((r) => r.data)
