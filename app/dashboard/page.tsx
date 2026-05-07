import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StepTracker from '@/components/StepTracker'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // Get booking if exists — if not, show dashboard with Step 1 active
  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('client_id', user.id)
    .single()

  return (
    <StepTracker
      booking={booking || null}
      clientName={profile?.full_name || ''}
    />
  )
}
