import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Diamond, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Login() {
  const { user, loading, signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [checkInbox, setCheckInbox] = useState<string | null>(null) // holds the email after signup

  useEffect(() => {
    if (!loading && user) navigate('/chat', { replace: true })
  }, [user, loading, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setCheckInbox(null)
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      return
    }
    setSubmitting(true)
    if (mode === 'signin') {
      const { error } = await signIn(email, password)
      if (error) setError(error)
      else navigate('/chat', { replace: true })
    } else {
      const { error } = await signUp(email, password)
      if (error && !error.startsWith('Check your email')) {
        setError(error)
      } else {
        setCheckInbox(email) // show inbox prompt screen
      }
    }
    setSubmitting(false)
  }

  function switchMode() {
    setMode(m => m === 'signin' ? 'signup' : 'signin')
    setError(null)
    setCheckInbox(null)
  }

  if (loading) {
    return (
      <div className="hero-bg flex h-screen items-center justify-center">
        <Diamond className="h-6 w-6 animate-pulse" style={{ color: 'oklch(0.72 0.19 55)' }} fill="currentColor" />
      </div>
    )
  }

  // ── Signup success — show inbox prompt ──────────────────────────────────────
  if (checkInbox) {
    return (
      <div className="hero-bg relative flex min-h-screen flex-col items-center justify-center px-4">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/4 h-[440px] w-[440px] rounded-full blur-[130px]"
            style={{ background: 'oklch(0.55 0.22 50 / 0.16)' }} />
          <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full blur-[110px]"
            style={{ background: 'oklch(0.78 0.18 60 / 0.10)' }} />
        </div>

        <div className="glass-panel relative z-10 w-full max-w-sm px-8 py-10 text-center">
          {/* Mail icon */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: 'oklch(0.72 0.19 55 / 0.15)', border: '1px solid oklch(0.72 0.19 55 / 0.25)' }}>
            <Mail className="h-6 w-6" style={{ color: 'oklch(0.72 0.19 55)' }} />
          </div>

          <h2 className="font-display mb-2 text-xl font-bold" style={{ color: 'oklch(0.97 0.01 80)' }}>
            Check your inbox
          </h2>
          <p className="mb-5 text-sm" style={{ color: 'oklch(0.72 0.03 70)' }}>
            We sent a confirmation link to
          </p>

          {/* Email pill */}
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5"
            style={{ background: 'oklch(0.72 0.19 55 / 0.12)', border: '1px solid oklch(0.72 0.19 55 / 0.25)' }}>
            <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: 'oklch(0.72 0.19 55)' }} />
            <span className="text-sm font-medium" style={{ color: 'oklch(0.87 0.02 75)' }}>{checkInbox}</span>
          </div>

          <p className="mb-8 text-xs leading-relaxed" style={{ color: 'oklch(0.72 0.03 70)' }}>
            Click the link in the email to activate your account, then come back to sign in.
          </p>

          <button
            onClick={() => { setCheckInbox(null); setMode('signin'); setPassword('') }}
            className="gradient-primary w-full rounded-xl py-3 text-sm font-semibold transition hover:brightness-110"
            style={{ color: 'oklch(0.15 0.02 45)' }}>
            Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="hero-bg relative flex min-h-screen flex-col items-center justify-center px-4">

      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-[440px] w-[440px] rounded-full blur-[130px]"
          style={{ background: 'oklch(0.55 0.22 50 / 0.16)' }} />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full blur-[110px]"
          style={{ background: 'oklch(0.78 0.18 60 / 0.10)' }} />
      </div>

      {/* Back to home */}
      <Link to="/" className="absolute left-6 top-6 flex items-center gap-2 text-xs transition hover:opacity-80"
        style={{ color: 'oklch(0.72 0.03 70)' }}>
        ← Back to home
      </Link>

      {/* Card */}
      <div className="glass-panel relative z-10 w-full max-w-sm px-8 py-9">

        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="gradient-primary glow-primary flex h-12 w-12 items-center justify-center rounded-2xl">
            <Diamond className="h-5 w-5" style={{ color: 'oklch(0.15 0.02 45)' }} fill="currentColor" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-xl font-bold" style={{ color: 'oklch(0.97 0.01 80)' }}>
              BI Agent
            </h1>
            <p className="mt-0.5 text-xs" style={{ color: 'oklch(0.72 0.03 70)' }}>
              {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="mb-6 flex rounded-xl p-1" style={{ background: 'oklch(1 0 0 / 0.05)' }}>
          {(['signin', 'signup'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(null); setCheckInbox(null) }}
              className="flex-1 rounded-lg py-2 text-xs font-medium transition-all"
              style={mode === m ? {
                background: 'oklch(0.72 0.19 55 / 0.20)',
                color: 'oklch(0.72 0.19 55)',
                border: '1px solid oklch(0.72 0.19 55 / 0.30)',
              } : {
                color: 'oklch(0.72 0.03 70)',
                border: '1px solid transparent',
              }}>
              {m === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          {/* Email */}
          <div className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: 'oklch(1 0 0 / 0.05)', border: '1px solid oklch(1 0 0 / 0.09)' }}>
            <Mail className="h-4 w-4 shrink-0" style={{ color: 'oklch(0.72 0.03 70)' }} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="flex-1 bg-transparent text-sm focus:outline-none"
              style={{ color: 'oklch(0.97 0.01 80)', caretColor: 'oklch(0.72 0.19 55)' }}
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: 'oklch(1 0 0 / 0.05)', border: '1px solid oklch(1 0 0 / 0.09)' }}>
            <Lock className="h-4 w-4 shrink-0" style={{ color: 'oklch(0.72 0.03 70)' }} />
            <input
              type={showPw ? 'text' : 'password'}
              placeholder={mode === 'signup' ? 'Password (min 6 chars)' : 'Password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              className="flex-1 bg-transparent text-sm focus:outline-none"
              style={{ color: 'oklch(0.97 0.01 80)', caretColor: 'oklch(0.72 0.19 55)' }}
            />
            <button type="button" onClick={() => setShowPw(p => !p)}
              className="shrink-0 transition hover:opacity-80"
              style={{ color: 'oklch(0.72 0.03 70)' }}>
              {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Error / success */}
          {error && (
            <p className="rounded-lg px-3 py-2 text-xs"
              style={{ background: 'oklch(0.55 0.22 25 / 0.15)', border: '1px solid oklch(0.55 0.22 25 / 0.30)', color: 'oklch(0.80 0.15 25)' }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="gradient-primary glow-primary mt-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-50"
            style={{ color: 'oklch(0.15 0.02 45)' }}
          >
            {submitting ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <>
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch mode link */}
        <p className="mt-5 text-center text-xs" style={{ color: 'oklch(0.72 0.03 70)' }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={switchMode} className="font-medium transition hover:underline"
            style={{ color: 'oklch(0.72 0.19 55)' }}>
            {mode === 'signin' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-8 text-center text-[11px]" style={{ color: 'oklch(1 0 0 / 0.18)' }}>
        By signing in you agree to use this responsibly.
      </p>
    </div>
  )
}
