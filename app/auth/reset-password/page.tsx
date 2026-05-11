'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const NAVY = '#0D1B2A'
const BLUE = '#44BEC7'
const RED  = '#D62828'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [done, setDone]           = useState(false)
  const [ready, setReady]         = useState(false)

  // Supabase fires an onAuthStateChange with SIGNED_IN + type=RECOVERY
  // when the user lands from the reset email link
  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    // Also check if already in a session from the recovery link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) { setError(err.message); setLoading(false); return }
    setDone(true)
    setTimeout(() => router.push('/auth/login'), 2500)
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
            Set a new password
          </h1>

          {done ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <p style={{ fontSize: 14, color: 'white', fontWeight: 600, margin: '0 0 8px' }}>Password updated!</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Redirecting you to sign in…</p>
            </div>
          ) : !ready ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                Verifying your reset link…
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 12 }}>
                If this takes too long,{' '}
                <Link href="/auth/forgot-password" style={{ color: BLUE, textDecoration: 'none' }}>
                  request a new link
                </Link>.
              </p>
            </div>
          ) : (
            <>
              <p style={{ margin: '0 0 28px', fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                Choose a strong password with at least 8 characters.
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
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                    New password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 8,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'white', fontSize: 13, fontFamily: 'Poppins, sans-serif',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 8,
                      background: 'rgba(255,255,255,0.06)',
                      border: `1px solid ${confirm && confirm !== password ? 'rgba(214,40,40,0.5)' : 'rgba(255,255,255,0.12)'}`,
                      color: 'white', fontSize: 13, fontFamily: 'Poppins, sans-serif',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  {confirm && confirm !== password && (
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: '#FF8A80' }}>Passwords don't match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || (!!confirm && confirm !== password)}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 8, border: 'none',
                    background: loading ? 'rgba(214,40,40,0.5)' : RED,
                    color: 'white', fontSize: 13, fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                    boxShadow: loading ? 'none' : '0 4px 20px rgba(214,40,40,0.35)',
                  }}
                >
                  {loading ? 'Updating…' : 'Update Password →'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
