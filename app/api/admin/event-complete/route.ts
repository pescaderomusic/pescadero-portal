// app/api/admin/event-complete/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'

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
  if (!user || user.id !== GARRETT_ID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { clientId } = await req.json()
  const admin = getAdmin()

  // Mark event complete
  await admin.from('bookings')
    .update({ step_event: 'complete' })
    .eq('client_id', clientId)

  // Get client info
  const { data: userData } = await admin.auth.admin.getUserById(clientId)
  const { data: profile }  = await admin.from('profiles').select('full_name').eq('id', clientId).single()
  const { data: inquiry }  = await admin.from('inquiry_submissions').select('phone, couple_names, event_name').eq('client_id', clientId).single()
  const { data: contract } = await admin.from('contracts').select('event_type, event_date').eq('client_id', clientId).single()

  const email     = userData?.user?.email
  const fullName  = profile?.full_name || 'there'
  const firstName = fullName.split(' ')[0]
  const eventName = contract?.event_type || inquiry?.couple_names || inquiry?.event_name || 'your event'
  const phone     = inquiry?.phone

  // Send review email
  if (email) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY!)
      await resend.emails.send({
        from: 'Pescadero Music <garrett@pescaderomusic.com>',
        to: email,
        subject: `How did we do? Leave a review — ${eventName}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
            <div style="background:#0D1B2A;padding:24px 32px;border-radius:12px 12px 0 0;">
              <p style="margin:0;font-size:18px;font-weight:700;color:white;">Pescadero Music</p>
              <p style="margin:4px 0 0;font-size:12px;color:#44BEC7;font-style:italic;">Your day. Your music. Our sound.</p>
            </div>
            <div style="background:#f9f9f9;padding:32px;border-radius:0 0 12px 12px;">
              <h2 style="margin:0 0 12px;color:#1a1a1a;">How did we do, ${firstName}?</h2>
              <p style="color:#555;line-height:1.7;margin:0 0 20px;">
                It was an absolute honor being part of ${eventName}. We hope the music made your day everything you dreamed of.
              </p>
              <p style="color:#555;line-height:1.7;margin:0 0 24px;">
                We'd love to hear your feedback — it takes just a few minutes and means the world to us.
              </p>
              <a href="https://pescaderomusic.com/review"
                 style="display:inline-block;background:#D62828;color:white;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:700;font-size:14px;">
                Leave My Review →
              </a>
              <p style="margin:24px 0 0;font-size:12px;color:#999;">
                — Garrett, Pescadero Music<br>
                garrett@pescaderomusic.com · (210) 727-9328
              </p>
            </div>
          </div>
        `,
      })
    } catch (e) { console.error('Review email error:', e) }
  }

  // Send review SMS
  if (phone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
      await twilio.messages.create({
        body: `Hi ${firstName}! 🎵 It was such an honor being part of your day. We'd love your feedback — leave a quick review here: pescaderomusic.com/review  — Garrett, Pescadero Music`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone.replace(/\D/g, '').replace(/^(\d{10})$/, '+1$1'),
      })
    } catch (e) { console.error('Review SMS error:', e) }
  }

  return NextResponse.json({ ok: true })
}
