/**
 * Status Visualizer Component
 * ==========================
 * A unified badge system for representing the state of jobs, 
 * nodes, and execution shards.
 * 
 * Maps internal backend status strings to standardized UI theme 
 * classes defined in the global CSS layer.
 */

import React from 'react'

/**
 * Mapping of internal status identifiers to CSS utility classes.
 * These classes (e.g., .status-running) handle background, 
 * border, and text colors.
 */
const STATUS_CLASSES = {
  queued:     'status-queued',
  dispatched: 'status-dispatched',
  running:    'status-running',
  done:       'status-done',
  failed:     'status-failed',
  expired:    'status-expired',
  partial:    'status-partial',
}

/**
 * Renders a pill-shaped badge with optional activity indicators.
 * 
 * @param {string} status - Internal state string (e.g., 'running', 'done').
 * @param {'sm' | 'lg'} size - Controls the padding and font scaling.
 */
export default function StatusBadge({ status, size = 'sm' }) {
  const cls = STATUS_CLASSES[status] || 'status-queued'
  const textSize = size === 'lg' ? 'text-sm px-3 py-1.5' : 'text-xs px-2 py-0.5'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${cls} ${textSize} uppercase tracking-wider`}>
      {/* Active state indicator for real-time running workloads */}
      {status === 'running' && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary-orange pulse-dot" />
      )}
      {status}
    </span>
  )
}
