import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const body = await req.json()
    const supabase = adminClient()

    // ── Resolve or create user ────────────────────────────────────────────────
    const email = (body.email || '').toLowerCase().trim()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    let userId: string | null = null

    // Check existing user
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existing = existingUsers?.users?.find(u => u.email?.toLowerCase() === email)

    if (existing) {
      userId = existing.id
    } else {
      // Create account silently
      const tempPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: `${body.firstName || ''} ${body.lastName || ''}`.trim(),
        },
      })
      if (createErr) {
        console.error('Create user error:', createErr)
      } else {
        userId = newUser.user?.id || null
      }
    }

    // ── Build event types array ────────────────────────────────────────────────
    const eventTypes = Array.isArray(body.eventTypes)
      ? body.eventTypes
      : (body.services ? body.services : [])

    // ── Fold fields with no dedicated column into additional_notes ─────────────
    const hearAboutNote = body.hearAbout
      ? `Heard about us via: ${body.hearAbout}${body.vendorName ? ` — ${body.vendorName}` : ''}${body.vendorType ? ` (${body.vendorType})` : ''}${body.otherHear ? ` — ${body.otherHear}` : ''}`
      : null
    const combinedNotes = [body.additionalDetails, hearAboutNote].filter(Boolean).join('\n\n') || null

    // ── Insert inquiry_submission ─────────────────────────────────────────────
    const inquiryPayload: any = {
      client_id: userId,
      first_name: body.firstName || null,
      last_name: body.lastName || null,
      email: email,
      phone: body.phone || null,
      preferred_contact: body.contactMethod || null,
      couple_names: body.coupleNames || null,
      event_name: body.eventName || null,
      services_requested: eventTypes,
      event_date: body.eventDate || null,
      start_time: body.startTime || null,
      end_time: body.endTime || null,
      venue_name: body.venue || null,
      venue_address: body.venueAddress || null,
      indoor_outdoor: body.indoorOutdoor || null,
      attendance: body.attendance || null,
      additional_notes: combinedNotes,
      event_category: body.eventCategory || 'wedding',
      wedding_package: body.weddingPackage || null,
      movie_location: body.movieLocation || null,
      status: 'new',
      submitted_at: new Date().toISOString(),
    }

    const { error: inquiryErr } = await supabase
      .from('inquiry_submissions')
      .insert(inquiryPayload)

    if (inquiryErr) console.error('Inquiry insert error:', inquiryErr)

    // ── Create or update booking row ──────────────────────────────────────────
    let bookingErr: any = null
    if (userId) {
      const { data: existingBooking } = await supabase
        .from('bookings')
        .select('id')
        .eq('client_id', userId)
        .single()

      if (!existingBooking) {
        const eventTypeLabel = body.eventCategory === 'wedding' ? 'Wedding' : body.eventCategory === 'movie' ? 'Movie Night' : 'Event'
        const { error } = await supabase.from('bookings').insert({
          client_id: userId,
          event_date: body.eventDate || null,
          venue_name: body.venue || null,
          venue_address: body.venueAddress || null,
          event_type: eventTypeLabel,
          package: body.weddingPackage || null,
          status: 'active',
          step_inquiry: 'complete',
          step_consultation: 'pending',
          step_contract: 'locked',
          step_deposit: 'locked',
          step_planning: 'locked',
          step_final_payment: 'locked',
          step_event: 'locked',
          event_category: body.eventCategory || 'wedding',
        })
        bookingErr = error
        if (bookingErr) console.error('Booking insert error:', bookingErr)
      }
    }

    // If the write to Supabase failed, tell the client so it doesn't show a
    // false success — and still flag Garrett so no lead gets lost silently.
    const saveFailed = !!inquiryErr || !!bookingErr

    // ── Notification email to Garrett ─────────────────────────────────────────
    const categoryLabel: Record<string, string> = {
      wedding: '💍 Wedding Sound',
      event: '🎶 DJ / Event',
      movie: '🎬 Outdoor Movie Night',
    }
    const catLabel = categoryLabel[body.eventCategory || 'wedding'] || body.eventCategory

    try {
      await resend.emails.send({
        from: 'Pescadero Music <noreply@pescaderomusic.com>',
        to: 'garrett@pescaderomusic.com',
        subject: saveFailed
          ? `⚠️ Inquiry FAILED to save: ${body.eventName || email} [${catLabel}]`
          : `New Inquiry: ${body.eventName || email} [${catLabel}]`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1A2D3F;">
            ${saveFailed ? `<div style="background:#C8202A;color:#fff;padding:14px 24px;font-size:13px;font-weight:bold;">⚠️ This inquiry did NOT save to the admin panel (${inquiryErr ? 'inquiry' : 'booking'} write failed). The details below are from the raw submission — you'll need to add this client manually.</div>` : ''}
            <div style="background:#07111A;padding:20px 24px;border-bottom:3px solid #C8202A;">
              <h1 style="color:#F5EFE0;font-size:18px;margin:0;">New Inquiry — ${catLabel}</h1>
            </div>
            <div style="padding:24px;">
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <tr><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;color:#8A9EAA;width:140px;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Type</td><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;">${catLabel}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;color:#8A9EAA;width:140px;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Name</td><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;">${body.firstName || ''} ${body.lastName || ''}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;color:#8A9EAA;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Email</td><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;"><a href="mailto:${email}">${email}</a></td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;color:#8A9EAA;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Phone</td><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;">${body.phone || '—'}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;color:#8A9EAA;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Contact Via</td><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;">${body.contactMethod || '—'}</td></tr>
                ${body.coupleNames ? `<tr><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;color:#8A9EAA;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Couple</td><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;">${body.coupleNames}</td></tr>` : ''}
                <tr><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;color:#8A9EAA;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Event</td><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;">${body.eventName || '—'}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;color:#8A9EAA;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Date</td><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;">${body.eventDate || '—'}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;color:#8A9EAA;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Time</td><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;">${body.startTime || '—'} – ${body.endTime || '—'}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;color:#8A9EAA;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Venue</td><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;">${body.venue || '—'}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;color:#8A9EAA;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Address</td><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;">${body.venueAddress || '—'}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;color:#8A9EAA;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Setting</td><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;">${body.indoorOutdoor || '—'}</td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;color:#8A9EAA;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Attendance</td><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;">${body.attendance || '—'}</td></tr>
                ${body.weddingPackage ? `<tr><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;color:#8A9EAA;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Package</td><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;font-weight:bold;color:#C8202A;">${body.weddingPackage}</td></tr>` : ''}
                ${body.movieLocation ? `<tr><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;color:#8A9EAA;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Location Type</td><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;">${body.movieLocation}</td></tr>` : ''}
                <tr><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;color:#8A9EAA;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Heard About</td><td style="padding:8px 0;border-bottom:1px solid #EAE0CC;">${body.hearAbout || '—'}${body.vendorName ? ' — ' + body.vendorName : ''}</td></tr>
                ${body.additionalDetails ? `<tr><td style="padding:8px 0;color:#8A9EAA;font-size:11px;text-transform:uppercase;letter-spacing:1px;vertical-align:top;">Notes</td><td style="padding:8px 0;">${body.additionalDetails}</td></tr>` : ''}
              </table>
              <div style="margin-top:20px;">
                <a href="https://www.pescaderomusic.com/admin/inquiries" style="background:#C8202A;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:bold;">View in Admin Panel →</a>
              </div>
            </div>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('Email error:', emailErr)
    }

    if (saveFailed) {
      return NextResponse.json({ error: 'We had trouble saving your inquiry. Garrett has been notified directly — you can also reach him at garrett@pescaderomusic.com.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, userId })
  } catch (err) {
    console.error('Submit inquiry error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
