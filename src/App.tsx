import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LogOut, Settings, ChevronDown, X,
  User, Shield, Trash2, Database, MessageSquare,
  LayoutDashboard,
} from 'lucide-react'
import Sidebar from './components/Sidebar'
import ChatHistory from './components/ChatHistory'
import QueryInput from './components/QueryInput'
import Dashboard from './components/Dashboard'
import { useSession } from './context/SessionContext'
import { useProject } from './context/ProjectContext'
import { useAuth } from './context/AuthContext'

/* ── Settings Modal ──────────────────────────────────────────────────────── */
function SettingsModal({ onClose }: { onClose: () => void }) {
  const { user, signOut } = useAuth()
  const { projects, deleteProject } = useProject()
  const { loadChatHistory } = useSession()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'account' | 'data'>('account')
  const [confirming, setConfirming] = useState(false)

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : '—'

  async function clearAllData() {
    for (const p of projects) await deleteProject(p.id)
    loadChatHistory([])
    setConfirming(false)
    onClose()
  }

  async function handleDeleteAccount() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ background: 'oklch(0 0 0 / 0.60)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <div
        className="glass-panel relative z-10 flex w-full max-w-lg flex-col overflow-hidden"
        style={{ maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid oklch(1 0 0 / 0.08)' }}>
          <h2 className="font-display text-base font-semibold">Settings</h2>
          <button onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-white/10"
            style={{ color: 'oklch(0.72 0.03 70)' }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Tabs */}
          <nav className="flex shrink-0 flex-col gap-0.5 p-3"
            style={{ width: 140, borderRight: '1px solid oklch(1 0 0 / 0.08)' }}>
            {([
              { id: 'account', label: 'Account', icon: User },
              { id: 'data',    label: 'Data',    icon: Database },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition"
                style={{
                  background: tab === id ? 'oklch(1 0 0 / 0.08)' : 'transparent',
                  color: tab === id ? 'oklch(0.97 0.01 80)' : 'oklch(0.72 0.03 70)',
                }}>
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">

            {tab === 'account' && (
              <div className="flex flex-col gap-5">
                {/* Avatar + email */}
                <div className="flex items-center gap-4 rounded-xl p-4"
                  style={{ background: 'oklch(1 0 0 / 0.04)', border: '1px solid oklch(1 0 0 / 0.08)' }}>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold"
                    style={{ background: 'oklch(0.72 0.19 55 / 0.20)', color: 'oklch(0.72 0.19 55)', border: '1px solid oklch(0.72 0.19 55 / 0.30)' }}>
                    {user?.email?.[0].toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium" style={{ color: 'oklch(0.97 0.01 80)' }}>
                      {user?.email}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'oklch(0.72 0.03 70)' }}>
                      Member since {memberSince}
                    </div>
                  </div>
                </div>

                {/* Plan */}
                <div>
                  <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest"
                    style={{ color: 'oklch(0.72 0.03 70 / 0.70)' }}>Plan</label>
                  <div className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{ background: 'oklch(1 0 0 / 0.04)', border: '1px solid oklch(1 0 0 / 0.08)' }}>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'oklch(0.97 0.01 80)' }}>Free</div>
                      <div className="text-xs mt-0.5" style={{ color: 'oklch(0.72 0.03 70)' }}>
                        Unlimited projects · Community support
                      </div>
                    </div>
                    <span className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                      style={{ background: 'oklch(0.72 0.19 55 / 0.15)', color: 'oklch(0.72 0.19 55)', border: '1px solid oklch(0.72 0.19 55 / 0.25)' }}>
                      Free
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest"
                    style={{ color: 'oklch(0.72 0.03 70 / 0.70)' }}>Usage</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: MessageSquare, label: 'Projects', value: projects.length },
                      { icon: Shield, label: 'Auth', value: 'Supabase' },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3 rounded-xl px-4 py-3"
                        style={{ background: 'oklch(1 0 0 / 0.04)', border: '1px solid oklch(1 0 0 / 0.08)' }}>
                        <Icon className="h-4 w-4 shrink-0" style={{ color: 'oklch(0.72 0.19 55)' }} />
                        <div>
                          <div className="text-xs font-semibold" style={{ color: 'oklch(0.97 0.01 80)' }}>{value}</div>
                          <div className="text-[10px]" style={{ color: 'oklch(0.72 0.03 70)' }}>{label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coming soon */}
                <div className="rounded-xl px-4 py-3"
                  style={{ background: 'oklch(1 0 0 / 0.03)', border: '1px dashed oklch(1 0 0 / 0.10)' }}>
                  <p className="text-xs" style={{ color: 'oklch(0.72 0.03 70 / 0.60)' }}>
                    ✦ Themes, notifications, and API key management coming in a future update.
                  </p>
                </div>
              </div>
            )}

            {tab === 'data' && (
              <div className="flex flex-col gap-5">
                <div>
                  <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest"
                    style={{ color: 'oklch(0.72 0.03 70 / 0.70)' }}>Your data</label>
                  <div className="rounded-xl px-4 py-3"
                    style={{ background: 'oklch(1 0 0 / 0.04)', border: '1px solid oklch(1 0 0 / 0.08)' }}>
                    <p className="text-sm" style={{ color: 'oklch(0.72 0.03 70)' }}>
                      You have <span className="font-semibold" style={{ color: 'oklch(0.97 0.01 80)' }}>{projects.length}</span> project{projects.length !== 1 ? 's' : ''} stored.
                      All data is private — only you can see it.
                    </p>
                  </div>
                </div>

                {/* Danger zone */}
                <div>
                  <label className="mb-2 block text-[11px] font-medium uppercase tracking-widest"
                    style={{ color: 'oklch(0.72 0.03 70 / 0.70)' }}>Danger zone</label>
                  <div className="flex flex-col gap-2 rounded-xl p-4"
                    style={{ background: 'oklch(0.55 0.22 25 / 0.08)', border: '1px solid oklch(0.55 0.22 25 / 0.20)' }}>

                    {!confirming ? (
                      <button
                        onClick={() => setConfirming(true)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition hover:bg-white/5"
                        style={{ color: 'oklch(0.80 0.15 25)' }}
                      >
                        <Trash2 className="h-4 w-4 shrink-0" />
                        Clear all projects &amp; chat history
                      </button>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <p className="text-xs leading-relaxed" style={{ color: 'oklch(0.80 0.15 25)' }}>
                          This will permanently delete all {projects.length} project{projects.length !== 1 ? 's' : ''} and their messages. This cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <button onClick={() => setConfirming(false)}
                            className="flex-1 rounded-lg py-2 text-xs transition hover:bg-white/5"
                            style={{ border: '1px solid oklch(1 0 0 / 0.12)', color: 'oklch(0.72 0.03 70)' }}>
                            Cancel
                          </button>
                          <button onClick={clearAllData}
                            className="flex-1 rounded-lg py-2 text-xs font-medium transition hover:brightness-110"
                            style={{ background: 'oklch(0.55 0.22 25 / 0.30)', color: 'oklch(0.90 0.10 25)', border: '1px solid oklch(0.55 0.22 25 / 0.40)' }}>
                            Yes, delete all
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleDeleteAccount}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition hover:bg-white/5"
                      style={{ color: 'oklch(0.80 0.15 25)' }}
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      Sign out of all devices
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── User Menu ───────────────────────────────────────────────────────────── */
function UserMenu({ onSettings }: { onSettings: () => void }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const initials = user?.email ? user.email[0].toUpperCase() : '?'
  const email = user?.email ?? ''

  async function handleSignOut() {
    setOpen(false)
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-white/5"
        aria-label="Account menu"
      >
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold"
          style={{ background: 'oklch(0.72 0.19 55 / 0.20)', color: 'oklch(0.72 0.19 55)', border: '1px solid oklch(0.72 0.19 55 / 0.30)' }}
        >
          {initials}
        </div>
        <ChevronDown
          className="h-3.5 w-3.5 transition-transform"
          style={{ color: 'oklch(0.72 0.03 70)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl py-1 shadow-2xl"
          style={{ background: 'oklch(0.22 0.04 50)', border: '1px solid oklch(0.35 0.05 55 / 50%)' }}
        >
          <div className="px-4 py-3" style={{ borderBottom: '1px solid oklch(0.35 0.05 55 / 40%)' }}>
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                style={{ background: 'oklch(0.72 0.19 55 / 0.20)', color: 'oklch(0.72 0.19 55)', border: '1px solid oklch(0.72 0.19 55 / 0.30)' }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-medium" style={{ color: 'oklch(0.97 0.01 80)' }}>
                  {email}
                </div>
                <div className="text-[11px]" style={{ color: 'oklch(0.72 0.03 70)' }}>Free plan</div>
              </div>
            </div>
          </div>

          <div className="py-1">
            <button
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-white/5"
              style={{ color: 'oklch(0.72 0.03 70)' }}
              onClick={() => { setOpen(false); onSettings() }}
            >
              <Settings className="h-4 w-4 shrink-0" />
              Settings
            </button>
            <button
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-white/5"
              style={{ color: 'oklch(0.80 0.15 25)' }}
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── App ─────────────────────────────────────────────────────────────────── */
export default function App() {
  const { sessionId, dbType, showSql, setShowSql } = useSession()
  const { dashboardItems } = useProject()
  const [showSettings, setShowSettings] = useState(false)
  const [view, setView] = useState<'chat' | 'dashboard'>('chat')

  return (
    <div className="hero-bg relative flex h-screen overflow-hidden text-foreground">

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full blur-[140px]"
          style={{ background: 'oklch(0.55 0.22 50 / 0.18)' }} />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full blur-[120px]"
          style={{ background: 'oklch(0.78 0.18 60 / 0.12)' }} />
      </div>

      <Sidebar />

      <main className="relative z-10 flex h-full min-w-0 flex-1 flex-col">

        <header className="flex h-16 shrink-0 items-center justify-between px-6"
          style={{ borderBottom: '1px solid oklch(0.35 0.05 55 / 40%)' }}>

          {/* Left: title + view toggle */}
          <div className="flex items-center gap-4">
            <div>
              <div className="font-display text-sm font-semibold">BI Agent</div>
              <div className="text-[11px]" style={{ color: 'oklch(0.72 0.03 70)' }}>
                Natural language to SQL
              </div>
            </div>

            {/* Chat / Dashboard toggle pill */}
            <div
              className="flex items-center rounded-lg p-0.5 text-xs"
              style={{ background: 'oklch(1 0 0 / 0.06)', border: '1px solid oklch(1 0 0 / 0.09)' }}
            >
              <button
                onClick={() => setView('chat')}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all"
                style={{
                  background: view === 'chat' ? 'oklch(0.72 0.19 55 / 0.18)' : 'transparent',
                  color: view === 'chat' ? 'oklch(0.87 0.08 65)' : 'oklch(0.72 0.03 70)',
                  border: view === 'chat' ? '1px solid oklch(0.72 0.19 55 / 0.30)' : '1px solid transparent',
                }}
              >
                <MessageSquare className="h-3 w-3" />
                Chat
              </button>
              <button
                onClick={() => setView('dashboard')}
                className="relative flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all"
                style={{
                  background: view === 'dashboard' ? 'oklch(0.72 0.19 55 / 0.18)' : 'transparent',
                  color: view === 'dashboard' ? 'oklch(0.87 0.08 65)' : 'oklch(0.72 0.03 70)',
                  border: view === 'dashboard' ? '1px solid oklch(0.72 0.19 55 / 0.30)' : '1px solid transparent',
                }}
              >
                <LayoutDashboard className="h-3 w-3" />
                Dashboard
                {dashboardItems.length > 0 && (
                  <span
                    className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold"
                    style={{ background: 'oklch(0.72 0.19 55)', color: 'oklch(0.15 0.02 45)' }}
                  >
                    {dashboardItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Right: controls */}
          <div className="flex items-center gap-2">
            <UserMenu onSettings={() => setShowSettings(true)} />

            <div
              className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition"
              style={sessionId ? {
                borderColor: 'oklch(0.72 0.19 55 / 0.40)',
                background: 'oklch(0.72 0.19 55 / 0.10)',
                color: 'oklch(0.72 0.19 55)',
              } : {
                borderColor: 'oklch(0.35 0.05 55 / 60%)',
                background: 'oklch(1 0 0 / 0.05)',
                color: 'oklch(0.72 0.03 70)',
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: sessionId ? 'oklch(0.72 0.19 55)' : 'oklch(0.72 0.03 70 / 0.60)',
                  animation: sessionId ? 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' : 'none',
                }}
              />
              {sessionId ? `${dbType} · connected` : 'No database'}
            </div>

            {sessionId && view === 'chat' && (
              <button
                onClick={() => setShowSql(!showSql)}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition"
                style={{
                  borderColor: showSql ? 'oklch(0.72 0.19 55 / 0.40)' : 'oklch(0.35 0.05 55 / 40%)',
                  background: showSql ? 'oklch(0.72 0.19 55 / 0.10)' : 'oklch(1 0 0 / 0.04)',
                  color: showSql ? 'oklch(0.72 0.19 55)' : 'oklch(0.72 0.03 70)',
                  fontFamily: 'monospace',
                }}
              >
                {'<>'} SQL
              </button>
            )}
          </div>
        </header>

        {view === 'chat' ? (
          <>
            <ChatHistory />
            <QueryInput />
          </>
        ) : (
          <Dashboard />
        )}
      </main>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  )
}
