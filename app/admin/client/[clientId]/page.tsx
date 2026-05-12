'use client'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const NAVY  = '#0D1B2A'
const BLUE  = '#44BEC7'
const RED   = '#D62828'
const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'

const STEPS = [
  { key: 'step_inquiry',       label: 'Inquiry',              num: '01' },
  { key: 'step_consultation',  label: 'Initial Consultation', num: '02' },
  { key: 'step_contract',      label: 'Service Agreement',    num: '03' },
  { key: 'step_deposit',       label: 'Deposit',              num: '04' },
  { key: 'step_planning',      label: 'Planning & Music',     num: '05' },
  { key: 'step_final_payment', label: 'Final Payment',        num: '06' },
  { key: 'step_event',         label: 'Event Day',            num: '07' },
]

const STEP_VALUES = ['locked', 'pending', 'sent', 'complete', 'signed', 'paid', 'submitted']

export default function AdminClientPage() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const clientId     = params.clientId as string
  const action       = searchParams.get('action')

  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState<string | null>(null)
  const [msg, setMsg]         = useState('')

  useEffect(() => {
    fetch(`/api/admin/client/${clientId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [clientId])

  // Auto-execute action from URL
  useEffect(() => {
    if (!action || !data) return
    if (action === 'complete-consultation') {
      handleStepUpdate('step_consultation', 'complete')
      router.replace(`/admin/client/${clientId}`)
    }
  }, [action, data])

  const handleStepUpdate = async (stepKey: string, value: string) => {
    setSaving(stepKey)
    setMsg('')
    const res = await fetch('/api/admin/update-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, stepKey, value }),
    })
    const result = await res.json()
    if (res.ok) {
      setData((prev: any) => ({ ...prev, booking: { ...prev.booking, [stepKey]: value } }))
      setMsg(`✓ ${stepKey.replace('step_', '')} updated to "${value}"`)
    } else {
      setMsg(`❌ ${result.error}`)
    }
    setSaving(null)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Poppins, sans-serif' }}>Loading…</p>
    </div>
  )

  const { booking, profile, email, inquiry, contract } = data || {}

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, fontFamily: 'Poppins, sans-serif' }}>

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,24,40,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(68,190,199,0.15)', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '3px', color: BLUE, textTransform: 'uppercase' }}>PESCADERO ADMIN</span>
        <Link href="/admin" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>← All Clients</Link>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Client header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: '0 0 6px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>Client Detail</p>
          <h1 style={{ margin: '0 0 4px', fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 26, color: 'white' }}>
            {profile?.full_name || 'Unknown Client'}
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            {email} {inquiry?.phone ? `· ${inquiry.phone}` : ''}
          </p>
        </div>

        {msg && (
          <div style={{ background: msg.startsWith('✓') ? 'rgba(76,175,80,0.1)' : 'rgba(214,40,40,0.1)', border: `1px solid ${msg.startsWith('✓') ? 'rgba(76,175,80,0.3)' : 'rgba(214,40,40,0.3)'}`, borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: msg.startsWith('✓') ? '#4CAF50' : '#FF8A80' }}>
            {msg}
          </div>
        )}

        {/* Event info */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 22px', marginBottom: 20 }}>
          <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Event Info</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
            {[
              ['Event Type', contract?.event_type || inquiry?.event_name],
              ['Couple', inquiry?.couple_names],
              ['Event Date', contract?.event_date || inquiry?.event_date],
              ['Venue', inquiry?.venue_name],
              ['Deposit', contract?.deposit_amount ? `$${contract.deposit_amount}` : '—'],
              ['Deposit Paid', contract?.deposit_paid_at ? new Date(contract.deposit_paid_at).toLocaleDateString() : 'No'],
              ['Contract Status', contract?.status || '—'],
              ['Preferred Contact', inquiry?.preferred_contact || '—'],
            ].map(([k, v]) => v && (
              <div key={k}>
                <p style={{ margin: '0 0 2px', fontSize: 9, color: BLUE, textTransform: 'uppercase', letterSpacing: '1px' }}>{k}</p>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(232,224,213,0.8)' }}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step controls */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 22px', marginBottom: 20 }}>
          <p style={{ margin: '0 0 18px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Booking Steps</p>

          {STEPS.map(({ key, label, num }) => {
            const current = booking?.[key] || 'locked'
            const isComplete = ['complete','signed','paid','submitted'].includes(current)
            const isPending  = ['pending','sent'].includes(current)
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isComplete ? BLUE : isPending ? '#F5A623' : 'rgba(255,255,255,0.2)', width: 24 }}>{num}</span>
                  <span style={{ fontSize: 13, color: isComplete ? 'white' : 'rgba(255,255,255,0.5)' }}>{label}</span>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: isComplete ? 'rgba(68,190,199,0.1)' : isPending ? 'rgba(245,166,35,0.1)' : 'rgba(255,255,255,0.05)', color: isComplete ? BLUE : isPending ? '#F5A623' : 'rgba(255,255,255,0.3)', border: `1px solid ${isComplete ? 'rgba(68,190,199,0.2)' : isPending ? 'rgba(245,166,35,0.2)' : 'rgba(255,255,255,0.08)'}` }}>
                    {current}
                  </span>
                </div>
                <select
                  value={current}
                  disabled={saving === key}
                  onChange={e => handleStepUpdate(key, e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'white', fontSize: 11, padding: '5px 10px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
                >
                  {STEP_VALUES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            )
          })}
        </div>

        {/* Quick actions */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 22px' }}>
          <p style={{ margin: '0 0 16px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Quick Actions</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => handleStepUpdate('step_consultation', 'complete')}
              disabled={booking?.step_consultation === 'complete'}
              style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(245,166,35,0.3)', background: 'rgba(245,166,35,0.1)', color: '#F5A623', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: booking?.step_consultation === 'complete' ? 0.4 : 1 }}
            >
              ✓ Mark Consultation Done
            </button>
            <button
              onClick={() => handleStepUpdate('step_contract', 'sent')}
              disabled={booking?.step_contract === 'sent' || booking?.step_contract === 'signed'}
              style={{ padding: '10px 18px', borderRadius: 8, border: `1px solid rgba(68,190,199,0.3)`, background: 'rgba(68,190,199,0.1)', color: BLUE, fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: booking?.step_contract === 'sent' || booking?.step_contract === 'signed' ? 0.4 : 1 }}
            >
              📄 Mark Contract Sent
            </button>
            <a
              href={`mailto:${email}?subject=Pescadero Music — Your Booking&body=Hi ${profile?.full_name?.split(' ')[0] || 'there'},`}
              style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}
            >
              ✉️ Email Client
            </a>
            {inquiry?.phone && (
              <a
                href={`sms:${inquiry.phone}`}
                style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}
              >
                💬 Text Client
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
