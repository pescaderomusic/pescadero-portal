export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'

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

export async function handlePayment(contract_id: string, client_id: string, payment_type: string) {
  const admin = createAdminClient()

  if (payment_type === 'deposit') {
    // Update contract
    await admin.from('contracts')
      .update({ deposit_paid: true, status: 'deposit_paid' })
      .eq('id', contract_id)

    // Update booking — use actual column names from bookings table
    await admin.from('bookings')
      .update({ step_deposit: 'paid', step_planning: 'pending' })
      .eq('client_id', client_id)

    // Send emails (fire and forget — don't let email failure break payment confirmation)
    try {
      const { data: profile } = await admin
        .from('profiles').select('first_name, last_name, email').eq('id', client_id).single()
      const { data: contract } = await admin
        .from('contracts').select('*').eq('id', contract_id).single()

      if (profile && contract) {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY!)
        const eventName = contract.event_name ?? 'your event'
        const eventDate = contract.event_date ?? ''
        const depositAmt = contract.deposit_amount ?? 100

        // Email to client
        await resend.emails.send({
          from: 'Pescadero Music <garrett@pescaderomusic.com>',
          to: profile.email,
          subject: `Booking confirmed — ${eventName}`,
          html: `<p>Hi ${profile.first_name},</p><p>Your $${depositAmt} deposit has been received and your date is locked in! We'll be in touch to schedule your playlist consultation.</p><p><a href="https://pescaderomusic.com/dashboard">View your dashboard →</a></p><p>— Garrett, Pescadero Music</p>`,
        })

        // Alert to Garrett
        await resend.emails.send({
          from: 'Pescadero Music <garrett@pescaderomusic.com>',
          to: 'garrett@pescaderomusic.com',
          subject: `✅ Deposit paid — ${profile.first_name} ${profile.last_name} · ${eventDate}`,
          html: `<p>${profile.first_name} ${profile.last_name} (${profile.email}) just paid their $${depositAmt} deposit for <strong>${eventName}</strong> on ${eventDate}.</p><p><a href="https://pescaderomusic.com/admin">View in admin →</a></p>`,
        })
      }
    } catch (emailErr) {
      console.error('Email send error (non-fatal):', emailErr)
    }

  } else if (payment_type === 'final') {
    await admin.from('contracts')
      .update({ final_payment_paid: true, status: 'fully_paid' })
      .eq('id', contract_id)

    await admin.from('bookings')
      .update({ step_final_payment: 'paid' })
      .eq('client_id', client_id)

    try {
      const { data: profile } = await admin
        .from('profiles').select('first_name, email').eq('id', client_id).single()
      const { data: contract } = await admin
        .from('contracts').select('*').eq('id', contract_id).single()

      if (profile && contract) {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY!)
        await resend.emails.send({
          from: 'Pescadero Music <garrett@pescaderomusic.com>',
          to: profile.email,
          subject: `Payment complete — ${contract.event_name ?? 'your event'}`,
          html: `<p>Hi ${profile.first_name}, your final payment has been received. Your booking is fully confirmed!</p><p><a href="https://pescaderomusic.com/dashboard">View your dashboard →</a></p>`,
        })
      }
    } catch (emailErr) {
      console.error('Email send error (non-fatal):', emailErr)
    }
  }
}
