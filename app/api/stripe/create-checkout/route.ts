import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { contractId, type } = await req.json() // type: 'deposit' | 'final'
  const admin = createAdminClient()

  const { data: contract } = await admin
    .from('contracts')
    .select('*')
    .eq('id', contractId)
    .eq('client_id', user.id)
    .single()

  if (!contract) return NextResponse.json({ error: 'Contract not found' }, { status: 404 })

  const isDeposit = type === 'deposit'
  const amount = isDeposit ? contract.deposit_amount : contract.final_payment_amount
  const label = isDeposit ? 'Deposit' : 'Final Payment'

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Pescadero Music — ${label}`,
            description: `${contract.event_type || 'Event'} on ${contract.event_date ? new Date(contract.event_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'} at ${contract.venue_name || 'TBD'}`,
            images: [],
          },
          unit_amount: Math.round(amount * 100), // cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.nextUrl.origin}/contract/payment/success?type=${type}&contract=${contractId}`,
    cancel_url: `${req.nextUrl.origin}/contract/payment`,
    metadata: {
      contractId,
      clientId: user.id,
      type,
    },
    customer_email: contract.client_email || user.email || undefined,
  })

  return NextResponse.json({ url: session.url })
}
