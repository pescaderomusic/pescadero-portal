'use client'
import { useState } from 'react'

const BLUE  = '#44BEC7'
const RED   = '#D62828'
const GOLD  = '#F5A623'
const GREEN = '#4CAF50'

// What each step value means in plain English
const STEP_CONFIG: Record<string, {
  label: string
  num: string
  completeValue: string  // what "done" looks like for this step
  actions: { label: string; value: string; color: string }[]
  completedLabel: string
}> = {
  step_inquiry:       { label: 'Inquiry',             num: '01', completeValue: 'complete',  completedLabel: 'Submitted', actions: [{ label: 'Mark Received', value: 'complete', color: GREEN }] },
  step_consultation:  { label: 'Initial Consultation', num: '02', completeValue: 'complete',  completedLabel: 'Done',      actions: [{ label: 'Mark Call Done', value: 'complete', color: GREEN }] },
  step_contract:      { label: 'Service Agreement',   num: '03', completeValue: 'signed',    completedLabel: 'Signed',    actions: [{ label: 'Mark Sent to Client', value: 'sent', color: GOLD }, { label: 'Mark Signed', value: 'signed', color: GREEN }] },
  step_deposit:       { label: 'Deposit',             num: '04', completeValue: 'paid',      completedLabel: 'Paid',      actions: [{ label: 'Mark Paid (bypass Stripe)', value: 'paid', color: GREEN }] },
  step_planning:      { label: 'Planning & Music',    num: '05', completeValue: 'submitted', completedLabel: 'Submitted', actions: [{ label: 'Mark Submitted', value: 'submitted', color: GREEN }] },
  step_final_payment: { label: 'Final Payment',       num: '06', completeValue: 'paid',      completedLabel: 'Paid',      actions: [{ label: 'Mark Paid (bypass Stripe)', value: 'paid', color: GREEN }] },
  step_event:         { label: 'Event Day',           num: '07', completeValue: 'complete',  completedLabel: 'Done!',     actions: [{ label: 'Mark Event Complete', value: 'complete', color: GREEN }] },
}

const STEP_KEYS = ['step_inquiry','step_consultation','step_contract','step_deposit','step_planning','step_final_payment','step_event']

function isComplete(key: string, val: string) {
  return val === STEP_CONFIG[key]?.completeValue
}

function statusColor(key: string, val: string) {
  if (!val || val === 'locked') return 'rgba(255,255,255,0.2)'
  if (isComplete(key, val)) return GREEN
  if (['pending','sent'].includes(val)) return GOLD
  return GOLD
}

function statusLabel(key: string, val: string) {
  if (!val || val === 'locked') return null
  if (isComplete(key, val)) return STEP_CONFIG[key]?.completedLabel
  if (val === 'sent') return 'Sent — awaiting signature'
  if (val === 'pending') return 'Pending'
  return val
}

interface Props {
  clientId: string
  booking: any
  steps: { key: string; label: string; num: string }[]
  email: string
  firstName: string
}

