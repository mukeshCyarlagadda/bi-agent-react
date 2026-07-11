import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Diamond, Plus, FolderOpen, Database,
  PanelLeftClose, PanelLeft, Trash2, X,
  Upload, FileText, FileSpreadsheet, Image, Loader2,
  ChevronRight, Files, Eye, Pencil,
} from 'lucide-react'
import { useSession } from '@/context/SessionContext'
import { useProject } from '@/context/ProjectContext'
import type { SupabaseProject } from '@/context/ProjectContext'
import { uploadFile } from '@/api/upload'
import ConnectionPanel from './ConnectionPanel'
import FilePreviewDrawer from './FilePreviewDrawer'

/* ── Connect DB Modal ─────────────────────────────────────────────────────── */
function ConnectModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0"
        style={{ background: 'oklch(0 0 0 / 0.55)', backdropFilter: 'blur(6px)' }}
        onClick={onClose} />
      <div className="glass-panel relative z-10 w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-base font-semibold">Connect database</h2>
          <button onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-white/10"
            style={{ color: 'oklch(0.72 0.03 70)' }}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <ConnectionPanel onConnected={onClose} />
      </div>
    </div>
  )
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['xlsx', 'xls', 'csv'].includes(ext))
    return <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" style={{ color: 'oklch(0.72 0.19 55)' }} />
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext))
    return <Image className="h-3.5 w-3.5 shrink-0" style={{ color: 'oklch(0.72 0.19 55)' }} />
  return <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: 'oklch(0.72 0.19 55)' }} />
}

const ACCEPT = '.csv,.xlsx,.xls,.pdf,.jpg,.jpeg,.png,.webp'

/* ── Upload zone ──────────────────────────────────────────────────────────── */
function UploadZone({ collapsed, onUploaded }: {
  collapsed: boolean
  onUploaded: (projectId: string) => void
}) {
  const { login } = useSession()
  const { createProject, setActiveProject, updateProjectSession } = useProject()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleFile = useCallback(async (file: File) => {
    setUploading(true)
    setErrorMsg('')

    // Create the project immediately so it appears in the sidebar during upload.
    const stem = file.name.replace(/\.[^.]+$/, '')
    let projectId: string | null = null
    try {
      projectId = await createProject({ title: stem.slice(0, 80), dbType: 'file' })
      await setActiveProject(projectId)
    } catch { /* not signed in — continue without persisting */ }

    try {
      const res = await uploadFile(file)
      // Update the project with session + storage path now that upload succeeded.
      if (projectId) await updateProjectSession(projectId, res.session_id, res.db_path ?? undefined)
      login(res)
      sessionStorage.setItem('sessionId', res.session_id)
      if (projectId) onUploaded(projectId)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } }; message?: string })
        ?.response?.data?.detail ?? (err as Error).message ?? 'Upload failed'
      setErrorMsg(msg)
      // Leave the project row so user can see it failed — they can delete or retry.
    } finally {
      setUploading(false)
    }
  }, [login, createProject, updateProjectSession, setActiveProject, onUploaded])

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  if (collapsed) return (
    <button onClick={() => inputRef.current?.click()} disabled={uploading}
      className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/5 mx-auto"
      style={{ color: 'oklch(0.72 0.03 70)' }} title="Upload file">
      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
      <input ref={inputRef} type="file" accept={ACCEPT} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
    </button>
  )

  return (
    <div className="px-3 pb-2">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center gap-2 rounded-xl px-3 py-3 text-center transition-all"
        style={{
          border: dragging ? '1.5px dashed oklch(0.72 0.19 55 / 0.70)' : '1.5px dashed oklch(1 0 0 / 0.12)',
          background: dragging ? 'oklch(0.72 0.19 55 / 0.08)' : 'oklch(1 0 0 / 0.03)',
        }}
      >
        {uploading
          ? <><Loader2 className="h-4 w-4 animate-spin" style={{ color: 'oklch(0.72 0.19 55)' }} /><span className="text-[11px]" style={{ color: 'oklch(0.72 0.03 70)' }}>Parsing…</span></>
          : <>
              <Upload className="h-4 w-4" style={{ color: dragging ? 'oklch(0.72 0.19 55)' : 'oklch(0.72 0.03 70 / 0.60)' }} />
              <div>
                <p className="text-[11px] font-medium" style={{ color: dragging ? 'oklch(0.87 0.02 75)' : 'oklch(0.72 0.03 70)' }}>Drop or click to upload</p>
                <p className="mt-0.5 text-[10px]" style={{ color: 'oklch(0.72 0.03 70 / 0.45)' }}>CSV · Excel · PDF · Image</p>
              </div>
            </>
        }
        <input ref={inputRef} type="file" accept={ACCEPT} className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
      </div>
      {errorMsg && (
        <div className="mt-1.5 flex items-start gap-1.5 rounded-lg px-2.5 py-2 text-[11px]"
          style={{ background: 'oklch(0.55 0.22 25 / 0.12)', border: '1px solid oklch(0.55 0.22 25 / 0.25)', color: 'oklch(0.80 0.15 25)' }}>
          <span className="flex-1">{errorMsg}</span>
          <button onClick={() => setErrorMsg('')}><X className="h-3 w-3" /></button>
        </div>
      )}
    </div>
  )
}

