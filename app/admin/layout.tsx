import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from '@/components/DashboardNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const name = profile?.full_name || user.email || ''
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0F1F35 0%, #0A1828 100%)' }}>
      <DashboardNav userName={name} userInitials={initials} />
      {children}
    </div>
  )
}
