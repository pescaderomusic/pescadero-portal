'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const NAVY  = '#0D1B2A'
const BLUE  = '#44BEC7'
const RED   = '#D62828'
const GREEN = '#4CAF50'
const GOLD  = '#F5A623'

interface Booking {
  id: string
  event_date: string | null
  venue_name: string | null
  couple_names?: string
  event_name?: string
  event_type?: string
  step_inquiry: string
  step_consultation: string
  step_contract: string
  step_deposit: string
  step_planning: string
  step_final_payment?: string
  step_event: string
}

interface Props {
  booking: Booking | null
  clientName: string
  justPaid?: boolean
  paymentType?: string
}

const COPY: Record<string, Record<string, { title: string; body: string; action?: { label: string; href: string } }>> = {
  inquiry: {
    active: {
      title: 'Start Here',
      body: "Start here. Tell us about your date, venue, and vision\u2014we're invested in the details. (Takes about 3 minutes).",
      action: { label: 'Submit Inquiry \u2192', href: '/inquiry' },
    },
    complete: {
      title: 'Inquiry Received',
      body: 'Inquiry received. Garrett will be in touch within 24\u201348 hours.',
    },
  },
  consultation: {
    locked: {
      title: 'Initial Consultation',
      body: "This is entirely about listening to what you want, understanding your unique style, and seeing exactly how we can bring your vision to life. Once Garrett reviews your inquiry, he\u2019ll reach out to schedule a conversation to ensure we are a perfect fit for your wedding.",
    },
    pending: {
      title: 'Hang Tight',
      body: 'Garrett is reviewing your details and will be reaching out soon. Keep an eye on your phone and email.',
    },
    scheduled: {
      title: 'Consultation Locked In',
      body: "Your consultation is locked in. We\u2019re excited to connect, listen to your ideas, and talk through your celebration.",
    },
    complete: {
      title: 'Consultation Complete',
      body: 'Consultation done. Sit back and relax\u2014Garrett is crafting your personalized service agreement.',
    },
  },
  contract: {
    locked: {
      title: 'Service Agreement',
      body: "Your personalized service agreement. Once the consultation is done, Garrett sends over an agreement tailored specifically to your event. You review it, sign digitally, and pay your deposit securely via Stripe\u2014all in one step. Your date isn\u2019t secured until this is done.",
    },
    sent: {
      title: 'Agreement Ready',
      body: 'Your agreement is ready. Review it, sign, and pay your deposit via Stripe to officially lock in your date.',
      action: { label: 'Sign & Pay Deposit \u2192', href: '/contract' },
    },
    complete: {
      title: 'Signed & Deposited \U0001f389',
      body: 'Signed and deposited. Your day is locked in!',
    },
  },
  planning: {
    locked: {
      title: 'Planning Form',
      body: 'The blueprint for a perfect night. Garrett will send this over after your deposit is confirmed. It covers your day-of timeline, key contacts, and the exact music you want for your celebration.',
    },
    pending: {
      title: 'Planning Form Ready',
      body: 'Your planning form is ready. Fill it out so Garrett has everything he needs to prep for your day.',
      action: { label: 'Open Planning Form \u2192', href: '/planning' },
    },
    complete: {
      title: 'Planning Submitted',
      body: 'Planning submitted. Garrett is diving into your details and actively preparing for your celebration.',
    },
  },
  final_payment: {
    locked: {
      title: 'Final Payment',
      body: 'The final detail before the big day. Your remaining balance is due via Stripe one week prior to your wedding date, ensuring everything financial is completely off your mind before the celebration begins. Simple, secure, done.',
    },
    pending: {
      title: 'Final Payment Due',
      body: 'Your final balance is due. Complete this secure Stripe payment and your entire sound experience is fully secured.',
      action: { label: 'Pay Final Balance \u2192', href: '/contract/final-payment' },
    },
    complete: {
      title: 'Paid in Full \U0001f3b5',
      body: "Paid in full. We are completely cleared for launch\u2014we can\u2019t wait for your celebration!",
    },
  },
  event: {
    upcoming: {
      title: 'The Big Day',
      body: "The big day. Garrett arrives 1.5 hours early to orchestrate the setups. Enjoy every single moment of your celebration\u2014we\u2019ve got the audio experience completely handled.",
    },
    complete: {
      title: 'Thank You',
      body: "What an incredible celebration. Thank you so much for trusting us with your wedding day\u2014we hope it\u2019s a night you\u2019ll never forget.",
    },
  },
  review: {
    active: {
      title: 'Leave a Review',
      body: 'How did we do? Your feedback means everything to us, and it directly helps us continue providing this same premium, unforgettable service for more couples.',
      action: { label: 'Leave a Review \u2b50', href: '/review' },
    },
    locked: {
      title: 'Leave a Review',
      body: 'How did we do? Your feedback means everything to us, and it directly helps us continue providing this same premium, unforgettable service for more couples.',
    },
  },
}

