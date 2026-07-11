/**
 * Maps to:
 *   POST   /api/v1/connect      → api/routers/connections.py :: connect()
 *   GET    /api/v1/tables       → api/routers/connections.py :: list_tables()
 *   DELETE /api/v1/disconnect   → api/routers/connections.py :: disconnect()
 */
import apiClient from './client'
import type { ConnectRequest, ConnectResponse } from '@/types/api'

export async function connectDb(req: ConnectRequest): Promise<ConnectResponse> {
  const { data } = await apiClient.post<ConnectResponse>('/api/v1/connect', req)
  return data
}

export async function listTables(): Promise<{ tables: string[]; db_type: string }> {
  const { data } = await apiClient.get<{ tables: string[]; db_type: string }>('/api/v1/tables')
  return data
}

export async function disconnectDb(): Promise<void> {
  await apiClient.delete('/api/v1/disconnect')
}

export async function previewData(sessionId: string, limit = 100): Promise<{
  columns: string[]
  rows: unknown[][]
  total: number
  table: string
}> {
  const { data } = await apiClient.get('/api/v1/preview', {
    params: { limit },
    headers: { 'X-Session-ID': sessionId },
  })
  return data
}

export async function reconnectFile(dbPath: string): Promise<import('@/types/api').ConnectResponse> {
  const { data } = await apiClient.post('/api/v1/reconnect-file', { db_path: dbPath })
  return data
}

export async function deleteStorageFile(storageKey: string): Promise<void> {
  await apiClient.delete('/api/v1/files', { data: { storage_key: storageKey } })
}
