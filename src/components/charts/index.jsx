/**
 * Telemetry Visualization Components
 * =================================
 * Provides real-time sparkline charts for monitoring node resource consumption.
 * Optimized for high-frequency updates (WebSockets) by disabling default 
 * Recharts animations to reduce CPU overhead.
 */

import React from 'react'
import {
  Area, AreaChart, ResponsiveContainer
} from 'recharts'

/**
 * CPU Utilization Sparkline
 * Displays a percentage-based trend of processor load.
 */
export function CpuSparkline({ data, currentValue }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-accent-amber">
          {currentValue != null ? Math.round(currentValue) : '--'}
        </span>
        <span className="text-xs text-text-muted">%</span>
        <span className="text-xs text-text-muted ml-auto font-bold uppercase tracking-wider">CPU</span>
      </div>
      <ResponsiveContainer width="100%" height={60}>
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="cpu"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="url(#cpuGrad)"
            dot={false}
            // Performance: Disable animations to handle 1Hz-5Hz update streams smoothly
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * RAM Utilization Sparkline
 * Displays memory consumption with automatic unit scaling (MB to GB).
 */
export function RamSparkline({ data, currentValue }) {
  /**
   * Formats raw MB values into human-readable strings.
   */
  const formatRam = (v) => {
    if (v == null) return '--'
    if (v >= 1024) return `${(v / 1024).toFixed(1)}G`
    return `${Math.round(v)}M`
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-primary-blue">
          {formatRam(currentValue)}
        </span>
        <span className="text-xs text-text-muted ml-auto font-bold uppercase tracking-wider">RAM</span>
      </div>
      <ResponsiveContainer width="100%" height={60}>
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="ram"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#ramGrad)"
            dot={false}
            // Performance: Disable animations for high-frequency WebSocket data
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
