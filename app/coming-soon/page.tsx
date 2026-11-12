'use client'

import { useState } from 'react'

export default function ComingSoonPage() {
  const [code, setCode] = useState('')
  const [state, setState] = useState<'idle' | 'checking' | 'wrong'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setState('checking')
    const res = await fetch('/api/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    if (res.ok) {
      // Reload the page they asked for; the middleware now lets them through.
      window.location.reload()
    } else {
      setState('wrong')
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased flex flex-col items-center justify-center px-6 py-space-xl">
      <meta name="robots" content="noindex" />
      <div className="w-full max-w-md bg-surface p-space-lg md:p-space-xl shadow-[8px_8px_0px_0px_#07111A] flex flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.png" alt="Pescadero Music" className="w-32 h-32 object-contain mb-space-md" />
        <span className="bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest px-space-sm py-0.5 mb-space-sm">
          Pescadero Music
        </span>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight leading-tight">
          Website under <span className="italic text-secondary">construction.</span>
        </h1>

        <form onSubmit={submit} className="w-full mt-space-lg flex flex-col gap-space-sm">
          <label className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant text-left" htmlFor="entry-code">
            Entry code
          </label>
          <div className="flex gap-space-sm">
            <input
              id="entry-code"
              type="password"
              autoComplete="off"
              value={code}
              onChange={(e) => { setCode(e.target.value); setState('idle') }}
              className="flex-1 min-w-0 bg-surface-container-lowest text-primary font-body-md text-body-md p-space-sm outline-none border-b-2 border-primary/20 focus:border-secondary transition-colors"
            />
            <button
              type="submit"
              disabled={state === 'checking'}
              className="bg-primary hover:bg-on-background text-on-primary font-label-md text-label-md uppercase tracking-wider px-space-md py-space-sm shadow-[3px_3px_0px_0px_#C8202A] disabled:opacity-50"
            >
              Enter
            </button>
          </div>
          {state === 'wrong' && (
            <p className="font-body-sm text-body-sm text-secondary text-left">That code didn&rsquo;t work.</p>
          )}
        </form>
      </div>

      <div className="mt-space-lg flex flex-col items-center gap-1 font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant text-center">
        <a href="tel:2107279328" className="hover:text-primary">(210) 727-9328</a>
        <a href="mailto:garrett@pescaderomusic.com" className="hover:text-primary normal-case tracking-normal">garrett@pescaderomusic.com</a>
        <a href="/auth/login" className="mt-space-sm text-secondary hover:text-primary">Client Login</a>
      </div>
    </div>
  )
}
