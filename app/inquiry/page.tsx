'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const services = [
  'Basic DJ Package', 'MC / Emcee Services',
  'Ceremony PA System', 'Wireless Microphones',
  'Dance Floor Lighting', 'Extended Hours',
]

const budgets = ['Under $500', '$500 – $1,000', '$1,000 – $2,000', '$2,000+', 'Not sure yet']

export default function InquiryPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    event_date: '',
    event_start_time: '',
    event_end_time: '',
    venue_name: '',
    venue_address: '',
    event_type: '',
    expected_attendance: '',
    indoor_outdoor: '',
    services_requested: [] as string[],
    budget_range: '',
    additional_requests: '',
    additional_notes: '',
  })

  function toggleService(s: string) {
    setForm(f => ({
      ...f,
      services_requested: f.services_requested.includes(s)
        ? f.services_requested.filter(x => x !== s)
        : [...f.services_requested, s],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    // Create inquiry
    const { error: inquiryError } = await supabase.from('inquiries').insert({
      client_id: user.id,
      ...form,
      expected_attendance: form.expected_attendance ? parseInt(form.expected_attendance) : null,
    })

    if (inquiryError) { setError(inquiryError.message); setLoading(false); return }

    // Create booking record
    const { error: bookingError } = await supabase.from('bookings').insert({
      client_id: user.id,
      event_date: form.event_date || null,
      venue_name: form.venue_name,
      venue_address: form.venue_address,
      event_type: form.event_type,
      step_inquiry: 'complete',
      step_contract: 'locked',
      step_deposit: 'locked',
      step_planning: 'locked',
      step_consultation: 'locked',
      step_event: 'locked',
    })

    if (bookingError) { setError(bookingError.message); setLoading(false); return }

    router.push('/dashboard')
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <p style={{
          fontFamily: 'Poppins, sans-serif', fontSize: 10,
          letterSpacing: '3px', textTransform: 'uppercase',
          color: '#4FB9AF', marginBottom: 10,
        }}>Step 01</p>
        <h1 style={{
          fontFamily: 'Lora, serif', fontStyle: 'italic',
          fontSize: 32, color: 'white', marginBottom: 10,
        }}>Tell us about your event</h1>
        <p style={{
          fontSize: 14, color: 'rgba(232,224,213,0.55)',
          fontFamily: 'Poppins, sans-serif', lineHeight: 1.6,
        }}>
          Fill out the details below and Garrett will follow up personally to confirm availability and discuss your vision.
          This doesn't lock you in — it's just the start of the conversation.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Event Basics */}
        <section className="pm-card">
          <h2 style={{
            fontFamily: 'Lora, serif', fontSize: 16, color: 'white',
            marginBottom: 20, paddingBottom: 12,
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}>Event Basics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="pm-label">Event Date</label>
              <input className="pm-input" type="date" value={form.event_date} onChange={set('event_date')} />
            </div>
            <div>
              <label className="pm-label">Event Type</label>
              <input className="pm-input" type="text" value={form.event_type} onChange={set('event_type')}
                placeholder="Wedding reception, birthday…" />
            </div>
            <div>
              <label className="pm-label">Start Time</label>
              <input className="pm-input" type="time" value={form.event_start_time} onChange={set('event_start_time')} />
            </div>
            <div>
              <label className="pm-label">End Time</label>
              <input className="pm-input" type="time" value={form.event_end_time} onChange={set('event_end_time')} />
            </div>
          </div>
        </section>

        {/* Venue */}
        <section className="pm-card">
          <h2 style={{
            fontFamily: 'Lora, serif', fontSize: 16, color: 'white',
            marginBottom: 20, paddingBottom: 12,
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}>Venue</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="pm-label">Venue Name</label>
              <input className="pm-input" type="text" value={form.venue_name} onChange={set('venue_name')}
                placeholder="The Grand Ballroom" />
            </div>
            <div>
              <label className="pm-label">Venue Address</label>
              <input className="pm-input" type="text" value={form.venue_address} onChange={set('venue_address')}
                placeholder="123 Main St, Provo, UT 84601" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="pm-label">Expected Attendance</label>
                <input className="pm-input" type="number" value={form.expected_attendance}
                  onChange={set('expected_attendance')} placeholder="Approx. # of guests" />
              </div>
              <div>
                <label className="pm-label">Indoor / Outdoor</label>
                <select className="pm-input" value={form.indoor_outdoor} onChange={set('indoor_outdoor')}>
                  <option value="">Select…</option>
                  <option>Indoor</option>
                  <option>Outdoor</option>
                  <option>Both</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="pm-card">
          <h2 style={{
            fontFamily: 'Lora, serif', fontSize: 16, color: 'white',
            marginBottom: 6, paddingBottom: 12,
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}>Services</h2>
          <p style={{
            fontSize: 12, color: 'rgba(232,224,213,0.4)',
            fontFamily: 'Poppins, sans-serif', marginBottom: 16,
          }}>Select all that apply — pricing will be confirmed by Garrett.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {services.map(s => (
              <label key={s} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                background: form.services_requested.includes(s) ? 'rgba(79,185,175,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${form.services_requested.includes(s) ? 'rgba(79,185,175,0.4)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <input type="checkbox" checked={form.services_requested.includes(s)}
                  onChange={() => toggleService(s)}
                  style={{ accentColor: '#4FB9AF', width: 15, height: 15 }} />
                <span style={{ fontSize: 13, fontFamily: 'Poppins, sans-serif', color: 'rgba(232,224,213,0.85)' }}>{s}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Budget & Notes */}
        <section className="pm-card">
          <h2 style={{
            fontFamily: 'Lora, serif', fontSize: 16, color: 'white',
            marginBottom: 20, paddingBottom: 12,
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}>Budget & Notes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="pm-label">Approximate Budget</label>
              <select className="pm-input" value={form.budget_range} onChange={set('budget_range')}>
                <option value="">Select a range…</option>
                {budgets.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="pm-label">Additional Requests</label>
              <textarea className="pm-input" rows={3} value={form.additional_requests}
                onChange={set('additional_requests')}
                placeholder="Travel distance, extended hours, special accommodations…"
                style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label className="pm-label">Anything Else We Should Know</label>
              <textarea className="pm-input" rows={3} value={form.additional_notes}
                onChange={set('additional_notes')}
                placeholder="Questions, special circumstances, how you heard about us…"
                style={{ resize: 'vertical' }} />
            </div>
          </div>
        </section>

        {error && <div className="pm-error">{error}</div>}

        <button className="btn-primary" type="submit" disabled={loading}
          style={{ alignSelf: 'flex-start', padding: '13px 32px', fontSize: 14 }}>
          {loading ? 'Submitting…' : 'Submit Inquiry →'}
        </button>

        <p style={{
          fontSize: 11, color: 'rgba(232,224,213,0.25)',
          fontFamily: 'Poppins, sans-serif', fontStyle: 'italic',
        }}>
          Submitting this form does not confirm or guarantee booking. Garrett will follow up personally.
        </p>
      </form>
    </div>
  )
}
