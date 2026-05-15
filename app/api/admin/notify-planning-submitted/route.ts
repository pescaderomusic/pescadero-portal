import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { Resend } = await import('resend')
    const twilio = await import('twilio')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const twilioClient = twilio.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

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

    await resend.emails.send({
      from:    'Pescadero Music <notifications@pescaderomusic.com>',
      to:      'garrett@pescaderomusic.com',
      subject: `📋 Planning Form Submitted — ${coupleNames || clientName}`,
      html: `<div style="font-family:Poppins,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#0D1B2A;color:white;border-radius:12px;">
        <p style="font-family:Georgia,serif;font-style:italic;font-size:20px;margin:0 0 20px;">Pescadero Music</p>
        <p style="font-size:20px;font-weight:700;margin:0 0 8px;">📋 Planning Form Submitted</p>
        <p style="color:rgba(255,255,255,0.55);margin:0 0 20px;">${coupleNames || clientName} has submitted their planning form.</p>
        <p style="color:rgba(255,255,255,0.4);margin:0 0 4px;font-size:12px;">EVENT DATE</p>
        <p style="margin:0 0 16px;">${eventDate}${venue ? ' · ' + venue : ''}</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/client/${clientId}" style="display:inline-block;padding:12px 28px;background:#D62828;color:white;text-decoration:none;border-radius:8px;font-weight:700;">View Planning Form →</a>
      </div>`,
    })

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
