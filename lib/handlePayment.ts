import { createAdminClient } from '@/lib/supabase/server'

export async function handlePayment(contract_id: string, client_id: string, payment_type: string) {
  const admin = createAdminClient()

  if (payment_type === 'deposit') {
    await admin.from('contracts').update({ deposit_paid: true, status: 'deposit_paid' }).eq('id', contract_id)
    await admin.from('bookings').update({ step_deposit: 'paid', step_planning: 'pending' }).eq('client_id', client_id)

    try {
      const { data: profile } = await admin.from('profiles').select('first_name, last_name, email').eq('id', client_id).single()
      const { data: contract } = await admin.from('contracts').select('*').eq('id', contract_id).single()
      if (profile && contract) {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY!)
        await resend.emails.send({ from: 'Pescadero Music <garrett@pescaderomusic.com>', to: profile.email, subject: `Booking confirmed — ${contract.event_name ?? 'your event'}`, html: `<p>Hi ${profile.first_name}, your $${contract.deposit_amount ?? 100} deposit is received and your date is locked in!</p><p><a href="https://pescaderomusic.com/dashboard">View dashboard →</a></p>` })
        await resend.emails.send({ from: 'Pescadero Music <garrett@pescaderomusic.com>', to: 'garrett@pescaderomusic.com', subject: `✅ Deposit paid — ${profile.first_name} ${profile.last_name} · ${contract.event_date ?? ''}`, html: `<p>${profile.first_name} ${profile.last_name} (${profile.email}) paid their deposit for <strong>${contract.event_name}</strong>.</p><p><a href="https://pescaderomusic.com/admin">View admin →</a></p>` })
      }
    } catch (e) { console.error('Email error (non-fatal):', e) }

  } else if (payment_type === 'final') {
    await admin.from('contracts').update({ final_payment_paid: true, status: 'fully_paid' }).eq('id', contract_id)
    await admin.from('bookings').update({ step_final_payment: 'paid' }).eq('client_id', client_id)
  }
}
