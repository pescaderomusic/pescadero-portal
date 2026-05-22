'use client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

const BLUE     = '#44BEC7'
const RED      = '#C8202A'
const CREAM    = '#F5EFE0'
const UI_FONT  = "'futura-pt-condensed', 'Barlow Condensed', sans-serif"
const BODY     = "'inter', system-ui, sans-serif"
const WORDMARK = "'RetroFloral', 'Barlow Condensed', sans-serif"

const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'

interface Props {
  userName: string
  userInitials: string
}

export default function DashboardNav({ userName, userInitials }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email === 'garrett@pescaderomusic.com') setIsAdmin(true)
    })
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const onAdmin = pathname === '/admin'

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(7,17,26,0.96)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(68,190,199,0.1)',
      padding: '0 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 58,
    }}>
      <style>{`
        @media (min-width: 641px) {
          .dn-wordmark { display: inline !important; }
          .dn-home { display: flex !important; }
          .dn-signout-label { display: inline !important; }
        }
      `}</style>

      {/* Left: Logo + wordmark + home */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img
            src="https://shxcw5yjydy1kgql.public.blob.vercel-storage.com/logo.png"
            alt="Pescadero Music"
            style={{ height: 30, width: 30, objectFit: 'contain', flexShrink: 0 }}
          />
          {/* Hide wordmark on mobile */}
          <span className="dn-wordmark" style={{ display: 'none', fontFamily: WORDMARK, fontSize: 15, letterSpacing: '3px', color: CREAM, textTransform: 'uppercase' }}>
            Pescadero Music
          </span>
        </Link>
        {/* Hide ← Home on mobile */}
        <Link className="dn-home" href="/" style={{
          display: 'none',
          fontSize: 11, color: 'rgba(245,239,224,0.3)',
          textDecoration: 'none', letterSpacing: '1.5px',
          textTransform: 'uppercase', fontFamily: UI_FONT,
          borderLeft: '1px solid rgba(245,239,224,0.08)',
          paddingLeft: 16, alignItems: 'center',
        }}>
          ← Home
        </Link>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Admin/Client toggle */}
        {isAdmin && (
          <button
            onClick={() => router.push(onAdmin ? '/dashboard' : '/admin')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: onAdmin ? 'rgba(68,190,199,0.1)' : 'rgba(245,239,224,0.04)',
              border: `1px solid ${onAdmin ? 'rgba(68,190,199,0.35)' : 'rgba(245,239,224,0.1)'}`,
              borderRadius: 8, padding: '6px 12px',
              fontSize: 11, fontFamily: UI_FONT, letterSpacing: '1.5px', textTransform: 'uppercase',
              color: onAdmin ? BLUE : 'rgba(245,239,224,0.5)',
              cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}
          >
            {onAdmin ? 'Client View' : 'Admin View'}
          </button>
        )}

        {/* Avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: `linear-gradient(135deg, ${BLUE}, #07111A)`,
          border: `2px solid ${BLUE}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontFamily: UI_FONT, letterSpacing: '1px',
          fontWeight: 500, color: CREAM, flexShrink: 0,
        }}>
          {userInitials}
        </div>

        {/* Sign out — icon on mobile, text on desktop */}
        <button
          onClick={handleSignOut}
          style={{
            background: 'transparent',
            border: '1px solid rgba(245,239,224,0.12)',
            borderRadius: 6, padding: '5px 10px',
            fontSize: 11, fontFamily: UI_FONT, letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: 'rgba(245,239,224,0.4)',
            cursor: 'pointer', transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          <span className="dn-signout-label" style={{ display: 'none' }}>Sign Out</span>
          <span className="dn-signout-icon" style={{ fontSize: 13 }}>↪</span>
        </button>
      </div>
    </header>
  )
}
