import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import twilio from 'twilio'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function POST(req: Request) {
  try {
    const { clientId } = await req.json()
    const supabase = await createClient()

    const [{ data: profile }, { data: inquiry }] = await Promise.all([
      supabase.from('profiles').select('full_name, phone').eq('id', clientId).single(),
      supabase.from('inquiry_submissions').select('email, event_date, venue_name, couple_names').eq('client_id', clientId).single(),
    ])

    const clientName  = profile?.full_name || 'A client'
    const coupleNames = inquiry?.couple_names || ''
    const eventDate   = inquiry?.event_date
      ? new Date(inquiry.event_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      : 'TBD'
    const venue = inquiry?.venue_name || ''

    // Email to Garrett
    await resend.emails.send({
      from:    'Pescadero Music <notifications@pescaderomusic.com>',
      to:      'garrett@pescaderomusic.com',
      subject: `📋 Planning Form Submitted — ${coupleNames || clientName}`,
      html: `
        <div style="font-family:Poppins,sans-serif;max-width:520px;margin:0 auto;background:#0D1B2A;color:white;border-radius:12px;overflow:hidden;">
          <div style="background:#0D1B2A;padding:28px 32px;border-bottom:3px solid #D62828;">
            <p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:20px;color:white;">Pescadero Music</p>
          </div>
          <div style="padding:28px 32px;">
            <p style="font-size:22px;font-weight:700;color:white;margin:0 0 8px;">📋 Planning Form Submitted</p>
            <p style="font-size:14px;color:rgba(255,255,255,0.55);margin:0 0 24px;">${clientName} has submitted their event planning form.</p>
            <div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:16px 20px;margin-bottom:24px;">
              ${coupleNames ? `<p style="margin:0 0 4px;font-size:13px;color:rgba(255,255,255,0.4);">Couple</p><p style="margin:0 0 12px;font-size:14px;color:white;font-weight:600;">${coupleNames}</p>` : ''}
              <p style="margin:0 0 4px;font-size:13px;color:rgba(255,255,255,0.4);">Event Date</p>
              <p style="margin:0 0 12px;font-size:14px;color:white;">${eventDate}</p>
              ${venue ? `<p style="margin:0 0 4px;font-size:13px;color:rgba(255,255,255,0.4);">Venue</p><p style="margin:0;font-size:14px;color:white;">${venue}</p>` : ''}
            </div>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/client/${clientId}" style="display:inline-block;padding:12px 28px;background:#D62828;color:white;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">View Planning Form →</a>
          </div>
        </div>
      `,
    })

    // SMS to Garrett
    if (process.env.GARRETT_PHONE_NUMBER && process.env.TWILIO_PHONE_NUMBER) {
      await twilioClient.messages.create({
        body: `📋 Planning form submitted — ${coupleNames || clientName} (${eventDate}). View: ${process.env.NEXT_PUBLIC_SITE_URL}/admin/client/${clientId}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to:   process.env.GARRETT_PHONE_NUMBER,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('notify-planning-submitted error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
