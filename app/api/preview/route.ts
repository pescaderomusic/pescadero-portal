import { NextResponse } from 'next/server'
import { codeMatches, previewToken, PREVIEW_COOKIE } from '@/lib/preview-gate'

export async function POST(request: Request) {
  const { code } = await request.json().catch(() => ({ code: '' }))
  if (typeof code !== 'string' || !(await codeMatches(code))) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(PREVIEW_COOKIE, await previewToken(), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
  })
  return res
}
