'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const RED  = '#D62828'
const BLUE = '#44BEC7'

export default function ClientRowActions({ clientId, isArchived }: { clientId: string; isArchived: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const toggleArchive = async () => {
    setBusy(true)
    const res = await fetch('/api/admin/archive-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, archive: !isArchived }),
    })
    setBusy(false)
    if (!res.ok) { alert('Failed to update archive status.'); return }
    router.refresh()
  }

  const deleteClient = async () => {
    const confirmed = window.confirm(
      'Permanently delete this client and all associated records (bookings, contracts, inquiries, planning forms, reviews, and their account)? This cannot be undone.'
    )
    if (!confirmed) return
    setBusy(true)
    const res = await fetch('/api/admin/delete-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
    })
    setBusy(false)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      alert(`Failed to delete: ${body.error || 'unknown error'}`)
      return
    }
    router.refresh()
  }

  const btnStyle: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.5)', cursor: busy ? 'not-allowed' : 'pointer',
    textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
  }

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button onClick={toggleArchive} disabled={busy} style={{ ...btnStyle, color: BLUE, borderColor: 'rgba(68,190,199,0.25)', background: 'rgba(68,190,199,0.08)' }}>
        {isArchived ? 'Unarchive' : 'Archive'}
      </button>
      <button onClick={deleteClient} disabled={busy} style={{ ...btnStyle, color: RED, borderColor: 'rgba(214,40,40,0.3)', background: 'rgba(214,40,40,0.08)' }}>
        Delete
      </button>
    </div>
  )
}
