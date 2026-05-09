export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { handlePayment } from '@/lib/handlePayment'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { sessionId } = await req.json()
    if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })

    // Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: `Payment not complete (status: ${session.payment_status})` }, { status: 400 })
    }

    const { contract_id, client_id, payment_type } = session.metadata ?? {}

    if (!contract_id || !client_id) {
      return NextResponse.json({ error: `Missing metadata: contract_id=${contract_id}, client_id=${client_id}` }, { status: 400 })
    }

    if (client_id !== user.id) {
      return NextResponse.json({ error: `User mismatch: session client=${client_id}, auth user=${user.id}` }, { status: 403 })
    }

    // Update DB + send emails
    await handlePayment(contract_id, client_id, payment_type ?? 'deposit')

    return NextResponse.json({ ok: true, payment_type })
  } catch (err: any) {
    console.error('[verify-session] error:', err)
    // Return full error detail so success page can display it for debugging
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 })
  }
}
