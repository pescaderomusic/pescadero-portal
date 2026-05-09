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
    const { error: cErr, count: cCount } = await admin
      .from('contracts')
      .update({ deposit_paid: true, status: 'deposit_paid' }, { count: 'exact' })
      .eq('id', contract_id)
    console.log('[handlePayment] contracts update:', { cErr, cCount })
    if (cErr) throw new Error(`contracts update error: ${cErr.message}`)
    if (cCount === 0) throw new Error(`No contract matched id=${contract_id}`)

    const { error: bErr, count: bCount } = await admin
      .from('bookings')
      .update({ step_deposit: 'paid', step_planning: 'pending' }, { count: 'exact' })
      .eq('client_id', client_id)
    console.log('[handlePayment] bookings update:', { bErr, bCount })
    if (bErr) throw new Error(`bookings update error: ${bErr.message}`)
    if (bCount === 0) throw new Error(`No booking matched client_id=${client_id}`)

    sendDepositEmails(admin, contract_id, client_id).catch(e =>
      console.error('[handlePayment] email error:', e)
    )

  } else if (payment_type === 'final') {
    const { error: cErr, count: cCount } = await admin
      .from('contracts')
      .update({ final_payment_paid: true, status: 'fully_paid' }, { count: 'exact' })
      .eq('id', contract_id)
    if (cErr) throw new Error(`contracts final update error: ${cErr.message}`)
    if (cCount === 0) throw new Error(`No contract matched id=${contract_id}`)

    const { error: bErr, count: bCount } = await admin
      .from('bookings')
      .update({ step_final_payment: 'paid' }, { count: 'exact' })
      .eq('client_id', client_id)
    if (bErr) throw new Error(`bookings final update error: ${bErr.message}`)
    if (bCount === 0) throw new Error(`No booking matched client_id=${client_id}`)
  }

  console.log('[handlePayment] done')
}

async function sendDepositEmails(admin: any, contract_id: string, client_id: string) {
  const { data: profile } = await admin.from('profiles').select('first_name, last_name, email').eq('id', client_id).single()
  const { data: contract } = await admin.from('contracts').select('event_name, event_date, deposit_amount').eq('id', contract_id).single()
  if (!profile || !contract) { console.error('[emails] profile or contract not found'); return }
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY!)
  await resend.emails.send({ from: 'Pescadero Music <garrett@pescaderomusic.com>', to: profile.email, subject: `Booking confirmed — ${contract.event_name ?? 'your event'}`, html: `<p>Hi ${profile.first_name}, your $${contract.deposit_amount ?? 100} deposit is received and your date is locked in!</p><p><a href="https://pescaderomusic.com/dashboard">View dashboard →</a></p>` })
  await resend.emails.send({ from: 'Pescadero Music <garrett@pescaderomusic.com>', to: 'garrett@pescaderomusic.com', subject: `✅ Deposit — ${profile.first_name} ${profile.last_name} · ${contract.event_date ?? ''}`, html: `<p>${profile.first_name} ${profile.last_name} paid for <strong>${contract.event_name}</strong>.</p>` })
}
