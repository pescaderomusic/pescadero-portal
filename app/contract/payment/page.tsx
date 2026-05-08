'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const TEAL = '#4FB9AF'
const RED = '#D63031'
const NAVY = '#0F1F35'
const GOLD = '#C8A96E'

export default function PaymentPage() {
  const supabase = createClient()
  const [contract, setContract] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }

      const { data } = await supabase
        .from('contracts')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      setContract(data)
      setLoading(false)
    }
    load()
  }, [])

  async function handlePayment(type: 'deposit' | 'final') {
    setRedirecting(true)
    const res = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contractId: contract.id, type }),
    })
    const { url, error } = await res.json()
    if (url) window.location.href = url
    else { console.error(error); setRedirecting(false) }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(232,224,213,0.4)', fontFamily: 'Poppins, sans-serif' }}>Loading...</p>
    </div>
  )

  if (!contract) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <p style={{ color: 'rgba(232,224,213,0.4)', fontFamily: 'Poppins, sans-serif' }}>No contract found.</p>
      <Link href="/dashboard" style={{ color: TEAL, fontFamily: 'Poppins, sans-serif', fontSize: 13 }}>← Back to Dashboard</Link>
    </div>
  )

  const depositAmount = contract.deposit_amount || 100
  const finalAmount = contract.final_payment_amount || 0
  const depositPaid = contract.status === 'deposit_paid' || contract.status === 'complete'
  const finalPaid = contract.status === 'complete'

  const fmtDate = (d: string | null) => {
    if (!d) return 'TBD'
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, fontFamily: 'Poppins, sans-serif' }}>

      {/* Nav */}
      <nav style={{ background: 'rgba(10,24,40,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(79,185,175,0.12)', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '3px', color: TEAL, textTransform: 'uppercase' }}>PESCADERO MUSIC</span>
        <Link href="/dashboard" style={{ fontSize: 11, color: 'rgba(232,224,213,0.4)', textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase' }}>← Dashboard</Link>
      </nav>

      <div style={{ maxWidth: 560, margin: '48px auto', padding: '0 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <p style={{ margin: '0 0 8px', fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: TEAL }}>Payment</p>
          <h1 style={{ margin: '0 0 6px', fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 28, color: 'white' }}>Secure Your Date</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(232,224,213,0.4)' }}>
            {contract.event_type} · {fmtDate(contract.event_date)} · {contract.venue_name}
          </p>
        </div>

        {/* Stripe notice */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🔒</span>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: 'white' }}>Secure Payment via Stripe</p>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(232,224,213,0.5)', lineHeight: 1.6 }}>
              Clicking "Pay Now" will redirect you to <strong style={{ color: 'rgba(232,224,213,0.8)' }}>Stripe</strong>, our trusted payment processor. Pescadero Music never stores or sees your card details — all payments are handled securely by Stripe and encrypted end-to-end.
            </p>
          </div>
        </div>

        {/* Payment cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Deposit */}
          <div style={{
            background: depositPaid ? 'rgba(79,185,175,0.06)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${depositPaid ? 'rgba(79,185,175,0.25)' : 'rgba(255,255,255,0.08)'}`,
            borderLeft: `3px solid ${depositPaid ? TEAL : GOLD}`,
            borderRadius: 12, padding: '20px 22px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 600, color: 'white', fontFamily: 'Lora, serif' }}>
                  {depositPaid ? '✓ Deposit Paid' : 'Step 1 — Deposit'}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(232,224,213,0.4)' }}>
                  Non-refundable · Due: {fmtDate(contract.deposit_due_date)}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: depositPaid ? TEAL : 'white', fontFamily: 'Lora, serif' }}>${depositAmount}</p>
              </div>
            </div>
            {!depositPaid && (
              <button onClick={() => handlePayment('deposit')} disabled={redirecting} style={{
                width: '100%', background: RED, color: 'white', border: 'none',
                borderRadius: 8, padding: '12px', fontSize: 13, fontWeight: 700,
                cursor: redirecting ? 'wait' : 'pointer', fontFamily: 'Poppins, sans-serif',
                boxShadow: '0 4px 16px rgba(214,48,49,0.35)', marginTop: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {redirecting ? '⏳ Redirecting to Stripe…' : `Pay $${depositAmount} Deposit → Stripe`}
              </button>
            )}
            {depositPaid && (
              <div style={{ background: 'rgba(79,185,175,0.08)', border: '1px solid rgba(79,185,175,0.2)', borderRadius: 7, padding: '8px 12px', marginTop: 8 }}>
                <p style={{ margin: 0, fontSize: 11, color: TEAL }}>✓ Deposit received. Your date is locked in!</p>
              </div>
            )}
          </div>

          {/* Final Payment */}
          <div style={{
            background: finalPaid ? 'rgba(79,185,175,0.06)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${finalPaid ? 'rgba(79,185,175,0.25)' : 'rgba(255,255,255,0.06)'}`,
            borderLeft: `3px solid ${finalPaid ? TEAL : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 12, padding: '20px 22px',
            opacity: (!depositPaid && !finalPaid) ? 0.5 : 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 600, color: 'white', fontFamily: 'Lora, serif' }}>
                  {finalPaid ? '✓ Final Payment Complete' : 'Step 2 — Final Payment'}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(232,224,213,0.4)' }}>
                  Due: {fmtDate(contract.final_payment_due)} · 7 days before event
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: finalPaid ? TEAL : 'white', fontFamily: 'Lora, serif' }}>${finalAmount}</p>
              </div>
            </div>
            {depositPaid && !finalPaid && (
              <button onClick={() => handlePayment('final')} disabled={redirecting} style={{
                width: '100%', background: RED, color: 'white', border: 'none',
                borderRadius: 8, padding: '12px', fontSize: 13, fontWeight: 700,
                cursor: redirecting ? 'wait' : 'pointer', fontFamily: 'Poppins, sans-serif',
                boxShadow: '0 4px 16px rgba(214,48,49,0.35)', marginTop: 8,
              }}>
                {redirecting ? '⏳ Redirecting to Stripe…' : `Pay $${finalAmount} Final Balance → Stripe`}
              </button>
            )}
            {!depositPaid && !finalPaid && (
              <p style={{ margin: '8px 0 0', fontSize: 11, color: 'rgba(232,224,213,0.3)', fontStyle: 'italic' }}>Complete your deposit first to unlock final payment.</p>
            )}
          </div>
        </div>

        {/* Total summary */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 24, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'rgba(232,224,213,0.4)' }}>Total Contract Value</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'white', fontFamily: 'Lora, serif' }}>${(Number(contract.package_price || 0) + Number(contract.travel_fee || 0)).toLocaleString()}</span>
        </div>

        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 10, color: 'rgba(232,224,213,0.2)', lineHeight: 1.6 }}>
          Questions about your payment? Contact Garrett at garrett@pescaderomusic.com or (210) 727-9328
        </p>
      </div>
    </div>
  )
}
