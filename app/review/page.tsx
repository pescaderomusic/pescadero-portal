import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { reviewPath } from '@/lib/review-link'

export const dynamic = 'force-dynamic'

// Old review address (in past emails and the client dashboard). Signed-in
// clients go to their personal review link; others sign in first.
export default async function ReviewPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/review')
  redirect(reviewPath(user.id))
}
