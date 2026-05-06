import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from '@/components/DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0F1F35 0%, #162840 60%, #0A1828 100%)',
    }}>
      <DashboardNav
        userName={profile?.full_name || user.email || ''}
        userInitials={getInitials(profile?.full_name || user.email || '')}
      />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '36px 24px 80px' }}>
        {children}
      </main>
    </div>
  )
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
