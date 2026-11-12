'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

type EventTypeId = 'wedding' | 'event' | 'movie'

const EVENT_TYPES: { id: EventTypeId; icon: string; label: string; body: string }[] = [
  { id: 'wedding', icon: 'album', label: 'Wedding Sound', body: 'Ceremony, cocktail hour, and reception — the full suite.' },
  { id: 'event', icon: 'celebration', label: 'DJ / Party / Event', body: 'Parties, grand openings, corporate events.' },
  { id: 'movie', icon: 'movie', label: 'Outdoor Movie Night', body: 'Private backyard cinema — summer only.' },
]

const HEADER_TITLE: Record<EventTypeId, string> = {
  wedding: 'Wedding Sound Inquiry',
  event: 'DJ & Event Inquiry',
  movie: 'Outdoor Movie Night Inquiry',
}
const STEP3_SUB: Record<EventTypeId, string> = {
  wedding: 'Tell us about your wedding day.',
  event: 'Tell us about your event.',
  movie: 'Tell us about your screening.',
}

const HEAR_ABOUT_OPTIONS = [
  'Google / Internet Search',
  'Instagram',
  'TikTok',
  'Facebook',
  'Word of Mouth',
  "Friend of Garrett's",
  'Another Vendor / Referral',
  'Wedding Wire / The Knot',
  'Other',
]

const VENDOR_TYPES = ['Photographer', 'Videographer', 'Florist', 'Venue', 'Wedding Planner / Coordinator', 'Caterer', 'Hair & Makeup', 'DJ / Entertainment', 'Other']

const WEDDING_COVERAGE = ['Ceremony', 'Cocktail Hour', 'Reception', 'Dinner', 'Dancing']

const MOVIE_LOCATIONS = ['Private Backyard', 'HOA / Neighborhood', 'Private Venue', 'Other']

interface FormState {
  firstName: string
  lastName: string
  email: string
  phone: string
  contactMethod: string
  coupleNames: string
  eventName: string
  eventTypesChecked: string[]
  eventDate: string
  startTime: string
  endTime: string
  secondDate: string
  venue: string
  venueAddress: string
  indoorOutdoor: string
  attendance: string
  additionalDetails: string
  hearAbout: string
  vendorName: string
  vendorType: string
  otherHear: string
  weddingPackage: string
  movieLocation: string
  privateEventConfirm: boolean
}

const emptyForm: FormState = {
  firstName: '', lastName: '', email: '', phone: '', contactMethod: '',
  coupleNames: '', eventName: '', eventTypesChecked: [], eventDate: '',
  startTime: '', endTime: '', secondDate: '', venue: '', venueAddress: '',
  indoorOutdoor: '', attendance: '', additionalDetails: '', hearAbout: '',
  vendorName: '', vendorType: '', otherHear: '', weddingPackage: '',
  movieLocation: '', privateEventConfirm: false,
}

const STEP_LABELS = ['Date & Type', 'Contact', 'Details', 'Package', 'Submit']

const label = 'font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mb-1 block'
const input = 'w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md p-3 outline-none border-b-2 border-primary/20 focus:border-secondary focus:bg-white transition-colors'
const choiceItem = (active: boolean) =>
  `flex items-center gap-2.5 px-3.5 py-2.5 bg-white border-2 ${active ? 'border-secondary bg-secondary/5 text-primary font-bold' : 'border-primary/15 text-on-surface-variant'} font-body-md text-body-md cursor-pointer transition-colors`

export default function InquiryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <InquiryWizard />
    </Suspense>
  )
}

