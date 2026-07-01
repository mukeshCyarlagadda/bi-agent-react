import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ChatEntry, ConnectResponse, QueryResponse } from '@/types/api'

interface SessionState {
  sessionId: string | null
  dbType:    string | null
  tables:    string[]
  chatHistory: ChatEntry[]
  showSql: boolean
}

interface SessionContextValue extends SessionState {
  login:        (res: ConnectResponse) => void
  logout:       () => void
  addEntry:     (entry: ChatEntry) => void
  updateEntry:  (id: string, response: QueryResponse) => void
  setShowSql:   (v: boolean) => void
  clearHistory: () => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>(() => ({
    sessionId:   sessionStorage.getItem('sessionId'),
    dbType:      sessionStorage.getItem('dbType'),
    tables:      JSON.parse(sessionStorage.getItem('tables') ?? '[]'),
    chatHistory: [],
    showSql:     false,
  }))

  useEffect(() => {
    if (state.sessionId) {
      sessionStorage.setItem('sessionId', state.sessionId)
      sessionStorage.setItem('dbType',    state.dbType ?? '')
      sessionStorage.setItem('tables',    JSON.stringify(state.tables))
    } else {
      sessionStorage.removeItem('sessionId')
      sessionStorage.removeItem('dbType')
      sessionStorage.removeItem('tables')
    }
  }, [state.sessionId, state.dbType, state.tables])

  const login = useCallback((res: ConnectResponse) => {
    setState(s => ({
      ...s,
      sessionId: res.session_id,
      dbType:    res.db_type,
      tables:    res.tables,
      // Preserve pre-connection messages + append a system event
      chatHistory: [
        ...s.chatHistory,
        {
          id:        crypto.randomUUID(),
          question:  '',
          response:  {
            result_type: 'message' as const,
            message: `Connected to ${res.db_type.toUpperCase()} · ${res.tables.length} tables`,
          },
          pending:   false,
          timestamp: new Date(),
          isSystem:  true,
        },
      ],
    }))
  }, [])

  const logout = useCallback(() => {
    setState(s => ({
      ...s,
      sessionId: null,
      dbType:    null,
      tables:    [],
      chatHistory: [
        ...s.chatHistory,
        {
          id:        crypto.randomUUID(),
          question:  '',
          response:  { result_type: 'message' as const, message: 'Disconnected.' },
          pending:   false,
          timestamp: new Date(),
          isSystem:  true,
        },
      ],
    }))
  }, [])

  const addEntry = useCallback((entry: ChatEntry) => {
    setState(s => ({ ...s, chatHistory: [...s.chatHistory, entry] }))
  }, [])

  // Replace a pending entry's response once the API call completes
  const updateEntry = useCallback((id: string, response: QueryResponse) => {
    setState(s => ({
      ...s,
      chatHistory: s.chatHistory.map(e =>
        e.id === id ? { ...e, response, pending: false } : e
      ),
    }))
  }, [])

  const setShowSql = useCallback((v: boolean) => {
    setState(s => ({ ...s, showSql: v }))
  }, [])

  const clearHistory = useCallback(() => {
    setState(s => ({ ...s, chatHistory: [] }))
  }, [])

  return (
    <SessionContext.Provider value={{ ...state, login, logout, addEntry, updateEntry, setShowSql, clearHistory }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be inside <SessionProvider>')
  return ctx
}
