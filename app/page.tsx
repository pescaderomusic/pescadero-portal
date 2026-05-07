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
              width: 48, height: 48,
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 10px rgba(214,48,49,0.4))',
              background: 'transparent',
            }}
          />
          <div style={{ lineHeight: 1 }}>
            <div style={{
              fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: RED, letterSpacing: '2px',
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
