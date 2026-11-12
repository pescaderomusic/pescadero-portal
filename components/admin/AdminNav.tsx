'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const TABS = [
  { href: '/admin', label: 'Clients', icon: 'groups' },
  { href: '/admin/inquiries', label: 'Inquiries', icon: 'inbox' },
  { href: '/admin/schedule', label: 'Schedule', icon: 'event' },
  { href: '/admin/reviews', label: 'Reviews', icon: 'star' },
]

const MORE = [
  { href: '/admin/availability', label: 'Availability', icon: 'event_available' },
  { href: '/admin/analytics', label: 'Analytics', icon: 'insights' },
  { href: '/dashboard?client=true', label: 'Client view', icon: 'visibility' },
  { href: '/', label: 'Website', icon: 'public' },
]

function isActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin' || pathname.startsWith('/admin/client') || pathname.startsWith('/admin/contract')
  return pathname.startsWith(href)
}

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => setMoreOpen(false), [pathname])

  const signOut = async () => {
    await createClient().auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const moreActive = MORE.some((m) => m.href.startsWith('/admin') && pathname.startsWith(m.href))
  const focus = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-inset'

  return (
    <>
      {/* Top bar */}
      <header className="bg-primary text-on-primary">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-space-xl h-14 flex items-center justify-between gap-4">
          <Link href="/admin" className={`flex items-center gap-3 no-underline min-w-0 ${focus}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-round.png" alt="" className="w-9 h-9 shrink-0" />
            <span className="font-label-lg text-label-lg uppercase tracking-widest text-on-primary truncate">Admin</span>
          </Link>

          <nav aria-label="Admin" className="hidden md:flex items-center gap-1">
            {[...TABS, ...MORE.slice(0, 2)].map((t) => (
              <Link
                key={t.href}
                href={t.href}
                aria-current={isActive(pathname, t.href) ? 'page' : undefined}
                className={`px-3 py-2 font-label-md text-label-md uppercase tracking-wider no-underline transition-colors ${focus} ${
                  isActive(pathname, t.href) ? 'text-on-primary bg-primary-container border-b-2 border-tertiary' : 'text-on-primary-container hover:text-on-primary'
                }`}
              >
                {t.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link href="/dashboard?client=true" className={`px-3 py-2 font-label-sm text-label-sm uppercase tracking-wider text-on-primary-container hover:text-on-primary no-underline border border-on-primary/25 ${focus}`}>
              Client view
            </Link>
            <button onClick={signOut} className={`px-3 py-2 font-label-sm text-label-sm uppercase tracking-wider text-on-primary-container hover:text-on-primary border border-on-primary/25 ${focus}`}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Phone: "More" sheet */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-[90]" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-primary/40" />
          <div
            id="admin-more"
            className="absolute left-0 right-0 bg-surface shadow-[0_-4px_0_0_#07111A] p-2"
            style={{ bottom: 'calc(64px + env(safe-area-inset-bottom))' }}
            onClick={(e) => e.stopPropagation()}
          >
            {MORE.map((m) => (
              <Link key={m.href} href={m.href} className={`flex items-center gap-3 px-4 min-h-[52px] text-primary no-underline font-label-lg text-label-lg uppercase tracking-wider hover:bg-surface-container ${focus}`}>
                <span className="material-symbols-outlined text-[22px]" aria-hidden="true">{m.icon}</span>
                {m.label}
              </Link>
            ))}
            <button onClick={signOut} className={`w-full flex items-center gap-3 px-4 min-h-[52px] text-secondary font-label-lg text-label-lg uppercase tracking-wider hover:bg-surface-container ${focus}`}>
              <span className="material-symbols-outlined text-[22px]" aria-hidden="true">logout</span>
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Phone: bottom tab bar */}
      <nav
        aria-label="Admin"
        className="md:hidden fixed bottom-0 left-0 right-0 z-[95] bg-primary text-on-primary border-t-2 border-tertiary"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 h-16">
          {TABS.map((t) => {
            const active = isActive(pathname, t.href)
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 no-underline ${focus} ${active ? 'text-tertiary' : 'text-on-primary-container'}`}
              >
                <span className="material-symbols-outlined text-[24px]" aria-hidden="true" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                  {t.icon}
                </span>
                <span className="font-label-sm text-[11px] uppercase tracking-wider">{t.label}</span>
              </Link>
            )
          })}
          <button
            onClick={() => setMoreOpen((o) => !o)}
            aria-expanded={moreOpen}
            aria-controls="admin-more"
            className={`flex flex-col items-center justify-center gap-0.5 ${focus} ${moreOpen || moreActive ? 'text-tertiary' : 'text-on-primary-container'}`}
          >
            <span className="material-symbols-outlined text-[24px]" aria-hidden="true">more_horiz</span>
            <span className="font-label-sm text-[11px] uppercase tracking-wider">More</span>
          </button>
        </div>
      </nav>
    </>
  )
}
