import { useEffect, useMemo, useRef, useState } from 'react'
import { Diamond, TrendingUp, Users, BarChart3, Search, Maximize2, X } from 'lucide-react'
import ResultRenderer from './ResultRenderer'
import { useSession } from '@/context/SessionContext'
import { useQuerySubmit } from '@/hooks/useQuerySubmit'
import type { ChatEntry, QueryResponse } from '@/types/api'

/* ── Typing dots ───────────────────────────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map(i => (
        <span key={i} className="block h-1.5 w-1.5 rounded-full"
          style={{
            background: 'oklch(0.72 0.19 55 / 0.70)',
            animation: 'bounce-dot 1.3s ease-in-out infinite',
            animationDelay: `${i * 0.18}s`,
          }} />
      ))}
    </div>
  )
}

/* ── System event banner ───────────────────────────────────────────────────── */
function SystemEvent({ entry }: { entry: ChatEntry }) {
  const isConnect = entry.response?.message?.startsWith('Connected')
  return (
    <div className="flex items-center gap-3 px-6 py-2 animate-fade-up">
      <div className="h-px flex-1" style={{ background: 'oklch(1 0 0 / 0.07)' }} />
      <span className="shrink-0 rounded-full px-3 py-1 text-xs font-medium"
        style={{
          background: isConnect ? 'oklch(0.65 0.18 150 / 0.12)' : 'oklch(1 0 0 / 0.06)',
          border: isConnect ? '1px solid oklch(0.65 0.18 150 / 0.25)' : '1px solid oklch(1 0 0 / 0.09)',
          color: isConnect ? 'oklch(0.78 0.18 150)' : 'oklch(1 0 0 / 0.35)',
        }}>
        {entry.response?.message}
      </span>
      <div className="h-px flex-1" style={{ background: 'oklch(1 0 0 / 0.07)' }} />
    </div>
  )
}

/* ── Shared chart injector — used in both inline and modal views ────────────── */
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

/* ── Full-width inline chart — bleeds edge to edge, no border ──────────────── */
function FullWidthChart({ html, onExpand }: { html: string; onExpand: () => void }) {
  const ref = usePlotlyInject(html)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative"
      style={{ margin: '4px -24px 0 -24px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Chart canvas */}
      <div
        ref={ref}
        className="chart-reveal"
        style={{ height: 380, background: 'transparent', overflow: 'hidden' }}
      />

      {/* Expand hint — appears on hover, top-right corner */}
      <button
        onClick={onExpand}
        aria-label="Expand chart"
        className="absolute right-4 top-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all"
        style={{
          opacity: hovered ? 1 : 0,
          background: 'oklch(0.16 0.03 45 / 0.80)',
          border: '1px solid oklch(0.72 0.19 55 / 0.30)',
          color: 'oklch(0.72 0.19 55)',
          backdropFilter: 'blur(8px)',
          pointerEvents: hovered ? 'auto' : 'none',
          transition: 'opacity 0.18s ease',
        }}
      >
        <Maximize2 className="h-3 w-3" />
        Expand
      </button>
    </div>
  )
}

/* ── Uniquify Plotly div IDs so modal doesn't conflict with inline chart ─────── */
function uniquifyPlotlyHtml(html: string): string {
  // Plotly emits <div id="someId" class="plotly-graph-div"> and calls
  // Plotly.newPlot("someId", ...) — both must share the same unique suffix
  // so the modal script targets ITS own div, not the one already in the DOM.
  const m = html.match(/id="([^"]+)"[^>]*class="plotly-graph-div"/) ||
             html.match(/class="plotly-graph-div"[^>]*id="([^"]+)"/)
  if (!m) return html
  const oldId = m[1]
  const newId = `modal-${oldId}`
  return html.split(oldId).join(newId)
}

