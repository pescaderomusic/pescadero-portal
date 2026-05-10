import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const NAVY  = '#0D1B2A'
const BLUE  = '#44BEC7'
const RED   = '#D62828'
const CREAM = '#F5EFE0'

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function ReceiptPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = getAdmin()

  // Fetch profile
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // Fetch the most recent paid contract
  const { data: contract } = await admin
    .from('contracts')
    .select('*')
    .eq('client_id', user.id)
    .eq('status', 'deposit_paid')
    .order('deposit_paid_at', { ascending: false })
    .limit(1)
    .single()

  // Fallback: any contract for this user
  const { data: anyContract } = !contract ? await admin
    .from('contracts')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single() : { data: null }

  const c = contract || anyContract

  const depositPaid = c?.status === 'deposit_paid' || !!c?.deposit_paid_at
  const paidAt = c?.deposit_paid_at ? new Date(c.deposit_paid_at) : null
  const paidAtStr = paidAt
    ? paidAt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : 'Date on file'
  const eventDate = c?.event_date
    ? new Date(c.event_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : 'Date TBD'

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const fullName  = profile?.full_name || user.email || 'Client'
  const receiptNumber = c?.id ? `RC-${c.id.slice(0, 8).toUpperCase()}` : 'RC-PENDING'

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`,
      padding: '40px 24px',
      fontFamily: 'Poppins, sans-serif',
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* Back nav */}
        <Link href="/dashboard" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
          fontSize: 12, marginBottom: 32,
        }}>
          ← Back to Dashboard
        </Link>

        {/* Receipt card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(68,190,199,0.2)',
          borderRadius: 16,
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            background: `linear-gradient(135deg, rgba(68,190,199,0.12) 0%, rgba(13,27,42,0) 100%)`,
            borderBottom: '1px solid rgba(68,190,199,0.15)',
            padding: '32px 36px',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: BLUE, fontWeight: 600 }}>
                Payment Receipt
              </p>
              <h1 style={{ margin: '0 0 4px', fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 26, color: 'white' }}>
                {depositPaid ? 'Deposit Confirmed' : 'Payment Summary'}
              </h1>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{receiptNumber}</p>
            </div>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: depositPaid ? 'rgba(68,190,199,0.15)' : 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>
              {depositPaid ? '✓' : '⋯'}
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '32px 36px' }}>

            {/* Client info */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ margin: '0 0 4px', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Billed to</p>
              <p style={{ margin: 0, fontSize: 14, color: 'white', fontWeight: 600 }}>{fullName}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{user.email}</p>
            </div>

            {/* Line items */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: 13, color: 'white', fontWeight: 600 }}>
                    Deposit — Non-Refundable
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                    {c?.event_type || 'Live Sound Service'} · {eventDate}
                  </p>
                  {c?.venue_name && (
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{c.venue_name}</p>
                  )}
                </div>
                <span style={{ fontSize: 18, fontWeight: 700, color: depositPaid ? BLUE : 'white' }}>
                  ${c?.deposit_amount ?? 100}
                </span>
              </div>
            </div>

            {/* Total */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.07)',
              paddingTop: 16, marginBottom: 28,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Total Paid</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: depositPaid ? BLUE : 'white' }}>
                ${c?.deposit_amount ?? 100}.00
              </span>
            </div>

            {/* Status + date */}
            {depositPaid && (
              <div style={{
                background: 'rgba(68,190,199,0.08)',
                border: '1px solid rgba(68,190,199,0.2)',
                borderRadius: 10, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 12,
                marginBottom: 28,
              }}>
                <span style={{ fontSize: 18 }}>🎉</span>
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: BLUE }}>Payment Received</p>
                  <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                    Processed on {paidAtStr} via Stripe
                  </p>
                </div>
              </div>
            )}

            {/* Remaining balance */}
            {c?.final_payment_amount && (
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10, padding: '14px 18px',
                marginBottom: 28,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Remaining Balance</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                      Due {c?.final_payment_due
                        ? new Date(c.final_payment_due + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                        : '7 days before your event'}
                    </p>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
                    ${c.final_payment_amount}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => window.print()}
                style={{
                  padding: '11px 24px', borderRadius: 8, border: `1px solid rgba(68,190,199,0.3)`,
                  background: 'transparent', color: BLUE, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                }}
              >
                🖨 Print / Save PDF
              </button>
              <Link href="/dashboard" style={{
                padding: '11px 24px', borderRadius: 8, border: 'none',
                background: RED, color: 'white', fontSize: 12, fontWeight: 700,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
              }}>
                Back to Dashboard →
              </Link>
            </div>

          </div>

          {/* Footer */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            padding: '16px 36px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
              Pescadero Music · Your day. Your music. Our sound.
            </p>
            <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
              garrett@pescaderomusic.com
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 24 }}>
          Questions? Call (210) 727-9328 or email garrett@pescaderomusic.com
        </p>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          button { display: none !important; }
          a[href="/dashboard"] { display: none !important; }
        }
      `}</style>
    </div>
  )
}
