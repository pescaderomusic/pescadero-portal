import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PrintDownloadButton from '@/components/PrintDownloadButton'

const BLUE = '#44BEC7'
const RED  = '#D62828'
const NAVY = '#0D1B2A'

function fmtDate(d: string | null) {
  if (!d) return 'TBD'
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export default async function ViewInquiryPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: inquiry } = await supabase
    .from('inquiry_submissions')
    .select('*')
    .eq('client_id', user.id)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single()

  if (!inquiry) redirect('/inquiry')

  const labelStyle = {
    display: 'block' as const,
    fontSize: 9, fontWeight: 600 as const,
    letterSpacing: '1.5px', textTransform: 'uppercase' as const,
    color: BLUE, marginBottom: 5,
    fontFamily: 'Poppins, sans-serif',
  }

  const fieldStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 7, padding: '9px 12px',
    color: 'rgba(232,224,213,0.75)',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 13,
  }

  const sectionStyle = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 10, padding: '20px 22px',
    marginBottom: 16,
  }

  const submittedDate = inquiry.submitted_at
    ? new Date(inquiry.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : ''

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, fontFamily: 'Poppins, sans-serif' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,24,40,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(68,190,199,0.12)',
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '3px', color: BLUE, textTransform: 'uppercase' }}>PESCADERO MUSIC</span>
        <Link href="/dashboard" style={{ fontSize: 11, color: 'rgba(232,224,213,0.4)', textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase' }}>← Dashboard</Link>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column' }}>
          <p style={{ margin: '0 0 8px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>Your Submitted Inquiry</p>
          <h1 style={{ margin: '0 0 6px', fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 26, color: 'white' }}>
            {inquiry.couple_names || `${inquiry.first_name} ${inquiry.last_name}`}
          </h1>
          <p style={{ margin: 0, fontSize: 11, color: 'rgba(232,224,213,0.35)' }}>
            Submitted {submittedDate} · Read-only
          </p>
        </div>

        {/* Submitted badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(68,190,199,0.08)', border: '1px solid rgba(68,190,199,0.2)',
          borderRadius: 8, padding: '10px 14px', marginBottom: 24,
        }}>
          <span style={{ fontSize: 16 }}>✓</span>
          <p style={{ margin: 0, fontSize: 12, color: BLUE, fontFamily: 'Poppins, sans-serif' }}>
            Your inquiry has been received. Garrett will follow up shortly via your preferred contact method.
          </p>
        </div>

        {/* Contact Info */}
        <div style={sectionStyle}>
          <p style={{ ...labelStyle, fontSize: 10, marginBottom: 16 }}>Contact Information</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              ['First Name', inquiry.first_name],
              ['Last Name', inquiry.last_name],
              ['Email', inquiry.email],
              ['Phone', inquiry.phone],
              ['Preferred Contact', inquiry.preferred_contact],
              ['Couple / Event Names', inquiry.couple_names],
            ].map(([label, value]) => value && (
              <div key={label as string}>
                <label style={labelStyle}>{label as string}</label>
                <div style={fieldStyle}>{value as string}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Info */}
        <div style={sectionStyle}>
          <p style={{ ...labelStyle, fontSize: 10, marginBottom: 16 }}>Event Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              ['Event Name / Type', inquiry.event_name],
              ['Event Date', fmtDate(inquiry.event_date)],
              ['Start Time', inquiry.start_time],
              ['End Time', inquiry.end_time],
              ['Venue Name', inquiry.venue_name],
              ['Venue Address', inquiry.venue_address],
              ['Indoor / Outdoor', inquiry.indoor_outdoor],
              ['Expected Attendance', inquiry.attendance],
              ['Budget Range', inquiry.budget],
            ].map(([label, value]) => value && (
              <div key={label as string}>
                <label style={labelStyle}>{label as string}</label>
                <div style={fieldStyle}>{value as string}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        {inquiry.services_requested?.length > 0 && (
          <div style={sectionStyle}>
            <p style={{ ...labelStyle, fontSize: 10, marginBottom: 12 }}>Services Requested</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {inquiry.services_requested.map((s: string) => (
                <span key={s} style={{
                  fontSize: 11, padding: '5px 12px', borderRadius: 6,
                  background: 'rgba(68,190,199,0.1)', border: '1px solid rgba(68,190,199,0.25)',
                  color: BLUE, fontFamily: 'Poppins, sans-serif',
                }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Additional Notes */}
        {inquiry.additional_notes && (
          <div style={sectionStyle}>
            <label style={labelStyle}>Additional Notes</label>
            <div style={{ ...fieldStyle, lineHeight: 1.6 }}>{inquiry.additional_notes}</div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link href="/dashboard" style={{
            display: 'inline-block',
            background: RED, color: 'white', textDecoration: 'none',
            borderRadius: 8, padding: '11px 28px',
            fontSize: 13, fontWeight: 700,
            boxShadow: '0 4px 16px rgba(214,48,49,0.35)',
          }}>← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
