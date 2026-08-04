'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const GREEN = '#4CAF50'
const RED   = '#D62828'

export default function ConsultationActions({ requestId, clientName }: { requestId: string; clientName: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState<'accept' | 'decline' | null>(null)
  const [done, setDone] = useState<'accepted' | 'declined' | null>(null)

  const act = async (action: 'accept' | 'decline') => {
    const confirmed = window.confirm(
      action === 'accept'
        ? `Confirm this consultation with ${clientName}? This sends them a confirmation email (and text, if a phone number is on file) right away.`
        : `Decline this consultation request from ${clientName}? This emails them asking to pick a new time.`
    )
    if (!confirmed) return

    setBusy(action)
    const res = await fetch(`/api/admin/consultation/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    })
    setBusy(null)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      alert(`Failed to ${action}: ${body.error || 'unknown error'}`)
      return
    }
    setDone(action === 'accept' ? 'accepted' : 'declined')
    router.refresh()
  }

  if (done) {
    return (
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: done === 'accepted' ? GREEN : RED }}>
        {done === 'accepted' ? '✓ Accepted' : '✕ Declined'}
      </p>
    )
  }

  const btnStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '7px 16px', borderRadius: 7,
    fontSize: 11, fontWeight: 700, textAlign: 'center', boxSizing: 'border-box',
    cursor: busy ? 'not-allowed' : 'pointer', border: 'none',
  }

  return (
    <>
      <button disabled={!!busy} onClick={() => act('accept')} style={{ ...btnStyle, background: GREEN, color: 'white' }}>
        {busy === 'accept' ? 'Confirming…' : '✓ Accept'}
      </button>
      <button disabled={!!busy} onClick={() => act('decline')} style={{ ...btnStyle, border: `1px solid rgba(214,40,40,0.3)`, background: 'transparent', color: RED }}>
        {busy === 'decline' ? 'Declining…' : '✕ Decline'}
      </button>
    </>
  )
}
