// Personal review links: pescaderomusic.com/r/<code>. The code is the client's
// id plus a short signature made with a server-only secret, so a client can
// leave a review without signing in, and nobody can guess another client's link.
// Server-only (uses SUPABASE_SERVICE_ROLE_KEY).
import { createHmac, timingSafeEqual } from 'crypto'

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://pescaderomusic.com').replace(/\/$/, '')
const SIG_LEN = 12

function secret() {
  const s = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!s) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  return s
}

function sign(clientId: string) {
  return createHmac('sha256', secret()).update(`review:${clientId}`).digest('base64url').slice(0, SIG_LEN)
}

// uuid (36 chars) <-> 22-char base64url, to keep the texted link short
function packId(uuid: string) {
  return Buffer.from(uuid.replace(/-/g, ''), 'hex').toString('base64url')
}
function unpackId(packed: string) {
  const hex = Buffer.from(packed, 'base64url').toString('hex')
  if (hex.length !== 32) return null
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function reviewCode(clientId: string) {
  return packId(clientId) + sign(clientId)
}

export function reviewPath(clientId: string) {
  return `/r/${reviewCode(clientId)}`
}

export function reviewUrl(clientId: string) {
  return `${SITE}${reviewPath(clientId)}`
}

/** Returns the client id for a valid code, or null. */
export function clientIdFromCode(code: string): string | null {
  if (typeof code !== 'string' || code.length !== 22 + SIG_LEN) return null
  const clientId = unpackId(code.slice(0, 22))
  if (!clientId) return null
  const given = Buffer.from(code.slice(22))
  const expected = Buffer.from(sign(clientId))
  return given.length === expected.length && timingSafeEqual(given, expected) ? clientId : null
}

/** The text Garrett sends (same wording as the automatic review text). */
export function reviewTextMessage(firstName: string, clientId: string) {
  const name = firstName && firstName !== 'there' ? ` ${firstName}` : ''
  return `Hi${name}! 🎵 It was such an honor being part of your day. We'd love your feedback — leave a quick review here: ${reviewUrl(clientId)} — Garrett, Pescadero Music`
}
