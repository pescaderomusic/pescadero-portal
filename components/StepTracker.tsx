'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const NAVY  = '#0D1B2A'
const BLUE  = '#44BEC7'
const RED   = '#D62828'
const GREEN = '#4CAF50'
const GOLD  = '#F5A623'

interface Booking {
  id:                  string
  event_date:          string | null
  venue_name:          string | null
  venue_address:       string | null
  package:             string
  step_inquiry:        string
  step_consultation:   string
  step_contract:       string
  step_deposit:        string
  step_planning:       string
  step_final_payment?: string
  step_event:          string
  couple_names?:       string
  event_name?:         string
  event_type?:         string
  final_payment_due?:  string
}

interface Props {
  booking:     Booking | null
  clientName:  string
  justPaid?:   boolean
  paymentType?: string
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

function stepStatus(val: string | undefined): 'complete' | 'active' | 'locked' {
  if (!val || val === 'locked') return 'locked'
  if (['complete','signed','client_signed','paid','submitted'].includes(val)) return 'complete'
  if (['pending','sent','scheduled'].includes(val)) return 'active'
  return 'locked'
}

export default function StepTracker({ booking, clientName, justPaid, paymentType }: Props) {
  const b         = booking
  const noBooking = !b
  const firstName = clientName?.split(' ')[0] || 'there'
  const daysUntil = useCountdown(b?.event_date || null)
  const eventDone = b?.step_event === 'complete'

  const fmtDate = (d: string) =>
    new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  // ── Steps ────────────────────────────────────────────────────────
  const inquiryStatus = (noBooking || !b.step_inquiry || b.step_inquiry === 'locked')
    ? 'active' as const
    : stepStatus(b.step_inquiry)

  const steps = [
    {
      num: 1, label: 'Inquiry',
      s: inquiryStatus,
      desc: inquiryStatus === 'complete' ? 'Submitted ✓' : 'Tell us about your event',
      action: inquiryStatus !== 'complete' ? { label: 'Get Started →', href: '/inquiry' } : null,
      doc: inquiryStatus === 'complete' ? { label: 'View Inquiry', href: '/inquiry/view' } : null,
    },
    {
      num: 2, label: 'Consultation',
      s: noBooking ? 'locked' as const : stepStatus(b.step_consultation),
      desc: b?.step_consultation === 'complete' ? 'Call complete ✓'
          : b?.step_consultation === 'scheduled' ? 'Call scheduled'
          : 'Garrett will be in touch',
      action: null,
      doc: null,
    },
    {
      num: 3, label: 'Sign & Pay',
      s: noBooking ? 'locked' as const : stepStatus(b.step_contract),
      desc: ['signed','client_signed'].includes(b?.step_contract || '') ? 'Signed & deposit paid ✓'
          : b?.step_contract === 'sent' ? 'Ready to review & sign'
          : 'Contract sent after consultation',
      action: b?.step_contract === 'sent' ? { label: 'Sign & Pay Deposit →', href: '/contract' } : null,
      doc: ['signed','client_signed'].includes(b?.step_contract || '') ? { label: 'View Contract', href: '/contract' } : null,
    },
    {
      num: 4, label: 'Planning',
      s: noBooking ? 'locked' as const : stepStatus(b.step_planning),
      desc: b?.step_planning === 'submitted' ? 'Submitted ✓'
          : b?.step_planning === 'pending' ? 'Ready to fill out'
          : 'Garrett will send this next',
      action: b?.step_planning === 'pending'
        ? { label: 'Open Planning Form →', href: '/planning' }
        : b?.step_planning === 'submitted'
        ? { label: 'View Submission', href: '/planning' }
        : null,
      doc: null,
    },
    {
      num: 5, label: 'Final Payment',
      s: noBooking ? 'locked' as const : stepStatus(b.step_final_payment || 'locked'),
      desc: b?.step_final_payment === 'paid' ? 'Paid in full ✓'
          : b?.step_final_payment === 'pending' ? 'Balance due now'
          : 'Opens after planning is submitted',
      action: b?.step_final_payment === 'pending' ? { label: 'Pay Final Balance →', href: '/contract/final-payment' } : null,
      doc: b?.step_final_payment === 'paid' ? { label: 'View Receipt', href: '/receipt' } : null,
    },
  ]

  const completedCount = steps.filter(s => s.s === 'complete').length
  const allDocs        = steps.filter(s => s.doc).map(s => s.doc!)

  // ── Next box state machine ────────────────────────────────────────
  type Card = { eyebrow: string; title: string; body: string; action?: { label: string; href: string } | null; color: string }

  const getCard = (): Card | null => {
    if (!b || inquiryStatus !== 'complete') return {
      eyebrow: 'Start Here',
      title: 'Tell us about your event',
      body: 'Fill out a quick inquiry so we can check availability and get the conversation started.',
      action: { label: 'Submit Inquiry →', href: '/inquiry' },
      color: BLUE,
    }

    if (['locked','pending'].includes(b.step_consultation || 'locked') && b.step_inquiry === 'complete') return {
      eyebrow: '✓ Inquiry Received',
      title: 'Garrett will be in contact with you shortly.',
      body: 'We\'ve received your inquiry and will reach out within 24–48 hours to schedule your consultation call. Keep an eye on your phone and email.',
      action: null,
      color: BLUE,
    }

    if (b.step_consultation === 'scheduled') return {
      eyebrow: '📅 Consultation Scheduled',
      title: 'Your call is confirmed.',
      body: 'Garrett will reach out to you directly at the scheduled time. No action needed — just be available!',
      action: null,
      color: BLUE,
    }

    if (b.step_consultation === 'complete' && ['locked','pending'].includes(b.step_contract || 'locked')) return {
      eyebrow: 'Consultation Complete ✓',
      title: 'Your contract is being prepared.',
      body: 'Great call! Garrett is now putting together your service agreement. You\'ll receive an email when it\'s ready to review and sign.',
      action: null,
      color: BLUE,
    }

    if (b.step_contract === 'sent') return {
      eyebrow: 'Action Required',
      title: 'Your contract is ready to sign.',
      body: 'Review your personalized service agreement, sign digitally, and pay your deposit — all in one step — to officially secure your date.',
      action: { label: 'Sign & Pay Deposit →', href: '/contract' },
      color: RED,
    }

    if (['signed','client_signed'].includes(b.step_contract || '') && b.step_planning === 'locked') return {
      eyebrow: '🎉 You\'re Officially Booked!',
      title: 'Your date is secured.',
      body: 'Your deposit is paid and your date is locked in. Garrett will send your planning form when it\'s time to start mapping out the details.',
      action: null,
      color: GREEN,
    }

    if (b.step_planning === 'pending') return {
      eyebrow: 'Action Required',
      title: 'Your planning form is ready.',
      body: 'Fill out your event timeline, day-of contact, key songs, and anything else Garrett needs to make your day run perfectly.',
      action: { label: 'Open Planning Form →', href: '/planning' },
      color: RED,
    }

    if (b.step_planning === 'submitted' && ['locked'].includes(b.step_final_payment || 'locked')) return {
      eyebrow: 'Planning Submitted ✓',
      title: 'Garrett has everything he needs.',
      body: 'Your planning form is in. Your final payment window will open soon — you\'ll receive a notification when it\'s ready.',
      action: null,
      color: BLUE,
    }

    if (b.step_final_payment === 'pending') return {
      eyebrow: 'Action Required',
      title: 'Final payment is due.',
      body: 'Your remaining balance is due before your event. Pay now to fully confirm your booking.',
      action: { label: 'Pay Final Balance →', href: '/contract/final-payment' },
      color: RED,
    }

    if (b.step_final_payment === 'paid' && !eventDone) return {
      eyebrow: '✓ Fully Paid',
      title: 'See you on event day! 🎵',
      body: 'You\'re completely confirmed. Garrett will arrive 1.5 hours before your event. All you have to do is show up and enjoy.',
      action: null,
      color: GREEN,
    }

    if (eventDone) return {
      eyebrow: 'Event Complete',
      title: 'We hope your day was perfect.',
      body: 'It was an honor being part of your celebration. We\'d love to hear your feedback!',
      action: { label: 'Leave a Review ⭐', href: '/review' },
      color: GOLD,
    }

    return null
  }

  const card = getCard()

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

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px 80px' }}>

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
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 24px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Your Event</p>
              <p style={{ margin: '0 0 4px', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 22, color: 'white', fontWeight: 700 }}>
                {b?.couple_names || b?.event_name || b?.event_type || `${firstName}'s Event`}
              </p>
              {b?.event_date && (
                <p style={{ margin: '2px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                  {fmtDate(b.event_date)}{b.venue_name ? ` · ${b.venue_name}` : ''}
                </p>
              )}
            </div>
            {daysUntil !== null && daysUntil > 0 && (
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ margin: 0, fontSize: 38, fontWeight: 700, color: RED, lineHeight: 1 }}>{daysUntil}</p>
                <p style={{ margin: '2px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>days away</p>
              </div>
            )}
            {daysUntil !== null && daysUntil <= 0 && (
              <p style={{ fontSize: 18, fontWeight: 700, color: GREEN, margin: 0 }}>Today! 🎉</p>
            )}
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

        {/* ── Horizontal Timeline ──────────────────────────────── */}
        <div style={{ marginBottom: 32, position: 'relative' }}>

          {/* Background line */}
          <div style={{ position: 'absolute', top: 24, left: '4%', right: '4%', height: 2, background: 'rgba(255,255,255,0.06)', zIndex: 0 }} />
          {/* Progress line */}
          <div style={{
            position: 'absolute', top: 24, left: '4%', height: 2, zIndex: 1,
            background: `linear-gradient(90deg, ${GREEN}, ${BLUE})`,
            width: completedCount === 0 ? '0%' : `${Math.min((completedCount / (steps.length + 0.8)) * 92, 88)}%`,
            transition: 'width 0.8s ease',
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>

            {/* Steps */}
            {steps.map(step => {
              const isComplete = step.s === 'complete'
              const isActive   = step.s === 'active'
              const isLocked   = step.s === 'locked'
              return (
                <div key={step.num} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: isActive ? 50 : 44, height: isActive ? 50 : 44,
                    borderRadius: '50%',
                    border: `2px solid ${isComplete ? GREEN : isActive ? BLUE : 'rgba(255,255,255,0.1)'}`,
                    background: NAVY,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isActive ? `0 0 20px ${BLUE}40` : 'none',
                    transition: 'all 0.3s', flexShrink: 0,
                  }}>
                    {isComplete
                      ? <span style={{ fontSize: 18, color: GREEN }}>✓</span>
                      : <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? BLUE : 'rgba(255,255,255,0.2)' }}>{step.num}</span>
                    }
                  </div>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: isLocked ? 'rgba(255,255,255,0.2)' : 'white', textAlign: 'center' }}>{step.label}</p>
                  <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.4, maxWidth: 72 }}>{step.desc}</p>
                </div>
              )
            })}

            {/* Event Day */}
            <div style={{ flex: 1.3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                border: `3px solid ${eventDone ? GREEN : RED}`,
                background: NAVY,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 28px ${eventDone ? GREEN : RED}35`,
                flexShrink: 0,
              }}>
                {eventDone
                  ? <span style={{ fontSize: 24, color: GREEN }}>✓</span>
                  : <span style={{ fontSize: 22 }}>🎵</span>
                }
              </div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: eventDone ? GREEN : RED, textAlign: 'center' }}>Event Day</p>
              {daysUntil !== null && daysUntil > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'white', lineHeight: 1 }}>{daysUntil}d</p>
                  <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>to go</p>
                </div>
              )}
            </div>

            {/* Review */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                border: `2px solid ${eventDone ? GOLD : 'rgba(255,255,255,0.08)'}`,
                background: NAVY,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontSize: 18, filter: eventDone ? 'none' : 'grayscale(1) opacity(0.2)' }}>⭐</span>
              </div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: eventDone ? GOLD : 'rgba(255,255,255,0.2)', textAlign: 'center' }}>Review</p>
              <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'center', maxWidth: 60 }}>After your event</p>
            </div>

          </div>
        </div>

        {/* ── Next Box ─────────────────────────────────────────── */}
        {card && (() => {
          const borderCol = card.color === GREEN ? 'rgba(76,175,80,0.25)'
            : card.color === RED  ? 'rgba(214,40,40,0.2)'
            : card.color === GOLD ? 'rgba(245,166,35,0.25)'
            : 'rgba(68,190,199,0.2)'
          const bgCol = card.color === GREEN ? 'rgba(76,175,80,0.07)'
            : card.color === RED  ? 'rgba(214,40,40,0.05)'
            : card.color === GOLD ? 'rgba(245,166,35,0.07)'
            : 'rgba(68,190,199,0.07)'
          return (
            <div style={{ background: bgCol, border: `1px solid ${borderCol}`, borderRadius: 12, padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 4px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: card.color, fontWeight: 700 }}>{card.eyebrow}</p>
                <p style={{ margin: '0 0 4px', fontSize: 14, color: 'white', fontWeight: 600 }}>{card.title}</p>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{card.body}</p>
              </div>
              {card.action && (
                <Link href={card.action.href} style={{ padding: '11px 26px', borderRadius: 9, background: RED, color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 4px 18px rgba(214,40,40,0.3)', flexShrink: 0 }}>
                  {card.action.label}
                </Link>
              )}
            </div>
          )
        })()}

        {/* Document access */}
        {allDocs.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {allDocs.map(doc => (
              <Link key={doc.href} href={doc.href} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(232,224,213,0.5)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                {doc.label}
              </Link>
            ))}
            {eventDone && (
              <Link href="/review" style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid rgba(245,166,35,0.3)`, background: `rgba(245,166,35,0.08)`, color: GOLD, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                Leave a Review ⭐
              </Link>
            )}
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
