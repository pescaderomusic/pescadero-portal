'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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
    <div className="space-y-space-md">
      <div className="bg-surface-container p-space-md border-l-4 border-secondary">
        <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">Password Recovery</h4>
        <p className="font-editorial-note text-editorial-note text-on-surface-variant italic leading-snug">
          Enter your account email and we'll send a reset link right away.
        </p>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-space-md">
          <div>
            <label htmlFor="reset-email" className="block font-label-sm text-label-sm uppercase tracking-widest text-on-surface font-bold mb-1">
              Email
            </label>
            <div className="relative bg-surface-container-lowest p-space-xs flex items-center border-b-2 border-primary/20 focus-within:border-secondary transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant ml-space-xs mr-space-sm text-lg">mail_lock</span>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="bg-secondary/10 border border-secondary/30 p-space-sm font-body-sm text-body-sm text-secondary">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-space-sm">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-space-md bg-secondary text-on-secondary font-label-lg text-label-lg tracking-widest uppercase hover:brightness-110 active:translate-y-0.5 transition-all shadow-[3px_3px_0px_0px_#07111A] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending…' : 'Send Reset Link →'}
            </button>
            <Link
              href="/auth/login"
              className="py-space-md px-space-lg bg-surface-container text-on-surface font-label-md text-label-md uppercase tracking-wider hover:bg-surface-container-high transition-colors text-center"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      ) : (
        <div className="text-center py-space-md">
          <span className="material-symbols-outlined text-5xl text-secondary mb-space-sm block">mark_email_read</span>
          <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface mb-space-xs">Check your inbox</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
            We sent a reset link to <strong className="text-secondary">{email}</strong>. It expires in 1 hour.
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Didn't get it?{' '}
            <button onClick={() => setSent(false)} className="text-secondary no-underline hover:underline">
              Try again
            </button>
          </p>
        </div>
      )}
    </div>
  )
}