/* ── Uploaded files folder ────────────────────────────────────────────────── */
function FilesFolder({ files, collapsed, onPreview }: {
  files: SupabaseProject[]
  collapsed: boolean
  onPreview: (p: SupabaseProject) => void
}) {
  const [open, setOpen] = useState(true)

  if (collapsed) return (
    <div className="px-2 space-y-0.5">
      {files.map(p => (
        <div key={p.id}
          onClick={e => { e.stopPropagation(); onPreview(p) }}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg mx-auto transition hover:bg-white/5"
          title={p.title}>
          <FileIcon name={p.title} />
        </div>
      ))}
    </div>
  )

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest transition hover:bg-white/5 rounded-lg"
        style={{ color: 'oklch(0.72 0.03 70 / 0.70)' }}
      >
        <ChevronRight className="h-3 w-3 transition-transform" style={{ transform: open ? 'rotate(90deg)' : 'none' }} />
        <Files className="h-3 w-3" />
        <span className="flex-1 text-left">Uploaded Files</span>
        <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
          style={{ background: 'oklch(0.72 0.19 55 / 0.18)', color: 'oklch(0.72 0.19 55)' }}>
          {files.length}
        </span>
      </button>

      {open && (
        <div className="space-y-0.5 px-2 pb-1">
          {files.map(p => {
            const processing = !p.db_path
            return (
              <div key={p.id}
                onClick={e => { e.stopPropagation(); if (!processing) onPreview(p) }}
                className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 transition ${processing ? 'cursor-default opacity-60' : 'cursor-pointer hover:bg-white/5'}`}
              >
                {processing
                  ? <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" style={{ color: 'oklch(0.72 0.19 55)' }} />
                  : <FileIcon name={p.title} />
                }
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium" style={{ color: 'oklch(0.87 0.02 75)' }}>{p.title}</div>
                  <div className="text-[10px]" style={{ color: 'oklch(0.72 0.03 70 / 0.60)' }}>
                    {processing ? 'Processing…' : relativeTime(p.updated_at)}
                  </div>
                </div>
                {!processing && <Eye className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'oklch(0.72 0.19 55)' }} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Single renameable project row ───────────────────────────────────────── */
function ProjectRow({ p, active, collapsed, onSelect, onDelete, onRename }: {
  p: SupabaseProject
  active: boolean
  collapsed: boolean
  onSelect: () => void
  onDelete: () => void
  onRename: (title: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(p.title)
  const inputRef = useRef<HTMLInputElement>(null)
  const isFile = p.db_type === 'file'

  function startEdit(e: React.MouseEvent) {
    e.stopPropagation()
    setDraft(p.title)
    setEditing(true)
    setTimeout(() => { inputRef.current?.select() }, 0)
  }

  function commit() {
    setEditing(false)
    if (draft.trim() && draft.trim() !== p.title) onRename(draft.trim())
    else setDraft(p.title)
  }

  return (
    <div
      className="group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 transition"
      style={{ background: active ? 'oklch(0.72 0.19 55 / 0.15)' : 'transparent', color: active ? 'oklch(0.97 0.01 80)' : 'oklch(0.72 0.03 70)' }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'oklch(1 0 0 / 0.05)' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      onClick={() => { if (!editing) onSelect() }}
    >
      {isFile
        ? <FileIcon name={p.title} />
        : <FolderOpen className="h-4 w-4 shrink-0" style={{ color: active ? 'oklch(0.72 0.19 55)' : undefined }} />
      }
      {!collapsed && (
        <>
          <div className="min-w-0 flex-1">
            {editing ? (
              <input
                ref={inputRef}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setEditing(false); setDraft(p.title) } }}
                onClick={e => e.stopPropagation()}
                className="w-full truncate rounded px-1 text-sm outline-none"
                style={{ background: 'oklch(1 0 0 / 0.08)', color: 'oklch(0.97 0.01 80)', border: '1px solid oklch(0.72 0.19 55 / 0.40)' }}
              />
            ) : (
              <div className="truncate text-sm" onDoubleClick={startEdit}>{p.title}</div>
            )}
            <div className="text-[10px]" style={{ color: 'oklch(0.72 0.03 70 / 0.70)' }}>{relativeTime(p.updated_at)}</div>
          </div>
          {!editing && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={startEdit} title="Rename"
                className="flex h-6 w-6 items-center justify-center rounded transition hover:bg-white/10"
                style={{ color: 'oklch(0.72 0.03 70)' }}>
                <Pencil className="h-3 w-3" />
              </button>
              <button onClick={e => { e.stopPropagation(); onDelete() }} title="Delete"
                className="flex h-6 w-6 items-center justify-center rounded transition hover:bg-red-500/15"
                style={{ color: 'oklch(0.72 0.03 70)' }}>
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ── Projects list ────────────────────────────────────────────────────────── */
function ProjectsList({ projects, activeProjectId, collapsed, onSelect, onDelete, onRename }: {
  projects: SupabaseProject[]
  activeProjectId: string | null
  collapsed: boolean
  onSelect: (p: SupabaseProject) => void
  onDelete: (id: string) => void
  onRename: (id: string, title: string) => void
}) {
  if (!projects.length) return null

  return (
    <div>
      {!collapsed && (
        <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest"
          style={{ color: 'oklch(0.72 0.03 70 / 0.70)' }}>Projects</div>
      )}
      <div className="space-y-0.5 px-2">
        {projects.map(p => (
          <ProjectRow
            key={p.id}
            p={p}
            active={p.id === activeProjectId}
            collapsed={collapsed}
            onSelect={() => onSelect(p)}
            onDelete={() => onDelete(p.id)}
            onRename={title => onRename(p.id, title)}
          />
        ))}
      </div>
    </div>
  )
}

/* ── Main Sidebar ─────────────────────────────────────────────────────────── */
export default function Sidebar() {
  const { sessionId, dbType, login } = useSession()
  const { projects, activeProjectId, loadingProjects, setActiveProject, deleteProject, createProject, renameProject } = useProject()

  const [collapsed, setCollapsed] = useState(false)
  const [showConnect, setShowConnect] = useState(false)
  const [previewProject, setPreviewProject] = useState<SupabaseProject | null>(null)

  // Uploaded Files = all file-type projects, including ones still uploading (no db_path yet).
  const fileProjects = projects.filter(p => p.db_type === 'file')

  async function newProject() {
    try {
      const id = await createProject({ title: 'New project' })
      await setActiveProject(id)
    } catch { /* not signed in */ }
  }

  function activateFileProject(p: SupabaseProject) {
    if (p.backend_session_id) {
      sessionStorage.setItem('sessionId', p.backend_session_id)
      login({ session_id: p.backend_session_id, db_type: 'file', tables: ['transactions'], message: `Switched to ${p.title}` })
    }
    setActiveProject(p.id)
  }

  function handleChatWithFile(p: SupabaseProject) {
    setPreviewProject(null)
    activateFileProject(p)
  }

  function handleProjectSelect(p: SupabaseProject) {
    if (p.db_type === 'file') {
      activateFileProject(p)
    } else {
      setActiveProject(p.id)
    }
  }

  return (
    <>
      <aside
        className="relative z-10 flex h-full shrink-0 flex-col transition-all duration-300"
        style={{
          width: collapsed ? 64 : 288,
          borderRight: '1px solid oklch(0.35 0.05 55 / 40%)',
          background: 'oklch(0.25 0.04 50 / 45%)',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        }}
      >
        {/* Brand */}
        {collapsed ? (
          /* Collapsed: expand button on top (easy to click), logo below */
          <div className="flex flex-col items-center gap-1 px-2 pt-3 pb-2">
            <button onClick={() => setCollapsed(false)} title="Expand sidebar"
              className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-white/10"
              style={{ color: 'oklch(0.87 0.02 75)' }}>
              <PanelLeft className="h-5 w-5" />
            </button>
            <Link to="/" title="Kensho AI"
              className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-white/5">
              <div className="gradient-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <Diamond className="h-4 w-4" style={{ color: 'oklch(0.15 0.02 45)' }} fill="currentColor" />
              </div>
            </Link>
          </div>
        ) : (
          /* Expanded: logo left, collapse button right */
          <div className="flex h-16 items-center justify-between px-3">
            <Link to="/" className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-white/5">
              <div className="gradient-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <Diamond className="h-4 w-4" style={{ color: 'oklch(0.15 0.02 45)' }} fill="currentColor" />
              </div>
              <span className="font-display text-sm font-semibold">Kensho AI</span>
            </Link>
            <button onClick={() => setCollapsed(true)} title="Collapse sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-white/5"
              style={{ color: 'oklch(0.72 0.03 70)' }}>
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* New Project */}
        <div className="px-3 pb-2">
          <button onClick={newProject}
            className={`gradient-primary flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium shadow-md transition hover:brightness-110 ${collapsed ? 'justify-center' : ''}`}
            style={{ color: 'oklch(0.15 0.02 45)' }}>
            <Plus className="h-4 w-4 shrink-0" />
            {!collapsed && <span>New Project</span>}
          </button>
        </div>

        {/* Upload zone */}
        <UploadZone collapsed={collapsed} onUploaded={() => {}} />

        {/* Divider */}
        {!collapsed && <div className="mx-3 mb-2" style={{ borderTop: '1px solid oklch(1 0 0 / 0.07)' }} />}

        {/* Scrollable lists */}
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 py-1">
          {loadingProjects && !collapsed
            ? <div className="flex justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'oklch(0.72 0.03 70 / 0.50)' }} />
              </div>
            : <>
                {/* Uploaded Files — preview/manage */}
                {fileProjects.length > 0 && (
                  <FilesFolder
                    files={fileProjects}
                    collapsed={collapsed}
                    onPreview={setPreviewProject}
                  />
                )}

                {/* Divider between sections */}
                {fileProjects.length > 0 && projects.length > 0 && !collapsed && (
                  <div className="mx-3" style={{ borderTop: '1px solid oklch(1 0 0 / 0.07)' }} />
                )}

                {/* Projects — all projects including file-based ones for chat */}
                {projects.length === 0 && !collapsed
                  ? <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                      <p className="text-xs" style={{ color: 'oklch(0.72 0.03 70)' }}>No projects yet</p>
                      <p className="text-[11px]" style={{ color: 'oklch(0.72 0.03 70 / 0.55)' }}>Upload a file or send a message</p>
                    </div>
                  : <ProjectsList
                      projects={projects}
                      activeProjectId={activeProjectId}
                      collapsed={collapsed}
                      onSelect={handleProjectSelect}
                      onDelete={deleteProject}
                      onRename={renameProject}
                    />
                }
              </>
          }
        </div>

        {/* Footer: DB connect */}
        <div className="p-3" style={{ borderTop: '1px solid oklch(0.35 0.05 55 / 40%)' }}>
          <button onClick={() => setShowConnect(true)}
            className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}
            style={{ color: sessionId ? 'oklch(0.72 0.19 55)' : 'oklch(0.72 0.03 70)' }}>
            <Database className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{sessionId ? dbType : 'Connect database'}</span>
                <span className="h-1.5 w-1.5 rounded-full"
                  style={{ background: sessionId ? 'oklch(0.72 0.19 55)' : 'oklch(0.72 0.03 70 / 0.50)' }} />
              </>
            )}
          </button>
        </div>
      </aside>

      {showConnect && <ConnectModal onClose={() => setShowConnect(false)} />}

      {previewProject && (
        <FilePreviewDrawer
          project={previewProject}
          onClose={() => setPreviewProject(null)}
          onChat={handleChatWithFile}
        />
      )}
    </>
  )
}
