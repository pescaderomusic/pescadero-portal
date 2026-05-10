'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { LOGO_SRC, BRAND_NAME, BRAND_TAGLINE, BRAND_EMAIL } from '@/lib/brand'

const NAVY  = '#0D1B2A'
const RED   = '#D62828'
const BLUE  = '#44BEC7'

export default function ReceiptPage() {
  const router = useRouter()
  const [contract, setContract]   = useState<any>(null)
  const [profile,  setProfile]    = useState<any>(null)
  const [userEmail, setUserEmail] = useState('')
  const [loading,  setLoading]    = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUserEmail(user.email ?? '')

      const [{ data: prof }, { data: con }] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', user.id).single(),
        supabase.from('contracts').select('*').eq('client_id', user.id)
          .order('created_at', { ascending: false }).limit(1).single(),
      ])
      setProfile(prof)
      setContract(con)
      setLoading(false)
    })
  }, [router])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins, sans-serif' }}>Loading…</p>
    </div>
  )

  const depositPaid = contract?.status === 'deposit_paid'
    || contract?.status === 'fully_paid'
    || !!contract?.deposit_paid_at

  const paidAt = contract?.deposit_paid_at ? new Date(contract.deposit_paid_at) : null
  const paidAtStr = paidAt
    ? paidAt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : 'On file'
  const eventDate = contract?.event_date
    ? new Date(contract.event_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : 'Date TBD'
  const fullName     = profile?.full_name || userEmail || 'Client'
  const firstName    = fullName.split(' ')[0]
  const depositAmt   = contract?.deposit_amount ?? 100
  const finalAmt     = contract?.final_payment_amount ?? 0
  const receiptNum   = contract?.id ? `RC-${contract.id.slice(0, 8).toUpperCase()}` : 'RC-PENDING'

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`,
      padding: '40px 24px',
      fontFamily: 'Poppins, sans-serif',
    }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* Back nav */}
        <Link href="/dashboard" className="no-print" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
          fontSize: 12, marginBottom: 28,
        }}>
          ← Back to Dashboard
        </Link>

        {/* Branded header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 28, paddingBottom: 20,
          borderBottom: '1px solid rgba(68,190,199,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img
              src={LOGO_SRC}
              alt="Pescadero Music Logo"
              style={{ width: 52, height: 52, objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(214,40,40,0.35))' }}
            />
            <div>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'white', letterSpacing: '0.5px', fontFamily: 'Poppins, sans-serif' }}>
                {BRAND_NAME}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(68,190,199,0.7)', fontFamily: 'Lora, serif', fontStyle: 'italic' }}>
                {BRAND_TAGLINE}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Poppins, sans-serif' }}>
              {BRAND_EMAIL}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Poppins, sans-serif' }}>
              Prepared for: <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{fullName}</span>
            </p>
          </div>
        </div>

        {/* Receipt card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(68,190,199,0.2)',
          borderRadius: 16, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(68,190,199,0.12) 0%, rgba(13,27,42,0) 100%)',
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
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{receiptNum}</p>
            </div>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: depositPaid ? 'rgba(68,190,199,0.15)' : 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: depositPaid ? BLUE : 'rgba(255,255,255,0.3)',
              fontWeight: 700,
            }}>
              {depositPaid ? '✓' : '…'}
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '32px 36px' }}>

            {/* Billed to */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ margin: '0 0 4px', fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Billed to</p>
              <p style={{ margin: 0, fontSize: 14, color: 'white', fontWeight: 600 }}>{fullName}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{userEmail}</p>
            </div>

            {/* Line item */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: 13, color: 'white', fontWeight: 600 }}>
                    Deposit — Non-Refundable
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                    {contract?.event_type || 'Live Sound Service'} · {eventDate}
                  </p>
                  {contract?.venue_name && (
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{contract.venue_name}</p>
                  )}
                </div>
                <span style={{ fontSize: 18, fontWeight: 700, color: depositPaid ? BLUE : 'white' }}>
                  ${depositAmt}
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
                ${depositAmt}.00
              </span>
            </div>

            {/* Status banner */}
            {depositPaid && (
              <div style={{
                background: 'rgba(68,190,199,0.08)',
                border: '1px solid rgba(68,190,199,0.2)',
                borderRadius: 10, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28,
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
            {finalAmt > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10, padding: '14px 18px', marginBottom: 28,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Remaining Balance</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                      Due {contract?.final_payment_due
                        ? new Date(contract.final_payment_due + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                        : '7 days before your event'}
                    </p>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
                    ${finalAmt}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="no-print" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => window.print()}
                style={{
                  padding: '11px 24px', borderRadius: 8,
                  border: '1px solid rgba(68,190,199,0.3)',
                  background: 'transparent', color: BLUE, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                }}
              >
                🖨 Print / Save PDF
              </button>
              <Link href="/dashboard" style={{
                padding: '11px 24px', borderRadius: 8,
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
      </div>
    </div>
  )
}
