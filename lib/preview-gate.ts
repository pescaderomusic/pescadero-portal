// "Under construction" smoke screen. While PREVIEW_GATE_ON is true, visitors who
// aren't signed in see /coming-soon until they enter the entry code. Signed-in
// clients, sign-in pages and API routes (Stripe, emails) are never blocked.
// To take the screen down: set PREVIEW_GATE_ON to false.
export const PREVIEW_GATE_ON = true

export const PREVIEW_COOKIE = 'pm_preview'

// The repo is public, so only a salted hash of the entry code lives here.
// To change the code: put sha256('pescadero-preview:' + newCode) here, or set
// PREVIEW_CODE_SHA256 in Vercel.
const CODE_SHA256 =
  process.env.PREVIEW_CODE_SHA256 || '9a2aa74a5bbdd29c41587283ab3a66120e797593e6bfdd56f712f8d36aac2d3b'

async function sha256Hex(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function codeMatches(code: string) {
  return (await sha256Hex('pescadero-preview:' + code.trim().toLowerCase())) === CODE_SHA256
}

// The cookie value is derived from a server-only secret, so it can't be forged
// from what's in this public repo.
export async function previewToken() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.STRIPE_SECRET_KEY || ''
  return sha256Hex(`pm-preview-ok:${CODE_SHA256}:${secret}`)
}

// Paths that stay open while the gate is up.
export function isOpenPath(pathname: string) {
  return (
    pathname === '/coming-soon' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/_next/') ||
    /\.[a-z0-9]+$/i.test(pathname) // static files: fonts, images, rive, etc.
  )
}
