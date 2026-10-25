/**
 * Job History & Management Page
 * =============================
 * A dedicated view for browsing, filtering, and managing the full 
 * history of cluster workloads.
 * 
 * Features:
 * - Status Filtering: Categorize jobs by Active, Completed, or Failed.
 * - Workload Cloning: Retry unsuccessful or expired jobs with identical parameters.
 * - Global Search: Integrated via the shared JobTable component.
 */

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useJobs, useSubmitJob } from '../hooks/useJobs'
import { JobTable } from '../components/jobs/JobTable'

export default function JobsPage() {
  const { data: jobs, isLoading: jobsLoading } = useJobs()
  const { mutate: submit } = useSubmitJob()
  
  // Local UI state for filtering the main list
  const [filter, setFilter] = useState('all')

  /**
   * Re-dispatches a job using the same container image and resource 
   * requirements as a previous execution attempt.
   */
  const handleRetry = (job) => {
    submit({
      image: job.image,
      cpu: job.cpu,
      memory: job.memory,
      gpu: job.gpu,
      timeout_seconds: job.timeout_seconds,
      ...(job.split_by ? { split_by: job.split_by } : {})
    })
  }

  /**
   * Logical filtering based on backend status strings.
   */
  const filteredJobs = jobs?.filter(job => {
    if (filter === 'all') return true
    // Active: Workloads currently occupying or waiting for a node
    if (filter === 'active') return ['running', 'dispatched', 'pending'].includes(job.status)
    // Completed: Successfully finalized terminal states
    if (filter === 'completed') return job.status === 'done'
    // Failed: Terminal error states or execution timeouts
    if (filter === 'failed') return ['failed', 'expired'].includes(job.status)
    return true
  }) || []

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="space-y-10 pb-12 max-w-6xl mx-auto"
    >
      {/* Header: Statistics and Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full pointer-events-none" />
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
             Workload History
             <span className="text-primary ml-1 inline-block animate-pulse text-2xl">_</span>
           </h1>
           <p className="text-[11px] text-zinc-500 mt-2 font-black uppercase tracking-[0.3em]">
             {jobs?.length || 0} grid operations detected
           </p>
        </div>
        <Link
          to="/submit"
          className="group relative inline-flex items-center gap-3 bg-primary px-8 py-3 rounded-full text-[13px] font-black uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/20"
        >
          <Plus size={18} />
          Dispatch New Job
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
        </Link>
      </motion.div>

      {/* Filter Segmented Control */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-wrap gap-3 bg-white p-1.5 rounded-[1.5rem] border border-slate-200 w-fit shadow-sm"
      >
        {['all', 'active', 'completed', 'failed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-8 py-2.5 text-[11px] rounded-2xl font-black transition-all uppercase tracking-[0.2em] relative overflow-hidden ${
              filter === f 
                ? 'text-slate-900 bg-slate-50 border border-slate-200 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {filter === f && (
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-primary-orange/10 opacity-30" />
            )}
            <span className="relative z-10">{f}</span>
          </button>
        ))}
      </motion.div>

      {/* Paginated / Scrollable Job List Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-white/60 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden"
      >
        <JobTable jobs={filteredJobs} loading={jobsLoading} onRetry={handleRetry} />
      </motion.div>
    </motion.div>
  )
}
