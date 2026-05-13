export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { handlePayment } from '@/lib/handlePayment'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook sig error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { contract_id, client_id, payment_type } = session.metadata ?? {}
    if (!contract_id || !client_id) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    try {
      await handlePayment(contract_id, client_id, payment_type ?? 'deposit')
    } catch (err: any) {
      console.error('handlePayment error:', err)
      // Still return 200 so Stripe doesn't retry indefinitely
    }
  }

  return NextResponse.json({ received: true })
}

