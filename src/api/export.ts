/**
 * Maps to:
 *   POST /api/v1/export/pdf  → api/routers/export.py :: export_pdf()
 *
 * The server returns raw PDF bytes (application/pdf).
 * We receive them as a Blob, create an object URL, and trigger a download.
 */
import apiClient from './client'

export async function exportPdf(): Promise<void> {
  const response = await apiClient.post('/api/v1/export/pdf', null, {
    responseType: 'blob',
  })

  const blob = new Blob([response.data], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)

  // Trigger browser download without navigating away
  const a = document.createElement('a')
  a.href = url
  a.download = 'bi_session_summary.pdf'
  a.click()
  URL.revokeObjectURL(url)
}
