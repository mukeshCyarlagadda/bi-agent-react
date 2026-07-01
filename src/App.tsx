import Sidebar from './components/Sidebar'
import ChatHistory from './components/ChatHistory'
import QueryInput from './components/QueryInput'
import { useSession } from './context/SessionContext'

export default function App() {
  const { sessionId, dbType, showSql, setShowSql } = useSession()

  return (
    <div className="hero-bg relative flex h-screen overflow-hidden text-foreground">

      {/* Ambient orbs — exactly like the Lovable design */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full blur-[140px]"
          style={{ background: 'oklch(0.55 0.22 50 / 0.18)' }} />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full blur-[120px]"
          style={{ background: 'oklch(0.78 0.18 60 / 0.12)' }} />
      </div>

      {/* Collapsible sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="relative z-10 flex h-full min-w-0 flex-1 flex-col">

        {/* Top header bar */}
        <header className="flex h-16 shrink-0 items-center justify-between px-6"
          style={{ borderBottom: '1px solid oklch(0.35 0.05 55 / 40%)' }}>
          <div>
            <div className="font-display text-sm font-semibold">BI Agent</div>
            <div className="text-[11px]" style={{ color: 'oklch(0.72 0.03 70)' }}>
              Natural language to SQL
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Connection status pill */}
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

            {/* SQL toggle */}
            {sessionId && (
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

        {/* Messages */}
        <ChatHistory />

        {/* Composer */}
        <QueryInput />
      </main>
    </div>
  )
}
