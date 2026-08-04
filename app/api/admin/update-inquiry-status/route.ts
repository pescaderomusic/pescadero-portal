// app/api/admin/update-inquiry-status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'
const VALID_STATUSES = ['new', 'reviewed', 'declined', 'converted']

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

  const { inquiryId, status } = await req.json()

  if (!inquiryId) return NextResponse.json({ error: 'inquiryId is required' }, { status: 400 })
  if (!VALID_STATUSES.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

  const admin = getAdmin()
  const { error } = await admin.from('inquiry_submissions').update({ status }).eq('id', inquiryId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
