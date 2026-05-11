import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error(`Missing env: url=${!!url} key=${!!key}`)
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function handlePayment(contract_id: string, client_id: string, payment_type: string) {
  console.log('[handlePayment] start', { contract_id, client_id, payment_type })
  const admin = getAdmin()

  if (payment_type === 'deposit') {
    const { error: cErr } = await admin
      .from('contracts')
      .update({ status: 'deposit_paid', deposit_paid_at: new Date().toISOString() })
      .eq('id', contract_id)
    if (cErr) throw new Error(`contracts update error: ${cErr.message}`)

    const { error: bErr } = await admin
      .from('bookings')
      .update({ step_deposit: 'paid', step_planning: 'pending' })
      .eq('client_id', client_id)
    if (bErr) throw new Error(`bookings update error: ${bErr.message}`)

    console.log('[handlePayment] deposit DB updates done')
    sendDepositEmails(admin, contract_id, client_id).catch(e =>
      console.error('[handlePayment] email error:', e)
    )

  } else if (payment_type === 'final') {
    const { error: cErr } = await admin
      .from('contracts')
      .update({ status: 'fully_paid' })
      .eq('id', contract_id)
    if (cErr) throw new Error(`contracts final update error: ${cErr.message}`)

    const { error: bErr } = await admin
      .from('bookings')
      .update({ step_final_payment: 'paid' })
      .eq('client_id', client_id)
    if (bErr) throw new Error(`bookings final update error: ${bErr.message}`)

    sendFinalEmails(admin, contract_id, client_id).catch(e =>
      console.error('[handlePayment] final email error:', e)
    )
  }

  console.log('[handlePayment] done')
}

