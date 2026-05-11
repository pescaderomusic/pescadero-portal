import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import Link from 'next/link'
import PrintDownloadButton from '@/components/PrintDownloadButton'

export const dynamic = 'force-dynamic'

const NAVY = '#0D1B2A'
const BLUE = '#44BEC7'
const RED  = '#D62828'

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function fmtDate(d: string | null) {
  if (!d) return 'TBD'
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: BLUE, fontFamily: 'Poppins, sans-serif' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: 13, color: 'rgba(232,224,213,0.85)', fontFamily: 'Poppins, sans-serif', lineHeight: 1.5 }}>
        {value}
      </p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 10, padding: '20px 22px', marginBottom: 16,
    }}>
      <p style={{ margin: '0 0 16px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', fontFamily: 'Poppins, sans-serif' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

export default async function ViewInquiryPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Use admin client to bypass RLS
  const admin = getAdmin()
  const { data: inquiry, error } = await admin
    .from('inquiry_submissions')
    .select('*')
    .eq('client_id', user.id)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single()

  if (!inquiry) redirect('/inquiry')

  const submittedDate = inquiry.submitted_at
    ? new Date(inquiry.submitted_at).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit',
      })
    : ''

  const services = Array.isArray(inquiry.services_requested)
    ? inquiry.services_requested.join(', ')
    : inquiry.services_requested

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, fontFamily: 'Poppins, sans-serif' }}>

      {/* Nav */}
      <nav className="no-print" style={{
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

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>
              Your Submitted Inquiry
            </p>
            <h1 style={{ margin: '0 0 6px', fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 26, color: 'white' }}>
              {inquiry.couple_names || `${inquiry.first_name} ${inquiry.last_name}`}
            </h1>
            {submittedDate && (
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(232,224,213,0.4)' }}>
                Submitted {submittedDate}
              </p>
            )}
          </div>
          <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{
              background: 'rgba(68,190,199,0.12)', border: '1px solid rgba(68,190,199,0.3)',
              borderRadius: 20, padding: '4px 12px', fontSize: 11, color: BLUE, fontWeight: 600,
            }}>
              ✓ Received
            </span>
            <PrintDownloadButton label="🖨 Save as PDF" />
          </div>
        </div>

        {/* Contact info */}
        <Section title="Contact Information">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <Row label="First Name" value={inquiry.first_name} />
            <Row label="Last Name" value={inquiry.last_name} />
            <Row label="Email" value={inquiry.email} />
            <Row label="Phone" value={inquiry.phone} />
            <Row label="Preferred Contact" value={inquiry.preferred_contact} />
          </div>
        </Section>

        {/* Event details */}
        <Section title="Event Details">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <Row label="Couple Names" value={inquiry.couple_names} />
            <Row label="Event Name" value={inquiry.event_name} />
            <Row label="Event Date" value={fmtDate(inquiry.event_date)} />
            <Row label="Start Time" value={inquiry.start_time} />
            <Row label="End Time" value={inquiry.end_time} />
            <Row label="Indoor / Outdoor" value={inquiry.indoor_outdoor} />
            <Row label="Expected Attendance" value={inquiry.attendance} />
          </div>
        </Section>

        {/* Venue */}
        <Section title="Venue">
          <Row label="Venue Name" value={inquiry.venue_name} />
          <Row label="Venue Address" value={inquiry.venue_address} />
        </Section>

        {/* Services & budget */}
        <Section title="Services & Budget">
          <Row label="Services Requested" value={services} />
          <Row label="Budget Range" value={inquiry.budget} />
        </Section>

        {/* Additional notes */}
        {inquiry.additional_notes && (
          <Section title="Additional Notes">
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(232,224,213,0.75)', lineHeight: 1.7, fontFamily: 'Poppins, sans-serif', whiteSpace: 'pre-wrap' }}>
              {inquiry.additional_notes}
            </p>
          </Section>
        )}

        {/* Read-only notice */}
        <div className="no-print" style={{
          background: 'rgba(68,190,199,0.06)', border: '1px solid rgba(68,190,199,0.15)',
          borderRadius: 8, padding: '12px 16px', marginTop: 8,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 16 }}>🔒</span>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(232,224,213,0.5)', lineHeight: 1.5 }}>
            This is a read-only view of your submitted inquiry. Need to make changes?{' '}
            <a href="mailto:garrett@pescaderomusic.com" style={{ color: BLUE, textDecoration: 'none' }}>
              Email Garrett directly.
            </a>
          </p>
        </div>

      </div>

      <style>{`@media print { .no-print { display: none !important; } nav { display: none !important; } }`}</style>
    </div>
  )
}
