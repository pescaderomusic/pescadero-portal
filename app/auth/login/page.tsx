'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="space-y-space-md">
      <form onSubmit={handleLogin} className="space-y-space-md">
        <div>
          <label htmlFor="login-email" className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface font-bold mb-1 block">
            Email
          </label>
          <div className="relative bg-surface-container-lowest p-space-xs flex items-center border-b-2 border-primary/20 focus-within:border-secondary transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant ml-space-xs mr-space-sm text-lg">mail</span>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="login-password" className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface font-bold">
              Password
            </label>
            <Link href="/auth/forgot-password" className="font-label-sm text-label-sm text-secondary uppercase no-underline hover:underline">
              Forgot?
            </Link>
          </div>
          <div className="relative bg-surface-container-lowest p-space-xs flex items-center border-b-2 border-primary/20 focus-within:border-secondary transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant ml-space-xs mr-space-sm text-lg">key</span>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="text-on-surface-variant hover:text-on-surface mr-space-xs flex items-center justify-center p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <span className="material-symbols-outlined text-base">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-secondary/10 border border-secondary/30 p-space-sm font-body-sm text-body-sm text-secondary">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-space-md px-space-lg bg-secondary text-on-secondary font-label-lg text-label-lg tracking-widest uppercase text-center flex items-center justify-center gap-space-sm hover:brightness-110 active:translate-y-0.5 transition-all shadow-[3px_3px_0px_0px_#07111A] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{loading ? 'Signing In…' : 'Sign In'}</span>
          {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
        </button>
      </form>

      <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
        New client?{' '}
        <Link href="/auth/signup" className="text-secondary no-underline hover:underline font-semibold">
          Create your account
        </Link>
      </p>
    </div>
  )
}
