'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const TEAL = '#4FB9AF'
const RED  = '#D63031'
const GOLD = '#C8A96E'
const NAVY = '#0F1F35'

function stepColor(val: string) {
  if (['complete','signed','paid','submitted'].includes(val)) return TEAL
  if (['pending','sent'].includes(val)) return RED
  return '#4A5568'
}

function statusColor(s: string) {
  if (s === 'approved' || s === 'complete') return TEAL
  if (s === 'pending') return GOLD
  if (s === 'declined') return RED
  return '#4A5568'
}

const STEP_KEYS = ['step_inquiry','step_contract','step_deposit','step_planning','step_consultation','step_event']
const STEP_LABELS = ['Inquiry','Contract','Deposit','Planning','Consultation','Event']

function stepOptions(key: string) {
  if (key === 'step_contract')     return ['locked','sent','signed']
  if (key === 'step_deposit')      return ['locked','pending','paid']
  if (key === 'step_planning')     return ['locked','pending','submitted']
  if (key === 'step_consultation') return ['locked','pending','complete']
  if (key === 'step_event')        return ['locked','complete']
  return ['complete']
}

function daysUntil(date: string | null) {
  if (!date) return null
  return Math.ceil((new Date(date + 'T12:00:00').getTime() - Date.now()) / 86400000)
}

