import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ContractViewer from '@/components/ContractViewer'

export default async function ContractPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: contract } = await supabase
    .from('contracts')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!contract) {
    return (
      <div style={{
        maxWidth: 600, margin: '80px auto', textAlign: 'center', padding: '0 24px',
        fontFamily: 'Poppins, sans-serif',
      }}>
        <p style={{ fontSize: 40, marginBottom: 16 }}>📋</p>
        <h2 style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', color: 'white', marginBottom: 10 }}>
          No contract yet
        </h2>
        <p style={{ color: 'rgba(232,224,213,0.45)', fontSize: 13, lineHeight: 1.6 }}>
          Your service agreement will appear here once Garrett reviews your inquiry and confirms your booking. You'll get an email notification when it's ready.
        </p>
      </div>
    )
  }

  return <ContractViewer contract={contract} />
}
