import { useEffect, useRef, useState } from 'react'
import DataTable from './DataTable'
import { approveQuery } from '@/api/query'
import type { QueryResponse, TableResult } from '@/types/api'

interface Props {
  response: QueryResponse
  showSql: boolean
  skipChart?: boolean
  onApproveResult?: (res: QueryResponse) => void
}

/* ── Inline Plotly chart — transparent, bleeds seamlessly ──────────────────── */
function InlineChart({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container || !html) return
    container.innerHTML = ''
    const temp = document.createElement('div')
    temp.innerHTML = html
    while (temp.firstChild) container.appendChild(temp.firstChild)
    container.querySelectorAll('script').forEach(old => {
      const s = document.createElement('script')
      s.type = 'text/javascript'
      s.textContent = old.textContent || ''
      document.head.appendChild(s)
      document.head.removeChild(s)
    })
  }, [html])

  return (
    <div
      ref={ref}
      className="chart-reveal mt-4 overflow-hidden rounded-xl"
      style={{ height: 340, position: 'relative' }}
    />
  )
}

/* ── SQL block ─────────────────────────────────────────────────────────────── */
function SqlBlock({ sql }: { sql: string }) {
  return (
    <pre className="mb-3 overflow-x-auto rounded-xl p-3 font-mono text-xs leading-relaxed"
      style={{ background: 'oklch(0 0 0 / 0.25)', border: '1px solid oklch(1 0 0 / 0.08)', color: 'oklch(0.72 0.19 55)' }}>
      {sql}
    </pre>
  )
}

/* ── Multi-table accordion ─────────────────────────────────────────────────── */
function MultiTableAccordion({ tables, showSql }: { tables: TableResult[]; showSql: boolean }) {
  const [open, setOpen] = useState<number[]>([0])
  const toggle = (i: number) => setOpen(o => o.includes(i) ? o.filter(x => x !== i) : [...o, i])

  return (
    <div className="space-y-1.5">
      <p className="mb-2 text-xs" style={{ color: 'oklch(1 0 0 / 0.35)' }}>{tables.length} result sets</p>
      {tables.map((t, i) => {
        const rows = t.dataframe
          ? Array.from({ length: (Object.values(t.dataframe)[0] as unknown[] ?? []).length }, (_, ri) =>
              Object.fromEntries(Object.entries(t.dataframe!).map(([c, v]) => [c, (v as unknown[])[ri]]))
            )
          : []
        return (
          <div key={i} className="overflow-hidden rounded-xl"
            style={{ background: 'oklch(1 0 0 / 0.04)', border: '1px solid oklch(1 0 0 / 0.08)' }}>
            <button onClick={() => toggle(i)}
              className="flex w-full items-center justify-between px-3 py-2.5 text-sm transition hover:bg-white/5"
              style={{ color: 'oklch(0.72 0.03 70)' }}>
              <span className="font-mono text-xs">{t.table_name}</span>
              <span className="text-xs" style={{ color: 'oklch(1 0 0 / 0.25)' }}>{open.includes(i) ? '▲' : '▼'}</span>
            </button>
            {open.includes(i) && (
              <div className="space-y-2 p-3" style={{ borderTop: '1px solid oklch(1 0 0 / 0.06)' }}>
                {showSql && t.sql_statement && <SqlBlock sql={t.sql_statement} />}
                {t.error
                  ? <p className="text-xs" style={{ color: 'oklch(0.82 0.14 25)' }}>{t.error}</p>
                  : <DataTable rows={rows} />}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── HITL approval card ────────────────────────────────────────────────────── */
function HitlApprovalCard({ response, onApproveResult }: {
  response: QueryResponse
  onApproveResult?: (res: QueryResponse) => void
}) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  async function handle(approved: boolean) {
    setLoading(approved ? 'approve' : 'reject')
    try { onApproveResult?.(await approveQuery({ approved })) }
    finally { setLoading(null) }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 rounded-xl px-3.5 py-3"
        style={{
          background: response.pending_is_ddl ? 'oklch(0.62 0.24 25 / 0.10)' : 'oklch(0.72 0.19 55 / 0.10)',
          border: response.pending_is_ddl ? '1px solid oklch(0.62 0.24 25 / 0.22)' : '1px solid oklch(0.72 0.19 55 / 0.22)',
        }}>
        <span className="mt-0.5 text-base leading-none">{response.pending_is_ddl ? '⚠' : '👁'}</span>
        <div>
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide"
            style={{ color: response.pending_is_ddl ? 'oklch(0.82 0.14 25)' : 'oklch(0.72 0.19 55)' }}>
            {response.pending_is_ddl ? 'Data-modifying query' : 'SQL Preview'}
          </p>
          <p className="text-xs" style={{ color: 'oklch(1 0 0 / 0.50)' }}>{response.message}</p>
        </div>
      </div>
      {response.pending_sql && <SqlBlock sql={response.pending_sql} />}
      <div className="flex gap-2">
        <button onClick={() => handle(true)} disabled={!!loading}
          className="flex-1 rounded-xl py-2.5 text-sm font-medium transition disabled:opacity-40"
          style={{ background: 'oklch(0.65 0.18 150 / 0.15)', border: '1px solid oklch(0.65 0.18 150 / 0.25)', color: 'oklch(0.78 0.18 150)' }}>
          {loading === 'approve' ? 'Running…' : '✓ Run it'}
        </button>
        <button onClick={() => handle(false)} disabled={!!loading}
          className="flex-1 rounded-xl py-2.5 text-sm font-medium transition disabled:opacity-40"
          style={{ background: 'oklch(1 0 0 / 0.05)', border: '1px solid oklch(1 0 0 / 0.09)', color: 'oklch(1 0 0 / 0.45)' }}>
          {loading === 'reject' ? '…' : '✕ Cancel'}
        </button>
      </div>
    </div>
  )
}

/* ── Main ──────────────────────────────────────────────────────────────────── */
export default function ResultRenderer({ response, showSql, skipChart, onApproveResult }: Props) {
  return (
    <div className="space-y-3 text-sm leading-relaxed" style={{ color: 'oklch(0.97 0.01 80)' }}>
      {showSql && response.sql_query && <SqlBlock sql={response.sql_query} />}

      {response.result_type === 'message' && (
        <p style={{ color: 'oklch(0.87 0.02 75)' }}>{response.message}</p>
      )}

      {response.result_type === 'pending_approval' && (
        <HitlApprovalCard response={response} onApproveResult={onApproveResult} />
      )}

      {response.result_type === 'error' && (
        <div className="flex items-start gap-2.5 rounded-xl p-3"
          style={{ background: 'oklch(0.62 0.24 25 / 0.10)', border: '1px solid oklch(0.62 0.24 25 / 0.20)' }}>
          <span style={{ color: 'oklch(0.82 0.14 25)' }}>⚠</span>
          <p style={{ color: 'oklch(0.82 0.14 25)' }}>{response.error ?? 'An error occurred.'}</p>
        </div>
      )}

      {(response.result_type === 'table' || response.result_type === 'table_and_chart')
        && response.dataframe && <DataTable rows={response.dataframe} />}

      {response.result_type === 'multi_table' && response.multi_table_data && (
        <MultiTableAccordion tables={response.multi_table_data} showSql={showSql} />
      )}

      {!skipChart && (response.result_type === 'chart' || response.result_type === 'table_and_chart')
        && response.chart_html && <InlineChart html={response.chart_html} />}
    </div>
  )
}
