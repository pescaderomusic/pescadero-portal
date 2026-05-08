import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { contractId, fields } = await req.json()
  const admin = createAdminClient()

  // Verify this contract belongs to this user
  const { data: contract } = await admin
    .from('contracts')
    .select('client_id')
    .eq('id', contractId)
    .single()

  if (!contract || contract.client_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await admin
    .from('contracts')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', contractId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
