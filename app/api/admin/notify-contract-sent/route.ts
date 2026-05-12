// app/api/admin/notify-contract-sent/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== GARRETT_ID) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { clientName, email } = await req.json()
  const firstName = clientName?.split(' ')[0] || 'there'

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY!)
    await resend.emails.send({
      from: 'Pescadero Music <garrett@pescaderomusic.com>',
      to: email,
      subject: '📄 Your Service Agreement is Ready to Sign',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
          <div style="background:#0D1B2A;padding:24px 32px;border-radius:12px 12px 0 0;">
            <p style="margin:0;font-size:18px;font-weight:700;color:white;">Pescadero Music</p>
            <p style="margin:4px 0 0;font-size:12px;color:#44BEC7;font-style:italic;">Your day. Your music. Our sound.</p>
          </div>
          <div style="background:#f9f9f9;padding:32px;border-radius:0 0 12px 12px;">
            <h2 style="margin:0 0 12px;color:#1a1a1a;">Hi ${firstName} — your contract is ready!</h2>
            <p style="color:#555;line-height:1.7;margin:0 0 20px;">
              Garrett has prepared your Pescadero Music Service Agreement. Please take a moment to review the details and sign to move forward with your booking.
            </p>
            <a href="https://pescaderomusic.com/contract"
               style="display:inline-block;background:#D62828;color:white;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:700;font-size:14px;margin-bottom:20px;">
              Review & Sign Your Contract →
            </a>
            <p style="color:#777;font-size:13px;line-height:1.6;margin:0;">
              Questions before signing? Just reply to this email or reach out directly at <a href="mailto:garrett@pescaderomusic.com" style="color:#44BEC7;">garrett@pescaderomusic.com</a> or (210) 727-9328.
            </p>
            <p style="margin:24px 0 0;font-size:12px;color:#999;">— Garrett, Pescadero Music</p>
          </div>
        </div>
      `,
    })
  } catch (e) { console.error('Contract notification email error:', e) }

  return NextResponse.json({ ok: true })
}
