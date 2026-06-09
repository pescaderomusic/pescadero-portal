'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'

const NAVY     = '#07111A'
const RED      = '#C8202A'
const BLUE     = '#44BEC7'
const CREAM    = '#F5EFE0'
const DISPLAY  = "'freight-display-pro', Georgia, serif"
const UI_FONT  = "'futura-pt-condensed', 'Barlow Condensed', sans-serif"
const BODY     = "'inter', system-ui, sans-serif"
const WORDMARK = "'RetroFloral', 'Barlow Condensed', sans-serif"

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [contract, setContract] = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [paying, setPaying]     = useState(false)
  const [error, setError]       = useState('')
  const [userId, setUserId]     = useState<string | null>(null)
  const cancelled = searchParams.get('cancelled')

  useEffect(() => {
    const supabase = createClient()
    let pollInterval: ReturnType<typeof setInterval> | null = null

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      const fetchContract = async () => {
        const { data } = await supabase
          .from('contracts')
          .select('*')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        setContract(data)
        setLoading(false)

        // If returning from Stripe success but webhook hasn't fired yet, poll until DB updates
        const returning = new URLSearchParams(window.location.search).get('returning')
        if (returning && data && !['deposit_paid','fully_paid'].includes(data.status)) {
          let attempts = 0
          pollInterval = setInterval(async () => {
            attempts++
            const { data: fresh } = await supabase
              .from('contracts')
              .select('*')
              .eq('client_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()
            if (fresh && ['deposit_paid','fully_paid'].includes(fresh.status)) {
              setContract(fresh)
              if (pollInterval) clearInterval(pollInterval)
            }
            if (attempts >= 10) {
              if (pollInterval) clearInterval(pollInterval) // give up after ~30s
            }
          }, 3000)
        }
      }

      fetchContract()
    })

    return () => { if (pollInterval) clearInterval(pollInterval) }
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
      <p style={{ color: 'rgba(245,239,224,0.5)', fontFamily: BODY, fontSize: 14 }}>Loading…</p>
    </div>
  )

  const depositAmount = contract?.deposit_amount ?? (userId === GARRETT_ID ? 99 : 100)
  const finalAmount   = contract?.final_payment_amount ?? 0

  const depositPaid = contract?.status === 'deposit_paid'
    || contract?.status === 'fully_paid'
    || !!contract?.deposit_paid_at

  const finalPaid = contract?.status === 'fully_paid'

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, ${NAVY} 0%, #0D1E2B 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: BODY, padding: '24px',
    }}>
      <div style={{ maxWidth: 500, width: '100%' }}>

        {/* Logo + header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
            <img src="https://shxcw5yjydy1kgql.public.blob.vercel-storage.com/logo.png" alt="Pescadero Music" style={{ height: 40, width: 40, objectFit: 'contain' }} />
            <span style={{ fontFamily: WORDMARK, fontSize: 18, letterSpacing: '4px', color: CREAM, textTransform: 'uppercase' }}>Pescadero Music</span>
          </div>
          <p style={{ fontSize: 11, letterSpacing: '3px', color: BLUE, textTransform: 'uppercase', marginBottom: 8, fontFamily: UI_FONT }}>
            Payment
          </p>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 300, fontSize: 30, color: CREAM, margin: 0 }}>
            Secure Your Booking
          </h1>
        </div>

        {cancelled && (
          <div style={{ background: 'rgba(200,32,42,0.12)', border: '1px solid rgba(200,32,42,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#FF8A80', fontSize: 13, fontFamily: BODY, textAlign: 'center' }}>
            Payment was cancelled. You can try again below.
          </div>
        )}

        {searchParams.get('returning') && !depositPaid && (
          <div style={{ background: 'rgba(68,190,199,0.08)', border: '1px solid rgba(68,190,199,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, fontFamily: BODY, textAlign: 'center', color: BLUE }}>
            ⏳ Verifying your payment… this usually takes a few seconds. If your payment went through, this page will update automatically. You can also safely try again below if needed.
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(200,32,42,0.12)', border: '1px solid rgba(200,32,42,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#FF8A80', fontSize: 13, fontFamily: BODY, textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Stripe trust notice */}
        <div style={{ background: 'rgba(68,190,199,0.08)', border: '1px solid rgba(68,190,199,0.2)', borderRadius: 10, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>🔒</span>
          <p style={{ fontSize: 12, color: 'rgba(245,239,224,0.7)', lineHeight: 1.6, margin: 0, fontFamily: BODY }}>
            You'll be redirected to <strong style={{ color: BLUE }}>Stripe</strong>, our secure payment processor.
            Pescadero Music never stores your card details — all payments are handled directly by Stripe.
          </p>
        </div>

        {/* Deposit card */}
        <div style={{ background: 'rgba(245,239,224,0.03)', border: `1px solid ${depositPaid ? 'rgba(68,190,199,0.4)' : 'rgba(245,239,224,0.1)'}`, borderRadius: 12, padding: '24px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <p style={{ fontSize: 11, color: BLUE, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 4px', fontFamily: UI_FONT }}>
                Step 1
              </p>
              <h3 style={{ color: CREAM, fontSize: 17, margin: 0, fontFamily: DISPLAY, fontWeight: 300 }}>
                Deposit (Non-Refundable)
              </h3>
            </div>
            <span style={{ fontSize: 26, fontFamily: DISPLAY, fontWeight: 300, color: depositPaid ? BLUE : CREAM }}>
              ${depositAmount}
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(245,239,224,0.5)', margin: '0 0 18px', lineHeight: 1.5, fontFamily: BODY }}>
            Secures your date and confirms your booking.
          </p>
          {depositPaid ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: BLUE, fontSize: 13, fontFamily: BODY }}>
                <span>✓</span> <span>Deposit received — date secured!</span>
              </div>
              <Link href="/receipt" style={{ fontSize: 11, color: BLUE, textDecoration: 'none', fontFamily: UI_FONT, letterSpacing: '1.5px', textTransform: 'uppercase', border: `1px solid rgba(68,190,199,0.3)`, borderRadius: 6, padding: '5px 12px' }}>
                View Receipt →
              </Link>
            </div>
          ) : (
            <button
              onClick={() => handlePay('deposit')}
              disabled={paying}
              style={{ width: '100%', padding: '13px', borderRadius: 8, border: 'none', background: paying ? 'rgba(200,32,42,0.4)' : RED, color: 'white', fontSize: 13, fontFamily: UI_FONT, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 500, cursor: paying ? 'not-allowed' : 'pointer', boxShadow: paying ? 'none' : '0 4px 20px rgba(200,32,42,0.4)', transition: 'all 0.2s' }}
            >
              {paying ? 'Redirecting to Stripe…' : `Pay $${depositAmount} Deposit →`}
            </button>
          )}
        </div>

        {/* Final payment card */}
        {finalAmount > 0 && (
          <div style={{ background: 'rgba(245,239,224,0.03)', border: `1px solid ${finalPaid ? 'rgba(68,190,199,0.4)' : 'rgba(245,239,224,0.08)'}`, borderRadius: 12, padding: '24px', opacity: depositPaid ? 1 : 0.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <p style={{ fontSize: 11, color: BLUE, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 4px', fontFamily: UI_FONT }}>
                  Step 2
                </p>
                <h3 style={{ color: CREAM, fontSize: 17, margin: 0, fontFamily: DISPLAY, fontWeight: 300 }}>Final Payment</h3>
              </div>
              <span style={{ fontSize: 26, fontFamily: DISPLAY, fontWeight: 300, color: finalPaid ? BLUE : CREAM }}>
                ${finalAmount}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(245,239,224,0.5)', margin: '0 0 18px', lineHeight: 1.5, fontFamily: BODY }}>
              Due before your event date per your agreement.
            </p>
            {finalPaid ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: BLUE, fontSize: 13, fontFamily: BODY }}>
                <span>✓</span> <span>Final payment received — all set!</span>
              </div>
            ) : depositPaid ? (
              <button
                onClick={() => handlePay('final')}
                disabled={paying}
                style={{ width: '100%', padding: '13px', borderRadius: 8, border: 'none', background: paying ? 'rgba(200,32,42,0.4)' : RED, color: 'white', fontSize: 13, fontFamily: UI_FONT, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 500, cursor: paying ? 'not-allowed' : 'pointer', boxShadow: paying ? 'none' : '0 4px 20px rgba(200,32,42,0.4)', transition: 'all 0.2s' }}
              >
                {paying ? 'Redirecting to Stripe…' : `Pay $${finalAmount} Final Balance →`}
              </button>
            ) : (
              <p style={{ fontSize: 12, color: 'rgba(245,239,224,0.3)', margin: 0, fontFamily: BODY }}>
                Available after deposit is paid.
              </p>
            )}
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(245,239,224,0.3)', marginTop: 24, lineHeight: 1.6, fontFamily: BODY }}>
          Questions? Contact Garrett at{' '}
          <a href="mailto:garrett@pescaderomusic.com" style={{ color: BLUE, textDecoration: 'none' }}>garrett@pescaderomusic.com</a>
        </p>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#07111A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(245,239,224,0.4)', fontFamily: 'sans-serif' }}>Loading…</p>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}
