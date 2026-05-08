import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import ContractEditor from '@/components/ContractEditor'

export default async function AdminContractPage({ params }: { params: { inquiryId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/auth/login')

  const admin = createAdminClient()

  const { data: inquiry } = await admin
    .from('inquiry_submissions')
    .select('*')
    .eq('id', params.inquiryId)
    .single()

  if (!inquiry) redirect('/admin')

  const { data: existingContract } = await admin
    .from('contracts')
    .select('*')
    .eq('inquiry_id', params.inquiryId)
    .single()

  return <ContractEditor inquiry={inquiry} existingContract={existingContract} />
}
