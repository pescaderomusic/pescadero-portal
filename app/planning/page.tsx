'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAVY = '#07111A'
const BLUE = '#44BEC7'
const RED      = '#C8202A'
const DISPLAY  = "'freight-display-pro', Georgia, serif"
const CREAM    = '#F5EFE0'
const UI_FONT  = "'futura-pt-condensed', 'Barlow Condensed', sans-serif"
const BODY     = "'inter', system-ui, sans-serif"
const WORDMARK = "'RetroFloral', 'Barlow Condensed', sans-serif"

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 13px', borderRadius: 8,
  border: '1.5px solid #DDD3BC', background: '#fff',
  color: '#1A2D3F', fontSize: 14, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700,
  letterSpacing: '0.07em', textTransform: 'uppercase',
  color: '#4A5E6E', marginBottom: 6,
}

type ItineraryRow = { time: string; description: string }

export default function PlanningPage() {
  const router = useRouter()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]       = useState('')

  const [contactName,  setContactName]  = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactRole,  setContactRole]  = useState('')
  const [setupNotes,   setSetupNotes]   = useState('')
  const [expectations, setExpectations] = useState('')
  const [itinerary, setItinerary] = useState<ItineraryRow[]>([
    { time: '', description: '' },
    { time: '', description: '' },
    { time: '', description: '' },
    { time: '', description: '' },
    { time: '', description: '' },
    { time: '', description: '' },
  ])
  const [firstDanceSong,          setFirstDanceSong]          = useState('')
  const [firstDanceArtist,        setFirstDanceArtist]        = useState('')
  const [fatherDaughterSong,      setFatherDaughterSong]      = useState('')
  const [fatherDaughterArtist,    setFatherDaughterArtist]    = useState('')
  const [motherSonSong,           setMotherSonSong]           = useState('')
  const [motherSonArtist,         setMotherSonArtist]         = useState('')
  const [specialRequests,         setSpecialRequests]         = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      supabase.from('bookings').select('*').eq('client_id', user.id).single()
        .then(async ({ data }) => {
          setBooking(data)
          setLoading(false)
          if (data?.step_planning === 'submitted') setSubmitted(true)
          const { data: draft } = await supabase.from('planning_forms').select('*').eq('client_id', user.id).single()
          if (draft && data?.step_planning !== 'submitted') {
            if (draft.day_of_contact_name)    setContactName(draft.day_of_contact_name)
            if (draft.day_of_contact_phone)   setContactPhone(draft.day_of_contact_phone)
            if (draft.day_of_contact_role)    setContactRole(draft.day_of_contact_role)
            if (draft.venue_setup_notes)      setSetupNotes(draft.venue_setup_notes)
            if (draft.garrett_expectations)   setExpectations(draft.garrett_expectations)
            if (draft.itinerary?.length)      setItinerary(draft.itinerary)
            if (draft.first_dance_song)       setFirstDanceSong(draft.first_dance_song)
            if (draft.first_dance_artist)     setFirstDanceArtist(draft.first_dance_artist)
            if (draft.father_daughter_song)   setFatherDaughterSong(draft.father_daughter_song)
            if (draft.father_daughter_artist) setFatherDaughterArtist(draft.father_daughter_artist)
            if (draft.mother_son_song)        setMotherSonSong(draft.mother_son_song)
            if (draft.mother_son_artist)      setMotherSonArtist(draft.mother_son_artist)
            if (draft.special_requests)       setSpecialRequests(draft.special_requests)
          }
          try {
            const saved = localStorage.getItem('pescadero_planning')
            if (saved && data?.step_planning !== 'submitted') {
              const d = JSON.parse(saved)
              if (d.contactName)        setContactName(d.contactName)
              if (d.contactPhone)       setContactPhone(d.contactPhone)
              if (d.contactRole)        setContactRole(d.contactRole)
              if (d.setupNotes)         setSetupNotes(d.setupNotes)
              if (d.expectations)       setExpectations(d.expectations)
              if (d.itinerary?.length)  setItinerary(d.itinerary)
              if (d.firstDanceSong)     setFirstDanceSong(d.firstDanceSong)
              if (d.firstDanceArtist)   setFirstDanceArtist(d.firstDanceArtist)
              if (d.fatherDaughterSong) setFatherDaughterSong(d.fatherDaughterSong)
              if (d.fatherDaughterArtist) setFatherDaughterArtist(d.fatherDaughterArtist)
              if (d.motherSonSong)      setMotherSonSong(d.motherSonSong)
              if (d.motherSonArtist)    setMotherSonArtist(d.motherSonArtist)
              if (d.specialRequests)    setSpecialRequests(d.specialRequests)
            }
          } catch(e) {}
        })
    })
  }, [router])

  const addRow = () => setItinerary(r => [...r, { time: '', description: '' }])
  const updateRow = (i: number, key: keyof ItineraryRow, val: string) =>
    setItinerary(r => r.map((row, idx) => idx === i ? { ...row, [key]: val } : row))

  const saveToLocal = () => {
    try {
      localStorage.setItem('pescadero_planning', JSON.stringify({
        contactName, contactPhone, contactRole, setupNotes, expectations,
        itinerary, firstDanceSong, firstDanceArtist, fatherDaughterSong,
        fatherDaughterArtist, motherSonSong, motherSonArtist, specialRequests,
      }))
    } catch(e) {}
  }

  const saveDraft = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !booking) return
      await supabase.from('planning_forms').upsert({
        client_id:              user.id,
        booking_id:             booking.id,
        day_of_contact_name:    contactName,
        day_of_contact_phone:   contactPhone,
        day_of_contact_role:    contactRole,
        venue_setup_notes:      setupNotes,
        garrett_expectations:   expectations,
        itinerary:              itinerary.filter(r => r.time || r.description),
        first_dance_song:       firstDanceSong,
        first_dance_artist:     firstDanceArtist,
        father_daughter_song:   fatherDaughterSong,
        father_daughter_artist: fatherDaughterArtist,
        mother_son_song:        motherSonSong,
        mother_son_artist:      motherSonArtist,
        special_requests:       specialRequests,
      }, { onConflict: 'client_id' })
      saveToLocal()
    } catch(e) { console.error('Draft save error:', e) }
  }

  const handleSubmit = async () => {
    if (!contactName || !contactPhone) {
      setError('Day-of contact name and phone are required.')
      return
    }
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const filledItinerary = itinerary.filter(r => r.time || r.description)

    const { error: err } = await supabase.from('planning_forms').upsert({
      client_id:              user.id,
      booking_id:             booking?.id,
      day_of_contact_name:    contactName,
      day_of_contact_phone:   contactPhone,
      day_of_contact_role:    contactRole,
      venue_setup_notes:      setupNotes,
      garrett_expectations:   expectations,
      itinerary:              filledItinerary,
      first_dance_song:       firstDanceSong,
      first_dance_artist:     firstDanceArtist,
      father_daughter_song:   fatherDaughterSong,
      father_daughter_artist: fatherDaughterArtist,
      mother_son_song:        motherSonSong,
      mother_son_artist:      motherSonArtist,
      special_requests:       specialRequests,
      submitted_at:           new Date().toISOString(),
    }, { onConflict: 'client_id' })

    if (err) { setError('Failed to submit. Please try again.'); setSaving(false); return }

    await supabase.from('bookings').update({ step_planning: 'submitted' }).eq('client_id', user.id)

    await fetch('/api/admin/notify-planning-submitted', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: user.id }),
    }).catch(() => {})

    try { localStorage.removeItem('pescadero_planning') } catch(e) {}
    setSubmitted(true)
    setSaving(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(245,239,224,0.4)', fontFamily: BODY }}>Loading…</p>
    </div>
  )

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BODY }}>
      <div style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #44BEC7, #37A8B0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 30px rgba(68,190,199,0.35)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style={{ margin: '0 0 12px', fontFamily: DISPLAY, fontSize: 28, fontWeight: 300, color: CREAM }}>Planning Form Submitted!</h2>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>Garrett has everything he needs. Your final payment window will open soon.</p>
        <button onClick={() => router.push('/dashboard')} style={{ padding: '12px 28px', borderRadius: 9, background: RED, color: 'white', border: 'none', fontSize: 13, fontFamily: UI_FONT, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer' }}>
          Back to Dashboard →
        </button>
      </div>
    </div>
  )

  const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'
  const isGarrett = booking?.client_id === GARRETT_ID
  if (!isGarrett && (!booking || booking.step_planning === 'locked')) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BODY }}>
      <div style={{ textAlign: 'center', padding: '40px 24px' }}>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Your planning form isn't available yet. Garrett will send it after your deposit is confirmed.</p>
        <button onClick={() => router.push('/dashboard')} style={{ padding: '10px 24px', borderRadius: 8, background: 'rgba(245,239,224,0.06)', color: 'rgba(245,239,224,0.45)', border: 'none', fontSize: 12, fontFamily: UI_FONT, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer' }}>← Back to Dashboard</button>
      </div>
    </div>
  )

  const eventDate = booking.event_date ? new Date(booking.event_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''

  return (
    <div style={{ minHeight: '100vh', background: '#f5f0ea', fontFamily: BODY }}>
      <style>{`
        @media (max-width: 640px) {
          .pf-two-col { grid-template-columns: 1fr !important; }
          .pf-header-row { flex-direction: column !important; gap: 6px !important; }
          .pf-header-right { text-align: left !important; }
          .pf-itinerary-row { grid-template-columns: 100px 1fr !important; }
          .pf-doc-padding { padding: 20px 18px !important; }
          .pf-header-padding { padding: 20px 20px !important; }
          .pf-outer-padding { padding: 16px 12px 60px !important; }
        }
      `}</style>

      {/* Nav */}
      <div className="no-print" style={{ background: NAVY, padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={async () => { await saveDraft(); router.push('/dashboard') }} style={{ background: 'none', border: 'none', color: 'rgba(245,239,224,0.4)', fontSize: 12, fontFamily: UI_FONT, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer' }}>← Save & Exit</button>
        <span style={{ fontFamily: WORDMARK, fontSize: 13, letterSpacing: '3px', textTransform: 'uppercase', color: CREAM }}>Pescadero Music</span>
        <button onClick={() => window.print()} style={{ background: 'none', border: '1px solid rgba(68,190,199,0.4)', borderRadius: 6, color: BLUE, fontSize: 11, fontFamily: UI_FONT, letterSpacing: '1.5px', padding: '5px 12px', cursor: 'pointer' }}>🖨 Print</button>
      </div>

      <div className="pf-outer-padding" style={{ maxWidth: 780, margin: '0 auto', padding: '28px 16px 80px' }}>
        <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.08)' }}>

          {/* Header */}
          <div className="pf-header-padding" style={{ background: NAVY, padding: '24px 28px' }}>
            <div className="pf-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontFamily: WORDMARK, fontSize: 16, letterSpacing: '3px', textTransform: 'uppercase', color: CREAM }}>Pescadero Music</p>
                <p style={{ margin: 0, fontSize: 12, color: BLUE }}>Event Planning Form</p>
              </div>
              <div className="pf-header-right" style={{ textAlign: 'right' }}>
                {eventDate && <p style={{ margin: '0 0 2px', fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{eventDate}</p>}
                {booking.venue_name && <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{booking.venue_name}</p>}
              </div>
            </div>
          </div>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${BLUE}, ${RED})` }} />

          <div className="pf-doc-padding" style={{ padding: '28px 28px' }}>

            {error && <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(200,32,42,0.08)', border: '1px solid rgba(200,32,42,0.2)', color: RED, fontSize: 13, marginBottom: 24 }}>{error}</div>}

            {/* Day-of Contact */}
            <Section title="Day-of Contact" subtitle="Who should Garrett coordinate with on the day of the event?">
              <div className="pf-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Name <span style={{ color: RED }}>*</span></label>
                  <input style={inputStyle} value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Full name" />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Phone <span style={{ color: RED }}>*</span></label>
                  <input style={inputStyle} value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="(801) 555-5555" />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Role / Relationship</label>
                <input style={inputStyle} value={contactRole} onChange={e => setContactRole(e.target.value)} placeholder="e.g. Planner, Maid of Honor, Father of the Bride" />
              </div>
            </Section>

            {/* Venue & Setup */}
            <Section title="Venue & Setup" subtitle="Help Garrett understand the space and where to set up.">
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Setup Location & Layout Notes</label>
                <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} value={setupNotes} onChange={e => setSetupNotes(e.target.value)} placeholder="e.g. Ceremony on the back lawn near the gazebo. Reception in the main ballroom. DJ table goes in the far left corner near the dance floor. Power outlets are behind the stage curtain." />
              </div>
            </Section>

            {/* Garrett's Role */}
            <Section title="Garrett's Role & Expectations" subtitle="What would you like Garrett to handle as MC? List any specific announcements, introductions, or important notes.">
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>MC Duties & Special Instructions</label>
                <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={expectations} onChange={e => setExpectations(e.target.value)} placeholder="e.g. Please announce the wedding party introductions with the names listed below. Pause music during toasts. Keep energy up between dinner and dancing." />
              </div>
            </Section>

            {/* Itinerary */}
            <Section title="Event Itinerary" subtitle="List the timeline of events. Use the description for exact timing cues, announcements, or MC script prompts.">
              <div className="pf-itinerary-row" style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '0 12px', marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#8A9EAA' }}>Time</span>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#8A9EAA' }}>Description / MC Cue</span>
              </div>
              {itinerary.map((row, i) => (
                <div key={i} className="pf-itinerary-row" style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '0 12px', marginBottom: 10 }}>
                  <input
                    style={inputStyle}
                    type="time"
                    value={row.time}
                    onChange={e => updateRow(i, 'time', e.target.value)}
                  />
                  <input
                    style={inputStyle}
                    value={row.description}
                    onChange={e => updateRow(i, 'description', e.target.value)}
                    placeholder={i === 0 ? 'e.g. Guests arrive / background music begins' : i === 1 ? 'e.g. Ceremony begins' : 'Add event or cue…'}
                  />
                </div>
              ))}
              <button className="no-print" onClick={addRow} style={{ background: 'none', border: '1px dashed #DDD3BC', borderRadius: 7, color: '#8A9EAA', fontSize: 11, fontFamily: UI_FONT, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '7px 16px', cursor: 'pointer', marginTop: 4 }}>
                + Add Row
              </button>
            </Section>

            {/* Key Songs */}
            <Section title="Key Songs" subtitle="Song title and artist for your three featured dances.">
              {[
                { label: 'First Dance', song: firstDanceSong, setSong: setFirstDanceSong, artist: firstDanceArtist, setArtist: setFirstDanceArtist },
                { label: 'Father-Daughter Dance', song: fatherDaughterSong, setSong: setFatherDaughterSong, artist: fatherDaughterArtist, setArtist: setFatherDaughterArtist },
                { label: 'Mother-Son Dance', song: motherSonSong, setSong: setMotherSonSong, artist: motherSonArtist, setArtist: setMotherSonArtist },
              ].map(({ label, song, setSong, artist, setArtist }) => (
                <div key={label} style={{ marginBottom: 20 }}>
                  <p style={{ margin: '0 0 8px', fontFamily: UI_FONT, fontSize: 13, fontWeight: 500, letterSpacing: '1px', color: '#1A2D3F' }}>{label}</p>
                  <div className="pf-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                    <div>
                      <label style={labelStyle}>Song Title</label>
                      <input style={inputStyle} value={song} onChange={e => setSong(e.target.value)} placeholder="Song title" />
                    </div>
                    <div style={{ marginTop: 0 }}>
                      <label style={labelStyle}>Artist</label>
                      <input style={inputStyle} value={artist} onChange={e => setArtist(e.target.value)} placeholder="Artist name" />
                    </div>
                  </div>
                </div>
              ))}
            </Section>

            {/* Special Requests */}
            <Section title="Special Requests & Notes" subtitle="Anything else Garrett should know before your event.">
              <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} placeholder="Any additional notes, requests, or important information…" />
            </Section>

            {/* Submit */}
            <div className="no-print" style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #EAE0CC' }}>
              <button onClick={handleSubmit} disabled={saving} style={{ width: '100%', padding: '14px 36px', borderRadius: 10, background: saving ? 'rgba(200,32,42,0.5)' : RED, color: 'white', border: 'none', fontSize: 13, fontFamily: UI_FONT, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 20px rgba(200,32,42,0.3)' }}>
                {saving ? 'Submitting…' : 'Submit Planning Form →'}
              </button>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          div[style*="background: #f5f0ea"] { background: white !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid #EAE0CC' }}>
        <h3 style={{ margin: '0 0 3px', fontFamily: UI_FONT, fontSize: 14, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#07111A' }}>{title}</h3>
        <p style={{ margin: 0, fontSize: 12, color: '#8A9EAA', lineHeight: 1.5 }}>{subtitle}</p>
      </div>
      {children}
    </div>
  )
}
