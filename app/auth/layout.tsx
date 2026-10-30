'use client'

import { usePathname, useRouter } from 'next/navigation'

const tabs = [
  { href: '/auth/login', label: 'Sign In', match: ['/auth/login'] },
  { href: '/auth/signup', label: 'Create Account', match: ['/auth/signup'] },
  { href: '/auth/forgot-password', label: 'Forgot Password', match: ['/auth/forgot-password', '/auth/reset-password'] },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased flex flex-col">
      <header className="w-full py-space-md px-6 md:px-margin flex items-center justify-between border-b-2 border-primary">
        <a
          className="flex items-center gap-space-sm no-underline"
          href="/"
          onClick={(e) => {
            e.preventDefault()
            router.push('/')
          }}
        >
          <div className="w-7 h-7 bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md uppercase">
            PM
          </div>
          <span className="font-headline-sm text-headline-sm text-primary no-underline">Pescadero Music</span>
        </a>
        <div className="hidden sm:block font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
          Client Portal
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 md:px-margin-mobile py-space-xl bg-background">
        <div className="flex flex-col w-full max-w-6xl mx-auto py-space-md">
          <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md px-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest border-b border-primary/20 pb-space-xs">
            <div className="flex items-center gap-space-sm">
              <span className="inline-block w-2 h-2 bg-secondary" />
              <span>Pescadero Music • Client Portal</span>
            </div>
            <div className="hidden md:flex items-center gap-space-lg">
              <span>Provo, Utah</span>
              <span>40.2338° N, 111.6585° W</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            {/* Side placard */}
            <div className="lg:col-span-4 flex flex-col gap-space-md order-2 lg:order-1">
              <div className="bg-surface-container p-space-lg relative overflow-hidden shadow-[4px_4px_0px_0px_#07111A]">
                <div className="flex items-start justify-between mb-space-md">
                  <div className="relative w-20 h-20 bg-primary text-on-primary rounded-full flex items-center justify-center p-1">
                    <svg className="absolute inset-0 w-full h-full text-surface/20" fill="none" stroke="currentColor" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="46" strokeWidth="0.75" />
                      <circle cx="50" cy="50" r="32" strokeWidth="0.75" />
                      <circle cx="50" cy="50" r="18" strokeDasharray="4 2" strokeWidth="0.75" />
                      <circle cx="50" cy="50" fill="#C8202A" r="6" />
                    </svg>
                    <span className="font-label-lg text-label-lg tracking-wider text-surface relative z-10 font-bold">PM</span>
                  </div>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface leading-tight mb-space-xs">
                  Pescadero Music Client Portal
                </h3>
                <p className="font-editorial-note text-editorial-note text-on-surface-variant italic mb-space-md">
                  "Your day. Your music. Our sound."
                </p>
                <div className="w-full bg-surface-container-high p-space-sm mb-space-md overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-full h-36 object-cover object-top"
                    src="/images/site/garrett-portrait.jpg"
                    alt="Garrett at the Pescadero Music DJ booth"
                  />
                </div>
                <div className="space-y-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase">
                  <div className="flex justify-between py-1 border-b border-primary/10">
                    <span>Your Portal</span>
                    <span className="text-on-surface font-semibold">Inquiry → Contract → Event</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-primary/10">
                    <span>Service Area</span>
                    <span className="text-on-surface">Utah County</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary-container text-on-primary p-space-md">
                <div className="flex items-center gap-space-xs mb-space-xs text-secondary-fixed">
                  <span className="material-symbols-outlined text-base">support_agent</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest">Direct Line</span>
                </div>
                <p className="font-body-sm text-body-sm text-primary-fixed-dim leading-snug mb-space-sm">
                  Have a question before you sign in? Reach out directly.
                </p>
                <div className="font-headline-sm text-headline-sm text-on-primary tracking-wide mb-0.5">
                  (210) 727-9328
                </div>
                <div className="font-label-sm text-label-sm text-primary-fixed-dim uppercase tracking-wider">
                  Garrett • Founder &amp; DJ
                </div>
              </div>
            </div>

            {/* Main card */}
            <div className="lg:col-span-8 bg-surface-container-low shadow-[6px_6px_0px_0px_#07111A] overflow-hidden order-1 lg:order-2">
              <div className="bg-primary text-on-primary px-space-lg py-space-sm flex flex-wrap items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-sm">
                  <span className="w-2.5 h-2.5 bg-secondary inline-block" />
                  <span className="font-label-md text-label-md tracking-widest uppercase">Pescadero Music</span>
                </div>
              </div>

              <div className="p-space-lg md:p-space-xl">
                <div className="mb-space-lg">
                  <h1 className="font-display-xl text-display-xl-mobile md:text-display-xl font-normal text-on-surface tracking-tight leading-none mb-space-xs">
                    Client Portal
                  </h1>
                  <p className="font-editorial-note text-editorial-note text-on-surface-variant italic leading-relaxed max-w-2xl">
                    Track your inquiry, sign your contract, plan your music, and see what's next.
                  </p>
                </div>

                <div className="flex items-stretch border-b-2 border-primary mb-space-lg">
                  {tabs.map((t) => {
                    const active = t.match.includes(pathname)
                    return (
                      <a
                        key={t.href}
                        href={t.href}
                        onClick={(e) => {
                          e.preventDefault()
                          router.push(t.href)
                        }}
                        className={`flex-1 py-space-sm px-space-sm md:px-space-md text-center font-label-md text-label-md uppercase tracking-wider transition-all cursor-pointer no-underline ${
                          active ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {t.label}
                      </a>
                    )
                  })}
                </div>

                {children}
              </div>
            </div>
          </div>

          <div className="mt-space-md px-space-xs flex flex-wrap items-center justify-between text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest gap-space-sm">
            <div>
              Questions? <span className="text-on-surface font-semibold">garrett@pescaderomusic.com</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-space-md px-6 md:px-margin flex items-center justify-between border-t border-primary/20 text-on-surface-variant font-label-sm text-label-sm uppercase">
        <span className="tracking-wider">© {new Date().getFullYear()} Pescadero Music</span>
      </footer>
    </div>
  )
}
