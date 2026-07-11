import { useRef, useState } from 'react'
import { freeChat, runQuery } from '@/api/query'
import { useSession } from '@/context/SessionContext'
import { useProject } from '@/context/ProjectContext'

export function useQuerySubmit() {
  const { sessionId, dbType, chatHistory, addEntry, updateEntry } = useSession()
  const { activeProjectId, createProject, saveMessage } = useProject()
  const [loading, setLoading] = useState(false)

  // Ref so the async chain always sees the latest activeProjectId
  const projectIdRef = useRef<string | null>(activeProjectId)
  projectIdRef.current = activeProjectId

  async function submit(question: string) {
    const q = question.trim()
    if (!q || loading) return

    setLoading(true)
    const entryId = crypto.randomUUID()
    addEntry({ id: entryId, question: q, pending: true, timestamp: new Date() })

    // Resolve or auto-create a project for this message
    let projectId = projectIdRef.current
    if (!projectId) {
      try {
        projectId = await createProject({
          title: q.slice(0, 60),
          dbType: dbType ?? undefined,
          backendSessionId: sessionId ?? undefined,
        })
        projectIdRef.current = projectId
      } catch {
        // Not signed in or Supabase unavailable — continue without persisting
      }
    }

    if (!sessionId) {
      // Free-chat mode (no DB connected)
      try {
        const history = chatHistory
          .filter(e => !e.isSystem && !e.pending && e.response?.result_type === 'message')
          .slice(-6)
          .flatMap(e => [
            { role: 'user', content: e.question },
            { role: 'assistant', content: e.response?.message ?? '' },
          ])
        const reply = await freeChat(q, history)
        const response = { result_type: 'message' as const, message: reply }
        updateEntry(entryId, response)
        if (projectId) await saveMessage(projectId, q, response).catch(() => {})
      } catch {
        updateEntry(entryId, { result_type: 'message', message: "I'm having trouble right now. Please try again." })
      }
      setLoading(false)
      return
    }

    // DB query mode
    try {
      const response = await runQuery({ question: q })
      updateEntry(entryId, response)
      if (projectId) await saveMessage(projectId, q, response).catch(() => {})
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail ?? 'Request failed — is the API server running?'
      updateEntry(entryId, { result_type: 'error', error: detail })
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading }
}
