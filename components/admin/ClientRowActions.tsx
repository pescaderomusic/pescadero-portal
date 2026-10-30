'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

  const btnClass =
    'font-label-sm text-[9px] font-bold uppercase tracking-wide px-2.5 py-1 whitespace-nowrap disabled:cursor-not-allowed bg-transparent'

  return (
    <div className="flex gap-1.5">
      <button
        onClick={toggleArchive}
        disabled={busy}
        className={btnClass}
        style={{ color: '#44BEC7', border: '1px solid rgba(68,190,199,0.3)', background: 'rgba(68,190,199,0.08)' }}
      >
        {isArchived ? 'Unarchive' : 'Archive'}
      </button>
      <button
        onClick={deleteClient}
        disabled={busy}
        className={btnClass}
        style={{ color: '#C8202A', border: '1px solid rgba(200,32,42,0.3)', background: 'rgba(200,32,42,0.08)' }}
      >
        Delete
      </button>
    </div>
  )
}
