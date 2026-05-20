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

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').update({ phone }).eq('id', data.user.id)
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div>
      {/* Logo + back */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <img src="https://shxcw5yjydy1kgql.public.blob.vercel-storage.com/logo.png" alt="Pescadero Music" style={{ height: 40, width: 40, objectFit: 'contain' }} />
          <span style={{ fontFamily: WORDMARK, fontSize: 18, letterSpacing: '4px', color: CREAM, textTransform: 'uppercase' }}>Pescadero Music</span>
        </div>
        <p style={{ marginTop: 12, fontSize: 13, color: 'rgba(245,239,224,0.5)', fontFamily: BODY }}>
          Create your client account
        </p>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(245,239,224,0.3)', textDecoration: 'none', fontSize: 11, fontFamily: UI_FONT, letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: 8 }}>
          ← Back to Home
        </a>
      </div>

      <div className="pm-card" style={{ border: '1px solid rgba(68,190,199,0.15)' }}>
        <h1 style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 300, color: CREAM, marginBottom: 8 }}>
          Let's get started
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(245,239,224,0.45)', marginBottom: 24, fontFamily: BODY, lineHeight: 1.6 }}>
          Your account keeps everything in one place — contract, timeline, playlist, and more.
        </p>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="pm-label">Full Name</label>
            <input className="pm-input" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane & John Doe" required />
          </div>
          <div>
            <label className="pm-label">Email</label>
            <input className="pm-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <label className="pm-label">Phone</label>
            <input className="pm-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 867-5309" />
          </div>
          <div>
            <label className="pm-label">Password</label>
            <input className="pm-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" minLength={6} required />
          </div>

          {error && <div className="pm-error">{error}</div>}

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'rgba(245,239,224,0.45)', fontFamily: BODY }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: BLUE, textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
