/**
 * Grid Access & Authentication Page
 * =================================
 * The entry point for all users. Provides a simplified, role-based login 
 * experience to distinguish between workload submitters and hardware contributors.
 * 
 * Features:
 * - Role-based Selection: Pre-configured access for Researchers and Contributors.
 * - Session Induction: Synchronizes with AuthContext to initialize application state.
 * - Premium UI: Implements animated background particles and glow-aware buttons.
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cpu, Zap, LayoutGrid, Shield, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { mockLogin } from '../api/auth'
import { Spinner } from '../components/ui/index'

export default function LoginPage() {
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  /**
   * Orchestrates the login flow using mock credentials.
   * Dispatches the session to the AuthContext and redirects to the dashboard.
   */
  const handleLogin = async (role) => {
    setLoading(role)
    setError('')
    try {
      // Mapping roles to predefined test accounts
      const email = role === 'submitter' ? 'student@campus.edu' : 'node@campus.edu'
      const { access_token: token, user } = await mockLogin(email, role)
      
      // Initialize global auth state
      login(token, user)
      
      // Navigate to the main application shell
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* 
         Ambient Background Layer:
         Provides depth through blurred gradients and a subtle dot grid pattern.
      */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[140px] rounded-full animate-pulse delay-1000" />
        <div 
          className="absolute inset-0 opacity-5" 
          style={{ 
            backgroundImage: `radial-gradient(#000000 1px, transparent 1px)`, 
            backgroundSize: '40px 40px' 
          }} 
        />
      </div>

      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in duration-700">
        {/* Branding Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-white border border-slate-200 shadow-sm mb-8 relative group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
             <Cpu size={40} className="text-primary relative z-10 transition-transform group-hover:scale-110 duration-500" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            CampusGrid
            <span className="text-primary ml-1 inline-block animate-bounce text-2xl">.</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-4 font-black uppercase tracking-[0.4em] opacity-80">Distributed Intelligence</p>
        </div>

        {/* Login Selection Card */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="space-y-6 relative z-10">
            {/* Transient error display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs py-3 px-4 rounded-xl text-center font-bold animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="space-y-4">
               {/* Role 1: Researcher (Submitter) */}
                 <button
                 onClick={() => handleLogin('submitter')}
                 disabled={loading !== null}
                 className="w-full flex items-center justify-between p-6 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-primary/30 rounded-2xl transition-all group/btn disabled:opacity-50"
               >
                 <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 group-hover/btn:bg-primary/10 flex items-center justify-center text-primary group-hover/btn:scale-110 transition-all">
                       {loading === 'submitter' ? <Spinner size="sm" /> : <Zap size={22} />}
                    </div>
                    <div className="text-left font-mono">
                       <p className="text-[15px] font-black text-slate-900 uppercase tracking-tight">Researcher</p>
                       <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Run remote jobs</p>
                    </div>
                 </div>
                 <ChevronRight size={18} className="text-slate-400 group-hover/btn:text-primary transition-colors" />
               </button>

               {/* Role 2: Contributor (Node Provider) */}
               <button
                 onClick={() => handleLogin('contributor')}
                 disabled={loading !== null}
                 className="w-full flex items-center justify-between p-6 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-primary/30 rounded-2xl transition-all group/btn disabled:opacity-50"
               >
                 <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 group-hover/btn:bg-primary/10 flex items-center justify-center text-primary group-hover/btn:scale-110 transition-all">
                       {loading === 'contributor' ? <Spinner size="sm" /> : <LayoutGrid size={22} />}
                    </div>
                    <div className="text-left font-mono">
                       <p className="text-[15px] font-black text-slate-900 uppercase tracking-tight">Contributor</p>
                       <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Lend compute power</p>
                    </div>
                 </div>
                 <ChevronRight size={18} className="text-slate-400 group-hover/btn:text-primary transition-colors" />
               </button>
            </div>

            {/* Platform Trust Badge */}
            <div className="pt-6 flex items-center justify-center gap-3">
              <Shield size={16} className="text-slate-400" />
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Secure Node Authentication</p>
            </div>
          </div>
        </div>

        {/* System Version Footer */}
        <div className="flex justify-center items-center gap-4 mt-12 opacity-50">
           <div className="h-px w-10 bg-slate-300" />
           <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">v1.2.0-STABLE</p>
           <div className="h-px w-10 bg-slate-300" />
        </div>
      </div>
    </div>
  )
}
