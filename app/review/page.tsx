'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const NAVY = '#0D1B2A'
const BLUE = '#44BEC7'
const RED  = '#D62828'
const GOLD = '#F5A623'

export default function ReviewPage() {
  const router = useRouter()
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [done, setDone]         = useState(false)
  const [profile, setProfile]   = useState<any>(null)
  const [contract, setContract] = useState<any>(null)
  const [userId, setUserId]     = useState('')
  const [error, setError]       = useState('')

  const [form, setForm] = useState({
    rating: 0,
    testimonial: '',
    photo_release: false,
    use_for_advertising: false,
    referral_name: '',
    referral_phone: '',
    additional_feedback: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      const [{ data: prof }, { data: con }] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', user.id).single(),
        supabase.from('contracts').select('event_type, event_date').eq('client_id', user.id).single(),
      ])
      setProfile(prof)
      setContract(con)
      setLoading(false)
    })
  }, [router])

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.rating === 0) { setError('Please select a star rating.'); return }
    setSaving(true)
    setError('')
    const supabase = createClient()

    const { error: err } = await supabase.from('reviews').insert({
      client_id: userId,
      ...form,
      submitted_at: new Date().toISOString(),
    })

    if (err) {
      setError(`Could not save: ${err.message}`)
      setSaving(false)
      return
    }

    await supabase.from('bookings').update({ step_event: 'complete' }).eq('client_id', userId)
    setDone(true)
    setSaving(false)
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
        <h2 style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 26, color: 'white', margin: '0 0 12px' }}>Thank You!</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: '0 0 28px' }}>
          Your feedback means everything. It was an honor being part of your day — congratulations again! 🎵
        </p>
        <Link href="/dashboard" style={{ padding: '12px 28px', borderRadius: 8, background: RED, color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
          Back to Dashboard →
        </Link>
      </div>
    </div>
  )

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const eventName = contract?.event_type || 'your event'

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 8,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    color: 'white', fontSize: 13, fontFamily: 'Poppins, sans-serif',
    outline: 'none', boxSizing: 'border-box',
  }

  const sectionStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12, padding: '22px 24px', marginBottom: 16,
  }

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, fontFamily: 'Poppins, sans-serif' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,24,40,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(68,190,199,0.12)', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '3px', color: BLUE, textTransform: 'uppercase' }}>PESCADERO MUSIC</span>
        <Link href="/dashboard" style={{ fontSize: 11, color: 'rgba(232,224,213,0.4)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}>← Dashboard</Link>
      </nav>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '36px 24px 80px' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ margin: '0 0 8px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>Post-Event</p>
          <h1 style={{ margin: '0 0 10px', fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 28, color: 'white' }}>How did we do, {firstName}?</h1>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
            We hope {eventName} was everything you dreamed of. Take a moment to share your experience — your feedback means everything to us.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Star rating */}
          <div style={{ ...sectionStyle, textAlign: 'center' }}>
            <p style={{ margin: '0 0 16px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Overall Rating</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              {[1,2,3,4,5].map(star => (
                <button key={star} type="button" onClick={() => set('rating', star)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 40, filter: star <= form.rating ? 'none' : 'grayscale(1) opacity(0.3)', transition: 'filter 0.15s', transform: star <= form.rating ? 'scale(1.1)' : 'scale(1)' }}>
                  ⭐
                </button>
              ))}
            </div>
            {form.rating > 0 && (
              <p style={{ margin: '10px 0 0', fontSize: 12, color: GOLD }}>
                {['','Needs improvement','It was okay','Good!','Great!','Perfect — 10/10!'][form.rating]}
              </p>
            )}
          </div>

          {/* Testimonial */}
          <div style={sectionStyle}>
            <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Tell Us About Your Experience</p>
            <p style={{ margin: '0 0 12px', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>What stood out? What would you tell someone considering Pescadero Music?</p>
            <textarea
              value={form.testimonial}
              onChange={e => set('testimonial', e.target.value)}
              placeholder="Share what your experience was like — what worked, what stood out, and anything you'd want others to know."
              style={{ ...inputStyle, height: 110, resize: 'vertical' }}
            />
          </div>

          {/* Photo release */}
          <div style={sectionStyle}>
            <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Photo & Testimonial Permissions</p>
            {[
              { key: 'photo_release',        label: 'Pescadero Music may use photos from my event for their portfolio and website' },
              { key: 'use_for_advertising',  label: 'My testimonial above may be used in advertising and social media' },
            ].map(({ key, label }) => (
              <label key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14, cursor: 'pointer' }}>
                <div onClick={() => set(key, !(form as any)[key])} style={{ width: 20, height: 20, borderRadius: 5, border: `1px solid ${(form as any)[key] ? BLUE : 'rgba(255,255,255,0.2)'}`, background: (form as any)[key] ? 'rgba(68,190,199,0.2)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, cursor: 'pointer' }}>
                  {(form as any)[key] && <span style={{ color: BLUE, fontSize: 12 }}>✓</span>}
                </div>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{label}</span>
              </label>
            ))}
          </div>

          {/* Referral */}
          <div style={sectionStyle}>
            <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Know Someone Getting Married?</p>
            <p style={{ margin: '0 0 14px', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Totally optional — if you'd like to refer someone, drop their info below.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>Their Name</label>
                <input value={form.referral_name} onChange={e => set('referral_name', e.target.value)} placeholder="Alex & Jordan" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>Their Phone (optional)</label>
                <input value={form.referral_phone} onChange={e => set('referral_phone', e.target.value)} placeholder="(555) 000-0000" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Additional feedback */}
          <div style={sectionStyle}>
            <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Anything Else?</p>
            <textarea value={form.additional_feedback} onChange={e => set('additional_feedback', e.target.value)} placeholder="Suggestions, things we could improve, or anything you'd like us to know…" style={{ ...inputStyle, height: 80, resize: 'vertical' }} />
          </div>

          {error && (
            <div style={{ background: 'rgba(214,40,40,0.1)', border: '1px solid rgba(214,40,40,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#FF8A80', fontSize: 12 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={saving} style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: saving ? 'rgba(214,40,40,0.5)' : RED, color: 'white', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Poppins, sans-serif', boxShadow: saving ? 'none' : '0 4px 24px rgba(214,40,40,0.35)' }}>
            {saving ? 'Submitting…' : 'Submit My Review →'}
          </button>
        </form>
      </div>
    </div>
  )
}
