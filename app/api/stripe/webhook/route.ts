// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import {
  sendDepositConfirmation,
  sendFinalPaymentConfirmation,
  sendGarrettContractSigned,
} from '@/lib/email'

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
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { contract_id, client_id, payment_type } = session.metadata ?? {}

    if (!contract_id || !client_id) {
      console.error('Missing metadata in session')
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Fetch contract + client info
    const { data: contract } = await admin
      .from('contracts')
      .select('*, inquiry_submissions(*)')
      .eq('id', contract_id)
      .single()

    const { data: profile } = await admin
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', client_id)
      .single()

    if (!contract || !profile) {
      console.error('Contract or profile not found')
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const firstName   = profile.first_name ?? 'there'
    const lastName    = profile.last_name  ?? ''
    const email       = profile.email
    const eventName   = contract.event_name  ?? 'your event'
    const eventDate   = contract.event_date  ?? ''
    const depositAmt  = contract.deposit_amount ?? 100
    const finalAmt    = contract.final_payment_amount ?? 0

    if (payment_type === 'deposit') {
      // Mark deposit paid
      await admin.from('contracts').update({
        deposit_paid: true,
        status: 'deposit_paid',
      }).eq('id', contract_id)

      // Advance booking step
      await admin.from('bookings').update({
        current_step: 4,
        step_3_status: 'complete',
        step_4_status: 'active',
      }).eq('client_id', client_id)

      // Send emails
      await sendDepositConfirmation(email, firstName, eventName, eventDate, depositAmt, finalAmt)
      await sendGarrettContractSigned({ firstName, lastName, email, eventName, eventDate, depositAmount: depositAmt })

    } else if (payment_type === 'final') {
      // Mark final payment paid
      await admin.from('contracts').update({
        final_payment_paid: true,
        status: 'fully_paid',
      }).eq('id', contract_id)

      // Advance booking step
      await admin.from('bookings').update({
        current_step: 6,
        step_5_status: 'complete',
        step_6_status: 'active',
      }).eq('client_id', client_id)

      // Send emails
      await sendFinalPaymentConfirmation(email, firstName, eventName, eventDate, finalAmt)
    }
  }

  return NextResponse.json({ received: true })
}
