'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import VinylCountdown from '@/components/VinylCountdown'

// Dynamic business-state colors (computed per booking state in getCard()) stay as raw hex —
// Tailwind's JIT can't reliably pick up fully dynamic class names built from these at runtime,
// so they're applied via inline style while everything structural/static uses Tailwind tokens.
const NAVY  = '#07111A'
const BLUE  = '#44BEC7'
const RED   = '#C8202A'
const GREEN = '#4CAF50'
const GOLD  = '#C8A96E'
const CREAM = '#F5EFE0'

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

const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'

interface Props {
  booking: Booking | null
  clientName: string
  justPaid?: boolean
  paymentType?: string
  userId?: string
}

const COPY: Record<string, Record<string, { title: string; body: string; action?: { label: string; href: string } }>> = {
  inquiry: {
    active: {
      title: 'Start Here',
      body: "Start here. Tell us about your date, venue, and vision—we're invested in the details. (Takes about 3 minutes).",
      action: { label: 'Submit Inquiry →', href: '/inquiry' },
    },
    complete: {
      title: 'Inquiry Received',
      body: 'Inquiry received. Garrett will be in touch within 24–48 hours.',
    },
  },
  consultation: {
    locked: {
      title: 'Initial Consultation',
      body: "This is entirely about listening to what you want, understanding your unique style, and seeing exactly how we can bring your vision to life. Once Garrett reviews your inquiry, he’ll reach out to schedule a conversation to ensure we are a perfect fit for your wedding.",
    },
    pending: {
      title: 'Hang Tight',
      body: 'Garrett is reviewing your details and will be reaching out soon. Keep an eye on your phone and email.',
    },
    scheduled: {
      title: 'Consultation Locked In',
      body: "Your consultation is locked in. We’re excited to connect, listen to your ideas, and talk through your celebration.",
    },
    complete: {
      title: 'Consultation Complete',
      body: 'Consultation done. Sit back and relax—Garrett is crafting your personalized service agreement.',
    },
  },
  contract: {
    locked: {
      title: 'Service Agreement',
      body: "Your personalized service agreement. Once the consultation is done, Garrett sends over an agreement tailored specifically to your event. You review it, sign digitally, and pay your deposit securely via Stripe—all in one step. Your date isn’t secured until this is done.",
    },
    sent: {
      title: 'Agreement Ready',
      body: 'Your agreement is ready. Review it, sign, and pay your deposit via Stripe to officially lock in your date.',
      action: { label: 'Sign & Pay Deposit →', href: '/contract' },
    },
    complete: {
      title: 'Signed & Deposited 🎉',
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
      action: { label: 'Open Planning Form →', href: '/planning' },
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
      action: { label: 'Pay Final Balance →', href: '/contract/final-payment' },
    },
    complete: {
      title: 'Paid in Full 🎵',
      body: "Paid in full. We are completely cleared for launch—we can’t wait for your celebration!",
    },
  },
  event: {
    upcoming: {
      title: 'The Big Day',
      body: "The big day. Garrett arrives 1.5 hours early to orchestrate the setups. Enjoy every single moment of your celebration—we’ve got the audio experience completely handled.",
    },
    complete: {
      title: 'Thank You',
      body: "What an incredible celebration. Thank you so much for trusting us with your wedding day—we hope it’s a night you’ll never forget.",
    },
  },
  review: {
    active: {
      title: 'Leave a Review',
      body: 'How did we do? Your feedback means everything to us, and it directly helps us continue providing this same premium, unforgettable service for more couples.',
      action: { label: 'Leave a Review ⭐', href: '/review' },
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

export default function StepTracker({ booking, clientName, justPaid, paymentType, userId }: Props) {
  const [selectedStep, setSelectedStep] = useState<string | null>(null)
  const [liveBooking, setLiveBooking] = useState<Booking | null>(booking)

  // Keep in sync with a fresh server-fetched prop (e.g. on navigation)
  useEffect(() => { setLiveBooking(booking) }, [booking])

  // Live-update when admin changes a step while this dashboard is already open
  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`booking-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `client_id=eq.${userId}` },
        (payload) => setLiveBooking(payload.new as Booking))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const b = liveBooking
  const noBooking = !b
  const firstName = clientName?.split(' ')[0] || 'there'
  const isGarrett = userId === GARRETT_ID
  const daysUntil = useCountdown(b?.event_date || null)
  const eventDone = b?.step_event === 'complete'

  const fmtDate = (d: string) =>
    new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  const inquiryStatus = (noBooking || !b.step_inquiry || b.step_inquiry === 'locked') ? 'active' as const : stepStatus(b.step_inquiry)

  const steps = [
    { key: 'inquiry',       num: 1, label: 'Inquiry',       s: inquiryStatus },
    { key: 'consultation',  num: 2, label: 'Consult',       s: noBooking ? 'locked' as const : stepStatus(b.step_consultation)  },
    { key: 'contract',      num: 3, label: 'Sign & Pay',    s: noBooking ? 'locked' as const : stepStatus(b.step_contract)      },
    { key: 'planning',      num: 4, label: 'Planning',      s: noBooking ? 'locked' as const : stepStatus(b.step_planning)      },
    { key: 'final_payment', num: 5, label: 'Final Pay',     s: noBooking ? 'locked' as const : stepStatus(b.step_final_payment) },
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
        color: isLocked ? 'rgba(7,17,26,0.3)' : copy.stepState === 'complete' ? GREEN : BLUE,
        locked: isLocked,
      }
    }
    if (!b || inquiryStatus !== 'complete') return {
      eyebrow: 'Start Here', title: 'Tell Us About Your Day',
      body: "Start here. Tell us about your date, venue, and vision—we're invested in the details. (Takes about 3 minutes).",
      action: { label: 'Submit Inquiry →', href: '/inquiry' }, color: BLUE,
    }
    if (['locked','pending'].includes(b.step_consultation || 'locked') && b.step_inquiry === 'complete') return {
      eyebrow: '✓ Inquiry Received', title: 'Garrett Will Be in Touch',
      body: 'Inquiry received. Garrett will be in touch within 24–48 hours.',
      action: null, color: BLUE,
    }
    if (b.step_consultation === 'scheduled') return {
      eyebrow: '📅 Consultation Locked In', title: 'Consultation Locked In',
      body: "Your consultation is locked in. We’re excited to connect, listen to your ideas, and talk through your celebration.",
      action: null, color: BLUE,
    }
    if (b.step_consultation === 'complete' && ['locked','pending'].includes(b.step_contract || 'locked')) return {
      eyebrow: 'Consultation Complete ✓', title: 'Agreement Coming Your Way',
      body: 'Consultation done. Sit back and relax—Garrett is crafting your personalized service agreement.',
      action: null, color: BLUE,
    }
    if (b.step_contract === 'sent') return {
      eyebrow: 'Action Required', title: 'Agreement Ready',
      body: 'Your agreement is ready. Review it, sign, and pay your deposit via Stripe to officially lock in your date.',
      action: { label: 'Sign & Pay Deposit →', href: '/contract' }, color: RED,
    }
    if (['signed','client_signed'].includes(b.step_contract || '') && b.step_planning === 'locked') return {
      eyebrow: '🎉 Signed & Deposited', title: 'Your Day Is Locked In!',
      body: 'Signed and deposited. Your day is locked in!', action: null, color: GREEN,
    }
    // Final payment is checked ahead of planning so a pending balance is never hidden behind an unfinished planning form — planning completion should not gate final payment.
    if (b.step_final_payment === 'pending') return {
      eyebrow: 'Action Required', title: 'Final Payment Due',
      body: 'Your final balance is due. Complete this secure Stripe payment and your entire sound experience is fully secured.',
      action: { label: 'Pay Final Balance →', href: '/contract/final-payment' }, color: RED,
    }
    if (b.step_planning === 'pending') return {
      eyebrow: 'Action Required', title: 'Planning Form Ready',
      body: 'Your planning form is ready. Fill it out so Garrett has everything he needs to prep for your day.',
      action: { label: 'Open Planning Form →', href: '/planning' }, color: RED,
    }
    if (b.step_planning === 'submitted' && ['locked'].includes(b.step_final_payment || 'locked')) return {
      eyebrow: 'Planning Submitted ✓', title: 'Garrett Is On It',
      body: 'Planning submitted. Garrett is diving into your details and actively preparing for your celebration.',
      action: null, color: BLUE,
    }
    if (b.step_final_payment === 'paid' && !eventDone) return {
      eyebrow: '✓ Fully Confirmed', title: 'Cleared for Launch 🎵',
      body: "Paid in full. We are completely cleared for launch—we can’t wait for your celebration!",
      action: null, color: GREEN,
    }
    if (eventDone) return {
      eyebrow: 'Event Complete', title: 'Thank You',
      body: "What an incredible celebration. Thank you so much for trusting us with your wedding day—we hope it’s a night you’ll never forget.",
      action: { label: 'Leave a Review ⭐', href: '/review' }, color: GOLD,
    }
    return null
  }

  const card = getCard()

  return (
    <div className="min-h-screen bg-primary text-on-primary font-body-md">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-primary/95 backdrop-blur-md border-b border-on-primary/10 h-16 px-4 sm:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-on-primary text-primary font-label-md text-label-md px-2 py-1 uppercase tracking-widest">PM</div>
          <span className="hidden sm:inline font-label-sm text-label-sm uppercase tracking-widest text-on-primary/60">
            Pescadero Music
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-primary/50">Hi, {firstName}</span>
          <Link href="/auth/signout" className="font-label-sm text-label-sm uppercase tracking-widest text-on-primary/30 hover:text-on-primary/60">
            Sign Out
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 pb-20">
        {justPaid && (
          <div className="bg-[rgba(76,175,80,0.1)] border border-[rgba(76,175,80,0.25)] p-space-md mb-space-xl flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-headline-sm text-headline-sm text-[#4CAF50] m-0">
                {paymentType === 'final' ? "Fully paid — you're all set!" : 'Deposit paid — your date is secured!'}
              </p>
              <p className="font-body-sm text-body-sm text-on-primary/50 mt-1 mb-0">Garrett has been notified.</p>
            </div>
          </div>
        )}

        {!noBooking && (
          <div className="bg-surface-container text-on-surface shadow-[4px_4px_0px_0px_rgba(245,239,224,0.12)] p-space-lg mb-space-xl flex flex-wrap items-center justify-between gap-space-md">
            <div className="min-w-0">
              <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mb-1">Your Event</p>
              <p className="font-display-xl text-headline-md truncate">
                {b?.couple_names || b?.event_name || b?.event_type || `${firstName}'s Event`}
              </p>
              {b?.event_date && (
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  {fmtDate(b.event_date)}{b.venue_name ? ` · ${b.venue_name}` : ''}
                </p>
              )}
            </div>
            {daysUntil !== null && daysUntil <= 0 && (
              <p className="font-headline-sm text-headline-sm text-[#4CAF50] m-0">Today! 🎉</p>
            )}
          </div>
        )}

        {!noBooking && daysUntil !== null && daysUntil > 0 && (
          <div className="bg-primary text-on-primary shadow-[4px_4px_0px_0px_rgba(245,239,224,0.12)] p-space-lg mb-space-xl flex items-center justify-center">
            <VinylCountdown days={daysUntil} />
          </div>
        )}

        {noBooking && (
          <div className="text-center mb-space-xl">
            <h1 className="font-display-xl text-headline-lg mb-2">Let&rsquo;s Make Your Day Unforgettable</h1>
            <p className="font-body-md text-body-md text-on-primary/50">Start by submitting your inquiry below.</p>
          </div>
        )}

        {/* STEP TRACKER RIBBON */}
        <div className="mb-2 relative">
          <div className="absolute top-[22px] left-[4%] right-[4%] h-0.5 bg-on-primary/10 z-0" />
          <div
            className="absolute top-[22px] left-[4%] h-0.5 z-[1] bg-secondary transition-all duration-700"
            style={{ width: completedCount === 0 ? '0%' : `${Math.min((completedCount / (steps.length + 0.8)) * 92, 88)}%` }}
          />
          <div className="flex items-start relative z-[2]">
            {steps.map(step => {
              const isComplete = step.s === 'complete'
              const isActive   = step.s === 'active'
              const isLocked   = step.s === 'locked'
              const isSel      = selectedStep === step.key
              const size = isSel ? 44 : isActive ? 40 : 36
              return (
                <button
                  key={step.key}
                  onClick={() => handleStepClick(step.key)}
                  className="flex-1 flex flex-col items-center gap-1.5 select-none bg-transparent border-0 p-0 appearance-none cursor-pointer"
                >
                  <div
                    className="rounded-full flex items-center justify-center shrink-0 transition-all"
                    style={{
                      width: size, height: size,
                      border: `2px solid ${isSel ? CREAM : isComplete ? '#4CAF50' : isActive ? BLUE : 'rgba(245,239,224,0.15)'}`,
                      background: NAVY,
                      boxShadow: isSel ? '0 0 0 3px rgba(245,239,224,0.15)' : isActive ? `0 0 20px ${BLUE}40` : 'none',
                    }}
                  >
                    {isComplete
                      ? <span className="text-base text-[#4CAF50]">✓</span>
                      : <span className="font-label-sm text-on-primary" style={{ color: isSel ? CREAM : isActive ? BLUE : 'rgba(245,239,224,0.25)' }}>{step.num}</span>}
                  </div>
                  <p
                    className="font-label-sm text-[9px] uppercase tracking-wide text-center"
                    style={{ color: isSel ? CREAM : isLocked ? 'rgba(245,239,224,0.25)' : CREAM }}
                  >
                    {step.label}
                  </p>
                </button>
              )
            })}

            {/* Event Day */}
            <button onClick={() => handleStepClick('event')} className="flex-[1.2] flex flex-col items-center gap-1.5 select-none bg-transparent border-0 p-0 appearance-none cursor-pointer">
              <div
                className="rounded-full flex items-center justify-center shrink-0 transition-all"
                style={{
                  width: selectedStep === 'event' ? 56 : 52, height: selectedStep === 'event' ? 56 : 52,
                  border: `3px solid ${selectedStep === 'event' ? CREAM : eventDone ? '#4CAF50' : RED}`,
                  background: NAVY,
                  boxShadow: selectedStep === 'event' ? '0 0 0 3px rgba(245,239,224,0.15)' : `0 0 28px ${eventDone ? '#4CAF50' : RED}35`,
                }}
              >
                {eventDone ? <span className="text-xl text-[#4CAF50]">✓</span> : <span className="text-lg">🎵</span>}
              </div>
              <p className="font-label-sm text-[9px] uppercase tracking-wide text-center" style={{ color: selectedStep === 'event' ? CREAM : eventDone ? '#4CAF50' : RED }}>
                Event Day
              </p>
              {daysUntil !== null && daysUntil > 0 && selectedStep !== 'event' && (
                <div className="text-center">
                  <p className="font-display-xl text-sm leading-none">{daysUntil}d</p>
                  <p className="font-label-sm text-[8px] text-on-primary/40">to go</p>
                </div>
              )}
            </button>

            {/* Review */}
            <button onClick={() => handleStepClick('review')} className="flex-1 flex flex-col items-center gap-1.5 select-none bg-transparent border-0 p-0 appearance-none cursor-pointer">
              <div
                className="rounded-full flex items-center justify-center shrink-0 transition-all"
                style={{
                  width: selectedStep === 'review' ? 40 : 36, height: selectedStep === 'review' ? 40 : 36,
                  border: `2px solid ${selectedStep === 'review' ? CREAM : eventDone ? GOLD : 'rgba(245,239,224,0.1)'}`,
                  background: NAVY,
                  boxShadow: selectedStep === 'review' ? '0 0 0 3px rgba(245,239,224,0.15)' : 'none',
                }}
              >
                <span className="text-sm" style={{ filter: eventDone ? 'none' : 'grayscale(1) opacity(0.25)' }}>⭐</span>
              </div>
              <p className="font-label-sm text-[9px] uppercase tracking-wide text-center" style={{ color: selectedStep === 'review' ? CREAM : eventDone ? GOLD : 'rgba(245,239,224,0.25)' }}>
                Review
              </p>
            </button>
          </div>
        </div>

        <p className="text-center font-label-sm text-label-sm tracking-widest text-on-primary/30 my-space-md">
          {selectedStep ? 'Tap again to dismiss' : 'Tap any step to learn more'}
        </p>

        {card && (() => {
          const isLocked = !!card.locked
          return (
            <div
              className="p-space-lg mb-space-lg"
              style={{
                background: isLocked ? 'rgba(245,239,224,0.04)' : `${card.color}14`,
                border: `1px solid ${isLocked ? 'rgba(245,239,224,0.1)' : `${card.color}40`}`,
                borderLeft: `4px solid ${isLocked ? 'rgba(245,239,224,0.2)' : card.color}`,
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-space-md">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-label-sm text-label-sm uppercase tracking-widest" style={{ color: isLocked ? 'rgba(245,239,224,0.3)' : card.color }}>
                      {card.eyebrow}
                    </p>
                    {isLocked && <span className="font-body-sm text-on-primary/30">🔒 Locked</span>}
                  </div>
                  <p className="font-headline-sm text-headline-sm mb-1" style={{ color: isLocked ? 'rgba(245,239,224,0.4)' : CREAM }}>
                    {card.title}
                  </p>
                  <p className="font-body-sm text-body-sm leading-relaxed" style={{ color: isLocked ? 'rgba(245,239,224,0.3)' : 'rgba(245,239,224,0.7)' }}>
                    {card.body}
                  </p>
                  {selectedStep && (
                    <button onClick={() => setSelectedStep(null)} className="mt-3 font-label-sm text-label-sm tracking-wider text-on-primary/30 hover:text-on-primary/50 bg-transparent border-0 p-0 appearance-none cursor-pointer">
                      ← Back to your next step
                    </button>
                  )}
                </div>
                {card.action && !isLocked && (
                  <Link
                    href={card.action.href}
                    className="bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-label-md uppercase px-space-md py-space-sm shadow-[3px_3px_0px_0px_#07111A] whitespace-nowrap shrink-0"
                  >
                    {card.action.label}
                  </Link>
                )}
              </div>
            </div>
          )
        })()}

        <div className="flex flex-wrap gap-2">
          {b?.step_contract && ['signed','client_signed','complete'].includes(b.step_contract) && (
            <Link href="/contract" className="flex-1 min-w-[140px] text-center px-space-md py-space-sm border border-on-primary/10 bg-on-primary/5 text-on-primary/60 font-label-sm text-label-sm uppercase tracking-wider">
              View Contract
            </Link>
          )}
          {b?.step_inquiry === 'complete' && (
            <Link href="/inquiry/view" className="flex-1 min-w-[140px] text-center px-space-md py-space-sm border border-on-primary/10 bg-on-primary/5 text-on-primary/60 font-label-sm text-label-sm uppercase tracking-wider">
              View Inquiry
            </Link>
          )}
          {eventDone && (
            <Link href="/review" className="flex-1 min-w-[140px] text-center px-space-md py-space-sm border font-label-sm text-label-sm uppercase tracking-wider" style={{ borderColor: `${GOLD}4D`, background: `${GOLD}15`, color: GOLD }}>
              Leave a Review ⭐
            </Link>
          )}
          <Link href="/policy" className="flex-1 min-w-[140px] text-center px-space-md py-space-sm border border-on-primary/10 bg-on-primary/5 text-on-primary/60 font-label-sm text-label-sm uppercase tracking-wider">
            Service Policy
          </Link>
        </div>

        {isGarrett && (
          <div className="mt-space-md p-space-md border border-tertiary/25 bg-tertiary/5">
            <p className="font-label-sm text-[9px] uppercase tracking-widest text-tertiary/70 mb-2">Dev Access</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Inquiry', href: '/inquiry' },
                { label: 'Contract', href: '/contract' },
                { label: 'Planning', href: '/planning' },
                { label: 'Final Pay', href: '/contract/final-payment' },
                { label: 'Admin', href: '/admin' },
              ].map(({ label, href }) => (
                <Link key={href} href={href} className="px-3 py-1.5 border border-tertiary/25 bg-tertiary/10 text-tertiary font-label-sm text-label-sm uppercase tracking-wider">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}

        <p className="text-center mt-space-xl font-body-sm text-body-sm text-on-primary/25">
          Questions? <a href="mailto:garrett@pescaderomusic.com" className="text-tertiary">garrett@pescaderomusic.com</a> · (210) 727-9328
        </p>
      </div>
    </div>
  )
}
