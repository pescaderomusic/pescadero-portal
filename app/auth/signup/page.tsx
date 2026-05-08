'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

    // Update profile with phone
    if (data.user) {
      await supabase.from('profiles').update({ phone }).eq('id', data.user.id)
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          fontFamily: 'Georgia, serif', fontStyle: 'italic',
          fontSize: 28, fontWeight: 700, color: '#D63031',
          textShadow: '0 0 16px rgba(214,48,49,0.4)', lineHeight: 1,
        }}>Pescadero</div>
        <div style={{
          fontFamily: 'monospace', fontSize: 10, fontWeight: 700,
          letterSpacing: '5px', color: '#4FB9AF',
          textShadow: '0 0 8px rgba(79,185,175,0.5)',
          textTransform: 'uppercase', marginTop: 2,
        }}>MUSIC</div>
        <p style={{
          marginTop: 16, fontSize: 13, color: 'rgba(232,224,213,0.5)',
          fontFamily: 'Poppins, sans-serif',
        }}>Create your client account</p>
      </div>

      <div className="pm-card" style={{ border: '1px solid rgba(79,185,175,0.15)' }}>
        <h1 style={{
          fontFamily: 'Lora, serif', fontSize: 22, fontWeight: 600,
          color: 'white', marginBottom: 8,
        }}>Let's get started</h1>
        <p style={{
          fontSize: 13, color: 'rgba(232,224,213,0.45)',
          marginBottom: 24, fontFamily: 'Poppins, sans-serif',
        }}>
          Your account keeps everything in one place — contract, timeline, playlist, and more.
        </p>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="pm-label">Full Name</label>
            <input
              className="pm-input"
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Jane & John Doe"
              required
            />
          </div>
          <div>
            <label className="pm-label">Email</label>
            <input
              className="pm-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="pm-label">Phone</label>
            <input
              className="pm-input"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="(555) 867-5309"
            />
          </div>
          <div>
            <label className="pm-label">Password</label>
            <input
              className="pm-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              minLength={6}
              required
            />
          </div>

          {error && <div className="pm-error">{error}</div>}

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p style={{
          marginTop: 20, textAlign: 'center',
          fontSize: 13, color: 'rgba(232,224,213,0.45)',
          fontFamily: 'Poppins, sans-serif',
        }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: '#4FB9AF', textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