function InquiryWizard() {
  const searchParams = useSearchParams()

  const [eventType, setEventType] = useState<EventTypeId>('wedding')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [checkDate, setCheckDate] = useState('')
  const [dateStatus, setDateStatus] = useState<'idle' | 'checking' | 'available' | 'busy'>('idle')
  const [lastChecked, setLastChecked] = useState<{ date: string; busy: boolean } | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => setForm((f) => ({ ...f, [key]: val }))

  // ── Prefill from URL params (?type, ?date) coming from the homepage checker ──
  useEffect(() => {
    const typeParam = searchParams.get('type')
    const dateParam = searchParams.get('date')
    if (typeParam === 'wedding' || typeParam === 'event' || typeParam === 'movie') setEventType(typeParam)
    if (dateParam) {
      setCheckDate(dateParam)
      set('eventDate', dateParam)
    }
    // Both present (arrived from homepage, date already checked there) — skip to Contact.
    if (typeParam && dateParam) setStep(2)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Auto-fill from a logged-in Supabase session + restore saved draft ──
  useEffect(() => {
    try {
      const keys = Object.keys(localStorage)
      const sessionKey = keys.find((k) => k.includes('auth-token') || k.includes('supabase'))
      if (sessionKey) {
        const session = JSON.parse(localStorage.getItem(sessionKey) || 'null')
        const user = session?.user || session?.[0]?.user
        if (user) {
          const meta = user.user_metadata || {}
          const fullName: string = meta.full_name || meta.name || ''
          const [first, ...rest] = fullName.trim().split(' ').filter(Boolean)
          setForm((f) => ({ ...f, email: f.email || user.email || '', firstName: f.firstName || first || '', lastName: f.lastName || rest.join(' ') || '' }))
        }
      }
    } catch {}

    try {
      const saved = localStorage.getItem('pescadero_inquiry')
      if (!saved) return
      const d = JSON.parse(saved)
      if (d.eventCategory && d.eventCategory !== eventType) return
      setForm((f) => ({ ...f, ...d }))
      if (d.eventDate) setCheckDate((c) => c || d.eventDate)
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveProgress = () => {
    try {
      localStorage.setItem('pescadero_inquiry', JSON.stringify({ ...form, eventCategory: eventType }))
    } catch {}
  }

  const checkAvailability = async (date: string) => {
    setCheckDate(date)
    set('eventDate', date)
    if (!date) {
      setDateStatus('idle')
      return
    }
    setDateStatus('checking')
    try {
      const res = await fetch(`/api/check-availability?date=${encodeURIComponent(date)}`)
      const data = await res.json()
      const busy = data.status === 'booked'
      setLastChecked({ date, busy })
      setDateStatus(busy ? 'busy' : 'available')
    } catch {
      setLastChecked({ date, busy: false })
      setDateStatus('available')
    }
  }

  // ── Validation ──
  const validate = (s: number): string | null => {
    if (s === 1) {
      if (!checkDate) return 'Please select an event date.'
      if (lastChecked?.date === checkDate && lastChecked.busy) return 'That date is already booked — please choose another.'
    }
    if (s === 2) {
      if (!form.firstName) return 'First name is required.'
      if (!form.lastName) return 'Last name is required.'
      if (!form.email) return 'Email address is required.'
      if (!form.phone) return 'Phone number is required.'
      if (!form.contactMethod) return 'Please select a preferred contact method.'
      if (eventType === 'wedding' && !form.coupleNames) return 'Please enter the names of the bride & groom.'
      if (!form.hearAbout) return 'Please tell us how you heard about us.'
      if (form.hearAbout === 'Another Vendor / Referral' && !form.vendorName) return 'Please enter the vendor name.'
    }
    if (s === 3) {
      if (!form.eventName) return 'Event name is required.'
      if (!form.eventDate) return 'Event date is required.'
      if (!form.startTime) return 'Start time is required.'
      if (!form.endTime) return 'End time is required.'
      if (!form.venue) return 'Venue / location name is required.'
      if (!form.venueAddress) return 'Address is required.'
      if (!form.indoorOutdoor) return 'Please select indoor or outdoor.'
      if (!form.attendance) return 'Estimated attendance is required.'
      if (eventType === 'movie' && !form.movieLocation) return 'Please select a location type.'
    }
    if (s === 4) {
      if (eventType === 'wedding' && !form.weddingPackage) return 'Please select a package.'
      if (eventType === 'movie' && !form.privateEventConfirm) return 'Please confirm this is a private event to continue.'
    }
    return null
  }

  const goTo = (next: number) => {
    if (next > step) {
      const err = validate(step)
      if (err) {
        setError(err)
        setTimeout(() => setError(''), 4000)
        return
      }
    }
    setError('')
    saveProgress()
    setStep(next)
  }

  const venueLabel = eventType === 'movie' ? 'Location / Host Name' : 'Venue / Location Name'
  const eventNamePlaceholder = eventType === 'wedding' ? 'e.g. Smith Wedding Reception' : eventType === 'movie' ? 'e.g. Martinez Backyard Movie Night' : 'e.g. Johnson House Party / Grand Opening'

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    let notes = form.additionalDetails
    if (eventType === 'event' && form.secondDate) {
      notes = `Multi-night booking — second date requested: ${form.secondDate}${notes ? '. ' + notes : '.'}`
    }
    const payload = {
      firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone,
      contactMethod: form.contactMethod, coupleNames: form.coupleNames, eventName: form.eventName,
      eventTypes: form.eventTypesChecked, eventDate: form.eventDate, startTime: form.startTime, endTime: form.endTime,
      venue: form.venue, venueAddress: form.venueAddress, indoorOutdoor: form.indoorOutdoor, attendance: form.attendance,
      additionalDetails: notes, hearAbout: form.hearAbout, vendorName: form.vendorName, vendorType: form.vendorType,
      otherHear: form.otherHear,
      weddingPackage: form.weddingPackage || (eventType === 'event' ? 'Dance DJ - $599' : ''),
      movieLocation: form.movieLocation, eventCategory: eventType,
    }
    try {
      const res = await fetch('/api/inquiry/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Request failed: ${res.status}`)
      }
      try { localStorage.removeItem('pescadero_inquiry') } catch {}
      setSubmitted(true)
    } catch (e: any) {
      setError(e.message || 'Something went wrong submitting your inquiry. Please try again, or email garrett@pescaderomusic.com directly.')
    } finally {
      setSubmitting(false)
    }
  }

  const reviewRows = useMemo(() => {
    const rows: [string, string][] = [
      ['Inquiry Type', { wedding: 'Wedding Sound', event: 'DJ / Event', movie: 'Outdoor Movie Night' }[eventType]],
      ['Name', `${form.firstName} ${form.lastName}`.trim()],
      ['Email', form.email],
      ['Phone', form.phone],
      ['Contact Via', form.contactMethod || '—'],
    ]
    if (eventType === 'wedding') rows.push(['Bride & Groom', form.coupleNames])
    rows.push(
      ['Event', form.eventName],
      ['Date', form.eventDate],
      ['Start', form.startTime],
      ['End', form.endTime],
      ['Venue', form.venue],
      ['Address', form.venueAddress],
      ['Setting', form.indoorOutdoor || '—'],
      ['Attendance', form.attendance],
    )
    if (eventType === 'wedding' && form.eventTypesChecked.length) rows.push(['Coverage', form.eventTypesChecked.join(', ')])
    if (eventType === 'movie') rows.push(['Location Type', form.movieLocation])
    if (eventType === 'event' && form.secondDate) rows.push(['Second Date', form.secondDate])
    const pkg = form.weddingPackage || (eventType === 'event' ? 'Dance DJ - $599' : '')
    if (pkg) rows.push(['Package', pkg])
    rows.push(
      ['Heard About Us', form.hearAbout || '—'],
      ['Vendor Referral', form.vendorName || '—'],
      ['Notes', form.additionalDetails || '—'],
    )
    return rows
  }, [form, eventType])

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-surface border-2 border-primary p-space-xl text-center shadow-[8px_8px_0px_0px_#07111A]">
          <div className="w-16 h-16 rounded-full bg-tertiary flex items-center justify-center mx-auto mb-space-md">
            <span className="material-symbols-outlined text-primary text-3xl">check</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-space-sm">Inquiry Received!</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-1">
            Garrett will reach out within <strong>24–48 hours</strong> to follow up.
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg">
            Questions? <a href="mailto:garrett@pescaderomusic.com" className="text-tertiary">garrett@pescaderomusic.com</a>
          </p>
          <a href="/" className="inline-flex items-center justify-center bg-secondary text-on-secondary font-label-md text-label-md uppercase px-space-lg py-space-sm shadow-[4px_4px_0px_0px_#07111A]">
            Back to Home →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface">
      {/* Minimal focused-flow header */}
      <div className="sticky top-0 z-50 bg-primary border-b-[3px] border-secondary h-16 px-6 flex items-center justify-between">
        <button
          onClick={() => { saveProgress(); window.location.href = '/' }}
          className="bg-transparent font-label-sm text-label-sm uppercase tracking-widest text-surface-container border border-surface-container/30 px-3 py-1.5 hover:bg-surface-container/10 transition-colors whitespace-nowrap shrink-0"
        >
          ← Save &amp; Exit
        </button>
        <div className="flex flex-col items-end">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-tertiary">Pescadero Music</span>
          <span className="font-headline-sm text-headline-sm text-surface-bright leading-tight">{HEADER_TITLE[eventType]}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-space-lg">
        {/* Step ribbon */}
        <nav className="grid grid-cols-5 gap-1 mb-space-lg">
          {STEP_LABELS.map((lbl, i) => {
            const n = i + 1
            const active = n === step
            const done = n < step
            return (
              <button
                key={lbl}
                onClick={() => n < step && goTo(n)}
                disabled={n > step}
                className={`py-2 px-1 flex flex-col items-center font-label-md text-label-md uppercase border ${
                  active
                    ? 'bg-primary text-on-primary border-primary shadow-[2px_2px_0px_0px_#C8202A]'
                    : done
                    ? 'bg-tertiary/15 text-primary border-tertiary/40 cursor-pointer'
                    : 'bg-surface-container text-on-surface-variant border-primary/10 cursor-default'
                }`}
              >
                <span className="text-[10px] tracking-widest opacity-70">STEP 0{n}</span>
                <span className="tracking-wider truncate w-full text-center">{lbl}</span>
              </button>
            )
          })}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* LEFT: persistent poster panel */}
          <aside className="lg:col-span-5 bg-primary text-on-primary p-space-lg flex flex-col justify-between relative overflow-hidden shadow-[6px_6px_0px_0px_#0D1E2B]">
            <div className="relative z-10">
              <div className="inline-block bg-secondary text-on-secondary font-label-sm text-label-sm uppercase px-space-sm py-0.5 tracking-widest">
                Pescadero Music
              </div>
            </div>
            <div className="relative z-10 my-space-lg">
              <div className="relative overflow-hidden aspect-[4/3] bg-primary-container border border-surface-container/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Pescadero Music DJ booth and setup at a wedding"
                  className="w-full h-full object-cover contrast-110 saturate-90"
                  src="/images/site/booth-venue.jpg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent opacity-70" />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-on-primary/90 font-label-sm text-label-sm uppercase tracking-wider px-2 py-1 bg-primary/80">
                  <span>Professional Sound System</span>
                  <span>Provo, UT</span>
                </div>
              </div>
            </div>
            <div className="relative z-10 space-y-space-md pt-space-md border-t border-surface-container/20">
              <div className="flex items-center justify-between p-space-sm bg-surface-container-highest/10 border border-surface-container/20">
                <div>
                  <span className="font-label-sm text-[10px] uppercase text-outline-variant block tracking-wider">Direct Line</span>
                  <span className="font-label-md text-label-md uppercase tracking-widest text-surface-bright">(210) 727-9328</span>
                </div>
                <a className="p-2 bg-secondary hover:bg-secondary-container text-on-secondary transition-colors" href="tel:2107279328">
                  <span className="material-symbols-outlined text-lg leading-none">call</span>
                </a>
              </div>
            </div>
          </aside>

          {/* RIGHT: wizard card */}
          <section className="lg:col-span-7 bg-surface-container-low border border-primary/25 p-space-lg shadow-[6px_6px_0px_0px_#07111A]">
            {error && (
              <div className="mb-space-md p-3 bg-secondary/10 border border-secondary/30 font-body-sm text-body-sm text-secondary">
                {error}
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">Welcome to Pescadero Music</span>
                <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mb-space-xs">Check Availability</h1>
                <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">Pick your event type and date to get started. Takes about 3 minutes.</p>

                <label className={label}>What kind of event?</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm mb-space-lg">
                  {EVENT_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setEventType(t.id)}
                      className={`text-left p-space-md bg-white border-2 transition-all ${
                        eventType === t.id ? 'border-secondary shadow-[4px_4px_0px_0px_#C8202A]' : 'border-primary/15'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="material-symbols-outlined text-secondary text-2xl">{t.icon}</span>
                        <span className={`w-4 h-4 rounded-full border-2 ${eventType === t.id ? 'border-secondary' : 'border-primary/20'} flex items-center justify-center`}>
                          {eventType === t.id && <span className="w-2 h-2 rounded-full bg-secondary" />}
                        </span>
                      </div>
                      <h3 className="font-label-lg text-label-lg uppercase tracking-wider text-primary">{t.label}</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t.body}</p>
                    </button>
                  ))}
                </div>

                <label className={label}>Event Date</label>
                <input type="date" className={`${input} mb-space-sm`} min={new Date().toISOString().split('T')[0]} value={checkDate} onChange={(e) => checkAvailability(e.target.value)} />

                {dateStatus !== 'idle' && (
                  <div
                    className={`p-3 mb-space-md font-body-sm text-body-sm ${
                      dateStatus === 'available' ? 'bg-tertiary/10 border border-tertiary/40 text-primary'
                      : dateStatus === 'busy' ? 'bg-secondary/10 border border-secondary/30 text-secondary'
                      : 'bg-surface-container border border-primary/10 text-on-surface-variant'
                    }`}
                  >
                    {dateStatus === 'checking' && 'Checking calendar…'}
                    {dateStatus === 'available' && '✓ That date looks open — continue below to send your inquiry.'}
                    {dateStatus === 'busy' && '✗ That date is already booked. Try another date or reach out to ask.'}
                  </div>
                )}

                <div className="p-3 bg-tertiary/5 border border-tertiary/20 font-body-sm text-body-sm text-on-surface-variant mb-space-lg">
                  🔒 Your information is only shared with Garrett — never sold or shared with third parties. Earlier inquiries get priority; nothing is secured until your contract is signed and deposit paid.
                </div>

                <div className="flex items-center justify-between pt-space-sm border-t border-primary/10">
                  <a href="/policy" target="_blank" className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary">View Service Policy</a>
                  <button onClick={() => goTo(2)} className="bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-label-md uppercase px-space-lg py-space-sm shadow-[4px_4px_0px_0px_#07111A] transition-all">
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">Step 1 of 4</span>
                <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mb-space-xs">Contact Information</h1>
                <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">Tell us how to reach you.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mb-space-sm">
                  <div><label className={label}>First Name</label><input className={input} value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="First" /></div>
                  <div><label className={label}>Last Name</label><input className={input} value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Last" /></div>
                </div>
                <div className="mb-space-sm"><label className={label}>Email Address</label><input type="email" className={input} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" /></div>
                <div className="mb-space-sm"><label className={label}>Phone Number</label><input type="tel" className={input} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(801) 555-5555" /></div>

                <label className={label}>Preferred Contact Method</label>
                <div className="flex flex-wrap gap-2 mb-space-sm">
                  {['Call', 'Email', 'Text'].map((m) => (
                    <label key={m} className={choiceItem(form.contactMethod === m)}>
                      <input type="radio" className="accent-secondary" checked={form.contactMethod === m} onChange={() => set('contactMethod', m)} /> {m}
                    </label>
                  ))}
                </div>

                {eventType === 'wedding' && (
                  <div className="mb-space-sm">
                    <label className={label}>Name of Bride &amp; Groom</label>
                    <input className={input} value={form.coupleNames} onChange={(e) => set('coupleNames', e.target.value)} placeholder="e.g. Emily & James" />
                  </div>
                )}

                <label className={label}>How did you hear about us?</label>
                <div className="flex flex-col gap-1.5 mb-space-sm">
                  {HEAR_ABOUT_OPTIONS.map((opt) => (
                    <label key={opt} className={choiceItem(form.hearAbout === opt) + ' !py-2'}>
                      <input type="radio" className="accent-secondary" checked={form.hearAbout === opt} onChange={() => set('hearAbout', opt)} /> {opt}
                    </label>
                  ))}
                </div>
                {form.hearAbout === 'Another Vendor / Referral' && (
                  <div className="mb-space-sm space-y-2">
                    <select className={input} value={form.vendorType} onChange={(e) => set('vendorType', e.target.value)}>
                      <option value="">Select vendor type...</option>
                      {VENDOR_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <input className={input} value={form.vendorName} onChange={(e) => set('vendorName', e.target.value)} placeholder="e.g. Sarah Johnson Photography" />
                  </div>
                )}
                {form.hearAbout === 'Other' && (
                  <input className={`${input} mb-space-sm`} value={form.otherHear} onChange={(e) => set('otherHear', e.target.value)} placeholder="How did you find us?" />
                )}

                <div className="flex items-center justify-between pt-space-md border-t border-primary/10 mt-space-md">
                  <button onClick={() => goTo(1)} className="bg-transparent border-2 border-primary/20 text-on-surface-variant font-label-md text-label-md uppercase px-space-lg py-space-sm">← Back</button>
                  <button onClick={() => goTo(3)} className="bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-label-md uppercase px-space-lg py-space-sm shadow-[4px_4px_0px_0px_#07111A] transition-all">Next →</button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">Step 2 of 4</span>
                <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mb-space-xs">Event Details</h1>
                <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">{STEP3_SUB[eventType]}</p>

                <div className="mb-space-sm"><label className={label}>Event Name</label><input className={input} value={form.eventName} onChange={(e) => set('eventName', e.target.value)} placeholder={eventNamePlaceholder} /></div>

                {eventType === 'wedding' && (
                  <div className="mb-space-sm">
                    <label className={label}>What parts need coverage? <span className="normal-case text-on-surface-variant/70">(select all that apply)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {WEDDING_COVERAGE.map((c) => {
                        const checked = form.eventTypesChecked.includes(c)
                        return (
                          <label key={c} className={choiceItem(checked)}>
                            <input
                              type="checkbox" className="accent-secondary" checked={checked}
                              onChange={() => set('eventTypesChecked', checked ? form.eventTypesChecked.filter((v) => v !== c) : [...form.eventTypesChecked, c])}
                            /> {c}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}

                {eventType === 'event' && (
                  <div className="mb-space-sm">
                    <label className={label}>Second Date <span className="normal-case text-on-surface-variant/70">(only if multi-night booking)</span></label>
                    <input type="date" className={input} value={form.secondDate} onChange={(e) => set('secondDate', e.target.value)} />
                  </div>
                )}

                {eventType === 'movie' && (
                  <div className="mb-space-sm">
                    <label className={label}>Location Type</label>
                    <div className="flex flex-wrap gap-2">
                      {MOVIE_LOCATIONS.map((l) => (
                        <label key={l} className={choiceItem(form.movieLocation === l)}>
                          <input type="radio" className="accent-secondary" checked={form.movieLocation === l} onChange={() => set('movieLocation', l)} /> {l}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-space-sm"><label className={label}>Event Date</label><input type="date" className={input} value={form.eventDate} onChange={(e) => set('eventDate', e.target.value)} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mb-space-sm">
                  <div><label className={label}>Start Time</label><input type="time" className={input} value={form.startTime} onChange={(e) => set('startTime', e.target.value)} /></div>
                  <div><label className={label}>End Time</label><input type="time" className={input} value={form.endTime} onChange={(e) => set('endTime', e.target.value)} /></div>
                </div>
                <div className="mb-space-sm"><label className={label}>{venueLabel}</label><input className={input} value={form.venue} onChange={(e) => set('venue', e.target.value)} placeholder="Venue or location name" /></div>
                <div className="mb-space-sm"><label className={label}>Address</label><input className={input} value={form.venueAddress} onChange={(e) => set('venueAddress', e.target.value)} placeholder="Street, City, State, ZIP" /></div>

                <label className={label}>Indoor or Outdoor?</label>
                <div className="flex flex-wrap gap-2 mb-space-sm">
                  {['Indoor', 'Outdoor', 'Both'].map((s) => (
                    <label key={s} className={choiceItem(form.indoorOutdoor === s)}>
                      <input type="radio" className="accent-secondary" checked={form.indoorOutdoor === s} onChange={() => set('indoorOutdoor', s)} /> {s}
                    </label>
                  ))}
                </div>
                <div className="mb-space-sm"><label className={label}>Estimated Attendance</label><input className={input} value={form.attendance} onChange={(e) => set('attendance', e.target.value)} placeholder="e.g. 50" /></div>

                <div className="flex items-center justify-between pt-space-md border-t border-primary/10 mt-space-md">
                  <button onClick={() => goTo(2)} className="bg-transparent border-2 border-primary/20 text-on-surface-variant font-label-md text-label-md uppercase px-space-lg py-space-sm">← Back</button>
                  <button onClick={() => goTo(4)} className="bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-label-md uppercase px-space-lg py-space-sm shadow-[4px_4px_0px_0px_#07111A] transition-all">Next →</button>
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">Step 3 of 4</span>
                <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mb-space-xs">
                  {eventType === 'wedding' ? 'Choose Your Package' : eventType === 'movie' ? 'Outdoor Movie Night' : 'Your DJ Package'}
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">
                  {eventType === 'wedding' ? 'Select the tier that fits your wedding.' : eventType === 'movie' ? 'Private events only — review your package.' : 'Flat rate, no surprises.'}
                </p>

                {eventType === 'wedding' && (
                  <div className="flex flex-col gap-space-sm mb-space-md">
                    {[
                      { val: 'Dance DJ - $599', name: 'Dance DJ', price: '$599', desc: 'One sound system. Up to 3 hours — reception, party, or grand opening.', features: ['Up to 3 hours', 'One pro sound system', 'DJ-curated or custom playlist', 'One wireless mic + one wired mic'] },
                      { val: 'Full-Service Sound - $749', name: 'Full-Service Sound', price: '$749', desc: 'Two independent sound systems — ceremony/speeches + dance floor.', features: ['Up to 3 hours', 'Two independent sound systems', 'Ceremony & cocktail hour sound', 'One wireless mic + one wired mic', 'DJ-curated or custom playlist'], popular: true },
                    ].map((p) => (
                      <label key={p.val} className={`flex gap-3 items-start bg-white border-2 p-space-md cursor-pointer transition-all ${form.weddingPackage === p.val ? 'border-secondary shadow-[4px_4px_0px_0px_#C8202A]' : 'border-primary/15'}`}>
                        <input type="radio" className="mt-1 accent-secondary shrink-0" checked={form.weddingPackage === p.val} onChange={() => set('weddingPackage', p.val)} />
                        <div className="w-full">
                          <div className="flex justify-between items-center mb-1">
                            <span className="flex items-center gap-2 font-label-lg text-label-lg text-primary uppercase">
                              {p.name}
                              {p.popular && <span className="bg-secondary text-on-secondary font-label-sm text-[10px] px-2 py-0.5 uppercase tracking-widest">Popular</span>}
                            </span>
                            <span className="font-headline-sm text-headline-sm text-secondary">{p.price}</span>
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">{p.desc}</p>
                          <div className="flex flex-col gap-0.5">
                            {p.features.map((f) => <span key={f} className="font-body-sm text-body-sm text-tertiary-fixed-dim">✓ {f}</span>)}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {eventType === 'event' && (
                  <div className="bg-white border-2 border-primary/15 p-space-md mb-space-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-label-lg text-label-lg text-primary uppercase">Dance DJ</span>
                      <span className="font-headline-sm text-headline-sm text-secondary">$599</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">One sound system. Up to 3 hours. Perfect for parties, grand openings, and corporate events.</p>
                    {['Up to 3 hours', 'One pro sound system', 'DJ-curated or custom playlist', 'One wireless mic + one wired mic'].map((f) => (
                      <span key={f} className="block font-body-sm text-body-sm text-tertiary-fixed-dim">✓ {f}</span>
                    ))}
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-3 p-2 bg-tertiary/5 border border-tertiary/20">
                      Need more than 3 hours or a second sound system? Mention it in the notes below and Garrett will put together a custom quote.
                    </p>
                  </div>
                )}

                {eventType === 'movie' && (
                  <div className="mb-space-md space-y-space-sm">
                    <div className="bg-white border-2 border-primary/15 p-space-md">
                      <span className="font-label-lg text-label-lg text-primary uppercase block mb-2">Private Outdoor Cinema</span>
                      {['Up to 3 hours', 'Large inflatable screen', 'HD projector', 'Outdoor speaker system', 'No power hookup needed'].map((f) => (
                        <span key={f} className="block font-body-sm text-body-sm text-tertiary-fixed-dim">✓ {f}</span>
                      ))}
                      <div className="flex justify-between border-t border-primary/10 pt-2 mt-2 font-body-sm text-body-sm">
                        <span className="text-on-surface-variant">Mon–Thu</span><span className="font-bold text-primary">$250</span>
                      </div>
                      <div className="flex justify-between font-body-sm text-body-sm">
                        <span className="text-on-surface-variant">Fri–Sat</span><span className="font-bold text-primary">$350</span>
                      </div>
                    </div>
                    <label className="flex items-start gap-3 p-space-md bg-secondary/5 border-2 border-secondary/20 cursor-pointer">
                      <input type="checkbox" className="mt-0.5 accent-secondary" checked={form.privateEventConfirm} onChange={(e) => set('privateEventConfirm', e.target.checked)} />
                      <span className="font-body-sm text-body-sm text-on-surface">
                        <strong>I confirm this is a private event.</strong> Public screenings require separate licensing.
                      </span>
                    </label>
                  </div>
                )}

                <label className={label}>Additional Details &amp; Questions</label>
                <textarea className={`${input} min-h-[88px] resize-none`} value={form.additionalDetails} onChange={(e) => set('additionalDetails', e.target.value)} placeholder="Share any questions, special requests, or details…" />

                <div className="flex items-center justify-between pt-space-md border-t border-primary/10 mt-space-md">
                  <button onClick={() => goTo(3)} className="bg-transparent border-2 border-primary/20 text-on-surface-variant font-label-md text-label-md uppercase px-space-lg py-space-sm">← Back</button>
                  <button onClick={() => goTo(5)} className="bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-label-md uppercase px-space-lg py-space-sm shadow-[4px_4px_0px_0px_#07111A] transition-all">Review →</button>
                </div>
              </div>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">Step 4 of 4</span>
                <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mb-space-xs">Review &amp; Submit</h1>
                <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">Confirm everything looks correct.</p>

                <div className="flex flex-col mb-space-lg">
                  {reviewRows.map(([k, v]) => (
                    <div key={k} className="flex gap-3 py-2 border-b border-primary/10 font-body-sm text-body-sm">
                      <span className="min-w-[120px] shrink-0 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant pt-0.5">{k}</span>
                      <span className="text-on-surface font-medium">{v || '—'}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-space-md border-t border-primary/10">
                  <button onClick={() => goTo(4)} className="bg-transparent border-2 border-primary/20 text-on-surface-variant font-label-md text-label-md uppercase px-space-lg py-space-sm">← Edit</button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-label-md uppercase px-space-xl py-space-sm shadow-[4px_4px_0px_0px_#07111A] transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Submitting…' : 'Submit Inquiry →'}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
