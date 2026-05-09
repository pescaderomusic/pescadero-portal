'use client'
// app/contract/payment/page.tsx
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAVY  = '#0D1B2A'
const RED   = '#D62828'
const BLUE  = '#44BEC7'
const CREAM = '#F5EFE0'

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [contract, setContract] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const cancelled = searchParams.get('cancelled')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      supabase
        .from('contracts')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
        .then(({ data }) => {
          setContract(data)
          setLoading(false)
        })
    })
  }, [router])

  const handlePay = async (type: 'deposit' | 'final') => {
    if (!contract) return
    setPaying(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: contract.id, type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout')
      if (data.url) window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setPaying(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins, sans-serif', fontSize: 14 }}>Loading…</p>
    </div>
  )

  const depositAmount = contract?.deposit_amount ?? 100
  const finalAmount   = contract?.final_payment_amount ?? 0
  const depositPaid   = contract?.deposit_paid ?? false
  const finalPaid     = contract?.final_payment_paid ?? false

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Poppins, sans-serif', padding: '24px',
    }}>
      <div style={{ maxWidth: 500, width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontSize: 11, letterSpacing: '2px', color: BLUE, textTransform: 'uppercase', marginBottom: 8 }}>
            Payment
          </p>
          <h1 style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 28, color: 'white', margin: 0 }}>
            Secure Your Booking
          </h1>
        </div>

        {cancelled && (
          <div style={{
            background: 'rgba(214,40,40,0.12)', border: '1px solid rgba(214,40,40,0.3)',
            borderRadius: 8, padding: '12px 16px', marginBottom: 20,
            color: '#FF8A80', fontSize: 13, textAlign: 'center',
          }}>
            Payment was cancelled. You can try again below.
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(214,40,40,0.12)', border: '1px solid rgba(214,40,40,0.3)',
            borderRadius: 8, padding: '12px 16px', marginBottom: 20,
            color: '#FF8A80', fontSize: 13, textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* Stripe trust notice */}
        <div style={{
          background: 'rgba(68,190,199,0.08)',
          border: '1px solid rgba(68,190,199,0.2)',
          borderRadius: 10, padding: '14px 18px', marginBottom: 24,
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>🔒</span>
          <p style={{ fontSize: 12, color: 'rgba(232,224,213,0.7)', lineHeight: 1.6, margin: 0 }}>
            You'll be redirected to <strong style={{ color: BLUE }}>Stripe</strong>, our secure payment processor.
            Pescadero Music never stores your card details — all payments are handled directly and securely by Stripe.
          </p>
        </div>

        {/* Deposit card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${depositPaid ? 'rgba(68,190,199,0.4)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 12, padding: '24px', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <p style={{ fontSize: 11, color: BLUE, letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 4px' }}>
                Step 1
              </p>
              <h3 style={{ color: 'white', fontSize: 17, margin: 0, fontWeight: 600 }}>
                Deposit (Non-Refundable)
              </h3>
            </div>
            <span style={{ fontSize: 24, fontWeight: 700, color: depositPaid ? BLUE : 'white' }}>
              ${depositAmount}
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(232,224,213,0.5)', margin: '0 0 18px', lineHeight: 1.5 }}>
            Secures your date and confirms your booking.
          </p>
          {depositPaid ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: BLUE, fontSize: 13 }}>
              <span>✓</span> <span>Deposit received — date secured!</span>
            </div>
          ) : (
            <button
              onClick={() => handlePay('deposit')}
              disabled={paying}
              style={{
                width: '100%', padding: '13px', borderRadius: 8, border: 'none',
                background: paying ? 'rgba(214,40,40,0.4)' : RED,
                color: 'white', fontSize: 14, fontWeight: 700, cursor: paying ? 'not-allowed' : 'pointer',
                boxShadow: paying ? 'none' : '0 4px 20px rgba(214,40,40,0.4)',
                transition: 'all 0.2s',
              }}
            >
              {paying ? 'Redirecting to Stripe…' : `Pay $${depositAmount} Deposit →`}
            </button>
          )}
        </div>

        {/* Final payment card */}
        {finalAmount > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${finalPaid ? 'rgba(68,190,199,0.4)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 12, padding: '24px',
            opacity: depositPaid ? 1 : 0.5,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <p style={{ fontSize: 11, color: BLUE, letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 4px' }}>
                  Step 2
                </p>
                <h3 style={{ color: 'white', fontSize: 17, margin: 0, fontWeight: 600 }}>
                  Final Payment
                </h3>
              </div>
              <span style={{ fontSize: 24, fontWeight: 700, color: finalPaid ? BLUE : 'white' }}>
                ${finalAmount}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(232,224,213,0.5)', margin: '0 0 18px', lineHeight: 1.5 }}>
              Due before your event date per your agreement.
            </p>
            {finalPaid ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: BLUE, fontSize: 13 }}>
                <span>✓</span> <span>Final payment received — all set!</span>
              </div>
            ) : depositPaid ? (
              <button
                onClick={() => handlePay('final')}
                disabled={paying}
                style={{
                  width: '100%', padding: '13px', borderRadius: 8, border: 'none',
                  background: paying ? 'rgba(214,40,40,0.4)' : RED,
                  color: 'white', fontSize: 14, fontWeight: 700, cursor: paying ? 'not-allowed' : 'pointer',
                  boxShadow: paying ? 'none' : '0 4px 20px rgba(214,40,40,0.4)',
                  transition: 'all 0.2s',
                }}
              >
                {paying ? 'Redirecting to Stripe…' : `Pay $${finalAmount} Final Balance →`}
              </button>
            ) : (
              <p style={{ fontSize: 12, color: 'rgba(232,224,213,0.35)', margin: 0 }}>
                Available after deposit is paid.
              </p>
            )}
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(232,224,213,0.3)', marginTop: 24, lineHeight: 1.6 }}>
          Questions? Contact Garrett at garrett@pescaderomusic.com
        </p>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0D1B2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif' }}>Loading…</p>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}
