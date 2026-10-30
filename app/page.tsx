'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ADMIN_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'

const eventTypes = [
  { id: 'wedding', label: 'Wedding Sound' },
  { id: 'event', label: 'DJ / Party / Event' },
  { id: 'movie', label: 'Outdoor Movie Night' },
] as const

type EventTypeId = (typeof eventTypes)[number]['id']

const heroContent: Record<
  'wedding' | 'cinema',
  { kicker: string; headlineLead: string; headlineEmphasis: string; headlineTail: string; description: string; image: string; alt: string; badge: string; badgeTitle: string; badgeBody: string }
> = {
  wedding: {
    kicker: 'CATALOG NO. PM-8812 — HIGH-FIDELITY LIVE RECEPTION',
    headlineLead: 'Boutique Sound for',
    headlineEmphasis: 'Unforgettable',
    headlineTail: 'Evenings.',
    description:
      'Handcrafted playlists, warm full-range sound, and seamless event flow across Utah Valley, Park City peaks, and mountain destinations. Powered by professional sound systems and careful live mixing.',
    image: '/images/site/hero-wedding.jpg',
    alt: 'Pescadero Music DJ booth set up at a wedding reception with string lights',
    badge: 'FOLIO MASTER 01 • REAL UTAH WEDDINGS',
    badgeTitle: 'Clean, Powerful Sound — Zero Hassle.',
    badgeBody: 'Set up and dialed in for the room, every time — ceremony, cocktail hour, and reception.',
  },
  cinema: {
    kicker: 'CATALOG NO. PM-4090 — OUTDOOR CANVAS',
    headlineLead: 'Outdoor Movie',
    headlineEmphasis: 'Nights',
    headlineTail: 'Under Alpine Stars.',
    description:
      'A complete private outdoor cinema for your backyard, neighborhood, or event space. Inflatable screen, HD projector, and crystal-clear sound — self-contained for up to 3 hours, no power hookup needed.',
    image: 'https://shxcw5yjydy1kgql.public.blob.vercel-storage.com/hero.jpg',
    alt: 'Pescadero Music outdoor movie night setup',
    badge: 'FOLIO MASTER 02 • PRIVATE EVENTS ONLY',
    badgeTitle: 'A Big Screen, Anywhere Outside.',
    badgeBody: 'Large inflatable screen and HD projection for backyard gatherings and private venues. Summer availability only.',
  },
}

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [heroSlide, setHeroSlide] = useState<'wedding' | 'cinema'>('wedding')

  const [selectedType, setSelectedType] = useState<EventTypeId>('wedding')
  const [checkDate, setCheckDate] = useState('')
  const [dateStatus, setDateStatus] = useState<'idle' | 'checking' | 'available' | 'busy'>('idle')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setIsAdmin(data.user?.id === ADMIN_ID)
    })
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMenuOpen(false)
  }

  const handleDateCheck = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCheckDate(val)
    if (!val) {
      setDateStatus('idle')
      return
    }
    setDateStatus('checking')
    try {
      const res = await fetch(`/api/check-availability?date=${val}`)
      const data = await res.json()
      setDateStatus(data.status === 'booked' ? 'busy' : 'available')
    } catch {
      // Fail open — don't block an inquiry over a flaky calendar check
      setDateStatus('available')
    }
  }

  const handleInquiry = () => {
    if (!checkDate || dateStatus === 'busy') return
    router.push(`/inquiry?type=${selectedType}&date=${checkDate}`)
  }

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const h = heroContent[heroSlide]

  const navBtn =
    'font-label-md text-label-md uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors'

  return (
    <div className="bg-background font-body-md text-on-surface antialiased selection:bg-secondary selection:text-on-secondary">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-surface/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20 w-full px-6 md:px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-lg min-w-0">
            <a className="flex items-center gap-space-md group min-w-0" href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/' }}>
              <div className="bg-primary text-on-primary font-label-md text-label-md px-space-sm py-space-xs uppercase tracking-widest shrink-0">
                PM
              </div>
              <div className="hidden sm:flex flex-col min-w-0">
                <span className="font-label-lg text-label-lg uppercase tracking-widest text-primary truncate">
                  Pescadero Music
                </span>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant truncate">
                  DJ &amp; Sound • Provo, Utah
                </span>
              </div>
            </a>
          </div>

          <nav className="hidden lg:flex items-center gap-space-lg">
            <button className={navBtn} onClick={() => scrollTo('services')}>
              Services
            </button>
            <button className={navBtn} onClick={() => scrollTo('pricing-tiers')}>
              Pricing
            </button>
            <button className={navBtn} onClick={() => scrollTo('checker-widget')}>
              Check Dates
            </button>
          </nav>

          <div className="flex items-center gap-space-md">
            <button
              className="hidden sm:inline-flex items-center justify-center bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-label-md uppercase px-space-md py-space-sm shadow-[4px_4px_0px_0px_#07111A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#07111A] transition-all"
              onClick={() => scrollTo('checker-widget')}
            >
              Check Your Date
            </button>

            {user ? (
              <div className="relative">
                <button
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label="Account menu"
                >
                  <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-[120%] w-48 bg-surface border border-primary/15 shadow-[4px_4px_0px_0px_#07111A]">
                    <button
                      className="w-full text-left px-space-md py-space-sm font-label-sm text-label-sm uppercase tracking-wider text-on-surface hover:bg-surface-container"
                      onClick={() => router.push('/dashboard')}
                    >
                      My Dashboard
                    </button>
                    {isAdmin && (
                      <button
                        className="w-full text-left px-space-md py-space-sm font-label-sm text-label-sm uppercase tracking-wider text-tertiary hover:bg-surface-container"
                        onClick={() => router.push('/admin')}
                      >
                        Admin Panel
                      </button>
                    )}
                    <button
                      className="w-full text-left px-space-md py-space-sm font-label-sm text-label-sm uppercase tracking-wider text-secondary hover:bg-surface-container"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="hidden sm:inline-flex items-center justify-center bg-transparent border border-primary text-primary font-label-md text-label-md uppercase px-space-md py-space-sm hover:bg-primary hover:text-on-primary transition-all"
                onClick={() => router.push('/auth/login')}
              >
                Client Login
              </button>
            )}

            <button
              className="lg:hidden w-9 h-9 flex items-center justify-center border border-primary/20"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-surface border-t border-primary/10 px-6 py-space-md flex flex-col gap-1">
            <button className="text-left py-space-sm font-label-md text-label-md uppercase tracking-wider text-on-surface" onClick={() => scrollTo('services')}>
              Services
            </button>
            <button className="text-left py-space-sm font-label-md text-label-md uppercase tracking-wider text-on-surface" onClick={() => scrollTo('pricing-tiers')}>
              Pricing
            </button>
            <button className="text-left py-space-sm font-label-md text-label-md uppercase tracking-wider text-on-surface" onClick={() => scrollTo('checker-widget')}>
              Check Dates
            </button>
            {!user && (
              <button className="text-left py-space-sm font-label-md text-label-md uppercase tracking-wider text-secondary" onClick={() => router.push('/auth/login')}>
                Client Login
              </button>
            )}
          </div>
        )}
      </header>

      <main className="w-full pt-20 bg-background">
        <div className="flex flex-col w-full text-on-surface">
          {/* 1. HERO */}
          <section className="relative w-full bg-background overflow-hidden px-6 md:px-margin py-space-xl">
            <div className="flex items-center justify-between bg-primary text-on-primary px-space-md py-space-sm mb-space-lg">
              <div className="flex items-center gap-space-md">
                <span className="bg-secondary text-on-secondary font-label-sm text-label-sm px-space-xs py-0.5 uppercase tracking-widest">
                  PESCADERO MUSIC
                </span>
                <span className="hidden md:inline font-label-sm text-label-sm uppercase tracking-widest text-on-primary-container">
                  WEDDING &amp; EVENT DJ
                </span>
              </div>
              <div className="flex items-center gap-space-sm font-label-sm text-label-sm uppercase text-secondary-fixed">
                <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span>PROVO • UTAH VALLEY</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-gutter items-stretch">
              <div className="col-span-12 lg:col-span-5 flex flex-col justify-between pr-0 lg:pr-space-md">
                <div className="flex flex-col">
                  <div className="inline-flex bg-surface-container p-1 gap-1 mb-space-md w-fit">
                    <button
                      className={`px-space-md py-space-xs font-label-md text-label-md uppercase tracking-wider transition-all ${
                        heroSlide === 'wedding' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      onClick={() => setHeroSlide('wedding')}
                    >
                      01 • Wedding DJ &amp; Sound
                    </button>
                    <button
                      className={`px-space-md py-space-xs font-label-md text-label-md uppercase tracking-wider transition-all ${
                        heroSlide === 'cinema' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      onClick={() => setHeroSlide('cinema')}
                    >
                      02 • Outdoor Movie Nights
                    </button>
                  </div>

                  <div className="font-label-lg text-label-lg uppercase tracking-widest text-secondary mb-space-xs">
                    {h.kicker}
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight leading-[1.05] mb-space-md">
                    {h.headlineLead} <span className="italic font-display-xl text-secondary">{h.headlineEmphasis}</span> {h.headlineTail}
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant mb-space-lg leading-relaxed">
                    {h.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-space-md mb-space-lg">
                    <button
                      className="inline-flex items-center justify-center bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg uppercase px-space-lg py-space-sm shadow-[4px_4px_0px_0px_#07111A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#07111A] transition-all"
                      onClick={() => scrollTo('checker-widget')}
                    >
                      Check Your Date →
                    </button>
                    <button
                      className="inline-flex items-center justify-center bg-surface-container hover:bg-surface-variant text-primary font-label-lg text-label-lg uppercase px-space-lg py-space-sm shadow-[4px_4px_0px_0px_#07111A] transition-all"
                      onClick={() => scrollTo('pricing-tiers')}
                    >
                      Explore Pricing
                    </button>
                  </div>
                </div>

                <div className="bg-surface-container p-space-md mt-space-md">
                  <div className="grid grid-cols-3 gap-space-sm text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">Sound Rig</span>
                      <span className="font-headline-sm text-headline-sm text-primary">JBL • Pioneer</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">Service Area</span>
                      <span className="font-headline-sm text-headline-sm text-primary">Utah County</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">Booking</span>
                      <span className="font-headline-sm text-headline-sm text-secondary">1 Event / Date</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-7 relative">
                <div className="relative w-full h-[420px] md:h-[580px] bg-primary overflow-hidden shadow-[8px_8px_0px_0px_#07111A]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={h.alt}
                    className="absolute inset-0 w-full h-full object-cover object-center filter contrast-125 saturate-90 brightness-95"
                    src={h.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/30 to-transparent mix-blend-multiply" />
                  <div className="relative z-20 p-space-lg md:p-space-xl text-on-primary">
                    <div className="inline-block bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest px-space-sm py-1 mb-space-xs">
                      {h.badge}
                    </div>
                    <div className="font-headline-md text-headline-md tracking-tight text-surface">{h.badgeTitle}</div>
                    <p className="font-body-sm text-body-sm text-surface-container max-w-md mt-1">{h.badgeBody}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. DATE AVAILABILITY CHECKER */}
          <section className="w-full bg-surface-container-high px-6 md:px-margin py-space-xl" id="checker-widget">
            <div className="w-full bg-surface p-space-lg shadow-[6px_6px_0px_0px_#07111A]">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-space-md mb-space-lg gap-space-sm">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary block">
                    BOOK YOUR DATE
                  </span>
                  <h2 className="font-headline-md text-headline-md text-primary mt-1">Check Availability</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-stretch">
                <div className="lg:col-span-5 bg-surface-container p-space-md flex items-center gap-space-md">
                  <div
                    className={`p-space-sm text-center min-w-[90px] flex flex-col justify-center ${
                      dateStatus === 'available'
                        ? 'bg-primary text-on-primary'
                        : dateStatus === 'busy'
                        ? 'bg-secondary text-on-secondary'
                        : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[28px]">
                      {dateStatus === 'available'
                        ? 'lock_open'
                        : dateStatus === 'busy'
                        ? 'event_busy'
                        : dateStatus === 'checking'
                        ? 'hourglass_top'
                        : 'calendar_month'}
                    </span>
                  </div>
                  <div className="flex flex-col justify-center">
                    {dateStatus === 'available' && (
                      <>
                        <div className="font-label-md text-label-md uppercase tracking-wider text-primary mb-1">
                          ✓ Date Open
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          That date looks open — send an inquiry to lock it in.
                        </p>
                      </>
                    )}
                    {dateStatus === 'busy' && (
                      <>
                        <div className="font-label-md text-label-md uppercase tracking-wider text-secondary mb-1">
                          ✕ Already Booked
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          That date is taken. Try another date or reach out to ask.
                        </p>
                      </>
                    )}
                    {dateStatus === 'checking' && (
                      <div className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant mb-1">
                        Checking calendar…
                      </div>
                    )}
                    {dateStatus === 'idle' && (
                      <>
                        <div className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant mb-1">
                          Pick a date →
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Earlier inquiries get priority — your date isn’t secured until contract + deposit.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-7 flex flex-col md:flex-row items-center gap-space-md">
                  <div className="w-full flex-1">
                    <label className="block font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mb-space-xs">
                      What kind of event?
                    </label>
                    <select
                      className="w-full bg-surface-container-lowest text-primary font-label-md text-label-md uppercase font-bold p-space-sm outline-none focus:bg-surface-bright focus:border-secondary appearance-none cursor-pointer border-b-2 border-primary/20 transition-colors"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as EventTypeId)}
                    >
                      {eventTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full flex-1">
                    <label className="block font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mb-space-xs">
                      Event Date
                    </label>
                    <input
                      className="w-full bg-surface-container-lowest text-primary font-body-md text-body-md p-space-sm outline-none border-b-2 border-primary/20 focus:border-secondary focus:bg-surface-bright transition-colors"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={checkDate}
                      onChange={handleDateCheck}
                    />
                  </div>
                  <div className="w-full md:w-auto self-end pt-space-xs">
                    <button
                      className="w-full md:w-auto bg-primary hover:bg-on-background text-on-primary font-label-md text-label-md uppercase tracking-wider px-space-lg py-space-sm shadow-[3px_3px_0px_0px_#C8202A] active:translate-x-[1px] active:translate-y-[1px] transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={handleInquiry}
                      disabled={!checkDate || dateStatus === 'busy' || dateStatus === 'checking'}
                    >
                      Send Inquiry →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. SERVICES */}
          <section className="w-full bg-background px-6 md:px-margin py-space-xl" id="services">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl">
              <div>
                <span className="font-label-md text-label-md uppercase tracking-widest text-secondary block">
                  WHAT I DO
                </span>
                <h2 className="font-headline-lg text-headline-lg text-primary mt-1">Curated Dual Disciplines</h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-space-sm md:mt-0">
                I specialize strictly in two kinds of events: wedding &amp; event sound, and outdoor movie nights.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-stretch">
              <div className="col-span-12 lg:col-span-7 bg-surface-container flex flex-col justify-between p-space-lg md:p-space-xl relative overflow-hidden shadow-[6px_6px_0px_0px_#07111A]">
                <div className="flex items-center justify-between pb-space-md">
                  <span className="bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-widest px-space-sm py-1">
                    DJ &amp; SOUND
                  </span>
                  <span className="font-label-md text-label-md uppercase tracking-wider text-secondary font-bold">
                    CEREMONY • COCKTAIL • DANCE
                  </span>
                </div>
                <div className="my-space-lg">
                  <span className="font-display-xl text-display-xl leading-none text-primary block tracking-tighter">
                    Bespoke Wedding
                  </span>
                  <span className="font-display-xl text-display-xl leading-none text-secondary italic block tracking-tight -mt-2">
                    Soundscapes.
                  </span>
                  <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-md max-w-xl">
                    Professional DJ service for weddings, receptions, corporate events, grand openings, and private
                    parties. From dance-floor-only sets to full ceremony and reception sound.
                  </p>
                </div>
                <div className="bg-surface p-space-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                    {[
                      { icon: 'graphic_eq', title: 'DJ-Curated or Custom', body: 'Your playlist, or let Garrett curate the night.' },
                      { icon: 'music_note', title: 'Full Reception Coverage', body: 'Ceremony, cocktail hour, and dancing — one or all.' },
                      { icon: 'mic', title: 'Wireless Mics', body: 'Clear, dignified announcements and toasts.' },
                      { icon: 'straighten', title: 'Custom DJ Booth', body: 'A clean, custom-built white booth with a warm wood top.' },
                    ].map((f) => (
                      <div className="flex items-start gap-space-sm" key={f.title}>
                        <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">{f.icon}</span>
                        <div>
                          <span className="font-label-md text-label-md uppercase text-primary block">{f.title}</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">{f.body}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-5 bg-primary text-on-primary flex flex-col justify-between p-space-lg md:p-space-xl relative overflow-hidden shadow-[6px_6px_0px_0px_#07111A]">
                <div className="flex items-center justify-between pb-space-md">
                  <span className="bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest px-space-sm py-1">
                    OUTDOOR CINEMA
                  </span>
                  <span className="font-label-md text-label-md uppercase tracking-wider text-surface-variant">
                    PRIVATE EVENTS ONLY
                  </span>
                </div>
                <div className="my-space-lg">
                  <span className="font-display-xl text-display-xl leading-none text-surface block tracking-tight">
                    Open Sky
                  </span>
                  <span className="font-display-xl text-display-xl leading-none text-secondary-fixed italic block tracking-tight -mt-2">
                    Cinema Nights.
                  </span>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-space-md">
                    A complete private outdoor cinema for your backyard, neighborhood, or venue. Self-contained for
                    up to 3 hours with no power hookup required.
                  </p>
                </div>
                <div className="bg-primary-container p-space-md">
                  <div className="flex flex-col gap-space-sm">
                    {[
                      ['Screen', 'Large Inflatable Screen'],
                      ['Projector', 'HD Projection'],
                      ['Audio', 'Outdoor Speaker System'],
                      ['Power', 'No Hookup Needed'],
                    ].map(([k, v]) => (
                      <div className="flex items-center justify-between pb-space-xs" key={k}>
                        <span className="font-label-md text-label-md uppercase text-surface">{k}</span>
                        <span className="font-body-sm text-body-sm text-surface-variant">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-space-md pt-space-sm">
                  <button
                    className="font-label-md text-label-md uppercase tracking-wider text-secondary-fixed hover:text-on-secondary transition-colors inline-flex items-center gap-space-xs"
                    onClick={() => scrollTo('pricing-tiers')}
                  >
                    See Movie Night Pricing →
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 4. PRICING */}
          <section className="w-full bg-surface-container px-6 md:px-margin py-space-xl" id="pricing-tiers">
            <div className="max-w-4xl mx-auto text-center mb-space-xl">
              <div className="inline-block bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-widest px-space-md py-space-xs mb-space-sm">
                FLAT-RATE PRICING • NO SURPRISES
              </div>
              <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Simple, Transparent Pricing</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-xs">
                All prices are starting rates. Travel fees may apply outside Utah County.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter items-stretch">
              {/* Tier 1 */}
              <div className="bg-surface p-space-lg flex flex-col justify-between shadow-[4px_4px_0px_0px_#07111A] relative">
                <div>
                  <div className="flex justify-between items-start pb-space-sm mb-space-md">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">TIER 01</span>
                      <h3 className="font-headline-sm text-headline-sm text-primary">Dance DJ</h3>
                    </div>
                    <span className="font-label-sm text-label-sm uppercase bg-surface-container px-space-xs py-1">RECEPTION</span>
                  </div>
                  <div className="mb-space-lg">
                    <span className="font-display-xl text-display-xl text-primary font-bold leading-none">$600</span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant block mt-1">
                      FLAT FEE • UP TO 4 HOURS
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                    One sound system. Up to 4 hours of DJ service — perfect for receptions, parties, grand openings, and
                    corporate events.
                  </p>
                  <ul className="space-y-space-sm font-body-sm text-body-sm text-on-surface mb-space-lg">
                    {['Up to 4 hours', 'One pro sound system', 'DJ-curated or custom playlist', 'Wired MC mic'].map((f) => (
                      <li className="flex items-center gap-space-xs" key={f}>
                        <span className="material-symbols-outlined text-secondary text-[18px]">check</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  className="w-full text-center bg-surface-container hover:bg-surface-variant text-primary font-label-md text-label-md uppercase tracking-wider py-space-sm transition-all shadow-[2px_2px_0px_0px_#07111A]"
                  onClick={() => scrollTo('checker-widget')}
                >
                  Reserve $600 Tier
                </button>
              </div>

              {/* Tier 2 — featured */}
              <div className="bg-primary text-on-primary p-space-lg flex flex-col justify-between shadow-[8px_8px_0px_0px_#C8202A] relative md:-mt-4">
                <div className="absolute -top-3 right-4 bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest px-space-md py-1 shadow-[2px_2px_0px_0px_#07111A]">
                  MOST POPULAR
                </div>
                <div>
                  <div className="flex justify-between items-start pb-space-sm mb-space-md">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary-fixed">TIER 02</span>
                      <h3 className="font-headline-sm text-headline-sm text-surface">Full-Service Sound</h3>
                    </div>
                  </div>
                  <div className="mb-space-lg">
                    <span className="font-display-xl text-display-xl text-surface font-bold leading-none">$850</span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-surface-variant block mt-1">
                      FLAT FEE • UP TO 4 HOURS
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-surface-container max-w-sm mb-space-md">
                    Two independent sound systems — one for ceremony or speeches, one for the dance floor. The complete
                    wedding package.
                  </p>
                  <ul className="space-y-space-sm font-body-sm text-body-sm text-surface mb-space-lg">
                    {[
                      'Up to 4 hours',
                      'Two independent sound systems',
                      'Ceremony & cocktail hour sound',
                      'Two wireless mics for vows, speeches & toasts',
                      'DJ-curated or custom playlist',
                    ].map((f) => (
                      <li className="flex items-center gap-space-xs" key={f}>
                        <span className="material-symbols-outlined text-secondary-fixed text-[18px]">verified</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  className="w-full text-center bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-label-md uppercase tracking-wider py-space-sm shadow-[4px_4px_0px_0px_#07111A] active:translate-x-[1px] active:translate-y-[1px] transition-all"
                  onClick={() => scrollTo('checker-widget')}
                >
                  Book Signature Package →
                </button>
              </div>

              {/* Tier 3 — movie night */}
              <div className="bg-surface p-space-lg flex flex-col justify-between shadow-[4px_4px_0px_0px_#07111A] relative">
                <div>
                  <div className="flex justify-between items-start pb-space-sm mb-space-md">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">TIER 03</span>
                      <h3 className="font-headline-sm text-headline-sm text-primary">Outdoor Movie Night</h3>
                    </div>
                    <span className="font-label-sm text-label-sm uppercase bg-surface-container px-space-xs py-1">CINEMA</span>
                  </div>
                  <div className="grid grid-cols-2 gap-space-xs bg-surface-container p-space-sm mb-space-md text-center">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase text-on-surface-variant block">Mon–Thu</span>
                      <span className="font-headline-sm text-headline-sm text-primary font-bold">$250</span>
                    </div>
                    <div>
                      <span className="font-label-sm text-label-sm uppercase text-secondary block">Fri–Sat</span>
                      <span className="font-headline-sm text-headline-sm text-secondary font-bold">$350</span>
                    </div>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                    A private outdoor cinema for your backyard, neighborhood, or event space. Runs up to 3 hours without
                    a power hookup. Private events only — summer availability.
                  </p>
                  <ul className="space-y-space-sm font-body-sm text-body-sm text-on-surface mb-space-lg">
                    {['Up to 3 hours', 'Large inflatable screen', 'HD projector', 'Outdoor speaker system', 'No power hookup needed'].map((f) => (
                      <li className="flex items-center gap-space-xs" key={f}>
                        <span className="material-symbols-outlined text-secondary text-[18px]">check</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  className="w-full text-center bg-surface-container hover:bg-surface-variant text-primary font-label-md text-label-md uppercase tracking-wider py-space-sm transition-all shadow-[2px_2px_0px_0px_#07111A]"
                  onClick={() => scrollTo('checker-widget')}
                >
                  Reserve Movie Night
                </button>
              </div>
            </div>

            <div className="mt-space-lg text-center font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
              • Travel fees may apply for events outside Utah County •
            </div>
          </section>

          {/* 5. 7-STEP ROADMAP */}
          <section className="w-full bg-primary text-on-primary px-6 md:px-margin py-space-xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between pb-space-md mb-space-xl">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary-fixed block">
                  HOW IT WORKS
                </span>
                <h2 className="font-headline-lg text-headline-lg text-surface mt-1">The 7-Step Booking Roadmap</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-space-sm">
              {[
                ['01', 'Inquiry', 'Submit your date and details — takes about 3 minutes.'],
                ['02', 'Consultation', 'A quick call to talk through your vision and vibe.'],
                ['03', 'Contract', 'Review, sign, and pay your deposit — your date is locked in.'],
                ['04', 'Planning', 'Submit your music and day-of timeline.'],
                ['05', 'Final Payment', 'Remaining balance due one week before your event.'],
                ['06', 'Event Day', 'Garrett arrives 1.5 hours early to set up and sound-check.'],
                ['07', 'Keepsake', 'A playlist archive of your night to keep forever.'],
              ].map(([num, title, body], i) => (
                <div
                  key={num}
                  className={`p-space-md flex flex-col justify-between shadow-[3px_3px_0px_0px_rgba(245,239,224,0.15)] ${
                    i === 5 ? 'bg-secondary text-on-secondary' : 'bg-surface-bright text-on-surface'
                  }`}
                >
                  <div>
                    <span className={`font-label-md text-label-md uppercase font-bold block mb-space-xs ${i === 5 ? 'text-secondary-fixed' : 'text-secondary'}`}>
                      {num}
                    </span>
                    <h4 className={`font-headline-sm text-headline-sm leading-tight mb-2 ${i === 5 ? 'text-on-secondary' : 'text-primary'}`}>
                      {title}
                    </h4>
                    <p className={`font-body-sm text-body-sm ${i === 5 ? 'text-on-secondary/80' : 'text-on-surface-variant'}`}>
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 6. PERSONAL NOTE */}
          <section className="w-full bg-background px-6 md:px-margin py-space-xl">
            <div className="max-w-4xl mx-auto bg-primary text-on-primary p-space-lg md:p-space-xl shadow-[8px_8px_0px_0px_#C8202A] relative">
              <div className="flex items-center justify-between pb-space-md mb-space-lg">
                <div className="flex items-center gap-space-sm">
                  <div className="w-3 h-3 bg-secondary" />
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-surface font-bold">
                    A NOTE FROM GARRETT
                  </span>
                </div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-primary-container">
                  PROVO • UTAH
                </span>
              </div>

              <div className="space-y-space-md">
                <h3 className="font-display-xl text-display-xl text-surface leading-tight">
                  “Your day. Your music. <span className="text-secondary-fixed italic">Our sound.</span>”
                </h3>
                <div className="font-editorial-note text-editorial-note text-surface-container space-y-space-md italic leading-relaxed pt-space-xs">
                  <p>
                    When I started Pescadero Music, I decided never to be the kind of DJ company that shows up in
                    branded polo shirts with flickering neon lasers and booming, distorted speakers.
                  </p>
                  <p>
                    Your wedding or event deserves sound that fills the room with clarity and warmth — without
                    blowing out your grandparents at dinner.
                  </p>
                  <p>
                    I don’t take over your celebration. I build a room-filling atmosphere that lets your guests
                    connect, dance, and remember how good the night sounded.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-space-lg mt-space-lg gap-space-md border-t border-on-primary/15">
                <div className="flex flex-col pt-space-md sm:pt-0">
                  <span className="font-label-lg text-label-lg uppercase tracking-wider text-surface">Garrett</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-primary-container">
                    Founder, Pescadero Music
                  </span>
                </div>
                <a
                  className="inline-flex items-center justify-center bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-label-md uppercase px-space-lg py-space-sm shadow-[3px_3px_0px_0px_rgba(245,239,224,0.25)] transition-colors"
                  href="mailto:garrett@pescaderomusic.com"
                >
                  Start a Conversation →
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface-container-low">
        <div className="w-full px-6 md:px-margin py-space-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-space-xl">
            <div className="flex flex-col gap-space-sm">
              <div className="bg-primary text-on-primary font-label-md text-label-md px-space-sm py-space-xs uppercase tracking-widest inline-block w-fit">
                Pescadero Music
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
                Professional DJ &amp; sound for weddings and events, plus self-contained outdoor movie nights, serving
                Provo and Utah Valley.
              </p>
            </div>
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-md text-label-md uppercase tracking-wider text-primary mb-space-sm">Services</span>
              <button className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface" onClick={() => scrollTo('services')}>
                DJ &amp; Sound
              </button>
              <button className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface" onClick={() => scrollTo('services')}>
                Outdoor Movie Nights
              </button>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface" href="/policy">
                Service Policy
              </a>
            </div>
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-md text-label-md uppercase tracking-wider text-primary mb-space-sm">Reservations</span>
              <button className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface" onClick={() => scrollTo('checker-widget')}>
                Calendar Availability
              </button>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface" href="/auth/login">
                Client Login
              </a>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Provo, UT</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">(210) 727-9328</span>
            </div>
            <div className="flex flex-col justify-between bg-surface-container p-space-md">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">Follow</span>
                <a
                  className="font-editorial-note text-editorial-note text-on-surface italic mt-space-xs"
                  href="https://www.instagram.com/djgarrett_ut"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @djgarrett_ut
                </a>
              </div>
            </div>
          </div>
          <div className="pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md">
            <div className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant text-center sm:text-left">
              © {new Date().getFullYear()} Pescadero Music. All rights reserved.
            </div>
            <div className="flex items-center gap-space-lg font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
              <span>Provo, Utah</span>
              <span>Wedding &amp; Event DJ</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
