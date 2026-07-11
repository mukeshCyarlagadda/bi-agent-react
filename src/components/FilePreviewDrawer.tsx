import { useEffect, useRef, useState } from 'react'
import { X, MessageSquare, Loader2, Table2, AlertCircle, RefreshCw } from 'lucide-react'
import { previewData, reconnectFile } from '@/api/connections'
import { useProject } from '@/context/ProjectContext'
import type { SupabaseProject } from '@/context/ProjectContext'
import { supabase } from '@/lib/supabase'

interface PreviewResult {
  columns: string[]
  rows: unknown[][]
  total: number
  table: string
}

interface Props {
  project: SupabaseProject
  onClose: () => void
  onChat: (project: SupabaseProject) => void
}

export default function FilePreviewDrawer({ project, onClose, onChat }: Props) {
  const { updateProjectSession } = useProject()

  const [data, setData] = useState<PreviewResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reconnecting, setReconnecting] = useState(false)
  const openedAt = useRef(Date.now())

  function handleBackdropClick() {
    if (Date.now() - openedAt.current < 300) return
    onClose()
  }

  async function loadPreview(sessionId: string) {
    setLoading(true)
    setError('')
    try {
      const result = await previewData(sessionId)
      setData(result)
      setLoading(false)
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status
      // Session expired (404) — try reconnecting from stored db_path
      if (status === 404 && project.db_path) {
        await handleReconnect()
      } else {
        const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        setError(detail ?? (e as Error).message ?? 'Preview failed')
        setLoading(false)
      }
    }
  }

  async function handleReconnect() {
    if (!project.db_path) {
      setError('No file path stored — please re-upload the file.')
      setLoading(false)
      return
    }
    setReconnecting(true)
    setError('')
    try {
      const res = await reconnectFile(project.db_path)
      // Persist new session_id to Supabase so next load is instant
      await supabase.from('projects').update({ backend_session_id: res.session_id }).eq('id', project.id)
      await updateProjectSession(project.id, res.session_id)
      // Load preview with fresh session
      const result = await previewData(res.session_id)
      setData(result)
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(detail ?? (e as Error).message ?? 'Reconnect failed')
    } finally {
      setReconnecting(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!project.backend_session_id && !project.db_path) {
      setError('No session or file path — please re-upload the file.')
      setLoading(false)
      return
    }
    if (project.backend_session_id) {
      loadPreview(project.backend_session_id)
    } else {
      handleReconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'oklch(0 0 0 / 0.40)', backdropFilter: 'blur(4px)' }}
        onClick={handleBackdropClick}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 z-50 flex h-full flex-col"
        style={{
          width: 'min(760px, 90vw)',
          background: 'oklch(0.20 0.04 50)',
          borderLeft: '1px solid oklch(0.35 0.05 55 / 40%)',
          boxShadow: '-20px 0 60px oklch(0 0 0 / 0.40)',
          animation: 'slide-in-right 0.22s ease',
        }}
      >
        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid oklch(1 0 0 / 0.08)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: 'oklch(0.72 0.19 55 / 0.15)', border: '1px solid oklch(0.72 0.19 55 / 0.25)' }}
            >
              <Table2 className="h-4 w-4" style={{ color: 'oklch(0.72 0.19 55)' }} />
            </div>
            <div className="min-w-0">
              <div className="truncate font-display text-sm font-semibold" style={{ color: 'oklch(0.97 0.01 80)' }}>
                {project.title}
              </div>
              {data && (
                <div className="text-[11px]" style={{ color: 'oklch(0.72 0.03 70)' }}>
                  {data.total.toLocaleString()} rows · {data.columns.length} columns · table: {data.table}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-4">
            {data && (
              <button
                onClick={() => onChat(project)}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition hover:brightness-110"
                style={{ background: 'oklch(0.72 0.19 55)', color: 'oklch(0.15 0.02 45)' }}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Chat with this data
              </button>
            )}
            {!loading && !data && project.db_path && (
              <button
                onClick={handleReconnect}
                disabled={reconnecting}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition hover:brightness-110 disabled:opacity-40"
                style={{ background: 'oklch(0.72 0.19 55 / 0.15)', border: '1px solid oklch(0.72 0.19 55 / 0.30)', color: 'oklch(0.72 0.19 55)' }}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${reconnecting ? 'animate-spin' : ''}`} />
                {reconnecting ? 'Reconnecting…' : 'Reconnect'}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-white/10"
              style={{ color: 'oklch(0.72 0.03 70)' }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto">
          {(loading || reconnecting) && (
            <div className="flex h-full items-center justify-center gap-3" style={{ color: 'oklch(0.72 0.03 70)' }}>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">{reconnecting ? 'Restoring session…' : 'Loading preview…'}</span>
            </div>
          )}

          {error && !loading && !reconnecting && (
            <div className="flex h-full items-center justify-center px-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <AlertCircle className="h-8 w-8" style={{ color: 'oklch(0.72 0.03 70 / 0.50)' }} />
                <p className="text-sm" style={{ color: 'oklch(0.72 0.03 70)' }}>{error}</p>
                {project.db_path && (
                  <button
                    onClick={handleReconnect}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition hover:brightness-110"
                    style={{ background: 'oklch(0.72 0.19 55 / 0.15)', border: '1px solid oklch(0.72 0.19 55 / 0.30)', color: 'oklch(0.72 0.19 55)' }}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Try reconnecting
                  </button>
                )}
              </div>
            </div>
          )}

          {data && !loading && !reconnecting && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'oklch(1 0 0 / 0.04)', borderBottom: '1px solid oklch(1 0 0 / 0.08)' }}>
                    <th className="px-4 py-2.5 text-left font-medium tabular-nums"
                      style={{ color: 'oklch(0.72 0.03 70 / 0.60)', width: 48 }}>#</th>
                    {data.columns.map(col => (
                      <th key={col} className="px-4 py-2.5 text-left font-medium uppercase tracking-wide"
                        style={{ color: 'oklch(0.72 0.03 70 / 0.60)', whiteSpace: 'nowrap' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, ri) => (
                    <tr
                      key={ri}
                      style={{ borderBottom: '1px solid oklch(1 0 0 / 0.05)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'oklch(1 0 0 / 0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="px-4 py-2 tabular-nums" style={{ color: 'oklch(0.72 0.03 70 / 0.40)' }}>
                        {ri + 1}
                      </td>
                      {(row as unknown[]).map((cell, ci) => (
                        <td key={ci} className="px-4 py-2 tabular-nums"
                          style={{ color: 'oklch(0.87 0.02 75)', whiteSpace: 'nowrap', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cell === null || cell === undefined ? (
                            <span style={{ color: 'oklch(0.72 0.03 70 / 0.30)' }}>null</span>
                          ) : String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {data.total > data.rows.length && (
                <div className="px-6 py-3 text-center text-xs" style={{ color: 'oklch(0.72 0.03 70 / 0.50)' }}>
                  Showing {data.rows.length.toLocaleString()} of {data.total.toLocaleString()} rows
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}
