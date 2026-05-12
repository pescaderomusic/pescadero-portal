// ── app/api/notify/consultation-request/route.ts ─────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

function getAdmin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function POST(req: NextRequest) {
  const { clientId, date, time } = await req.json()
  const admin = getAdmin()

  const { data: userData } = await admin.auth.admin.getUserById(clientId)
  const { data: profile }  = await admin.from('profiles').select('full_name').eq('id', clientId).single()
  const { data: inquiry }  = await admin.from('inquiry_submissions').select('phone, event_name, couple_names').eq('client_id', clientId).single()

  const clientName = profile?.full_name || userData?.user?.email || 'A client'
  const eventName  = inquiry?.couple_names || inquiry?.event_name || 'their event'
  const dateStr    = date ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'TBD'

  // Email Garrett
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY!)
    await resend.emails.send({
      from: 'Pescadero Music <garrett@pescaderomusic.com>',
      to: 'garrett@pescaderomusic.com',
      subject: `📞 Consultation Request — ${clientName}`,
      html: `<p><strong>${clientName}</strong> has requested a consultation call for <strong>${eventName}</strong>.</p><p>Requested time: <strong>${dateStr}${time ? ` at ${time}` : ''}</strong></p><p><a href="https://pescaderomusic.com/admin/schedule">View & accept in your admin panel →</a></p>`,
    })
  } catch (e) {
    console.error('Garrett email error:', e)
  }

  // SMS Garrett
  const garrettPhone = process.env.GARRETT_PHONE_NUMBER
  if (garrettPhone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
      await twilio.messages.create({
        body: `📞 New consultation request from ${clientName} for ${eventName}. Requested: ${dateStr}${time ? ` at ${time}` : ''}. Accept at pescaderomusic.com/admin/schedule`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: garrettPhone,
      })
    } catch (e) {
      console.error('SMS error:', e)
    }
  }

  return NextResponse.json({ ok: true })
}
