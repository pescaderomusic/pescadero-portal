// app/api/inquiry/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

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
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const admin = getAdmin()

  // Save inquiry submission
  const { error: inquiryErr } = await admin
    .from('inquiry_submissions')
    .upsert({
      client_id:           user.id,
      first_name:          body.firstName,
      last_name:           body.lastName,
      email:               body.email,
      phone:               body.phone,
      preferred_contact:   body.contactMethod,
      couple_names:        body.coupleNames,
      event_name:          body.eventName,
      event_date:          body.eventDate || null,
      start_time:          body.startTime,
      end_time:            body.endTime,
      venue_name:          body.venue,
      venue_address:       body.venueAddress,
      indoor_outdoor:      body.indoorOutdoor,
      attendance:          body.attendance,
      services_requested:  body.services,
      budget:              body.budget,
      additional_notes:    body.additionalDetails,
      status:              'new',
      submitted_at:        new Date().toISOString(),
    }, { onConflict: 'client_id' })

  if (inquiryErr) {
    console.error('Inquiry save error:', inquiryErr)
    return NextResponse.json({ error: inquiryErr.message }, { status: 500 })
  }

  // Update booking step_inquiry to complete
  // First check if booking exists
  const { data: existing } = await admin
    .from('bookings')
    .select('id')
    .eq('client_id', user.id)
    .single()

  if (existing) {
    await admin.from('bookings')
      .update({ step_inquiry: 'complete', step_consultation: 'pending' })
      .eq('client_id', user.id)
  } else {
    // Create booking if it doesn't exist
    await admin.from('bookings').insert({
      client_id:        user.id,
      step_inquiry:     'complete',
      step_consultation:'pending',
      step_contract:    'locked',
      step_deposit:     'locked',
      step_planning:    'locked',
      step_final_payment: 'locked',
      step_event:       'locked',
    })
  }

  // Notify Garrett (fire and forget)
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const clientName = profile?.full_name || body.coupleNames || `${body.firstName} ${body.lastName}`

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY!)
    await resend.emails.send({
      from: 'Pescadero Music <garrett@pescaderomusic.com>',
      to: 'garrett@pescaderomusic.com',
      subject: `📋 New Inquiry — ${clientName}`,
      html: `
        <p><strong>${clientName}</strong> just submitted an inquiry.</p>
        <p><strong>Event:</strong> ${body.eventName || '—'}<br>
        <strong>Date:</strong> ${body.eventDate || '—'}<br>
        <strong>Venue:</strong> ${body.venue || '—'}<br>
        <strong>Services:</strong> ${Array.isArray(body.services) ? body.services.join(', ') : body.services || '—'}<br>
        <strong>Budget:</strong> ${body.budget || '—'}</p>
        <p><a href="https://pescaderomusic.com/admin">View in Admin Panel →</a></p>
      `,
    })
  } catch (e) { console.error('Garrett notify error:', e) }

  return NextResponse.json({ ok: true })
}
