import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StepTracker from '@/components/StepTracker'

export const dynamic = 'force-dynamic'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { session_id?: string; type?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('client_id', user.id)
    .single()

  const justPaid = !!searchParams.session_id

  return (
    <StepTracker
      booking={booking || null}
      clientName={profile?.full_name || ''}
      justPaid={justPaid}
      paymentType={searchParams.type}
    />
  )
}
