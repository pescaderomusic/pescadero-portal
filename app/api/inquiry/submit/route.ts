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
      services_requested:  body.eventTypes || body.services || [],
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
    const services = body.eventTypes || body.services || []
    await resend.emails.send({
      from: 'Pescadero Music <garrett@pescaderomusic.com>',
      to: 'garrett@pescaderomusic.com',
      subject: `📋 New Inquiry — ${clientName}`,
      html: `
        <p><strong>${clientName}</strong> just submitted an inquiry.</p>
        <table style="font-size:14px;border-collapse:collapse;width:100%;max-width:500px;">
          <tr><td style="padding:4px 8px;color:#888;width:140px;">Couple/Event</td><td><strong>${body.coupleNames || body.eventName || '—'}</strong></td></tr>
          <tr><td style="padding:4px 8px;color:#888;">Email</td><td>${body.email || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#888;">Phone</td><td>${body.phone || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#888;">Preferred Contact</td><td>${body.contactMethod || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#888;">Event Date</td><td>${body.eventDate || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#888;">Time</td><td>${body.startTime || '—'} – ${body.endTime || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#888;">Venue</td><td>${body.venue || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#888;">Address</td><td>${body.venueAddress || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#888;">Setting</td><td>${body.indoorOutdoor || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#888;">Guests</td><td>${body.attendance || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#888;">Services</td><td>${Array.isArray(services) ? services.join(', ') : services || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#888;">How They Found Us</td><td>${body.hearAbout || '—'}${body.vendorName ? ` — ${body.vendorName}` : ''}</td></tr>
          <tr><td style="padding:4px 8px;color:#888;">Notes</td><td>${body.additionalDetails || '—'}</td></tr>
        </table>
        <p style="margin-top:16px;"><a href="https://pescaderomusic.com/admin" style="background:#D62828;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;font-weight:bold;">View in Admin Panel →</a></p>
      `,
    })
  } catch (e) { console.error('Garrett notify error:', e) }

  return NextResponse.json({ ok: true })
}
