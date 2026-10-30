'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="space-y-space-md">
      <p className="font-body-sm text-body-sm text-on-surface-variant -mt-space-sm mb-space-sm">
        Your account keeps everything in one place — contract, timeline, playlist, and more.
      </p>

      <form onSubmit={handleSignup} className="space-y-space-md">
        <div>
          <label htmlFor="reg-name" className="block font-label-sm text-label-sm uppercase tracking-widest text-on-surface font-bold mb-1">
            Full Name
          </label>
          <div className="relative bg-surface-container-lowest p-space-xs flex items-center border-b-2 border-primary/20 focus-within:border-secondary transition-colors">
            <input
              id="reg-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane &amp; John Doe"
              required
              className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none px-space-xs"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-email" className="block font-label-sm text-label-sm uppercase tracking-widest text-on-surface font-bold mb-1">
            Email
          </label>
          <div className="relative bg-surface-container-lowest p-space-xs flex items-center border-b-2 border-primary/20 focus-within:border-secondary transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant ml-space-xs mr-space-sm text-lg">alternate_email</span>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          <div>
            <label htmlFor="reg-phone" className="block font-label-sm text-label-sm uppercase tracking-widest text-on-surface font-bold mb-1">
              Phone
            </label>
            <div className="relative bg-surface-container-lowest p-space-xs flex items-center border-b-2 border-primary/20 focus-within:border-secondary transition-colors">
              <input
                id="reg-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 867-5309"
                className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none px-space-xs"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-password" className="block font-label-sm text-label-sm uppercase tracking-widest text-on-surface font-bold mb-1">
              Password
            </label>
            <div className="relative bg-surface-container-lowest p-space-xs flex items-center border-b-2 border-primary/20 focus-within:border-secondary transition-colors">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                minLength={6}
                required
                className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none px-space-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-on-surface-variant hover:text-on-surface p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined text-base">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
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
          className="w-full py-space-md px-space-lg bg-primary text-on-primary font-label-lg text-label-lg tracking-widest uppercase text-center flex items-center justify-center gap-space-sm hover:bg-on-surface-variant active:translate-y-0.5 transition-all shadow-[3px_3px_0px_0px_#07111A] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{loading ? 'Creating Account…' : 'Create Account'}</span>
          {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
        </button>
      </form>

      <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-secondary no-underline hover:underline font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  )
}
