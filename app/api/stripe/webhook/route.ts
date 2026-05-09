export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { handlePayment } from '@/lib/handlePayment'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })
export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  let event: Stripe.Event
  try { event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!) }
  catch (err: any) { return NextResponse.json({ error: 'Invalid signature' }, { status: 400 }) }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { contract_id, client_id, payment_type } = session.metadata ?? {}
    if (contract_id && client_id) {
      try { await handlePayment(contract_id, client_id, payment_type ?? 'deposit') }
      catch (e) { console.error('handlePayment error:', e) }
    }
  }
  return NextResponse.json({ received: true })
}
