'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const NAVY  = '#0F1F35'
const TEAL  = '#4FB9AF'
const RED   = '#D63031'
const CREAM = '#F5F0E4'
const GOLD  = '#C8A96E'

// Photos from the policy doc (Garrett working events)
const photos = {
  hero:    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1600&q=80', // DJ setup
  about:   'https://images.unsplash.com/photo-1571266028243-d220c6f0f1b0?w=900&q=80',  // sound setup outdoor
  service: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=900&q=80',  // event crowd
}

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', date: '', message: '' })
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: NAVY, color: '#E8E0D5', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Poppins:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        .nav-link {
          color: rgba(232,224,213,0.7);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: color 0.2s;
          cursor: pointer;
          background: none;
          border: none;
          font-family: inherit;
        }
        .nav-link:hover { color: #4FB9AF; }

        .fade-in {
          opacity: 0;
          transform: translateY(24px);
          animation: fadeUp 0.8s ease forwards;
        }
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        .service-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 32px 28px;
          transition: all 0.3s ease;
        }
        .service-card:hover {
          background: rgba(79,185,175,0.06);
          border-color: rgba(79,185,175,0.25);
          transform: translateY(-4px);
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #D63031;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 14px 32px;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(214,48,49,0.35);
          letter-spacing: 0.5px;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(214,48,49,0.45);
        }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: #4FB9AF;
          border: 1.5px solid rgba(79,185,175,0.4);
          border-radius: 8px;
          padding: 13px 28px;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-ghost:hover {
          background: rgba(79,185,175,0.08);
          border-color: #4FB9AF;
        }

        .pm-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 13px 16px;
          color: #E8E0D5;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .pm-input:focus {
          border-color: #4FB9AF;
          box-shadow: 0 0 0 3px rgba(79,185,175,0.1);
        }
        .pm-input::placeholder { color: rgba(232,224,213,0.25); }

        .gold-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #C8A96E; display: inline-block;
        }

        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .hero-title { font-size: 42px !important; }
          .grid-2 { grid-template-columns: 1fr !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── NAVBAR ──────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        padding: '0 40px', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(10,24,40,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(79,185,175,0.1)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        {/* Logo — image + wordmark side by side */}
        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => scrollTo('hero')}>
          <img
            src="data:image/png;base64,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"
            alt="Pescadero Music"
            style={{
              width: 40, height: 40,
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 8px rgba(214,48,49,0.4))',
              background: 'transparent',
            }}
          />
          <span style={{
            fontFamily: 'monospace',
            fontSize: 7,
            fontWeight: 700,
            letterSpacing: '3px',
            color: TEAL,
            textShadow: '0 0 8px rgba(79,185,175,0.5)',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>PESCADERO MUSIC</span>
        </div>

                {/* Desktop nav */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          {[['Services', 'services'], ['About', 'about'], ['Contact', 'contact']].map(([label, id]) => (
            <button key={id} className="nav-link" onClick={() => scrollTo(id)}>{label}</button>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/auth/login" className="nav-link hide-mobile" style={{ color: 'rgba(232,224,213,0.5)' }}>
            Sign In
          </Link>
          <button className="btn-primary" onClick={() => scrollTo('contact')}
            style={{ padding: '9px 20px', fontSize: 12 }}>
            Book Now
          </button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section id="hero" style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        overflow: 'hidden',
      }}>
        {/* Background image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${photos.hero})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.25)',
        }} />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg, rgba(15,31,53,0.95) 0%, rgba(15,31,53,0.7) 50%, rgba(15,31,53,0.9) 100%)`,
        }} />

        {/* Teal glow */}
        <div style={{
          position: 'absolute', top: '20%', right: '15%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,185,175,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1100, margin: '0 auto', padding: '120px 40px 80px',
          width: '100%',
        }}>
          {/* Eyebrow */}
          <div className="fade-in" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 24, animationDelay: '0.1s',
          }}>
            <span className="gold-dot" />
            <span style={{
              fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase',
              color: GOLD, fontWeight: 600,
            }}>Live Sound · Provo, Utah</span>
          </div>

          {/* Main headline */}
          <h1 className="fade-in hero-title" style={{
            fontFamily: 'Lora, serif',
            fontSize: 72, fontWeight: 700, lineHeight: 1.1,
            color: 'white', marginBottom: 12,
            animationDelay: '0.2s',
          }}>
            Your Day.
          </h1>
          <h1 className="fade-in hero-title" style={{
            fontFamily: 'Lora, serif', fontStyle: 'italic',
            fontSize: 72, fontWeight: 700, lineHeight: 1.1,
            color: TEAL, marginBottom: 12,
            animationDelay: '0.3s',
            textShadow: '0 0 40px rgba(79,185,175,0.3)',
          }}>
            Your Music.
          </h1>
          <h1 className="fade-in hero-title" style={{
            fontFamily: 'Lora, serif',
            fontSize: 72, fontWeight: 700, lineHeight: 1.1,
            color: 'white', marginBottom: 32,
            animationDelay: '0.4s',
          }}>
            Our Sound.
          </h1>

          <p className="fade-in" style={{
            fontSize: 17, lineHeight: 1.7, color: 'rgba(232,224,213,0.65)',
            maxWidth: 520, marginBottom: 44, animationDelay: '0.5s',
          }}>
            Professional live sound for weddings, receptions, and events across Utah.
            Every detail of your day deserves to sound as good as it looks.
          </p>

          <div className="fade-in" style={{
            display: 'flex', gap: 14, flexWrap: 'wrap',
            animationDelay: '0.6s',
          }}>
            <button className="btn-primary" onClick={() => scrollTo('contact')}>
              Book Your Date →
            </button>
            <button className="btn-ghost" onClick={() => scrollTo('services')}>
              View Services
            </button>
          </div>

          {/* Stats row */}
          <div className="fade-in" style={{
            display: 'flex', gap: 40, marginTop: 64,
            flexWrap: 'wrap', animationDelay: '0.7s',
          }}>
            {[
              ['Wedding & Events', 'Specialist'],
              ['Indoor & Outdoor', 'Coverage'],
              ['Provo, Utah', 'Based'],
            ].map(([val, label]) => (
              <div key={label}>
                <div style={{
                  fontFamily: 'Lora, serif', fontSize: 18,
                  fontWeight: 700, color: 'white',
                }}>{val}</div>
                <div style={{ fontSize: 11, color: 'rgba(232,224,213,0.4)', letterSpacing: '1px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 36, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          opacity: 0.4,
        }}>
          <span style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{
            width: 1, height: 40,
            background: 'linear-gradient(to bottom, rgba(232,224,213,0.6), transparent)',
          }} />
        </div>
      </section>

      {/* ── SERVICES ────────────────────────────────────────── */}
      <section id="services" style={{
        padding: '100px 40px',
        background: 'linear-gradient(180deg, #0F1F35 0%, #0A1828 100%)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Section header */}
          <div style={{ marginBottom: 64 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
            }}>
              <span className="gold-dot" />
              <span style={{
                fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase',
                color: GOLD, fontWeight: 600,
              }}>What We Offer</span>
            </div>
            <h2 style={{
              fontFamily: 'Lora, serif', fontSize: 44,
              fontWeight: 700, color: 'white', marginBottom: 16,
            }}>Services</h2>
            <div style={{ width: 48, height: 2, background: RED }} />
          </div>

          {/* Service cards */}
          <div className="grid-3" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20,
            marginBottom: 60,
          }}>
            {[
              {
                icon: '🎵',
                title: 'DJ & Music Playback',
                desc: 'Professional sound system with curated playlists built around your taste. Dinner, dancing, and every moment in between.',
              },
              {
                icon: '🎤',
                title: 'MC Services',
                desc: 'Smooth announcements, introductions, and event flow coordination. We keep things moving naturally — never forced.',
              },
              {
                icon: '🔊',
                title: 'Full Audio Setup',
                desc: 'Complete setup and teardown of all equipment. We arrive early, sound-check everything, and leave no trace.',
              },
              {
                icon: '💍',
                title: 'Wedding Ceremonies',
                desc: 'Processionals, recessionals, and ceremony audio handled with care. Every moment mic\'d and mixed perfectly.',
              },
              {
                icon: '🎙',
                title: 'Wireless Microphones',
                desc: 'Handheld and lapel mics for toasts, vows, and speeches. Crystal clear audio for your most important words.',
              },
              {
                icon: '📋',
                title: 'Playlist Consultation',
                desc: 'A personal consultation to build your perfect soundtrack together. Must-plays, do-not-plays, and everything in between.',
              },
            ].map((s, i) => (
              <div key={i} className="service-card">
                <div style={{ fontSize: 28, marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{
                  fontFamily: 'Lora, serif', fontSize: 18,
                  color: 'white', marginBottom: 10,
                }}>{s.title}</h3>
                <p style={{
                  fontSize: 13, lineHeight: 1.7,
                  color: 'rgba(232,224,213,0.55)',
                }}>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Package highlight */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid rgba(200,169,110,0.2)`,
            borderLeft: `4px solid ${GOLD}`,
            borderRadius: 12, padding: '32px 36px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: 24,
          }}>
            <div>
              <p style={{
                fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase',
                color: GOLD, marginBottom: 8,
              }}>Starting Package</p>
              <h3 style={{
                fontFamily: 'Lora, serif', fontSize: 26,
                color: 'white', marginBottom: 6,
              }}>Basic DJ Package</h3>
              <p style={{ fontSize: 13, color: 'rgba(232,224,213,0.5)', maxWidth: 460 }}>
                Includes professional sound system, playlist consultation, up to 4 hours of live audio service,
                and full setup & takedown. Free travel within 30 miles of Provo.
              </p>
            </div>
            <button className="btn-primary" onClick={() => scrollTo('contact')}>
              Get a Quote →
            </button>
          </div>
        </div>
      </section>

      {/* ── ABOUT ───────────────────────────────────────────── */}
      <section id="about" style={{
        padding: '100px 40px',
        background: '#F5F0E4',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 80, alignItems: 'center',
        }} className="grid-2">

          {/* Image */}
          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: 16, overflow: 'hidden',
              aspectRatio: '4/5',
              backgroundImage: `url(${photos.about})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              filter: 'brightness(0.85)',
            }} />
            {/* Accent border */}
            <div style={{
              position: 'absolute', top: 20, left: 20, right: -20, bottom: -20,
              border: `2px solid rgba(79,185,175,0.2)`,
              borderRadius: 16, zIndex: -1,
            }} />
            {/* Quote card */}
            <div style={{
              position: 'absolute', bottom: -24, right: -24,
              background: '#0F1F35',
              borderRadius: 12, padding: '20px 24px',
              maxWidth: 240,
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }}>
              <p style={{
                fontFamily: 'Lora, serif', fontStyle: 'italic',
                fontSize: 13, lineHeight: 1.6, color: 'rgba(232,224,213,0.8)',
                marginBottom: 10,
              }}>
                "Every detail of your day deserves to sound as good as it looks."
              </p>
              <p style={{ fontSize: 11, color: TEAL, fontWeight: 600 }}>— Garrett Eldredge</p>
            </div>
          </div>

          {/* Text */}
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
            }}>
              <span className="gold-dot" />
              <span style={{
                fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase',
                color: GOLD, fontWeight: 600,
              }}>About</span>
            </div>
            <h2 style={{
              fontFamily: 'Lora, serif', fontSize: 40,
              fontWeight: 700, color: 'white', marginBottom: 8, lineHeight: 1.2,
            }}>
              Hi, I'm Garrett.
            </h2>
            <div style={{ width: 40, height: 2, background: RED, marginBottom: 28 }} />

            <p style={{
              fontSize: 15, lineHeight: 1.8, color: 'rgba(15,31,53,0.65)',
              marginBottom: 20,
            }}>
              Pescadero Music delivers professional live sound for small to medium-sized weddings
              and events — indoor or outdoor. Every event gets the same level of care, preparation,
              and on-site expertise.
            </p>
            <p style={{
              fontSize: 15, lineHeight: 1.8, color: 'rgba(15,31,53,0.65)',
              marginBottom: 36,
            }}>
              I believe great audio is invisible — you shouldn't notice it, you should just feel it.
              My job is to make sure the music, the announcements, and the energy are exactly right
              so you can be fully present for your day.
            </p>

            {/* Values */}
            {[
              ['Preparation', 'Detailed planning consultation before every event'],
              ['Collaboration', 'Working seamlessly with your vendors and planner'],
              ['Excellence', 'Professional gear, professional execution, every time'],
            ].map(([title, desc]) => (
              <div key={title} style={{
                display: 'flex', gap: 14, marginBottom: 20,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: TEAL, flexShrink: 0, marginTop: 6,
                }} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0F1F35', marginBottom: 2 }}>{title}</p>
                  <p style={{ fontSize: 12, color: 'rgba(15,31,53,0.5)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ─────────────────────────────────────────── */}
      <section id="contact" style={{
        padding: '100px 40px',
        background: 'linear-gradient(180deg, #0A1828 0%, #0F1F35 100%)',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16,
            }}>
              <span className="gold-dot" />
              <span style={{
                fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase',
                color: GOLD, fontWeight: 600,
              }}>Get in Touch</span>
            </div>
            <h2 style={{
              fontFamily: 'Lora, serif', fontSize: 44,
              fontWeight: 700, color: 'white', marginBottom: 16,
            }}>Book Your Date</h2>
            <p style={{
              fontSize: 15, color: 'rgba(232,224,213,0.5)', lineHeight: 1.6,
            }}>
              Ready to talk? Create an account to get started — or reach out directly
              and we'll get back to you within 24 hours.
            </p>
          </div>

          {/* Contact options */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 16, marginBottom: 40,
          }} className="grid-2">
            <a href="mailto:garrett@pescaderomusic.com" style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '18px 20px',
              textDecoration: 'none', transition: 'all 0.2s',
              color: 'inherit',
            }}>
              <span style={{ fontSize: 22 }}>✉️</span>
              <div>
                <p style={{ fontSize: 11, color: TEAL, fontWeight: 600, marginBottom: 2 }}>EMAIL</p>
                <p style={{ fontSize: 12, color: 'rgba(232,224,213,0.7)' }}>garrett@pescaderomusic.com</p>
              </div>
            </a>
            <a href="tel:2107279328" style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '18px 20px',
              textDecoration: 'none', transition: 'all 0.2s',
              color: 'inherit',
            }}>
              <span style={{ fontSize: 22 }}>📱</span>
              <div>
                <p style={{ fontSize: 11, color: TEAL, fontWeight: 600, marginBottom: 2 }}>PHONE / TEXT</p>
                <p style={{ fontSize: 12, color: 'rgba(232,224,213,0.7)' }}>(210) 727-9328</p>
              </div>
            </a>
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40,
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: 11, color: 'rgba(232,224,213,0.25)', letterSpacing: '2px' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* CTA to create account */}
          <div style={{
            background: `linear-gradient(135deg, rgba(214,48,49,0.1), rgba(79,185,175,0.05))`,
            border: '1px solid rgba(214,48,49,0.2)',
            borderRadius: 12, padding: '36px',
            textAlign: 'center',
          }}>
            <h3 style={{
              fontFamily: 'Lora, serif', fontSize: 22,
              color: 'white', marginBottom: 10,
            }}>Ready to get started?</h3>
            <p style={{
              fontSize: 13, color: 'rgba(232,224,213,0.5)',
              marginBottom: 24, lineHeight: 1.6,
            }}>
              Create your client account to submit an inquiry, track your booking,
              review your contract, and manage everything in one place.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/signup" className="btn-primary">
                Create Account →
              </Link>
              <Link href="/auth/login" className="btn-ghost">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer style={{
        padding: '40px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: '#080F1A',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 20,
        }}>
          <div>
            <div style={{
              fontFamily: 'Lora, serif', fontStyle: 'italic',
              fontSize: 16, color: RED, marginBottom: 4,
            }}>Pescadero Music</div>
            <p style={{ fontSize: 11, color: 'rgba(232,224,213,0.25)' }}>
              Professional Live Sound · Provo, Utah
            </p>
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            {[['Services', 'services'], ['About', 'about'], ['Contact', 'contact']].map(([label, id]) => (
              <button key={id} className="nav-link"
                onClick={() => scrollTo(id)}
                style={{ fontSize: 11 }}>
                {label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(232,224,213,0.2)' }}>
            © 2026 Pescadero Music
          </p>
        </div>
      </footer>
    </div>
  )
}
