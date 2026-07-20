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
      attendance: body.attendance ? parseInt(body.attendance) : null,
      additional_notes: body.additionalDetails || null,
      hear_about_us: body.hearAbout || null,
      vendor_name: body.vendorName || null,
      vendor_type: body.vendorType || null,
      other_hear: body.otherHear || null,
      // New fields
      event_category: body.eventCategory || 'wedding',
      wedding_package: body.weddingPackage || null,
      movie_location: body.movieLocation || null,
      submitted_at: new Date().toISOString(),
    }

    const { error: inquiryErr } = await supabase
      .from('inquiry_submissions')
      .insert(inquiryPayload)

    if (inquiryErr) {
      console.error('Inquiry insert error:', inquiryErr)
      // Don't fail the whole request — still try to create booking row
    }

    // ── Create or update booking row ──────────────────────────────────────────
    if (userId) {
      const { data: existingBooking } = await supabase
        .from('bookings')
        .select('id')
        .eq('client_id', userId)
        .single()

      if (!existingBooking) {
        await supabase.from('bookings').insert({
          client_id: userId,
          client_name: body.coupleNames || `${body.firstName || ''} ${body.lastName || ''}`.trim(),
          event_date: body.eventDate || null,
          venue: body.venue || null,
          step: 1,
          event_category: body.eventCategory || 'wedding',
        })
      }
    }

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
        subject: `New Inquiry: ${body.eventName || email} [${catLabel}]`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1A2D3F;">
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

    return NextResponse.json({ success: true, userId })
  } catch (err) {
    console.error('Submit inquiry error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