// ── Shared receipt HTML ────────────────────────────────────────────────────
function buildReceiptHtml({
  fullName,
  email,
  eventType,
  eventDate,
  venueName,
  depositAmount,
  paidAt,
  receiptNumber,
  finalAmount,
  finalDue,
  isGarrett = false,
}: {
  fullName: string
  email: string
  eventType: string
  eventDate: string
  venueName: string
  depositAmount: number
  paidAt: string
  receiptNumber: string
  finalAmount?: number
  finalDue?: string
  isGarrett?: boolean
}) {
  const NAVY  = '#0D1B2A'
  const BLUE  = '#44BEC7'
  const RED   = '#D62828'

  const garrettNote = isGarrett
    ? `<tr><td style="padding:12px 0;border-bottom:1px solid #eee;"><strong>Client Email:</strong> ${email}</td></tr>`
    : ''

  const remainingRow = (finalAmount && finalAmount > 0) ? `
    <tr>
      <td style="padding:16px 24px;background:#f9f9f9;border-radius:8px;margin-top:16px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:13px;color:#555;">Remaining Balance</td>
            <td align="right" style="font-size:15px;color:#333;font-weight:600;">$${finalAmount}</td>
          </tr>
          <tr>
            <td colspan="2" style="font-size:11px;color:#999;padding-top:4px;">
              Due ${finalDue || '7 days before your event'}
            </td>
          </tr>
        </table>
      </td>
    </tr>` : ''

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:${NAVY};padding:28px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0 0 2px;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">
                    Pescadero Music
                  </p>
                  <p style="margin:0;font-size:12px;color:${BLUE};font-style:italic;">
                    Your day. Your music. Our sound.
                  </p>
                </td>
                <td align="right">
                  <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;">
                    Payment Receipt
                  </p>
                  <p style="margin:2px 0 0;font-size:11px;color:rgba(255,255,255,0.3);">
                    ${receiptNumber}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Blue accent bar -->
        <tr><td style="height:4px;background:linear-gradient(90deg,${BLUE},${RED});"></td></tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 36px;">

            <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1a1a1a;">
              ✅ Deposit Confirmed
            </p>
            <p style="margin:0 0 28px;font-size:14px;color:#666;">
              Hi ${fullName.split(' ')[0]}, your $${depositAmount} deposit has been received and your date is officially locked in!
            </p>

            <!-- Details table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e8e8;border-radius:8px;overflow:hidden;">
              <tr style="background:#f9f9f9;">
                <td style="padding:10px 16px;font-size:11px;color:#999;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
                  Booking Details
                </td>
              </tr>
              <tr>
                <td style="padding:0 16px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${garrettNote}
                    <tr>
                      <td style="padding:12px 0;border-bottom:1px solid #eee;font-size:13px;color:#555;">Client</td>
                      <td align="right" style="padding:12px 0;border-bottom:1px solid #eee;font-size:13px;color:#333;font-weight:600;">${fullName}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 0;border-bottom:1px solid #eee;font-size:13px;color:#555;">Event Type</td>
                      <td align="right" style="padding:12px 0;border-bottom:1px solid #eee;font-size:13px;color:#333;">${eventType}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 0;border-bottom:1px solid #eee;font-size:13px;color:#555;">Event Date</td>
                      <td align="right" style="padding:12px 0;border-bottom:1px solid #eee;font-size:13px;color:#333;">${eventDate}</td>
                    </tr>
                    ${venueName ? `<tr>
                      <td style="padding:12px 0;border-bottom:1px solid #eee;font-size:13px;color:#555;">Venue</td>
                      <td align="right" style="padding:12px 0;border-bottom:1px solid #eee;font-size:13px;color:#333;">${venueName}</td>
                    </tr>` : ''}
                    <tr>
                      <td style="padding:12px 0;border-bottom:1px solid #eee;font-size:13px;color:#555;">Payment Date</td>
                      <td align="right" style="padding:12px 0;border-bottom:1px solid #eee;font-size:13px;color:#333;">${paidAt}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 0;font-size:13px;color:#555;">Processor</td>
                      <td align="right" style="padding:12px 0;font-size:13px;color:#333;">Stripe (Secure)</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Amount -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
              <tr>
                <td style="padding:16px 20px;background:${NAVY};border-radius:8px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:13px;color:rgba(255,255,255,0.6);">Deposit Paid (Non-Refundable)</td>
                      <td align="right" style="font-size:22px;font-weight:700;color:${BLUE};">$${depositAmount}.00</td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${remainingRow}
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
              <tr>
                <td align="center">
                  <a href="https://pescaderomusic.com/receipt"
                     style="display:inline-block;background:${RED};color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;padding:13px 32px;border-radius:8px;">
                    View Full Receipt Online →
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 36px;background:#f9f9f9;border-top:1px solid #eee;">
            <p style="margin:0;font-size:11px;color:#aaa;text-align:center;">
              Pescadero Music · garrett@pescaderomusic.com · (210) 727-9328<br>
              <em>This is an automated receipt. Keep it for your records.</em>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Deposit emails ─────────────────────────────────────────────────────────
async function sendDepositEmails(admin: any, contract_id: string, client_id: string) {
  const { data: userData } = await admin.auth.admin.getUserById(client_id)
  const { data: profile }  = await admin.from('profiles').select('full_name').eq('id', client_id).single()
  const { data: contract } = await admin.from('contracts')
    .select('event_type, event_date, deposit_amount, deposit_paid_at, venue_name, final_payment_amount, final_payment_due, id')
    .eq('id', contract_id).single()

  const email      = userData?.user?.email
  const fullName   = profile?.full_name ?? 'there'
  if (!email || !contract) { console.error('[emails] missing email or contract'); return }

  const { Resend } = await import('resend')
  const resend     = new Resend(process.env.RESEND_API_KEY!)
  const eventDate  = contract.event_date
    ? new Date(contract.event_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : 'TBD'
  const paidAt = contract.deposit_paid_at
    ? new Date(contract.deposit_paid_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const receiptNum = `RC-${contract_id.slice(0, 8).toUpperCase()}`
  const finalDue = contract.final_payment_due
    ? new Date(contract.final_payment_due + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : undefined

  const sharedArgs = {
    fullName,
    email,
    eventType:     contract.event_type ?? 'Live Event',
    eventDate,
    venueName:     contract.venue_name ?? '',
    depositAmount: contract.deposit_amount ?? 100,
    paidAt,
    receiptNumber: receiptNum,
    finalAmount:   contract.final_payment_amount,
    finalDue,
  }

  // Client receipt
  await resend.emails.send({
    from:    'Pescadero Music <garrett@pescaderomusic.com>',
    to:      email,
    subject: `✅ Deposit Receipt — ${contract.event_type ?? 'Your Event'} · ${receiptNum}`,
    html:    buildReceiptHtml({ ...sharedArgs }),
  })

  // Garrett receipt
  await resend.emails.send({
    from:    'Pescadero Music <garrett@pescaderomusic.com>',
    to:      'garrett@pescaderomusic.com',
    subject: `💵 Deposit Paid — ${fullName} · ${eventDate}`,
    html:    buildReceiptHtml({ ...sharedArgs, isGarrett: true }),
  })

  console.log('[handlePayment] receipt emails sent to', email, 'and garrett')
}

// ── Final payment emails ───────────────────────────────────────────────────
async function sendFinalEmails(admin: any, contract_id: string, client_id: string) {
  const { data: userData } = await admin.auth.admin.getUserById(client_id)
  const { data: profile }  = await admin.from('profiles').select('full_name').eq('id', client_id).single()
  const { data: contract } = await admin.from('contracts')
    .select('event_type, event_date, final_payment_amount').eq('id', contract_id).single()

  const email    = userData?.user?.email
  const fullName = profile?.full_name ?? 'there'
  if (!email || !contract) return

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const eventDate = contract.event_date
    ? new Date(contract.event_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'your event'

  await resend.emails.send({
    from:    'Pescadero Music <garrett@pescaderomusic.com>',
    to:      email,
    subject: `✅ Final Payment Confirmed — ${contract.event_type ?? 'Your Event'}`,
    html:    `<p>Hi ${fullName.split(' ')[0]}, your final payment of $${contract.final_payment_amount} has been received. Your booking for ${eventDate} is <strong>fully confirmed</strong>. See you on event day!</p><p>— Garrett, Pescadero Music</p>`,
  })

  await resend.emails.send({
    from:    'Pescadero Music <garrett@pescaderomusic.com>',
    to:      'garrett@pescaderomusic.com',
    subject: `✅ Final Payment — ${fullName} · ${eventDate}`,
    html:    `<p>${fullName} (${email}) completed final payment of $${contract.final_payment_amount} for ${contract.event_type} on ${eventDate}.</p>`,
  })
}
