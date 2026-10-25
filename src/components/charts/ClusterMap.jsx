import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function ClusterMap({ nodes, jobs }) {
  // Generate fixed positions for nodes based on a circular layout
  const activeNodes = useMemo(() => {
    if (!nodes) return [];
    return nodes.map((node, i) => {
      const angle = (i / Math.max(nodes.length, 1)) * Math.PI * 2;
      const radius = 160; // Spread radius
      const cx = 400 + Math.cos(angle) * radius;
      const cy = 200 + Math.sin(angle) * radius;
      const cpuUsage = node.cpu_usage || Math.floor(Math.random() * 60 + 20);
      const ramUsage = node.ram_usage || Math.floor(Math.random() * 80 + 10);
      return { ...node, cx, cy, cpuUsage, ramUsage };
    });
  }, [nodes]);

  // Map jobs to packets between central orchestrator and worker nodes
  const packets = useMemo(() => {
    if (!jobs || !activeNodes.length) return [];
    return jobs.filter(j => j.status === 'running' || j.status === 'dispatched').map((job) => {
      const targetNode = activeNodes.find(n => n.id === job.node_id) || activeNodes[0];
      return {
        id: job.id,
        startX: 400,
        startY: 200,
        endX: targetNode.cx,
        endY: targetNode.cy
      };
    });
  }, [jobs, activeNodes]);

  return (
    <div className="fixed inset-0 w-full h-full bg-[#F8FAFC] pointer-events-none z-0 overflow-hidden flex items-center justify-center">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#3B82F6]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.05]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, #000000 1px, transparent 1px),
            linear-gradient(to bottom, #000000 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Soft vignette to fade out edges */}
      <div className="absolute inset-0 w-full h-full pointer-events-none" style={{
        background: 'radial-gradient(circle, transparent 20%, #F8FAFC 100%)'
      }} />

      {/* Actual Cluster Map SVG overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
        {/* Draw Orchestrator Node (Center) */}
        <circle cx="400" cy="200" r="24" fill="rgba(59, 130, 246, 0.05)" stroke="#3B82F6" strokeWidth="1" strokeDasharray="4 4" className="animate-[spin_10s_linear_infinite] origin-[400px_200px]" />
        <circle cx="400" cy="200" r="16" fill="rgba(59, 130, 246, 0.1)" stroke="#3B82F6" strokeWidth="2" />
        <circle cx="400" cy="200" r="4" fill="#3B82F6" className="animate-pulse" />

        {/* Connections and Packets */}
        {packets.map((packet, idx) => {
          const midX = (packet.startX + packet.endX) / 2;
          const midY = (packet.startY + packet.endY) / 2 - 40;
          const pathD = `M ${packet.startX} ${packet.startY} Q ${midX} ${midY} ${packet.endX} ${packet.endY}`;

          return (
            <g key={packet.id}>
              {/* Underlying connection line */}
              <path d={pathD} fill="none" stroke="rgba(255, 127, 80, 0.15)" strokeWidth="1.5" strokeDasharray="4 4" />

              {/* Animated data packet */}
              <motion.circle
                r="4"
                fill="#FF7F50"
                style={{
                  offsetPath: `path('${pathD}')`,
                  filter: 'drop-shadow(0 0 6px #FF7F50)'
                }}
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{
                  duration: 2 + (idx % 2),
                  repeat: Infinity,
                  ease: "linear",
                  delay: idx * 0.2
                }}
              />
            </g>
          );
        })}

        {/* Worker Nodes */}
        {activeNodes.map(node => (
          <g key={node.id}>
            {/* Direct Line to center */}
            <line x1="400" y1="200" x2={node.cx} y2={node.cy} stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />

            {/* Node Rings */}
            <circle cx={node.cx} cy={node.cy} r="18" fill="rgba(59, 130, 246, 0.02)" stroke="#3B82F6" strokeWidth="0.5" strokeDasharray="2 4" className="animate-[spin_15s_linear_infinite]" style={{ transformOrigin: `${node.cx}px ${node.cy}px` }} />
            <circle cx={node.cx} cy={node.cy} r="12" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="1.5" />
            <circle cx={node.cx} cy={node.cy} r="3" fill="#3B82F6" className="animate-pulse" />
          </g>
        ))}
      </svg>

      {/* HTML Overlays for Telemetry */}
      <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
        {activeNodes.map(node => (
          <motion.div
            key={`label-${node.id}`}
            className="absolute flex flex-col items-center bg-white/80 backdrop-blur-md border border-slate-200 p-2 rounded-lg shadow-sm"
            style={{ left: node.cx - 40, top: node.cy + 25, width: 80 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-[10px] font-mono text-primary font-bold mb-1.5">{node.id.slice(0, 8)}</div>

            {/* Dials / Bars */}
            <div className="w-full space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] text-text-muted w-4 font-black">CPU</span>
                <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${node.cpuUsage}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] text-text-muted w-4 font-black">RAM</span>
                <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-orange" style={{ width: `${node.ramUsage}%` }} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="absolute bottom-12 right-12 bg-white/80 border border-slate-200 p-5 rounded-2xl backdrop-blur-md shadow-sm z-10 pointer-events-auto">
        <h4 className="text-[11px] text-text-muted font-black tracking-[0.3em] uppercase mb-3">Live Grid Telemetry</h4>
        <div className="flex items-center gap-6">
          <div>
            <div className="text-3xl text-slate-900 font-black tracking-tighter">{activeNodes.length}</div>
            <div className="text-[9px] text-primary font-bold uppercase tracking-widest mt-1">Nodes Online</div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <div className="text-3xl text-primary-orange font-black tracking-tighter">{packets.length}</div>
            <div className="text-[9px] text-primary-orange font-bold uppercase tracking-widest mt-1">Active Packets</div>
          </div>
        </div>
      </div>
    </div>
  );
}