export default function StepControls({ clientId, booking, steps, email, firstName }: Props) {
  const [local, setLocal]       = useState<any>(booking || {})
  const [saving, setSaving]     = useState<string | null>(null)
  const [msg, setMsg]           = useState('')
  const [testMode, setTestMode] = useState(false)
  const [resetting, setResetting] = useState(false)

  const update = async (stepKey: string, value: string) => {
    setSaving(stepKey)
    const res = await fetch('/api/admin/update-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, stepKey, value }),
    })
    if (res.ok) {
      setLocal((p: any) => ({ ...p, [stepKey]: value }))
      setMsg(`✓ ${STEP_CONFIG[stepKey]?.label} updated`)
    } else {
      setMsg('❌ Update failed — try again')
    }
    setSaving(null)
    setTimeout(() => setMsg(''), 3000)
  }

  const resetSteps = async () => {
    setResetting(true)
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
    setResetting(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const unlockAll = async () => {
    const all: Record<string, string> = {
      step_inquiry: 'complete', step_consultation: 'complete', step_contract: 'signed',
      step_deposit: 'paid', step_planning: 'pending', step_final_payment: 'pending', step_event: 'pending',
    }
    for (const [k, v] of Object.entries(all)) {
      await fetch('/api/admin/update-step', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId, stepKey: k, value: v }) })
    }
    setLocal(all)
    setMsg('✓ All steps unlocked')
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Step cards */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', fontFamily: 'Poppins, sans-serif' }}>Booking Steps</p>
          <button onClick={() => setTestMode(!testMode)} style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6, border: `1px solid ${testMode ? 'rgba(245,166,35,0.4)' : 'rgba(255,255,255,0.1)'}`, background: testMode ? 'rgba(245,166,35,0.1)' : 'transparent', color: testMode ? GOLD : 'rgba(255,255,255,0.3)', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
            {testMode ? '⚡ Test Mode ON' : 'Test Mode'}
          </button>
        </div>

        {msg && (
          <div style={{ padding: '8px 12px', borderRadius: 7, marginBottom: 12, fontSize: 12, fontFamily: 'Poppins, sans-serif', background: msg.startsWith('✓') ? 'rgba(76,175,80,0.1)' : 'rgba(214,40,40,0.1)', color: msg.startsWith('✓') ? GREEN : '#FF8A80' }}>
            {msg}
          </div>
        )}

        {STEP_KEYS.map(key => {
          const config = STEP_CONFIG[key]
          if (!config) return null
          const val    = local[key] || 'locked'
          const done   = isComplete(key, val)
          const locked = val === 'locked'
          const color  = statusColor(key, val)
          const slabel = statusLabel(key, val)

          return (
            <div key={key} style={{
              padding: '12px 0',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              opacity: locked ? 0.45 : 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: done || locked ? 0 : 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color, width: 22, fontFamily: 'Poppins, sans-serif' }}>{config.num}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: done ? 'white' : locked ? 'rgba(255,255,255,0.35)' : 'white', fontFamily: 'Poppins, sans-serif' }}>{config.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {slabel && (
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: `${color}18`, color, border: `1px solid ${color}30`, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                      {done ? '✓ ' : ''}{slabel}
                    </span>
                  )}
                  {locked && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'Poppins, sans-serif' }}>🔒 Locked</span>}
                </div>
              </div>

              {/* Action buttons — only show if not done and not locked, OR test mode */}
              {(!done && !locked) || testMode ? (
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {config.actions.map(action => (
                    <button
                      key={action.value}
                      disabled={saving === key}
                      onClick={() => update(key, action.value)}
                      style={{ padding: '6px 14px', borderRadius: 7, border: `1px solid ${action.color}35`, background: `${action.color}12`, color: action.color, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', opacity: saving === key ? 0.5 : 1 }}
                    >
                      {saving === key ? '…' : action.label}
                    </button>
                  ))}
                  {done && testMode && (
                    <button onClick={() => update(key, 'locked')} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid rgba(214,40,40,0.3)', background: 'rgba(214,40,40,0.08)', color: RED, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                      Undo / Lock
                    </button>
                  )}
                </div>
              ) : done && testMode ? (
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => update(key, 'locked')} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid rgba(214,40,40,0.3)', background: 'rgba(214,40,40,0.08)', color: RED, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                    Undo / Lock
                  </button>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      {/* Test mode tools */}
      {testMode && (
        <div style={{ background: 'rgba(245,166,35,0.05)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 12, padding: '16px 20px' }}>
          <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: GOLD, fontFamily: 'Poppins, sans-serif' }}>⚡ Test Tools</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={unlockAll} style={tb(GOLD)}>🔓 Unlock all steps at once</button>
            <button onClick={resetSteps} disabled={resetting} style={tb(RED)}>{resetting ? 'Resetting…' : '🔄 Reset to fresh state (start over)'}</button>
          </div>
        </div>
      )}

      {/* Quick contact */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px' }}>
        <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', fontFamily: 'Poppins, sans-serif' }}>Contact</p>
        <a href={`mailto:${email}`} style={{ display: 'block', padding: '9px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, textDecoration: 'none', textAlign: 'center' as const, fontFamily: 'Poppins, sans-serif' }}>
          ✉️ Email {firstName}
        </a>
      </div>

    </div>
  )
}

function tb(color: string): React.CSSProperties {
  return { width: '100%', padding: '9px 14px', borderRadius: 8, border: `1px solid ${color}35`, background: `${color}10`, color, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', textAlign: 'left' }
}
