import { useEffect, useMemo, useRef } from 'react'
import { LayoutDashboard, Pin, Maximize2, Minimize2, Trash2 } from 'lucide-react'
import { useProject, type DashboardItem } from '@/context/ProjectContext'

/* ── Plotly injector (same pattern as ChatHistory) ──────────────────────────── */
function usePlotlyInject(html: string) {
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
  return ref
}

/* ── Uniquify Plotly IDs (each card needs a unique div id) ───────────────────── */
function uniquifyHtml(html: string, suffix: string): string {
  const m = html.match(/id="([^"]+)"[^>]*class="plotly-graph-div"/) ||
            html.match(/class="plotly-graph-div"[^>]*id="([^"]+)"/)
  if (!m) return html
  const oldId = m[1]
  const newId = `dash-${suffix}-${oldId}`
  return html.split(oldId).join(newId)
}

/* ── Single dashboard card ────────────────────────────────────────────────────── */
function DashboardCard({ item, index }: { item: DashboardItem; index: number }) {
  const { unpinChart, toggleItemWidth } = useProject()
  const uniqueHtml = useMemo(() => uniquifyHtml(item.chart_html, item.id.slice(0, 8)), [item.chart_html, item.id])
  const ref = usePlotlyInject(uniqueHtml)
  const isFullWidth = item.width === 2

  return (
    <div
      className="glass-panel group flex flex-col overflow-hidden"
      style={{
        gridColumn: isFullWidth ? 'span 2' : 'span 1',
        borderRadius: 16,
      }}
    >
      {/* Card header */}
      <div
        className="flex shrink-0 items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid oklch(1 0 0 / 0.07)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Pin className="h-3.5 w-3.5 shrink-0" style={{ color: 'oklch(0.72 0.19 55 / 0.70)' }} />
          <span
            className="truncate text-sm font-medium"
            style={{ color: 'oklch(0.87 0.02 75)' }}
            title={item.title}
          >
            {item.title || `Chart ${index + 1}`}
          </span>
        </div>

        {/* Actions — always visible on mobile, hover on desktop */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
          <button
            onClick={() => toggleItemWidth(item.id, item.width)}
            aria-label={isFullWidth ? 'Make half-width' : 'Make full-width'}
            title={isFullWidth ? 'Half width' : 'Full width'}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-white/10"
            style={{ color: 'oklch(0.72 0.03 70)' }}
          >
            {isFullWidth ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => unpinChart(item.id)}
            aria-label="Remove from dashboard"
            title="Remove"
            className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-red-500/15"
            style={{ color: 'oklch(0.72 0.03 70)' }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div
        ref={ref}
        style={{
          flex: 1,
          minHeight: 280,
          background: 'transparent',
          overflow: 'hidden',
        }}
      />
    </div>
  )
}

/* ── Empty state ─────────────────────────────────────────────────────────────── */
function EmptyDashboard() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: 'oklch(1 0 0 / 0.05)', border: '1px solid oklch(1 0 0 / 0.08)' }}
      >
        <LayoutDashboard className="h-6 w-6" style={{ color: 'oklch(0.72 0.19 55 / 0.60)' }} />
      </div>
      <div>
        <h3 className="font-display mb-1.5 text-lg font-semibold" style={{ color: 'oklch(0.87 0.02 75)' }}>
          No charts pinned yet
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.72 0.03 70)' }}>
          Ask a question in Chat and hover a chart to<br />
          click <strong style={{ color: 'oklch(0.87 0.02 75)' }}>Pin</strong> — it'll appear here.
        </p>
      </div>
    </div>
  )
}

/* ── Main Dashboard view ─────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { dashboardItems, loadingDashboard } = useProject()

  if (loadingDashboard) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="block h-1.5 w-1.5 rounded-full"
              style={{
                background: 'oklch(0.72 0.19 55 / 0.60)',
                animation: 'bounce-dot 1.3s ease-in-out infinite',
                animationDelay: `${i * 0.18}s`,
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (!dashboardItems.length) return <EmptyDashboard />

  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto p-6">
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: 'repeat(2, 1fr)',
          alignItems: 'start',
        }}
      >
        {dashboardItems.map((item, i) => (
          <DashboardCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  )
}
