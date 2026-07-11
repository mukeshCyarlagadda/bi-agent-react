import apiClient from './client'
import type { ConnectResponse } from '@/types/api'

export async function uploadFile(file: File): Promise<ConnectResponse> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await apiClient.post<ConnectResponse>('/api/v1/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 180_000,
  })
  return data
}
