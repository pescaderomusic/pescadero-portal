'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const TEAL = '#4FB9AF'
const RED  = '#D63031'
const GOLD = '#C8A96E'

const STEP_FIELDS = [
  { key: 'step_inquiry',      label: 'Inquiry' },
  { key: 'step_contract',     label: 'Contract' },
  { key: 'step_deposit',      label: 'Deposit' },
  { key: 'step_planning',     label: 'Planning' },
  { key: 'step_consultation', label: 'Consultation' },
  { key: 'step_event',        label: 'Event' },
]

function stepOptions(key: string) {
  if (key === 'step_contract')     return ['locked', 'sent', 'signed']
  if (key === 'step_deposit')      return ['locked', 'pending', 'paid']
  if (key === 'step_planning')     return ['locked', 'pending', 'submitted']
  if (key === 'step_consultation') return ['locked', 'pending', 'complete']
  if (key === 'step_event')        return ['locked', 'complete']
  return ['complete']
}

function stepColor(val: string) {
  if (['complete','signed','paid','submitted'].includes(val)) return TEAL
  if (['pending','sent'].includes(val)) return RED
  return '#4A5568'
}

function statusColor(s: string) {
  if (s === 'approved') return TEAL
  if (s === 'pending') return GOLD
  if (s === 'declined') return RED
  return '#4A5568'
}

