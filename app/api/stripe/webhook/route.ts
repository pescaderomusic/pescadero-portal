import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession
    const { contractId, clientId, type } = session.metadata!
    const admin = createAdminClient()

    if (type === 'deposit') {
      // Update contract + booking
      await admin.from('contracts').update({
        status: 'deposit_paid',
        deposit_paid_at: new Date().toISOString(),
        stripe_payment_intent_id: session.payment_intent as string,
      }).eq('id', contractId)

      await admin.from('bookings').update({
        step_deposit: 'paid',
        step_planning: 'pending',
      }).eq('client_id', clientId)

    } else if (type === 'final') {
      await admin.from('contracts').update({
        status: 'complete',
      }).eq('id', contractId)

      await admin.from('bookings').update({
        step_final_payment: 'paid',
        step_event: 'pending',
      }).eq('client_id', clientId)
    }
  }

  return NextResponse.json({ received: true })
}
