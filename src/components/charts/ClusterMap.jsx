import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const CENTER_X = 400;
const CENTER_Y = 225;
const RADIUS = 145;

export default function ClusterMap({ nodes, jobs }) {
  // Generate fixed positions for nodes based on a balanced circular layout
  const activeNodes = useMemo(() => {
    if (!nodes) return [];
    return nodes.map((node, i) => {
      const angle = (i / Math.max(nodes.length, 1)) * Math.PI * 2;
      const cx = CENTER_X + Math.cos(angle) * RADIUS;
      const cy = CENTER_Y + Math.sin(angle) * RADIUS;
      const cpuUsage = node.cpu_usage || Math.floor(Math.random() * 60 + 20);
      const ramUsage = node.ram_usage || Math.floor(Math.random() * 80 + 10);
      return { ...node, cx, cy, cpuUsage, ramUsage };
    });
  }, [nodes]);

  // Map active jobs to packets travelling between orchestrator and worker nodes
  const packets = useMemo(() => {
    if (!jobs || !activeNodes.length) return [];
    return jobs
      .filter((j) => j.status === 'running' || j.status === 'dispatched')
      .map((job) => {
        const targetNode = activeNodes.find((n) => n.id === job.node_id) || activeNodes[0];
        return {
          id: job.id,
          startX: CENTER_X,
          startY: CENTER_Y,
          endX: targetNode.cx,
          endY: targetNode.cy,
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
          backgroundSize: '40px 40px',
        }}
      />

      {/* Soft vignette to fade out edges */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, transparent 20%, #F8FAFC 100%)',
        }}
      />

      {/* Unified Vector Cluster Map: Nodes, Packets & Telemetry Cards */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 800 460"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Soft drop shadow for node cards */}
          <filter id="nodeCardShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="#0F172A" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Central Orchestrator Node (Compact & Balanced) */}
        <g>
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r="20"
            fill="rgba(59, 130, 246, 0.05)"
            stroke="#3B82F6"
            strokeWidth="1"
            strokeDasharray="3 3"
            className="animate-[spin_10s_linear_infinite]"
            style={{ transformOrigin: `${CENTER_X}px ${CENTER_Y}px` }}
          />
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r="12"
            fill="rgba(59, 130, 246, 0.12)"
            stroke="#3B82F6"
            strokeWidth="1.5"
          />
          <circle cx={CENTER_X} cy={CENTER_Y} r="3.5" fill="#3B82F6" className="animate-pulse" />
        </g>

        {/* Dynamic Job Packets along Curved Paths */}
        {packets.map((packet, idx) => {
          const midX = (packet.startX + packet.endX) / 2;
          const midY = (packet.startY + packet.endY) / 2 - 30;
          const pathD = `M ${packet.startX} ${packet.startY} Q ${midX} ${midY} ${packet.endX} ${packet.endY}`;

          return (
            <g key={packet.id}>
              {/* Underlying trajectory guide line */}
              <path
                d={pathD}
                fill="none"
                stroke="rgba(255, 127, 80, 0.22)"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />

              {/* Animated data packet */}
              <motion.circle
                r="3.5"
                fill="#FF7F50"
                style={{
                  offsetPath: `path('${pathD}')`,
                  filter: 'drop-shadow(0 0 5px #FF7F50)',
                }}
                initial={{ offsetDistance: '0%' }}
                animate={{ offsetDistance: '100%' }}
                transition={{
                  duration: 2 + (idx % 2),
                  repeat: Infinity,
                  ease: 'linear',
                  delay: idx * 0.25,
                }}
              />
            </g>
          );
        })}

        {/* Compute Nodes & Directly-Attached Compact Telemetry Cards */}
        {activeNodes.map((node) => (
          <g key={node.id}>
            {/* Radial Line connecting to Orchestrator */}
            <line
              x1={CENTER_X}
              y1={CENTER_Y}
              x2={node.cx}
              y2={node.cy}
              stroke="rgba(59, 130, 246, 0.12)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />

            {/* Compact Node Concentric Rings */}
            <circle
              cx={node.cx}
              cy={node.cy}
              r="14"
              fill="rgba(59, 130, 246, 0.04)"
              stroke="#3B82F6"
              strokeWidth="0.8"
              strokeDasharray="2.5 2.5"
              className="animate-[spin_15s_linear_infinite]"
              style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
            />
            <circle cx={node.cx} cy={node.cy} r="9" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="1.5" />
            <circle cx={node.cx} cy={node.cy} r="2.5" fill="#3B82F6" className="animate-pulse" />

            {/* Delicate Connector Pin linking circle to preview box */}
            <line
              x1={node.cx}
              y1={node.cy + 9}
              x2={node.cx}
              y2={node.cy + 16}
              stroke="#94A3B8"
              strokeWidth="0.8"
              strokeDasharray="1.5 1.5"
              opacity="0.8"
            />

            {/* Sleek, Compact CPU/RAM Telemetry Preview Box (72x44) */}
            <g transform={`translate(${node.cx - 36}, ${node.cy + 16})`}>
              {/* Card Container */}
              <rect
                width="72"
                height="44"
                rx="8"
                fill="#FFFFFF"
                fillOpacity="0.96"
                stroke="#E2E8F0"
                strokeWidth="0.9"
                filter="url(#nodeCardShadow)"
              />

              {/* Node ID Header */}
              <text
                x="36"
                y="13"
                textAnchor="middle"
                fill="#2563EB"
                fontSize="8.5"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                fontWeight="800"
                letterSpacing="-0.02em"
              >
                {node.id.slice(0, 8)}
              </text>

              {/* Subtle Divider */}
              <line x1="8" y1="17" x2="64" y2="17" stroke="#F1F5F9" strokeWidth="0.8" />

              {/* CPU Usage Label & Meter */}
              <text
                x="8"
                y="26"
                fill="#64748B"
                fontSize="7"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="900"
              >
                CPU
              </text>
              <rect x="25" y="21" width="39" height="4" rx="2" fill="#F1F5F9" />
              <rect
                x="25"
                y="21"
                width={(39 * Math.min(node.cpuUsage, 100)) / 100}
                height="4"
                rx="2"
                fill="#3B82F6"
              />

              {/* RAM Usage Label & Meter */}
              <text
                x="8"
                y="37"
                fill="#64748B"
                fontSize="7"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="900"
              >
                RAM
              </text>
              <rect x="25" y="32" width="39" height="4" rx="2" fill="#F1F5F9" />
              <rect
                x="25"
                y="32"
                width={(39 * Math.min(node.ramUsage, 100)) / 100}
                height="4"
                rx="2"
                fill="#FF7F50"
              />
            </g>
          </g>
        ))}
      </svg>

      {/* Floating Network Telemetry Summary (Positioned above bottom activity bar) */}
      <div className="absolute bottom-28 right-8 bg-white/90 border border-slate-200 p-4 rounded-2xl backdrop-blur-md shadow-sm z-10 pointer-events-auto">
        <h4 className="text-[10px] text-slate-500 font-black tracking-[0.25em] uppercase mb-2">
          Live Grid Telemetry
        </h4>
        <div className="flex items-center gap-5">
          <div>
            <div className="text-2xl text-slate-900 font-black tracking-tight">{activeNodes.length}</div>
            <div className="text-[9px] text-primary font-bold uppercase tracking-wider mt-0.5">
              Nodes Online
            </div>
          </div>
          <div className="w-px h-7 bg-slate-200" />
          <div>
            <div className="text-2xl text-primary-orange font-black tracking-tight">{packets.length}</div>
            <div className="text-[9px] text-primary-orange font-bold uppercase tracking-wider mt-0.5">
              Active Packets
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
