import { redirect } from 'next/navigation'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const NAVY  = '#0D1B2A'
const BLUE  = '#44BEC7'
const RED   = '#D62828'
const GOLD  = '#F5A623'
const GREEN = '#4CAF50'
const CREAM = '#F5EFE0'
const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  const date = new Date(d.includes('T') ? d : d + 'T12:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtDateTime(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function statusColor(s: string) {
  if (s === 'new') return GOLD
  if (s === 'reviewed') return BLUE
  if (s === 'declined') return RED
  if (s === 'converted') return GREEN
  return 'rgba(255,255,255,0.2)'
}

function statusLabel(s: string) {
  if (s === 'new') return 'New'
  if (s === 'reviewed') return 'Reviewed'
  if (s === 'declined') return 'Declined'
  if (s === 'converted') return 'Booked'
  return s
}

export default async function AdminInquiriesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== GARRETT_ID) redirect('/dashboard')

  const admin = getAdmin()

  const { data: inquiries } = await admin
    .from('inquiry_submissions')
    .select('*')
    .order('submitted_at', { ascending: false })

  const all        = inquiries || []
  const newInqs    = all.filter(i => i.status === 'new')
  const reviewed   = all.filter(i => i.status === 'reviewed')
  const converted  = all.filter(i => i.status === 'converted')
  const declined   = all.filter(i => i.status === 'declined')

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, fontFamily: 'Poppins, sans-serif' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,24,40,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(68,190,199,0.15)', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/admin" style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '3px', color: BLUE, textDecoration: 'none' }}>← PESCADERO ADMIN</Link>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>/ Inquiries</span>
        </div>
        <Link href="/dashboard?client=true" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '5px 12px' }}>
          Switch to Client View →
        </Link>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: '0 0 4px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>Admin</p>
          <h1 style={{ margin: '0 0 6px', fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 28, color: 'white' }}>
            Inquiries
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            {all.length} total · {newInqs.length} new
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
          {[
            { label: 'New',      value: newInqs.length,   color: GOLD,  icon: '📥' },
            { label: 'Reviewed', value: reviewed.length,  color: BLUE,  icon: '👀' },
            { label: 'Booked',   value: converted.length, color: GREEN, icon: '✅' },
            { label: 'Declined', value: declined.length,  color: RED,   icon: '❌' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div>
                <p style={{ margin: '0 0 3px', fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {all.length === 0 && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📥</div>
            <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>No inquiries yet.</p>
            <p style={{ margin: '8px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>New submissions from the homepage will appear here.</p>
          </div>
        )}

        {/* Inquiry list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {all.map(inq => {
            const name = `${inq.first_name || ''} ${inq.last_name || ''}`.trim() || inq.couple_names || inq.email || 'Unknown'
            const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
            const services = Array.isArray(inq.services_requested) ? inq.services_requested : []

            return (
              <div key={inq.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `3px solid ${statusColor(inq.status)}`, borderRadius: 12, overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD}, ${BLUE})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'white', fontFamily: 'Lora, serif' }}>{name}</p>
                      {inq.couple_names && inq.couple_names !== name && (
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>({inq.couple_names})</span>
                      )}
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${statusColor(inq.status)}15`, border: `1px solid ${statusColor(inq.status)}35`, color: statusColor(inq.status) }}>
                        {statusLabel(inq.status)}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                      {fmtDateTime(inq.submitted_at)} · {inq.email || '—'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {inq.client_id && (
                      <Link href={`/admin/client/${inq.client_id}`} style={{ fontSize: 10, color: BLUE, textDecoration: 'none', border: `1px solid ${BLUE}30`, borderRadius: 5, padding: '4px 10px' }}>
                        Client →
                      </Link>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>

                  {/* Contact */}
                  <div>
                    <p style={{ margin: '0 0 8px', fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>Contact</p>
                    {[
                      ['Phone', inq.phone],
                      ['Preferred', inq.preferred_contact],
                    ].map(([k, v]) => v && (
                      <div key={k as string} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', minWidth: 70, flexShrink: 0 }}>{k}</span>
                        <span style={{ fontSize: 10, color: CREAM }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Event */}
                  <div>
                    <p style={{ margin: '0 0 8px', fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>Event</p>
                    {[
                      ['Date', fmtDate(inq.event_date)],
                      ['Time', inq.start_time && inq.end_time ? `${inq.start_time} – ${inq.end_time}` : inq.start_time],
                      ['Venue', inq.venue_name],
                      ['Setting', inq.indoor_outdoor],
                      ['Guests', inq.attendance],
                    ].map(([k, v]) => v && v !== '—' && (
                      <div key={k as string} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', minWidth: 70, flexShrink: 0 }}>{k}</span>
                        <span style={{ fontSize: 10, color: CREAM }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Services + Notes */}
                  <div>
                    {services.length > 0 && (
                      <>
                        <p style={{ margin: '0 0 8px', fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>Services</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                          {services.map((s: string) => (
                            <span key={s} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 4, background: `${BLUE}15`, border: `1px solid ${BLUE}25`, color: BLUE }}>{s}</span>
                          ))}
                        </div>
                      </>
                    )}
                    {inq.additional_notes && (
                      <>
                        <p style={{ margin: '0 0 6px', fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Notes</p>
                        <p style={{ margin: 0, fontSize: 11, color: 'rgba(232,224,213,0.6)', lineHeight: 1.5 }}>{inq.additional_notes}</p>
                      </>
                    )}
                  </div>

                </div>

              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
