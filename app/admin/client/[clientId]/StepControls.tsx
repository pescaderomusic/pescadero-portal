'use client'
import { useState } from 'react'

const BLUE  = '#44BEC7'
const RED   = '#D62828'
const GOLD  = '#F5A623'
const GREEN = '#4CAF50'
const NAVY2 = '#152032'

// Full status flow for each step
const STEP_CONFIG: Record<string, {
  num: string
  label: string
  statuses: { value: string; label: string; color: string; description: string }[]
}> = {
  step_inquiry: {
    num: '01', label: 'Inquiry',
    statuses: [
      { value: 'locked',   label: 'Not Started',    color: 'rgba(255,255,255,0.2)', description: 'Client hasn\'t submitted yet' },
      { value: 'complete', label: 'Received ✓',     color: GREEN,                  description: 'Inquiry submitted and received' },
    ],
  },
  step_consultation: {
    num: '02', label: 'Initial Consultation',
    statuses: [
      { value: 'locked',    label: 'Locked',          color: 'rgba(255,255,255,0.2)', description: 'Not yet available to client' },
      { value: 'pending',   label: 'Awaiting Request', color: GOLD,                  description: 'Client can request a call time' },
      { value: 'scheduled', label: 'Call Scheduled',  color: BLUE,                  description: 'Time confirmed, call upcoming' },
      { value: 'complete',  label: 'Call Done ✓',    color: GREEN,                  description: 'Consultation completed' },
    ],
  },
  step_contract: {
    num: '03', label: 'Service Agreement',
    statuses: [
      { value: 'locked',  label: 'Locked',             color: 'rgba(255,255,255,0.2)', description: 'Not yet available to client' },
      { value: 'pending', label: 'Not Sent',            color: GOLD,                  description: 'Contract not sent yet' },
      { value: 'sent',    label: 'Sent to Client',     color: BLUE,                  description: 'Awaiting client signature' },
      { value: 'signed',  label: 'Signed ✓',           color: GREEN,                  description: 'Contract fully signed' },
    ],
  },
  step_deposit: {
    num: '04', label: 'Deposit',
    statuses: [
      { value: 'locked',  label: 'Locked',       color: 'rgba(255,255,255,0.2)', description: 'Not yet available' },
      { value: 'pending', label: 'Awaiting Payment', color: GOLD,               description: 'Client can pay deposit' },
      { value: 'paid',    label: 'Paid ✓',        color: GREEN,                  description: 'Deposit received' },
    ],
  },
  step_planning: {
    num: '05', label: 'Planning & Music',
    statuses: [
      { value: 'locked',     label: 'Locked',          color: 'rgba(255,255,255,0.2)', description: 'Not yet available' },
      { value: 'pending',    label: 'Form Open',        color: GOLD,                  description: 'Client can fill out form' },
      { value: 'submitted',  label: 'Submitted ✓',     color: GREEN,                  description: 'Planning form received' },
    ],
  },
  step_final_payment: {
    num: '06', label: 'Final Payment',
    statuses: [
      { value: 'locked',  label: 'Locked',          color: 'rgba(255,255,255,0.2)', description: 'Not yet available' },
      { value: 'pending', label: 'Awaiting Payment', color: GOLD,                  description: 'Balance due, client can pay' },
      { value: 'paid',    label: 'Paid ✓',           color: GREEN,                  description: 'Final payment received' },
    ],
  },
  step_event: {
    num: '07', label: 'Event Day',
    statuses: [
      { value: 'locked',   label: 'Locked',      color: 'rgba(255,255,255,0.2)', description: 'Event not yet happened' },
      { value: 'pending',  label: 'Upcoming',    color: BLUE,                   description: 'Event day approaching' },
      { value: 'complete', label: 'Complete ✓', color: GREEN,                   description: 'Event done — send review link' },
    ],
  },
}

const STEP_KEYS = ['step_inquiry','step_consultation','step_contract','step_deposit','step_planning','step_final_payment','step_event']
const VALID_VALUES = ['locked','pending','sent','complete','signed','paid','submitted','scheduled']

interface Props {
  clientId: string
  booking: any
  steps: { key: string; label: string; num: string }[]
  email: string
  firstName: string
}

