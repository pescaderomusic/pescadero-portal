// app/api/stripe/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { contractId, type } = body // type: 'deposit' | 'final'

    if (!contractId || !type) {
      return NextResponse.json({ error: 'Missing contractId or type' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: contract, error: contractError } = await admin
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .eq('client_id', user.id)
      .single()

    if (contractError || !contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    const isDeposit = type === 'deposit'
    const amount = isDeposit
      ? (contract.deposit_amount ?? 100)
      : (contract.final_payment_amount ?? 0)

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 })
    }

    const label = isDeposit ? 'Deposit (Non-Refundable)' : 'Final Payment'
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://pescaderomusic.com'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Pescadero Music — ${label}`,
              description: contract.event_name
                ? `Event: ${contract.event_name} · ${contract.event_date ?? ''}`
                : 'Live Sound Service Agreement',
            },
            unit_amount: Math.round(amount * 100), // cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        contract_id: contractId,
        client_id: user.id,
        payment_type: type,
      },
      customer_email: user.email,
      success_url: `${origin}/contract/payment/success?session_id={CHECKOUT_SESSION_ID}&type=${type}`,
      cancel_url: `${origin}/contract/payment?cancelled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json(
      { error: err.message ?? 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
