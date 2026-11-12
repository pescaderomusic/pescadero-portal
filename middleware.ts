import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { PREVIEW_GATE_ON, PREVIEW_COOKIE, isOpenPath, previewToken } from '@/lib/preview-gate'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Under-construction screen for the public (lib/preview-gate.ts).
  if (PREVIEW_GATE_ON && !user && !isOpenPath(pathname)) {
    const cookie = request.cookies.get(PREVIEW_COOKIE)?.value
    if (cookie !== (await previewToken())) {
      const res = NextResponse.rewrite(new URL('/coming-soon', request.url))
      res.headers.set('X-Robots-Tag', 'noindex')
      res.headers.set('Cache-Control', 'no-store')
      return res
    }
  }

  const protectedRoutes = ['/dashboard', '/planning', '/contract']
  if (protectedRoutes.some(r => pathname.startsWith(r)) && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (pathname.startsWith('/admin') && (!user || user.email !== process.env.ADMIN_EMAIL)) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}