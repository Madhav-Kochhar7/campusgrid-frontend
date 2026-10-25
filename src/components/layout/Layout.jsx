/**
 * Global Application Shell
 * ========================
 * The master layout component that wraps all authenticated routes.
 * 
 * Logic:
 * - Persistent Sidebar: Provides high-level navigation.
 * - Dynamic Content: Uses React Router's <Outlet /> to render the active page.
 * - Responsive Viewport: Handles mobile padding and desktop sidebar integration.
 */

import React from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import Sidebar from './Sidebar'

export default function Layout() {
  const location = useLocation()
  
  // Basic breadcrumb generation
  const pathnames = location.pathname.split('/').filter((x) => x)

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation Layer */}
      <Sidebar />
      
      {/* Content Layer */}
      <main className="flex-1 min-w-0 flex flex-col pt-14 md:pt-0">
        {/* Sleek Top Header with Breadcrumbs */}
        <header className="h-14 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 hidden md:flex items-center px-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <div>
                  <Link to="/" className="text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">
                    CampusGrid
                  </Link>
                </div>
              </li>
              {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join('/')}`
                const isLast = index === pathnames.length - 1
                return (
                  <li key={to}>
                    <div className="flex items-center">
                      <ChevronRightIcon className="h-4 w-4 text-slate-300 flex-shrink-0" aria-hidden="true" />
                      <Link
                        to={to}
                        className={`ml-2 text-sm font-medium capitalize transition-colors ${
                          isLast ? 'text-primary' : 'text-slate-500 hover:text-slate-900'
                        }`}
                        aria-current={isLast ? 'page' : undefined}
                      >
                        {value}
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ol>
          </nav>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 lg:px-8 w-full flex-1">
          {/* React Router Outlet for child pages */}
          <Outlet />
        </div>
      </main>
    </div>
  )
}
