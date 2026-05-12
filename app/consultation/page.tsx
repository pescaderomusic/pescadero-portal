'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const NAVY = '#0D1B2A'
const BLUE = '#44BEC7'
const RED  = '#D62828'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function fmt12(hour: number) {
  const h = hour % 12 || 12
  return `${h}:00 ${hour < 12 ? 'AM' : 'PM'}`
}

export default function ConsultationPage() {
  const router = useRouter()
  const [availability, setAvailability] = useState<any[]>([])
  const [booking, setBooking]           = useState<any>(null)
  const [loading, setLoading]           = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [notes, setNotes]               = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [done, setDone]                 = useState(false)
  const [alreadyRequested, setAlreadyRequested] = useState(false)
  const [userId, setUserId]             = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      const [{ data: avail }, { data: book }, { data: existing }] = await Promise.all([
        supabase.from('availability').select('*').eq('active', true).order('day'),
        supabase.from('bookings').select('*').eq('client_id', user.id).single(),
        supabase.from('consultation_requests').select('id, status').eq('client_id', user.id).in('status', ['pending', 'accepted']).limit(1),
      ])

      setAvailability(avail || [])
      setBooking(book)
      if (existing && existing.length > 0) setAlreadyRequested(true)
      setLoading(false)
    })
  }, [router])

  // Build next 4 weeks of available dates
  const availableDates = () => {
    const dates: { date: string; dayOfWeek: number; label: string }[] = []
    const now = new Date()
    for (let i = 1; i <= 28; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() + i)
      const dow = d.getDay()
      if (availability.some(a => a.day === dow)) {
        dates.push({
          date: d.toISOString().split('T')[0],
          dayOfWeek: dow,
          label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        })
      }
    }
    return dates
  }

  // Get time slots for selected date
  const timeSlots = () => {
    if (!selectedDate) return []
    const dow = new Date(selectedDate + 'T12:00:00').getDay()
    const avail = availability.find(a => a.day === dow)
    if (!avail) return []
    const slots = []
    for (let h = avail.start_hour; h < avail.end_hour; h++) {
      slots.push(fmt12(h))
    }
    return slots
  }

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !userId || !booking) return
    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from('consultation_requests').insert({
      client_id: userId,
      booking_id: booking.id,
      requested_date: selectedDate,
      requested_time: selectedTime,
      notes: notes.trim() || null,
      status: 'pending',
    })
    if (!error) {
      // Notify via API
      await fetch('/api/notify/consultation-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: userId, date: selectedDate, time: selectedTime }),
      }).catch(() => {}) // fire and forget
      setDone(true)
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Poppins, sans-serif' }}>Loading availability…</p>
    </div>
  )

  if (done) return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', padding: 24 }}>
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
        <h2 style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 26, color: 'white', margin: '0 0 12px' }}>Request Sent!</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: '0 0 8px' }}>
          Your consultation request for <strong style={{ color: BLUE }}>{selectedTime} on {new Date(selectedDate! + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong> has been sent to Garrett.
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '0 0 28px' }}>
          He'll confirm via your preferred contact method shortly. You'll receive a text or email once it's confirmed.
        </p>
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
          You already have a consultation request pending. Garrett will reach out to confirm your call time. If you need to change it, email <a href="mailto:garrett@pescaderomusic.com" style={{ color: BLUE }}>garrett@pescaderomusic.com</a>.
        </p>
        <Link href="/dashboard" style={{ padding: '12px 28px', borderRadius: 8, background: RED, color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
          Back to Dashboard →
        </Link>
      </div>
    </div>
  )

  const dates = availableDates()

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, fontFamily: 'Poppins, sans-serif' }}>

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,24,40,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(68,190,199,0.12)', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '3px', color: BLUE, textTransform: 'uppercase' }}>PESCADERO MUSIC</span>
        <Link href="/dashboard" style={{ fontSize: 11, color: 'rgba(232,224,213,0.4)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}>← Dashboard</Link>
      </nav>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '36px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>Step 02 — Initial Consultation</p>
          <h1 style={{ margin: '0 0 12px', fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 28, color: 'white' }}>Request a Call</h1>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Pick a day and time that works for you. Garrett will confirm the call and reach out to you directly — he'll be the one initiating.
          </p>
        </div>

        {/* Step 1: Pick a date */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '22px 24px', marginBottom: 16 }}>
          <p style={{ margin: '0 0 16px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
            1. Choose a Date
          </p>

          {dates.length === 0 ? (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
              No availability set yet — Garrett will reach out directly to schedule.
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {dates.map(d => (
                <button key={d.date} onClick={() => { setSelectedDate(d.date); setSelectedTime(null) }} style={{
                  padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  border: `1px solid ${selectedDate === d.date ? BLUE : 'rgba(255,255,255,0.1)'}`,
                  background: selectedDate === d.date ? 'rgba(68,190,199,0.15)' : 'rgba(255,255,255,0.04)',
                  color: selectedDate === d.date ? BLUE : 'rgba(255,255,255,0.55)',
                  transition: 'all 0.15s', fontFamily: 'Poppins, sans-serif',
                }}>
                  {d.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Pick a time */}
        {selectedDate && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '22px 24px', marginBottom: 16 }}>
            <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
              2. Choose a Time
            </p>
            <p style={{ margin: '0 0 14px', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {timeSlots().map(t => (
                <button key={t} onClick={() => setSelectedTime(t)} style={{
                  padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  border: `1px solid ${selectedTime === t ? BLUE : 'rgba(255,255,255,0.1)'}`,
                  background: selectedTime === t ? 'rgba(68,190,199,0.15)' : 'rgba(255,255,255,0.04)',
                  color: selectedTime === t ? BLUE : 'rgba(255,255,255,0.55)',
                  fontFamily: 'Poppins, sans-serif',
                }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Notes */}
        {selectedTime && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '22px 24px', marginBottom: 20 }}>
            <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
              3. Anything Garrett Should Know Before the Call? (Optional)
            </p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Questions you have, details about your event, anything on your mind…"
              style={{ width: '100%', height: 90, padding: '11px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 13, fontFamily: 'Poppins, sans-serif', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        )}

        {/* Submit */}
        {selectedDate && selectedTime && (
          <button onClick={handleSubmit} disabled={submitting} style={{
            width: '100%', padding: '14px', borderRadius: 10, border: 'none',
            background: submitting ? 'rgba(214,40,40,0.5)' : RED,
            color: 'white', fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
            fontFamily: 'Poppins, sans-serif',
            boxShadow: submitting ? 'none' : '0 4px 24px rgba(214,40,40,0.35)',
          }}>
            {submitting ? 'Submitting…' : `Request Call — ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${selectedTime} →`}
          </button>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
          Garrett will confirm via your preferred contact method. He initiates the call.
        </p>
      </div>
    </div>
  )
}
