// app/api/admin/delete-client/route.ts
// Permanently deletes a client and all associated records. Intended for
// removing test/fake clients — use archive instead for real past clients.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== GARRETT_ID) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { clientId } = await req.json()
  if (!clientId) return NextResponse.json({ error: 'clientId is required' }, { status: 400 })
  if (clientId === GARRETT_ID) return NextResponse.json({ error: 'Cannot delete the admin account' }, { status: 400 })

  const admin = getAdmin()

  // Delete child records first, then the booking/profile, then the auth user.
  const tables = ['consultation_requests', 'planning_forms', 'reviews', 'contracts', 'inquiry_submissions', 'bookings']
  for (const table of tables) {
    const { error } = await admin.from(table).delete().eq('client_id', clientId)
    if (error) return NextResponse.json({ error: `Failed deleting from ${table}: ${error.message}` }, { status: 500 })
  }

  const { error: profileErr } = await admin.from('profiles').delete().eq('id', clientId)
  if (profileErr) return NextResponse.json({ error: `Failed deleting profile: ${profileErr.message}` }, { status: 500 })

  const { error: authErr } = await admin.auth.admin.deleteUser(clientId)
  if (authErr) return NextResponse.json({ error: `Failed deleting auth user: ${authErr.message}` }, { status: 500 })

  return NextResponse.json({ ok: true })
}
