import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import Link from 'next/link'
import StepControls from './StepControls'

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

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <p style={{ margin: '0 0 2px', fontSize: 9, color: BLUE, textTransform: 'uppercase' as const, letterSpacing: '1px', fontFamily: 'Poppins, sans-serif' }}>{label}</p>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: 'rgba(232,224,213,0.8)', fontFamily: 'Poppins, sans-serif' }}>{value}</p>
    </div>
  )
}

export default async function AdminClientPage({ params }: { params: { clientId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== GARRETT_ID) redirect('/dashboard')

  const admin = getAdmin()
  const { clientId } = params

  const [{ data: booking }, { data: profile }, { data: userData }, { data: inquiry }, { data: contract }, { data: planning }] = await Promise.all([
    admin.from('bookings').select('*').eq('client_id', clientId).single(),
    admin.from('profiles').select('*').eq('id', clientId).single(),
    admin.auth.admin.getUserById(clientId),
    admin.from('inquiry_submissions').select('*').eq('client_id', clientId).order('submitted_at', { ascending: false }).limit(1).single(),
    admin.from('contracts').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(1).single(),
    admin.from('planning_forms').select('*').eq('client_id', clientId).single(),
  ])

  const email = userData?.user?.email
  const fullName = profile?.full_name || email || 'Client'
  const firstName = fullName.split(' ')[0]

  const STEPS = [
    { key: 'step_inquiry',       label: 'Inquiry',              num: '01' },
    { key: 'step_consultation',  label: 'Initial Consultation', num: '02' },
    { key: 'step_contract',      label: 'Service Agreement',    num: '03' },
    { key: 'step_deposit',       label: 'Deposit',              num: '04' },
    { key: 'step_planning',      label: 'Planning & Music',     num: '05' },
    { key: 'step_final_payment', label: 'Final Payment',        num: '06' },
    { key: 'step_event',         label: 'Event Day',            num: '07' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, fontFamily: 'Poppins, sans-serif' }}>

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,24,40,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(68,190,199,0.15)', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/admin" style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '3px', color: BLUE, textDecoration: 'none' }}>← ADMIN</Link>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{fullName}</span>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ margin: '0 0 4px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>Client Detail</p>
          <h1 style={{ margin: '0 0 4px', fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 26, color: 'white' }}>{fullName}</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            {email}{inquiry?.phone ? ` · ${inquiry.phone}` : ''}
            {inquiry?.preferred_contact ? ` · Prefers ${inquiry.preferred_contact}` : ''}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Event info */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px' }}>
              <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Event Info</p>
              <Row label="Event Type" value={contract?.event_type || inquiry?.event_name} />
              <Row label="Couple" value={inquiry?.couple_names} />
              <Row label="Event Date" value={contract?.event_date || inquiry?.event_date} />
              <Row label="Venue" value={inquiry?.venue_name} />
              <Row label="Deposit" value={contract?.deposit_amount ? `$${contract.deposit_amount}` : null} />
              <Row label="Final Payment" value={contract?.final_payment_amount ? `$${contract.final_payment_amount}` : null} />
              <Row label="Contract Status" value={contract?.status} />
            </div>

            {/* Quick actions */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px' }}>
              <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Quick Actions</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href={`mailto:${email}?subject=Pescadero Music — Your Booking`} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'block', textAlign: 'center' as const }}>
                  ✉️ Email {firstName}
                </a>
                {inquiry?.phone && (
                  <a href={`sms:${inquiry.phone}`} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'block', textAlign: 'center' as const }}>
                    💬 Text {firstName}
                  </a>
                )}
                {inquiry?.phone && (
                  <a href={`tel:${inquiry.phone}`} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'block', textAlign: 'center' as const }}>
                    📞 Call {firstName}
                  </a>
                )}
              </div>
            </div>

            {/* Planning form (if submitted) */}
            {planning && (
              <div style={{ background: 'rgba(68,190,199,0.04)', border: '1px solid rgba(68,190,199,0.15)', borderRadius: 12, padding: '18px 20px' }}>
                <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>Planning Form ✓</p>
                <Row label="First Dance" value={planning.first_dance_song} />
                <Row label="Grand Entrance Time" value={planning.grand_entrance_time} />
                <Row label="Genres" value={planning.genres} />
                <Row label="Must Play" value={planning.must_play} />
                <Row label="Do Not Play" value={planning.do_not_play} />
                <Row label="MC Needed" value={planning.mc_needed} />
                <Row label="Photographer" value={planning.photographer} />
                <Row label="Coordinator" value={planning.coordinator} />
                {planning.additional_notes && <Row label="Notes" value={planning.additional_notes} />}
              </div>
            )}
          </div>

          {/* Right column — Step controls (client component) */}
          <StepControls
            clientId={clientId}
            booking={booking}
            steps={STEPS}
            email={email || ''}
            firstName={firstName}
          />
        </div>
      </div>
    </div>
  )
}
