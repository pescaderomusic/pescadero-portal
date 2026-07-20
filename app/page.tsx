'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ADMIN_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'

// ─── Hero Slides ─────────────────────────────────────────────────────────────
const heroSlides = [
  {
    eyebrow: 'Wedding DJ & Sound',
    headline: 'Sound as good\nas it looks.',
    sub: 'Full-service wedding DJ with professional sound for ceremony, cocktail hour, and reception.',
    cta: 'Book Your Date',
    ctaHref: '#availability',
    bg: 'https://shxcw5yjydy1kgql.public.blob.vercel-storage.com/hero.jpg',
  },
  {
    eyebrow: 'Outdoor Movie Nights',
    headline: 'Bring the\nbig screen outside.',
    sub: 'A complete outdoor cinema experience for private events. Inflatable screen, projector, and crystal-clear sound — no power hookup needed.',
    cta: 'Check Availability',
    ctaHref: '#availability',
    bg: 'https://shxcw5yjydy1kgql.public.blob.vercel-storage.com/hero.jpg', // swap when you have a movie night photo
  },
]

// ─── Pricing ─────────────────────────────────────────────────────────────────
const djPackages = [
  {
    name: 'Dance DJ',
    price: '$600',
    note: 'Travel fees additional',
    description: 'One sound system. Up to 4 hours of DJ service — perfect for receptions, parties, grand openings, and corporate events.',
    features: ['Up to 4 hours', 'One pro sound system', 'DJ-curated or custom playlist', 'Wired MC mic'],
  },
  {
    name: 'Full-Service Sound',
    price: '$850',
    note: 'Travel fees additional',
    description: 'Two independent sound systems — one for ceremony or speeches, one for the dance floor. The complete wedding package.',
    features: ['Up to 4 hours', 'Two independent sound systems', 'Ceremony & cocktail hour sound', 'Two wireless mics for vows, speeches & toasts', 'DJ-curated or custom playlist'],
    featured: true,
  },
]

const moviePackage = {
  name: 'Outdoor Movie Night',
  weekday: '$250',
  weekend: '$350',
  description: 'A private outdoor cinema for your backyard, neighborhood, or event space. Self-contained rig runs up to 3 hours without a power hookup.',
  features: ['Up to 3 hours', 'Large inflatable screen', 'HD projector', 'Outdoor speaker system', 'No power hookup needed', 'Private events only'],
  note: 'Mon–Thu $250 · Fri–Sat $350',
  seasonal: 'Summer availability only',
}

