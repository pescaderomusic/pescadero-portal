'use client'
import { useState } from 'react'

const BLUE  = '#44BEC7'
const RED   = '#D62828'
const GOLD  = '#F5A623'
const GREEN = '#4CAF50'

const STEP_CONFIG: Record<string, {
  num: string
  label: string
  statuses: { value: string; label: string; color: string; description: string }[]
}> = {
  step_inquiry: {
    num: '01', label: 'Inquiry',
    statuses: [
      { value: 'locked',   label: 'Not Started',   color: 'rgba(255,255,255,0.2)', description: 'Awaiting inquiry submission' },
      { value: 'complete', label: 'Received ✓',    color: GREEN,                  description: 'Inquiry submitted and received' },
    ],
  },
  step_consultation: {
    num: '02', label: 'Initial Consultation',
    statuses: [
      { value: 'locked',    label: 'Locked',            color: 'rgba(255,255,255,0.2)', description: 'Not yet available to client' },
      { value: 'pending',   label: 'Awaiting Request',  color: GOLD,                   description: 'Client can request a call time' },
      { value: 'scheduled', label: '📅 Call Scheduled', color: BLUE,                   description: 'Time confirmed — call is upcoming' },
      { value: 'complete',  label: 'Call Done ✓',       color: GREEN,                  description: 'Consultation done — prepare contract' },
    ],
  },
  step_contract: {
    num: '03', label: 'Service Agreement',
    statuses: [
      { value: 'locked',  label: 'Locked',           color: 'rgba(255,255,255,0.2)', description: 'Complete consultation first' },
      { value: 'pending', label: 'Ready to Prepare', color: GOLD,                   description: 'Consultation done — finalize contract' },
      { value: 'sent',    label: 'Sent to Client',   color: BLUE,                   description: 'Client can view and sign' },
      { value: 'signed',  label: 'Signed ✓',         color: GREEN,                  description: 'Contract fully executed' },
    ],
  },
  step_deposit: {
    num: '04', label: 'Deposit',
    statuses: [
      { value: 'locked',  label: 'Locked',           color: 'rgba(255,255,255,0.2)', description: 'Contract must be signed first' },
      { value: 'pending', label: 'Awaiting Payment', color: GOLD,                   description: 'Client can pay deposit' },
      { value: 'paid',    label: 'Paid ✓',           color: GREEN,                  description: 'Deposit received — date secured' },
    ],
  },
  step_planning: {
    num: '05', label: 'Planning & Music',
    statuses: [
      { value: 'locked',    label: 'Locked',      color: 'rgba(255,255,255,0.2)', description: 'Not yet available' },
      { value: 'pending',   label: 'Form Open',   color: GOLD,                   description: 'Client can fill out planning form' },
      { value: 'submitted', label: 'Submitted ✓', color: GREEN,                  description: 'Planning form received' },
    ],
  },
  step_final_payment: {
    num: '06', label: 'Final Payment',
    statuses: [
      { value: 'locked',  label: 'Locked',           color: 'rgba(255,255,255,0.2)', description: 'Not yet available' },
      { value: 'pending', label: 'Awaiting Payment', color: GOLD,                   description: 'Balance due — client can pay' },
      { value: 'paid',    label: 'Paid ✓',           color: GREEN,                  description: 'Final payment received' },
    ],
  },
  step_event: {
    num: '07', label: 'Event Day',
    statuses: [
      { value: 'locked',   label: 'Locked',       color: 'rgba(255,255,255,0.2)', description: 'Not yet happened' },
      { value: 'pending',  label: 'Upcoming',     color: BLUE,                   description: 'Event is approaching' },
      { value: 'complete', label: 'Event Done ✓', color: GREEN,                  description: 'Sends review link to client automatically' },
    ],
  },
}

const STEP_KEYS = ['step_inquiry','step_consultation','step_contract','step_deposit','step_planning','step_final_payment','step_event']

interface Props {
  clientId: string
  booking: any
  steps: { key: string; label: string; num: string }[]
  email: string
  firstName: string
  consultationRequest?: { requested_date?: string; requested_time?: string } | null
  inquiry?: any
  planning?: any
}

