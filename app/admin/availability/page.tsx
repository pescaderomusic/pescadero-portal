'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const NAVY = '#0D1B2A'
const BLUE = '#44BEC7'
const RED  = '#D62828'
const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 || 12
  const ampm = i < 12 ? 'AM' : 'PM'
  return { value: i, label: `${h}:00 ${ampm}` }
})

type Slot = { id?: string; day: number; start_hour: number; end_hour: number; active: boolean }

const defaultSlots: Slot[] = [1, 2, 3, 4, 5].map(d => ({ day: d, start_hour: 9, end_hour: 17, active: true }))

export default function AvailabilityPage() {
  const [slots, setSlots]   = useState<Slot[]>(defaultSlots)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user || user.id !== GARRETT_ID) { window.location.href = '/dashboard'; return }
      const { data } = await supabase.from('availability').select('*').order('day')
      if (data && data.length > 0) {
        // Fill in all 7 days
        const loaded = DAYS.map((_, d) => {
          const existing = data.find(r => r.day === d)
          return existing
            ? { id: existing.id, day: d, start_hour: existing.start_hour, end_hour: existing.end_hour, active: existing.active }
            : { day: d, start_hour: 9, end_hour: 17, active: false }
        })
        setSlots(loaded)
      }
      setLoading(false)
    })
  }, [])

  const toggleDay = (day: number) => setSlots(s => s.map(sl => sl.day === day ? { ...sl, active: !sl.active } : sl))
  const updateHour = (day: number, field: 'start_hour' | 'end_hour', val: number) =>
    setSlots(s => s.map(sl => sl.day === day ? { ...sl, [field]: val } : sl))

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    for (const slot of slots) {
      if (slot.id) {
        await supabase.from('availability').update({ start_hour: slot.start_hour, end_hour: slot.end_hour, active: slot.active }).eq('id', slot.id)
      } else {
        const { data } = await supabase.from('availability').insert({ day: slot.day, start_hour: slot.start_hour, end_hour: slot.end_hour, active: slot.active }).select().single()
        if (data) slot.id = data.id
      }
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Poppins, sans-serif' }}>Loading…</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, fontFamily: 'Poppins, sans-serif' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,24,40,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(68,190,199,0.15)', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/admin" style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '3px', color: BLUE, textDecoration: 'none' }}>← ADMIN</Link>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>📅 Set Availability</span>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ background: saved ? 'rgba(76,175,80,0.3)' : RED, border: 'none', borderRadius: 8, color: 'white', padding: '8px 20px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
          {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save Availability'}
        </button>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ margin: '0 0 4px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>Consultation Scheduling</p>
          <h1 style={{ margin: '0 0 8px', fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 24, color: 'white' }}>Set Your Availability</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
            Clients will see these time slots when requesting a consultation call. Toggle days on/off and set your available hours.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {slots.map(slot => (
            <div key={slot.day} style={{
              background: slot.active ? 'rgba(68,190,199,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${slot.active ? 'rgba(68,190,199,0.2)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 10, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              {/* Toggle */}
              <button onClick={() => toggleDay(slot.day)} style={{
                width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: slot.active ? BLUE : 'rgba(255,255,255,0.1)',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: 'white',
                  position: 'absolute', top: 3, left: slot.active ? 21 : 3, transition: 'left 0.2s',
                }} />
              </button>

              {/* Day name */}
              <span style={{ fontSize: 13, fontWeight: 600, color: slot.active ? 'white' : 'rgba(255,255,255,0.3)', width: 100, flexShrink: 0 }}>
                {DAYS[slot.day]}
              </span>

              {/* Hours */}
              {slot.active ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <select value={slot.start_hour} onChange={e => updateHour(slot.day, 'start_hour', Number(e.target.value))} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: 'white', padding: '5px 10px', fontSize: 12, fontFamily: 'Poppins, sans-serif' }}>
                    {HOURS.filter(h => h.value < slot.end_hour).map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                  </select>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>to</span>
                  <select value={slot.end_hour} onChange={e => updateHour(slot.day, 'end_hour', Number(e.target.value))} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: 'white', padding: '5px 10px', fontSize: 12, fontFamily: 'Poppins, sans-serif' }}>
                    {HOURS.filter(h => h.value > slot.start_hour).map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                  </select>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                    ({slot.end_hour - slot.start_hour}h window)
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Unavailable</span>
              )}
            </div>
          ))}
        </div>

        <p style={{ marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
          Changes take effect immediately for new consultation requests.
        </p>
      </div>
    </div>
  )
}
