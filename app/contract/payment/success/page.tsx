import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function PaymentSuccessPage({ searchParams }: { searchParams: { type: string, contract: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const isDeposit = searchParams.type === 'deposit'
  const contractId = searchParams.contract
  const admin = createAdminClient()

  // Fallback: update steps in case webhook hasn't fired yet
  if (contractId && isDeposit) {
    await admin.from('contracts').update({ status: 'deposit_paid', deposit_paid_at: new Date().toISOString() }).eq('id', contractId)
    await admin.from('bookings').update({ step_deposit: 'paid', step_contract: 'signed', step_planning: 'pending' }).eq('client_id', user.id)
  } else if (contractId && !isDeposit) {
    await admin.from('contracts').update({ status: 'complete' }).eq('id', contractId)
    await admin.from('bookings').update({ step_final_payment: 'paid', step_event: 'pending' }).eq('client_id', user.id)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0F1F35 0%, #0A1828 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Poppins, sans-serif', padding: 24,
    }}>
      <div style={{
        maxWidth: 480, width: '100%',
        background: 'rgba(79,185,175,0.06)',
        border: '1px solid rgba(79,185,175,0.25)',
        borderRadius: 16, padding: '48px 36px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>{isDeposit ? '🎉' : '✅'}</div>
        <h1 style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 28, color: 'white', marginBottom: 12 }}>
          {isDeposit ? 'Deposit Received!' : 'Payment Complete!'}
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(232,224,213,0.6)', lineHeight: 1.7, marginBottom: 8 }}>
          {isDeposit
            ? 'Your deposit has been received and your date is officially locked in. Sit back and relax — next up is your planning form, which Garrett will send your way when the time is right.'
            : 'Your final payment has been received. Your booking is fully confirmed. See you on event day!'
          }
        </p>
        <p style={{ fontSize: 12, color: 'rgba(232,224,213,0.35)', lineHeight: 1.6, marginBottom: 32 }}>
          A receipt has been sent to your email from Stripe. Keep it for your records.
        </p>
        <Link href="/dashboard" style={{
          display: 'inline-block',
          background: '#D63031', color: 'white',
          textDecoration: 'none', borderRadius: 8,
          padding: '12px 32px', fontSize: 13, fontWeight: 700,
          boxShadow: '0 4px 20px rgba(214,48,49,0.4)',
        }}>
          Back to Dashboard →
        </Link>
      </div>
    </div>
  )
}
