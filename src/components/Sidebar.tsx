import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Diamond, Plus, MessageSquare, Database, Settings,
  PanelLeftClose, PanelLeft, Trash2, X,
} from 'lucide-react'
import { useSession } from '@/context/SessionContext'
import ConnectionPanel from './ConnectionPanel'

type Thread = { id: string; title: string; updatedAt: string }

/* ── Connect DB Modal ─────────────────────────────────────────────────────── */
function ConnectModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'oklch(0 0 0 / 0.55)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      {/* Panel */}
      <div className="glass-panel relative z-10 w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-base font-semibold">Connect database</h2>
          <button onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-white/10"
            style={{ color: 'oklch(0.72 0.03 70)' }}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <ConnectionPanel onConnected={onClose} />
      </div>
    </div>
  )
}

export default function Sidebar() {
  const { sessionId, dbType, clearHistory } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const [showConnect, setShowConnect] = useState(false)
  const [threads, setThreads] = useState<Thread[]>([
    { id: 't1', title: 'Q4 revenue analysis', updatedAt: '2h ago' },
    { id: 't2', title: 'Churn cohort by plan', updatedAt: 'Yesterday' },
    { id: 't3', title: 'Top SKUs — EU region', updatedAt: 'Mon' },
  ])
  const [activeId, setActiveId] = useState('t1')

  function newThread() {
    const id = `t${Date.now()}`
    setThreads(t => [{ id, title: 'New chat', updatedAt: 'now' }, ...t])
    setActiveId(id)
    clearHistory()
  }

  return (
    <>
      <aside
        className="relative z-10 flex h-full shrink-0 flex-col transition-all duration-300"
        style={{
          width: collapsed ? 64 : 288,
          borderRight: '1px solid oklch(0.35 0.05 55 / 40%)',
          background: 'oklch(0.25 0.04 50 / 45%)',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        }}
      >
        {/* Brand + collapse toggle */}
        <div className="flex h-16 items-center justify-between px-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-white/5"
          >
            <div className="gradient-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <Diamond className="h-4 w-4" style={{ color: 'oklch(0.15 0.02 45)' }} fill="currentColor" />
            </div>
            {!collapsed && (
              <span className="font-display text-sm font-semibold">BI Agent</span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(c => !c)}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-white/5"
            style={{ color: 'oklch(0.72 0.03 70)' }}
            aria-label="Toggle sidebar"
          >
            {collapsed
              ? <PanelLeft className="h-4 w-4" />
              : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {/* New chat */}
        <div className="px-3">
          <button
            onClick={newThread}
            className={`gradient-primary flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium shadow-md transition hover:brightness-110 ${collapsed ? 'justify-center' : ''}`}
            style={{ color: 'oklch(0.15 0.02 45)' }}
          >
            <Plus className="h-4 w-4 shrink-0" />
            {!collapsed && <span>New chat</span>}
          </button>
        </div>

        {/* Thread list */}
        <div className="mt-6 flex-1 overflow-y-auto scrollbar-thin px-2">
          {!collapsed && (
            <div className="px-2 pb-2 text-[11px] font-medium uppercase tracking-widest"
              style={{ color: 'oklch(0.72 0.03 70 / 0.70)' }}>
              Recent
            </div>
          )}
          <div className="space-y-0.5">
            {threads.map(t => {
              const active = t.id === activeId
              return (
                <div
                  key={t.id}
                  onClick={() => { setActiveId(t.id); clearHistory() }}
                  className="group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm transition"
                  style={{
                    background: active ? 'oklch(0.72 0.19 55 / 0.15)' : 'transparent',
                    color: active ? 'oklch(0.97 0.01 80)' : 'oklch(0.72 0.03 70)',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'oklch(1 0 0 / 0.05)' }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <MessageSquare
                    className="h-4 w-4 shrink-0"
                    style={{ color: active ? 'oklch(0.72 0.19 55)' : undefined }}
                  />
                  {!collapsed && (
                    <>
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{t.title}</div>
                        <div className="text-[10px]" style={{ color: 'oklch(0.72 0.03 70 / 0.70)' }}>
                          {t.updatedAt}
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setThreads(all => all.filter(x => x.id !== t.id)) }}
                        className="opacity-0 transition group-hover:opacity-100"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5 hover:text-red-400"
                          style={{ color: 'oklch(0.72 0.03 70)' }} />
                      </button>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer: DB + Settings */}
        <div className="p-3" style={{ borderTop: '1px solid oklch(0.35 0.05 55 / 40%)' }}>
          <button
            onClick={() => setShowConnect(true)}
            className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}
            style={{ color: sessionId ? 'oklch(0.72 0.19 55)' : 'oklch(0.72 0.03 70)' }}
          >
            <Database className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{sessionId ? dbType : 'Connect database'}</span>
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: sessionId ? 'oklch(0.72 0.19 55)' : 'oklch(0.72 0.03 70 / 0.50)' }}
                />
              </>
            )}
          </button>

          {!collapsed && (
            <button
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-white/5 hover:text-foreground"
              style={{ color: 'oklch(0.72 0.03 70)' }}
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
          )}
        </div>
      </aside>

      {showConnect && <ConnectModal onClose={() => setShowConnect(false)} />}
    </>
  )
}
