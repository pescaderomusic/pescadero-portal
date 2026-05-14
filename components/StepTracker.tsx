'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const BLUE  = '#44BEC7'
const RED   = '#D62828'
const NAVY  = '#0D1B2A'
const GOLD  = '#F5A623'
const GREEN = '#4CAF50'

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
  step_final_payment?: string
  step_event: string
  couple_names?: string
  event_name?: string
  event_type?: string
  final_payment_due?: string
}

interface Props {
  justPaid?: boolean
  paymentType?: string
  booking: Booking | null
  clientName: string
}

function useCountdown(date: string | null) {
  const [days, setDays] = useState<number | null>(null)
  useEffect(() => {
    if (!date) return
    const calc = () => setDays(Math.ceil((new Date(date + 'T12:00:00').getTime() - Date.now()) / 86400000))
    calc()
    const t = setInterval(calc, 60000)
    return () => clearInterval(t)
  }, [date])
  return days
}

function status(val: string | undefined): 'complete' | 'active' | 'locked' {
  if (!val) return 'locked'
  if (['complete','signed','client_signed','paid','submitted'].includes(val)) return 'complete'
  if (['pending','sent','scheduled'].includes(val)) return 'active'
  return 'locked'
}

export default function StepTracker({ booking, clientName, justPaid, paymentType }: Props) {
  const noBooking  = !booking
  const firstName  = clientName?.split(' ')[0] || 'there'
  const eventDate  = booking?.event_date || null
  const daysUntil  = useCountdown(eventDate)
  const eventDone  = booking?.step_event === 'complete'
  const fmtDate    = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  // Inquiry: never locked for client
  const inquiryStatus = (noBooking || !booking?.step_inquiry || booking.step_inquiry === 'locked')
    ? 'active' as const
    : status(booking.step_inquiry)

  const steps = [
    {
      id: 'inquiry', num: 1, label: 'Inquiry',
      s: inquiryStatus,
      desc: inquiryStatus === 'complete' ? 'Submitted ✓' : 'Tell us about your event',
      action: inquiryStatus !== 'complete' ? { label: 'Get Started →', href: '/inquiry' } : null,
      doc: inquiryStatus === 'complete' ? { label: 'View Inquiry', href: '/inquiry/view' } : null,
    },
    {
      id: 'consultation', num: 2, label: 'Consultation',
      s: noBooking ? 'locked' as const : status(booking!.step_consultation),
      desc: booking?.step_consultation === 'complete' ? 'Call complete ✓'
        : booking?.step_consultation === 'scheduled' ? 'Call scheduled — Garrett will reach out'
        : 'Garrett will be in touch',
      action: null,
      doc: null,
    },
    {
      id: 'contract', num: 3, label: 'Sign & Pay',
      s: noBooking ? 'locked' as const : status(booking!.step_contract),
      desc: ['signed','client_signed'].includes(booking?.step_contract || '') ? 'Signed & deposit paid ✓'
        : booking?.step_contract === 'sent' ? 'Ready to sign'
        : 'Sent after consultation',
      action: booking?.step_contract === 'sent' ? { label: 'Sign & Pay Deposit →', href: '/contract' } : null,
      doc: ['signed','client_signed'].includes(booking?.step_contract || '') ? { label: 'View Contract', href: '/contract' } : null,
    },
    {
      id: 'planning', num: 4, label: 'Planning',
      s: noBooking ? 'locked' as const : status(booking!.step_planning),
      desc: booking?.step_planning === 'submitted' ? 'Submitted ✓' : 'Music, timeline & details',
      action: ['pending','submitted'].includes(booking?.step_planning || '')
        ? { label: booking?.step_planning === 'submitted' ? 'Edit Form' : 'Open Form →', href: '/planning' }
        : null,
      doc: null,
    },
    {
      id: 'final', num: 5, label: 'Final Payment',
      s: noBooking ? 'locked' as const : status(booking!.step_final_payment || 'locked'),
      desc: booking?.step_final_payment === 'paid' ? 'Paid in full ✓'
        : booking?.final_payment_due ? `Due ${new Date(booking.final_payment_due + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        : 'Balance due before event',
      action: booking?.step_final_payment === 'pending' ? { label: 'Pay Balance →', href: '/contract/final-payment' } : null,
      doc: booking?.step_final_payment === 'paid' ? { label: 'View Receipt', href: '/receipt' } : null,
    },
  ]

  const activeStep    = steps.find(s => s.s === 'active')
  const completedCount = steps.filter(s => s.s === 'complete').length
  const allDocs       = steps.filter(s => s.doc).map(s => s.doc!)

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, fontFamily: 'Poppins, sans-serif' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,24,40,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(68,190,199,0.1)', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 17, fontWeight: 700, color: RED }}>Pescadero</span>
          <span style={{ fontFamily: 'monospace', fontSize: 8, fontWeight: 700, letterSpacing: '4px', color: BLUE, textTransform: 'uppercase' }}>MUSIC</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Hi, {firstName}</span>
          <Link href="/auth/signout" style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>Sign out</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Just paid banner */}
        {justPaid && (
          <div style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.2)', borderRadius: 10, padding: '14px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🎉</span>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: GREEN }}>
                {paymentType === 'final' ? 'Fully paid — you\'re all set!' : 'Deposit paid — your date is secured!'}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Garrett has been notified.</p>
            </div>
          </div>
        )}

        {/* Event card */}
        {!noBooking && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px 24px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Your Event</p>
              <p style={{ margin: '0 0 4px', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 22, color: 'white', fontWeight: 700 }}>
                {booking?.couple_names || booking?.event_name || booking?.event_type || `${firstName}'s Event`}
              </p>
              {eventDate && (
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
                  {fmtDate(eventDate)}{booking?.venue_name ? ` · ${booking.venue_name}` : ''}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
              {daysUntil !== null && daysUntil > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: 36, fontWeight: 700, color: RED, lineHeight: 1 }}>{daysUntil}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>days away</p>
                </div>
              )}
              {daysUntil !== null && daysUntil <= 0 && (
                <p style={{ fontSize: 18, fontWeight: 700, color: GREEN, margin: 0 }}>Today! 🎉</p>
              )}
            </div>
          </div>
        )}

        {/* Welcome if no booking */}
        {noBooking && (
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ margin: '0 0 8px', fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: BLUE }}>Welcome</p>
            <h1 style={{ margin: '0 0 8px', fontFamily: 'Georgia, serif', fontSize: 30, color: 'white' }}>Let's Make Your Day Unforgettable</h1>
            <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Start by submitting your inquiry below.</p>
          </div>
        )}

        {/* ── Horizontal Timeline ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>

            {/* Background line */}
            <div style={{ position: 'absolute', top: 22, left: 22, right: 36, height: 2, background: 'rgba(255,255,255,0.07)', zIndex: 0 }} />

            {/* Progress line */}
            <div style={{
              position: 'absolute', top: 22, left: 22, height: 2, zIndex: 1,
              background: `linear-gradient(90deg, ${GREEN}, ${BLUE})`,
              width: `calc(${completedCount === 0 ? 0 : Math.min(completedCount / (steps.length + 1), 1) * 100}% - 44px)`,
              transition: 'width 0.8s ease',
              borderRadius: 2,
            }} />

            {/* Step dots */}
            {steps.map((step, i) => {
              const isComplete = step.s === 'complete'
              const isActive   = step.s === 'active'
              const isLocked   = step.s === 'locked'
              return (
                <div key={step.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 2 }}>
                  <div style={{
                    width: isActive ? 48 : 44,
                    height: isActive ? 48 : 44,
                    borderRadius: '50%',
                    border: `2px solid ${isComplete ? GREEN : isActive ? BLUE : 'rgba(255,255,255,0.1)'}`,
                    background: isComplete ? `${GREEN}18` : isActive ? `${BLUE}18` : 'rgba(255,255,255,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isActive ? `0 0 18px ${BLUE}40` : 'none',
                    transition: 'all 0.3s',
                    flexShrink: 0,
                  }}>
                    {isComplete
                      ? <span style={{ fontSize: 17, color: GREEN }}>✓</span>
                      : <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? BLUE : 'rgba(255,255,255,0.2)' }}>{step.num}</span>
                    }
                  </div>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: isLocked ? 'rgba(255,255,255,0.2)' : 'white', textAlign: 'center', letterSpacing: '0.3px' }}>
                    {step.label}
                  </p>
                  <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.4, maxWidth: 70 }}>
                    {step.desc}
                  </p>
                </div>
              )
            })}

            {/* Event Day — big focal dot */}
            <div style={{ flex: 1.4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 2 }}>
              <div style={{
                width: 68, height: 68, borderRadius: '50%',
                border: `3px solid ${eventDone ? GREEN : RED}`,
                background: eventDone ? `${GREEN}18` : `${RED}12`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 28px ${eventDone ? GREEN : RED}35`,
                flexShrink: 0,
              }}>
                {eventDone
                  ? <span style={{ fontSize: 26, color: GREEN }}>✓</span>
                  : <span style={{ fontSize: 24 }}>🎵</span>
                }
              </div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: eventDone ? GREEN : RED, textAlign: 'center' }}>Event Day</p>
              {daysUntil !== null && daysUntil > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'white', lineHeight: 1 }}>{daysUntil}d</p>
                  <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>to go</p>
                </div>
              )}
            </div>

            {/* Review */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 2 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                border: `2px solid ${eventDone ? GOLD : 'rgba(255,255,255,0.08)'}`,
                background: eventDone ? `${GOLD}15` : 'rgba(255,255,255,0.02)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontSize: 18, filter: eventDone ? 'none' : 'grayscale(1) opacity(0.25)' }}>⭐</span>
              </div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: eventDone ? GOLD : 'rgba(255,255,255,0.2)', textAlign: 'center' }}>Review</p>
              <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'center', maxWidth: 60 }}>After your event</p>
            </div>

          </div>
        </div>

        {/* Active step card */}
        {activeStep && (
          <div style={{ background: `rgba(68,190,199,0.07)`, border: `1px solid rgba(68,190,199,0.2)`, borderRadius: 12, padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: '0 0 3px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE, fontWeight: 700 }}>
                Next — {activeStep.label}
              </p>
              <p style={{ margin: 0, fontSize: 14, color: 'white', fontWeight: 600 }}>{activeStep.desc}</p>
            </div>
            {activeStep.action && (
              <Link href={activeStep.action.href} style={{ padding: '11px 26px', borderRadius: 9, background: RED, color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 4px 18px rgba(214,40,40,0.35)', flexShrink: 0 }}>
                {activeStep.action.label}
              </Link>
            )}
          </div>
        )}

        {/* Review CTA */}
        {eventDone && (
          <div style={{ background: `rgba(245,166,35,0.07)`, border: `1px solid rgba(245,166,35,0.2)`, borderRadius: 12, padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <p style={{ margin: '0 0 3px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: GOLD, fontWeight: 700 }}>Post-Event</p>
              <p style={{ margin: 0, fontSize: 14, color: 'white', fontWeight: 600 }}>How did we do? We'd love your feedback.</p>
            </div>
            <Link href="/review" style={{ padding: '11px 26px', borderRadius: 9, background: GOLD, color: NAVY, textDecoration: 'none', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
              Leave a Review ⭐
            </Link>
          </div>
        )}

        {/* Document access */}
        {allDocs.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {allDocs.map(doc => (
              <Link key={doc.href} href={doc.href} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(232,224,213,0.55)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                {doc.label}
              </Link>
            ))}
            <Link href="/policy" style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: 'rgba(255,255,255,0.25)', fontSize: 12, textDecoration: 'none' }}>
              Service Policy
            </Link>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 48, fontSize: 12, color: 'rgba(255,255,255,0.18)' }}>
          Questions? <a href="mailto:garrett@pescaderomusic.com" style={{ color: BLUE, textDecoration: 'none' }}>garrett@pescaderomusic.com</a> · (210) 727-9328
        </p>

      </div>
    </div>
  )
}
