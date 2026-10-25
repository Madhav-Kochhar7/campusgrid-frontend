/**
 * Job Submission Form
 * ===================
 * The primary interface for dispatching containers to the grid.
 * 
 * Features:
 * - Resource Presets: Pre-configured CPU/Memory profiles (Light, Standard, Heavy).
 * - Parallel Orchestration: Option to split jobs into shards for multi-node execution.
 * - Live Templates: Real-time code previews for Dockerfiles and shard mapping.
 * - Advanced Config: Fine-grained control over GPU, Timeouts, and Env Vars.
 */

import React, { useState } from 'react'
import { ChevronDownIcon, CubeIcon, Cog6ToothIcon, BoltIcon, ArrowPathIcon, ChevronRightIcon, ShieldCheckIcon, Squares2X2Icon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { Button, CodeBlock, Badge, Spinner } from '../ui/index'
import { useSubmitJob } from '../../hooks/useJobs'

// Reference template for a standard Job Dockerfile
const DOCKERFILE_TEMPLATE = `FROM python:3.11-slim
WORKDIR /job
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY script.py .
CMD ["python", "script.py"]
# Write all outputs to /job/output/`

// Reference template for accessing shard variables in user scripts
const SPLIT_VARS_TEMPLATE = `# For split jobs, read from env:
import os
start = int(os.environ.get("CHUNK_START", 0))
end   = int(os.environ.get("CHUNK_END", 100000))
idx   = int(os.environ.get("CHUNK_INDEX", 0))
total = int(os.environ.get("CHUNK_TOTAL", 1))`

export default function JobSubmitForm() {
  // TanStack Mutation hook for job submission
  const { mutate: submit, isPending } = useSubmitJob()

  // Form State
  const [image, setImage] = useState('')
  const [cpu, setCpu] = useState(2)
  const [memory, setMemory] = useState('4g')
  const [gpu, setGpu] = useState(false)
  const [timeout, setTimeoutVal] = useState(3600)
  const [numChunks, setNumChunks] = useState(4)
  const [strategy, setStrategy] = useState('distributed')
  const [advOpen, setAdvOpen] = useState(false)
  const [splitEnabled, setSplitEnabled] = useState(false)
  const [preset, setPreset] = useState(1)

  // Pre-defined resource configurations
  const presets = [
    { name: 'Light', cpu: 1, mem: '2g', desc: 'Web apps, scripts' },
    { name: 'Standard', cpu: 4, mem: '8g', desc: 'CI/CD, API' },
    { name: 'Heavy', cpu: 8, mem: '16g', desc: 'ML Training, Big Data' }
  ]

  /**
   * Constructs the final API payload based on form state and sharding options.
   */
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!image) return
    const payload = { 
      image, cpu, memory, gpu, 
      timeout_seconds: timeout 
    }
    // Inject splitting configuration if multi-node is enabled
    if (splitEnabled) {
      payload.split_by = { strategy, num_chunks: numChunks }
    }
    submit(payload)
  }

  /**
   * Quickly applies a preset configuration to the form state.
   */
  const applyPreset = (p, i) => {
    setCpu(p.cpu)
    setMemory(p.mem)
    setPreset(i)
  }

  return (
    <div className="max-w-6xl">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-10">
          {/* Section: Core Container Identity */}
          <div className="space-y-6">
            <label className="block text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2 px-1">Container Image</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                <CubeIcon className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="e.g. library/ubuntu:latest"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-3xl pl-14 pr-6 py-5 text-[15px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all font-mono shadow-sm"
                required
              />
            </div>
            
            {/* Section: Resource Profile */}
            <div className="pt-8">
               <label className="block text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8 px-1">Resource Profile</label>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {presets.map((p, i) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => applyPreset(p, i)}
                      className={`relative flex flex-col p-6 rounded-3xl border transition-all text-left group overflow-hidden ${
                        preset === i 
                        ? 'border-primary/50 bg-primary/5 shadow-none' 
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      <div className={`absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-125 ${preset === i ? 'opacity-100' : 'opacity-0'}`} />
                      <p className={`text-[15px] font-black tracking-tight mb-2 ${preset === i ? 'text-primary' : 'text-slate-500'}`}>
                        {p.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-4">{p.cpu} vCPU &bull; {p.mem}</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{p.desc}</p>
                    </button>
                  ))}
               </div>
            </div>
          </div>

          {/* Section: Parallel Orchestration (Sharding) */}
          <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors" />
             
             <div className="flex items-center justify-between mb-10">
                <div>
                   <h3 className="text-[15px] font-black text-slate-900 uppercase tracking-tight">Parallel Orchestration</h3>
                   <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">Multi-node execution</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSplitEnabled(!splitEnabled)}
                  className={`w-14 h-7 relative flex items-center rounded-full transition-all cursor-pointer border-2 ${splitEnabled ? 'bg-primary/20 border-primary/50' : 'bg-slate-200 border-slate-300'}`}
                >
                  <span className={`absolute left-1 w-4 h-4 rounded-full transition-all shadow-xl ${splitEnabled ? 'translate-x-7 bg-primary shadow-none' : 'translate-x-0 bg-white'}`} />
                </button>
             </div>

             <div className={`transition-all duration-700 ease-in-out overflow-hidden ${splitEnabled ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none scale-95'}`}>
                <div className="space-y-10">
                   <div>
                      <label className="flex items-center justify-between mb-6 group-hover:text-slate-900 transition-colors">
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Distribution Strategy</span>
                        <Badge color={strategy === 'distributed' ? 'blue' : 'gray'}>{strategy}</Badge>
                      </label>
                      <div className="flex p-2 bg-slate-200 rounded-2xl border border-slate-300 shadow-inner">
                         {['distributed', 'concentrated'].map((val) => (
                           <button
                             key={val}
                             type="button"
                             onClick={() => setStrategy(val)}
                             className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${
                               strategy === val 
                               ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                               : 'text-slate-500 hover:text-slate-700'
                             }`}
                           >
                             {val}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div>
                      <label className="flex items-center justify-between mb-6">
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Target Shards</span>
                        <span className="text-[11px] font-mono text-primary font-black tracking-tighter">{numChunks} CLUSTERS</span>
                      </label>
                      <div className="grid grid-cols-4 gap-4">
                         {[2, 4, 8, 16].map((n) => (
                           <button
                             key={n}
                             type="button"
                             onClick={() => setNumChunks(n)}
                             className={`h-14 rounded-2xl text-[13px] font-black transition-all border-2 ${
                               numChunks === n 
                               ? 'border-primary/50 bg-primary/10 text-primary shadow-sm' 
                               : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                             }`}
                           >
                             {n}
                           </button>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Section: Advanced Settings Toggle */}
          <div className="border border-slate-200 rounded-3xl bg-slate-50 overflow-hidden transition-all duration-500 group">
             <button
               type="button"
               onClick={() => setAdvOpen(!advOpen)}
               className="w-full flex items-center justify-between p-6 hover:bg-slate-100 transition-colors outline-none"
             >
               <div className="flex items-center gap-4">
                  <Cog6ToothIcon className={`w-5 h-5 ${advOpen ? 'text-primary-orange' : 'text-slate-500'}`} />
                  <span className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 group-hover:text-slate-700 transition-colors">Advanced Orchestration</span>
               </div>
               <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 ${advOpen ? 'bg-primary-orange/10 rotate-180 shadow-inner' : 'bg-slate-200'}`}>
                 <ChevronDownIcon className={`w-5 h-5 ${advOpen ? 'text-primary-orange' : 'text-slate-500'}`} />
               </div>
             </button>
             
             <div className={`transition-all duration-700 ease-in-out ${advOpen ? 'max-h-[600px] opacity-100 border-t border-slate-200' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div>
                      <label className="block text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 px-1">Timeout Policy (sec)</label>
                      <input
                        type="number"
                        value={timeout}
                        onChange={(e) => setTimeoutVal(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-900 focus:outline-none focus:border-primary-orange/30 transition-all font-mono shadow-sm"
                      />
                   </div>
                   <div className="flex items-end">
                      <div className="w-full">
                        <label className="block text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 px-1">GPU Acceleration</label>
                        <button
                          type="button"
                          onClick={() => setGpu(!gpu)}
                          className={`w-full h-[56px] rounded-2xl border-2 flex items-center justify-between px-6 transition-all ${gpu ? 'bg-primary-orange/10 border-primary-orange/30 text-primary-orange shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                        >
                           <span className="text-[13px] font-black uppercase tracking-widest">Enable Compute</span>
                           {gpu ? <CheckCircleIcon className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />}
                        </button>
                      </div>
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 px-1">Runtime Environment Inject (JSON)</label>
                      <textarea
                        placeholder='{"ENV_VAR": "value"}'
                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-5 text-[13px] text-slate-900 font-mono focus:outline-none focus:border-primary-orange/30 resize-none h-28 italic scrollbar-hide shadow-sm"
                      />
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar: Status and Live Previews */}
        <div className="space-y-8 lg:sticky lg:top-28 self-start">
           {/* Submission Protocol Infographic */}
            <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full -mr-16 -mt-16" />
              <h3 className="text-[13px] font-black text-slate-900 mb-8 flex items-center gap-4 uppercase tracking-[0.2em]">
                <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_#30A0E0] animate-pulse"/>
                Protocol
              </h3>
              <div className="space-y-6">
                {[
                  'Image resolution & verification',
                  'Distributed shard allocation',
                  'Sandboxed execution layer',
                  'Encrypted output retrieval',
                ].map((step, i) => (
                  <div key={i} className="flex gap-4 items-start group/step">
                    <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-500 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 group-hover/step:border-primary/50 group-hover/step:text-primary transition-all shadow-sm">
                      0{i + 1}
                    </div>
                    <p className="text-[13px] text-slate-500 font-bold leading-relaxed group-hover/step:text-slate-700 transition-colors uppercase tracking-tight">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
           </div>

           {/* Dockerfile Preview */}
           <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                 <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Runtime Config</p>
                 <Badge color="gray">Dockerfile</Badge>
              </div>
              <CodeBlock code={DOCKERFILE_TEMPLATE} language="dockerfile" />
           </div>
           
           {/* Shard Mapper Preview (Visible only when splitting is enabled) */}
            <div className={`space-y-4 transition-all duration-700 ${splitEnabled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <div className="flex items-center justify-between px-2">
                 <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em]">Shard Mapper</p>
                 <Badge color="blue">vGrid4</Badge>
              </div>
              <CodeBlock code={SPLIT_VARS_TEMPLATE} language="python" />
           </div>

           {/* Final Submission Button */}
           <div className="pt-6">
              <Button
                type="submit"
                variant="primary"
                disabled={isPending || !image}
                className="w-full h-[72px] !rounded-[2rem] !text-[16px] !font-black uppercase tracking-[0.25em] !shadow-none hover:!shadow-none active:!scale-95 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10 flex items-center justify-center gap-4 text-white">
                  {isPending ? (
                    <>
                      <Spinner size="sm" />
                      Wait...
                    </>
                  ) : (
                    <>
                      Dispatch
                      <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                    </>
                  )}
                </div>
              </Button>
              <div className="flex items-center justify-center gap-3 mt-6 text-slate-500">
                <ShieldCheckIcon className="w-4 h-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Verified Cluster Node v4.2</p>
              </div>
           </div>
        </div>
      </form>

      {/* Embedded styles for specific component behaviors */}
      <style>{`
         .custom-scrollbar::-webkit-scrollbar { width: 4px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
      `}</style>
    </div>
  )
}
