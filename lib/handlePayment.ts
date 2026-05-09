// lib/handlePayment.ts
import { createClient } from '@supabase/supabase-js'

// Create admin client directly — don't rely on helper that may use anon key
function getAdmin() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars (URL or SERVICE_ROLE_KEY)')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function handlePayment(
  contract_id: string,
  client_id: string,
  payment_type: string
) {
  const admin = getAdmin()

  if (payment_type === 'deposit') {
    // -- Update contracts table --
    const { error: cErr } = await admin
      .from('contracts')
      .update({ deposit_paid: true, status: 'deposit_paid' })
      .eq('id', contract_id)
    if (cErr) throw new Error(`contracts update failed: ${cErr.message} (code: ${cErr.code})`)

    // -- Update bookings table --
    const { error: bErr } = await admin
      .from('bookings')
      .update({ step_deposit: 'paid', step_planning: 'pending' })
      .eq('client_id', client_id)
    if (bErr) throw new Error(`bookings update failed: ${bErr.message} (code: ${bErr.code})`)

    // -- Emails (fire-and-forget, never throw) --
    sendDepositEmails(admin, contract_id, client_id).catch(e =>
      console.error('[handlePayment] email error (non-fatal):', e)
    )

  } else if (payment_type === 'final') {
    const { error: cErr } = await admin
      .from('contracts')
      .update({ final_payment_paid: true, status: 'fully_paid' })
      .eq('id', contract_id)
    if (cErr) throw new Error(`contracts update (final) failed: ${cErr.message}`)

    const { error: bErr } = await admin
      .from('bookings')
      .update({ step_final_payment: 'paid' })
      .eq('client_id', client_id)
    if (bErr) throw new Error(`bookings update (final) failed: ${bErr.message}`)

    sendFinalEmails(admin, contract_id, client_id).catch(e =>
      console.error('[handlePayment] final email error (non-fatal):', e)
    )
  }
}

async function sendDepositEmails(admin: any, contract_id: string, client_id: string) {
  const { data: profile } = await admin
    .from('profiles').select('first_name, last_name, email').eq('id', client_id).single()
  const { data: contract } = await admin
    .from('contracts').select('event_name, event_date, deposit_amount').eq('id', contract_id).single()
  if (!profile || !contract) return

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY!)

  await resend.emails.send({
    from: 'Pescadero Music <garrett@pescaderomusic.com>',
    to: profile.email,
    subject: `Booking confirmed — ${contract.event_name ?? 'your event'}`,
    html: `<p>Hi ${profile.first_name},</p><p>Your $${contract.deposit_amount ?? 100} deposit has been received and your date is officially locked in!</p><p><a href="https://pescaderomusic.com/dashboard">View your dashboard →</a></p><p>— Garrett, Pescadero Music</p>`,
  })

  await resend.emails.send({
    from: 'Pescadero Music <garrett@pescaderomusic.com>',
    to: 'garrett@pescaderomusic.com',
    subject: `✅ Deposit paid — ${profile.first_name} ${profile.last_name} · ${contract.event_date ?? ''}`,
    html: `<p>${profile.first_name} ${profile.last_name} (${profile.email}) paid the deposit for <strong>${contract.event_name}</strong> on ${contract.event_date}.</p><p><a href="https://pescaderomusic.com/admin">View in admin →</a></p>`,
  })
}

async function sendFinalEmails(admin: any, contract_id: string, client_id: string) {
  const { data: profile } = await admin
    .from('profiles').select('first_name, email').eq('id', client_id).single()
  const { data: contract } = await admin
    .from('contracts').select('event_name').eq('id', contract_id).single()
  if (!profile || !contract) return

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY!)

  await resend.emails.send({
    from: 'Pescadero Music <garrett@pescaderomusic.com>',
    to: profile.email,
    subject: `Payment complete — ${contract.event_name ?? 'your event'}`,
    html: `<p>Hi ${profile.first_name}, your final payment has been received. Your booking is fully confirmed!</p><p><a href="https://pescaderomusic.com/dashboard">View your dashboard →</a></p>`,
  })
}
