'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const NAVY  = '#07111A'
const BLUE  = '#44BEC7'
const RED   = '#C8202A'
const CREAM = '#F5EFE0'

const DISPLAY  = "'freight-display-pro', Georgia, serif"
const UI_FONT  = "'futura-pt-condensed', 'Barlow Condensed', sans-serif"
const BODY     = "'inter', system-ui, sans-serif"
const WORDMARK = "'RetroFloral', 'Barlow Condensed', sans-serif"
const ACCENT   = "'cormorant-garamond', Georgia, serif"

export default function HomePage() {
  const [showModal, setShowModal]     = useState(false)
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [authError, setAuthError]     = useState('')
  const [loading, setLoading]         = useState(false)
  const [user, setUser]               = useState<any>(null)
  const [scrolled, setScrolled]       = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    document.documentElement.style.scrollBehavior = 'smooth'

    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll)

    const onClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)

    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [])

  const handleAuth = async () => {
    setLoading(true); setAuthError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.toLowerCase().includes('email') && error.message.toLowerCase().includes('confirm')) {
        setAuthError('Email not confirmed — please check your inbox and confirm your email before signing in.')
      } else {
        setAuthError(error.message)
      }
      setLoading(false); return
    }
    window.location.href = '/dashboard'
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Account'

  return (
    <div style={{ background: NAVY, minHeight: '100vh', fontFamily: BODY, color: CREAM }}>

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(7,17,26,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(68,190,199,0.1)' : 'none',
        padding: '0 40px', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease',
      }}>
        {/* Left: logo + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/images/logo.png" alt="Pescadero Music" style={{ height: 38, width: 38, objectFit: 'contain' }} />
          <span style={{ fontFamily: WORDMARK, fontSize: 17, letterSpacing: '4px', color: CREAM, textTransform: 'uppercase' }}>Pescadero Music</span>
        </div>

        {/* Center: nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          {[['Services', '#services'], ['Pricing', '#pricing']].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: 13, color: 'rgba(245,239,224,0.6)', textDecoration: 'none', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: UI_FONT, fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = CREAM}
              onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(245,239,224,0.6)'}
            >{label}</a>
          ))}
        </div>

        {/* Right: auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user ? (
            <>
              <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: BLUE, textDecoration: 'none', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: UI_FONT }}>
                <span style={{ fontSize: 10 }}>◇</span> My Dashboard
              </Link>
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid rgba(245,239,224,0.3)`, background: 'transparent', color: CREAM, fontSize: 13, fontFamily: UI_FONT, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  {firstName} →
                </button>
                {showUserMenu && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: '#0D1E2B', border: '1px solid rgba(68,190,199,0.15)', borderRadius: 10, padding: '8px', minWidth: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                    <Link href="/dashboard" onClick={() => setShowUserMenu(false)} style={{ display: 'block', padding: '9px 14px', fontSize: 12, fontFamily: UI_FONT, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(245,239,224,0.6)', textDecoration: 'none', borderRadius: 6 }}>
                      Dashboard
                    </Link>
                    <div style={{ height: 1, background: 'rgba(245,239,224,0.07)', margin: '4px 0' }} />
                    <button
                      onClick={handleSignOut}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', fontSize: 12, fontFamily: UI_FONT, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(245,239,224,0.6)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6 }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => setShowModal(true)} style={{ padding: '7px 18px', borderRadius: 8, border: '1px solid rgba(245,239,224,0.2)', background: 'transparent', color: 'rgba(245,239,224,0.65)', fontSize: 13, fontFamily: UI_FONT, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer' }}>
                Sign In
              </button>
              <Link href="#account" style={{ padding: '7px 20px', borderRadius: 8, background: RED, color: 'white', textDecoration: 'none', fontSize: 13, fontFamily: UI_FONT, letterSpacing: '1.5px', textTransform: 'uppercase', boxShadow: '0 4px 16px rgba(200,32,42,0.35)' }}>
                Book Now
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 640, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

        {/* Full bleed photo */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('/images/hero.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center 30%' }} />

        {/* Gradient overlays — left darker for text, overall darkening */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(7,17,26,0.82) 0%, rgba(7,17,26,0.55) 45%, rgba(7,17,26,0.15) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(7,17,26,0.3) 0%, transparent 30%, transparent 65%, rgba(7,17,26,0.85) 100%)' }} />

        {/* Main content — left aligned, vertically centered */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', padding: '68px 40px 0' }}>
          <div style={{ maxWidth: 560 }}>

            {/* Eyebrow */}
            <p style={{ margin: '0 0 20px', fontSize: 11, letterSpacing: '4px', textTransform: 'uppercase', color: BLUE, fontFamily: UI_FONT, fontWeight: 500 }}>
              Live Sound &nbsp;•&nbsp; Provo, Utah
            </p>

            {/* Hero headline */}
            <h1 style={{ margin: '0 0 24px', fontFamily: DISPLAY, fontSize: 'clamp(52px, 6.5vw, 82px)', fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.5px' }}>
              <span style={{ display: 'block', color: CREAM }}>Your Day.</span>
              <span style={{ display: 'block', color: BLUE }}>Your Music.</span>
              <span style={{ display: 'block', color: CREAM }}>Our Sound.</span>
            </h1>

            {/* Diamond divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 24px' }}>
              <div style={{ flex: 1, height: 1, background: `rgba(245,239,224,0.2)` }} />
              <span style={{ color: BLUE, fontSize: 10 }}>◇</span>
              <div style={{ flex: 1, maxWidth: 60, height: 1, background: `rgba(245,239,224,0.2)` }} />
            </div>

            {/* Subtext */}
            <p style={{ margin: '0 0 36px', fontSize: 17, color: 'rgba(245,239,224,0.65)', lineHeight: 1.75, fontFamily: ACCENT, fontStyle: 'italic', maxWidth: 460 }}>
              Professional live sound for weddings, receptions, and events across Utah. Every detail of your day deserves to sound as good as it looks.
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link href="#account" style={{ padding: '13px 32px', borderRadius: 8, background: RED, color: 'white', textDecoration: 'none', fontSize: 13, fontFamily: UI_FONT, fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', boxShadow: '0 6px 24px rgba(200,32,42,0.4)' }}>
                Book Your Date →
              </Link>
              <a href="#services" style={{ padding: '13px 28px', borderRadius: 8, border: `1px solid rgba(245,239,224,0.35)`, color: CREAM, textDecoration: 'none', fontSize: 13, fontFamily: UI_FONT, fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase' }}>
                View Services
              </a>
            </div>
          </div>
        </div>

        {/* Stats bar — bottom of hero */}
        <div style={{ position: 'relative', padding: '0 40px 32px', display: 'flex', gap: 48, alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 48 }}>
            {[
              { label: 'Wedding & Events', sub: 'Specialist' },
              { label: 'Indoor & Outdoor', sub: 'Coverage' },
              { label: 'Provo, Utah', sub: 'Based' },
            ].map(({ label, sub }) => (
              <div key={label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                  <span style={{ color: BLUE, fontSize: 9 }}>◇</span>
                  <span style={{ fontSize: 12, fontFamily: UI_FONT, letterSpacing: '2px', textTransform: 'uppercase', color: CREAM, fontWeight: 500 }}>{label}</span>
                </div>
                <span style={{ fontSize: 13, fontFamily: ACCENT, fontStyle: 'italic', color: 'rgba(245,239,224,0.5)', paddingLeft: 16 }}>{sub}</span>
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, fontFamily: UI_FONT, letterSpacing: '3px', textTransform: 'uppercase', color: BLUE }}>Scroll</span>
            <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${BLUE}, transparent)` }} />
          </div>
        </div>
      </section>

      {/* ── BRAND PHILOSOPHY ────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ margin: '0 0 12px', fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: BLUE, fontFamily: UI_FONT, fontWeight: 500 }}>Our Philosophy</p>
        <h2 style={{ margin: '0 0 20px', fontFamily: DISPLAY, fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 300, color: CREAM, lineHeight: 1.2 }}>The All-Inclusive Premium Experience</h2>
        <p style={{ margin: 0, fontSize: 16, color: 'rgba(245,239,224,0.55)', lineHeight: 1.8 }}>
          We believe elite wedding entertainment shouldn't be hidden behind arbitrary silver and gold package tiers. Instead, we deliver a high-end production experience—complete with premium audio, professional lighting, and a polished presentation tailored to Utah venues—streamlined into one definitive offering. Everything essential for a flawless, beautifully integrated celebration is already included, giving you a luxury-tier service without the artificial premium.
        </p>
      </section>

      {/* ── SERVICES ────────────────────────────────────────────── */}
      <section id="services" style={{ padding: '20px 24px 80px', scrollMarginTop: 68 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: BLUE, fontFamily: UI_FONT, fontWeight: 500 }}>Services</p>
            <h2 style={{ margin: 0, fontFamily: DISPLAY, fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 300, color: CREAM }}>Two Dedicated Systems. One Perfect Day.</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
            <div style={{ background: 'rgba(245,239,224,0.03)', border: '1px solid rgba(245,239,224,0.07)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ height: 200, backgroundImage: `url('https://inquiries.pescaderomusic.com/images/bg2.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center 25%' }} />
              <div style={{ padding: '28px 28px 32px' }}>
                <p style={{ margin: '0 0 4px', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE, fontFamily: UI_FONT, fontWeight: 500 }}>Part I</p>
                <h3 style={{ margin: '0 0 16px', fontFamily: DISPLAY, fontSize: 22, fontWeight: 300, color: CREAM }}>The Curated Ceremony/Reception Atmosphere</h3>
                <p style={{ margin: '0 0 20px', fontSize: 14, color: 'rgba(245,239,224,0.5)', lineHeight: 1.7 }}>We prioritize clarity, reliability, and an invisible technical presence for the most intimate and formal moments of your day.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ borderLeft: `2px solid ${BLUE}`, paddingLeft: 14 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 13, fontFamily: DISPLAY, fontWeight: 400, color: CREAM }}>The "Anywhere" Ceremony System</p>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(245,239,224,0.45)', lineHeight: 1.6 }}>Our ceremony and dinner setup is completely battery-powered, allowing for high-fidelity audio in any location — from remote mountain overlooks to open meadows — without noisy generators or unsightly extension cords.</p>
                  </div>
                  <div style={{ borderLeft: `2px solid ${BLUE}`, paddingLeft: 14 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 13, fontFamily: DISPLAY, fontWeight: 400, color: CREAM }}>Professional Wireless Microphones</p>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(245,239,224,0.45)', lineHeight: 1.6 }}>We utilize world-class wireless systems with two dedicated channels for any combination of handheld or discreet lapel microphones. Our professional-grade signal remains rock-solid and interference-free, even in crowded environments.</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(245,239,224,0.03)', border: '1px solid rgba(245,239,224,0.07)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ height: 200, backgroundImage: `url('https://inquiries.pescaderomusic.com/images/bg3.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center 20%' }} />
              <div style={{ padding: '28px 28px 32px' }}>
                <p style={{ margin: '0 0 4px', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: RED, fontFamily: UI_FONT, fontWeight: 500 }}>Part II</p>
                <h3 style={{ margin: '0 0 16px', fontFamily: DISPLAY, fontSize: 22, fontWeight: 300, color: CREAM }}>The High-Energy Celebration</h3>
                <p style={{ margin: '0 0 20px', fontSize: 14, color: 'rgba(245,239,224,0.5)', lineHeight: 1.7 }}>When the celebration begins, we transition to a dedicated environment built specifically for the energy of the dance floor.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ borderLeft: `2px solid ${RED}`, paddingLeft: 14 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 13, fontFamily: DISPLAY, fontWeight: 400, color: CREAM }}>The Pro-Grade Dance Floor System</p>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(245,239,224,0.45)', lineHeight: 1.6 }}>Our reception setup features a high-output sound system hardwired directly into a professional mixing console for 100% reliability — rich, punchy, and crystal-clear all night long.</p>
                  </div>
                  <div style={{ borderLeft: `2px solid ${RED}`, paddingLeft: 14 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 13, fontFamily: DISPLAY, fontWeight: 400, color: CREAM }}>Tailored Dance Floor Lighting</p>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(245,239,224,0.45)', lineHeight: 1.6 }}>We treat lighting as an essential part of the party experience. During our consultation, we collaborate to choose the perfect look — from a soft candle-lit glow for your first dance to vibrant custom colors that match your wedding palette.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(245,239,224,0.03)', border: '1px solid rgba(245,239,224,0.07)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              <div style={{ height: 280, backgroundImage: `url('https://inquiries.pescaderomusic.com/images/bg4.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center 35%' }} />
              <div style={{ padding: '32px 32px' }}>
                <p style={{ margin: '0 0 4px', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(245,239,224,0.4)', fontFamily: UI_FONT, fontWeight: 500 }}>The Signature Aesthetic</p>
                <h3 style={{ margin: '0 0 16px', fontFamily: DISPLAY, fontSize: 22, fontWeight: 300, color: CREAM }}>Equipment That Looks As Good As It Sounds</h3>
                <p style={{ margin: '0 0 20px', fontSize: 14, color: 'rgba(245,239,224,0.5)', lineHeight: 1.7 }}>Our equipment is designed to complement the modern-organic aesthetic of Utah's premier venues.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <p style={{ margin: '0 0 3px', fontSize: 13, fontFamily: DISPLAY, fontWeight: 400, color: CREAM }}>Handcrafted DJ Furniture</p>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(245,239,224,0.45)' }}>A custom-built white DJ table topped with a light-brown hardwood counter — designed to match a clean, organic wedding aesthetic.</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 3px', fontSize: 13, fontFamily: DISPLAY, fontWeight: 400, color: CREAM }}>The "Slick" Look</p>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(245,239,224,0.45)' }}>A minimalist footprint with meticulous cable management. All wiring is hidden, ensuring your photos stay focused on your celebration — not the gear.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '80px 24px', background: 'rgba(0,0,0,0.2)', scrollMarginTop: 68 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ margin: '0 0 10px', fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: BLUE, fontFamily: UI_FONT, fontWeight: 500 }}>Investment & Availability</p>
          <h2 style={{ margin: '0 0 12px', fontFamily: DISPLAY, fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 300, color: CREAM }}>Simple, Transparent Pricing</h2>
          <p style={{ margin: '0 0 40px', fontSize: 15, color: 'rgba(245,239,224,0.45)', lineHeight: 1.7 }}>We offer transparent, value-based pricing based on the day of your celebration.</p>

          <div style={{ background: 'rgba(245,239,224,0.03)', border: '1px solid rgba(245,239,224,0.07)', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid rgba(245,239,224,0.06)' }}>
              <span style={{ fontSize: 11, fontFamily: UI_FONT, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(245,239,224,0.35)', textAlign: 'left' }}>Day of the Week</span>
              <span style={{ fontSize: 11, fontFamily: UI_FONT, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(245,239,224,0.35)', textAlign: 'right' }}>Investment</span>
            </div>
            {[
              { day: 'Saturdays (Prime Time)', price: '$1,500', highlight: true },
              { day: 'Fridays & Thursdays',    price: '$1,400', highlight: false },
              { day: 'Monday – Wednesday',      price: '$1,200', highlight: false },
            ].map(({ day, price, highlight }, i) => (
              <div key={day} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '16px 24px', background: highlight ? 'rgba(68,190,199,0.05)' : 'transparent', borderBottom: i < 2 ? '1px solid rgba(245,239,224,0.05)' : 'none' }}>
                <span style={{ fontSize: 15, fontFamily: DISPLAY, color: 'rgba(245,239,224,0.75)', textAlign: 'left', fontWeight: highlight ? 600 : 400 }}>{day}</span>
                <span style={{ fontSize: 20, fontFamily: DISPLAY, fontWeight: 300, color: highlight ? BLUE : CREAM, textAlign: 'right' }}>{price}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(245,239,224,0.03)', border: '1px solid rgba(245,239,224,0.07)', borderRadius: 16, padding: '28px', textAlign: 'left', marginBottom: 36 }}>
            <p style={{ margin: '0 0 16px', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(245,239,224,0.4)', fontFamily: UI_FONT, fontWeight: 500 }}>What's Included in Every Booking</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px 24px' }}>
              {[
                'Full Event Coverage — Professional audio for your ceremony, dinner, speeches, and high-energy celebration',
                'Design Consultations — Personalized planning for custom event music and tailored lighting',
                'Dual Sound Systems — Two independent, high-fidelity audio setups to seamlessly cover multiple spaces',
                'Professional Microphones — Dual-channel wireless systems featuring robust, high-performance handheld mics.',
                'Professional MC Service — Polished, engaging management of entrances, announcements, and timeline flow.',
                'Curated Aesthetic — Clean handcrafted wood-and-white setups designed to look like an extension of your venue.',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: BLUE, flexShrink: 0, marginTop: 2, fontSize: 10 }}>◇</span>
                  <span style={{ fontSize: 13, color: 'rgba(245,239,224,0.55)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="#account" style={{ padding: '14px 36px', borderRadius: 10, background: RED, color: 'white', textDecoration: 'none', fontSize: 13, fontFamily: UI_FONT, fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', boxShadow: '0 6px 28px rgba(200,32,42,0.35)' }}>
              Book Your Date →
            </Link>
            <Link href="/policy" style={{ padding: '14px 28px', borderRadius: 10, border: '1px solid rgba(245,239,224,0.15)', color: 'rgba(245,239,224,0.55)', textDecoration: 'none', fontSize: 13, fontFamily: UI_FONT, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Service Policy
            </Link>
          </div>
        </div>
      </section>

      {/* ── ACCOUNT SECTION ─────────────────────────────────── */}
      <section id="account" style={{ padding: '80px 24px', scrollMarginTop: 68, background: 'rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ margin: '0 0 10px', fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: BLUE, fontFamily: UI_FONT, fontWeight: 500 }}>Your Booking Portal</p>
          <h2 style={{ margin: '0 0 16px', fontFamily: DISPLAY, fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 300, color: CREAM, lineHeight: 1.2 }}>
            Everything in One Place
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(245,239,224,0.5)', lineHeight: 1.75, maxWidth: 480, margin: '0 auto 36px' }}>
            Create a free account to manage your entire booking from start to finish — submit your inquiry, sign your contract, fill out your planning form, make payments, and track every step of the process in real time.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setShowModal(true)} style={{ padding: '13px 32px', borderRadius: 10, border: '1px solid rgba(245,239,224,0.2)', background: 'transparent', color: 'rgba(245,239,224,0.7)', fontSize: 13, fontFamily: UI_FONT, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer' }}>
              Sign In
            </button>
            <a href="/auth/signup" style={{ padding: '13px 32px', borderRadius: 10, background: RED, color: 'white', textDecoration: 'none', fontSize: 13, fontFamily: UI_FONT, fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', boxShadow: '0 4px 20px rgba(200,32,42,0.35)' }}>
              Create Account →
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer style={{ padding: '48px 24px', textAlign: 'center', borderTop: '1px solid rgba(245,239,224,0.06)' }}>
        <p style={{ margin: '0 0 4px', fontFamily: WORDMARK, fontSize: 16, letterSpacing: '4px', textTransform: 'uppercase', color: CREAM }}>Pescadero Music</p>
        <p style={{ margin: '0 0 16px', fontSize: 11, fontFamily: UI_FONT, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(245,239,224,0.25)' }}>Professional Wedding Sound · Utah</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="mailto:garrett@pescaderomusic.com" style={{ fontSize: 12, color: BLUE, textDecoration: 'none' }}>garrett@pescaderomusic.com</a>
          <span style={{ color: 'rgba(245,239,224,0.15)', fontSize: 12 }}>·</span>
          <a href="tel:2107279328" style={{ fontSize: 12, color: BLUE, textDecoration: 'none' }}>(210) 727-9328</a>
        </div>
      </footer>

      {/* ── Auth Modal ─────────────────────────────────────── */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#07111A', border: '1px solid rgba(68,190,199,0.2)', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 400, position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'rgba(245,239,224,0.3)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
            <p style={{ margin: '0 0 2px', fontFamily: WORDMARK, fontSize: 15, letterSpacing: '3px', textTransform: 'uppercase', color: CREAM }}>Pescadero Music</p>
            <p style={{ margin: '0 0 24px', fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: BLUE, fontFamily: UI_FONT }}>Welcome Back</p>
            <div style={{ marginBottom: 12 }}>
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAuth()}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: '1.5px solid rgba(245,239,224,0.1)', background: 'rgba(245,239,224,0.05)', color: CREAM, fontSize: 14, fontFamily: 'inter, sans-serif', outline: 'none', boxSizing: 'border-box' as const }} />
            </div>
            <div style={{ marginBottom: authError ? 12 : 20 }}>
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAuth()}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: '1.5px solid rgba(245,239,224,0.1)', background: 'rgba(245,239,224,0.05)', color: CREAM, fontSize: 14, fontFamily: 'inter, sans-serif', outline: 'none', boxSizing: 'border-box' as const }} />
            </div>
            {authError && <p style={{ margin: '0 0 12px', fontSize: 12, color: '#ff6b6b' }}>{authError}</p>}
            <button onClick={handleAuth} disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: loading ? 'rgba(200,32,42,0.5)' : RED, color: 'white', fontSize: 13, fontFamily: UI_FONT, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 20px rgba(200,32,42,0.35)' }}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
            <p style={{ margin: '16px 0 0', textAlign: 'center', fontSize: 13, color: 'rgba(245,239,224,0.35)' }}>
              New here?{' '}<a href="/auth/signup" style={{ color: 'rgba(245,239,224,0.6)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Create an account</a>
            </p>
            <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: 11, color: 'rgba(245,239,224,0.2)' }}>
              Questions? <a href="mailto:garrett@pescaderomusic.com" style={{ color: BLUE, textDecoration: 'none' }}>garrett@pescaderomusic.com</a>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
