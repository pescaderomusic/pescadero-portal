'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const NAVY = '#0D1B2A'
const BLUE = '#44BEC7'
const RED  = '#D62828'

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
      {/* Logo + back */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          fontFamily: 'Georgia, serif', fontStyle: 'italic',
          fontSize: 28, fontWeight: 700, color: RED,
          textShadow: `0 0 16px rgba(214,40,40,0.4)`,
          lineHeight: 1,
        }}>
          Pescadero
        </div>
        <div style={{
          fontFamily: 'monospace', fontSize: 10, fontWeight: 700,
          letterSpacing: '5px', color: BLUE,
          textShadow: `0 0 8px rgba(68,190,199,0.5)`,
          textTransform: 'uppercase', marginTop: 2,
        }}>
          MUSIC
        </div>

        <p style={{
          marginTop: 16, fontSize: 13, color: 'rgba(232,224,213,0.5)',
          fontFamily: 'Poppins, sans-serif',
        }}>
          Client Portal
        </p>

        <a href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
          fontSize: 11, fontFamily: 'Poppins, sans-serif', marginTop: 8,
        }}>
          ← Back to Home
        </a>
      </div>

      <div className="pm-card" style={{ border: '1px solid rgba(68,190,199,0.15)' }}>
        <h1 style={{
          fontFamily: 'Lora, serif', fontSize: 22, fontWeight: 600,
          color: 'white', marginBottom: 24,
        }}>
          Welcome back
        </h1>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
            <label className="pm-label">Password</label>
            <input
              className="pm-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <div style={{ textAlign: 'right', marginTop: 6 }}>
              <a href="/auth/forgot-password" style={{
                fontSize: 11, color: `rgba(68,190,199,0.7)`, textDecoration: 'none',
                fontFamily: 'Poppins, sans-serif',
              }}>
                Forgot your password?
              </a>
            </div>
          </div>

          {error && <div className="pm-error">{error}</div>}

          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginTop: 4 }}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <p style={{
          marginTop: 20, textAlign: 'center',
          fontSize: 13, color: 'rgba(232,224,213,0.45)',
          fontFamily: 'Poppins, sans-serif',
        }}>
          New client?{' '}
          <Link href="/auth/signup" style={{ color: BLUE, textDecoration: 'none', fontWeight: 500 }}>
            Create your account
          </Link>
        </p>
      </div>

      <p style={{
        marginTop: 24, textAlign: 'center',
        fontSize: 11, color: 'rgba(232,224,213,0.25)',
        fontFamily: 'Poppins, sans-serif',
      }}>
        garrett@pescaderomusic.com · (210) 727-9328
      </p>
    </div>
  )
}
