/**
 * Main Application Sidebar
 * ========================
 * The primary navigation anchor for the CampusGrid dashboard. 
 * Handles routing links, user identity display, and session termination.
 * 
 * Layouts:
 * - Desktop: Sticky sidebar with support for full/collapsed states.
 * - Mobile: Top-bar branding with overflow navigation (if implemented).
 */

import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Squares2X2Icon,
  PlusCircleIcon,
  ClockIcon,
  CpuChipIcon,
  ArrowRightOnRectangleIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'

export default function Sidebar() {
  const { logout, user } = useAuth()

  // Local state for toggling between broad and compact desktop views
  const [collapsed, setCollapsed] = React.useState(false)

  /**
   * Primary site-wide navigation map.
   */
  const links = [
    { to: '/dashboard', icon: Squares2X2Icon, label: 'Overview' },
    { to: '/submit', icon: PlusCircleIcon, label: 'Submit job' },
    { to: '/jobs', icon: ClockIcon, label: 'Job history' },
    { to: '/contribute', icon: CpuChipIcon, label: 'Contribute' },
  ]

  return (
    <>
      {/* Mobile-Only Header Bar */}
      <div className="md:hidden h-14 w-full bg-white border-b border-slate-200 fixed top-0 z-40 flex items-center px-4">
        <CpuChipIcon className="w-5 h-5 text-primary mr-3" />
        <span className="font-semibold text-slate-900">CampusGrid</span>
      </div>

      {/* Primary Desktop / Heavy Tablet Sidebar */}
      <motion.aside 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.0, type: 'spring', stiffness: 100, damping: 15 }}
        className={`
        fixed md:sticky top-0 left-0 z-50 h-screen transition-[width] duration-300
        bg-white border-r border-slate-200
        ${collapsed ? 'w-16' : 'w-[220px]'}
        hidden md:flex flex-col
      `}>
        {/* Branding Area: App Logo and Versioning */}
        <div className="flex flex-col px-4 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-slate-50 rounded shadow-inner flex items-center justify-center shrink-0 border border-primary/20 shadow-sm">
              <CpuChipIcon className="w-4 h-4 text-primary" />
            </div>
            {!collapsed && (
              <span className="font-bold text-slate-900 text-xl tracking-tight truncate">CampusGrid</span>
            )}
          </div>
          {!collapsed && (
            <div className="pl-[2.75rem]">
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">v1.0 · BETA</span>
            </div>
          )}
        </div>

        {/* Global Navigation Engine */}
        <nav className="flex-1 px-3 space-y-1.5 mt-4 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group border border-transparent
                ${isActive
                  // Active State: Glass background with primary neon accent
                  ? 'bg-primary/10 text-primary font-bold border-l-[2px] !border-l-primary'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-200'
                }`
              }
            >
              <link.icon className={`shrink-0 w-5 h-5 transition-colors ${window.location.pathname.startsWith(link.to) ? 'text-primary' : 'text-slate-500 group-hover:text-slate-900'}`} />
              {!collapsed && <span className="truncate">{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* UX: Breadcrumb/Shell Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors border-t border-slate-200 hover:bg-slate-100"
        >
          <CommandLineIcon className="w-5 h-5" />
          {!collapsed && <span>Toggle Sidebar</span>}
        </button>

        {/* Identity & Session Management Section */}
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          {user && (
            <div className={`flex items-center gap-3 px-2 mb-4 mt-2 ${collapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-primary/20 relative shadow-sm">
                {/* Real-time status indicator (pulsing mint dot) */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white"></span>
                <span className="text-sm font-medium text-primary">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <p className="text-[11px] text-slate-400 capitalize">Node: online</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={logout}
            className={`flex items-center gap-3 p-2 rounded-lg text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
            title="Sign out"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </motion.aside>
    </>
  )
}
