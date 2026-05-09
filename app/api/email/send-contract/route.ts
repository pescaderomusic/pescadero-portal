export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const admin = createAdminClient()
    const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', user?.id).single()
    if (!profile?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const { contractId } = await req.json()
    const { data: contract } = await admin
      .from('contracts')
      .select('*, profiles!contracts_client_id_fkey(first_name, last_name, email)')
      .eq('id', contractId).single()
    if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const client = contract.profiles
    const resend = new Resend(process.env.RESEND_API_KEY!)
    await resend.emails.send({
      from: 'Pescadero Music <garrett@pescaderomusic.com>',
      to: client.email,
      subject: `Your Pescadero Music contract is ready — ${contract.event_name ?? 'your event'}`,
      html: `<p>Hi ${client.first_name}, your contract is ready. <a href="https://pescaderomusic.com/dashboard">View it here →</a></p>`,
    })
    return NextResponse.json({ sent: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
