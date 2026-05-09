export const dynamic = 'force-dynamic'

// app/api/email/send-contract/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendContractReady } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('is_admin')
      .eq('id', user?.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { contractId } = await req.json()

    const { data: contract } = await admin
      .from('contracts')
      .select('*, profiles!contracts_client_id_fkey(first_name, last_name, email)')
      .eq('id', contractId)
      .single()

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    const client = contract.profiles
    await sendContractReady(
      client.email,
      client.first_name,
      contract.event_name ?? 'your event',
      contract.event_date ?? '',
      contract.deposit_amount ?? 100,
    )

    return NextResponse.json({ sent: true })
  } catch (err: any) {
    console.error('send-contract email error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
