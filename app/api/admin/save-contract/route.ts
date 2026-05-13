// app/api/admin/save-contract/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'
function getAdmin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== GARRETT_ID) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { clientId, ...fields } = await req.json()
  const admin = getAdmin()

  const { data: booking } = await admin.from('bookings').select('id').eq('client_id', clientId).single()
  const { data: existing } = await admin.from('contracts').select('id, status').eq('client_id', clientId).single()

  // Calculate total
  const pkg      = Number(fields.package_price) || 0
  const travel   = Number(fields.travel_fee) || 0
  const addl     = (fields.additional_charges || []).reduce((s: number, c: any) => s + (Number(c.amount) || 0), 0)
  const taxRate  = Number(fields.sales_tax_rate) || 0
  const taxAmt   = Math.round(((pkg + travel + addl) * taxRate / 100) * 100) / 100
  const total    = pkg + travel + addl + taxAmt

  const contractData = {
    client_id:            clientId,
    booking_id:           booking?.id || null,
    client_name:          fields.client_name,
    client_email:         fields.client_email,
    client_phone:         fields.client_phone,
    event_date:           fields.event_date || null,
    event_type:           fields.event_type,
    event_start_time:     fields.event_start_time,
    event_end_time:       fields.event_end_time,
    venue_name:           fields.venue_name,
    venue_address:        fields.venue_address,
    expected_attendance:  fields.expected_attendance,
    indoor_outdoor:       fields.indoor_outdoor,
    day_of_contact_name:  fields.day_of_contact_name,
    day_of_contact_phone: fields.day_of_contact_phone,
    package:              fields.package,
    package_price:        pkg,
    travel_fee:           travel,
    overtime_rate:        Number(fields.overtime_rate) || 100,
    deposit_amount:       Number(fields.deposit_amount) || 100,
    deposit_due_date:     fields.deposit_due_date || null,
    final_payment_amount: Number(fields.final_payment_amount) || 0,
    final_payment_due:    fields.final_payment_due || null,
    contracted_hours:     fields.contracted_hours || '4',
    additional_charges:   fields.additional_charges || [],
    sales_tax_rate:       taxRate,
    sales_tax_amount:     taxAmt,
    total_due:            total,
    special_notes:        fields.special_notes || null,
    garrett_message:      fields.garrett_message || null,
    updated_at:           new Date().toISOString(),
  }

  let contract
  if (existing && !['signed','fully_paid','deposit_paid'].includes(existing.status || '')) {
    const { data } = await admin.from('contracts').update(contractData).eq('id', existing.id).select().single()
    contract = data
  } else if (!existing) {
    const { data } = await admin.from('contracts').insert({ ...contractData, status: 'pending', created_at: new Date().toISOString() }).select().single()
    contract = data
  } else {
    contract = existing
  }

  return NextResponse.json({ ok: true, contract })
}
