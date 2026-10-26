/**
 * Job Detail & Real-time Monitor Page
 * ===================================
 * The diagnostic and monitoring view for a specific execution workload.
 * 
 * Features:
 * - Real-time Logs: Live stdout/stderr stream via WebSockets.
 * - Shard Tracker: Grid visualization of individual chunks for split jobs.
 * - Resource Stats: Static and dynamic telemetry (CPU, RAM, TTL).
 * - Result Retrieval: Direct-to-browser download for successful completions.
 */

import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, HardDrive, Cpu, Clock, TerminalSquare, AlertTriangle, Download, AlignLeft, Activity } from 'lucide-react'
import { useJob } from '../hooks/useJobs'
import { useJobSocket } from '../hooks/useJobSocket'
import { Card, Spinner, Button, Badge } from '../components/ui/index'
import StatusBadge from '../components/ui/StatusBadge'
import { downloadResults } from '../api/jobs'
import { CpuSparkline, RamSparkline } from '../components/charts/index'
import api from '../api/axios'
import { motion } from 'framer-motion'


function LiveLogs({ logs }) {
  const bottomRef = React.useRef(null)

  // Auto-scroll logic
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  if (!logs || logs.length === 0) {
    return (
      <div className="h-64 bg-slate-50 border-t border-slate-200 flex items-center justify-center text-slate-500 text-sm font-mono relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.05),transparent_50%)]" />
        <span className="animate-pulse">Waiting for logs...</span>
      </div>
    )
  }

  return (
    <div className="h-96 bg-white border-t border-slate-200 overflow-y-auto p-6 font-mono text-[13px] text-slate-700 leading-relaxed scroll-smooth shadow-inner custom-scrollbar relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
      {logs.map((log, i) => {
        const isError = log.includes('ERROR') || log.includes('Exception')
        const isWarning = log.includes('WARN')
        return (
          <div key={i} className={`py-1 hover:bg-slate-100 transition-colors flex gap-4 ${
            isError ? 'text-red-700 bg-red-50/50' : 
            isWarning ? 'text-amber-700 bg-amber-50/50' : ''
          }`}>
            <span className="text-slate-400 min-w-[40px] text-right select-none opacity-50 font-bold">{i+1}</span>
            <span className="whitespace-pre-wrap">{log}</span>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}

/**
 * Small data widget for job metadata.
 */
function StatItem({ icon: Icon, label, value }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
      className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative group overflow-hidden border-l-[4px] border-l-slate-200 hover:border-l-primary transition-all duration-300"
    >
      <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity text-primary">
        <Icon size={72} />
      </div>
      <div className="text-primary bg-primary/10 p-2.5 rounded-[1rem] relative z-10 shadow-inner group-hover:scale-110 transition-transform">
        <Icon size={18} />
      </div>
      <div className="relative z-10">
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mb-1.5">{label}</p>
        <p className="text-[15px] font-black text-slate-900 font-mono tracking-tight">{value || '—'}</p>
      </div>
    </motion.div>
  )
}

/**
 * Visual grid for sharded jobs.
 * Shows the status and node assignment for every chunk in a multi-node workload.
 */
function ChunkGrid({ chunks }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
      className="bg-white border border-slate-200 rounded-3xl p-1 mt-6 relative overflow-hidden shadow-sm"
    >
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
          <Activity size={16} className="text-slate-500" />
          Real-time execution shards
          <Badge color="blue">{chunks.length} active</Badge>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2px] bg-slate-200 p-[2px]">
        {chunks.map((chunk, i) => (
          <div key={i} className="bg-white p-5 flex flex-col justify-between group hover:bg-slate-50 transition-all relative">
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                 <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Shard {String(chunk.chunk_index).padStart(2, '0')}</p>
                 {chunk.status === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] font-mono text-slate-600 overflow-hidden shadow-inner">
                 <div className="truncate opacity-70 group-hover:opacity-100 transition-opacity uppercase font-bold tracking-tighter">
                    {JSON.stringify(chunk.params || {}).replace(/[{}]/g, '') || 'DEFAULT_RUNTIME'}
                 </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto">
               <span className="text-[11px] text-slate-500 font-black font-mono tracking-tighter uppercase">{chunk.node_id ? `NODE_${chunk.node_id.slice(0,6).toUpperCase()}` : 'unassigned'}</span>
               <StatusBadge status={chunk.status} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default function JobDetailPage() {
  const { id } = useParams()
  
  // Static job data from the relational database
  const { data: job, isLoading, error } = useJob(id)
  
  // Dynamic streaming data from the telemetry hook (powered by Recharts)
  const { liveData, logs: socketLogs, currentStats, socketStatus } = useJobSocket(id)

  /**
   * Fetches results and triggers a client-side artifact download.
   */
  const handleDownload = async () => {
    try {
      await downloadResults(id)
    } catch {
      alert('Results not available yet.')
    }
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  // Error handling for non-existent or inaccessible workloads
  if (error || !job) {
    return (
      <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl max-w-lg mx-auto mt-20 shadow-sm">
        <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto mb-8 shadow-inner">
           <AlertTriangle className="text-slate-900" size={36} />
        </div>
        <h2 className="text-slate-900 text-xl font-black mb-3 uppercase tracking-tight">Access Denied</h2>
        <p className="text-slate-500 text-[13px] font-medium mb-10 px-10">This workload identifier does not exist or has been purged from the core grid.</p>
        <Link to="/dashboard">
          <Button variant="default" className="!rounded-full px-8 uppercase font-black tracking-widest text-[11px]">Back to Grid</Button>
        </Link>
      </div>
    )
  }

  // Prefer live WebSocket logs over static historical logs if available
  const displayLogs = socketLogs.length > 0 ? socketLogs : (job.logs || [])

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="space-y-8 max-w-6xl mx-auto pb-12"
    >
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-3 text-[11px] text-slate-500 hover:text-slate-900 transition-all mb-2 font-black uppercase tracking-[0.3em] group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Grid Overview
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 border-b border-slate-200 pb-10">
        <div>
          <div className="flex items-center gap-5 mb-4">
            <h1 className="text-3xl font-black text-slate-900 font-mono tracking-tighter uppercase">{job.id.slice(0, 16)}...</h1>
            <StatusBadge status={job.status} />
            {socketStatus === 'connected' && (
              <span className="flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_currentColor]" />
                Live Feed
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] select-none">WORKLOAD_SRC</span>
             <span className="bg-slate-100 px-3 py-1 rounded-full border border-slate-200 text-[12px] font-black text-slate-900 tracking-tight font-mono">{job.image}</span>
          </div>
        </div>

        {/* Action: Reveal Download button only for terminal successful state */}
        {job.status === 'done' && (
          <Button onClick={handleDownload} variant="primary" className="!rounded-full !px-8 !py-3 !text-[13px] !font-black uppercase tracking-widest shadow-2xl">
            <Download size={18} />
            Download Results
          </Button>
        )}
      </div>

      {/* Static Configuration Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem icon={Cpu} label="CPU Allotment" value={`${job.cpu} CORE`} />
        <StatItem icon={HardDrive} label="RAM Quota" value={job.memory.toUpperCase()} />
        <StatItem icon={Clock} label="TTL Limit" value={`${job.timeout_seconds}s`} />
        <StatItem icon={TerminalSquare} label="Shard Node" value={job.node_id?.toUpperCase().slice(0, 8) || 'ORCHESTRATING...'} />
      </div>

      {/* Live Telemetry Trend Cards (Recharts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
        >
          <CpuSparkline data={liveData} currentValue={currentStats?.cpu_used_pct ?? liveData[liveData.length - 1]?.cpu} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
        >
          <RamSparkline data={liveData} currentValue={currentStats?.ram_used_mb ?? liveData[liveData.length - 1]?.ram} />
        </motion.div>
      </div>

      {/* Logs Terminal Overlay */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-10 relative group"
      >
         <div className="absolute -inset-1 bg-gradient-to-b from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-md rounded-2xl" />
         <div className="relative bg-slate-200 border border-slate-300 border-b-0 rounded-t-2xl px-6 py-4 flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                 <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                 <div className="w-3 h-3 rounded-full bg-slate-400"></div>
              </div>
              <h2 className="text-slate-600 text-[11px] font-black font-mono ml-3 uppercase tracking-[0.2em] flex items-center gap-3">
                <AlignLeft size={16} className="text-slate-500" />
                orchestrator.stdout
              </h2>
           </div>
           
           <div className="flex items-center gap-3">
             {(job.status === 'running' || socketStatus === 'connected') && (
               <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-300">
                 <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                 <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Stream[80kps]</span>
               </div>
             )}
           </div>
         </div>
         
         <div className="relative rounded-b-2xl overflow-hidden border border-slate-200 border-t-0 shadow-sm">
           <LiveLogs logs={displayLogs} />
         </div>
      </motion.div>

      {/* Shard breakdown grid (visible only for multi-node jobs) */}
      {job.chunks && job.chunks.length > 0 && (
         <ChunkGrid chunks={job.chunks} />
      )}
      
      {/* Scrollbar and internal widget overrides */}
      <style>{`
         .custom-scrollbar::-webkit-scrollbar { width: 4px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: #F1F5F9; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `}</style>
    </motion.div>
  )
}
