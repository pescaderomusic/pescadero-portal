'use client'
import Link from 'next/link'
import { useEffect } from 'react'

const NAVY  = '#0D1B2A'
const BLUE  = '#44BEC7'
const RED   = '#D62828'
const CREAM = '#F5EFE0'

export default function HomePage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
  }, [])

  return (
    <div style={{ background: NAVY, minHeight: '100vh', fontFamily: 'Poppins, sans-serif', color: 'white' }}>

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,27,42,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(68,190,199,0.1)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: RED }}>Pescadero</span>
          <span style={{ fontFamily: 'monospace', fontSize: 8, fontWeight: 700, letterSpacing: '4px', color: BLUE, textTransform: 'uppercase' }}>MUSIC</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a href="#services" style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Services</a>
          <a href="#pricing" style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Pricing</a>
          <Link href="/get-started" style={{ padding: '8px 20px', borderRadius: 8, background: RED, color: 'white', textDecoration: 'none', fontSize: 12, fontWeight: 700, letterSpacing: '0.5px' }}>Book Now</Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 60%, #091520 100%)`, position: 'relative', overflow: 'hidden' }}>
        {/* Background image */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('https://inquiries.pescaderomusic.com/images/bg1.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center 30%', opacity: 0.18 }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 40%, ${NAVY} 100%)` }} />

        <div style={{ position: 'relative', maxWidth: 720 }}>
          <p style={{ margin: '0 0 16px', fontSize: 11, letterSpacing: '4px', textTransform: 'uppercase', color: BLUE, fontWeight: 700 }}>Wedding Sound Services · Utah</p>
          <h1 style={{ margin: '0 0 20px', fontFamily: 'Georgia, serif', fontSize: 'clamp(38px, 6vw, 64px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-1px', color: 'white' }}>
            Sound As Good<br />
            <span style={{ color: BLUE }}>As It Looks</span>
          </h1>
          <p style={{ margin: '0 0 36px', fontSize: 'clamp(15px, 2vw, 18px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
            A single, all-encompassing premium sound service—no tiers, no guesswork. We offer one top-tier wedding celebration experience, premium features already included.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/get-started" style={{ padding: '14px 36px', borderRadius: 10, background: RED, color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 700, boxShadow: '0 6px 28px rgba(214,40,40,0.35)', letterSpacing: '0.3px' }}>
              Get Started →
            </Link>
            <a href="#services" style={{ padding: '14px 32px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ── BRAND PHILOSOPHY ────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ margin: '0 0 12px', fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: BLUE, fontWeight: 700 }}>Our Philosophy</p>
        <h2 style={{ margin: '0 0 20px', fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>The All-Inclusive Premium Experience</h2>
        <p style={{ margin: 0, fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8 }}>
          We believe elite wedding entertainment shouldn't be hidden behind arbitrary silver and gold package tiers. Instead, we deliver a high-end production experience—complete with premium audio, professional lighting, and a polished presentation tailored to Utah venues—streamlined into one definitive offering. Everything essential for a flawless, beautifully integrated celebration is already included, giving you a luxury-tier service without the artificial premium.
        </p>
      </section>

      {/* ── SERVICES ────────────────────────────────────────────── */}
      <section id="services" style={{ padding: '20px 24px 80px', scrollMarginTop: 64 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ margin: '0 0 10px', fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: BLUE, fontWeight: 700 }}>Services</p>
            <h2 style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 700, color: 'white' }}>Two Dedicated Systems. One Perfect Day.</h2>
          </div>

          {/* Ceremony & Dinner */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ height: 200, backgroundImage: `url('https://inquiries.pescaderomusic.com/images/bg2.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center 25%' }} />
              <div style={{ padding: '28px 28px 32px' }}>
                <p style={{ margin: '0 0 4px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE, fontWeight: 700 }}>Part I</p>
                <h3 style={{ margin: '0 0 16px', fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: 'white' }}>The Curated Ceremony/Reception Atmosphere</h3>
                <p style={{ margin: '0 0 20px', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>We prioritize clarity, reliability, and an invisible technical presence for the most intimate and formal moments of your day.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ borderLeft: `2px solid ${BLUE}`, paddingLeft: 14 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: 'white' }}>The "Anywhere" Ceremony System</p>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>Our ceremony and dinner setup is completely battery-powered, allowing for high-fidelity audio in any location — from remote mountain overlooks to open meadows — without noisy generators or unsightly extension cords.</p>
                  </div>
                  <div style={{ borderLeft: `2px solid ${BLUE}`, paddingLeft: 14 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: 'white' }}>Professional Wireless Microphones</p>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>We utilize world-class wireless systems with two dedicated channels for any combination of handheld or discreet lapel microphones. Our professional-grade signal remains rock-solid and interference-free, even in crowded environments.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reception */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ height: 200, backgroundImage: `url('https://inquiries.pescaderomusic.com/images/bg3.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center 20%' }} />
              <div style={{ padding: '28px 28px 32px' }}>
                <p style={{ margin: '0 0 4px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: RED, fontWeight: 700 }}>Part II</p>
                <h3 style={{ margin: '0 0 16px', fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: 'white' }}>The High-Energy Celebration</h3>
                <p style={{ margin: '0 0 20px', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>When the celebration begins, we transition to a dedicated environment built specifically for the energy of the dance floor.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ borderLeft: `2px solid ${RED}`, paddingLeft: 14 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: 'white' }}>The Pro-Grade Dance Floor System</p>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>Our reception setup features a high-output sound system hardwired directly into a professional mixing console for 100% reliability — rich, punchy, and crystal-clear all night long.</p>
                  </div>
                  <div style={{ borderLeft: `2px solid ${RED}`, paddingLeft: 14 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: 'white' }}>Tailored Dance Floor Lighting</p>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>We treat lighting as an essential part of the party experience. During our consultation, we collaborate to choose the perfect look — from a soft candle-lit glow for your first dance to vibrant custom colors that match your wedding palette.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Aesthetic */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              <div style={{ height: 280, backgroundImage: `url('https://inquiries.pescaderomusic.com/images/bg4.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center 35%' }} />
              <div style={{ padding: '32px 32px' }}>
                <p style={{ margin: '0 0 4px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(245,239,224,0.6)', fontWeight: 700 }}>The Signature Aesthetic</p>
                <h3 style={{ margin: '0 0 16px', fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: 'white' }}>Equipment That Looks As Good As It Sounds</h3>
                <p style={{ margin: '0 0 20px', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>Our equipment is designed to complement the modern-organic aesthetic of Utah's premier venues.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <p style={{ margin: '0 0 3px', fontSize: 13, fontWeight: 700, color: 'white' }}>Handcrafted DJ Furniture</p>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>A custom-built white DJ table topped with a light-brown hardwood counter — designed to match a clean, organic wedding aesthetic.</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 3px', fontSize: 13, fontWeight: 700, color: 'white' }}>The "Slick" Look</p>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>A minimalist footprint with meticulous cable management. All wiring is hidden, ensuring your photos stay focused on your celebration — not the gear.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '80px 24px', background: 'rgba(0,0,0,0.2)', scrollMarginTop: 64 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ margin: '0 0 10px', fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: BLUE, fontWeight: 700 }}>Investment & Availability</p>
          <h2 style={{ margin: '0 0 12px', fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 700, color: 'white' }}>Simple, Transparent Pricing</h2>
          <p style={{ margin: '0 0 40px', fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>We offer transparent, value-based pricing based on the day of your celebration.</p>

          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ background: NAVY, padding: '12px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', textAlign: 'left' }}>Day of the Week</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', textAlign: 'right' }}>Investment</span>
            </div>
            {[
              { day: 'Saturdays (Prime Time)', price: '$1,500', highlight: true },
              { day: 'Fridays & Thursdays', price: '$1,400', highlight: false },
              { day: 'Monday – Wednesday', price: '$1,200', highlight: false },
            ].map(({ day, price, highlight }, i) => (
              <div key={day} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '16px 24px', background: highlight ? 'rgba(68,190,199,0.05)' : 'transparent', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', textAlign: 'left', fontWeight: highlight ? 600 : 400 }}>{day}</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: highlight ? BLUE : 'white', textAlign: 'right' }}>{price}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '28px 28px', textAlign: 'left', marginBottom: 36 }}>
            <p style={{ margin: '0 0 16px', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>What's Included in Every Booking</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px 24px' }}>
              {[
                'Full Event Coverage: Professional audio for your ceremony, dinner, speeches, and high-energy celebration',
                'Design Consultations: Personalized planning for custom event music and tailored lighting',
                'Dual Sound Systems: Two independent, high-fidelity audio setups to seamlessly cover multiple spaces',
                'Professional Microphones: Dual-channel wireless systems featuring robust, high-performance handheld mics.',
                'Professional MC Service: Polished, engaging management of entrances, announcements, and timeline flow.',
                'Curated Aesthetic: Clean, handcrafted wood-and-white setups designed to look like an extension of your venue.',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: BLUE, fontWeight: 700, flexShrink: 0, marginTop: 2, fontSize: 13 }}>✓</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/get-started" style={{ padding: '14px 36px', borderRadius: 10, background: RED, color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 700, boxShadow: '0 6px 28px rgba(214,40,40,0.3)' }}>
              Book Your Date →
            </Link>
            <Link href="/policy" style={{ padding: '14px 28px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 14 }}>
              Service Policy
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer style={{ padding: '48px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ margin: '0 0 8px', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 18, color: 'white' }}>Pescadero Music</p>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>Professional Wedding Sound · Utah</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="mailto:garrett@pescaderomusic.com" style={{ fontSize: 12, color: BLUE, textDecoration: 'none' }}>garrett@pescaderomusic.com</a>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>·</span>
          <a href="tel:2107279328" style={{ fontSize: 12, color: BLUE, textDecoration: 'none' }}>(210) 727-9328</a>
        </div>
      </footer>
    </div>
  )
}
