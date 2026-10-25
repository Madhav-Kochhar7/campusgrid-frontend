/**
 * Grid Membership Hooks
 * =====================
 * Manages the fetching and synchronization of active compute nodes 
 * across the campus network.
 */

import { useQuery } from '@tanstack/react-query'
import { getAvailableNodes } from '../api/nodes'

/**
 * Fetches the current list of online and available compute nodes.
 * Used primarily by the dashboard NodeGrid component.
 */
export function useAvailableNodes() {
  return useQuery({
    queryKey: ['nodes'],
    queryFn: getAvailableNodes,
    // Automatic polling is disabled to save backend resources. 
    // Nodes are refreshed on component mount or manual trigger.
    refetchInterval: false,      
    staleTime: 0,                // Always treat data as stale to ensure fresh fetches
  })
}