// ─── Availability checker event types ────────────────────────────────────────
const eventTypes = [
  { id: 'wedding', label: 'Wedding', icon: '💍', inquiryPath: '/inquiry?type=wedding' },
  { id: 'event', label: 'DJ / Party / Event', icon: '🎶', inquiryPath: '/inquiry?type=event' },
  { id: 'movie', label: 'Outdoor Movie Night', icon: '🎬', inquiryPath: '/inquiry?type=movie' },
]

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Hero carousel
  const [slide, setSlide] = useState(0)
  const [fading, setFading] = useState(false)
  const slideTimer = useRef<NodeJS.Timeout | null>(null)

  // Availability checker
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [busyDates, setBusyDates] = useState<string[]>([])
  const [checkDate, setCheckDate] = useState('')
  const [dateStatus, setDateStatus] = useState<'idle' | 'available' | 'busy'>('idle')

  // ── Auth ──
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMenuOpen(false)
  }

  // ── Scroll nav ──
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // ── Hero auto-advance ──
  const goToSlide = (idx: number) => {
    setFading(true)
    setTimeout(() => {
      setSlide(idx)
      setFading(false)
    }, 400)
  }

  useEffect(() => {
    slideTimer.current = setTimeout(() => {
      goToSlide((slide + 1) % heroSlides.length)
    }, 6000)
    return () => { if (slideTimer.current) clearTimeout(slideTimer.current) }
  }, [slide])

  // ── Busy dates ──
  useEffect(() => {
    fetch('/api/busy-dates')
      .then(r => r.json())
      .then(d => setBusyDates(d.dates || []))
      .catch(() => {})
  }, [])

  const handleDateCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCheckDate(val)
    if (!val) { setDateStatus('idle'); return }
    setDateStatus(busyDates.includes(val) ? 'busy' : 'available')
  }

  const handleInquiry = () => {
    if (!selectedType) return
    const et = eventTypes.find(t => t.id === selectedType)
    if (!et) return
    const dateParam = checkDate ? `&date=${checkDate}` : ''
    router.push(`${et.inquiryPath}${dateParam}`)
  }

  const s = heroSlides[slide]

  return (
    <div style={{ fontFamily: 'inter, sans-serif', background: 'linear-gradient(160deg, #07111A 0%, #0D1E2B 100%)', minHeight: '100vh', color: '#F5EFE0' }}>

      {/* ── NAV ── */}
      <nav className="pm-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(7,17,26,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(68,190,199,0.15)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <img src="https://shxcw5yjydy1kgql.public.blob.vercel-storage.com/logo.png" alt="Pescadero Music" style={{ height: '36px', width: 'auto', flexShrink: 0 }} />
          <span style={{ fontFamily: 'RetroFloral, serif', fontSize: '15px', fontWeight: 300, color: '#F5EFE0', letterSpacing: '3px', textTransform: 'uppercase' as const, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Pescadero Music</span>
        </a>

        {/* Desktop links */}
        <div className="pm-nav-desktop-links">
          <a href="#services" style={{ fontFamily: 'futura-pt-condensed, sans-serif', fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F5EFE0', textDecoration: 'none', opacity: 0.8 }}>Services</a>
          <a href="#pricing" style={{ fontFamily: 'futura-pt-condensed, sans-serif', fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F5EFE0', textDecoration: 'none', opacity: 0.8 }}>Pricing</a>
          <a href="#availability" style={{ fontFamily: 'futura-pt-condensed, sans-serif', fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F5EFE0', textDecoration: 'none', opacity: 0.8 }}>Book</a>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: '#44BEC7', color: '#07111A', border: 'none', borderRadius: '4px', padding: '0.45rem 1rem', fontFamily: 'futura-pt-condensed, sans-serif', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 600 }}>
                Dashboard ▾
              </button>
              {menuOpen && (
                <div style={{ position: 'absolute', right: 0, top: '110%', background: '#0D1E2B', border: '1px solid rgba(68,190,199,0.2)', borderRadius: '6px', minWidth: '160px', overflow: 'hidden' }}>
                  <button onClick={() => router.push('/dashboard')} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'none', border: 'none', color: '#F5EFE0', cursor: 'pointer', fontFamily: 'inter, sans-serif', fontSize: '0.9rem' }}>My Dashboard</button>
                  {user.id === ADMIN_ID && (
                    <button onClick={() => router.push('/admin')} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'none', border: 'none', color: '#44BEC7', cursor: 'pointer', fontFamily: 'inter, sans-serif', fontSize: '0.9rem' }}>Admin Panel</button>
                  )}
                  <button onClick={handleSignOut} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'none', border: 'none', color: '#C8202A', cursor: 'pointer', fontFamily: 'inter, sans-serif', fontSize: '0.9rem' }}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => router.push('/auth/login')} style={{ background: 'transparent', color: '#44BEC7', border: '1px solid #44BEC7', borderRadius: '4px', padding: '0.45rem 1rem', fontFamily: 'futura-pt-condensed, sans-serif', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
              Client Login
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="pm-nav-hamburger"
          onClick={() => setMobileMenuOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile menu panel */}
      <div className={`pm-nav-mobile-panel${mobileMenuOpen ? ' open' : ''}`}>
        <a href="#services" className="pm-nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>Services</a>
        <a href="#pricing" className="pm-nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
        <a href="#availability" className="pm-nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>Book</a>
        {user ? (
          <>
            <button className="pm-nav-mobile-link" onClick={() => { setMobileMenuOpen(false); router.push('/dashboard') }}>My Dashboard</button>
            {user.id === ADMIN_ID && (
              <button className="pm-nav-mobile-link" style={{ color: '#44BEC7' }} onClick={() => { setMobileMenuOpen(false); router.push('/admin') }}>Admin Panel</button>
            )}
            <button className="pm-nav-mobile-link" style={{ color: '#C8202A' }} onClick={() => { setMobileMenuOpen(false); handleSignOut() }}>Sign Out</button>
          </>
        ) : (
          <button className="pm-nav-mobile-link" style={{ color: '#44BEC7' }} onClick={() => { setMobileMenuOpen(false); router.push('/auth/login') }}>Client Login</button>
        )}
      </div>

      {/* ── HERO CAROUSEL ── */}
      <section className="pm-hero-section" style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        {/* BG image */}
        <div className="pm-hero-bg" style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${s.bg})`,
          backgroundSize: 'cover',
          transition: 'opacity 0.4s ease',
          opacity: fading ? 0 : 1,
        }} />
        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(7,17,26,0.85) 0%, rgba(7,17,26,0.4) 60%, rgba(7,17,26,0.1) 100%)' }} />

        {/* Content */}
        <div className="pm-hero-content" style={{
          position: 'relative', zIndex: 2,
          height: '100%', display: 'flex', alignItems: 'center',
          opacity: fading ? 0 : 1,
          transition: 'opacity 0.4s ease',
        }}>
          <div>
            <p style={{ fontFamily: 'futura-pt-condensed, sans-serif', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#44BEC7', marginBottom: '1rem' }}>
              {s.eyebrow}
            </p>
            <h1 style={{ fontFamily: 'freight-display-pro, serif', fontSize: 'clamp(2.8rem, 6vw, 5rem)', fontWeight: 400, lineHeight: 1.1, color: '#F5EFE0', margin: '0 0 1.25rem', whiteSpace: 'pre-line' }}>
              {s.headline}
            </h1>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'rgba(245,239,224,0.8)', maxWidth: '480px', marginBottom: '2rem' }}>
              {s.sub}
            </p>
            <div className="pm-hero-ctas">
              <a href={s.ctaHref} style={{ background: '#C8202A', color: '#F5EFE0', padding: '0.75rem 1.75rem', borderRadius: '4px', fontFamily: 'futura-pt-condensed, sans-serif', fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 600, boxSizing: 'border-box' as const }}>
                {s.cta}
              </a>
              <a href="#services" style={{ background: 'transparent', color: '#F5EFE0', padding: '0.75rem 1.75rem', borderRadius: '4px', fontFamily: 'futura-pt-condensed, sans-serif', fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', border: '1px solid rgba(245,239,224,0.4)', boxSizing: 'border-box' as const }}>
                See Services
              </a>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '5vw', zIndex: 3, display: 'flex', gap: '0.5rem' }}>
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => { if (slideTimer.current) clearTimeout(slideTimer.current); goToSlide(i) }}
              style={{
                width: i === slide ? '2rem' : '0.5rem',
                height: '0.5rem',
                borderRadius: '999px',
                background: i === slide ? '#44BEC7' : 'rgba(245,239,224,0.35)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="pm-section">
        <p style={{ fontFamily: 'futura-pt-condensed, sans-serif', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#44BEC7', marginBottom: '0.75rem' }}>What I Do</p>
        <h2 className="pm-section-heading" style={{ fontFamily: 'freight-display-pro, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: '#F5EFE0', margin: '0 0 3.5rem' }}>
          Every event deserves<br />a great soundtrack.
        </h2>

        <div className="pm-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {/* DJ Card */}
          <div style={{ background: 'rgba(245,239,224,0.04)', border: '1px solid rgba(68,190,199,0.15)', borderRadius: '8px', padding: '2rem' }}>
            <div className="pm-card-icon" style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎧</div>
            <h3 className="pm-card-title" style={{ fontFamily: 'freight-display-pro, serif', fontSize: '1.5rem', fontWeight: 400, color: '#F5EFE0', margin: '0 0 0.75rem' }}>DJ & Sound</h3>
            <p className="pm-card-body" style={{ color: 'rgba(245,239,224,0.7)', lineHeight: 1.6, fontSize: '0.95rem' }}>
              Professional DJ service for weddings, receptions, corporate events, grand openings, and private parties. From dance-floor-only sets to full ceremony and reception sound.
            </p>
          </div>

          {/* Movie Night Card */}
          <div style={{ background: 'rgba(245,239,224,0.04)', border: '1px solid rgba(68,190,199,0.15)', borderRadius: '8px', padding: '2rem' }}>
            <div className="pm-card-icon" style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎬</div>
            <h3 className="pm-card-title" style={{ fontFamily: 'freight-display-pro, serif', fontSize: '1.5rem', fontWeight: 400, color: '#F5EFE0', margin: '0 0 0.75rem' }}>Outdoor Movie Night</h3>
            <p className="pm-card-body" style={{ color: 'rgba(245,239,224,0.7)', lineHeight: 1.6, fontSize: '0.95rem' }}>
              A complete private outdoor cinema for your backyard, neighborhood, or venue. Inflatable screen, HD projector, and outdoor sound — self-contained for up to 3 hours with no power hookup required.
            </p>
            <p style={{ fontFamily: 'futura-pt-condensed, sans-serif', fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#44BEC7', marginTop: '1rem' }}>
              Private events only · Summer availability
            </p>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="pm-section" style={{ background: '#F5EFE0' }}>
        <p style={{ fontFamily: 'futura-pt-condensed, sans-serif', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C8202A', marginBottom: '0.75rem' }}>Pricing</p>
        <h2 className="pm-section-heading" style={{ fontFamily: 'freight-display-pro, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: '#07111A', margin: '0 0 3.5rem' }}>
          Simple, transparent pricing.
        </h2>

        {/* DJ Packages */}
        <div className="pm-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {djPackages.map(pkg => (
            <div key={pkg.name} className="pm-pricing-card" style={{
              background: pkg.featured ? '#07111A' : 'white',
              border: pkg.featured ? 'none' : '1px solid rgba(7,17,26,0.12)',
              borderRadius: '8px',
              position: 'relative',
            }}>
              {pkg.featured && (
                <div style={{ position: 'absolute', top: '-1px', left: '2rem', background: '#C8202A', color: 'white', fontFamily: 'futura-pt-condensed, sans-serif', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.25rem 0.75rem', borderRadius: '0 0 4px 4px' }}>
                  Most Popular
                </div>
              )}
              <h3 className="pm-card-title" style={{ fontFamily: 'freight-display-pro, serif', fontSize: '1.4rem', fontWeight: 400, color: pkg.featured ? '#F5EFE0' : '#07111A', margin: '0 0 0.5rem' }}>{pkg.name}</h3>
              <div style={{ fontFamily: 'freight-display-pro, serif', fontSize: '2.5rem', color: pkg.featured ? '#44BEC7' : '#07111A', margin: '0.5rem 0' }}>{pkg.price}</div>
              <p style={{ fontSize: '0.75rem', color: pkg.featured ? 'rgba(245,239,224,0.5)' : 'rgba(7,17,26,0.4)', marginBottom: '1rem', fontStyle: 'italic' }}>{pkg.note}</p>
              <p className="pm-card-body" style={{ fontSize: '0.9rem', lineHeight: 1.6, color: pkg.featured ? 'rgba(245,239,224,0.75)' : 'rgba(7,17,26,0.7)', marginBottom: '1.5rem' }}>{pkg.description}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {pkg.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: pkg.featured ? 'rgba(245,239,224,0.8)' : 'rgba(7,17,26,0.8)' }}>
                    <span style={{ color: '#44BEC7', flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Movie Night Pricing */}
        <div className="pm-movie-box" style={{ background: '#07111A', borderRadius: '8px', padding: '2rem 2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🎬</span>
              <h3 style={{ fontFamily: 'freight-display-pro, serif', fontSize: '1.4rem', fontWeight: 400, color: '#F5EFE0', margin: 0 }}>{moviePackage.name}</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'rgba(245,239,224,0.65)', maxWidth: '440px', lineHeight: 1.6, margin: '0 0 0.75rem' }}>{moviePackage.description}</p>
            <p style={{ fontFamily: 'futura-pt-condensed, sans-serif', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#44BEC7' }}>{moviePackage.seasonal} · Private events only</p>
          </div>
          <div className="pm-movie-price-col">
            <div style={{ fontFamily: 'freight-display-pro, serif', fontSize: '2rem', color: '#F5EFE0' }}>
              <span style={{ color: '#44BEC7' }}>{moviePackage.weekday}</span>
              <span style={{ fontSize: '1rem', color: 'rgba(245,239,224,0.5)', margin: '0 0.5rem' }}>Mon–Thu</span>
            </div>
            <div style={{ fontFamily: 'freight-display-pro, serif', fontSize: '2rem', color: '#F5EFE0', marginTop: '0.25rem' }}>
              <span style={{ color: '#F5EFE0' }}>{moviePackage.weekend}</span>
              <span style={{ fontSize: '1rem', color: 'rgba(245,239,224,0.5)', margin: '0 0.5rem' }}>Fri–Sat</span>
            </div>
          </div>
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'rgba(7,17,26,0.5)', fontStyle: 'italic' }}>
          All prices are starting rates. Travel fees may apply for events outside Utah County. Contact for a custom quote.
        </p>
      </section>

      {/* ── AVAILABILITY CHECKER ── */}
      <section id="availability" className="pm-section">
        <p style={{ fontFamily: 'futura-pt-condensed, sans-serif', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#44BEC7', marginBottom: '0.75rem' }}>Book Your Date</p>
        <h2 className="pm-section-heading" style={{ fontFamily: 'freight-display-pro, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: '#F5EFE0', margin: '0 0 2.5rem' }}>
          Check availability.
        </h2>

        <div style={{ maxWidth: '560px' }}>
          {/* Step 1: Event Type */}
          <p style={{ fontFamily: 'futura-pt-condensed, sans-serif', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,239,224,0.5)', marginBottom: '0.75rem' }}>
            1 — What kind of event?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {eventTypes.map(et => (
              <button
                key={et.id}
                onClick={() => setSelectedType(et.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem 1.25rem',
                  background: selectedType === et.id ? 'rgba(68,190,199,0.12)' : 'rgba(245,239,224,0.04)',
                  border: selectedType === et.id ? '1px solid #44BEC7' : '1px solid rgba(245,239,224,0.12)',
                  borderRadius: '6px', cursor: 'pointer',
                  color: '#F5EFE0', textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{et.icon}</span>
                <span style={{ fontFamily: 'inter, sans-serif', fontSize: '0.95rem' }}>{et.label}</span>
                {selectedType === et.id && <span style={{ marginLeft: 'auto', color: '#44BEC7', fontSize: '0.85rem' }}>✓</span>}
              </button>
            ))}
          </div>

          {/* Step 2: Date */}
          <p style={{ fontFamily: 'futura-pt-condensed, sans-serif', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,239,224,0.5)', marginBottom: '0.75rem' }}>
            2 — Pick a date
          </p>
          <input
            type="date"
            value={checkDate}
            onChange={handleDateCheck}
            min={new Date().toISOString().split('T')[0]}
            style={{
              width: '100%', padding: '0.85rem 1rem',
              background: 'rgba(245,239,224,0.06)',
              border: '1px solid rgba(245,239,224,0.15)',
              borderRadius: '6px', color: '#F5EFE0',
              fontFamily: 'inter, sans-serif', fontSize: '1rem',
              boxSizing: 'border-box', marginBottom: '0.75rem',
            }}
          />

          {/* Date status */}
          {dateStatus === 'available' && (
            <div style={{ background: 'rgba(68,190,199,0.1)', border: '1px solid rgba(68,190,199,0.3)', borderRadius: '6px', padding: '0.75rem 1rem', color: '#44BEC7', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              ✓ That date looks open — send an inquiry to lock it in.
            </div>
          )}
          {dateStatus === 'busy' && (
            <div style={{ background: 'rgba(200,32,42,0.1)', border: '1px solid rgba(200,32,42,0.3)', borderRadius: '6px', padding: '0.75rem 1rem', color: '#C8202A', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              ✗ That date is already booked. Try another date or reach out to ask.
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleInquiry}
            disabled={!selectedType || !checkDate || dateStatus === 'busy'}
            style={{
              width: '100%', padding: '0.9rem',
              background: (!selectedType || !checkDate || dateStatus === 'busy') ? 'rgba(200,32,42,0.35)' : '#C8202A',
              color: '#F5EFE0', border: 'none', borderRadius: '6px',
              fontFamily: 'futura-pt-condensed, sans-serif', fontSize: '0.95rem',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              cursor: (!selectedType || !checkDate || dateStatus === 'busy') ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s ease',
            }}
          >
            Send Inquiry
          </button>
          {!selectedType && (
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(245,239,224,0.4)', marginTop: '0.5rem' }}>
              Select an event type above to continue
            </p>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="pm-footer" style={{ borderTop: '1px solid rgba(245,239,224,0.08)' }}>
        <div>
          <span style={{ fontFamily: 'RetroFloral, serif', fontSize: '15px', fontWeight: 300, color: '#F5EFE0', letterSpacing: '3px', textTransform: 'uppercase' as const }}>Pescadero Music</span>
          <p style={{ fontSize: '0.8rem', color: 'rgba(245,239,224,0.4)', margin: '0.25rem 0 0' }}>Provo, Utah · DJ Garrett</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="/policy" style={{ fontSize: '0.8rem', color: 'rgba(245,239,224,0.4)', textDecoration: 'none' }}>Policy</a>
          <a href="https://www.instagram.com/djgarrett_ut" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'rgba(245,239,224,0.4)', textDecoration: 'none' }}>@djgarrett_ut</a>
          <a href="/auth/login" style={{ fontSize: '0.8rem', color: 'rgba(245,239,224,0.4)', textDecoration: 'none' }}>Client Login</a>
        </div>
      </footer>

    </div>
  )
}
