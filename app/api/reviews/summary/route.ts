import { NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

// Public: overall star rating for the homepage. Returns only the count and
// average, never names or text.
export const revalidate = 600

export async function GET() {
  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data, error } = await admin.from('reviews').select('rating').gte('rating', 1)
  if (error || !data) return NextResponse.json({ count: 0, average: null })
  const count = data.length
  const average = count ? Math.round((data.reduce((s, r) => s + (r.rating || 0), 0) / count) * 10) / 10 : null
  return NextResponse.json({ count, average })
}
