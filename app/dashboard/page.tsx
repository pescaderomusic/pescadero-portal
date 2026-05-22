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

  const [{ data: booking }, { data: inquiry }] = await Promise.all([
    supabase.from('bookings').select('*').eq('client_id', user.id).single(),
    supabase.from('inquiry_submissions').select('couple_names, event_name, venue_name').eq('client_id', user.id).single(),
  ])

  // Merge inquiry fields into booking for display
  const bookingWithNames = booking ? {
    ...booking,
    couple_names: booking.couple_names || inquiry?.couple_names,
    event_name:   booking.event_name   || inquiry?.event_name,
    venue_name:   booking.venue_name   || inquiry?.venue_name,
  } : null

  const justPaid = !!searchParams.session_id

  return (
    <StepTracker
      booking={bookingWithNames}
      clientName={profile?.full_name || ''}
      justPaid={justPaid}
      paymentType={searchParams.type}
      userId={user.id}
    />
  )
}