/* ── Fullscreen chart modal ─────────────────────────────────────────────────── */
function ChartModal({ html, onClose }: { html: string; onClose: () => void }) {
  // Swap the Plotly div ID so the modal's script targets its own container,
  // not the inline chart div that already exists in the DOM with the same id.
  const modalHtml = useMemo(() => uniquifyPlotlyHtml(html), [html])
  const ref = usePlotlyInject(modalHtml)

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'oklch(0 0 0 / 0.70)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className="glass-panel relative z-10 flex flex-col overflow-hidden"
        style={{ width: '92vw', height: '84vh', maxWidth: 1280 }}
      >
        {/* Top bar */}
        <div className="flex shrink-0 items-center justify-between px-5 py-3"
          style={{ borderBottom: '1px solid oklch(1 0 0 / 0.08)' }}>
          <span className="font-display text-sm font-semibold" style={{ color: 'oklch(0.87 0.02 75)' }}>
            Chart
          </span>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-white/10"
            style={{ color: 'oklch(0.72 0.03 70)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Chart — fills remaining space; explicit width/height so Plotly responsive works */}
        <div
          ref={ref}
          style={{ flex: 1, minHeight: 0, width: '100%', background: 'transparent', overflow: 'hidden' }}
        />
      </div>
    </div>
  )
}

/* ── Single message pair ───────────────────────────────────────────────────── */
function MessagePair({ entry, showSql, onApproveResult, onExpandChart }: {
  entry: ChatEntry
  showSql: boolean
  onApproveResult: (id: string, res: QueryResponse) => void
  onExpandChart: (html: string) => void
}) {
  if (entry.isSystem) return <SystemEvent entry={entry} />

  const chartHtml = !entry.pending &&
    (entry.response?.result_type === 'chart' || entry.response?.result_type === 'table_and_chart') &&
    entry.response.chart_html
    ? entry.response.chart_html : null

  return (
    <div className="flex flex-col gap-3 animate-fade-up px-6">

      {/* User bubble — gradient amber, right */}
      <div className="flex justify-end">
        <div className="gradient-primary max-w-[78%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed shadow-md"
          style={{ color: 'oklch(0.15 0.02 45)' }}>
          {entry.question}
        </div>
      </div>

      {/* Bot — Diamond icon + plain text, no bubble */}
      <div className="flex gap-4">
        <div className="glass-panel-subtle mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
          <Diamond className="h-3.5 w-3.5" style={{ color: 'oklch(0.72 0.19 55)' }} fill="currentColor" />
        </div>
        <div className="min-w-0 flex-1 pt-1">
          {entry.pending ? (
            <TypingDots />
          ) : entry.response ? (
            <ResultRenderer
              response={entry.response}
              showSql={showSql}
              skipChart
              onApproveResult={res => onApproveResult(entry.id, res)}
            />
          ) : null}
        </div>
      </div>

      {/* Full-width chart — escapes px-6 padding, no border */}
      {chartHtml && (
        <FullWidthChart
          html={chartHtml}
          onExpand={() => onExpandChart(chartHtml)}
        />
      )}
    </div>
  )
}

/* ── Suggestion cards ──────────────────────────────────────────────────────── */
const SUGGESTIONS = [
  { icon: TrendingUp, text: 'Top 10 artists by revenue' },
  { icon: BarChart3,  text: 'Monthly invoice totals as a line chart' },
  { icon: Users,      text: 'Which customers spent the most?' },
  { icon: Search,     text: 'Genre distribution as a pie chart' },
]

/* ── Empty state ───────────────────────────────────────────────────────────── */
function EmptyState({ connected }: { connected: boolean }) {
  const { submit } = useQuerySubmit()
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-8 py-10">
      <div className="text-center">
        <div className="gradient-primary glow-primary mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl">
          <Diamond className="h-6 w-6" style={{ color: 'oklch(0.15 0.02 45)' }} fill="currentColor" />
        </div>
        <h2 className="font-display mb-2 text-2xl font-bold">What do you want to know?</h2>
        <p className="text-sm" style={{ color: 'oklch(0.72 0.03 70)' }}>
          {connected
            ? 'Ask anything about your data — I write SQL, fetch results, and draw charts.'
            : 'Connect a database to start querying, or just say hi.'}
        </p>
      </div>
      {connected && (
        <div className="grid w-full max-w-md grid-cols-2 gap-2">
          {SUGGESTIONS.map(({ icon: Icon, text }) => (
            <button
              key={text}
              onClick={() => submit(text)}
              className="glass-panel-subtle flex cursor-pointer items-start gap-2.5 rounded-xl p-3.5 text-left text-xs leading-snug transition hover:brightness-125 active:scale-95"
              style={{ color: 'oklch(0.72 0.03 70)' }}
            >
              <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: 'oklch(0.72 0.19 55)' }} />
              {text}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Main ──────────────────────────────────────────────────────────────────── */
export default function ChatHistory() {
  const { sessionId, chatHistory, showSql, updateEntry } = useSession()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [fullscreenHtml, setFullscreenHtml] = useState<string | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory.length, chatHistory.some(e => !e.pending)])

  if (!chatHistory.length) return <EmptyState connected={!!sessionId} />

  return (
    <>
      <div className="scrollbar-thin flex-1 space-y-6 overflow-y-auto py-6">
        {chatHistory.map(entry => (
          <MessagePair
            key={entry.id}
            entry={entry}
            showSql={showSql}
            onApproveResult={(id, res) => updateEntry(id, res)}
            onExpandChart={html => setFullscreenHtml(html)}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {fullscreenHtml && (
        <ChartModal
          html={fullscreenHtml}
          onClose={() => setFullscreenHtml(null)}
        />
      )}
    </>
  )
}
