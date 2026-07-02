import { useState } from 'react'
import { freeChat, runQuery } from '@/api/query'
import { useSession } from '@/context/SessionContext'

export function useQuerySubmit() {
  const { sessionId, chatHistory, addEntry, updateEntry } = useSession()
  const [loading, setLoading] = useState(false)

  async function submit(question: string) {
    const q = question.trim()
    if (!q || loading) return

    setLoading(true)
    const id = crypto.randomUUID()
    addEntry({ id, question: q, pending: true, timestamp: new Date() })

    if (!sessionId) {
      try {
        const history = chatHistory
          .filter(e => !e.isSystem && !e.pending && e.response?.result_type === 'message')
          .slice(-6)
          .flatMap(e => [
            { role: 'user', content: e.question },
            { role: 'assistant', content: e.response?.message ?? '' },
          ])
        const reply = await freeChat(q, history)
        updateEntry(id, { result_type: 'message', message: reply })
      } catch {
        updateEntry(id, { result_type: 'message', message: "I'm having trouble right now. Please try again." })
      }
      setLoading(false)
      return
    }

    try {
      const response = await runQuery({ question: q })
      updateEntry(id, response)
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail ?? 'Request failed — is the API server running?'
      updateEntry(id, { result_type: 'error', error: detail })
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading }
}
