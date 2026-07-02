import React, { useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { useSession } from '@/context/SessionContext'
import { useQuerySubmit } from '@/hooks/useQuerySubmit'

export default function QueryInput() {
  const { sessionId } = useSession()
  const { submit, loading } = useQuerySubmit()
  const [question, setQuestion] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = question.trim()
    if (!q || loading) return
    setQuestion('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    await submit(q)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  function autoResize(e: React.FormEvent<HTMLTextAreaElement>) {
    const t = e.currentTarget
    t.style.height = 'auto'
    t.style.height = Math.min(t.scrollHeight, 160) + 'px'
  }

  const hasText = question.trim().length > 0

  return (
    <div className="shrink-0 px-6 pb-6 pt-4">
      <div className="glass-panel flex items-end gap-3 px-5 py-3.5">
        <textarea
          ref={textareaRef}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={autoResize}
          placeholder={sessionId ? 'Ask anything about your data…' : 'Ask me anything…'}
          rows={1}
          disabled={loading}
          className="scrollbar-thin max-h-40 flex-1 resize-none bg-transparent text-sm leading-relaxed focus:outline-none"
          style={{ color: 'oklch(0.97 0.01 80)', caretColor: 'oklch(0.72 0.19 55)' }}
        />
        <button
          type="button"
          onClick={handleSubmit as unknown as React.MouseEventHandler}
          disabled={loading || !hasText}
          aria-label="Send"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all disabled:cursor-not-allowed disabled:opacity-30"
          style={{
            background: hasText && !loading ? 'var(--gradient-primary)' : 'oklch(1 0 0 / 0.07)',
            boxShadow: hasText && !loading ? 'var(--shadow-glow)' : 'none',
          }}
        >
          {loading
            ? <svg className="h-4 w-4 animate-spin" style={{ color: 'oklch(1 0 0 / 0.50)' }} viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            : <Send className="h-4 w-4 translate-x-px"
                style={{ color: hasText ? 'oklch(0.15 0.02 45)' : 'oklch(1 0 0 / 0.35)' }} />
          }
        </button>
      </div>
      <p className="mt-2 text-center text-[11px]" style={{ color: 'oklch(1 0 0 / 0.18)' }}>
        Enter to send · Shift+Enter for newline
      </p>
    </div>
  )
}
