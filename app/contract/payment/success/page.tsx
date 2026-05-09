'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const NAVY = '#0D1B2A'
const BLUE = '#44BEC7'
const RED  = '#D62828'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId   = searchParams.get('session_id')
  const type        = searchParams.get('type') ?? 'deposit'
  const [status, setStatus]   = useState<'verifying' | 'done' | 'error'>('verifying')
  const [errMsg, setErrMsg]   = useState('')

  useEffect(() => {
    if (!sessionId) { setErrMsg('No session_id in URL'); setStatus('error'); return }

    fetch('/api/stripe/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then(async r => {
        const data = await r.json()
        if (data.ok) {
          setStatus('done')
          setTimeout(() => router.push(`/dashboard?session_id=${sessionId}&type=${type}`), 2200)
        } else {
          setErrMsg(data.error ?? `HTTP ${r.status}`)
          setStatus('error')
        }
      })
      .catch(e => { setErrMsg(e.message); setStatus('error') })
  }, [sessionId, type, router])

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Poppins, sans-serif', padding: 24,
    }}>
      <div style={{ maxWidth: 460, width: '100%', textAlign: 'center' }}>

        {status === 'verifying' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
            <h2 style={{ color: 'white', fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 24, margin: '0 0 10px' }}>
              Confirming payment…
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Just a moment</p>
          </>
        )}

        {status === 'done' && (
          <>
            <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
            <h2 style={{ color: BLUE, fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 26, margin: '0 0 10px' }}>
              {type === 'deposit' ? 'Deposit received!' : 'Payment complete!'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.6, margin: '0 0 20px' }}>
              {type === 'deposit'
                ? 'Your date is officially locked in. Taking you back to your dashboard…'
                : 'Your booking is fully confirmed. Taking you back to your dashboard…'}
            </p>
            <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: BLUE, borderRadius: 2,
                animation: 'bar 2.2s linear forwards',
              }} />
            </div>
            <style>{`@keyframes bar { from { width:0% } to { width:100% } }`}</style>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
            <h2 style={{ color: 'white', fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 22, margin: '0 0 10px' }}>
              Something went wrong
            </h2>
            {errMsg && (
              <pre style={{
                background: 'rgba(255,255,255,0.05)', borderRadius: 8,
                padding: '10px 14px', fontSize: 11, color: '#FF8A80',
                textAlign: 'left', wordBreak: 'break-all', whiteSpace: 'pre-wrap',
                margin: '0 0 20px',
              }}>{errMsg}</pre>
            )}
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 20 }}>
              Your Stripe payment likely went through — screenshot this and send to Garrett.
            </p>
            <a href="/dashboard" style={{
              display: 'inline-block', background: RED, color: 'white',
              textDecoration: 'none', borderRadius: 8, padding: '12px 28px',
              fontSize: 13, fontWeight: 700,
            }}>Back to Dashboard →</a>
          </>
        )}

      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0D1B2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif', fontSize: 13 }}>Loading…</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
