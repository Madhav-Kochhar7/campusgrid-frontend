/**
 * Job History Table Components
 * ============================
 * Provides a structured view of all submitted jobs and their real-time status.
 * Includes progress bars for split jobs, conditional action buttons (Retry, 
 * Monitor, Download), and a deletion confirmation flow.
 */

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownTrayIcon, EyeIcon, ArrowPathIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline'
import StatusBadge from '../ui/StatusBadge'
import { Button, SkeletonRow } from '../ui/index'
import { downloadResults, deleteJob } from '../../api/jobs'
import { useToast } from '../../context/ToastContext'
import { useQueryClient } from '@tanstack/react-query'

/**
 * Human-readable relative time formatter (e.g. '5m ago').
 */
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return `${Math.round(diff)}s ago`
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`
  return `${Math.round(diff / 86400)}d ago`
}

/**
 * Progress bar for split jobs. Calculates percentage of completed chunks.
 */
function ChunkBar({ chunks, total }) {
  if (!chunks || !total) return null
  const done = chunks.filter((c) => c.status === 'done').length
  const pct = Math.round((done / total) * 100)
  return (
    <div className="flex items-center gap-2 mt-1.5 animate-in fade-in duration-300">
      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden max-w-[100px] border border-slate-200">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/50 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-text-muted font-bold font-mono tracking-tighter">{done}/{total}</span>
    </div>
  )
}

/**
 * Centered modal overlay for confirming the permanent deletion of a job.
 */
function DeleteConfirmModal({ jobId, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md"
      style={{ background: 'rgba(0,0,0,0.85)' }}
    >
      <div className="bg-white border border-slate-200 rounded-3xl p-10 w-full max-w-sm mx-4 shadow-xl scale-100 animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 mb-8 mx-auto shadow-sm border border-slate-200">
          <TrashIcon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-3 text-center uppercase tracking-tight">Delete Job?</h3>
        <p className="text-sm text-zinc-500 mb-10 text-center font-medium leading-relaxed">
          Job <span className="font-mono text-primary-red bg-primary-red/10 px-1.5 rounded">{jobId?.slice(0, 8)}</span> will be permanently purged from the grid.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="ghost" size="lg" onClick={onCancel} className="!bg-slate-100 !border-slate-200 !text-slate-500 hover:!text-slate-900 !rounded-2xl">
            Retain
          </Button>
          <Button variant="danger" size="lg" onClick={onConfirm} className="!rounded-2xl !bg-primary-red/10 !border !border-primary-red/50 !text-primary-red shadow-none">
            Purge
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Individual row in the job table. 
 * Manages its own deletion state and download logic.
 */
export function JobRow({ job, onRetry, onDelete }) {
  const { addToast } = useToast()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Handlers for action buttons
  const handleDownload = async () => {
    try {
      addToast('Downloading results...', 'info')
      await downloadResults(job.id)
    } catch {
      addToast('Download failed', 'error')
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteJob(job.id)
      addToast('Job successfully purged', 'success')
      onDelete?.(job.id)
    } catch {
      addToast('Failed to purge job', 'error')
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  // Deletion is allowed only for terminal or queued states
  const canDelete = ['failed', 'expired', 'done', 'queued', 'pending'].includes(job.status)

  return (
    <>
      {confirmDelete && (
        <DeleteConfirmModal
          jobId={job.id}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
      <tr className="border-b border-border-DEFAULT hover:bg-slate-50 transition-all group animate-in fade-in duration-500">
        {/* Short ID with link to details */}
        <td className="px-5 py-5">
          <Link
            to={`/jobs/${job.id}`}
            className="font-mono text-[14px] font-black tracking-tighter text-slate-900 hover:text-primary transition-colors"
          >
            {job.id.slice(0, 8)}
          </Link>
        </td>

        {/* Image name and infrastructure info */}
        <td className="px-5 py-5 max-w-[200px]">
          <p className="text-[14px] font-bold text-slate-900 truncate" title={job.image}>
            {job.image.split('/').pop()}
          </p>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1.5 opacity-60">Docker Infrastructure</p>
        </td>

        {/* Status Badge and optional Chunk Progress */}
        <td className="px-5 py-5">
          <StatusBadge status={job.status} />
          {job.total_chunks && (
            <div className="mt-1">
              <ChunkBar chunks={job.chunks} total={job.total_chunks} />
            </div>
          )}
        </td>

        {/* Assigned Node ID */}
        <td className="px-5 py-5 text-[12px] text-text-mono font-mono font-bold tracking-tighter">
          {job.node_id ? (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              {job.node_id.slice(0, 8)}
            </div>
          ) : '—'}
        </td>

        {/* Creation Time */}
        <td className="px-5 py-5 text-[13px] text-text-secondary">
          <span className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] opacity-70">
            <ClockIcon className="w-3 h-3 text-zinc-600" />
            {timeAgo(job.created_at)}
          </span>
        </td>

        {/* Actions (Monitor, Download, Retry, Purge) */}
        <td className="px-5 py-5 text-right">
          <div className="flex items-center justify-end gap-3 transition-all duration-300">
            {(job.status === 'running' || job.status === 'dispatched') && (
              <Link to={`/jobs/${job.id}`}>
                <Button size="sm" className="!rounded-full !px-4 !py-1 !text-[11px] !font-black uppercase tracking-widest border-2 border-primary-orange/30 bg-primary-orange/5 text-primary-orange hover:bg-primary-orange/10 transition-all">
                  Monitor
                </Button>
              </Link>
            )}
            {job.status === 'done' && (
              <Button size="sm" variant="default" onClick={handleDownload} className="!rounded-full !px-4 !py-1 !text-[11px] !font-black uppercase tracking-widest border-slate-200 hover:border-primary hover:text-primary transition-all">
                <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                Results
              </Button>
            )}
            {job.status === 'failed' && (
              <Button size="sm" variant="default" onClick={() => onRetry?.(job)} className="!rounded-full !px-4 !py-1 !text-[11px] !font-black uppercase tracking-widest border-slate-200 hover:border-primary-orange hover:text-primary-orange transition-all">
                <ArrowPathIcon className="w-3.5 h-3.5" />
                Retry
              </Button>
            )}
            {canDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={deleting}
                className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-primary-red hover:bg-primary-red/10 rounded-full transition-all disabled:opacity-50"
                title="Purge"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </td>
      </tr>
    </>
  )
}

/**
 * Main Table Component. 
 * Manages local cache updates after a deletion task completes.
 */
export function JobTable({ jobs, loading, onRetry }) {
  const queryClient = useQueryClient()

  const handleDelete = (deletedId) => {
    // Optimistically update the list in the QueryClient cache
    queryClient.setQueryData(['jobs'], (old) =>
      old ? old.filter((j) => j.id !== deletedId) : []
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border-none bg-transparent relative">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-white/40 backdrop-blur-sm">
              {['Job ID', 'Image', 'Status', 'Node', 'Created', ''].map((h) => (
                <th
                  key={h}
                  className="px-6 py-5 text-left text-[11px] font-black text-zinc-500 uppercase tracking-[0.3em]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={6} />
              ))
              : jobs?.map((job) => (
                <JobRow
                  key={job.id}
                  job={job}
                  onRetry={onRetry}
                  onDelete={handleDelete}
                />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