export default function StepControls({ clientId, booking, steps, email, firstName }: Props) {
  const [local, setLocal]   = useState<any>(booking || {})
  const [saving, setSaving] = useState<string | null>(null)
  const [msg, setMsg]       = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const update = async (stepKey: string, value: string) => {
    setSaving(stepKey)
    const res = await fetch('/api/admin/update-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, stepKey, value }),
    })
    if (res.ok) {
      setLocal((p: any) => ({ ...p, [stepKey]: value }))
      setMsg(`✓ ${STEP_CONFIG[stepKey]?.label} → ${value}`)
      setExpanded(null)
    } else {
      setMsg('❌ Update failed')
    }
    setSaving(null)
    setTimeout(() => setMsg(''), 3000)
  }

  const resetAll = async () => {
    if (!confirm('Reset all steps to fresh state? This cannot be undone.')) return
    setSaving('all')
    const defaults: Record<string, string> = {
      step_inquiry: 'complete', step_consultation: 'pending',
      step_contract: 'locked', step_deposit: 'locked',
      step_planning: 'locked', step_final_payment: 'locked', step_event: 'locked',
    }
    for (const [k, v] of Object.entries(defaults)) {
      await fetch('/api/admin/update-step', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId, stepKey: k, value: v }) })
    }
    setLocal(defaults)
    setMsg('✓ Reset to fresh state')
    setSaving(null)
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Step controls */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>

        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', fontFamily: 'Poppins, sans-serif' }}>Booking Steps</p>
          <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'Poppins, sans-serif' }}>Click any step to change</p>
        </div>

        {msg && (
          <div style={{ padding: '10px 20px', fontSize: 12, fontFamily: 'Poppins, sans-serif', background: msg.startsWith('✓') ? 'rgba(76,175,80,0.1)' : 'rgba(214,40,40,0.1)', color: msg.startsWith('✓') ? GREEN : '#FF8A80', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {msg}
          </div>
        )}

        {STEP_KEYS.map((key, i) => {
          const config  = STEP_CONFIG[key]
          if (!config) return null
          const val     = local[key] || 'locked'
          const current = config.statuses.find(s => s.value === val) || config.statuses[0]
          const isOpen  = expanded === key
          const isLast  = i === STEP_KEYS.length - 1

          return (
            <div key={key}>
              {/* Step row — always clickable */}
              <button
                onClick={() => setExpanded(isOpen ? null : key)}
                style={{ width: '100%', background: isOpen ? 'rgba(68,190,199,0.06)' : 'transparent', border: 'none', borderBottom: isLast && !isOpen ? 'none' : '1px solid rgba(255,255,255,0.05)', padding: '13px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' as const }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: current.color, width: 22, fontFamily: 'Poppins, sans-serif' }}>{config.num}</span>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: val === 'locked' ? 'rgba(255,255,255,0.35)' : 'white', fontFamily: 'Poppins, sans-serif' }}>{config.label}</span>
                    {saving === key && <span style={{ marginLeft: 8, fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Poppins, sans-serif' }}>Saving…</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 10, background: `${current.color}18`, color: current.color, border: `1px solid ${current.color}30`, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                    {current.label}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Expanded — show all status options */}
              {isOpen && (
                <div style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 20px' }}>
                  <p style={{ margin: '0 0 10px', fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Poppins, sans-serif' }}>
                    Set status for {config.label}:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {config.statuses.map(status => (
                      <button
                        key={status.value}
                        disabled={saving === key}
                        onClick={() => update(key, status.value)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 14px', borderRadius: 8, border: `1px solid ${status.color}${val === status.value ? '60' : '20'}`,
                          background: val === status.value ? `${status.color}18` : 'rgba(255,255,255,0.03)',
                          cursor: saving === key ? 'not-allowed' : 'pointer',
                          textAlign: 'left' as const,
                        }}
                      >
                        <div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: status.color, fontFamily: 'Poppins, sans-serif' }}>
                            {val === status.value ? '● ' : '○ '}{status.label}
                          </span>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 8, fontFamily: 'Poppins, sans-serif' }}>
                            — {status.description}
                          </span>
                        </div>
                        {val === status.value && (
                          <span style={{ fontSize: 10, color: status.color, fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>CURRENT</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Quick actions */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px' }}>
        <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', fontFamily: 'Poppins, sans-serif' }}>Actions</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <a href={`mailto:${email}`} style={{ display: 'block', padding: '9px 14px', borderRadius: 8, border: '1px solid rgba(68,190,199,0.25)', background: 'rgba(68,190,199,0.08)', color: BLUE, fontSize: 12, fontWeight: 700, textDecoration: 'none', textAlign: 'center' as const, fontFamily: 'Poppins, sans-serif' }}>
            ✉️ Email {firstName}
          </a>
          <button
            onClick={resetAll}
            disabled={saving === 'all'}
            style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid rgba(214,40,40,0.25)', background: 'rgba(214,40,40,0.06)', color: RED, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
          >
            🔄 Reset All Steps to Fresh State
          </button>
        </div>
      </div>

    </div>
  )
}
