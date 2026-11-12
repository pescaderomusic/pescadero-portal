import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { clientIdFromCode } from '@/lib/review-link'
import ReviewForm from '@/components/ReviewForm'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Leave a Review | Pescadero Music',
  robots: { index: false, follow: false },
}

function getAdmin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export default async function ReviewLinkPage({ params }: { params: { code: string } }) {
  const clientId = clientIdFromCode(params.code)
  if (!clientId) notFound()

  const admin = getAdmin()
  const [{ data: profile }, { data: existing }] = await Promise.all([
    admin.from('profiles').select('full_name').eq('id', clientId).maybeSingle(),
    admin.from('reviews').select('id').eq('client_id', clientId).limit(1),
  ])
  const firstName = (profile?.full_name || '').split(' ')[0] || ''

  return (
    <div className="min-h-[100dvh] bg-background text-on-surface font-body-md antialiased">
      <header className="bg-primary text-on-primary">
        <div className="max-w-xl mx-auto px-5 h-16 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-round.png" alt="" className="w-10 h-10" />
          <span className="font-label-lg text-label-lg uppercase tracking-widest">Pescadero Music</span>
        </div>
      </header>
      <main className="max-w-xl mx-auto px-5 pt-8 pb-16">
        <ReviewForm code={params.code} firstName={firstName} alreadySubmitted={!!existing?.length} />
      </main>
    </div>
  )
}
