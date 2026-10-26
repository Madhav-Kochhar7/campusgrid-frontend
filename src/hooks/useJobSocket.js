/**
 * Simulates high-frequency hardware metrics (CPU/RAM sparklines) 
 */

import { useState, useEffect } from 'react'
import { getMockJob } from '../api/mockData.js'

export function useJobSocket(jobId) {
  const [liveData, setLiveData] = useState([])
  const [logs, setLogs] = useState([])
  const [currentStats, setCurrentStats] = useState(null)
  const [socketStatus, setSocketStatus] = useState('connecting')

  useEffect(() => {
    if (!jobId) {
      setSocketStatus('idle')
      return
    }

    const job = getMockJob(jobId)
    const isRunning = job ? job.status === 'running' : false

    // Initialize initial logs from job record
    if (job && job.logs) {
      setLogs([...job.logs])
    }

    // Initialize initial sparkline history
    const initialPoints = Array.from({ length: 15 }).map((_, i) => ({
      cpu: Math.floor(40 + Math.random() * 45),
      ram: Math.floor(4000 + Math.random() * 2500),
      t: Date.now() - (15 - i) * 2000,
    }))
    setLiveData(initialPoints)

    // Mark as connected for live view
    const connectTimer = setTimeout(() => {
      setSocketStatus(isRunning ? 'connected' : 'closed')
    }, 200)

    // If job is running, simulate periodic telemetry and streaming stdout
    let telemetryInterval = null
    if (isRunning) {
      let stepCounter = 1
      telemetryInterval = setInterval(() => {
        const cpuPct = Math.floor(55 + Math.sin(Date.now() / 3000) * 25 + Math.random() * 10)
        const ramMb = Math.floor(5800 + Math.random() * 800)

        setCurrentStats({
          cpu_used_pct: cpuPct,
          ram_used_mb: ramMb,
        })

        setLiveData((prev) => [
          ...prev.slice(-24),
          { cpu: cpuPct, ram: ramMb, t: Date.now() },
        ])

        // Add periodic stdout line
        const now = new Date().toLocaleTimeString()
        const dynamicLogs = [
          `[STREAM ${now}] Batch #${4200 + stepCounter * 15} processed in 1.84s (Loss: ${(0.42 - (stepCounter * 0.005)).toFixed(4)})`,
          `[TELEMETRY ${now}] Node health: OK | GPU Temp: ${62 + (stepCounter % 3)}°C | Fan: 64%`,
          `[CHECKPOINT ${now}] Gradient synchronization verified with orchestrator master.`,
        ]

        const nextLog = dynamicLogs[(stepCounter - 1) % dynamicLogs.length]
        setLogs((prev) => [...prev.slice(-150), nextLog])
        stepCounter += 1
      }, 3500)
    }

    return () => {
      clearTimeout(connectTimer)
      if (telemetryInterval) clearInterval(telemetryInterval)
    }
  }, [jobId])

  return { liveData, logs, currentStats, socketStatus }
}
