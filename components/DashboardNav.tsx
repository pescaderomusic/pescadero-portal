'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userName: string
  userInitials: string
}

export default function DashboardNav({ userName, userInitials }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

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
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
          }}>MUSIC</div>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{
          fontSize: 12, color: 'rgba(232,224,213,0.45)',
          fontFamily: 'Poppins, sans-serif',
          display: 'none', // hidden on mobile
        }}>
          {userName}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
      </div>
    </header>
  )
}
