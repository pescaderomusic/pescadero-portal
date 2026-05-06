import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminDashboard from '@/components/AdminDashboard'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/auth/login')
  }

  // Use admin client to fetch all bookings with profile info
  const admin = createAdminClient()
  const { data: bookings } = await admin
    .from('bookings')
    .select(`
      *,
      profiles ( full_name, phone, preferred_contact ),
      inquiries ( event_type, services_requested, budget_range, additional_notes, submitted_at )
    `)
    .order('created_at', { ascending: false })

  return <AdminDashboard bookings={bookings || []} />
}
