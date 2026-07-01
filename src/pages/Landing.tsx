import { Link } from 'react-router-dom'
import {
  Diamond, Sparkles, Database, BarChart3, Zap,
  ArrowRight, MessageSquare,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Database,
    title: 'Any database',
    body: 'Postgres, MySQL, SQLite, Snowflake, BigQuery, DuckDB. Connect once, query in English forever.',
  },
  {
    icon: BarChart3,
    title: 'Instant charts',
    body: 'Auto-picks the right visualization for every answer — no dashboard building required.',
  },
  {
    icon: Zap,
    title: 'Explainable SQL',
    body: 'Every answer ships with the query and a plain-English rationale. Full transparency.',
  },
]

export default function Landing() {
  return (
    <div className="hero-bg min-h-screen text-foreground">

      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[120px]"
          style={{ background: 'oklch(0.55 0.22 50 / 0.20)' }} />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full blur-[100px]"
          style={{ background: 'oklch(0.78 0.18 60 / 0.15)' }} />
      </div>

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="glass-panel-subtle flex h-9 w-9 items-center justify-center rounded-lg">
            <Diamond className="h-4 w-4" style={{ color: 'oklch(0.72 0.19 55)' }} fill="currentColor" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">BI Agent</span>
        </div>

        <nav className="hidden items-center gap-8 text-sm md:flex" style={{ color: 'oklch(0.72 0.03 70)' }}>
          <a href="#features" className="transition hover:text-foreground">Features</a>
          <a href="#how" className="transition hover:text-foreground">How it works</a>
          <a href="#stack" className="transition hover:text-foreground">Stack</a>
        </nav>

        <Link to="/chat"
          className="glass-panel-subtle inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition hover:brightness-110">
          Open app <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-32 pt-20 text-center">

        {/* Eyebrow badge */}
        <div className="glass-panel-subtle mx-auto mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs">
          <Sparkles className="h-3.5 w-3.5" style={{ color: 'oklch(0.72 0.19 55)' }} />
          <span style={{ color: 'oklch(0.72 0.03 70)' }}>Natural language → SQL → Insight</span>
        </div>

        <h1 className="font-display text-5xl font-semibold tracking-tight md:text-7xl" style={{ textWrap: 'balance' }}>
          Talk to your data
          <br />
          <span className="text-gradient-primary">like a teammate.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg" style={{ color: 'oklch(0.72 0.03 70)' }}>
          BI Agent turns plain English into precise SQL, live charts, and business-ready answers —
          across every database you connect.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/chat"
            className="gradient-primary glow-primary group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition hover:brightness-110"
            style={{ color: 'oklch(0.15 0.02 45)' }}>
            <MessageSquare className="h-4 w-4" />
            Talk to your data
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <a href="#features"
            className="glass-panel-subtle inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition hover:brightness-110">
            See how it works
          </a>
        </div>

        {/* Preview mock chat card */}
        <div className="glass-panel mx-auto mt-20 max-w-3xl overflow-hidden p-6 text-left">
          <div className="mb-4 flex items-center gap-2 text-xs" style={{ color: 'oklch(0.72 0.03 70)' }}>
            <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: 'oklch(0.72 0.19 55)' }} />
            Live session · connected to sales.db
          </div>
          <div className="space-y-4">
            {/* User bubble */}
            <div className="flex justify-end">
              <div className="gradient-primary max-w-[70%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm"
                style={{ color: 'oklch(0.15 0.02 45)' }}>
                What were our top 3 products by revenue last quarter?
              </div>
            </div>
            {/* Bot response */}
            <div className="flex gap-3">
              <div className="glass-panel-subtle mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <Diamond className="h-3.5 w-3.5" style={{ color: 'oklch(0.72 0.19 55)' }} fill="currentColor" />
              </div>
              <div className="flex-1 rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={{ border: '1px solid oklch(0.72 0.19 55 / 0.20)', background: 'oklch(0.72 0.19 55 / 0.05)', color: 'oklch(0.87 0.02 75)' }}>
                <span className="text-xs font-medium" style={{ color: 'oklch(0.72 0.19 55)' }}>Query result · </span>
                Aurora Kit ($482k) · Nimbus Pro ($361k) · Meridian ($229k).
                Revenue is up 18% QoQ, driven by Aurora Kit.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 pb-32">
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="glass-panel p-6">
              <div className="glass-panel-subtle mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg">
                <Icon className="h-5 w-5" style={{ color: 'oklch(0.72 0.19 55)' }} />
              </div>
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm" style={{ color: 'oklch(0.72 0.03 70)' }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 mx-auto max-w-4xl px-6 pb-32">
        <h2 className="font-display mb-12 text-center text-3xl font-semibold">How it works</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { step: '01', title: 'Connect', desc: 'Point BI Agent at any database — SQLite file, cloud warehouse, or hosted Postgres.' },
            { step: '02', title: 'Ask', desc: 'Type your question in plain English. No SQL knowledge needed.' },
            { step: '03', title: 'Explore', desc: 'Get tables, charts, and written summaries — all backed by the exact SQL generated.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="relative">
              <div className="font-display mb-2 text-4xl font-bold" style={{ color: 'oklch(0.72 0.19 55 / 0.30)' }}>{step}</div>
              <h3 className="font-display mb-2 text-lg font-semibold">{title}</h3>
              <p className="text-sm" style={{ color: 'oklch(0.72 0.03 70)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stack section */}
      <section id="stack" className="relative z-10 mx-auto max-w-4xl px-6 pb-32">
        <div className="glass-panel-subtle rounded-2xl px-8 py-6">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest" style={{ color: 'oklch(0.72 0.03 70 / 0.70)' }}>
            Powered by
          </p>
          <div className="flex flex-wrap gap-3">
            {['LangGraph', 'FastAPI', 'OpenAI GPT-4o', 'Plotly', 'SQLAlchemy', 'React', 'Vite'].map(t => (
              <span key={t}
                className="rounded-lg px-3 py-1.5 text-xs font-medium"
                style={{ background: 'oklch(0.72 0.19 55 / 0.10)', border: '1px solid oklch(0.72 0.19 55 / 0.20)', color: 'oklch(0.72 0.19 55)' }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24">
        <div className="glass-panel flex flex-col items-center gap-6 p-10 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="font-display text-2xl font-semibold md:text-3xl" style={{ textWrap: 'balance' }}>
              Ready to stop writing SQL by hand?
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'oklch(0.72 0.03 70)' }}>
              Connect a database and ask your first question in under a minute.
            </p>
          </div>
          <Link to="/chat"
            className="gradient-primary glow-primary inline-flex shrink-0 items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition hover:brightness-110"
            style={{ color: 'oklch(0.15 0.02 45)' }}>
            Try it now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="relative z-10 py-8 text-center text-xs" style={{ borderTop: '1px solid oklch(0.35 0.05 55 / 40%)', color: 'oklch(0.72 0.03 70)' }}>
        © 2026 BI Agent · LangGraph · FastAPI · OpenAI
      </footer>
    </div>
  )
}
