import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error(`Missing env: url=${!!url} key=${!!key}`)
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function handlePayment(contract_id: string, client_id: string, payment_type: string) {
  console.log('[handlePayment] start', { contract_id, client_id, payment_type })
  const admin = getAdmin()

  if (payment_type === 'deposit') {
    const { error: cErr } = await admin
      .from('contracts')
      .update({ status: 'deposit_paid', deposit_paid_at: new Date().toISOString() })
      .eq('id', contract_id)
    if (cErr) throw new Error(`contracts update error: ${cErr.message}`)

    const { error: bErr } = await admin
      .from('bookings')
      .update({ step_deposit: 'paid', step_planning: 'pending' })
      .eq('client_id', client_id)
    if (bErr) throw new Error(`bookings update error: ${bErr.message}`)

    console.log('[handlePayment] deposit DB updates done')
    sendDepositEmails(admin, contract_id, client_id).catch(e =>
      console.error('[handlePayment] email error:', e)
    )

  } else if (payment_type === 'final') {
    const { error: cErr } = await admin
      .from('contracts')
      .update({ status: 'fully_paid' })
      .eq('id', contract_id)
    if (cErr) throw new Error(`contracts final update error: ${cErr.message}`)

    const { error: bErr } = await admin
      .from('bookings')
      .update({ step_final_payment: 'paid' })
      .eq('client_id', client_id)
    if (bErr) throw new Error(`bookings final update error: ${bErr.message}`)
  }

  console.log('[handlePayment] done')
}

async function sendDepositEmails(admin: any, contract_id: string, client_id: string) {
  const { data: profile } = await admin.from('profiles').select('first_name, last_name, email').eq('id', client_id).single()
  const { data: contract } = await admin.from('contracts').select('event_type, event_date, deposit_amount').eq('id', contract_id).single()
  if (!profile || !contract) { console.error('[emails] profile or contract not found'); return }
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const eventName = contract.event_type ?? 'your event'
  const eventDate = contract.event_date ?? ''
  await resend.emails.send({ from: 'Pescadero Music <garrett@pescaderomusic.com>', to: profile.email, subject: `Booking confirmed — ${eventName}`, html: `<p>Hi ${profile.first_name}, your $${contract.deposit_amount ?? 100} deposit is received and your date is locked in!</p><p><a href="https://pescaderomusic.com/dashboard">View dashboard →</a></p>` })
  await resend.emails.send({ from: 'Pescadero Music <garrett@pescaderomusic.com>', to: 'garrett@pescaderomusic.com', subject: `✅ Deposit — ${profile.first_name} ${profile.last_name} · ${eventDate}`, html: `<p>${profile.first_name} ${profile.last_name} paid the deposit for <strong>${eventName}</strong> on ${eventDate}.</p>` })
}
