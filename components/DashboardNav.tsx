'use client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

const LOGO_B64 = "" // will be filled

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
      background: 'rgba(10,24,40,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(79,185,175,0.12)',
      padding: '0 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 64,
    }}>
      {/* Logo + home link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ lineHeight: 1 }}>
          <div style={{
            fontFamily: 'Georgia, serif', fontStyle: 'italic',
            fontSize: 18, fontWeight: 700, color: '#D63031',
            textShadow: '0 0 10px rgba(214,48,49,0.4)',
          }}>Pescadero</div>
          <div style={{
            fontFamily: 'monospace', fontSize: 8, fontWeight: 700,
            letterSpacing: '4px', color: '#4FB9AF',
            textTransform: 'uppercase',
          }}>CLIENT PORTAL</div>
        </div>
        <Link href="/" style={{
          fontSize: 11, color: 'rgba(232,224,213,0.35)',
          textDecoration: 'none', letterSpacing: '1px',
          textTransform: 'uppercase', fontFamily: 'Poppins, sans-serif',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
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
              background: onAdmin ? 'rgba(79,185,175,0.12)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${onAdmin ? 'rgba(79,185,175,0.35)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 8, padding: '6px 14px',
              fontSize: 11, fontWeight: 600,
              color: onAdmin ? '#4FB9AF' : 'rgba(232,224,213,0.5)',
              cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
              letterSpacing: '0.5px', transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 13 }}>{onAdmin ? '👤' : '⚙️'}</span>
            {onAdmin ? 'Client View' : 'Admin View'}
          </button>
        )}

        {/* Avatar */}
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'linear-gradient(135deg, #4FB9AF, #0F1F35)',
          border: '2px solid #4FB9AF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: 'white',
          fontFamily: 'Poppins, sans-serif',
        }}>
          {userInitials}
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6, padding: '5px 12px',
            fontSize: 11, color: 'rgba(232,224,213,0.45)',
            cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
            transition: 'all 0.2s',
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
