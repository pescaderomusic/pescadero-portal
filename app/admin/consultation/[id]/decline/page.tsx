// app/admin/consultation/[id]/decline/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'
function getAdmin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
}

export default async function DeclinePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== GARRETT_ID) redirect('/dashboard')

  const admin = getAdmin()
  const { data: consultReq } = await admin.from('consultation_requests').select('*').eq('id', params.id).single()

  if (consultReq) {
    await admin.from('consultation_requests').update({ status: 'declined' }).eq('id', params.id)

    const { data: userData } = await admin.auth.admin.getUserById(consultReq.client_id)
    const { data: profile }  = await admin.from('profiles').select('full_name').eq('id', consultReq.client_id).single()
    const email     = userData?.user?.email
    const firstName = profile?.full_name?.split(' ')[0] || 'there'

    if (email) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY!)
        await resend.emails.send({ from: 'Pescadero Music <garrett@pescaderomusic.com>', to: email, subject: 'Consultation Request — Please Choose Another Time', html: `<p>Hi ${firstName},</p><p>That time slot isn't available. Please <a href="https://pescaderomusic.com/consultation">request a new time here</a> or reply to this email and Garrett will work something out directly.</p><p>— Garrett, Pescadero Music</p>` })
      } catch(e) { console.error(e) }
    }
  }

  redirect('/admin/schedule')
}
