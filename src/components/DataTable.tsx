import { useState } from 'react'
import { ChevronDown, ChevronUp, Download } from 'lucide-react'

interface Props {
  rows: Record<string, unknown>[]
  label?: string
}

const PREVIEW_LIMIT = 10

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return ''
  const cols = Object.keys(rows[0])
  return [cols.join(','), ...rows.map(r => cols.map(c => JSON.stringify(r[c] ?? '')).join(','))].join('\n')
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function DataTable({ rows, label = 'result' }: Props) {
  const [showAll, setShowAll] = useState(false)

  if (!rows.length) return (
    <p className="text-sm italic" style={{ color: 'oklch(1 0 0 / 0.30)' }}>No rows returned.</p>
  )

  const cols = Object.keys(rows[0])
  const hasMore = rows.length > PREVIEW_LIMIT
  const displayRows = showAll ? rows : rows.slice(0, PREVIEW_LIMIT)

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'oklch(1 0 0 / 0.28)' }}>
          {rows.length} row{rows.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => downloadBlob(toCSV(rows), `${label}.csv`, 'text/csv')}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition"
          style={{ background: 'oklch(0.72 0.19 55 / 0.10)', border: '1px solid oklch(0.72 0.19 55 / 0.22)', color: 'oklch(0.72 0.19 55)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'oklch(0.72 0.19 55 / 0.20)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'oklch(0.72 0.19 55 / 0.10)'}
        >
          <Download className="h-3 w-3" /> CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl"
        style={{ border: '1px solid oklch(1 0 0 / 0.08)', background: 'oklch(0 0 0 / 0.18)' }}>
        <table className="min-w-full text-xs">
          <thead>
            <tr style={{ background: 'oklch(1 0 0 / 0.04)', borderBottom: '1px solid oklch(1 0 0 / 0.07)' }}>
              {cols.map(col => (
                <th key={col}
                  className="whitespace-nowrap px-3 py-2.5 text-left font-semibold"
                  style={{ color: 'oklch(0.72 0.03 70 / 0.80)', fontSize: '0.60rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, ri) => (
              <tr key={ri} className="transition-colors"
                style={{ borderBottom: ri < displayRows.length - 1 ? '1px solid oklch(1 0 0 / 0.04)' : 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'oklch(0.72 0.19 55 / 0.06)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                {cols.map(col => (
                  <td key={col}
                    className="max-w-xs truncate whitespace-nowrap px-3 py-2 font-mono"
                    style={{ color: 'oklch(0.87 0.02 75)' }}>
                    {String(row[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* See all / collapse toggle */}
      {hasMore && (
        <button
          onClick={() => setShowAll(v => !v)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition"
          style={{
            background: showAll ? 'oklch(1 0 0 / 0.03)' : 'oklch(0.72 0.19 55 / 0.07)',
            border: `1px solid ${showAll ? 'oklch(1 0 0 / 0.07)' : 'oklch(0.72 0.19 55 / 0.20)'}`,
            color: showAll ? 'oklch(0.72 0.03 70)' : 'oklch(0.72 0.19 55)',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1.15)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = 'none'}
        >
          {showAll ? (
            <><ChevronUp className="h-3.5 w-3.5" /> Show less</>
          ) : (
            <><ChevronDown className="h-3.5 w-3.5" /><ChevronDown className="h-3.5 w-3.5 -ml-2" />
              See all {rows.length} rows</>
          )}
        </button>
      )}
    </div>
  )
}
