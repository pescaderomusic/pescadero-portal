import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StepTracker from '@/components/StepTracker'

export const dynamic = 'force-dynamic'

const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { session_id?: string; type?: string; client?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Redirect Garrett to admin unless explicitly in client view
  if (user.id === GARRETT_ID && searchParams.client !== 'true') {
    redirect('/admin')
  }

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