export default function StepControls({ clientId, booking, email, firstName, consultationRequest, inquiry, planning }: Props) {
  const [local, setLocal]     = useState<any>(booking || {})
  const [saving, setSaving]   = useState<string | null>(null)
  const [msg, setMsg]         = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'steps' | 'forms'>('steps')

  const update = async (stepKey: string, value: string) => {
    setSaving(stepKey)
    setMsg('')

    // Special case: marking event complete fires the review notification API
    if (stepKey === 'step_event' && value === 'complete') {
      try {
        await fetch('/api/admin/event-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId }),
        })
      } catch (e) { console.error('Event complete API error:', e) }
    }

    // Mark consultation complete also unlocks contract (pending)
    if (stepKey === 'step_consultation' && value === 'complete') {
      await fetch('/api/admin/update-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, stepKey: 'step_contract', value: 'pending' }),
      })
      setLocal((p: any) => ({ ...p, step_contract: 'pending' }))
    }

    const res = await fetch('/api/admin/update-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, stepKey, value }),
    })

    if (res.ok) {
      setLocal((p: any) => ({ ...p, [stepKey]: value }))
      const label = STEP_CONFIG[stepKey]?.label
      setMsg(stepKey === 'step_event' && value === 'complete'
        ? `✓ Event marked complete — review link sent to ${firstName}!`
        : `✓ ${label} → ${value}`)
      setExpanded(null)
    } else {
      setMsg('❌ Update failed — try again')
    }
    setSaving(null)
    setTimeout(() => setMsg(''), 4000)
  }

  const resetAll = async () => {
    if (!confirm(`Reset all steps for ${firstName} to fresh state?`)) return
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

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12, overflow: 'hidden', marginBottom: 16,
  }

  return (
    <div>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
        {(['steps', 'forms'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '8px', borderRadius: 8, border: `1px solid ${activeTab === tab ? 'rgba(68,190,199,0.3)' : 'rgba(255,255,255,0.07)'}`,
            background: activeTab === tab ? 'rgba(68,190,199,0.1)' : 'transparent',
            color: activeTab === tab ? BLUE : 'rgba(255,255,255,0.4)',
            fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
            textTransform: 'capitalize',
          }}>
            {tab === 'steps' ? '📋 Booking Steps' : '📝 Submitted Forms'}
          </button>
        ))}
      </div>

      {activeTab === 'steps' && (
        <>
          {/* Steps */}
          <div style={card}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', fontFamily: 'Poppins, sans-serif' }}>Booking Steps</p>
              <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'Poppins, sans-serif' }}>Click to change</p>
            </div>

            {msg && (
              <div style={{ padding: '10px 18px', fontSize: 12, fontFamily: 'Poppins, sans-serif', background: msg.startsWith('✓') ? 'rgba(76,175,80,0.1)' : 'rgba(214,40,40,0.1)', color: msg.startsWith('✓') ? GREEN : '#FF8A80', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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

              // Special: show scheduled call time
              const showCallInfo = key === 'step_consultation' && val === 'scheduled' && consultationRequest?.requested_date

              return (
                <div key={key}>
                  <button onClick={() => setExpanded(isOpen ? null : key)} style={{ width: '100%', background: isOpen ? 'rgba(68,190,199,0.05)' : 'transparent', border: 'none', borderBottom: isLast && !isOpen ? 'none' : '1px solid rgba(255,255,255,0.05)', padding: '12px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' as const }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: current.color, width: 20, fontFamily: 'Poppins, sans-serif' }}>{config.num}</span>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: val === 'locked' ? 'rgba(255,255,255,0.3)' : 'white', fontFamily: 'Poppins, sans-serif' }}>{config.label}</span>
                        {showCallInfo && (
                          <p style={{ margin: '1px 0 0', fontSize: 10, color: BLUE, fontFamily: 'Poppins, sans-serif' }}>
                            {new Date(consultationRequest.requested_date! + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {consultationRequest.requested_time ? ` at ${consultationRequest.requested_time}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 10, background: `${current.color}18`, color: current.color, border: `1px solid ${current.color}30`, fontWeight: 600, fontFamily: 'Poppins, sans-serif', whiteSpace: 'nowrap' as const }}>
                        {current.label}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{ background: 'rgba(0,0,0,0.15)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 18px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {config.statuses.map(status => (
                          <button key={status.value} disabled={saving === key} onClick={() => update(key, status.value)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, border: `1px solid ${status.color}${val === status.value ? '50' : '18'}`, background: val === status.value ? `${status.color}15` : 'rgba(255,255,255,0.02)', cursor: saving === key ? 'not-allowed' : 'pointer', textAlign: 'left' as const }}>
                            <div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: status.color, fontFamily: 'Poppins, sans-serif' }}>{val === status.value ? '● ' : '○ '}{status.label}</span>
                              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 8, fontFamily: 'Poppins, sans-serif' }}>— {status.description}</span>
                            </div>
                            {val === status.value && <span style={{ fontSize: 9, color: status.color, fontFamily: 'Poppins, sans-serif', fontWeight: 700, flexShrink: 0 }}>CURRENT</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Actions */}
          <div style={{ ...card, padding: '16px 18px' }}>
            <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', fontFamily: 'Poppins, sans-serif' }}>Actions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href={`mailto:${email}`} style={{ display: 'block', padding: '9px 14px', borderRadius: 8, border: '1px solid rgba(68,190,199,0.2)', background: 'rgba(68,190,199,0.07)', color: BLUE, fontSize: 12, fontWeight: 700, textDecoration: 'none', textAlign: 'center' as const, fontFamily: 'Poppins, sans-serif' }}>
                ✉️ Email {firstName}
              </a>
              {(['scheduled','pending'].includes(local.step_consultation || '')) && (
                <a href={`/admin/reschedule/${clientId}`} style={{ display: 'block', padding: '9px 14px', borderRadius: 8, border: '1px solid rgba(245,166,35,0.25)', background: 'rgba(245,166,35,0.07)', color: '#F5A623', fontSize: 12, fontWeight: 700, textDecoration: 'none', textAlign: 'center' as const, fontFamily: 'Poppins, sans-serif' }}>
                  📅 Reschedule Consultation
                </a>
              )}
              <button onClick={resetAll} disabled={saving === 'all'} style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid rgba(214,40,40,0.2)', background: 'rgba(214,40,40,0.05)', color: RED, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                🔄 Reset All Steps
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'forms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Inquiry */}
          {inquiry ? (
            <div style={{ ...card, padding: '18px 20px' }}>
              <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE, fontFamily: 'Poppins, sans-serif' }}>Inquiry Submission</p>
              {[
                ['Couple', inquiry.couple_names], ['Email', inquiry.email], ['Phone', inquiry.phone],
                ['Event', inquiry.event_name], ['Date', inquiry.event_date], ['Venue', inquiry.venue_name],
                ['Address', inquiry.venue_address], ['Attendance', inquiry.attendance?.toString()],
                ['Services', Array.isArray(inquiry.services_requested) ? inquiry.services_requested.join(', ') : inquiry.services_requested],
                ['Budget', inquiry.budget], ['Notes', inquiry.additional_notes],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ marginBottom: 10 }}>
                  <p style={{ margin: '0 0 2px', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'Poppins, sans-serif' }}>{k}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'rgba(232,224,213,0.8)', fontFamily: 'Poppins, sans-serif', lineHeight: 1.5 }}>{v}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }}>No inquiry on file.</p>
          )}

          {/* Consultation request */}
          {consultationRequest && (
            <div style={{ ...card, padding: '18px 20px' }}>
              <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE, fontFamily: 'Poppins, sans-serif' }}>Consultation Request</p>
              {consultationRequest.requested_date && (
                <p style={{ margin: '0 0 6px', fontSize: 13, color: 'white', fontFamily: 'Poppins, sans-serif' }}>
                  {new Date(consultationRequest.requested_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  {consultationRequest.requested_time ? ` at ${consultationRequest.requested_time}` : ''}
                </p>
              )}
            </div>
          )}

          {/* Planning form */}
          {planning ? (
            <div style={{ ...card, padding: '18px 20px' }}>
              <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE, fontFamily: 'Poppins, sans-serif' }}>Planning & Music Form</p>
              {[
                ['First Dance', planning.first_dance_song], ['Father/Daughter', planning.father_daughter_song],
                ['Mother/Son', planning.mother_son_song], ['Cake Cutting', planning.cake_cutting_song],
                ['Last Dance', planning.last_dance_song], ['Genres', planning.genres],
                ['Must Play', planning.must_play], ['Do Not Play', planning.do_not_play],
                ['Vibe', planning.vibe], ['MC Needed', planning.mc_needed], ['MC Notes', planning.mc_notes],
                ['Photographer', planning.photographer], ['Videographer', planning.videographer],
                ['Coordinator', planning.coordinator], ['Catering', planning.catering],
                ['Special Moments', planning.special_moments], ['Notes', planning.additional_notes],
                ['Grand Entrance', planning.grand_entrance_time], ['First Dance Time', planning.first_dance_time],
                ['Ceremony', planning.ceremony_time], ['Reception', planning.reception_start],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ marginBottom: 10 }}>
                  <p style={{ margin: '0 0 2px', fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'Poppins, sans-serif' }}>{k}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'rgba(232,224,213,0.8)', fontFamily: 'Poppins, sans-serif', lineHeight: 1.5, whiteSpace: 'pre-wrap' as const }}>{v}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }}>Planning form not yet submitted.</p>
          )}
        </div>
      )}
    </div>
  )
}
