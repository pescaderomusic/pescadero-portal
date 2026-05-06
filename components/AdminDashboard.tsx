'use client'
import { useState } from 'react'
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

const CONTRACT_OPTIONS   = ['locked', 'sent', 'signed']
const DEPOSIT_OPTIONS    = ['locked', 'pending', 'paid']
const PLANNING_OPTIONS   = ['locked', 'pending', 'submitted']
const CONSULT_OPTIONS    = ['locked', 'pending', 'complete']
const EVENT_OPTIONS      = ['locked', 'complete']

function stepOptions(key: string) {
  if (key === 'step_contract')     return CONTRACT_OPTIONS
  if (key === 'step_deposit')      return DEPOSIT_OPTIONS
  if (key === 'step_planning')     return PLANNING_OPTIONS
  if (key === 'step_consultation') return CONSULT_OPTIONS
  if (key === 'step_event')        return EVENT_OPTIONS
  return ['complete']
}

function stepColor(val: string) {
  if (val === 'complete' || val === 'signed' || val === 'paid' || val === 'submitted') return TEAL
  if (val === 'pending' || val === 'sent') return RED
  return '#4A5568'
}

export default function AdminDashboard({ bookings }: { bookings: any[] }) {
  const supabase = createClient()
  const [saving, setSaving] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [localBookings, setLocalBookings] = useState(bookings)

  async function updateStep(bookingId: string, field: string, value: string) {
    setSaving(bookingId + field)

    // If unlocking contract, also unlock deposit chain
    const updates: Record<string, string> = { [field]: value }
    if (field === 'step_contract' && value === 'sent') updates.step_deposit = 'locked'
    if (field === 'step_deposit' && value === 'paid') updates.step_planning = 'pending'
    if (field === 'step_planning' && value === 'submitted') updates.step_consultation = 'pending'

    const { error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', bookingId)

    if (!error) {
      setLocalBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, ...updates } : b
      ))
    }
    setSaving(null)
  }

  const formatDate = (d: string | null) => {
    if (!d) return 'TBD'
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0F1F35 0%, #0A1828 100%)',
      padding: '0 0 80px',
    }}>
      {/* Admin header */}
      <header style={{
        background: 'rgba(10,24,40,0.95)',
        borderBottom: '1px solid rgba(79,185,175,0.15)',
        padding: '0 32px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <span style={{
            fontFamily: 'Georgia, serif', fontStyle: 'italic',
            fontSize: 16, color: '#D63031',
          }}>Pescadero Music</span>
          <span style={{
            fontFamily: 'Poppins, sans-serif', fontSize: 11,
            color: TEAL, marginLeft: 10, letterSpacing: '2px',
          }}>ADMIN</span>
        </div>
        <span style={{
          fontSize: 11, color: 'rgba(232,224,213,0.3)',
          fontFamily: 'Poppins, sans-serif',
        }}>
          {localBookings.length} booking{localBookings.length !== 1 ? 's' : ''}
        </span>
      </header>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{
          fontFamily: 'Lora, serif', fontStyle: 'italic',
          fontSize: 28, color: 'white', marginBottom: 8,
        }}>Client Bookings</h1>
        <p style={{
          fontSize: 13, color: 'rgba(232,224,213,0.4)',
          fontFamily: 'Poppins, sans-serif', marginBottom: 32,
        }}>
          Update each client's step status as things progress.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {localBookings.length === 0 && (
            <div className="pm-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <p style={{ color: 'rgba(232,224,213,0.4)', fontFamily: 'Poppins, sans-serif' }}>
                No bookings yet. They'll appear here as clients sign up.
              </p>
            </div>
          )}

          {localBookings.map(booking => {
            const isOpen = expanded === booking.id
            const profile = booking.profiles
            const inquiry = booking.inquiries?.[0]

            return (
              <div key={booking.id} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, overflow: 'hidden',
              }}>
                {/* Row header */}
                <div
                  onClick={() => setExpanded(isOpen ? null : booking.id)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '16px 20px', cursor: 'pointer', gap: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Name + date */}
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <p style={{
                      margin: 0, fontSize: 15, fontWeight: 600,
                      color: 'white', fontFamily: 'Lora, serif',
                    }}>
                      {profile?.full_name || 'Unknown Client'}
                    </p>
                    <p style={{
                      margin: '3px 0 0', fontSize: 11,
                      color: 'rgba(232,224,213,0.4)',
                      fontFamily: 'Poppins, sans-serif',
                    }}>
                      {formatDate(booking.event_date)}
                      {booking.venue_name && ` · ${booking.venue_name}`}
                    </p>
                  </div>

                  {/* Step pills */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {STEP_FIELDS.map(({ key, label }) => (
                      <span key={key} style={{
                        fontSize: 9, fontWeight: 600, letterSpacing: '1px',
                        textTransform: 'uppercase', padding: '3px 8px',
                        borderRadius: 4,
                        background: `${stepColor(booking[key])}18`,
                        border: `1px solid ${stepColor(booking[key])}40`,
                        color: stepColor(booking[key]),
                        fontFamily: 'Poppins, sans-serif',
                      }}>{label}</span>
                    ))}
                  </div>

                  <span style={{
                    fontSize: 10, color: 'rgba(232,224,213,0.2)',
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s', display: 'inline-block',
                  }}>▼</span>
                </div>

                {/* Expanded details */}
                {isOpen && (
                  <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    padding: '20px',
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: 24,
                  }}>
                    {/* Contact info */}
                    <div>
                      <h3 style={{
                        fontFamily: 'Poppins, sans-serif', fontSize: 10,
                        letterSpacing: '2px', textTransform: 'uppercase',
                        color: TEAL, marginBottom: 12,
                      }}>Client Info</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {[
                          ['Name', profile?.full_name],
                          ['Phone', profile?.phone],
                          ['Contact Pref.', profile?.preferred_contact],
                          ['Event Type', inquiry?.event_type || booking.event_type],
                          ['Budget', inquiry?.budget_range],
                          ['Services', inquiry?.services_requested?.join(', ')],
                        ].map(([label, val]) => val && (
                          <div key={label} style={{ display: 'flex', gap: 8 }}>
                            <span style={{
                              fontSize: 11, color: 'rgba(232,224,213,0.35)',
                              fontFamily: 'Poppins, sans-serif', minWidth: 90,
                            }}>{label}</span>
                            <span style={{
                              fontSize: 11, color: 'rgba(232,224,213,0.8)',
                              fontFamily: 'Poppins, sans-serif',
                            }}>{val}</span>
                          </div>
                        ))}
                        {inquiry?.additional_notes && (
                          <div style={{ marginTop: 8 }}>
                            <span style={{
                              fontSize: 10, color: 'rgba(232,224,213,0.35)',
                              fontFamily: 'Poppins, sans-serif', display: 'block', marginBottom: 4,
                            }}>Notes</span>
                            <p style={{
                              fontSize: 12, color: 'rgba(232,224,213,0.7)',
                              fontFamily: 'Poppins, sans-serif', lineHeight: 1.5,
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.07)',
                              borderRadius: 6, padding: '8px 10px', margin: 0,
                            }}>{inquiry.additional_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step controls */}
                    <div>
                      <h3 style={{
                        fontFamily: 'Poppins, sans-serif', fontSize: 10,
                        letterSpacing: '2px', textTransform: 'uppercase',
                        color: TEAL, marginBottom: 12,
                      }}>Update Steps</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {STEP_FIELDS.filter(s => s.key !== 'step_inquiry').map(({ key, label }) => (
                          <div key={key} style={{
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', gap: 12,
                          }}>
                            <span style={{
                              fontSize: 12, color: 'rgba(232,224,213,0.6)',
                              fontFamily: 'Poppins, sans-serif', minWidth: 90,
                            }}>{label}</span>
                            <select
                              value={booking[key]}
                              onChange={e => updateStep(booking.id, key, e.target.value)}
                              disabled={saving === booking.id + key}
                              style={{
                                flex: 1,
                                background: 'rgba(255,255,255,0.05)',
                                border: `1px solid ${stepColor(booking[key])}40`,
                                borderRadius: 6, padding: '6px 10px',
                                color: stepColor(booking[key]),
                                fontFamily: 'Poppins, sans-serif', fontSize: 12,
                                cursor: 'pointer',
                              }}
                            >
                              {stepOptions(key).map(opt => (
                                <option key={opt} value={opt}
                                  style={{ background: '#0F1F35', color: 'white' }}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                            {saving === booking.id + key && (
                              <span style={{ fontSize: 11, color: TEAL, fontFamily: 'Poppins, sans-serif' }}>
                                Saving…
                              </span>
                            )}
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
    </div>
  )
}
