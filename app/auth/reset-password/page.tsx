'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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
    <div className="space-y-space-md">
      {done ? (
        <div className="text-center py-space-md">
          <span className="material-symbols-outlined text-5xl text-secondary mb-space-sm block">check_circle</span>
          <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface mb-space-xs">Password updated</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Redirecting you to sign in…</p>
        </div>
      ) : !ready ? (
        <div className="text-center py-space-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">Verifying your reset link…</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">
            If this takes too long,{' '}
            <Link href="/auth/forgot-password" className="text-secondary no-underline hover:underline">
              request a new link
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          <div className="bg-surface-container p-space-md border-l-4 border-secondary">
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">Set a New Password</h4>
            <p className="font-editorial-note text-editorial-note text-on-surface-variant italic leading-snug">
              Choose a strong password with at least 8 characters.
            </p>
          </div>

          {error && (
            <div className="bg-secondary/10 border border-secondary/30 p-space-sm font-body-sm text-body-sm text-secondary">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-space-md">
            <div>
              <label htmlFor="new-password" className="block font-label-sm text-label-sm uppercase tracking-widest text-on-surface font-bold mb-1">
                New Password
              </label>
              <div className="relative bg-surface-container-lowest p-space-xs flex items-center border-b-2 border-primary/20 focus-within:border-secondary transition-colors">
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none px-space-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block font-label-sm text-label-sm uppercase tracking-widest text-on-surface font-bold mb-1">
                Confirm Password
              </label>
              <div
                className={`relative bg-surface p-space-xs flex items-center border ${
                  confirm && confirm !== password ? 'border-secondary' : 'border-primary'
                }`}
              >
                <input
                  id="confirm-password"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none px-space-xs"
                />
              </div>
              {confirm && confirm !== password && (
                <p className="font-body-sm text-body-sm text-secondary mt-1">Passwords don't match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (!!confirm && confirm !== password)}
              className="w-full py-space-md px-space-lg bg-secondary text-on-secondary font-label-lg text-label-lg tracking-widest uppercase text-center hover:brightness-110 active:translate-y-0.5 transition-all shadow-[3px_3px_0px_0px_#07111A] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating…' : 'Update Password →'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
