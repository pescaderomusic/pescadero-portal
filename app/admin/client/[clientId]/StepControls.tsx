'use client'
import { useState } from 'react'

const BLUE  = '#44BEC7'
const RED   = '#D62828'
const GOLD  = '#F5A623'
const GREEN = '#4CAF50'

const STEP_VALUES = ['locked','pending','sent','complete','signed','paid','submitted']

function stepColor(val: string) {
  if (['complete','signed','paid','submitted'].includes(val)) return GREEN
  if (['pending','sent'].includes(val)) return GOLD
  return 'rgba(255,255,255,0.2)'
}

interface Step { key: string; label: string; num: string }

interface Props {
  clientId: string
  booking: any
  steps: Step[]
  email: string
  firstName: string
}

export default function StepControls({ clientId, booking, steps, email, firstName }: Props) {
  const [localBooking, setLocalBooking] = useState<any>(booking || {})
  const [saving, setSaving]   = useState<string | null>(null)
  const [msg, setMsg]         = useState('')
  const [testMode, setTestMode] = useState(false)
  const [resetting, setResetting] = useState(false)

  const updateStep = async (stepKey: string, value: string) => {
    setSaving(stepKey)
    setMsg('')
    const res = await fetch('/api/admin/update-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, stepKey, value }),
    })
    if (res.ok) {
      setLocalBooking((prev: any) => ({ ...prev, [stepKey]: value }))
      setMsg(`✓ ${stepKey.replace('step_', '')} → ${value}`)
    } else {
      const d = await res.json()
      setMsg(`❌ ${d.error || 'Error'}`)
    }
    setSaving(null)
    setTimeout(() => setMsg(''), 3000)
  }

  const quickSet = async (stepKey: string, value: string) => {
    await updateStep(stepKey, value)
  }

  const resetSteps = async () => {
    setResetting(true)
    // Reset to fresh state: inquiry complete, everything else locked
    const resets = [
      { stepKey: 'step_inquiry',       value: 'complete' },
      { stepKey: 'step_consultation',  value: 'pending' },
      { stepKey: 'step_contract',      value: 'locked' },
      { stepKey: 'step_deposit',       value: 'locked' },
      { stepKey: 'step_planning',      value: 'locked' },
      { stepKey: 'step_final_payment', value: 'locked' },
      { stepKey: 'step_event',         value: 'locked' },
    ]
    for (const r of resets) {
      await fetch('/api/admin/update-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, stepKey: r.stepKey, value: r.value }),
      })
      setLocalBooking((prev: any) => ({ ...prev, [r.stepKey]: r.value }))
    }
    setMsg('✓ Steps reset to fresh state')
    setResetting(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const bypassDeposit = async () => {
    await fetch('/api/admin/update-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, stepKey: 'step_deposit', value: 'paid' }),
    })
    await fetch('/api/admin/update-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, stepKey: 'step_planning', value: 'pending' }),
    })
    setLocalBooking((prev: any) => ({ ...prev, step_deposit: 'paid', step_planning: 'pending' }))
    setMsg('✓ Deposit bypassed — planning unlocked')
    setTimeout(() => setMsg(''), 3000)
  }

  const unlockAll = async () => {
    const unlocks = [
      { stepKey: 'step_inquiry',       value: 'complete' },
      { stepKey: 'step_consultation',  value: 'complete' },
      { stepKey: 'step_contract',      value: 'signed' },
      { stepKey: 'step_deposit',       value: 'paid' },
      { stepKey: 'step_planning',      value: 'pending' },
      { stepKey: 'step_final_payment', value: 'pending' },
      { stepKey: 'step_event',         value: 'pending' },
    ]
    for (const u of unlocks) {
      await fetch('/api/admin/update-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, stepKey: u.stepKey, value: u.value }),
      })
      setLocalBooking((prev: any) => ({ ...prev, [u.stepKey]: u.value }))
    }
    setMsg('✓ All steps unlocked for testing')
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Step controls */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Booking Steps</p>
          <button onClick={() => setTestMode(!testMode)} style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6, border: `1px solid ${testMode ? 'rgba(245,166,35,0.4)' : 'rgba(255,255,255,0.1)'}`, background: testMode ? 'rgba(245,166,35,0.1)' : 'transparent', color: testMode ? GOLD : 'rgba(255,255,255,0.35)', cursor: 'pointer' }}>
            {testMode ? '⚡ TEST MODE ON' : 'Test Mode'}
          </button>
        </div>

        {msg && (
          <div style={{ padding: '8px 12px', borderRadius: 7, marginBottom: 12, fontSize: 12, background: msg.startsWith('✓') ? 'rgba(76,175,80,0.1)' : 'rgba(214,40,40,0.1)', color: msg.startsWith('✓') ? GREEN : '#FF8A80', border: `1px solid ${msg.startsWith('✓') ? 'rgba(76,175,80,0.2)' : 'rgba(214,40,40,0.2)'}` }}>
            {msg}
          </div>
        )}

        {steps.map(({ key, label, num }) => {
          const current = localBooking?.[key] || 'locked'
          const color = stepColor(current)
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color, width: 20 }}>{num}</span>
                <span style={{ fontSize: 12, color: color === 'rgba(255,255,255,0.2)' ? 'rgba(255,255,255,0.35)' : 'white' }}>{label}</span>
                <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 8, background: `${color}20`, color, border: `1px solid ${color}30` }}>{current}</span>
              </div>
              <select
                value={current}
                disabled={saving === key}
                onChange={e => updateStep(key, e.target.value)}
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: 'white', fontSize: 11, padding: '4px 8px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', outline: 'none' }}
              >
                {STEP_VALUES.map(v => <option key={v} value={v} style={{ background: '#0D1B2A' }}>{v}</option>)}
              </select>
            </div>
          )
        })}
      </div>

      {/* Test mode controls */}
      {testMode && (
        <div style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: 12, padding: '18px 20px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: GOLD }}>⚡ Test Mode Controls</p>
          <p style={{ margin: '0 0 14px', fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
            These controls bypass normal flow for testing. Use to simulate any state without going through Stripe or waiting for emails.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => quickSet('step_consultation', 'complete')} style={testBtn(BLUE)}>
              ✓ Mark Consultation Complete
            </button>
            <button onClick={() => quickSet('step_contract', 'signed')} style={testBtn(BLUE)}>
              ✓ Mark Contract Signed
            </button>
            <button onClick={bypassDeposit} style={testBtn(GREEN)}>
              💵 Bypass Deposit (mark paid, unlock planning)
            </button>
            <button onClick={() => quickSet('step_final_payment', 'paid')} style={testBtn(GREEN)}>
              💵 Bypass Final Payment
            </button>
            <button onClick={unlockAll} style={testBtn(GOLD)}>
              🔓 Unlock All Steps (full access)
            </button>
            <button onClick={resetSteps} disabled={resetting} style={testBtn(RED)}>
              {resetting ? 'Resetting…' : '🔄 Reset to Fresh State'}
            </button>
          </div>
        </div>
      )}

      {/* Quick step shortcuts */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px' }}>
        <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Quick Actions</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {localBooking?.step_consultation === 'pending' && (
            <button onClick={() => quickSet('step_consultation', 'complete')} style={quickBtn(GOLD)}>
              ✓ Mark Consultation Done
            </button>
          )}
          {localBooking?.step_consultation === 'complete' && localBooking?.step_contract !== 'sent' && (
            <button onClick={() => quickSet('step_contract', 'sent')} style={quickBtn(BLUE)}>
              📄 Mark Contract Sent
            </button>
          )}
          {localBooking?.step_contract === 'sent' && localBooking?.step_contract !== 'signed' && (
            <button onClick={() => quickSet('step_contract', 'signed')} style={quickBtn(BLUE)}>
              ✍️ Mark Contract Signed
            </button>
          )}
          {localBooking?.step_planning === 'submitted' && localBooking?.step_final_payment === 'locked' && (
            <button onClick={() => quickSet('step_final_payment', 'pending')} style={quickBtn(BLUE)}>
              💵 Unlock Final Payment
            </button>
          )}
          {localBooking?.step_final_payment === 'paid' && (
            <button onClick={() => quickSet('step_event', 'pending')} style={quickBtn(GREEN)}>
              🎵 Unlock Event Day
            </button>
          )}
          <a href={`mailto:${email}`} style={{ ...quickBtn(undefined), textDecoration: 'none', textAlign: 'center' as const, display: 'block' }}>
            ✉️ Email {firstName}
          </a>
        </div>
      </div>

    </div>
  )
}

function testBtn(color: string): React.CSSProperties {
  return {
    width: '100%', padding: '9px 14px', borderRadius: 8, border: `1px solid ${color}40`,
    background: `${color}15`, color, fontSize: 12, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'Poppins, sans-serif', textAlign: 'left',
  }
}

function quickBtn(color?: string): React.CSSProperties {
  return {
    width: '100%', padding: '9px 14px', borderRadius: 8,
    border: `1px solid ${color ? color + '30' : 'rgba(255,255,255,0.1)'}`,
    background: color ? `${color}10` : 'rgba(255,255,255,0.04)',
    color: color || 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'Poppins, sans-serif', textAlign: 'left' as const,
  }
}
