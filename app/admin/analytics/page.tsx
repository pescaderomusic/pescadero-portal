import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import Link from 'next/link'
import AnalyticsClient from './AnalyticsClient'

export const dynamic = 'force-dynamic'

const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== GARRETT_ID) redirect('/dashboard')

  const admin = getAdmin()

  const [{ data: contracts }, { data: bookings }, { data: inquiries }] = await Promise.all([
    admin.from('contracts').select('*'),
    admin.from('bookings').select('*'),
    admin.from('inquiry_submissions').select('client_id, submitted_at'),
  ])

  return <AnalyticsClient contracts={contracts || []} bookings={bookings || []} inquiries={inquiries || []} />
}
