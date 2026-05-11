'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const NAVY = '#0D1B2A'
const BLUE = '#44BEC7'
const RED  = '#D62828'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (err) { setError(err.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Poppins, sans-serif', padding: 24,
    }}>
      <div style={{ maxWidth: 420, width: '100%' }}>

        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
          fontSize: 12, marginBottom: 32,
        }}>
          ← Back to Home
        </Link>

        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '36px 32px',
        }}>
          <p style={{ margin: '0 0 6px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>
            Account Recovery
          </p>
          <h1 style={{ margin: '0 0 8px', fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 24, color: 'white' }}>
            Forgot your password?
          </h1>

          {!sent ? (
            <>
              <p style={{ margin: '0 0 28px', fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                No worries. Enter your email and we'll send you a reset link right away.
              </p>

              {error && (
                <div style={{
                  background: 'rgba(214,40,40,0.12)', border: '1px solid rgba(214,40,40,0.3)',
                  borderRadius: 8, padding: '10px 14px', marginBottom: 20,
                  color: '#FF8A80', fontSize: 12,
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: '0.5px' }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 8,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'white', fontSize: 13, fontFamily: 'Poppins, sans-serif',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 8, border: 'none',
                    background: loading ? 'rgba(214,40,40,0.5)' : RED,
                    color: 'white', fontSize: 13, fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                    boxShadow: loading ? 'none' : '0 4px 20px rgba(214,40,40,0.35)',
                  }}
                >
                  {loading ? 'Sending…' : 'Send Reset Link →'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
              <p style={{ fontSize: 14, color: 'white', fontWeight: 600, margin: '0 0 8px' }}>
                Check your inbox
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '0 0 24px' }}>
                We sent a reset link to <strong style={{ color: BLUE }}>{email}</strong>.
                It expires in 1 hour.
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                Didn't get it?{' '}
                <button
                  onClick={() => setSent(false)}
                  style={{ background: 'none', border: 'none', color: BLUE, cursor: 'pointer', fontSize: 11, padding: 0 }}
                >
                  Try again
                </button>
              </p>
            </div>
          )}

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            Remember it?{' '}
            <Link href="/auth/login" style={{ color: BLUE, textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
