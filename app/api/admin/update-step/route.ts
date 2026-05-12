// app/api/admin/update-step/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'

const VALID_STEPS = ['step_inquiry','step_consultation','step_contract','step_deposit','step_planning','step_final_payment','step_event']
const VALID_VALUES = ['locked','pending','sent','complete','signed','paid','submitted','scheduled']

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

  const { clientId, stepKey, value } = await req.json()

  if (!VALID_STEPS.includes(stepKey)) return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
  if (!VALID_VALUES.includes(value)) return NextResponse.json({ error: 'Invalid value' }, { status: 400 })

  const admin = getAdmin()
  const { error } = await admin.from('bookings').update({ [stepKey]: value }).eq('client_id', clientId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auto-progression logic
  if (stepKey === 'step_consultation' && value === 'complete') {
    // Unlock contract step
    await admin.from('bookings').update({ step_contract: 'pending' }).eq('client_id', clientId).eq('step_contract', 'locked')
  }
  if (stepKey === 'step_contract' && value === 'signed') {
    await admin.from('bookings').update({ step_deposit: 'pending' }).eq('client_id', clientId).eq('step_deposit', 'locked')
  }

  return NextResponse.json({ ok: true })
}
