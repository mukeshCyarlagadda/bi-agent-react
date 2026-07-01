import apiClient from './client'
import type { ApproveRequest, QueryRequest, QueryResponse } from '@/types/api'

export async function runQuery(req: QueryRequest): Promise<QueryResponse> {
  const { data } = await apiClient.post<QueryResponse>('/api/v1/query', req)
  return data
}

export async function approveQuery(req: ApproveRequest): Promise<QueryResponse> {
  const { data } = await apiClient.post<QueryResponse>('/api/v1/query/approve', req)
  return data
}

export async function freeChat(
  message: string,
  history: { role: string; content: string }[] = [],
): Promise<string> {
  const { data } = await apiClient.post<{ reply: string }>('/api/v1/chat', { message, history })
  return data.reply
}
