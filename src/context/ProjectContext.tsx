import {
  createContext, useContext, useEffect, useState,
  useCallback, useRef, type ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import { useSession } from './SessionContext'
import type { ChatEntry, QueryResponse } from '@/types/api'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SupabaseProject {
  id: string
  user_id: string
  title: string
  db_type: string | null
  backend_session_id: string | null
  db_path: string | null          // persistent SQLite path for file uploads
  created_at: string
  updated_at: string
}

export interface DashboardItem {
  id: string
  project_id: string
  user_id: string
  title: string
  chart_html: string
  width: number   // 1 = half, 2 = full
  position: number
  created_at: string
}

interface CreateProjectOpts {
  title: string
  dbType?: string
  backendSessionId?: string
  dbPath?: string
}

interface ProjectContextValue {
  projects: SupabaseProject[]
  activeProjectId: string | null
  loadingProjects: boolean
  setActiveProject: (id: string | null) => Promise<void>
  createProject: (opts: CreateProjectOpts) => Promise<string>
  deleteProject: (id: string) => Promise<void>
  renameProject: (id: string, title: string) => Promise<void>
  saveMessage: (projectId: string, question: string, response: QueryResponse) => Promise<void>
  updateProjectSession: (id: string, backendSessionId: string) => Promise<void>
  // Dashboard
  dashboardItems: DashboardItem[]
  loadingDashboard: boolean
  pinChart: (projectId: string, title: string, chartHtml: string) => Promise<void>
  unpinChart: (itemId: string) => Promise<void>
  toggleItemWidth: (itemId: string, current: number) => Promise<void>
}

// ── Context ───────────────────────────────────────────────────────────────────

const ProjectContext = createContext<ProjectContextValue | null>(null)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { loadChatHistory } = useSession()

  const [projects, setProjects] = useState<SupabaseProject[]>([])
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([])
  const [loadingDashboard] = useState(false)

  const loadedRef = useRef<string | null>(null)

  // ── Load projects when user changes ─────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setProjects([])
      setActiveProjectId(null)
      loadedRef.current = null
      return
    }

    setLoadingProjects(true)
    void (async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false })
      if (!error && data) setProjects(data as SupabaseProject[])
      setLoadingProjects(false)
    })()
  }, [user?.id])

  // ── setActiveProject — load messages + dashboard items ──────────────────────
  const setActiveProject = useCallback(async (id: string | null) => {
    setActiveProjectId(id)
    if (!id) {
      loadChatHistory([])
      setDashboardItems([])
      loadedRef.current = null
      return
    }
    if (loadedRef.current === id) return
    loadedRef.current = id

    // Load messages and dashboard items in parallel
    const [msgResult, dashResult] = await Promise.all([
      supabase.from('messages').select('*').eq('project_id', id).order('created_at', { ascending: true }),
      supabase.from('dashboard_items').select('*').eq('project_id', id).order('position', { ascending: true }),
    ])

    if (!msgResult.error && msgResult.data) {
      const entries: ChatEntry[] = msgResult.data.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        question: row.question as string,
        response: row.response as QueryResponse | undefined,
        pending: false,
        timestamp: new Date(row.created_at as string),
        isSystem: false,
      }))
      loadChatHistory(entries)
    }

    if (!dashResult.error && dashResult.data) {
      setDashboardItems(dashResult.data as DashboardItem[])
    }
  }, [loadChatHistory])

  // ── createProject ────────────────────────────────────────────────────────────
  const createProject = useCallback(async (opts: CreateProjectOpts): Promise<string> => {
    // Always fetch fresh user — useCallback closure can capture stale null
    const { data: { user: me } } = await supabase.auth.getUser()
    if (!me) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: me.id,
        title: opts.title.slice(0, 80).trim() || 'New project',
        db_type: opts.dbType ?? null,
        backend_session_id: opts.backendSessionId ?? null,
        db_path: opts.dbPath ?? null,
      })
      .select()
      .single()

    if (error || !data) throw new Error(error?.message ?? 'Failed to create project')

    const newProject = data as SupabaseProject
    setProjects(prev => [newProject, ...prev])
    setActiveProjectId(newProject.id)
    loadedRef.current = newProject.id
    return newProject.id
  }, [])

  // ── deleteProject ────────────────────────────────────────────────────────────
  const deleteProject = useCallback(async (id: string) => {
    await supabase.from('projects').delete().eq('id', id)
    setProjects(prev => prev.filter(p => p.id !== id))
    if (activeProjectId === id) {
      setActiveProjectId(null)
      loadChatHistory([])
      loadedRef.current = null
    }
  }, [activeProjectId, loadChatHistory])

  // ── renameProject ────────────────────────────────────────────────────────────
  const renameProject = useCallback(async (id: string, title: string) => {
    const trimmed = title.trim().slice(0, 80) || 'Untitled'
    await supabase.from('projects').update({ title: trimmed }).eq('id', id)
    setProjects(prev => prev.map(p => p.id === id ? { ...p, title: trimmed } : p))
  }, [])

  // ── saveMessage ──────────────────────────────────────────────────────────────
  const saveMessage = useCallback(async (
    projectId: string,
    question: string,
    response: QueryResponse,
  ) => {
    const { data: { user: me } } = await supabase.auth.getUser()
    await supabase.from('messages').insert({
      project_id: projectId,
      user_id: me?.id,
      question,
      response,
    })
    // Bump project to top of list (updated_at is handled by DB trigger)
    setProjects(prev => {
      const idx = prev.findIndex(p => p.id === projectId)
      if (idx === -1) return prev
      const updated = { ...prev[idx], updated_at: new Date().toISOString() }
      return [updated, ...prev.filter(p => p.id !== projectId)]
    })
  }, [])

  // ── pinChart ─────────────────────────────────────────────────────────────────
  const pinChart = useCallback(async (projectId: string, title: string, chartHtml: string) => {
    const { data: { user: me } } = await supabase.auth.getUser()
    const position = dashboardItems.length
    const { data, error } = await supabase
      .from('dashboard_items')
      .insert({ project_id: projectId, user_id: me?.id, title, chart_html: chartHtml, width: 1, position })
      .select()
      .single()
    if (!error && data) setDashboardItems(prev => [...prev, data as DashboardItem])
  }, [dashboardItems.length])

  // ── unpinChart ────────────────────────────────────────────────────────────────
  const unpinChart = useCallback(async (itemId: string) => {
    await supabase.from('dashboard_items').delete().eq('id', itemId)
    setDashboardItems(prev => prev.filter(i => i.id !== itemId))
  }, [])

  // ── toggleItemWidth ───────────────────────────────────────────────────────────
  const toggleItemWidth = useCallback(async (itemId: string, current: number) => {
    const next = current === 1 ? 2 : 1
    await supabase.from('dashboard_items').update({ width: next }).eq('id', itemId)
    setDashboardItems(prev => prev.map(i => i.id === itemId ? { ...i, width: next } : i))
  }, [])

  // ── updateProjectSession — called when DB is connected inside a project ──────
  const updateProjectSession = useCallback(async (id: string, backendSessionId: string) => {
    await supabase
      .from('projects')
      .update({ backend_session_id: backendSessionId })
      .eq('id', id)
    setProjects(prev => prev.map(p => p.id === id ? { ...p, backend_session_id: backendSessionId } : p))
  }, [])

  return (
    <ProjectContext.Provider value={{
      projects,
      activeProjectId,
      loadingProjects,
      setActiveProject,
      createProject,
      deleteProject,
      renameProject,
      saveMessage,
      updateProjectSession,
      dashboardItems,
      loadingDashboard,
      pinChart,
      unpinChart,
      toggleItemWidth,
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used inside <ProjectProvider>')
  return ctx
}
