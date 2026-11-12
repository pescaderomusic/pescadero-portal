'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ADMIN_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'

const eventTypes = [
  { id: 'wedding', label: 'Wedding' },
  { id: 'event', label: 'DJ / Party / Event' },
  { id: 'movie', label: 'Outdoor Movie Night' },
] as const

type EventTypeId = (typeof eventTypes)[number]['id']

const heroContent: Record<
  'wedding' | 'cinema',
  { headlineLead: string; headlineEmphasis: string; description: string; cta: string; image: string; alt: string; position: string }
> = {
  wedding: {
    headlineLead: 'Sound as good as',
    headlineEmphasis: 'it looks.',
    description: 'Full-service wedding DJ with professional sound for ceremony, cocktail hour, and reception.',
    cta: 'Book Your Date',
    image: '/images/site/hero-garrett.jpg',
    alt: 'Garrett mixing at the Pescadero Music DJ booth',
    position: 'center 30%',
  },
  cinema: {
    headlineLead: 'Bring the big screen',
    headlineEmphasis: 'outside.',
    description:
      'A complete outdoor cinema experience for private events. Inflatable screen, projector, and crystal-clear sound — no power hookup needed.',
    cta: 'Check Availability',
    image: 'https://shxcw5yjydy1kgql.public.blob.vercel-storage.com/hero.jpg',
    alt: 'Pescadero Music outdoor movie night setup',
    position: 'center',
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
            <a className="flex items-center gap-space-md group min-w-0 no-underline" href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-round.png" alt="Pescadero Music" className="h-14 w-14 shrink-0 object-contain" />
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
              Book
            </button>
          </nav>

          <div className="flex items-center gap-space-md">
            <button
              className="hidden sm:inline-flex items-center justify-center bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-label-md uppercase px-space-md py-space-sm shadow-[4px_4px_0px_0px_#07111A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#07111A] transition-all"
              onClick={() => scrollTo('checker-widget')}
            >
              Book Your Date
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
              Book
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
              <div className="col-span-12 lg:col-span-7 flex flex-col justify-center pr-0 lg:pr-space-xl">
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

                  <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight leading-[1.05] mb-space-md">
                    {h.headlineLead} <span className="italic font-display-xl text-secondary">{h.headlineEmphasis}</span>
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant mb-space-lg leading-relaxed">
                    {h.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-space-md mb-space-lg">
                    <button
                      className="inline-flex items-center justify-center bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg uppercase px-space-lg py-space-sm shadow-[4px_4px_0px_0px_#07111A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#07111A] transition-all"
                      onClick={() => scrollTo('checker-widget')}
                    >
                      {h.cta} →
                    </button>
                    <button
                      className="inline-flex items-center justify-center bg-surface-container hover:bg-surface-variant text-primary font-label-lg text-label-lg uppercase px-space-lg py-space-sm shadow-[4px_4px_0px_0px_#07111A] transition-all"
                      onClick={() => scrollTo('services')}
                    >
                      See Services
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-5 relative">
                <div className="relative w-full h-[440px] md:h-[600px] bg-primary overflow-hidden shadow-[8px_8px_0px_0px_#07111A]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={h.alt}
                    className="absolute inset-0 w-full h-full object-cover contrast-110 saturate-[.95]"
                    style={{ objectPosition: h.position }}
                    src={h.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/35 via-transparent to-transparent" />
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
                  <h2 className="font-headline-md text-headline-md text-primary mt-1">Check availability.</h2>
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
                          That date is already booked. Try another date or reach out to ask.
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
                      </>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-7 flex flex-col md:flex-row items-center gap-space-md">
                  <div className="w-full flex-1">
                    <label className="block font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mb-space-xs">
                      1 — What kind of event?
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
                      2 — Pick a date
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
                <h2 className="font-headline-lg text-headline-lg text-primary mt-1">Every event deserves a great soundtrack.</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-stretch">
              <div className="col-span-12 lg:col-span-7 bg-surface-container flex flex-col justify-between p-space-lg md:p-space-xl relative overflow-hidden shadow-[6px_6px_0px_0px_#07111A]">
                <div className="flex items-center justify-between pb-space-md">
                  <span className="bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-widest px-space-sm py-1">
                    DJ &amp; SOUND
                  </span>
                </div>
                <div className="my-space-lg">
                  <span className="font-display-xl text-display-xl leading-none text-primary block tracking-tighter">
                    DJ &amp;
                  </span>
                  <span className="font-display-xl text-display-xl leading-none text-secondary italic block tracking-tight -mt-2">
                    Sound.
                  </span>
                  <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-md max-w-xl">
                    Professional DJ service for weddings, receptions, corporate events, grand openings, and private
                    parties. From dance-floor-only sets to full ceremony and reception sound.
                  </p>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-5 bg-primary text-on-primary flex flex-col justify-between p-space-lg md:p-space-xl relative overflow-hidden shadow-[6px_6px_0px_0px_#07111A]">
                <div className="flex items-center justify-between pb-space-md">
                  <span className="bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-widest px-space-sm py-1">
                    OUTDOOR CINEMA
                  </span>
                </div>
                <div className="my-space-lg">
                  <span className="font-display-xl text-display-xl leading-none text-surface block tracking-tight">
                    Outdoor
                  </span>
                  <span className="font-display-xl text-display-xl leading-none text-secondary-fixed italic block tracking-tight -mt-2">
                    Movie Night.
                  </span>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-space-md">
                    A complete private outdoor cinema for your backyard, neighborhood, or venue. Inflatable screen, HD
                    projector, and outdoor sound — self-contained for up to 3 hours with no power hookup required.
                  </p>
                  <p className="font-label-sm text-label-sm uppercase tracking-widest text-secondary-fixed mt-space-md">
                    Private events only · Summer availability
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. PRICING */}
          <section className="w-full bg-surface-container px-6 md:px-margin py-space-xl" id="pricing-tiers">
            <div className="max-w-4xl mx-auto text-center mb-space-xl">
              <div className="inline-block bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-widest px-space-md py-space-xs mb-space-sm">
                Pricing
              </div>
              <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Simple, transparent pricing.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter items-stretch">
              {/* Tier 1 */}
              <div className="bg-surface p-space-lg flex flex-col justify-between shadow-[4px_4px_0px_0px_#07111A] relative">
                <div>
                  <div className="flex justify-between items-start pb-space-sm mb-space-md">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-primary">Dance DJ</h3>
                    </div>
                  </div>
                  <div className="mb-space-lg">
                    <span className="font-display-xl text-display-xl text-primary font-bold leading-none">$600</span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant block mt-1">
                      Travel fees additional
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                    One sound system. Up to 4 hours of DJ service — perfect for receptions, parties, grand openings, and
                    corporate events.
                  </p>
                  <ul className="space-y-space-sm font-body-sm text-body-sm text-on-surface mb-space-md">
                    {['Up to 4 hours', 'One pro sound system', 'DJ-curated or custom playlist', 'Wired MC mic'].map((f) => (
                      <li className="flex items-center gap-space-xs" key={f}>
                        <span className="material-symbols-outlined text-secondary text-[18px]">check</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg">
                    Pricing is flat-rate for events under 4 hours and does not change based on event length.
                  </p>
                </div>
                <button
                  className="w-full text-center bg-surface-container hover:bg-surface-variant text-primary font-label-md text-label-md uppercase tracking-wider py-space-sm transition-all shadow-[2px_2px_0px_0px_#07111A]"
                  onClick={() => scrollTo('checker-widget')}
                >
                  Check Availability
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
                      <h3 className="font-headline-sm text-headline-sm text-surface">Full-Service Sound</h3>
                    </div>
                  </div>
                  <div className="mb-space-lg">
                    <span className="font-display-xl text-display-xl text-surface font-bold leading-none">$850</span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-surface-variant block mt-1">
                      Travel fees additional
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-surface-container max-w-sm mb-space-md">
                    Two independent sound systems — one for ceremony or speeches, one for the dance floor. The complete
                    wedding package.
                  </p>
                  <ul className="space-y-space-sm font-body-sm text-body-sm text-surface mb-space-md">
                    {[
                      'Up to 4 hours',
                      'Two independent sound systems',
                      'Ceremony & cocktail hour sound',
                      'Two wireless mics for vows, speeches & toasts',
                      'DJ-curated or custom playlist',
                    ].map((f) => (
                      <li className="flex items-center gap-space-xs" key={f}>
                        <span className="material-symbols-outlined text-secondary-fixed text-[18px]">check</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="font-body-sm text-body-sm text-surface-variant mb-space-lg">
                    Pricing is flat-rate for events under 4 hours and does not change based on event length.
                  </p>
                </div>
                <button
                  className="w-full text-center bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-label-md uppercase tracking-wider py-space-sm shadow-[4px_4px_0px_0px_#07111A] active:translate-x-[1px] active:translate-y-[1px] transition-all"
                  onClick={() => scrollTo('checker-widget')}
                >
                  Check Availability
                </button>
              </div>

              {/* Tier 3 — movie night */}
              <div className="bg-surface p-space-lg flex flex-col justify-between shadow-[4px_4px_0px_0px_#07111A] relative">
                <div>
                  <div className="flex justify-between items-start pb-space-sm mb-space-md">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-primary">Outdoor Movie Night</h3>
                    </div>
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
                    A private outdoor cinema for your backyard, neighborhood, or event space. Self-contained rig runs up to
                    3 hours without a power hookup.
                  </p>
                  <ul className="space-y-space-sm font-body-sm text-body-sm text-on-surface mb-space-lg">
                    {['Up to 3 hours', 'Large inflatable screen', 'HD projector', 'Outdoor speaker system', 'No power hookup needed', 'Private events only'].map((f) => (
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
                  Check Availability
                </button>
              </div>
            </div>

            <p className="mt-space-lg text-center font-body-sm text-body-sm italic text-on-surface-variant">
              All prices are starting rates. Travel fees may apply for events outside Utah County. Contact for a custom quote.
            </p>
          </section>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface-container-low">
        <div className="w-full px-6 md:px-margin py-space-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-space-xl">
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/logo-round.png" alt="" className="h-12 w-12 object-contain" />
                <span className="font-label-lg text-label-lg uppercase tracking-widest text-primary">Pescadero Music</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Provo, Utah · DJ Garrett</p>
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
