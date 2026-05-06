'use client'
import { useState } from 'react'
import Link from 'next/link'

const TEAL = '#4FB9AF'
const RED  = '#D63031'
const GOLD = '#C8A96E'
const NAVY = '#0F1F35'

interface Booking {
  id: string
  event_date: string | null
  venue_name: string | null
  venue_address: string | null
  package: string
  step_inquiry: string
  step_contract: string
  step_deposit: string
  step_planning: string
  step_consultation: string
  step_event: string
}

interface Props {
  booking: Booking
  clientName: string
}

function getStepStatus(val: string): 'complete' | 'active' | 'locked' {
  if (val === 'complete' || val === 'signed' || val === 'paid' || val === 'submitted') return 'complete'
  if (val === 'pending' || val === 'sent') return 'active'
  return 'locked'
}

export default function StepTracker({ booking, clientName }: Props) {
  const steps = [
    {
      id: 'inquiry',
      num: '01',
      title: 'Inquiry',
      subtitle: 'Tell us about your event',
      description: 'Your inquiry has been received. Garrett will follow up via your preferred contact method to confirm availability.',
      status: getStepStatus(booking.step_inquiry),
      actionLabel: 'View Your Inquiry',
      href: '/inquiry/view',
    },
    {
      id: 'contract',
      num: '02',
      title: 'Service Agreement',
      subtitle: 'Review & acknowledge your contract',
      description: booking.step_contract === 'sent'
        ? 'Your service agreement is ready to review. Read through the terms and acknowledge below.'
        : 'Your personalized service agreement will appear here once Garrett has confirmed your booking details.',
      status: getStepStatus(booking.step_contract),
      actionLabel: 'Review Contract',
      href: '/contract',
    },
    {
      id: 'deposit',
      num: '03',
      title: 'Deposit',
      subtitle: '$100 non-refundable deposit',
      description: 'Secure your date with a $100 deposit. This is non-refundable and locks in your booking.',
      status: getStepStatus(booking.step_deposit),
      actionLabel: 'Pay Deposit',
      payLinks: [
        { label: 'Venmo', url: 'https://venmo.com/u/pescaderomusic', color: '#008CFF' },
        { label: 'PayPal', url: 'https://paypal.me/pescaderomusic', color: '#003087' },
        { label: 'CashApp', url: 'https://cash.app/$pescaderomusic', color: '#00D632' },
      ],
    },
    {
      id: 'planning',
      num: '04',
      title: 'Planning Form',
      subtitle: 'Timeline, music & event details',
      description: 'Fill out your complete event timeline, music preferences, MC announcements, vendor contacts, and more.',
      status: getStepStatus(booking.step_planning),
      actionLabel: booking.step_planning === 'submitted' ? 'Edit Planning Form' : 'Open Planning Form',
      href: '/planning',
    },
    {
      id: 'consultation',
      num: '05',
      title: 'Playlist Consultation',
      subtitle: 'Build your perfect soundtrack',
      description: "Garrett will reach out to schedule a short call to finalize your playlist and walk through the event flow together.",
      status: getStepStatus(booking.step_consultation),
      actionLabel: 'Schedule a Call',
      href: 'mailto:garrett@pescaderomusic.com?subject=Playlist Consultation',
    },
    {
      id: 'event',
      num: '06',
      title: 'Event Day',
      subtitle: "It's your day — enjoy every moment",
      description: "Everything is locked in. Your Pescadero Music technician will arrive 45 minutes before start time. All you have to do is show up.",
      status: getStepStatus(booking.step_event),
      actionLabel: 'View Day-Of Summary',
    },
  ]

  const [expanded, setExpanded] = useState<string | null>(
    steps.find(s => s.status === 'active')?.id || null
  )

  const completedCount = steps.filter(s => s.status === 'complete').length
  const activeStep = steps.find(s => s.status === 'active')

  const formatDate = (d: string | null) => {
    if (!d) return 'Date TBD'
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  return (
    <div>
      {/* Event card */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(79,185,175,0.18)',
        borderRadius: 12, padding: '22px 26px',
        marginBottom: 32,
        display: 'flex', flexWrap: 'wrap',
        gap: 16, alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{
            fontFamily: 'Poppins, sans-serif', fontSize: 10,
            letterSpacing: '3px', textTransform: 'uppercase',
            color: TEAL, margin: '0 0 8px',
          }}>Your Event</p>
          <h1 style={{
            fontFamily: 'Lora, serif', fontStyle: 'italic',
            fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: 'white',
          }}>{clientName || 'Your Event'}</h1>
          <p style={{
            margin: 0, fontSize: 13, color: 'rgba(232,224,213,0.6)',
            fontFamily: 'Poppins, sans-serif',
          }}>
            {formatDate(booking.event_date)}
            {booking.venue_name && ` · ${booking.venue_name}`}
          </p>
        </div>
        <div style={{
          background: 'rgba(200,169,110,0.1)',
          border: `1px solid ${GOLD}`,
          borderRadius: 8, padding: '10px 18px',
          textAlign: 'right',
        }}>
          <p style={{
            margin: 0, fontSize: 9, letterSpacing: '2px',
            textTransform: 'uppercase', color: GOLD,
            fontFamily: 'Poppins, sans-serif',
          }}>Package</p>
          <p style={{
            margin: '4px 0 0', fontSize: 13, fontWeight: 600,
            color: 'white', fontFamily: 'Poppins, sans-serif',
          }}>{booking.package}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 8,
        }}>
          <span style={{
            fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase',
            color: 'rgba(232,224,213,0.35)', fontFamily: 'Poppins, sans-serif',
          }}>Progress</span>
          <span style={{ fontSize: 11, color: TEAL, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
            {completedCount} of {steps.length} complete
          </span>
        </div>
        <div style={{
          height: 4, background: 'rgba(255,255,255,0.07)',
          borderRadius: 4, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${(completedCount / steps.length) * 100}%`,
            background: `linear-gradient(90deg, ${TEAL}, ${RED})`,
            borderRadius: 4,
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>

      {/* Active step banner */}
      {activeStep && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(214,48,49,0.1), rgba(214,48,49,0.05))',
          border: '1px solid rgba(214,48,49,0.25)',
          borderLeft: `3px solid ${RED}`,
          borderRadius: 10, padding: '14px 18px',
          marginBottom: 24,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        }}>
          <div>
            <p style={{
              margin: '0 0 3px', fontSize: 9, letterSpacing: '2px',
              textTransform: 'uppercase', color: RED,
              fontFamily: 'Poppins, sans-serif', fontWeight: 600,
            }}>Action Required</p>
            <p style={{ margin: 0, fontSize: 13, color: 'white', fontFamily: 'Poppins, sans-serif' }}>
              Step {activeStep.num}: <strong>{activeStep.title}</strong> — {activeStep.subtitle}
            </p>
          </div>
          <button
            onClick={() => setExpanded(activeStep.id)}
            className="btn-primary"
            style={{ fontSize: 12, padding: '8px 16px' }}
          >
            Open →
          </button>
        </div>
      )}

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.map(step => {
          const isExpanded = expanded === step.id
          const isLocked = step.status === 'locked'
          const isComplete = step.status === 'complete'
          const isActive = step.status === 'active'

          return (
            <div key={step.id} style={{
              background: isExpanded ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isActive ? 'rgba(214,48,49,0.3)' : isComplete ? 'rgba(79,185,175,0.18)' : 'rgba(255,255,255,0.05)'}`,
              borderRadius: 10, overflow: 'hidden',
              opacity: isLocked ? 0.6 : 1,
              transition: 'all 0.2s',
            }}>
              {/* Header row */}
              <div
                onClick={() => !isLocked && setExpanded(isExpanded ? null : step.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 20px',
                  cursor: isLocked ? 'default' : 'pointer',
                }}
              >
                {/* Step badge */}
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isComplete ? 'rgba(79,185,175,0.12)' : isActive ? 'rgba(214,48,49,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${isComplete ? TEAL : isActive ? RED : 'rgba(255,255,255,0.1)'}`,
                  fontSize: isComplete ? 15 : 12, fontWeight: 700,
                  color: isComplete ? TEAL : isActive ? RED : '#4A5568',
                  fontFamily: 'Poppins, sans-serif',
                }}>
                  {isComplete ? '✓' : step.num}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 14, fontWeight: 600,
                      color: isLocked ? '#4A5568' : 'white',
                      fontFamily: 'Lora, serif',
                    }}>{step.title}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 600, letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      color: isComplete ? TEAL : isActive ? RED : '#4A5568',
                      fontFamily: 'Poppins, sans-serif',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <span style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: isComplete ? TEAL : isActive ? RED : '#4A5568',
                        display: 'inline-block',
                        boxShadow: isActive ? `0 0 6px ${RED}` : 'none',
                      }} />
                      {isComplete ? 'Complete' : isActive ? 'Action Required' : 'Upcoming'}
                    </span>
                  </div>
                  <p style={{
                    margin: '2px 0 0', fontSize: 11,
                    color: 'rgba(232,224,213,0.45)',
                    fontFamily: 'Poppins, sans-serif',
                  }}>{step.subtitle}</p>
                </div>

                {isLocked
                  ? <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.12)' }}>🔒</span>
                  : <span style={{
                      fontSize: 10, color: 'rgba(232,224,213,0.25)',
                      transform: isExpanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s', display: 'inline-block',
                    }}>▼</span>
                }
              </div>

              {/* Expanded body */}
              {isExpanded && (
                <div style={{
                  padding: '0 20px 20px',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  paddingTop: 16,
                }}>
                  <p style={{
                    margin: '0 0 16px', fontSize: 13, lineHeight: 1.65,
                    color: 'rgba(232,224,213,0.7)', fontFamily: 'Poppins, sans-serif',
                  }}>{step.description}</p>

                  {isComplete ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 14px',
                      background: 'rgba(79,185,175,0.07)',
                      border: '1px solid rgba(79,185,175,0.2)',
                      borderRadius: 7,
                    }}>
                      <span style={{ color: TEAL }}>✓</span>
                      <span style={{ fontSize: 12, color: TEAL, fontFamily: 'Poppins, sans-serif' }}>
                        This step is complete
                      </span>
                    </div>
                  ) : step.payLinks ? (
                    <div>
                      <p style={{
                        margin: '0 0 10px', fontSize: 10, letterSpacing: '1.5px',
                        textTransform: 'uppercase', color: 'rgba(232,224,213,0.35)',
                        fontFamily: 'Poppins, sans-serif',
                      }}>Pay via</p>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {step.payLinks.map(pl => (
                          <a key={pl.label} href={pl.url} target="_blank" rel="noopener noreferrer"
                            style={{
                              background: pl.color, color: 'white',
                              textDecoration: 'none', borderRadius: 7,
                              padding: '9px 20px', fontSize: 13, fontWeight: 700,
                              fontFamily: 'Poppins, sans-serif',
                            }}>
                            {pl.label} →
                          </a>
                        ))}
                      </div>
                      <p style={{
                        margin: '10px 0 0', fontSize: 11,
                        color: 'rgba(232,224,213,0.3)', fontFamily: 'Poppins, sans-serif',
                      }}>
                        Include your name and event date in the payment note.
                      </p>
                    </div>
                  ) : step.href ? (
                    <Link href={step.href} className="btn-primary" style={{
                      display: 'inline-flex', fontSize: 13, padding: '10px 22px',
                    }}>
                      {step.actionLabel} →
                    </Link>
                  ) : (
                    <div style={{
                      padding: '10px 14px',
                      background: 'rgba(200,169,110,0.07)',
                      border: '1px solid rgba(200,169,110,0.2)',
                      borderRadius: 7,
                    }}>
                      <span style={{ fontSize: 12, color: GOLD, fontFamily: 'Poppins, sans-serif' }}>
                        🎶 You're all set — see you on event day!
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p style={{
        textAlign: 'center', marginTop: 48,
        fontSize: 11, color: 'rgba(232,224,213,0.25)',
        fontFamily: 'Poppins, sans-serif', fontStyle: 'italic',
      }}>
        Questions? Text or email Garrett · garrett@pescaderomusic.com · (210) 727-9328
      </p>
    </div>
  )
}
