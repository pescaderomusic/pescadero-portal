import { redirect } from 'next/navigation'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const NAVY   = '#0D1B2A'
const NAVY2  = '#152032'
const BLUE   = '#44BEC7'
const RED    = '#D62828'
const GOLD   = '#F5A623'
const GREEN  = '#4CAF50'
const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const STEPS = [
  { key: 'step_inquiry',       short: 'Inquiry',   num: '01' },
  { key: 'step_consultation',  short: 'Consult',   num: '02' },
  { key: 'step_contract',      short: 'Contract',  num: '03' },
  { key: 'step_deposit',       short: 'Deposit',   num: '04' },
  { key: 'step_planning',      short: 'Planning',  num: '05' },
  { key: 'step_final_payment', short: 'Final $',   num: '06' },
  { key: 'step_event',         short: 'Event',     num: '07' },
]

function stepColor(val: string) {
  if (['complete','signed','paid','submitted'].includes(val)) return GREEN
  if (['pending','sent'].includes(val)) return GOLD
  return 'rgba(255,255,255,0.15)'
}
function stepTextColor(val: string) {
  if (['complete','signed','paid','submitted'].includes(val)) return GREEN
  if (['pending','sent'].includes(val)) return GOLD
  return 'rgba(255,255,255,0.25)'
}
function stepSymbol(val: string) {
  if (['complete','signed','paid','submitted'].includes(val)) return '✓'
  if (['pending','sent'].includes(val)) return '●'
  return '○'
}

