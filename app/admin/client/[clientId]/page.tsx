import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import Link from 'next/link'
import StepControls from './StepControls'
import TextReviewButton from '@/components/admin/TextReviewButton'
import { reviewUrl, reviewTextMessage } from '@/lib/review-link'

export const dynamic = 'force-dynamic'

const NAVY = '#0D1B2A'
const BLUE = '#44BEC7'
const RED  = '#D62828'
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
    <div style={{ marginBottom: 10 }}>
      <p style={{ margin: '0 0 2px', fontSize: 11, color: BLUE, textTransform: 'uppercase' as const, letterSpacing: '1px', fontFamily: 'Poppins, sans-serif' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 14, color: 'rgba(232,224,213,0.92)', overflowWrap: 'anywhere', fontFamily: 'Poppins, sans-serif' }}>{value}</p>
    </div>
  )
}

export default async function AdminClientPage({ params }: { params: { clientId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== GARRETT_ID) redirect('/dashboard')

  const admin = getAdmin()
  const { clientId } = params

  const [
    { data: booking }, { data: profile }, { data: userData },
    { data: inquiry }, { data: contract }, { data: planning },
    { data: consultReq },
    { data: reviewRows },
  ] = await Promise.all([
    admin.from('bookings').select('*').eq('client_id', clientId).single(),
    admin.from('profiles').select('*').eq('id', clientId).single(),
    admin.auth.admin.getUserById(clientId),
    admin.from('inquiry_submissions').select('*').eq('client_id', clientId).order('submitted_at', { ascending: false }).limit(1).single(),
    admin.from('contracts').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(1).single(),
    admin.from('planning_forms').select('*').eq('client_id', clientId).single(),
    admin.from('consultation_requests').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(1).single(),
    admin.from('reviews').select('rating').eq('client_id', clientId).limit(1),
  ])
  const review = reviewRows?.[0]

  const email     = userData?.user?.email
  const fullName  = profile?.full_name || email || 'Client'
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

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,24,40,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(68,190,199,0.15)', padding: '0 16px', minHeight: 56, gap: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/admin" style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, letterSpacing: '3px', color: BLUE, textDecoration: 'none', padding: '12px 0' }}>← CLIENTS</Link>
          <span className="hidden sm:inline" style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{fullName}</span>
        </div>
        <Link href={`/admin/contract/${clientId}`} style={{ padding: '10px 14px', whiteSpace: 'nowrap', borderRadius: 7, border: '1px solid rgba(68,190,199,0.3)', background: 'rgba(68,190,199,0.1)', color: '#44BEC7', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
          📄 Prepare Contract →
        </Link>
        <div style={{ display: 'none' }}>
        </div>
      </nav>

      <div style={{ maxWidth: 920, margin: '0 auto' }} className="px-4 sm:px-6 pt-6 pb-10">

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ margin: '0 0 4px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>Client Detail</p>
          <h1 style={{ margin: '0 0 4px', fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 26, color: 'white' }}>{fullName}</h1>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.7)', overflowWrap: 'anywhere' }}>
            {email}{inquiry?.phone ? ` · ${inquiry.phone}` : ''}{inquiry?.preferred_contact ? ` · Prefers ${inquiry.preferred_contact}` : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-4">

          {/* Left: Event summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px' }}>
              <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>Event</p>
              <Row label="Type" value={contract?.event_type || inquiry?.event_name} />
              <Row label="Couple" value={inquiry?.couple_names} />
              <Row label="Date" value={contract?.event_date || inquiry?.event_date} />
              <Row label="Venue" value={inquiry?.venue_name} />
              <Row label="Contract" value={contract?.status} />
              <Row label="Deposit" value={contract?.deposit_amount ? `$${contract.deposit_amount}` : null} />
              <Row label="Final" value={contract?.final_payment_amount ? `$${contract.final_payment_amount}` : null} />
            </div>

            {/* Contact */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 18px' }}>
              <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>Contact</p>
              <a href={`mailto:${email}`} style={{ display: 'block', padding: '13px 8px', borderRadius: 7, border: '1px solid rgba(68,190,199,0.35)', background: 'rgba(68,190,199,0.1)', color: BLUE, fontSize: 13, fontWeight: 700, textDecoration: 'none', textAlign: 'center' as const, marginBottom: 6 }}>
                ✉️ Email
              </a>
              {inquiry?.phone && (
                <>
                  <a href={`tel:${inquiry.phone}`} style={{ display: 'block', padding: '13px 8px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 700, textDecoration: 'none', textAlign: 'center' as const, marginBottom: 6 }}>
                    📞 Call
                  </a>
                  <a href={`sms:${inquiry.phone}`} style={{ display: 'block', padding: '13px 8px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 700, textDecoration: 'none', textAlign: 'center' as const }}>
                    💬 Text
                  </a>
                </>
              )}
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                {review ? (
                  <Link href="/admin/reviews" style={{ display: 'block', padding: '13px 8px', borderRadius: 7, border: '1px solid rgba(245,166,35,0.5)', background: 'rgba(245,166,35,0.12)', color: '#F5C46B', fontSize: 13, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
                    ★ Reviewed {review.rating}/5 · See review
                  </Link>
                ) : (
                  <TextReviewButton message={reviewTextMessage(firstName, clientId)} link={reviewUrl(clientId)} phone={inquiry?.phone} />
                )}
              </div>
            </div>
          </div>

          {/* Right: Step controls + forms */}
          <StepControls
            clientId={clientId}
            booking={booking}
            steps={STEPS}
            email={email || ''}
            firstName={firstName}
            consultationRequest={consultReq}
            inquiry={inquiry}
            planning={planning}
          />
        </div>
      </div>
    </div>
  )
}
