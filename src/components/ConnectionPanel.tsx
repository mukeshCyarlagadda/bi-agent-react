import React, { useState } from 'react'
import { FileText, FileSpreadsheet, Image, Loader2, Database, RefreshCw } from 'lucide-react'
import { connectDb, disconnectDb, reconnectFile } from '@/api/connections'
import { useSession } from '@/context/SessionContext'
import { useProject } from '@/context/ProjectContext'
import { supabase } from '@/lib/supabase'
import type { ConnectRequest, DbType } from '@/types/api'
import type { SupabaseProject } from '@/context/ProjectContext'

const DB_OPTIONS: { label: string; value: DbType }[] = [
  { label: 'SQLite',        value: 'sqlite'    },
  { label: 'PostgreSQL',    value: 'postgres'  },
  { label: 'MySQL',         value: 'mysql'     },
  { label: 'MS SQL Server', value: 'mssql'     },
  { label: 'Snowflake',     value: 'snowflake' },
  { label: 'BigQuery',      value: 'bigquery'  },
  { label: 'Oracle',        value: 'oracle'    },
  { label: 'DuckDB',        value: 'duckdb'    },
]

const DEFAULT_PORTS: Partial<Record<DbType, number>> = {
  postgres: 5432, mysql: 3306, mssql: 1433, oracle: 1521,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'oklch(1 0 0 / 0.04)',
  border: '1px solid oklch(1 0 0 / 0.08)',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: '0.875rem',
  color: 'oklch(0.97 0.01 80)',
  outline: 'none',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  color: 'oklch(0.72 0.03 70)',
  marginBottom: 6,
}

/* ── File icon ───────────────────────────────────────────────────────────── */
function FileIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['xlsx', 'xls', 'csv'].includes(ext))
    return <FileSpreadsheet className="h-4 w-4 shrink-0" style={{ color: 'oklch(0.72 0.19 55)' }} />
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext))
    return <Image className="h-4 w-4 shrink-0" style={{ color: 'oklch(0.72 0.19 55)' }} />
  return <FileText className="h-4 w-4 shrink-0" style={{ color: 'oklch(0.72 0.19 55)' }} />
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

interface Props {
  onConnected?: () => void
}

