'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const NAVY = '#0D1B2A'
const BLUE = '#44BEC7'
const RED  = '#D62828'

const DAYS_OF_WEEK = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function fmt12(hour: number) {
  const h = hour % 12 || 12
  return `${h}:00 ${hour < 12 ? 'AM' : 'PM'}`
}

export default function ConsultationPage() {
  const router = useRouter()
  const [availability, setAvailability] = useState<any[]>([])
  const [booking, setBooking]           = useState<any>(null)
  const [loading, setLoading]           = useState(true)
  const [userId, setUserId]             = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [notes, setNotes]               = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [done, setDone]                 = useState(false)
  const [alreadyRequested, setAlreadyRequested] = useState(false)
  const [viewMonth, setViewMonth]       = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      const [{ data: avail }, { data: book }, { data: existing }] = await Promise.all([
        supabase.from('availability').select('*').eq('active', true).order('day'),
        supabase.from('bookings').select('*').eq('client_id', user.id).single(),
        supabase.from('consultation_requests').select('id,status').eq('client_id', user.id).in('status', ['pending','accepted']).limit(1),
      ])
      setAvailability(avail || [])
      setBooking(book)
      if (existing && existing.length > 0) setAlreadyRequested(true)
      setLoading(false)
    })
  }, [router])

  // Check if a date is available
  const isAvailable = (date: Date) => {
    const now = new Date()
    now.setHours(0,0,0,0)
    if (date <= now) return false
    const dayOfWeek = date.getDay()
    return availability.some(a => a.day === dayOfWeek)
  }

  // Build calendar grid for current view month
  const buildCalendar = () => {
    const { year, month } = viewMonth
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: (Date | null)[] = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
    return cells
  }

  const toDateStr = (d: Date) => d.toISOString().split('T')[0]

  const getTimeSlots = () => {
    if (!selectedDate) return []
    const dow = new Date(selectedDate + 'T12:00:00').getDay()
    const avail = availability.find(a => a.day === dow)
    if (!avail) return []
    const slots = []
    for (let h = avail.start_hour; h < avail.end_hour; h++) slots.push(fmt12(h))
    return slots
  }

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return
    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from('consultation_requests').insert({
      client_id: userId, booking_id: booking?.id,
      requested_date: selectedDate, requested_time: selectedTime,
      notes: notes.trim() || null, status: 'pending',
    })
    if (!error) {
      fetch('/api/notify/consultation-request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: userId, date: selectedDate, time: selectedTime }),
      }).catch(() => {})
      setDone(true)
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Poppins, sans-serif' }}>Loading…</p>
    </div>
  )

  if (done) return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', padding: 24 }}>
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
        <h2 style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 26, color: 'white', margin: '0 0 12px' }}>Request Sent!</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: '0 0 8px' }}>
          Your request for <strong style={{ color: BLUE }}>{selectedTime} on {new Date(selectedDate! + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong> has been sent to Garrett.
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '0 0 28px' }}>He'll confirm via your preferred contact method shortly.</p>
        <Link href="/dashboard" style={{ padding: '12px 28px', borderRadius: 8, background: RED, color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
          Back to Dashboard →
        </Link>
      </div>
    </div>
  )

  if (alreadyRequested) return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', padding: 24 }}>
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>📞</div>
        <h2 style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 24, color: 'white', margin: '0 0 12px' }}>Request Already Submitted</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: '0 0 28px' }}>
          You already have a pending request. Garrett will reach out to confirm. Need to change it? Email <a href="mailto:garrett@pescaderomusic.com" style={{ color: BLUE }}>garrett@pescaderomusic.com</a>.
        </p>
        <Link href="/dashboard" style={{ padding: '12px 28px', borderRadius: 8, background: RED, color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
          Back to Dashboard →
        </Link>
      </div>
    </div>
  )

  const cells = buildCalendar()
  const { year, month } = viewMonth
  const now = new Date()
  const canGoPrev = !(year === now.getFullYear() && month === now.getMonth())

  const prevMonth = () => setViewMonth(v => {
    const d = new Date(v.year, v.month - 1, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const nextMonth = () => setViewMonth(v => {
    const d = new Date(v.year, v.month + 1, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const timeSlots = getTimeSlots()

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, fontFamily: 'Poppins, sans-serif' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,24,40,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(68,190,199,0.12)', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '3px', color: BLUE, textTransform: 'uppercase' }}>PESCADERO MUSIC</span>
        <Link href="/dashboard" style={{ fontSize: 11, color: 'rgba(232,224,213,0.4)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}>← Dashboard</Link>
      </nav>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '36px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ margin: '0 0 8px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>Step 02 — Initial Consultation</p>
          <h1 style={{ margin: '0 0 10px', fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 28, color: 'white' }}>Request a Call</h1>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
            Pick a day and time. Garrett will confirm and initiate the call.
          </p>
        </div>

        {/* Calendar */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>

          {/* Month header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <button onClick={prevMonth} disabled={!canGoPrev} style={{ background: 'none', border: 'none', color: canGoPrev ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)', fontSize: 18, cursor: canGoPrev ? 'pointer' : 'default', padding: '4px 10px', borderRadius: 6 }}>‹</button>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'white' }}>{MONTHS[month]} {year}</p>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 18, cursor: 'pointer', padding: '4px 10px', borderRadius: 6 }}>›</button>
          </div>

          {/* Day labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '10px 12px 4px' }}>
            {DAYS_OF_WEEK.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.5px', paddingBottom: 6 }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, padding: '0 12px 14px' }}>
            {cells.map((date, i) => {
              if (!date) return <div key={i} />
              const avail   = isAvailable(date)
              const dateStr = toDateStr(date)
              const selected = selectedDate === dateStr
              const isToday  = toDateStr(date) === toDateStr(new Date())

              return (
                <button
                  key={i}
                  disabled={!avail}
                  onClick={() => { setSelectedDate(dateStr); setSelectedTime(null) }}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 8,
                    border: selected ? `2px solid ${RED}` : isToday ? `1px solid rgba(68,190,199,0.4)` : '1px solid transparent',
                    background: selected ? RED : avail ? 'rgba(68,190,199,0.12)' : 'transparent',
                    color: selected ? 'white' : avail ? BLUE : 'rgba(255,255,255,0.2)',
                    fontWeight: avail ? 700 : 400,
                    fontSize: 13,
                    cursor: avail ? 'pointer' : 'default',
                    fontFamily: 'Poppins, sans-serif',
                    transition: 'all 0.1s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(68,190,199,0.2)', border: `1px solid ${BLUE}` }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Available</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: RED }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Selected</span>
            </div>
          </div>
        </div>

        {/* Time picker */}
        {selectedDate && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px', marginBottom: 16 }}>
            <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>2. Pick a Time</p>
            <p style={{ margin: '0 0 14px', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {timeSlots.map(t => (
                <button key={t} onClick={() => setSelectedTime(t)} style={{ padding: '9px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, border: `1px solid ${selectedTime === t ? RED : 'rgba(255,255,255,0.12)'}`, background: selectedTime === t ? RED : 'rgba(255,255,255,0.04)', color: selectedTime === t ? 'white' : 'rgba(255,255,255,0.6)', fontFamily: 'Poppins, sans-serif', transition: 'all 0.15s' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {selectedTime && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px', marginBottom: 20 }}>
            <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>3. Anything Garrett Should Know? (Optional)</p>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Questions, event details, anything on your mind…" style={{ width: '100%', height: 80, padding: '11px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 13, fontFamily: 'Poppins, sans-serif', resize: 'vertical', outline: 'none', boxSizing: 'border-box' as const }} />
          </div>
        )}

        {/* Submit */}
        {selectedDate && selectedTime && (
          <button onClick={handleSubmit} disabled={submitting} style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: submitting ? 'rgba(214,40,40,0.5)' : RED, color: 'white', fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Poppins, sans-serif', boxShadow: submitting ? 'none' : '0 4px 24px rgba(214,40,40,0.35)' }}>
            {submitting ? 'Submitting…' : `Request Call — ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${selectedTime} →`}
          </button>
        )}

        {availability.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>No availability set yet. Email <a href="mailto:garrett@pescaderomusic.com" style={{ color: BLUE }}>garrett@pescaderomusic.com</a> to schedule directly.</p>
          </div>
        )}
      </div>
    </div>
  )
}
