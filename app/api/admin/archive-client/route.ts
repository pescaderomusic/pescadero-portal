// app/api/admin/archive-client/route.ts
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

  const { clientId, archive } = await req.json()
  if (!clientId || typeof archive !== 'boolean') {
    return NextResponse.json({ error: 'clientId and archive (boolean) are required' }, { status: 400 })
  }

  const admin = getAdmin()
  const { error } = await admin
    .from('bookings')
    .update({ archived_at: archive ? new Date().toISOString() : null })
    .eq('client_id', clientId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
