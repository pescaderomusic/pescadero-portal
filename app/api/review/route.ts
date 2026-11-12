import { NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { clientIdFromCode } from '@/lib/review-link'

function getAdmin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const clientId = body ? clientIdFromCode(body.code) : null
  if (!clientId) return NextResponse.json({ error: 'This review link is not valid.' }, { status: 400 })

  const rating = Number(body.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Please choose a star rating.' }, { status: 400 })
  }

  const admin = getAdmin()
  const { data: existing } = await admin.from('reviews').select('id').eq('client_id', clientId).limit(1)
  if (existing && existing.length > 0) return NextResponse.json({ ok: true, already: true })

  const { error } = await admin.from('reviews').insert({
    client_id: clientId,
    rating,
    testimonial: clip(body.testimonial, 4000),
    photo_release: body.photo_release === true,
    use_for_advertising: body.use_for_advertising === true,
    referral_name: clip(body.referral_name, 200),
    referral_phone: clip(body.referral_phone, 40),
    additional_feedback: clip(body.additional_feedback, 4000),
    submitted_at: new Date().toISOString(),
  })
  if (error) {
    console.error('Review insert error:', error.message)
    return NextResponse.json({ error: 'Could not save your review. Please try again.' }, { status: 500 })
  }

  await admin.from('bookings').update({ step_event: 'complete' }).eq('client_id', clientId)
  return NextResponse.json({ ok: true })
}
