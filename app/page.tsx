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
              width: 44, height: 44,
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 8px rgba(214,48,49,0.35))',
            }}
          />
          <div style={{ lineHeight: 1 }}>
            <div style={{
              fontFamily: 'Lora, serif', fontStyle: 'italic',
              fontSize: 18, fontWeight: 700, color: RED,
              textShadow: '0 0 16px rgba(214,48,49,0.4)',
            }}>Pescadero</div>
            <div style={{
              fontFamily: 'monospace', fontSize: 7, fontWeight: 700,
              letterSpacing: '5px', color: TEAL,
              textShadow: '0 0 8px rgba(79,185,175,0.5)',
              textTransform: 'uppercase',
            }}>MUSIC</div>
          </div>
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
