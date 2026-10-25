/**
 * Compute Node Visualization Components
 * =====================================
 * Dashboard widgets for monitoring the health and status of individual 
 * compute nodes (laptops/servers) currently connected to the grid.
 */

import React from 'react'

/**
 * Individual Node Status Card.
 * Displays real-time resource utilization (CPU/RAM) and current job status.
 */
function NodeCard({ node }) {
  // A node is idle if it has no current_job_id assigned
  const isAvailable = node.current_job_id === null
  
  // Calculate percentage of resources consumed based on reported telemetry
  const cpuPct = 100 - (node.free_cpu_pct || 100)
  const ramPct = Math.round(((node.total_ram_mb - node.free_ram_mb) / node.total_ram_mb) * 100) || 0

  return (
    <div className={`bg-bg-card border-l-[3px] border-y border-r border-y-border-DEFAULT border-r-border-DEFAULT rounded-xl p-5 shadow-lg transition-colors group relative overflow-hidden ${
      isAvailable ? 'border-l-border-accent hover:bg-bg-hover' : 'border-l-accent-amber bg-[#131B2E] shadow-[inset_0_0_15px_rgba(245,158,11,0.05)]'
    }`}>
      {/* Visual background flare for active processing nodes */}
      {!isAvailable && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-amber/5 blur-[50px] -mr-10 -mt-10 rounded-full" />
      )}
      
      {/* Node Header: Hostname and Hardware Capabilities */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-text-primary font-mono tracking-tight truncate w-3/4">
          {node.hostname || node.node_id?.slice(0, 8) || 'Unknown'}
        </h3>
        {node.has_gpu && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple border border-accent-purple/30">
            GPU
          </span>
        )}
      </div>

      {/* Online Status Indicator */}
      <div className="flex items-center gap-2 mb-5">
        <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-text-secondary' : 'bg-status-runningText pulse-dot'}`} />
        <p className={`text-[12px] font-medium tracking-wide ${isAvailable ? 'text-text-secondary' : 'text-status-runningText'}`}>
          {isAvailable ? 'idle' : `running job`}
        </p>
      </div>

      {/* Resource Utilization Meters */}
      <div className="space-y-4 mb-3 relative z-10">
        {/* CPU Usage Bar */}
        <div>
          <div className="flex justify-between text-[11px] text-text-secondary mb-1.5 font-medium tracking-wider">
            <span>CPU</span>
            <span className="font-mono">{Math.round(cpuPct)}%</span>
          </div>
          <div className="w-full h-[5px] bg-bg-page rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-accent-amber/70 to-accent-amber transition-all" style={{ width: `${cpuPct}%` }} />
          </div>
        </div>
        
        {/* RAM Usage Bar */}
        <div>
          <div className="flex justify-between text-[11px] text-text-secondary mb-1.5 font-medium tracking-wider">
            <span>RAM</span>
            <span className="font-mono">{ramPct}%</span>
          </div>
          <div className="w-full h-[5px] bg-bg-page rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-primary-blue/70 to-primary-blue transition-all" style={{ width: `${ramPct}%` }} />
          </div>
        </div>
      </div>

      {/* Hardware Details Footer */}
      {node.has_gpu && node.gpu_model ? (
        <p className="text-[11px] text-text-muted truncate mt-4 pt-3 border-t border-border-DEFAULT/50" title={node.gpu_model}>{node.gpu_model}</p>
      ) : (
        <div className="h-4 mt-4 pt-3 border-t border-border-DEFAULT/50"></div>
      )}
    </div>
  )
}

/**
 * Grid layout for multiple compute nodes.
 * Handles loading skeletons and empty states.
 */
export function NodeGrid({ nodes, loading }) {
  // Render loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[180px] bg-bg-hover border border-border-DEFAULT rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  // Render empty state if no nodes are online
  if (!nodes || nodes.length === 0) {
    return (
      <div className="bg-bg-card border border-border-DEFAULT rounded-xl flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-text-secondary text-sm font-medium">No active nodes</p>
          <p className="text-text-muted text-xs mt-2 hover:text-text-primary transition-colors cursor-pointer border-b border-border-DEFAULT inline-block pb-0.5">Contribute your laptop →</p>
        </div>
      </div>
    )
  }

  // Render responsive grid of NodeCards
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {nodes.map((node) => (
        <NodeCard key={node.node_id} node={node} />
      ))}
    </div>
  )
}