export default function ConnectionPanel({ onConnected }: Props) {
  const { sessionId, dbType, tables, login, logout } = useSession()
  const { projects, setActiveProject, updateProjectSession } = useProject()

  const [tab, setTab] = useState<'db' | 'files'>('db')
  const [selectedDb, setSelectedDb] = useState<DbType>('sqlite')
  const [form, setForm] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [connectingFileId, setConnectingFileId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tablesOpen, setTablesOpen] = useState(false)

  const fileProjects = projects.filter(p => p.db_type === 'file')

  function field(name: string, label: string, type = 'text', placeholder = '') {
    return (
      <div key={name} className="space-y-1.5">
        <label style={labelStyle}>{label}</label>
        <input
          type={type}
          placeholder={placeholder}
          value={form[name] ?? ''}
          onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          style={inputStyle}
          onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'oklch(0.72 0.19 55 / 0.50)' }}
          onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'oklch(1 0 0 / 0.08)' }}
        />
      </div>
    )
  }

  function renderFields() {
    if (selectedDb === 'sqlite' || selectedDb === 'duckdb')
      return field('db_path', 'File path', 'text', '/path/to/database.db')
    if (selectedDb === 'bigquery') return (
      <>{field('project', 'Project ID')}{field('dataset', 'Dataset')}{field('credentials_path', 'Service Account JSON')}</>
    )
    if (selectedDb === 'snowflake') return (
      <>{field('account', 'Account')}{field('user', 'Username')}{field('password', 'Password', 'password')}{field('database', 'Database')}{field('warehouse', 'Warehouse')}{field('schema_', 'Schema', 'text', 'PUBLIC')}</>
    )
    return (
      <>{field('host', 'Host', 'text', 'localhost')}{field('port', 'Port', 'number', String(DEFAULT_PORTS[selectedDb] ?? ''))}{field('user', 'Username')}{field('password', 'Password', 'password')}{selectedDb === 'oracle' ? field('sid', 'SID') : field('database', 'Database')}</>
    )
  }

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const req: ConnectRequest = {
        db_type: selectedDb,
        ...Object.fromEntries(
          Object.entries(form).filter(([, v]) => v.trim() !== '').map(
            ([k, v]) => [k, k === 'port' ? Number(v) : v]
          )
        ),
      }
      login(await connectDb(req))
      onConnected?.()
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Connection failed')
    } finally { setLoading(false) }
  }

  async function handleConnectFile(p: SupabaseProject) {
    if (!p.db_path) {
      setError('No file path stored for this upload. Please re-upload the file.')
      return
    }
    setConnectingFileId(p.id)
    setError(null)
    try {
      const res = await reconnectFile(p.db_path)
      // Save fresh session_id back to Supabase
      await supabase.from('projects').update({ backend_session_id: res.session_id }).eq('id', p.id)
      await updateProjectSession(p.id, res.session_id)
      login(res)
      sessionStorage.setItem('sessionId', res.session_id)
      await setActiveProject(p.id)
      onConnected?.()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(detail ?? 'Failed to connect to file')
    } finally {
      setConnectingFileId(null)
    }
  }

  async function handleDisconnect() {
    try { await disconnectDb() } catch { /* ignore */ }
    logout()
    onConnected?.()
  }

  /* ── Connected state ─────────────────────────────────────────────────────── */
  if (sessionId) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm"
          style={{ background: 'oklch(0.72 0.19 55 / 0.10)', border: '1px solid oklch(0.72 0.19 55 / 0.22)' }}>
          <span className="h-2 w-2 rounded-full shrink-0 animate-pulse" style={{ background: 'oklch(0.72 0.19 55)' }} />
          <span className="font-medium" style={{ color: 'oklch(0.72 0.19 55)' }}>Connected</span>
          <span className="ml-auto font-mono text-xs" style={{ color: 'oklch(0.72 0.03 70)' }}>{dbType}</span>
        </div>

        {tables.length > 0 && (
          <div className="glass-panel-subtle overflow-hidden">
            <button
              onClick={() => setTablesOpen(o => !o)}
              className="flex w-full items-center justify-between px-3 py-2 text-xs transition hover:bg-white/5"
              style={{ color: 'oklch(0.72 0.03 70)' }}
            >
              <span>{tables.length} tables</span>
              <span>{tablesOpen ? '▲' : '▼'}</span>
            </button>
            {tablesOpen && (
              <div className="max-h-36 overflow-y-auto scrollbar-thin px-2 pb-2 space-y-0.5"
                style={{ borderTop: '1px solid oklch(1 0 0 / 0.06)' }}>
                {tables.map(t => (
                  <p key={t} className="truncate rounded px-2 py-1 text-xs font-mono transition hover:bg-white/5 cursor-default"
                    style={{ color: 'oklch(0.72 0.03 70)' }}>{t}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleDisconnect}
          className="w-full rounded-xl py-2 text-xs font-medium transition hover:brightness-110"
          style={{ background: 'oklch(0.62 0.24 25 / 0.12)', border: '1px solid oklch(0.62 0.24 25 / 0.22)', color: 'oklch(0.82 0.14 25)' }}
        >
          Disconnect
        </button>
      </div>
    )
  }

  /* ── Disconnected ─────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex rounded-lg p-0.5" style={{ background: 'oklch(1 0 0 / 0.05)' }}>
        {(['db', 'files'] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setError(null) }}
            className="flex-1 rounded-md py-1.5 text-xs font-medium transition"
            style={{
              background: tab === t ? 'oklch(0.72 0.19 55 / 0.20)' : 'transparent',
              color: tab === t ? 'oklch(0.97 0.01 80)' : 'oklch(0.72 0.03 70)',
              border: tab === t ? '1px solid oklch(0.72 0.19 55 / 0.30)' : '1px solid transparent',
            }}>
            {t === 'db' ? (
              <span className="flex items-center justify-center gap-1.5">
                <Database className="h-3 w-3" /> Database
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <FileText className="h-3 w-3" /> My Files
                {fileProjects.length > 0 && (
                  <span className="rounded-full px-1.5 text-[9px] font-bold"
                    style={{ background: 'oklch(0.72 0.19 55 / 0.25)', color: 'oklch(0.72 0.19 55)' }}>
                    {fileProjects.length}
                  </span>
                )}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-lg px-3 py-2 text-xs"
          style={{ background: 'oklch(0.62 0.24 25 / 0.12)', border: '1px solid oklch(0.62 0.24 25 / 0.22)', color: 'oklch(0.82 0.14 25)' }}>
          {error}
        </p>
      )}

      {/* Database tab */}
      {tab === 'db' && (
        <form onSubmit={handleConnect} className="space-y-4">
          <div className="space-y-1.5">
            <label style={labelStyle}>Database type</label>
            <div className="relative">
              <select
                value={selectedDb}
                onChange={e => { setSelectedDb(e.target.value as DbType); setForm({}) }}
                style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none', paddingRight: 32, cursor: 'pointer' }}
              >
                {DB_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} style={{ background: '#1a1108' }}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs"
                style={{ color: 'oklch(0.72 0.03 70)' }}>▾</span>
            </div>
          </div>

          {renderFields()}

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={loading}
              className="gradient-primary flex-1 rounded-lg py-2.5 text-sm font-semibold transition hover:brightness-110 disabled:opacity-40"
              style={{ color: 'oklch(0.15 0.02 45)' }}>
              {loading ? 'Connecting…' : 'Connect'}
            </button>
          </div>
        </form>
      )}

      {/* Files tab */}
      {tab === 'files' && (
        <div className="space-y-2">
          {fileProjects.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <FileText className="h-8 w-8" style={{ color: 'oklch(0.72 0.03 70 / 0.30)' }} />
              <p className="text-sm" style={{ color: 'oklch(0.72 0.03 70)' }}>No uploaded files yet</p>
              <p className="text-xs" style={{ color: 'oklch(0.72 0.03 70 / 0.55)' }}>
                Upload a CSV, Excel, PDF, or image from the sidebar
              </p>
            </div>
          ) : (
            fileProjects.map(p => {
              const isConnecting = connectingFileId === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => handleConnectFile(p)}
                  disabled={isConnecting}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/5 disabled:opacity-60"
                  style={{ border: '1px solid oklch(1 0 0 / 0.08)' }}
                >
                  <FileIcon name={p.title} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium" style={{ color: 'oklch(0.87 0.02 75)' }}>
                      {p.title}
                    </div>
                    <div className="text-[11px]" style={{ color: 'oklch(0.72 0.03 70)' }}>
                      {p.db_path ? 'Stored on server' : 'Re-upload required'} · {relativeTime(p.updated_at)}
                    </div>
                  </div>
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" style={{ color: 'oklch(0.72 0.19 55)' }} />
                  ) : p.db_path ? (
                    <RefreshCw className="h-3.5 w-3.5 shrink-0" style={{ color: 'oklch(0.72 0.03 70 / 0.50)' }} />
                  ) : null}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
