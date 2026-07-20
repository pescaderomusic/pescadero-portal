import { redirect } from 'next/navigation'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const NAVY   = '#0D1B2A'
const BLUE   = '#44BEC7'
const RED    = '#D62828'
const GOLD   = '#F5A623'
const GREEN  = '#4CAF50'
const CREAM  = '#F5EFE0'
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
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ fontSize: 16, filter: s <= rating ? 'none' : 'grayscale(1) opacity(0.2)' }}>⭐</span>
      ))}
    </span>
  )
}

export default async function AdminReviewsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== GARRETT_ID) redirect('/dashboard')

  const admin = getAdmin()

  const [
    { data: reviews },
    { data: profiles },
  ] = await Promise.all([
    admin.from('reviews').select('*').order('submitted_at', { ascending: false }),
    admin.from('profiles').select('id, full_name'),
  ])

  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))

  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null

  const withTestimonial = (reviews || []).filter(r => r.testimonial && r.testimonial.trim())
  const withPhotoRelease = (reviews || []).filter(r => r.photo_release)
  const withAdConsent = (reviews || []).filter(r => r.use_for_advertising)
  const withReferral = (reviews || []).filter(r => r.referral_name && r.referral_name.trim())

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, fontFamily: 'Poppins, sans-serif' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,24,40,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(68,190,199,0.15)', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/admin" style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '3px', color: BLUE, textDecoration: 'none' }}>← PESCADERO ADMIN</Link>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>/ Reviews</span>
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
            Client Reviews
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            {(reviews || []).length} review{(reviews || []).length !== 1 ? 's' : ''} submitted
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
          {[
            { label: 'Avg Rating', value: avgRating ? `${avgRating} ★` : '—', color: GOLD, icon: '⭐' },
            { label: 'With Testimonial', value: withTestimonial.length, color: BLUE, icon: '💬' },
            { label: 'Ad Consent', value: withAdConsent.length, color: GREEN, icon: '✅' },
            { label: 'Referrals', value: withReferral.length, color: RED, icon: '🎵' },
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

        {/* No reviews state */}
        {(!reviews || reviews.length === 0) && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
            <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>No reviews submitted yet.</p>
            <p style={{ margin: '8px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Reviews appear here once clients complete the post-event review form.</p>
          </div>
        )}

        {/* Reviews list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {(reviews || []).map(review => {
            const profile = profileMap[review.client_id]
            const name = profile?.full_name || 'Unknown Client'
            const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

            return (
              <div key={review.id} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderLeft: `3px solid ${GOLD}`,
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                {/* Header row */}
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {/* Avatar */}
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD}, ${RED})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'white', fontFamily: 'Lora, serif' }}>{name}</p>
                      <StarDisplay rating={review.rating || 0} />
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Poppins, sans-serif' }}>{fmtDate(review.submitted_at)}</span>
                    </div>
                    {/* Badges */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {review.photo_release && (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: `${GREEN}15`, border: `1px solid ${GREEN}35`, color: GREEN }}>📸 Photo OK</span>
                      )}
                      {review.use_for_advertising && (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: `${BLUE}15`, border: `1px solid ${BLUE}35`, color: BLUE }}>📢 Ad Consent</span>
                      )}
                      {review.referral_name && (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: `${RED}15`, border: `1px solid ${RED}35`, color: RED }}>🎵 Referral</span>
                      )}
                    </div>
                  </div>
                  <Link href={`/admin/client/${review.client_id}`} style={{ fontSize: 10, color: BLUE, textDecoration: 'none', border: `1px solid ${BLUE}30`, borderRadius: 5, padding: '4px 10px', flexShrink: 0 }}>
                    View Client →
                  </Link>
                </div>

                {/* Body */}
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* Testimonial */}
                  {review.testimonial && (
                    <div>
                      <p style={{ margin: '0 0 6px', fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: GOLD }}>Testimonial</p>
                      <p style={{ margin: 0, fontSize: 13, color: CREAM, lineHeight: 1.7, fontStyle: 'italic' }}>
                        "{review.testimonial}"
                      </p>
                    </div>
                  )}

                  {/* Additional feedback */}
                  {review.additional_feedback && (
                    <div>
                      <p style={{ margin: '0 0 6px', fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Additional Feedback</p>
                      <p style={{ margin: 0, fontSize: 12, color: 'rgba(232,224,213,0.6)', lineHeight: 1.6 }}>
                        {review.additional_feedback}
                      </p>
                    </div>
                  )}

                  {/* Referral */}
                  {review.referral_name && (
                    <div style={{ background: `${RED}10`, border: `1px solid ${RED}25`, borderRadius: 8, padding: '10px 14px' }}>
                      <p style={{ margin: '0 0 6px', fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: RED }}>🎵 Referral Lead</p>
                      <p style={{ margin: 0, fontSize: 12, color: CREAM }}>
                        <strong>{review.referral_name}</strong>
                        {review.referral_phone && <span style={{ color: 'rgba(232,224,213,0.6)', marginLeft: 8 }}>{review.referral_phone}</span>}
                      </p>
                    </div>
                  )}

                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