export default function AdminDashboard({ bookings, inquiries }: { bookings: any[], inquiries: any[] }) {
  const supabase = createClient()
  const [tab, setTab] = useState<'inquiries' | 'bookings'>('inquiries')
  const [saving, setSaving] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [localBookings, setLocalBookings] = useState(bookings)
  const [localInquiries, setLocalInquiries] = useState(inquiries)
  const [sendingContract, setSendingContract] = useState<string | null>(null)

  const formatDate = (d: string | null) => {
    if (!d) return 'TBD'
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

  async function updateStep(bookingId: string, field: string, value: string) {
    setSaving(bookingId + field)
    try {
      const res = await fetch('/api/admin/update-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, field, value }),
      })
      const data = await res.json()
      if (data.updates) {
        setLocalBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...data.updates } : b))
      }
    } catch(err) { console.error(err) }
    setSaving(null)
  }

  async function sendContract(inq: any) {
    setSendingContract(inq.id)
    try {
      if (inq.client_id) {
        const { data: existing } = await supabase.from('bookings').select('id').eq('client_id', inq.client_id).single()
        if (existing) {
          await supabase.from('bookings').update({
            event_date: inq.event_date, venue_name: inq.venue_name,
            venue_address: inq.venue_address, event_type: inq.event_name,
            step_inquiry: 'complete', step_contract: 'sent',
          }).eq('id', existing.id)
        } else {
          await supabase.from('bookings').insert({
            client_id: inq.client_id, event_date: inq.event_date,
            venue_name: inq.venue_name, venue_address: inq.venue_address,
            event_type: inq.event_name, step_inquiry: 'complete', step_contract: 'sent',
            step_deposit: 'locked', step_planning: 'locked', step_consultation: 'locked', step_event: 'locked',
          })
        }
      }
      await supabase.from('inquiry_submissions').update({ status: 'approved', contract_sent: true }).eq('id', inq.id)
      setLocalInquiries(prev => prev.map(i => i.id === inq.id ? { ...i, status: 'approved', contract_sent: true } : i))
      alert(`Contract sent to ${inq.first_name} ${inq.last_name}!`)
    } catch (err) { console.error(err) }
    setSendingContract(null)
  }

  async function updateInquiryStatus(id: string, status: string) {
    await supabase.from('inquiry_submissions').update({ status }).eq('id', id)
    setLocalInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i))
  }

  const pendingCount = localInquiries.filter(i => i.status === 'pending').length

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0F1F35 0%, #0A1828 100%)', paddingBottom: 80 }}>
      <header style={{
        background: 'rgba(10,24,40,0.95)', borderBottom: '1px solid rgba(79,185,175,0.15)',
        padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 16, color: RED }}>Pescadero Music</span>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: TEAL, marginLeft: 10, letterSpacing: '2px' }}>ADMIN</span>
        </div>
        <span style={{ fontSize: 11, color: 'rgba(232,224,213,0.3)', fontFamily: 'Poppins, sans-serif' }}>
          {pendingCount} pending {pendingCount === 1 ? 'inquiry' : 'inquiries'}
        </span>
      </header>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4 }}>
          {([['inquiries', 'Inquiries', pendingCount], ['bookings', 'Active Bookings', localBookings.length]] as [string, string, number][]).map(([id, label, count]) => (
            <button key={id} onClick={() => setTab(id as any)} style={{
              flex: 1, padding: '10px 16px', border: 'none', borderRadius: 8,
              background: tab === id ? '#0F1F35' : 'transparent',
              color: tab === id ? 'white' : 'rgba(232,224,213,0.4)',
              fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {label}
              {count > 0 && <span style={{ background: tab === id ? RED : 'rgba(214,48,49,0.3)', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>{count}</span>}
            </button>
          ))}
        </div>

        {/* INQUIRIES */}
        {tab === 'inquiries' && (
          <div>
            <h1 style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 26, color: 'white', marginBottom: 8 }}>Inquiry Submissions</h1>
            <p style={{ fontSize: 13, color: 'rgba(232,224,213,0.4)', fontFamily: 'Poppins, sans-serif', marginBottom: 28 }}>
              Review inquiries and send contracts directly to client dashboards.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {localInquiries.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 24px', color: 'rgba(232,224,213,0.3)', fontFamily: 'Poppins, sans-serif' }}>
                  No inquiries yet. They'll appear here when clients submit the form.
                </div>
              )}
              {localInquiries.map(inq => {
                const isOpen = expanded === inq.id
                return (
                  <div key={inq.id} style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12, overflow: 'hidden', borderLeft: `3px solid ${statusColor(inq.status)}`,
                  }}>
                    <div onClick={() => setExpanded(isOpen ? null : inq.id)} style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', cursor: 'pointer', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'white', fontFamily: 'Lora, serif' }}>
                          {inq.first_name} {inq.last_name}
                          {inq.couple_names && <span style={{ fontSize: 12, color: 'rgba(232,224,213,0.4)', marginLeft: 8 }}>({inq.couple_names})</span>}
                        </p>
                        <p style={{ margin: '3px 0 0', fontSize: 11, color: 'rgba(232,224,213,0.4)', fontFamily: 'Poppins, sans-serif' }}>
                          {formatDateTime(inq.submitted_at)} · {inq.venue_name || 'Venue TBD'} · {formatDate(inq.event_date)}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
                          padding: '3px 10px', borderRadius: 4,
                          background: `${statusColor(inq.status)}18`, border: `1px solid ${statusColor(inq.status)}40`,
                          color: statusColor(inq.status), fontFamily: 'Poppins, sans-serif',
                        }}>{inq.contract_sent ? 'Contract Sent' : inq.status}</span>
                        <Link
                          href={`/admin/contract/${inq.id}`}
                          onClick={e => e.stopPropagation()}
                          style={{
                            background: 'rgba(79,185,175,0.1)', color: TEAL,
                            border: '1px solid rgba(79,185,175,0.25)', borderRadius: 7,
                            padding: '7px 14px', fontSize: 11, fontWeight: 700,
                            textDecoration: 'none', fontFamily: 'Poppins, sans-serif',
                            display: 'inline-flex', alignItems: 'center',
                          }}>
                          {inq.contract_sent ? '📋 Edit Contract' : '📋 Review & Send →'}
                        </Link>
                      </div>
                      <span style={{ fontSize: 10, color: 'rgba(232,224,213,0.2)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
                    </div>

                    {isOpen && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 16 }}>
                          <div>
                            <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 10 }}>Contact</h4>
                            {[['Email', inq.email], ['Phone', inq.phone], ['Preferred', inq.preferred_contact], ['Budget', inq.budget]].map(([k, v]) => v && (
                              <div key={k as string} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                                <span style={{ fontSize: 11, color: 'rgba(232,224,213,0.35)', fontFamily: 'Poppins, sans-serif', minWidth: 80 }}>{k as string}</span>
                                <span style={{ fontSize: 11, color: 'rgba(232,224,213,0.8)', fontFamily: 'Poppins, sans-serif' }}>{v as string}</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 10 }}>Event</h4>
                            {[
                              ['Event', inq.event_name], ['Date', formatDate(inq.event_date)],
                              ['Time', `${inq.start_time || '—'} – ${inq.end_time || '—'}`],
                              ['Venue', inq.venue_name], ['Address', inq.venue_address],
                              ['Setting', inq.indoor_outdoor], ['Attendance', inq.attendance],
                            ].map(([k, v]) => v && (
                              <div key={k as string} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                                <span style={{ fontSize: 11, color: 'rgba(232,224,213,0.35)', fontFamily: 'Poppins, sans-serif', minWidth: 80 }}>{k as string}</span>
                                <span style={{ fontSize: 11, color: 'rgba(232,224,213,0.8)', fontFamily: 'Poppins, sans-serif' }}>{v as string}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {inq.services_requested?.length > 0 && (
                          <div style={{ marginBottom: 14 }}>
                            <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 8 }}>Services</h4>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {inq.services_requested.map((s: string) => (
                                <span key={s} style={{ fontSize: 10, padding: '3px 10px', borderRadius: 4, background: 'rgba(79,185,175,0.1)', border: '1px solid rgba(79,185,175,0.25)', color: TEAL, fontFamily: 'Poppins, sans-serif' }}>{s}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {inq.additional_notes && (
                          <div style={{ marginBottom: 14 }}>
                            <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 8 }}>Notes</h4>
                            <p style={{ fontSize: 12, color: 'rgba(232,224,213,0.65)', fontFamily: 'Poppins, sans-serif', lineHeight: 1.6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: '10px 12px', margin: 0 }}>
                              {inq.additional_notes}
                            </p>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          {['pending', 'reviewed', 'declined'].map(s => (
                            <button key={s} onClick={() => updateInquiryStatus(inq.id, s)} style={{
                              background: inq.status === s ? 'rgba(255,255,255,0.08)' : 'transparent',
                              border: `1px solid ${inq.status === s ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
                              color: inq.status === s ? 'white' : 'rgba(232,224,213,0.35)',
                              borderRadius: 6, padding: '5px 14px', fontSize: 11,
                              cursor: 'pointer', fontFamily: 'Poppins, sans-serif', textTransform: 'capitalize',
                            }}>{s}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* BOOKINGS */}
        {tab === 'bookings' && (
          <div>
            <h1 style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 26, color: 'white', marginBottom: 8 }}>Active Bookings</h1>
            <p style={{ fontSize: 13, color: 'rgba(232,224,213,0.4)', fontFamily: 'Poppins, sans-serif', marginBottom: 28 }}>Advance client steps as things progress.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {localBookings.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 24px', color: 'rgba(232,224,213,0.3)', fontFamily: 'Poppins, sans-serif' }}>No bookings yet.</div>
              )}
              {localBookings.map(booking => {
                const isOpen = expanded === booking.id
                const profile = booking.profiles
                return (
                  <div key={booking.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
                    <div onClick={() => setExpanded(isOpen ? null : booking.id)} style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', cursor: 'pointer', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'white', fontFamily: 'Lora, serif' }}>{profile?.full_name || 'Unknown Client'}</p>
                        <p style={{ margin: '3px 0 0', fontSize: 11, color: 'rgba(232,224,213,0.4)', fontFamily: 'Poppins, sans-serif' }}>
                          {formatDate(booking.event_date)}{booking.venue_name && ` · ${booking.venue_name}`}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {STEP_FIELDS.map(({ key, label }) => (
                          <span key={key} style={{ fontSize: 9, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, background: `${stepColor(booking[key])}18`, border: `1px solid ${stepColor(booking[key])}40`, color: stepColor(booking[key]), fontFamily: 'Poppins, sans-serif' }}>{label}</span>
                        ))}
                      </div>
                      <span style={{ fontSize: 10, color: 'rgba(232,224,213,0.2)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
                    </div>
                    {isOpen && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div>
                          <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 12 }}>Client</h4>
                          {[['Name', profile?.full_name], ['Phone', profile?.phone]].map(([k, v]) => v && (
                            <div key={k as string} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                              <span style={{ fontSize: 11, color: 'rgba(232,224,213,0.35)', fontFamily: 'Poppins, sans-serif', minWidth: 80 }}>{k as string}</span>
                              <span style={{ fontSize: 11, color: 'rgba(232,224,213,0.8)', fontFamily: 'Poppins, sans-serif' }}>{v as string}</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, marginBottom: 12 }}>Update Steps</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {STEP_FIELDS.filter(s => s.key !== 'step_inquiry').map(({ key, label }) => (
                              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                <span style={{ fontSize: 12, color: 'rgba(232,224,213,0.6)', fontFamily: 'Poppins, sans-serif', minWidth: 90 }}>{label}</span>
                                <select value={booking[key]} onChange={e => updateStep(booking.id, key, e.target.value)} disabled={saving === booking.id + key}
                                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: `1px solid ${stepColor(booking[key])}40`, borderRadius: 6, padding: '6px 10px', color: stepColor(booking[key]), fontFamily: 'Poppins, sans-serif', fontSize: 12, cursor: 'pointer' }}>
                                  {stepOptions(key).map(opt => <option key={opt} value={opt} style={{ background: '#0F1F35', color: 'white' }}>{opt}</option>)}
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
