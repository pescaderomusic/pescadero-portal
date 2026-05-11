'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const NAVY = '#0D1B2A'
const BLUE = '#44BEC7'
const RED  = '#D62828'

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 8,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'white', fontSize: 13, fontFamily: 'Poppins, sans-serif',
  outline: 'none', boxSizing: 'border-box' as const,
}
const labelStyle = {
  display: 'block' as const, fontSize: 10, fontWeight: 600 as const,
  letterSpacing: '1.5px', textTransform: 'uppercase' as const,
  color: BLUE, marginBottom: 6, fontFamily: 'Poppins, sans-serif',
}
const sectionStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 12, padding: '24px', marginBottom: 20,
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

export default function PlanningPage() {
  const router = useRouter()
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [error, setError]         = useState('')
  const [booking, setBooking]     = useState<any>(null)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    // Event timeline
    ceremony_time: '',
    cocktail_hour_time: '',
    reception_start: '',
    grand_entrance_time: '',
    first_dance_time: '',
    dinner_time: '',
    cake_cutting_time: '',
    last_dance_time: '',
    end_time: '',
    // Key songs
    ceremony_song: '',
    first_dance_song: '',
    father_daughter_song: '',
    mother_son_song: '',
    cake_cutting_song: '',
    last_dance_song: '',
    // Music preferences
    genres: '',
    must_play: '',
    do_not_play: '',
    vibe: '',
    // MC announcements
    mc_needed: 'no',
    mc_notes: '',
    // Vendors
    photographer: '',
    videographer: '',
    coordinator: '',
    catering: '',
    // Additional
    special_moments: '',
    additional_notes: '',
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      const { data: b } = await supabase.from('bookings').select('*').eq('client_id', user.id).single()
      setBooking(b)
      if (b?.step_planning === 'submitted') setSubmitted(true)
      // Load existing planning data if any
      const { data: existing } = await supabase
        .from('planning_forms')
        .select('*')
        .eq('client_id', user.id)
        .single()
      if (existing) {
        setForm(f => ({ ...f, ...existing }))
        setSubmitted(true)
      }
      setLoading(false)
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Upsert planning form data
    const { error: upsertErr } = await supabase
      .from('planning_forms')
      .upsert({ client_id: user.id, booking_id: booking?.id, ...form, submitted_at: new Date().toISOString() })

    if (upsertErr) {
      // Table may not exist yet — store in bookings notes as fallback
      setError(`Could not save: ${upsertErr.message}. Please contact Garrett directly.`)
      setSaving(false)
      return
    }

    // Mark step as submitted
    await supabase.from('bookings').update({ step_planning: 'submitted' }).eq('client_id', user.id)

    setSaved(true)
    setSubmitted(true)
    setSaving(false)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Poppins, sans-serif' }}>Loading…</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, fontFamily: 'Poppins, sans-serif' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,24,40,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(68,190,199,0.12)',
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '3px', color: BLUE, textTransform: 'uppercase' }}>
          PESCADERO MUSIC
        </span>
        <Link href="/dashboard" style={{ fontSize: 11, color: 'rgba(232,224,213,0.4)', textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase' }}>
          ← Dashboard
        </Link>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ margin: '0 0 8px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>Step 05</p>
          <h1 style={{ margin: '0 0 8px', fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 28, color: 'white' }}>
            Planning & Music
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(232,224,213,0.5)', lineHeight: 1.6 }}>
            This is everything Garrett needs to make your day perfect — timeline, key moments, music preferences, and vendor contacts. Take your time, you can edit this anytime before your event.
          </p>
        </div>

        {saved && (
          <div style={{ background: 'rgba(68,190,199,0.1)', border: '1px solid rgba(68,190,199,0.3)', borderRadius: 10, padding: '14px 18px', marginBottom: 24, color: BLUE, fontSize: 13 }}>
            ✓ Saved! Taking you back to your dashboard…
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(214,40,40,0.1)', border: '1px solid rgba(214,40,40,0.3)', borderRadius: 10, padding: '14px 18px', marginBottom: 24, color: '#FF8A80', fontSize: 13 }}>
            {error}
          </div>
        )}

        {submitted && !saved && (
          <div style={{ background: 'rgba(68,190,199,0.06)', border: '1px solid rgba(68,190,199,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 12, color: 'rgba(232,224,213,0.5)', display: 'flex', gap: 10 }}>
            <span>✏️</span>
            <span>You've already submitted this form. You can edit and resubmit anytime before your event.</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Timeline */}
          <div style={sectionStyle}>
            <p style={{ margin: '0 0 20px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Event Timeline</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              <Field label="Ceremony Time"><input style={inputStyle} type="time" value={form.ceremony_time} onChange={set('ceremony_time')} /></Field>
              <Field label="Cocktail Hour"><input style={inputStyle} type="time" value={form.cocktail_hour_time} onChange={set('cocktail_hour_time')} /></Field>
              <Field label="Reception Start"><input style={inputStyle} type="time" value={form.reception_start} onChange={set('reception_start')} /></Field>
              <Field label="Grand Entrance"><input style={inputStyle} type="time" value={form.grand_entrance_time} onChange={set('grand_entrance_time')} /></Field>
              <Field label="First Dance"><input style={inputStyle} type="time" value={form.first_dance_time} onChange={set('first_dance_time')} /></Field>
              <Field label="Dinner Service"><input style={inputStyle} type="time" value={form.dinner_time} onChange={set('dinner_time')} /></Field>
              <Field label="Cake Cutting"><input style={inputStyle} type="time" value={form.cake_cutting_time} onChange={set('cake_cutting_time')} /></Field>
              <Field label="Last Dance"><input style={inputStyle} type="time" value={form.last_dance_time} onChange={set('last_dance_time')} /></Field>
              <Field label="End Time"><input style={inputStyle} type="time" value={form.end_time} onChange={set('end_time')} /></Field>
            </div>
          </div>

          {/* Key Songs */}
          <div style={sectionStyle}>
            <p style={{ margin: '0 0 20px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Key Songs</p>
            <p style={{ margin: '-10px 0 16px', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Song title + artist for each moment. Leave blank if not applicable.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              <Field label="Ceremony / Processional"><input style={inputStyle} placeholder="e.g. A Thousand Years – Christina Perri" value={form.ceremony_song} onChange={set('ceremony_song')} /></Field>
              <Field label="First Dance"><input style={inputStyle} placeholder="e.g. Perfect – Ed Sheeran" value={form.first_dance_song} onChange={set('first_dance_song')} /></Field>
              <Field label="Father / Daughter Dance"><input style={inputStyle} value={form.father_daughter_song} onChange={set('father_daughter_song')} /></Field>
              <Field label="Mother / Son Dance"><input style={inputStyle} value={form.mother_son_song} onChange={set('mother_son_song')} /></Field>
              <Field label="Cake Cutting"><input style={inputStyle} value={form.cake_cutting_song} onChange={set('cake_cutting_song')} /></Field>
              <Field label="Last Dance"><input style={inputStyle} value={form.last_dance_song} onChange={set('last_dance_song')} /></Field>
            </div>
          </div>

          {/* Music Preferences */}
          <div style={sectionStyle}>
            <p style={{ margin: '0 0 20px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Music Preferences</p>
            <Field label="Genres / Vibes">
              <input style={inputStyle} placeholder="e.g. Top 40, R&B, country, 80s classics…" value={form.genres} onChange={set('genres')} />
            </Field>
            <Field label="Must-Play Songs">
              <textarea style={{ ...inputStyle, height: 90, resize: 'vertical' }} placeholder="List any songs you definitely want played" value={form.must_play} onChange={set('must_play')} />
            </Field>
            <Field label="Do-Not-Play Songs">
              <textarea style={{ ...inputStyle, height: 70, resize: 'vertical' }} placeholder="Any songs to avoid" value={form.do_not_play} onChange={set('do_not_play')} />
            </Field>
            <Field label="Overall Vibe / Notes for Garrett">
              <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} placeholder="Describe the energy you're going for — chill cocktail hour, high energy reception…" value={form.vibe} onChange={set('vibe')} />
            </Field>
          </div>

          {/* MC */}
          <div style={sectionStyle}>
            <p style={{ margin: '0 0 20px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>MC / Announcements</p>
            <Field label="Will Garrett be making announcements?">
              <select style={inputStyle} value={form.mc_needed} onChange={set('mc_needed')}>
                <option value="yes">Yes — grand entrance, first dance, toasts, etc.</option>
                <option value="no">No — music only</option>
                <option value="some">Some — just a few key moments</option>
              </select>
            </Field>
            <Field label="Announcement Notes">
              <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} placeholder="Any specific names, pronunciation notes, or announcements to include" value={form.mc_notes} onChange={set('mc_notes')} />
            </Field>
          </div>

          {/* Vendors */}
          <div style={sectionStyle}>
            <p style={{ margin: '0 0 20px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Vendor Contacts</p>
            <p style={{ margin: '-10px 0 16px', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Helps Garrett coordinate with your team on the day.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              <Field label="Photographer"><input style={inputStyle} placeholder="Name + phone" value={form.photographer} onChange={set('photographer')} /></Field>
              <Field label="Videographer"><input style={inputStyle} placeholder="Name + phone" value={form.videographer} onChange={set('videographer')} /></Field>
              <Field label="Wedding Coordinator"><input style={inputStyle} placeholder="Name + phone" value={form.coordinator} onChange={set('coordinator')} /></Field>
              <Field label="Catering / Venue Contact"><input style={inputStyle} placeholder="Name + phone" value={form.catering} onChange={set('catering')} /></Field>
            </div>
          </div>

          {/* Special moments + notes */}
          <div style={sectionStyle}>
            <p style={{ margin: '0 0 20px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Anything Else</p>
            <Field label="Special Moments or Surprises">
              <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} placeholder="Flash mobs, surprise songs, special dedications, anything Garrett should know about" value={form.special_moments} onChange={set('special_moments')} />
            </Field>
            <Field label="Additional Notes for Garrett">
              <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} placeholder="Anything else on your mind" value={form.additional_notes} onChange={set('additional_notes')} />
            </Field>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || saved}
            style={{
              width: '100%', padding: '15px', borderRadius: 10, border: 'none',
              background: saving || saved ? 'rgba(214,40,40,0.5)' : RED,
              color: 'white', fontSize: 14, fontWeight: 700,
              cursor: saving || saved ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins, sans-serif',
              boxShadow: saving || saved ? 'none' : '0 4px 24px rgba(214,40,40,0.4)',
            }}
          >
            {saved ? '✓ Saved!' : saving ? 'Saving…' : submitted ? 'Update & Resubmit →' : 'Submit Planning Form →'}
          </button>
        </form>
      </div>
    </div>
  )
}