function fmtDate(d: string | null) {
  if (!d) return 'TBD'
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtDateTime(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

type Tab = 'inquiries' | 'contracts_sent' | 'active' | 'planning' | 'final_payment' | 'completed' | 'accounts' | 'calendar'

export default function AdminDashboard({ bookings, inquiries, profiles, contracts }: {
  bookings: any[], inquiries: any[], profiles: any[], contracts?: any[]
}) {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('inquiries')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [localBookings, setLocalBookings] = useState(bookings)
  const [localInquiries, setLocalInquiries] = useState(inquiries)
  const [saving, setSaving] = useState<string | null>(null)
  const [calMonth, setCalMonth] = useState(new Date())
  const [tabMenuOpen, setTabMenuOpen] = useState(false)

  const pendingInquiries = localInquiries.filter(i => !i.contract_sent && i.status !== 'declined')
  const contractsSent = localInquiries.filter(i => i.contract_sent && i.status !== 'complete')
  const activeBookings = localBookings.filter(b => b.step_contract === 'signed' && b.step_deposit === 'paid' && b.step_event !== 'complete')
  const planningReceived = localBookings.filter(b => b.step_planning === 'submitted' && b.step_event !== 'complete')
  const finalPaymentPending = localBookings.filter(b => b.step_consultation === 'complete' && b.step_event !== 'complete')
  const completed = localBookings.filter(b => b.step_event === 'complete')

  async function updateStep(bookingId: string, field: string, value: string) {
    setSaving(bookingId + field)
    try {
      const res = await fetch('/api/admin/update-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, field, value }),
      })
      const data = await res.json()
      if (data.updates) setLocalBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...data.updates } : b))
    } catch(err) { console.error(err) }
    setSaving(null)
  }

  async function updateInquiryStatus(id: string, status: string) {
    await supabase.from('inquiry_submissions').update({ status }).eq('id', id)
    setLocalInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i))
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth, year, month }
  }

  const getEventsForDay = (day: number) => {
    const { year, month } = getDaysInMonth(calMonth)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return localBookings.filter(b => b.event_date === dateStr)
  }

  const TABS: { id: Tab, label: string, count?: number }[] = [
    { id: 'inquiries', label: '📥 Inquiries', count: pendingInquiries.length },
    { id: 'contracts_sent', label: '📋 Contracts', count: contractsSent.length },
    { id: 'active', label: '✅ Active', count: activeBookings.length },
    { id: 'planning', label: '📝 Planning', count: planningReceived.length },
    { id: 'final_payment', label: '💳 Final Pay', count: finalPaymentPending.length },
    { id: 'completed', label: '🎉 Done', count: completed.length },
    { id: 'accounts', label: '👤 Accounts', count: profiles.length },
    { id: 'calendar', label: '📅 Calendar' },
  ]

  const currentTab = TABS.find(t => t.id === tab)
  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 5, padding: '4px 8px', color: 'white', fontFamily: 'Poppins, sans-serif', fontSize: 11, cursor: 'pointer' }
  const sectionHeader = (label: string, count: number) => (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 22, color: 'white', margin: 0 }}>{label}</h2>
      <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(232,224,213,0.35)', fontFamily: 'Poppins, sans-serif' }}>{count} record{count !== 1 ? 's' : ''}</p>
    </div>
  )

  const BookingRow = ({ booking }: { booking: any }) => {
    const isOpen = expanded === booking.id
    const profile = booking.profiles
    const days = daysUntil(booking.event_date)
    return (
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `3px solid ${TEAL}`, borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
        <div onClick={() => setExpanded(isOpen ? null : booking.id)} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', cursor: 'pointer', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'white', fontFamily: 'Lora, serif' }}>{profile?.full_name || 'Unknown'}</p>
            <p style={{ margin: '2px 0 0', fontSize: 10, color: 'rgba(232,224,213,0.35)', fontFamily: 'Poppins, sans-serif' }}>
              {fmtDate(booking.event_date)}{booking.venue_name && ` · ${booking.venue_name}`}
            </p>
          </div>
          {days !== null && (
            <div style={{ background: days <= 14 ? 'rgba(214,48,49,0.1)' : 'rgba(79,185,175,0.1)', border: `1px solid ${days <= 14 ? 'rgba(214,48,49,0.3)' : 'rgba(79,185,175,0.3)'}`, borderRadius: 20, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'white', fontFamily: 'Lora, serif' }}>{days > 0 ? days : 0}</span>
              <span style={{ fontSize: 9, color: 'rgba(232,224,213,0.4)', letterSpacing: '1px' }}>DAYS</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 3 }}>
            {STEP_KEYS.map((k, i) => (
              <div key={k} style={{ width: 22, height: 5, borderRadius: 3, background: stepColor(booking[k]) }} title={STEP_LABELS[i]} />
            ))}
          </div>
          <span style={{ fontSize: 9, color: 'rgba(232,224,213,0.15)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
        </div>
        {isOpen && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px' }}>
            {/* Stack on mobile, grid on desktop */}
            <style>{`@media(min-width:600px){.brow-grid{display:grid !important;grid-template-columns:1fr 1fr;gap:24px;}}`}</style>
            <div className="brow-grid" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 10, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Client</p>
                {[['Name', profile?.full_name], ['Phone', profile?.phone], ['Event', booking.event_type], ['Venue', booking.venue_name], ['Date', fmtDate(booking.event_date)]].map(([k, v]) => v && (
                  <div key={k as string} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 10, color: 'rgba(232,224,213,0.3)', minWidth: 50, fontFamily: 'Poppins, sans-serif' }}>{k as string}</span>
                    <span style={{ fontSize: 10, color: 'rgba(232,224,213,0.75)', fontFamily: 'Poppins, sans-serif' }}>{v as string}</span>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 10, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Update Steps</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {STEP_KEYS.filter(k => k !== 'step_inquiry').map((key, i) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 10, color: 'rgba(232,224,213,0.5)', minWidth: 80, fontFamily: 'Poppins, sans-serif' }}>{STEP_LABELS[i + 1]}</span>
                      <select value={booking[key]} onChange={e => updateStep(booking.id, key, e.target.value)} disabled={saving === booking.id + key}
                        style={{ ...inputStyle, flex: 1, color: stepColor(booking[key]), border: `1px solid ${stepColor(booking[key])}40` }}>
                        {stepOptions(key).map(opt => <option key={opt} value={opt} style={{ background: '#0F1F35', color: 'white' }}>{opt}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, margin: '16px 0 8px', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Dashboard View</p>
                <div style={{ display: 'flex', gap: 3 }}>
                  {STEP_KEYS.map((k, i) => {
                    const val = booking[k]
                    const color = stepColor(val)
                    return (
                      <div key={k} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}30`, borderRadius: 5, padding: '6px 4px', textAlign: 'center' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 2 }}>{['complete','signed','paid','submitted'].includes(val) ? '✓' : ['pending','sent'].includes(val) ? '●' : '○'}</div>
                        <div style={{ fontSize: 7, color: 'rgba(232,224,213,0.35)', fontFamily: 'Poppins, sans-serif' }}>{STEP_LABELS[i]}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const InquiryRow = ({ inq }: { inq: any }) => {
    const isOpen = expanded === inq.id
    return (
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `3px solid ${statusColor(inq.status)}`, borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
        <div onClick={() => setExpanded(isOpen ? null : inq.id)} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', cursor: 'pointer', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(inq.status), flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 140 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'white', fontFamily: 'Lora, serif' }}>
              {inq.first_name} {inq.last_name}
              {inq.couple_names && <span style={{ fontSize: 11, color: 'rgba(232,224,213,0.35)', marginLeft: 8, fontFamily: 'Poppins, sans-serif', fontWeight: 400 }}>({inq.couple_names})</span>}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 10, color: 'rgba(232,224,213,0.35)', fontFamily: 'Poppins, sans-serif' }}>
              {fmtDateTime(inq.submitted_at)} · {inq.email}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, color: 'rgba(232,224,213,0.4)', fontFamily: 'Poppins, sans-serif' }}>{fmtDate(inq.event_date)}</span>
            <Link href={`/admin/contract/${inq.id}`} onClick={e => e.stopPropagation()} style={{ background: 'rgba(79,185,175,0.1)', color: TEAL, border: '1px solid rgba(79,185,175,0.25)', borderRadius: 6, padding: '5px 10px', fontSize: 10, fontWeight: 700, textDecoration: 'none', fontFamily: 'Poppins, sans-serif', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
              {inq.contract_sent ? 'Edit →' : 'Review →'}
            </Link>
          </div>
          <span style={{ fontSize: 9, color: 'rgba(232,224,213,0.15)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
        </div>
        {isOpen && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px' }}>
            <style>{`@media(min-width:600px){.inq-grid{display:grid !important;grid-template-columns:repeat(3,1fr);gap:20px;}.inq-grid2{display:grid !important;grid-template-columns:1fr 1fr;gap:20px;}}`}</style>

            {/* Row 1: Contact / Event / Services */}
            <div className="inq-grid" style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 10, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Contact</p>
                {[
                  ['Name', `${inq.first_name || ''} ${inq.last_name || ''}`.trim()],
                  ['Email', inq.email],
                  ['Phone', inq.phone],
                  ['Preferred Contact', inq.preferred_contact],
                  ['Couple / Event Name', inq.couple_names || inq.event_name],
                ].map(([k, v]) => v && (
                  <div key={k as string} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 10, color: 'rgba(232,224,213,0.3)', minWidth: 90, flexShrink: 0, fontFamily: 'Poppins, sans-serif' }}>{k as string}</span>
                    <span style={{ fontSize: 10, color: 'rgba(232,224,213,0.75)', fontFamily: 'Poppins, sans-serif', wordBreak: 'break-all' }}>{v as string}</span>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 10, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Event Details</p>
                {[
                  ['Date', fmtDate(inq.event_date)],
                  ['Start Time', inq.start_time],
                  ['End Time', inq.end_time],
                  ['Venue', inq.venue_name],
                  ['Address', inq.venue_address],
                  ['Setting', inq.indoor_outdoor],
                  ['Guests', inq.attendance],
                  ['Event Type', Array.isArray(inq.event_types) ? inq.event_types.join(', ') : inq.event_type],
                ].map(([k, v]) => v && (
                  <div key={k as string} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 10, color: 'rgba(232,224,213,0.3)', minWidth: 90, flexShrink: 0, fontFamily: 'Poppins, sans-serif' }}>{k as string}</span>
                    <span style={{ fontSize: 10, color: 'rgba(232,224,213,0.75)', fontFamily: 'Poppins, sans-serif' }}>{v as string}</span>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 10, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Services Requested</p>
                {(inq.services_requested || inq.event_types || []).map((s: string) => (
                  <div key={s} style={{ fontSize: 10, color: 'rgba(232,224,213,0.75)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Poppins, sans-serif' }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: TEAL, display: 'inline-block', flexShrink: 0 }} />{s}
                  </div>
                ))}
                {!inq.services_requested?.length && !inq.event_types?.length && (
                  <span style={{ fontSize: 10, color: 'rgba(232,224,213,0.25)', fontFamily: 'Poppins, sans-serif' }}>None listed</span>
                )}
              </div>
            </div>

            {/* Row 2: Referral / Notes */}
            <div className="inq-grid2" style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 10, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>How They Found Us</p>
                {[
                  ['Source', inq.hear_about || inq.how_did_you_hear],
                  ['Vendor Name', inq.vendor_name],
                  ['Vendor Type', inq.vendor_type],
                ].map(([k, v]) => v && (
                  <div key={k as string} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 10, color: 'rgba(232,224,213,0.3)', minWidth: 90, flexShrink: 0, fontFamily: 'Poppins, sans-serif' }}>{k as string}</span>
                    <span style={{ fontSize: 10, color: 'rgba(232,224,213,0.75)', fontFamily: 'Poppins, sans-serif' }}>{v as string}</span>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 10, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Additional Notes</p>
                {(inq.additional_notes || inq.additional_details) ? (
                  <p style={{ fontSize: 10, color: 'rgba(232,224,213,0.6)', lineHeight: 1.6, margin: 0, fontFamily: 'Poppins, sans-serif' }}>{inq.additional_notes || inq.additional_details}</p>
                ) : (
                  <span style={{ fontSize: 10, color: 'rgba(232,224,213,0.25)', fontFamily: 'Poppins, sans-serif' }}>None</span>
                )}
              </div>
            </div>

            {/* Status controls */}
            <div style={{ display: 'flex', gap: 6, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 9, color: 'rgba(232,224,213,0.3)', letterSpacing: '1px', textTransform: 'uppercase', marginRight: 4, fontFamily: 'Poppins, sans-serif', alignSelf: 'center' }}>Mark as:</span>
              {['pending', 'reviewed', 'declined'].map(s => (
                <button key={s} onClick={() => updateInquiryStatus(inq.id, s)} style={{ background: inq.status === s ? 'rgba(255,255,255,0.1)' : 'transparent', border: `1px solid ${inq.status === s ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`, color: inq.status === s ? 'white' : 'rgba(232,224,213,0.3)', borderRadius: 6, padding: '6px 14px', fontSize: 10, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', textTransform: 'capitalize' }}>{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const EmptyState = ({ msg }: { msg: string }) => (
    <div style={{ textAlign: 'center', padding: '60px 24px', color: 'rgba(232,224,213,0.25)', fontFamily: 'Poppins, sans-serif' }}>{msg}</div>
  )

  const { firstDay, daysInMonth, year, month } = getDaysInMonth(calMonth)
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0F1F35 0%, #0A1828 100%)', fontFamily: 'Poppins, sans-serif', paddingBottom: 80 }}>
      <style>{`
        @media (max-width: 640px) {
          .admin-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .admin-header-right { display: none !important; }
          .admin-cal-cell { min-height: 52px !important; padding: 4px !important; }
          .admin-cal-dayname { font-size: 7px !important; }
        }
      `}</style>

      {/* Header */}
      <header style={{ background: 'rgba(10,24,40,0.97)', borderBottom: '1px solid rgba(79,185,175,0.12)', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 15, color: RED }}>Pescadero Music</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '3px', color: TEAL, textTransform: 'uppercase', background: 'rgba(79,185,175,0.1)', border: '1px solid rgba(79,185,175,0.2)', borderRadius: 4, padding: '2px 8px' }}>Admin</span>
        </div>
        <div className="admin-header-right" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(232,224,213,0.3)' }}>{pendingInquiries.length} pending · {activeBookings.length} active</span>
          <Link href="/dashboard" style={{ fontSize: 11, color: 'rgba(232,224,213,0.3)', textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase' }}>← Dashboard</Link>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 14px 0' }}>
        {/* Stat cards */}
        <div className="admin-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Pending', value: pendingInquiries.length, color: pendingInquiries.length > 0 ? GOLD : TEAL, tab: 'inquiries' as Tab },
            { label: 'Contracts', value: contractsSent.length, color: TEAL, tab: 'contracts_sent' as Tab },
            { label: 'Active', value: activeBookings.length, color: RED, tab: 'active' as Tab },
            { label: 'Accounts', value: profiles.length, color: TEAL, tab: 'accounts' as Tab },
          ].map(({ label, value, color, tab: t }) => (
            <div key={label} onClick={() => setTab(t)} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}25`, borderTop: `2px solid ${color}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer' }}>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'white', fontFamily: 'Lora, serif' }}>{value}</p>
              <p style={{ margin: '3px 0 0', fontSize: 9, color: 'rgba(232,224,213,0.4)', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Tab bar — scrollable on mobile */}
        <div style={{ display: 'flex', gap: 3, marginBottom: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: 4, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {TABS.map(({ id, label, count }) => (
            <button key={id} onClick={() => { setTab(id); setExpanded(null) }} style={{ flexShrink: 0, padding: '8px 10px', border: 'none', borderRadius: 7, background: tab === id ? NAVY : 'transparent', color: tab === id ? 'white' : 'rgba(232,224,213,0.4)', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: 'Poppins, sans-serif', whiteSpace: 'nowrap' }}>
              {label}
              {count !== undefined && count > 0 && <span style={{ background: tab === id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '1px 6px', fontSize: 9 }}>{count}</span>}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        {tab === 'inquiries' && (
          <div>
            {sectionHeader('Pending Inquiries', pendingInquiries.length)}
            {pendingInquiries.length === 0 ? <EmptyState msg="No pending inquiries. New form submissions will appear here." /> : pendingInquiries.map(inq => <InquiryRow key={inq.id} inq={inq} />)}
          </div>
        )}
        {tab === 'contracts_sent' && (
          <div>
            {sectionHeader('Contracts Sent', contractsSent.length)}
            {contractsSent.length === 0 ? <EmptyState msg="No contracts sent yet." /> : contractsSent.map(inq => <InquiryRow key={inq.id} inq={inq} />)}
          </div>
        )}
        {tab === 'active' && (
          <div>
            {sectionHeader('Active Bookings', activeBookings.length)}
            {activeBookings.length === 0 ? <EmptyState msg="No active bookings yet." /> : activeBookings.map(b => <BookingRow key={b.id} booking={b} />)}
          </div>
        )}
        {tab === 'planning' && (
          <div>
            {sectionHeader('Planning Forms Received', planningReceived.length)}
            {planningReceived.length === 0 ? <EmptyState msg="No planning forms received yet." /> : planningReceived.map(b => <BookingRow key={b.id} booking={b} />)}
          </div>
        )}
        {tab === 'final_payment' && (
          <div>
            {sectionHeader('Final Payment Pending', finalPaymentPending.length)}
            {finalPaymentPending.length === 0 ? <EmptyState msg="No final payments pending." /> : finalPaymentPending.map(b => <BookingRow key={b.id} booking={b} />)}
          </div>
        )}
        {tab === 'completed' && (
          <div>
            {sectionHeader('Completed Events', completed.length)}
            {completed.length === 0 ? <EmptyState msg="No completed events yet." /> : completed.map(b => <BookingRow key={b.id} booking={b} />)}
          </div>
        )}
        {tab === 'accounts' && (
          <div>
            {sectionHeader('Client Accounts', profiles.length)}
            {profiles.length === 0 ? <EmptyState msg="No accounts yet." /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {profiles.map(profile => {
                  const isOpen = expanded === profile.id
                  const booking = localBookings.find(b => b.client_id === profile.id)
                  const inquiry = localInquiries.find(i => i.client_id === profile.id)
                  return (
                    <div key={profile.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `3px solid ${booking ? TEAL : inquiry ? GOLD : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, overflow: 'hidden' }}>
                      <div onClick={() => setExpanded(isOpen ? null : profile.id)} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', cursor: 'pointer', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}, ${NAVY})`, border: `2px solid ${TEAL}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                          {profile.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'white', fontFamily: 'Lora, serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.full_name || 'No name'}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 10, color: 'rgba(232,224,213,0.35)', fontFamily: 'Poppins, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.email}{profile.phone && ` · ${profile.phone}`}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          {inquiry && <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 4, background: `${GOLD}15`, border: `1px solid ${GOLD}35`, color: GOLD, fontFamily: 'Poppins, sans-serif' }}>Inquiry</span>}
                          {booking && <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 4, background: `${TEAL}15`, border: `1px solid ${TEAL}35`, color: TEAL, fontFamily: 'Poppins, sans-serif' }}>Booked</span>}
                        </div>
                        <span style={{ fontSize: 9, color: 'rgba(232,224,213,0.15)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
                      </div>
                      {isOpen && (
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px' }}>
                          <style>{`@media(min-width:500px){.acct-grid{display:grid !important;grid-template-columns:1fr 1fr;gap:20px;}}`}</style>
                          <div className="acct-grid" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                              <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 10, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Profile</p>
                              {[['Name', profile.full_name], ['Email', profile.email], ['Phone', profile.phone], ['Preferred', profile.preferred_contact]].map(([k, v]) => v && (
                                <div key={k as string} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                                  <span style={{ fontSize: 10, color: 'rgba(232,224,213,0.3)', minWidth: 70, fontFamily: 'Poppins, sans-serif' }}>{k as string}</span>
                                  <span style={{ fontSize: 10, color: 'rgba(232,224,213,0.75)', fontFamily: 'Poppins, sans-serif', wordBreak: 'break-all' }}>{v as string}</span>
                                </div>
                              ))}
                            </div>
                            {booking && (
                              <div>
                                <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 10, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Booking</p>
                                {[['Event', booking.event_type], ['Date', fmtDate(booking.event_date)], ['Venue', booking.venue_name]].map(([k, v]) => v && (
                                  <div key={k as string} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                                    <span style={{ fontSize: 10, color: 'rgba(232,224,213,0.3)', minWidth: 70, fontFamily: 'Poppins, sans-serif' }}>{k as string}</span>
                                    <span style={{ fontSize: 10, color: 'rgba(232,224,213,0.75)', fontFamily: 'Poppins, sans-serif' }}>{v as string}</span>
                                  </div>
                                ))}
                                <div style={{ display: 'flex', gap: 3, marginTop: 10 }}>
                                  {STEP_KEYS.map((k, i) => (
                                    <div key={k} style={{ flex: 1, height: 4, borderRadius: 2, background: stepColor(booking[k]) }} title={STEP_LABELS[i]} />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'calendar' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 20, color: 'white', margin: 0 }}>
                {MONTH_NAMES[month]} {year}
              </h2>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setCalMonth(new Date(year, month - 1, 1))} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 12px', color: 'rgba(232,224,213,0.7)', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: 12 }}>← Prev</button>
                <button onClick={() => setCalMonth(new Date())} style={{ background: 'rgba(79,185,175,0.1)', border: '1px solid rgba(79,185,175,0.25)', borderRadius: 6, padding: '6px 12px', color: TEAL, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 600 }}>Today</button>
                <button onClick={() => setCalMonth(new Date(year, month + 1, 1))} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 12px', color: 'rgba(232,224,213,0.7)', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: 12 }}>Next →</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 3 }}>
              {DAY_NAMES.map(d => (
                <div key={d} className="admin-cal-dayname" style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(232,224,213,0.3)', padding: '5px 0', fontFamily: 'Poppins, sans-serif' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} style={{ minHeight: 70, background: 'rgba(255,255,255,0.01)', borderRadius: 6 }} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const events = getEventsForDay(day)
                const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year
                return (
                  <div key={day} className="admin-cal-cell" style={{
                    minHeight: 70, background: isToday ? 'rgba(79,185,175,0.08)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isToday ? 'rgba(79,185,175,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 6, padding: '6px',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: isToday ? 700 : 400, color: isToday ? TEAL : 'rgba(232,224,213,0.5)', marginBottom: 4, fontFamily: 'Poppins, sans-serif' }}>{day}</div>
                    {events.map(event => (
                      <div key={event.id} style={{ background: RED, borderRadius: 3, padding: '2px 4px', marginBottom: 2 }}>
                        <p style={{ margin: 0, fontSize: 8, fontWeight: 700, color: 'white', fontFamily: 'Poppins, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {event.profiles?.full_name || 'Event'}
                        </p>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: RED }} />
                <span style={{ fontSize: 10, color: 'rgba(232,224,213,0.4)', fontFamily: 'Poppins, sans-serif' }}>Event</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: TEAL }} />
                <span style={{ fontSize: 10, color: 'rgba(232,224,213,0.4)', fontFamily: 'Poppins, sans-serif' }}>Today</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
