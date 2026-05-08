import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminDashboard from '@/components/AdminDashboard'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/auth/login')

  const admin = createAdminClient()

  const [{ data: bookings }, { data: inquiries }, { data: profiles }, { data: contracts }] = await Promise.all([
    admin.from('bookings').select('*, profiles ( full_name, phone, preferred_contact, email )').order('created_at', { ascending: false }),
    admin.from('inquiry_submissions').select('*').order('submitted_at', { ascending: false }),
    admin.from('profiles').select('*').order('created_at', { ascending: false }),
    admin.from('contracts').select('*').order('created_at', { ascending: false }),
  ])

  return <AdminDashboard bookings={bookings || []} inquiries={inquiries || []} profiles={profiles || []} contracts={contracts || []} />
}