function stepStatus(val: string | undefined): 'complete' | 'active' | 'locked' {
  if (!val || val === 'locked') return 'locked'
  if (['complete', 'signed', 'client_signed', 'paid', 'submitted'].includes(val)) return 'complete'
  return 'active'
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

function getCopyForStep(stepKey: string, booking: Booking | null) {
  const val = ({
    inquiry: booking?.step_inquiry,
    consultation: booking?.step_consultation,
    contract: booking?.step_contract,
    planning: booking?.step_planning,
    final_payment: booking?.step_final_payment,
  } as Record<string,string|undefined>)[stepKey] || 'locked'
  const stepCopy = COPY[stepKey]
  if (!stepCopy) return null
  if (stepCopy[val]) return { ...stepCopy[val], stepState: val }
  const status = stepStatus(val)
  if (status === 'complete' && stepCopy.complete) return { ...stepCopy.complete, stepState: 'complete' }
  if (status === 'active'   && stepCopy.pending)  return { ...stepCopy.pending,  stepState: 'pending'  }
  if (stepCopy.locked) return { ...stepCopy.locked, stepState: 'locked' }
  return null
}

export default function StepTracker({ booking, clientName, justPaid, paymentType }: Props) {
  const [selectedStep, setSelectedStep] = useState<string | null>(null)
  const b = booking
  const noBooking = !b
  const firstName = clientName?.split(' ')[0] || 'there'
  const daysUntil = useCountdown(b?.event_date || null)
  const eventDone = b?.step_event === 'complete'

  const fmtDate = (d: string) =>
    new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  const inquiryStatus = (noBooking || !b.step_inquiry || b.step_inquiry === 'locked') ? 'active' as const : stepStatus(b.step_inquiry)

  const steps = [
    { key: 'inquiry',       num: 1, label: 'Inquiry',       s: inquiryStatus },
    { key: 'consultation',  num: 2, label: 'Consultation',  s: noBooking ? 'locked' as const : stepStatus(b.step_consultation)  },
    { key: 'contract',      num: 3, label: 'Sign & Pay',    s: noBooking ? 'locked' as const : stepStatus(b.step_contract)      },
    { key: 'planning',      num: 4, label: 'Planning',      s: noBooking ? 'locked' as const : stepStatus(b.step_planning)      },
    { key: 'final_payment', num: 5, label: 'Final Payment', s: noBooking ? 'locked' as const : stepStatus(b.step_final_payment) },
  ]

  const completedCount = steps.filter(s => s.s === 'complete').length
  const handleStepClick = (key: string) => setSelectedStep(prev => prev === key ? null : key)

  type Card = { eyebrow: string; title: string; body: string; action?: { label: string; href: string } | null; color: string; locked?: boolean }

  const getCard = (): Card | null => {
    if (selectedStep) {
      if (selectedStep === 'event') {
        const copy = eventDone ? COPY.event.complete : COPY.event.upcoming
        return { eyebrow: 'Event Day', title: copy.title, body: copy.body, color: RED, locked: false }
      }
      if (selectedStep === 'review') {
        const isLocked = !eventDone
        const copy = isLocked ? COPY.review.locked : COPY.review.active
        return { eyebrow: 'Review', title: copy.title, body: copy.body, action: isLocked ? null : COPY.review.active.action, color: GOLD, locked: isLocked }
      }
      const copy = getCopyForStep(selectedStep, b)
      if (!copy) return null
      const isLocked = copy.stepState === 'locked'
      const label = steps.find(s => s.key === selectedStep)?.label || selectedStep
      return {
        eyebrow: label,
        title: copy.title,
        body: copy.body,
        action: isLocked ? null : (copy as any).action || null,
        color: isLocked ? 'rgba(255,255,255,0.3)' : copy.stepState === 'complete' ? GREEN : BLUE,
        locked: isLocked,
      }
    }
    if (!b || inquiryStatus !== 'complete') return {
      eyebrow: 'Start Here', title: 'Tell Us About Your Day',
      body: "Start here. Tell us about your date, venue, and vision\u2014we're invested in the details. (Takes about 3 minutes).",
      action: { label: 'Submit Inquiry \u2192', href: '/inquiry' }, color: BLUE,
    }
    if (['locked','pending'].includes(b.step_consultation || 'locked') && b.step_inquiry === 'complete') return {
      eyebrow: '\u2713 Inquiry Received', title: 'Garrett Will Be in Touch',
      body: 'Inquiry received. Garrett will be in touch within 24\u201348 hours.',
      action: null, color: BLUE,
    }
    if (b.step_consultation === 'scheduled') return {
      eyebrow: '\U0001f4c5 Consultation Locked In', title: 'Consultation Locked In',
      body: "Your consultation is locked in. We\u2019re excited to connect, listen to your ideas, and talk through your celebration.",
      action: null, color: BLUE,
    }
    if (b.step_consultation === 'complete' && ['locked','pending'].includes(b.step_contract || 'locked')) return {
      eyebrow: 'Consultation Complete \u2713', title: 'Agreement Coming Your Way',
      body: 'Consultation done. Sit back and relax\u2014Garrett is crafting your personalized service agreement.',
      action: null, color: BLUE,
    }
    if (b.step_contract === 'sent') return {
      eyebrow: 'Action Required', title: 'Agreement Ready',
      body: 'Your agreement is ready. Review it, sign, and pay your deposit via Stripe to officially lock in your date.',
      action: { label: 'Sign & Pay Deposit \u2192', href: '/contract' }, color: RED,
    }
    if (['signed','client_signed'].includes(b.step_contract || '') && b.step_planning === 'locked') return {
      eyebrow: '\U0001f389 Signed & Deposited', title: 'Your Day Is Locked In!',
      body: 'Signed and deposited. Your day is locked in!', action: null, color: GREEN,
    }
    if (b.step_planning === 'pending') return {
      eyebrow: 'Action Required', title: 'Planning Form Ready',
      body: 'Your planning form is ready. Fill it out so Garrett has everything he needs to prep for your day.',
      action: { label: 'Open Planning Form \u2192', href: '/planning' }, color: RED,
    }
    if (b.step_planning === 'submitted' && ['locked'].includes(b.step_final_payment || 'locked')) return {
      eyebrow: 'Planning Submitted \u2713', title: 'Garrett Is On It',
      body: 'Planning submitted. Garrett is diving into your details and actively preparing for your celebration.',
      action: null, color: BLUE,
    }
    if (b.step_final_payment === 'pending') return {
      eyebrow: 'Action Required', title: 'Final Payment Due',
      body: 'Your final balance is due. Complete this secure Stripe payment and your entire sound experience is fully secured.',
      action: { label: 'Pay Final Balance \u2192', href: '/contract/final-payment' }, color: RED,
    }
    if (b.step_final_payment === 'paid' && !eventDone) return {
      eyebrow: '\u2713 Fully Confirmed', title: 'Cleared for Launch \U0001f3b5',
      body: "Paid in full. We are completely cleared for launch\u2014we can\u2019t wait for your celebration!",
      action: null, color: GREEN,
    }
    if (eventDone) return {
      eyebrow: 'Event Complete', title: 'Thank You',
      body: "What an incredible celebration. Thank you so much for trusting us with your wedding day\u2014we hope it\u2019s a night you\u2019ll never forget.",
      action: { label: 'Leave a Review \u2b50', href: '/review' }, color: GOLD,
    }
    return null
  }

  const card = getCard()

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, fontFamily: 'Poppins, sans-serif' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,24,40,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(68,190,199,0.1)', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 17, fontWeight: 700, color: RED }}>Pescadero</span>
          <span style={{ fontFamily: 'monospace', fontSize: 8, fontWeight: 700, letterSpacing: '4px', color: BLUE, textTransform: 'uppercase' }}>MUSIC</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Hi, {firstName}</span>
          <Link href="/auth/signout" style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>Sign out</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px 80px' }}>
        {justPaid && (
          <div style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.2)', borderRadius: 10, padding: '14px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🎉</span>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: GREEN }}>{paymentType === 'final' ? "Fully paid — you're all set!" : 'Deposit paid — your date is secured!'}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Garrett has been notified.</p>
            </div>
          </div>
        )}

        {!noBooking && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 24px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Your Event</p>
              <p style={{ margin: '0 0 4px', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 22, color: 'white', fontWeight: 700 }}>{b?.couple_names || b?.event_name || b?.event_type || `${firstName}'s Event`}</p>
              {b?.event_date && <p style={{ margin: '2px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{fmtDate(b.event_date)}{b.venue_name ? ` \u00b7 ${b.venue_name}` : ''}</p>}
            </div>
            {daysUntil !== null && daysUntil > 0 && (
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ margin: 0, fontSize: 38, fontWeight: 700, color: RED, lineHeight: 1 }}>{daysUntil}</p>
                <p style={{ margin: '2px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>days away</p>
              </div>
            )}
            {daysUntil !== null && daysUntil <= 0 && <p style={{ fontSize: 18, fontWeight: 700, color: GREEN, margin: 0 }}>Today! 🎉</p>}
          </div>
        )}

        {noBooking && (
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{ margin: '0 0 8px', fontFamily: 'Georgia, serif', fontSize: 30, color: 'white' }}>Let's Make Your Day Unforgettable</h1>
            <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Start by submitting your inquiry below.</p>
          </div>
        )}

        <div style={{ marginBottom: 8, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 24, left: '4%', right: '4%', height: 2, background: 'rgba(255,255,255,0.06)', zIndex: 0 }} />
          <div style={{ position: 'absolute', top: 24, left: '4%', height: 2, zIndex: 1, background: `linear-gradient(90deg, ${GREEN}, ${BLUE})`, width: completedCount === 0 ? '0%' : `${Math.min((completedCount / (steps.length + 0.8)) * 92, 88)}%`, transition: 'width 0.8s ease' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
            {steps.map(step => {
              const isComplete = step.s === 'complete'
              const isActive   = step.s === 'active'
              const isLocked   = step.s === 'locked'
              const isSel      = selectedStep === step.key
              return (
                <div key={step.key} onClick={() => handleStepClick(step.key)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ width: isSel ? 52 : isActive ? 48 : 44, height: isSel ? 52 : isActive ? 48 : 44, borderRadius: '50%', border: `2px solid ${isSel ? 'white' : isComplete ? GREEN : isActive ? BLUE : 'rgba(255,255,255,0.1)'}`, background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isSel ? '0 0 0 3px rgba(255,255,255,0.15)' : isActive ? `0 0 20px ${BLUE}40` : 'none', transition: 'all 0.2s', flexShrink: 0 }}>
                    {isComplete ? <span style={{ fontSize: 18, color: GREEN }}>✓</span> : <span style={{ fontSize: 12, fontWeight: 700, color: isSel ? 'white' : isActive ? BLUE : 'rgba(255,255,255,0.2)' }}>{step.num}</span>}
                  </div>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: isSel ? 'white' : isLocked ? 'rgba(255,255,255,0.2)' : 'white', textAlign: 'center', transition: 'color 0.2s' }}>{step.label}</p>
                </div>
              )
            })}

            <div onClick={() => handleStepClick('event')} style={{ flex: 1.3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
              <div style={{ width: selectedStep === 'event' ? 68 : 64, height: selectedStep === 'event' ? 68 : 64, borderRadius: '50%', border: `3px solid ${selectedStep === 'event' ? 'white' : eventDone ? GREEN : RED}`, background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: selectedStep === 'event' ? '0 0 0 3px rgba(255,255,255,0.15)' : `0 0 28px ${eventDone ? GREEN : RED}35`, transition: 'all 0.2s', flexShrink: 0 }}>
                {eventDone ? <span style={{ fontSize: 24, color: GREEN }}>✓</span> : <span style={{ fontSize: 22 }}>🎵</span>}
              </div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: selectedStep === 'event' ? 'white' : eventDone ? GREEN : RED, textAlign: 'center' }}>Event Day</p>
              {daysUntil !== null && daysUntil > 0 && selectedStep !== 'event' && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'white', lineHeight: 1 }}>{daysUntil}d</p>
                  <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>to go</p>
                </div>
              )}
            </div>

            <div onClick={() => handleStepClick('review')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
              <div style={{ width: selectedStep === 'review' ? 48 : 44, height: selectedStep === 'review' ? 48 : 44, borderRadius: '50%', border: `2px solid ${selectedStep === 'review' ? 'white' : eventDone ? GOLD : 'rgba(255,255,255,0.08)'}`, background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0, boxShadow: selectedStep === 'review' ? '0 0 0 3px rgba(255,255,255,0.15)' : 'none' }}>
                <span style={{ fontSize: 18, filter: eventDone ? 'none' : 'grayscale(1) opacity(0.2)' }}>⭐</span>
              </div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: selectedStep === 'review' ? 'white' : eventDone ? GOLD : 'rgba(255,255,255,0.2)', textAlign: 'center' }}>Review</p>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: '8px 0 20px', letterSpacing: '0.5px' }}>
          {selectedStep ? 'Tap again to dismiss' : 'Tap any step to learn more'}
        </p>

        {card && (() => {
          const isLocked  = !!card.locked
          const borderCol = isLocked ? 'rgba(255,255,255,0.08)' : card.color === GREEN ? 'rgba(76,175,80,0.25)' : card.color === RED ? 'rgba(214,40,40,0.2)' : card.color === GOLD ? 'rgba(245,166,35,0.25)' : 'rgba(68,190,199,0.2)'
          const bgCol     = isLocked ? 'rgba(255,255,255,0.03)' : card.color === GREEN ? 'rgba(76,175,80,0.07)' : card.color === RED ? 'rgba(214,40,40,0.05)' : card.color === GOLD ? 'rgba(245,166,35,0.07)' : 'rgba(68,190,199,0.07)'
          return (
            <div style={{ background: bgCol, border: `1px solid ${borderCol}`, borderRadius: 12, padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <p style={{ margin: 0, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: isLocked ? 'rgba(255,255,255,0.25)' : card.color, fontWeight: 700 }}>{card.eyebrow}</p>
                  {isLocked && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>🔒 Locked</span>}
                </div>
                <p style={{ margin: '0 0 6px', fontSize: 15, color: isLocked ? 'rgba(255,255,255,0.35)' : 'white', fontWeight: 600 }}>{card.title}</p>
                <p style={{ margin: 0, fontSize: 13, color: isLocked ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{card.body}</p>
                {selectedStep && (
                  <button onClick={() => setSelectedStep(null)} style={{ marginTop: 12, background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 11, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                    \u2190 Back to your next step
                  </button>
                )}
              </div>
              {card.action && !isLocked && (
                <Link href={card.action.href} style={{ padding: '11px 26px', borderRadius: 9, background: RED, color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 4px 18px rgba(214,40,40,0.3)', flexShrink: 0 }}>
                  {card.action.label}
                </Link>
              )}
            </div>
          )
        })()}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {b?.step_contract && ['signed','client_signed','complete'].includes(b.step_contract) && (
            <Link href="/contract" style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(232,224,213,0.5)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>View Contract</Link>
          )}
          {b?.step_inquiry === 'complete' && (
            <Link href="/inquiry/view" style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(232,224,213,0.5)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>View Inquiry</Link>
          )}
          {eventDone && (
            <Link href="/review" style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid rgba(245,166,35,0.3)`, background: `rgba(245,166,35,0.08)`, color: GOLD, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>Leave a Review \u2b50</Link>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 48, fontSize: 12, color: 'rgba(255,255,255,0.18)' }}>
          Questions? <a href="mailto:garrett@pescaderomusic.com" style={{ color: BLUE, textDecoration: 'none' }}>garrett@pescaderomusic.com</a> \u00b7 (210) 727-9328
        </p>
      </div>
    </div>
  )
}
