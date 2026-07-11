import { Link } from 'react-router-dom'
import {
  Diamond, Sparkles, Database, BarChart3, Zap,
  ArrowRight, MessageSquare, Mail,
} from 'lucide-react'

/* ── Custom SVG icons ───────────────────────────────────────────────────────── */

function LinkedInLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function GitHubLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

/* iPhone outline — currentColor stroke */
function IPhoneLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="1" width="14" height="22" rx="3" ry="3" />
      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.2" />
    </svg>
  )
}

/* MY monogram — portfolio logo */
function MyMonogram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-4 -4 32 32" fill="currentColor" aria-hidden="true">
      <text x="12" y="19" textAnchor="middle" fontSize="26"
        fontFamily="'Space Grotesk', ui-sans-serif, system-ui, sans-serif"
        fontWeight="700" letterSpacing="-1.5">MY</text>
    </svg>
  )
}

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
          <span className="font-display text-lg font-semibold tracking-tight">Kensho AI</span>
        </div>

        <nav className="hidden items-center gap-8 text-sm md:flex" style={{ color: 'oklch(0.72 0.03 70)' }}>
          <a href="#features" className="transition hover:text-foreground">Features</a>
          <a href="#how" className="transition hover:text-foreground">How it works</a>
          <a href="#stack" className="transition hover:text-foreground">Stack</a>
          <a href="#contact" className="transition hover:text-foreground">Contact</a>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/login"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition hover:brightness-110"
            style={{ color: 'oklch(0.72 0.03 70)' }}>
            Sign In
          </Link>
          <Link to="/login"
            className="gradient-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition hover:brightness-110"
            style={{ color: 'oklch(0.15 0.02 45)' }}>
            Get Started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
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
          Kensho AI turns plain English into precise SQL, live charts, and business-ready answers —
          across every database you connect.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/login"
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
            { step: '01', title: 'Connect', desc: 'Point Kensho AI at any database — SQLite file, cloud warehouse, or hosted Postgres.' },
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
          <Link to="/login"
            className="gradient-primary glow-primary inline-flex shrink-0 items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition hover:brightness-110"
            style={{ color: 'oklch(0.15 0.02 45)' }}>
            Try it now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="relative z-10 mx-auto max-w-4xl px-6 pb-24">
        <div className="mb-10 text-center">
          <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'oklch(0.72 0.03 70 / 0.60)' }}>Built by</p>
          <h2 className="font-display mt-2 text-3xl font-semibold">Get in touch</h2>
        </div>

        <div className="glass-panel mx-auto max-w-lg overflow-hidden">
          {/* Top strip */}
          <div className="gradient-primary px-8 py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: 'oklch(0 0 0 / 0.18)', border: '1px solid oklch(1 0 0 / 0.20)' }}>
              <span className="font-display text-2xl font-bold" style={{ color: 'oklch(0.15 0.02 45)' }}>MY</span>
            </div>
            <h3 className="font-display text-xl font-bold" style={{ color: 'oklch(0.15 0.02 45)' }}>
              Mukesh Yarlagadda
            </h3>
            <span className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: 'oklch(0 0 0 / 0.18)', color: 'oklch(0.15 0.02 45)' }}>
              AI Engineer
            </span>
          </div>

          {/* Info rows */}
          <div className="divide-y px-8 py-2" style={{ borderColor: 'oklch(1 0 0 / 0.06)' }}>
            {[
              { icon: Mail,         label: 'Email',     value: 'mukeshchandra4409@gmail.com',   href: "mailto:mukeshchandra4409@gmail.com?subject=Kensho AI — Let's connect", color: 'oklch(0.97 0.01 80)' },
              { icon: IPhoneLogo,   label: 'Phone',     value: '+1 (469) 468-2791',             href: 'tel:+14694682791',                                                    color: 'oklch(0.97 0.01 80)' },
              { icon: LinkedInLogo, label: 'LinkedIn',  value: 'mukesh-chandra-yarlagadda',     href: 'https://linkedin.com/in/mukesh-chandra-yarlagadda',                   color: 'oklch(0.72 0.19 55)' },
              { icon: GitHubLogo,   label: 'GitHub',    value: 'mukeshCYarlagadda',             href: 'https://github.com/mukeshCYarlagadda',                                color: 'oklch(0.72 0.19 55)' },
              { icon: MyMonogram,   label: 'Portfolio', value: 'mukeshcyarlagadda.netlify.app', href: 'https://mukeshcyarlagadda.netlify.app',                               color: 'oklch(0.72 0.19 55)' },
            ].map(({ icon: Icon, label, value, href, color }) => (
              <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-lg px-1 py-3.5 text-sm transition-all duration-150 group"
                style={{ background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'oklch(1 0 0 / 0.035)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${color === 'oklch(0.97 0.01 80)' ? 'oklch(1 0 0 / 0.08)' : 'oklch(0.72 0.19 55 / 0.12)'}`, border: `1px solid ${color === 'oklch(0.97 0.01 80)' ? 'oklch(1 0 0 / 0.14)' : 'oklch(0.72 0.19 55 / 0.20)'}` }}>
                  <Icon className="h-3.5 w-3.5" style={{ color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'oklch(0.72 0.03 70 / 0.60)' }}>{label}</div>
                  <div className="truncate text-xs font-medium" style={{ color: 'oklch(0.87 0.02 75)' }}>{value}</div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-all duration-150 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0"
                  style={{ color: 'oklch(0.72 0.19 55)' }} />
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="px-8 pb-8 pt-4">
            <a href="mailto:mukeshchandra4409@gmail.com?subject=Kensho AI — Let's connect"
              className="gradient-primary glow-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition hover:brightness-110"
              style={{ color: 'oklch(0.15 0.02 45)' }}>
              <Mail className="h-4 w-4" />
              Send an email
            </a>
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-8 text-center text-xs" style={{ borderTop: '1px solid oklch(0.35 0.05 55 / 40%)', color: 'oklch(0.72 0.03 70)' }}>
        © 2026 Kensho AI · LangGraph · FastAPI · OpenAI
      </footer>
    </div>
  )
}
