import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { bookingId, field, value } = await req.json()
  const admin = createAdminClient()

  const updates: Record<string, string> = { [field]: value }
  if (field === 'step_deposit' && value === 'paid') updates.step_planning = 'pending'
  if (field === 'step_planning' && value === 'submitted') updates.step_consultation = 'pending'

  const { error } = await admin.from('bookings').update(updates).eq('id', bookingId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, updates })
}
