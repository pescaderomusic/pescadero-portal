import type { Metadata, Viewport } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminNav from '@/components/admin/AdminNav'

export const metadata: Metadata = {
  title: 'Admin | Pescadero Music',
  manifest: '/pm-admin.webmanifest',
  appleWebApp: { capable: true, title: 'PM Admin', statusBarStyle: 'black-translucent' },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#07111A',
  viewportFit: 'cover',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-[100dvh] bg-background" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <AdminNav />
      {/* room for the phone tab bar */}
      <div className="pb-[calc(80px+env(safe-area-inset-bottom))] md:pb-0">{children}</div>
    </div>
  )
}
