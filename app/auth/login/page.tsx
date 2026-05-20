'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const BLUE     = '#44BEC7'
const RED      = '#C8202A'
const CREAM    = '#F5EFE0'
const DISPLAY  = "'freight-display-pro', Georgia, serif"
const UI_FONT  = "'futura-pt-condensed', 'Barlow Condensed', sans-serif"
const BODY     = "'inter', system-ui, sans-serif"
const WORDMARK = "'RetroFloral', 'Barlow Condensed', sans-serif"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <img src="https://shxcw5yjydy1kgql.public.blob.vercel-storage.com/logo.png" alt="Pescadero Music" style={{ height: 40, width: 40, objectFit: 'contain' }} />
          <span style={{ fontFamily: WORDMARK, fontSize: 18, letterSpacing: '4px', color: CREAM, textTransform: 'uppercase' }}>Pescadero Music</span>
        </div>
        <p style={{ marginTop: 12, fontSize: 13, color: 'rgba(245,239,224,0.5)', fontFamily: BODY }}>
          Client Portal
        </p>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(245,239,224,0.3)', textDecoration: 'none', fontSize: 11, fontFamily: UI_FONT, letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: 8 }}>
          ← Back to Home
        </a>
      </div>

      <div className="pm-card" style={{ border: '1px solid rgba(68,190,199,0.15)' }}>
        <h1 style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 300, color: CREAM, marginBottom: 24 }}>
          Welcome back
        </h1>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="pm-label">Email</label>
            <input className="pm-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <label className="pm-label">Password</label>
            <input className="pm-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            <div style={{ textAlign: 'right', marginTop: 6 }}>
              <a href="/auth/forgot-password" style={{ fontSize: 11, color: `rgba(68,190,199,0.7)`, textDecoration: 'none', fontFamily: UI_FONT, letterSpacing: '1px' }}>
                Forgot your password?
              </a>
            </div>
          </div>

          {error && <div className="pm-error">{error}</div>}

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'rgba(245,239,224,0.45)', fontFamily: BODY }}>
          New client?{' '}
          <Link href="/auth/signup" style={{ color: BLUE, textDecoration: 'none', fontWeight: 500 }}>Create your account</Link>
        </p>
      </div>

      <p style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: 'rgba(245,239,224,0.25)', fontFamily: BODY }}>
        garrett@pescaderomusic.com · (210) 727-9328
      </p>
    </div>
  )
}