function fmtDate(d: string | null) {
  if (!d) return null
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== GARRETT_ID) redirect('/dashboard')

  const admin = getAdmin()

  const [
    { data: bookings },
    { data: profiles },
    { data: authUsers },
    { data: inquiries },
    { data: contracts },
  ] = await Promise.all([
    admin.from('bookings').select('*').order('created_at', { ascending: false }),
    admin.from('profiles').select('id, full_name'),
    admin.auth.admin.listUsers(),
    admin.from('inquiry_submissions').select('client_id, event_date, event_name, couple_names, phone, preferred_contact, submitted_at'),
    admin.from('contracts').select('client_id, status, deposit_paid_at, event_type, event_date, deposit_amount, final_payment_amount, final_payment_due'),
  ])

  const profileMap  = Object.fromEntries((profiles || []).map(p => [p.id, p]))
  const emailMap    = Object.fromEntries((authUsers?.users || []).map(u => [u.id, u.email]))
  const inquiryMap  = Object.fromEntries((inquiries || []).map(i => [i.client_id, i]))
  const contractMap = Object.fromEntries((contracts || []).map(c => [c.client_id, c]))

  // Stats
  const total          = bookings?.length || 0
  const consultPending = bookings?.filter(b => b.step_consultation === 'pending').length || 0
  const depositPaid    = bookings?.filter(b => b.step_deposit === 'paid').length || 0
  const now            = new Date()
  const upcoming30     = bookings?.filter(b => {
    const d = contractMap[b.client_id]?.event_date || inquiryMap[b.client_id]?.event_date
    if (!d) return false
    const diff = Math.ceil((new Date(d + 'T12:00:00').getTime() - now.getTime()) / 86400000)
    return diff >= 0 && diff <= 30
  }).length || 0

  // Upcoming events (next 90 days) for sidebar
  const upcomingEvents = (bookings || [])
    .map(b => {
      const d = contractMap[b.client_id]?.event_date || inquiryMap[b.client_id]?.event_date
      const daysAway = d ? Math.ceil((new Date(d + 'T12:00:00').getTime() - now.getTime()) / 86400000) : null
      return { ...b, eventDate: d, daysAway, profile: profileMap[b.client_id], contract: contractMap[b.client_id], inquiry: inquiryMap[b.client_id] }
    })
    .filter(b => b.daysAway !== null && b.daysAway >= 0 && b.daysAway <= 90)
    .sort((a, b) => (a.daysAway ?? 999) - (b.daysAway ?? 999))
    .slice(0, 5)

  // Clients needing action
  const needsAction = (bookings || []).filter(b =>
    b.step_consultation === 'pending' ||
    (b.step_consultation === 'complete' && b.step_contract === 'locked') ||
    (b.step_contract === 'signed' && b.step_deposit === 'locked')
  )

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, fontFamily: 'Poppins, sans-serif' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,24,40,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(68,190,199,0.15)', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '3px', color: BLUE }}>PESCADERO ADMIN</span>
          <Link href="/admin/availability" style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>📅 Availability</Link>
          <Link href="/admin/schedule" style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>📞 Schedule</Link>
        </div>
        <Link href="/dashboard?client=true" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '5px 12px' }}>
          Switch to Client View →
        </Link>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 style={{ margin: 0, fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 26, color: 'white' }}>
              Client Dashboard
            </h1>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Total Clients',      value: total,          color: BLUE,  icon: '👥' },
            { label: 'Consult Needed',     value: consultPending, color: GOLD,  icon: '📞' },
            { label: 'Deposits Paid',      value: depositPaid,    color: GREEN, icon: '💵' },
            { label: 'Events in 30 Days',  value: upcoming30,     color: RED,   icon: '🎵' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div>
                <p style={{ margin: '0 0 3px', fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>

          {/* Main table */}
          <div>
            {/* Needs action */}
            {needsAction.length > 0 && (
              <div style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: 10, padding: '14px 18px', marginBottom: 18 }}>
                <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: GOLD }}>⚡ Needs Your Action ({needsAction.length})</p>
                {needsAction.map(b => {
                  const profile = profileMap[b.client_id]
                  const email   = emailMap[b.client_id]
                  const action  = b.step_consultation === 'pending'
                    ? 'Consultation call needed'
                    : b.step_consultation === 'complete' && b.step_contract === 'locked'
                    ? 'Ready to send contract'
                    : 'Contract signed — unlock deposit'
                  return (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(245,166,35,0.1)' }}>
                      <div>
                        <span style={{ fontSize: 12, color: 'white', fontWeight: 600 }}>{profile?.full_name || email}</span>
                        <span style={{ fontSize: 11, color: GOLD, marginLeft: 10 }}>— {action}</span>
                      </div>
                      <Link href={`/admin/client/${b.client_id}`} style={{ fontSize: 10, color: GOLD, textDecoration: 'none', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 5, padding: '3px 10px' }}>
                        Take Action →
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Client table */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>

              {/* Table header */}
              <div style={{ padding: '12px 18px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 16, alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Client</p>
                <p style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Progress</p>
                <p style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Actions</p>
              </div>

              {(!bookings || bookings.length === 0) && (
                <p style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13, margin: 0 }}>No clients yet.</p>
              )}

              {bookings?.map((booking, i) => {
                const profile  = profileMap[booking.client_id]
                const email    = emailMap[booking.client_id]
                const inquiry  = inquiryMap[booking.client_id]
                const contract = contractMap[booking.client_id]
                const eventDate = contract?.event_date || inquiry?.event_date
                const daysAway  = eventDate ? Math.ceil((new Date(eventDate + 'T12:00:00').getTime() - now.getTime()) / 86400000) : null

                return (
                  <div key={booking.id} style={{
                    padding: '14px 18px',
                    borderBottom: i < (bookings.length - 1) ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                    display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 16, alignItems: 'center',
                  }}>

                    {/* Client info */}
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {profile?.full_name || 'Unknown'}
                      </p>
                      <p style={{ margin: '0 0 3px', fontSize: 10, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {email}
                      </p>
                      {eventDate && (
                        <p style={{ margin: 0, fontSize: 10, color: daysAway !== null && daysAway <= 14 ? RED : daysAway !== null && daysAway <= 30 ? GOLD : 'rgba(255,255,255,0.3)' }}>
                          {fmtDate(eventDate)}{daysAway !== null ? ` · ${daysAway}d` : ''}
                        </p>
                      )}
                    </div>

                    {/* Labeled step progress */}
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {STEPS.map(({ key, short }) => {
                        const val = booking[key] || 'locked'
                        const color = stepColor(val)
                        const textColor = stepTextColor(val)
                        const sym = stepSymbol(val)
                        return (
                          <div key={key} title={`${short}: ${val}`} style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                            padding: '4px 6px', borderRadius: 6,
                            background: ['complete','signed','paid','submitted'].includes(val) ? 'rgba(76,175,80,0.1)' : ['pending','sent'].includes(val) ? 'rgba(245,166,35,0.1)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${color}22`,
                            minWidth: 44,
                          }}>
                            <span style={{ fontSize: 12, color, lineHeight: 1 }}>{sym}</span>
                            <span style={{ fontSize: 8, color: textColor, fontWeight: 600, letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>{short}</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Link href={`/admin/client/${booking.client_id}`} style={{
                        fontSize: 11, fontWeight: 700, padding: '6px 14px', borderRadius: 7,
                        background: 'rgba(68,190,199,0.1)', border: '1px solid rgba(68,190,199,0.25)',
                        color: BLUE, textDecoration: 'none', whiteSpace: 'nowrap',
                      }}>
                        Manage →
                      </Link>
                      {contract?.status && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                          background: ['deposit_paid','fully_paid'].includes(contract.status) ? 'rgba(76,175,80,0.12)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${['deposit_paid','fully_paid'].includes(contract.status) ? 'rgba(76,175,80,0.25)' : 'rgba(255,255,255,0.1)'}`,
                          color: ['deposit_paid','fully_paid'].includes(contract.status) ? GREEN : 'rgba(255,255,255,0.3)',
                          textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
                        }}>
                          {contract.status.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Upcoming events */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '16px 18px' }}>
              <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                📅 Upcoming Events
              </p>
              {upcomingEvents.length === 0 && (
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>No events in next 90 days.</p>
              )}
              {upcomingEvents.map(e => (
                <div key={e.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: 'white' }}>
                    {e.profile?.full_name || emailMap[e.client_id] || 'Client'}
                  </p>
                  <p style={{ margin: '0 0 2px', fontSize: 11, color: 'rgba(232,224,213,0.5)' }}>
                    {e.contract?.event_type || e.inquiry?.event_name || 'Event'}
                  </p>
                  <p style={{ margin: 0, fontSize: 10, color: e.daysAway !== null && e.daysAway! <= 7 ? RED : GOLD, fontWeight: 600 }}>
                    {fmtDate(e.eventDate || null)} · {e.daysAway}d away
                  </p>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '16px 18px' }}>
              <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                Quick Links
              </p>
              {[
                { href: 'mailto:garrett@pescaderomusic.com', label: '✉️ Compose Email' },
                { href: '/admin/availability', label: '📅 Set Availability' },
                { href: '/admin/schedule', label: '📞 View Schedule' },
                { href: 'https://dashboard.stripe.com', label: '💳 Stripe Dashboard', ext: true },
                { href: 'https://resend.com', label: '📬 Resend Logs', ext: true },
              ].map(link => (
                <a key={link.href} href={link.href} target={link.ext ? '_blank' : undefined} rel={link.ext ? 'noopener noreferrer' : undefined} style={{ display: 'block', fontSize: 12, color: 'rgba(232,224,213,0.55)', textDecoration: 'none', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {link.label}
                </a>
              ))}
            </div>

            {/* Legend */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ margin: '0 0 10px', fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>Legend</p>
              {[
                { sym: '✓', color: GREEN, label: 'Complete / Paid' },
                { sym: '●', color: GOLD,  label: 'Pending / Sent' },
                { sym: '○', color: 'rgba(255,255,255,0.2)', label: 'Locked / Not started' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: l.color, width: 16 }}>{l.sym}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{l.label}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
