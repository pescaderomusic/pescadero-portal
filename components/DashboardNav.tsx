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
      padding: '0 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 64,
    }}>
      {/* Logo + wordmark + home link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img
            src="https://shxcw5yjydy1kgql.public.blob.vercel-storage.com/logo.png"
            alt="Pescadero Music"
            style={{ height: 32, width: 32, objectFit: 'contain' }}
          />
          <span style={{ fontFamily: WORDMARK, fontSize: 15, letterSpacing: '3px', color: CREAM, textTransform: 'uppercase' }}>
            Pescadero Music
          </span>
        </Link>
        <Link href="/" style={{
          fontSize: 11, color: 'rgba(245,239,224,0.3)',
          textDecoration: 'none', letterSpacing: '1.5px',
          textTransform: 'uppercase', fontFamily: UI_FONT,
          borderLeft: '1px solid rgba(245,239,224,0.08)',
          paddingLeft: 20,
        }}>
          ← Home
        </Link>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Admin toggle — only shown to garrett */}
        {isAdmin && (
          <button
            onClick={() => router.push(onAdmin ? '/dashboard' : '/admin')}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: onAdmin ? 'rgba(68,190,199,0.1)' : 'rgba(245,239,224,0.04)',
              border: `1px solid ${onAdmin ? 'rgba(68,190,199,0.35)' : 'rgba(245,239,224,0.1)'}`,
              borderRadius: 8, padding: '6px 14px',
              fontSize: 12, fontFamily: UI_FONT, letterSpacing: '1.5px', textTransform: 'uppercase',
              color: onAdmin ? BLUE : 'rgba(245,239,224,0.5)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {onAdmin ? 'Client View' : 'Admin View'}
          </button>
        )}

        {/* Avatar */}
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: `linear-gradient(135deg, ${BLUE}, #07111A)`,
          border: `2px solid ${BLUE}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontFamily: UI_FONT, letterSpacing: '1px',
          fontWeight: 500, color: CREAM,
        }}>
          {userInitials}
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          style={{
            background: 'transparent',
            border: '1px solid rgba(245,239,224,0.12)',
            borderRadius: 6, padding: '5px 14px',
            fontSize: 11, fontFamily: UI_FONT, letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: 'rgba(245,239,224,0.4)',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}
