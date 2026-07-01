import React, { useState } from 'react'
import { connectDb, disconnectDb } from '@/api/connections'
import { useSession } from '@/context/SessionContext'
import type { ConnectRequest, DbType } from '@/types/api'

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

interface Props {
  onConnected?: () => void
}

export default function ConnectionPanel({ onConnected }: Props) {
  const { sessionId, dbType, tables, login, logout } = useSession()
  const [selectedDb, setSelectedDb] = useState<DbType>('sqlite')
  const [form, setForm] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tablesOpen, setTablesOpen] = useState(false)

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

  async function handleDisconnect() {
    try { await disconnectDb() } catch { /* ignore */ }
    logout()
    onConnected?.()
  }

  /* ── Connected ──────────────────────────────────────────────────────────── */
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

  /* ── Disconnected ──────────────────────────────────────────────────────── */
  return (
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

      {error && (
        <p className="rounded-lg px-3 py-2 text-xs" style={{ background: 'oklch(0.62 0.24 25 / 0.12)', border: '1px solid oklch(0.62 0.24 25 / 0.22)', color: 'oklch(0.82 0.14 25)' }}>
          {error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={loading}
          className="gradient-primary flex-1 rounded-lg py-2.5 text-sm font-semibold transition hover:brightness-110 disabled:opacity-40"
          style={{ color: 'oklch(0.15 0.02 45)' }}>
          {loading ? 'Connecting…' : 'Connect'}
        </button>
      </div>
    </form>
  )
}
