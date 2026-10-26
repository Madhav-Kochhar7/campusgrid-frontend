/**
 * Frontend-Only Nodes Service
 * ===========================
 * Provides discovery data for distributed campus worker nodes.
 */

import { MOCK_NODES } from './mockData.js'

/**
 * Fetches the list of active compute nodes across the campus grid.
 */
export const getAvailableNodes = async () => {
  // Simulate rapid local network response
  return Promise.resolve([...MOCK_NODES])
}
