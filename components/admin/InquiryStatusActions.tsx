'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const BLUE = '#44BEC7'
const RED  = '#D62828'

export default function InquiryStatusActions({ inquiryId, status }: { inquiryId: string; status: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const setStatus = async (next: string) => {
    setBusy(true)
    const res = await fetch('/api/admin/update-inquiry-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inquiryId, status: next }),
    })
    setBusy(false)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      alert(`Failed to update status: ${body.error || 'unknown error'}`)
      return
    }
    router.refresh()
  }

  const btnStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 5,
    border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.5)', cursor: busy ? 'not-allowed' : 'pointer',
  }

  return (
    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
      {status === 'new' && (
        <button disabled={busy} onClick={() => setStatus('reviewed')} style={{ ...btnStyle, color: BLUE, borderColor: 'rgba(68,190,199,0.3)', background: 'rgba(68,190,199,0.08)' }}>
          Mark Reviewed
        </button>
      )}
      {['new', 'reviewed'].includes(status) && (
        <button disabled={busy} onClick={() => setStatus('declined')} style={{ ...btnStyle, color: RED, borderColor: 'rgba(214,40,40,0.3)', background: 'rgba(214,40,40,0.08)' }}>
          Decline
        </button>
      )}
      {status === 'declined' && (
        <button disabled={busy} onClick={() => setStatus('new')} style={btnStyle}>
          Reopen
        </button>
      )}
    </div>
  )
}
