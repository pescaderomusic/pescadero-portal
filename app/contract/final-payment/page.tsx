'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const NAVY = '#0D1B2A'
const BLUE = '#44BEC7'
const RED  = '#D62828'

export default function FinalPaymentPage() {
  const router = useRouter()
  const [contract, setContract] = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [paying, setPaying]     = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('contracts').select('*').eq('client_id', user.id).order('created_at', { ascending: false }).limit(1).single()
      setContract(data)
      setLoading(false)
    })
  }, [router])

  const handlePay = async () => {
    if (!contract) return
    setPaying(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: contract.id, type: 'final' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      if (data.url) window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setPaying(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Poppins, sans-serif' }}>Loading…</p>
    </div>
  )

  const finalPaid   = contract?.status === 'fully_paid'
  const depositPaid = contract?.status === 'deposit_paid' || contract?.status === 'fully_paid' || !!contract?.deposit_paid_at
  const finalAmt    = contract?.final_payment_amount ?? 0
  const dueDate     = contract?.final_payment_due
    ? new Date(contract.final_payment_due + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '7 days before your event'

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', padding: 24 }}>
      <div style={{ maxWidth: 500, width: '100%' }}>

        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: 11, marginBottom: 28, letterSpacing: '1px' }}>
          ← Dashboard
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ margin: '0 0 8px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>Step 06 — Final Payment</p>
          <h1 style={{ margin: '0 0 8px', fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 28, color: 'white' }}>Balance Due</h1>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Due by {dueDate}</p>
        </div>

        {finalPaid ? (
          <div style={{ background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.25)', borderRadius: 14, padding: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: 48, margin: '0 0 16px' }}>✅</p>
            <h2 style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', color: 'white', fontSize: 22, margin: '0 0 8px' }}>Fully Paid!</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 24px' }}>Your booking is completely confirmed. See you on event day!</p>
            <Link href="/dashboard" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 8, background: RED, color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
              Back to Dashboard →
            </Link>
          </div>
        ) : !depositPaid ? (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 20px' }}>Final payment is available after your deposit is paid.</p>
            <Link href="/contract/payment" style={{ display: 'inline-block', padding: '12px 24px', borderRadius: 8, background: RED, color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
              Pay Deposit First →
            </Link>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '28px 32px' }}>

            {/* Amount */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Final Balance</p>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{contract?.event_type || 'Live Sound Service'}</p>
              </div>
              <span style={{ fontSize: 32, fontWeight: 700, color: 'white' }}>${finalAmt}</span>
            </div>

            {/* Security note */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 22, padding: '12px 14px', background: 'rgba(68,190,199,0.06)', borderRadius: 9, border: '1px solid rgba(68,190,199,0.15)' }}>
              <span style={{ fontSize: 16 }}>🔒</span>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                Redirects to <strong style={{ color: BLUE }}>Stripe</strong> — your card is never stored by Pescadero Music.
              </p>
            </div>

            {error && (
              <div style={{ background: 'rgba(214,40,40,0.1)', border: '1px solid rgba(214,40,40,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#FF8A80', fontSize: 12 }}>
                {error}
              </div>
            )}

            <button onClick={handlePay} disabled={paying || finalAmt === 0} style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: paying ? 'rgba(214,40,40,0.5)' : RED, color: 'white', fontSize: 14, fontWeight: 700, cursor: paying ? 'not-allowed' : 'pointer', fontFamily: 'Poppins, sans-serif', boxShadow: paying ? 'none' : '0 4px 24px rgba(214,40,40,0.35)' }}>
              {paying ? 'Redirecting to Stripe…' : `Pay $${finalAmt} Final Balance →`}
            </button>

            <p style={{ textAlign: 'center', marginTop: 14, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
              Questions? Email garrett@pescaderomusic.com
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
