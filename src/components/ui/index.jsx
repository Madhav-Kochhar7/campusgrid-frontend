/**
 * Core UI Component Library
 * =========================
 * A collection of highly reusable, atomic UI primitives designed 
 * for a premium dark-mode dashboard experience.
 * 
 * Design Principles:
 * - Glassmorphism: Subtle borders and background-blur effects.
 * - Performance: Minimal re-renders through prop-drilling avoidance.
 * - Branding: Consistent use of 'primary-blue' and 'accent-pink' tokens.
 */

import React, { useState } from 'react'

/**
 * Centered loading indicator with CSS-only animation.
 * @param {'sm' | 'md' | 'lg'} size - Standardized scaling.
 */
export function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'w-4 h-4 border-[2px]' : size === 'lg' ? 'w-8 h-8 border-4' : 'w-6 h-6 border-[3px]'
  return (
    <div className={`${s} border-white/10 border-t-primary rounded-full animate-spin`} />
  )
}

/**
 * Standard content container with hover interaction.
 */
export function Card({ children, className = '' }) {
  return (
    <div className={`bg-bg-card border border-border-DEFAULT rounded-xl p-5 shadow-lg group hover:border-border-accent transition-all duration-300 ${className}`}>
      {children}
    </div>
  )
}

/**
 * Polymorphic Button component with multiple visual states.
 * 
 * @param {'default' | 'primary' | 'danger' | 'ghost'} variant - Controls the color palette.
 * @param {'sm' | 'md' | 'lg'} size - Controls padding and font size.
 */
export function Button({ children, onClick, disabled, variant = 'default', size = 'md', className = '', type = 'button' }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-blue/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' }
  const variants = {
    // Semi-transparent glass style
    default: 'bg-bg-card border border-border-DEFAULT text-text-primary hover:border-primary hover:text-white',
    // High-contrast primary action
    primary: 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/50 shadow-[0_0_20px_rgba(57,255,20,0.15)]',
    // Destructive feedback
    danger:  'bg-black border border-primary-red/50 text-primary-red hover:bg-primary-red/10',
    // Minimalist text link
    ghost:   'text-text-secondary hover:text-text-primary hover:bg-bg-hover',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </button>
  )
}

/**
 * Animated row placeholder for table data fetching states.
 */
export function SkeletonRow({ cols = 5 }) {
  return (
    <tr className="border-b border-border-DEFAULT/50 last:border-0 font-mono">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-slate-200 rounded animate-pulse" style={{ width: `${60 + (i * 17) % 40}%` }} />
        </td>
      ))}
    </tr>
  )
}

/**
 * Full-screen / Full-width overlay for null data scenarios.
 */
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in duration-500">
      {icon && <div className="text-4xl mb-4 text-text-muted opacity-50">{icon}</div>}
      <h3 className="text-text-primary text-lg font-bold mb-2">{title}</h3>
      {description && <p className="text-text-secondary text-sm mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}

/**
 * Compact semantic labels for secondary metadata.
 */
export function Badge({ children, color = 'gray' }) {
  const colors = {
    gray:   'bg-slate-100 text-slate-500 border border-slate-200',
    blue:   'bg-primary/10 text-primary border border-primary/20',
    green:  'bg-green-100 text-green-700 border border-green-200',
    amber:  'bg-primary-orange/10 text-primary-orange border border-primary-orange/20',
    purple: 'bg-slate-100 text-slate-500 border border-slate-200',
  }
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors[color] || colors.gray}`}>
      {children}
    </span>
  )
}

/**
 * Utility: Adds "Click to Copy" functionality with transient visual feedback.
 */
export function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className={`text-xs transition-all px-2.5 py-1 rounded border ${
        copied ? 'text-primary border-primary/30 bg-primary/5' : 'text-text-muted border-transparent hover:text-text-primary hover:bg-bg-hover hover:border-border-DEFAULT'
      }`}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

/**
 * Code snippet renderer with syntax highlighting container and copy action.
 */
export function CodeBlock({ code, language = '' }) {
  return (
    <div className="relative bg-slate-100 rounded-xl border border-slate-200 overflow-hidden group shadow-sm">
      {/* Header bar with meta-info and copy utility */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-200">
        <span className="text-[11px] text-text-muted font-bold tracking-widest uppercase">{language}</span>
        <CopyButton text={code} />
      </div>
      {/* Scrollable monospace viewport */}
      <pre className="p-5 text-[13px] font-mono text-text-mono overflow-x-auto whitespace-pre leading-relaxed custom-scrollbar">
        {code}
      </pre>
    </div>
  )
}
