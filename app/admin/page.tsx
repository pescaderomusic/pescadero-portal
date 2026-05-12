import { redirect } from 'next/navigation'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const NAVY  = '#0D1B2A'
const BLUE  = '#44BEC7'
const RED   = '#D62828'
const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function StepBadge({ value, label }: { value: string; label: string }) {
  const color =
    ['complete','signed','paid','submitted'].includes(value) ? BLUE :
    ['pending','sent'].includes(value) ? '#F5A623' :
    'rgba(255,255,255,0.2)'
  const text =
    ['complete','signed','paid','submitted'].includes(value) ? '✓' :
    ['pending','sent'].includes(value) ? '●' : '○'
  return (
    <span title={`${label}: ${value}`} style={{ color, fontSize: 16, marginRight: 4 }}>
      {text}
    </span>
  )
}

export default async function AdminPage() {
  // Auth guard — Garrett only
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== GARRETT_ID) redirect('/dashboard')

  const admin = getAdmin()

  // Fetch all bookings with profile + auth email
  const { data: bookings } = await admin
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch all profiles
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, full_name')

  // Fetch auth users for emails
  const { data: authUsers } = await admin.auth.admin.listUsers()

  // Fetch all inquiry submissions
  const { data: inquiries } = await admin
    .from('inquiry_submissions')
    .select('client_id, event_date, event_name, couple_names, submitted_at')

  // Fetch all contracts
  const { data: contracts } = await admin
    .from('contracts')
    .select('client_id, status, deposit_paid_at, event_type, event_date, deposit_amount, final_payment_amount')

  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))
  const emailMap   = Object.fromEntries((authUsers?.users || []).map(u => [u.id, u.email]))
  const inquiryMap = Object.fromEntries((inquiries || []).map(i => [i.client_id, i]))
  const contractMap = Object.fromEntries((contracts || []).map(c => [c.client_id, c]))

  const steps = ['step_inquiry','step_consultation','step_contract','step_deposit','step_planning','step_final_payment','step_event'] as const
  const stepLabels = ['Inquiry','Consult','Contract','Deposit','Planning','Final $','Event']

  // Stats
  const total = bookings?.length || 0
  const consultPending = bookings?.filter(b => b.step_consultation === 'pending').length || 0
  const depositPaid    = bookings?.filter(b => b.step_deposit === 'paid').length || 0
  const upcoming       = bookings?.filter(b => {
    const d = contractMap[b.client_id]?.event_date || inquiryMap[b.client_id]?.event_date
    return d && new Date(d + 'T12:00:00') >= new Date()
  }).length || 0

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, fontFamily: 'Poppins, sans-serif' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,24,40,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(68,190,199,0.15)', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '3px', color: BLUE, textTransform: 'uppercase' }}>PESCADERO ADMIN</span>
          <Link href="/admin/availability" style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>📅 Availability</Link>
          <Link href="/admin/schedule" style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>📞 Schedule</Link>
        </div>
        <Link href="/dashboard" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '1px' }}>← Client View</Link>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ margin: '0 0 6px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>Admin Panel</p>
          <h1 style={{ margin: 0, fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 28, color: 'white' }}>Client Dashboard</h1>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Clients', value: total, color: BLUE },
            { label: 'Consult Pending', value: consultPending, color: '#F5A623' },
            { label: 'Deposits Paid', value: depositPaid, color: '#4CAF50' },
            { label: 'Upcoming Events', value: upcoming, color: RED },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '18px 20px' }}>
              <p style={{ margin: '0 0 6px', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase' }}>{stat.label}</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Client table */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr auto', gap: 0, padding: '12px 20px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {['Client', 'Event', 'Progress', 'Actions', ''].map(h => (
              <p key={h} style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{h}</p>
            ))}
          </div>

          {/* Rows */}
          {(!bookings || bookings.length === 0) && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
              No clients yet.
            </div>
          )}

          {bookings?.map((booking, i) => {
            const profile  = profileMap[booking.client_id]
            const email    = emailMap[booking.client_id]
            const inquiry  = inquiryMap[booking.client_id]
            const contract = contractMap[booking.client_id]
            const eventDate = contract?.event_date || inquiry?.event_date
            const eventName = contract?.event_type || inquiry?.event_name || inquiry?.couple_names || 'Event'
            const daysAway  = eventDate ? Math.ceil((new Date(eventDate + 'T12:00:00').getTime() - Date.now()) / 86400000) : null

            return (
              <div key={booking.id} style={{
                display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr auto',
                gap: 0, padding: '16px 20px', alignItems: 'center',
                borderBottom: i < (bookings.length - 1) ? '1px solid rgba(255,255,255,0.05)' : 'none',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
              }}>

                {/* Client */}
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: 'white' }}>
                    {profile?.full_name || 'Unknown'}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{email}</p>
                </div>

                {/* Event */}
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: 12, color: 'rgba(232,224,213,0.8)' }}>{eventName}</p>
                  <p style={{ margin: 0, fontSize: 11, color: daysAway !== null && daysAway < 30 ? '#F5A623' : 'rgba(255,255,255,0.35)' }}>
                    {eventDate ? `${new Date(eventDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}${daysAway !== null ? ` · ${daysAway}d` : ''}` : 'Date TBD'}
                  </p>
                </div>

                {/* Progress dots */}
                <div>
                  {steps.map((step, si) => (
                    <StepBadge key={step} value={booking[step] || 'locked'} label={stepLabels[si]} />
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {booking.step_consultation === 'pending' && (
                    <Link href={`/admin/client/${booking.client_id}?action=complete-consultation`} style={{
                      fontSize: 10, fontWeight: 700, padding: '5px 10px', borderRadius: 6,
                      background: 'rgba(245,166,35,0.2)', border: '1px solid rgba(245,166,35,0.4)',
                      color: '#F5A623', textDecoration: 'none', whiteSpace: 'nowrap',
                    }}>
                      ✓ Consultation
                    </Link>
                  )}
                  {booking.step_contract !== 'sent' && booking.step_consultation === 'complete' && (
                    <Link href={`/admin/client/${booking.client_id}?action=send-contract`} style={{
                      fontSize: 10, fontWeight: 700, padding: '5px 10px', borderRadius: 6,
                      background: 'rgba(68,190,199,0.15)', border: '1px solid rgba(68,190,199,0.3)',
                      color: BLUE, textDecoration: 'none', whiteSpace: 'nowrap',
                    }}>
                      Send Contract
                    </Link>
                  )}
                  <Link href={`/admin/client/${booking.client_id}`} style={{
                    fontSize: 10, fontWeight: 700, padding: '5px 10px', borderRadius: 6,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
                  }}>
                    View →
                  </Link>
                </div>

                {/* Contract status pill */}
                <div>
                  {contract?.status && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 10,
                      background: contract.status === 'deposit_paid' || contract.status === 'fully_paid' ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${contract.status === 'deposit_paid' || contract.status === 'fully_paid' ? 'rgba(76,175,80,0.3)' : 'rgba(255,255,255,0.1)'}`,
                      color: contract.status === 'deposit_paid' || contract.status === 'fully_paid' ? '#4CAF50' : 'rgba(255,255,255,0.4)',
                      textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap',
                    }}>
                      {contract.status.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
          Pescadero Music Admin · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
    </div>
  )
}
