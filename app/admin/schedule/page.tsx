import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const NAVY = '#0D1B2A'
const BLUE = '#44BEC7'
const RED  = '#D62828'
const GOLD = '#F5A623'
const GREEN = '#4CAF50'
const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function fmtDateTime(d: string) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default async function SchedulePage({ searchParams }: { searchParams: { accepted?: string; declined?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== GARRETT_ID) redirect('/dashboard')

  const admin = getAdmin()

  const [{ data: requests }, { data: profiles }, { data: authUsers }, { data: inquiries }, { data: contracts }] = await Promise.all([
    admin.from('consultation_requests').select('*').order('created_at', { ascending: false }),
    admin.from('profiles').select('id, full_name'),
    admin.auth.admin.listUsers(),
    admin.from('inquiry_submissions').select('client_id, event_name, couple_names, event_date, phone, preferred_contact'),
    admin.from('contracts').select('client_id, event_type, event_date'),
  ])

  const profileMap  = Object.fromEntries((profiles || []).map(p => [p.id, p]))
  const emailMap    = Object.fromEntries((authUsers?.users || []).map(u => [u.id, u.email]))
  const inquiryMap  = Object.fromEntries((inquiries || []).map(i => [i.client_id, i]))
  const contractMap = Object.fromEntries((contracts || []).map(c => [c.client_id, c]))

  const pending   = (requests || []).filter(r => r.status === 'pending')
  const accepted  = (requests || []).filter(r => r.status === 'accepted')
  const completed = (requests || []).filter(r => r.status === 'completed')

  function RequestCard({ req, showActions = false }: { req: any; showActions?: boolean }) {
    const profile  = profileMap[req.client_id]
    const email    = emailMap[req.client_id]
    const inquiry  = inquiryMap[req.client_id]
    const contract = contractMap[req.client_id]
    const eventName = contract?.event_type || inquiry?.event_name || inquiry?.couple_names || 'Event'
    const phone = inquiry?.phone
    const preferred = inquiry?.preferred_contact

    return (
      <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${showActions ? 'rgba(245,166,35,0.25)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10, padding: '16px 18px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'white' }}>{profile?.full_name || email}</p>
              {preferred && <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, background: 'rgba(68,190,199,0.1)', color: BLUE, border: '1px solid rgba(68,190,199,0.2)', textTransform: 'uppercase', letterSpacing: '1px' }}>Prefers {preferred}</span>}
            </div>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{eventName}</p>
            {req.requested_date && (
              <p style={{ margin: '0 0 4px', fontSize: 12, color: GOLD }}>
                📅 Requested: {new Date(req.requested_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                {req.requested_time ? ` at ${req.requested_time}` : ''}
              </p>
            )}
            {req.notes && <p style={{ margin: '0 0 4px', fontSize: 11, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>"{req.notes}"</p>}
            <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>Submitted {fmtDateTime(req.created_at)}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            {showActions && (
              <>
                <Link href={`/admin/consultation/${req.id}/accept`} style={{ display: 'block', width: '100%', padding: '7px 16px', borderRadius: 7, background: GREEN, color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', textAlign: 'center' as const, boxSizing: 'border-box' as const }}>
                  ✓ Accept
                </Link>
                <Link href={`/admin/consultation/${req.id}/decline`} style={{ display: 'block', width: '100%', padding: '7px 16px', borderRadius: 7, border: '1px solid rgba(214,40,40,0.3)', background: 'transparent', color: RED, fontSize: 11, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', textAlign: 'center' as const, boxSizing: 'border-box' as const }}>
                  ✕ Decline
                </Link>
              </>
            )}
            {phone && (
              <a href={`tel:${phone}`} style={{ padding: '7px 16px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
                📞 Call
              </a>
            )}
            <a href={`mailto:${email}`} style={{ padding: '7px 16px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
              ✉️ Email
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, fontFamily: 'Poppins, sans-serif' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,24,40,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(68,190,199,0.15)', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/admin" style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '3px', color: BLUE, textDecoration: 'none' }}>← ADMIN</Link>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>📞 Consultation Schedule</span>
        </div>
        <Link href="/admin/availability" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '5px 12px' }}>
          Edit Availability →
        </Link>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px 80px' }}>

        {searchParams.accepted && (
          <div style={{ background: 'rgba(76,175,80,0.12)', border: '1px solid rgba(76,175,80,0.3)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#4CAF50', fontFamily: 'Poppins, sans-serif' }}>Consultation Accepted!</p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins, sans-serif' }}>Client has been notified by email. The call is now confirmed — you'll initiate it.</p>
            </div>
          </div>
        )}

        {searchParams.declined && (
          <div style={{ background: 'rgba(214,40,40,0.1)', border: '1px solid rgba(214,40,40,0.25)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>✕</span>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#FF8A80', fontFamily: 'Poppins, sans-serif' }}>Request Declined</p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins, sans-serif' }}>Client has been notified to choose a new time.</p>
            </div>
          </div>
        )}
        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: '0 0 4px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>Consultation Requests</p>
          <h1 style={{ margin: 0, fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 26, color: 'white' }}>Schedule</h1>
        </div>

        {/* Pending */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: GOLD }}>⚡ Pending Requests</p>
            {pending.length > 0 && <span style={{ background: 'rgba(245,166,35,0.2)', color: GOLD, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>{pending.length}</span>}
          </div>
          {pending.length === 0 ? (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>No pending requests. 🎉</p>
          ) : (
            pending.map(r => <RequestCard key={r.id} req={r} showActions />)
          )}
        </div>

        {/* Accepted / Upcoming calls */}
        {accepted.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: GREEN }}>✓ Accepted — Upcoming Calls</p>
            {accepted.map(r => <RequestCard key={r.id} req={r} />)}
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <div>
            <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>Completed Consultations</p>
            {completed.map(r => <RequestCard key={r.id} req={r} />)}
          </div>
        )}

        {(!requests || requests.length === 0) && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>📞</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>No consultation requests yet.</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>They'll appear here once clients request a call from their dashboard.</p>
          </div>
        )}
      </div>
    </div>
  )
}
