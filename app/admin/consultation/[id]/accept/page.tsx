// app/admin/consultation/[id]/accept/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'
function getAdmin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
}

export default async function AcceptPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== GARRETT_ID) redirect('/dashboard')

  const admin = getAdmin()
  const { data: consultReq } = await admin.from('consultation_requests').select('*').eq('id', params.id).single()

  if (consultReq) {
    await admin.from('consultation_requests').update({ status: 'accepted' }).eq('id', params.id)
    await admin.from('bookings').update({ step_consultation: 'complete', step_contract: 'pending' }).eq('client_id', consultReq.client_id)

    // Email client
    const { data: userData } = await admin.auth.admin.getUserById(consultReq.client_id)
    const { data: profile }  = await admin.from('profiles').select('full_name').eq('id', consultReq.client_id).single()
    const { data: inquiry }  = await admin.from('inquiry_submissions').select('phone').eq('client_id', consultReq.client_id).single()
    const email     = userData?.user?.email
    const firstName = profile?.full_name?.split(' ')[0] || 'there'
    const dateStr   = consultReq.requested_date ? new Date(consultReq.requested_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'your requested date'

    if (email) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY!)
        await resend.emails.send({ from: 'Pescadero Music <garrett@pescaderomusic.com>', to: email, subject: `✅ Consultation Call Confirmed — ${dateStr}`, html: `<p>Hi ${firstName},</p><p>Your consultation call is confirmed for <strong>${dateStr}${consultReq.requested_time ? ` at ${consultReq.requested_time}` : ''}</strong>. Garrett will be calling you!</p><p>— Garrett, Pescadero Music</p>` })
      } catch(e) { console.error(e) }
    }

    // SMS
    const phone = inquiry?.phone
    if (phone && process.env.TWILIO_ACCOUNT_SID) {
      try {
        const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
        await twilio.messages.create({ body: `Hi ${firstName}! Your Pescadero Music consultation is confirmed for ${dateStr}${consultReq.requested_time ? ` at ${consultReq.requested_time}` : ''}. Garrett will call you! 🎵`, from: process.env.TWILIO_PHONE_NUMBER, to: phone.replace(/\D/g, '').replace(/^(\d{10})$/, '+1$1') })
      } catch(e) { console.error(e) }
    }
  }

  redirect('/admin/schedule')
}
