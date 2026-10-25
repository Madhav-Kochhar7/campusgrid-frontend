/**
 * Job Dispatch Portal
 * ===================
 * The primary entry point for researchers to submit computational workloads 
 * to the distributed campus network.
 * 
 * This page serves as a high-level wrapper for the JobSubmitForm, 
 * providing context on the isolation (containerization) and 
 * distribution (parallel chunks) logic of the platform.
 */

import React from 'react'
import { motion } from 'framer-motion'
import JobSubmitForm from '../components/jobs/JobSubmitForm'

export default function SubmitJobPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="space-y-8 pb-10"
    >
      {/* Page Header: Value Proposition and Service Description */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Submit Job</h1>
        <p className="text-[13px] text-slate-500 mt-2 max-w-2xl leading-relaxed">
          Your code will be packaged into a container and distributed to an available node in the campus grid. 
          For intensive tasks, enable parallel execution to split the workload across multiple physical machines.
        </p>
      </div>

      {/* Main Submission Logic and Form State Management */}
      <JobSubmitForm />
    </motion.div>
  )
}
