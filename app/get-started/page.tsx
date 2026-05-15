import Link from 'next/link'

export default function GetStartedPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0D1B2A', fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>

        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ margin: '0 0 2px', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 24, fontWeight: 700, color: 'white' }}>Pescadero Music</p>
          <p style={{ margin: 0, fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: '#44BEC7' }}>Wedding Sound Services</p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '36px 32px' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(68,190,199,0.1)', border: '1px solid rgba(68,190,199,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24 }}>
            🎵
          </div>

          <h1 style={{ margin: '0 0 12px', fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
            Let's Book Your Date
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            Create a free account to submit your inquiry and track every step of your booking — from your consultation all the way to your wedding day.
          </p>

          {/* Benefits */}
          <div style={{ textAlign: 'left', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '📋', text: 'Submit and track your inquiry in real time' },
              { icon: '📄', text: 'Review, sign, and pay your contract securely' },
              { icon: '🎶', text: 'Submit your event planning & music form' },
              { icon: '💳', text: 'Make payments and view receipts' },
              { icon: '📅', text: 'Countdown to your event day' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 16, flexShrink: 0, width: 24, textAlign: 'center' }}>{icon}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{text}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link
              href="/auth/signup"
              style={{ display: 'block', padding: '13px', borderRadius: 10, background: '#D62828', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 700, boxShadow: '0 4px 20px rgba(214,40,40,0.3)' }}
            >
              Create Account →
            </Link>
            <Link
              href="/auth/login"
              style={{ display: 'block', padding: '13px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 14 }}
            >
              Already have an account? Sign In
            </Link>
          </div>
        </div>

        <p style={{ marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          Questions?{' '}
          <a href="mailto:garrett@pescaderomusic.com" style={{ color: '#44BEC7', textDecoration: 'none' }}>garrett@pescaderomusic.com</a>
        </p>
      </div>
    </div>
  )
}
