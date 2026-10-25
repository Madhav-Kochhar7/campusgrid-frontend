import React, { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ClockIcon, CheckCircleIcon, ArrowPathIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { useJobs, useSubmitJob } from '../hooks/useJobs'
import { useAvailableNodes } from '../hooks/useNodes'
import { JobTable } from '../components/jobs/JobTable'
import ClusterMap from '../components/charts/ClusterMap'

const generateSparklineData = (count, max) =>
  Array.from({ length: count }).map((_, i) => ({
    value: Math.max(10, Math.floor(Math.random() * max) + (i * 2))
  }))

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom, type: 'spring', stiffness: 100, damping: 15 }
  })
}

function MetricCard({ title, value, subtext, color, data, borderClass, pulseValue, delay }) {
  const displayValue = value || 0;
  return (
    <motion.div 
      custom={delay}
      initial="hidden"
      animate="visible"
      variants={itemAnim}
      className={`bg-white border border-slate-200 rounded-xl p-5 relative overflow-hidden group shadow-sm transition-all duration-300 w-48 h-[104px] shrink-0 ${borderClass}`}
    >
      {pulseValue && displayValue > 0 && (
        <div className="absolute top-1/2 left-[20%] -translate-y-1/2 w-24 h-24 bg-primary/20 blur-[40px] rounded-full animate-pulse z-0 pointer-events-none" />
      )}
      <div className="relative z-10 flex flex-col h-full justify-between">
        <h3 className="text-[11px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-4">{title}</h3>
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-1.5">
            <div className={`text-[32px] font-bold leading-none tracking-tighter ${color}`}>
              {displayValue}
            </div>
            {subtext && <p className="text-[9px] text-slate-500 tracking-wide uppercase font-bold">{subtext}</p>}
          </div>
          {data && (
            <div className="w-[60px] h-[30px] opacity-80 mix-blend-screen -mb-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id={`color-${title}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#3B82F6" fillOpacity={1} fill={`url(#color-${title})`} isAnimationActive={false} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function ActivityFeed({ jobs }) {
  if (!jobs || jobs.length === 0) return (
    <div className="text-[13px] text-slate-500 py-4 text-center italic border border-dashed border-slate-200 rounded-xl">No recent activity</div>
  )
  const events = jobs.slice(0, 5).map(j => ({
    id: j.id,
    desc: j.status === 'done' ? `Job completed` : j.status === 'running' ? `Job started` : j.status === 'failed' ? `Job failed` : `Job queued`,
    time: j.created_at,
    color: j.status === 'done' ? 'bg-green-500' : j.status === 'running' ? 'bg-primary-orange' : j.status === 'failed' ? 'bg-primary-red' : 'bg-zinc-500'
  }))
  return (
    <div className="flex items-center gap-6 overflow-x-auto custom-scrollbar pb-2">
      {events.map((event, i) => (
        <div key={`${event.id}-${i}`} className="flex items-center gap-3 shrink-0">
          <div className={`w-2 h-2 rounded-full ${event.color} shadow-[0_0_8px_currentColor]`} />
          <div className="flex flex-col">
            <p className="text-[12px] text-slate-900 font-medium">{event.desc}</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-primary font-mono tracking-tighter uppercase">{event.id.slice(0, 8)}</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{new Date(event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          {i !== events.length - 1 && <div className="w-8 h-px bg-slate-200 ml-3" />}
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const queryClient = useQueryClient()
  const { data: jobs, isLoading: jobsLoading } = useJobs()
  const { data: nodes, isLoading: nodesLoading } = useAvailableNodes()
  const { mutate: submit } = useSubmitJob()

  const [isJobsExpanded, setIsJobsExpanded] = useState(true)

  const total = jobs?.length || 0
  const running = jobs?.filter((j) => j.status === 'running' || j.status === 'dispatched').length || 0
  const completed = jobs?.filter((j) => j.status === 'done').length || 0
  const activeNodes = nodes?.length || 0

  const handleRetry = (job) => {
    submit({
      image: job.image, cpu: job.cpu, memory: job.memory, gpu: job.gpu, timeout_seconds: job.timeout_seconds,
    })
  }

  const totalData = React.useMemo(() => generateSparklineData(14, 100), [])

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Layer Z-0 */}
      <ClusterMap nodes={nodes} jobs={jobs} />

      {/* Foreground Layer Z-10 */}
      <div className="absolute inset-0 z-10 flex flex-col p-8 pointer-events-none">
        
        {/* Top Area: Overview Stats + Submit Button */}
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-6 pointer-events-auto">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 custom-scrollbar flex-1">
            <MetricCard title="Total Jobs" value={total} color="text-slate-900" data={totalData} delay={0.1} />
            <MetricCard title="Running Now" value={running} color="text-primary-orange" pulseValue={true} delay={0.2} />
            <MetricCard title="Completed" value={completed} color="text-primary" delay={0.3} />
            <MetricCard title="Active Nodes" value={activeNodes} color="text-primary" subtext="across network" delay={0.4} />
          </div>
          
          <motion.div custom={0.5} initial="hidden" animate="visible" variants={itemAnim} className="shrink-0">
            <Link
              to="/submit"
              className="inline-flex items-center justify-center px-8 py-3.5 text-[13px] font-black uppercase tracking-widest text-white transition-all bg-primary hover:bg-blue-600 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 active:scale-95"
            >
              Dispatch Job
            </Link>
          </motion.div>
        </div>

        {/* Middle Area: Recent Jobs */}
        <div className="flex-1 flex items-center pointer-events-none mt-8">
          <motion.div 
            custom={0.6} initial="hidden" animate="visible" variants={itemAnim}
            className={`bg-white/60 backdrop-blur-md border border-slate-200 shadow-sm overflow-hidden pointer-events-auto flex flex-col transition-all duration-500 ${isJobsExpanded ? 'w-[450px] rounded-2xl h-auto max-h-[500px]' : 'w-14 h-14 rounded-full cursor-pointer hover:bg-slate-100/60 justify-center items-center group'}`}
            onClick={() => !isJobsExpanded && setIsJobsExpanded(true)}
            title={!isJobsExpanded ? "Open Recent Jobs" : ""}
          >
            {isJobsExpanded ? (
              <>
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-50/50">
                  <h2 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.3em]">Recent Jobs</h2>
                  <div className="flex items-center gap-4">
                    <Link to="/jobs" className={`text-[10px] text-primary hover:text-white uppercase font-black tracking-widest transition-opacity ${isJobsExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                      View all &rarr;
                    </Link>
                    <button onClick={(e) => { e.stopPropagation(); setIsJobsExpanded(!isJobsExpanded); }} className="text-zinc-500 hover:text-slate-900 transition-colors">
                      <ChevronUpIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className={`overflow-y-auto custom-scrollbar transition-all duration-500 ease-in-out ${isJobsExpanded ? 'opacity-100 p-2' : 'opacity-0 h-0 p-0'}`}>
                  {!jobsLoading && (!jobs || jobs.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <CheckCircleIcon className="w-8 h-8 text-slate-400 mb-4" />
                      <p className="text-slate-900 font-bold text-[14px]">No recent jobs</p>
                    </div>
                  ) : (
                    <JobTable jobs={jobs?.slice(0, 5)} loading={jobsLoading} onRetry={handleRetry} />
                  )}
                </div>
              </>
            ) : (
              <div className="relative">
                <ClockIcon className="w-6 h-6 text-zinc-400 group-hover:text-slate-900 transition-colors" />
                {jobs?.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full animate-pulse border-2 border-gray-900" />
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Bottom Area: System Activity */}
        <motion.div 
          custom={0.7} initial="hidden" animate="visible" variants={itemAnim}
          className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm pointer-events-auto mt-8 flex-shrink-0"
        >
          <div className="flex flex-col md:flex-row md:items-center px-6 py-5 gap-6">
            <h2 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.3em] shrink-0">System Activity</h2>
            <div className="w-px h-8 bg-slate-200 hidden md:block" />
            <div className="flex-1 overflow-hidden">
              <ActivityFeed jobs={jobs} />
            </div>
          </div>
        </motion.div>
        
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
      `}</style>
    </div>
  )
}

