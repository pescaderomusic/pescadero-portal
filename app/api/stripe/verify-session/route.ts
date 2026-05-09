export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { handlePayment } from '@/lib/handlePayment'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { sessionId } = await req.json()
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') return NextResponse.json({ error: 'Not paid' }, { status: 400 })
    const { contract_id, client_id, payment_type } = session.metadata ?? {}
    if (client_id !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    await handlePayment(contract_id!, client_id!, payment_type ?? 'deposit')
    return NextResponse.json({ ok: true, payment_type })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
