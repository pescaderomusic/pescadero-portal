// lib/email.ts
// Pescadero Music — Resend email system
// All transactional emails sent from garrett@pescaderomusic.com

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

const FROM    = 'Pescadero Music <garrett@pescaderomusic.com>'
const GARRETT = 'garrett@pescaderomusic.com'

// ── Brand colors ─────────────────────────────────────────────
const NAVY  = '#0D1B2A'
const RED   = '#D62828'
const BLUE  = '#44BEC7'
const CREAM = '#F5EFE0'

// ── Base email shell ─────────────────────────────────────────
function shell(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pescadero Music</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:${NAVY};border-radius:12px 12px 0 0;padding:28px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">Pescadero Music</span><br>
                  <span style="font-size:11px;color:${BLUE};letter-spacing:1.5px;text-transform:uppercase;">Professional Sound Services</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Red accent line -->
        <tr><td style="background:${RED};height:3px;"></td></tr>
        <!-- Blue accent line -->
        <tr><td style="background:${BLUE};height:2px;"></td></tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px 36px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:${NAVY};border-radius:0 0 12px 12px;padding:20px 36px;text-align:center;">
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.5);line-height:1.8;">
              garrett@pescaderomusic.com &nbsp;·&nbsp; (210) 727-9328 &nbsp;·&nbsp; inquiries.pescaderomusic.com
            </p>
            <p style="margin:6px 0 0;font-size:10px;color:rgba(255,255,255,0.3);">
              Pescadero Music · Provo, Utah
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Reusable blocks ──────────────────────────────────────────
function h1(text: string) {
  return `<h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:${NAVY};line-height:1.2;">${text}</h1>`
}
function h2(text: string) {
  return `<h2 style="margin:0 0 6px;font-size:14px;font-weight:600;color:${NAVY};">${text}</h2>`
}
function p(text: string) {
  return `<p style="margin:0 0 16px;font-size:14px;color:#444;line-height:1.7;">${text}</p>`
}
function divider() {
  return `<hr style="border:none;border-top:1px solid #eee;margin:24px 0;">`
}
function btn(text: string, url: string) {
  return `<div style="text-align:center;margin:28px 0;">
    <a href="${url}" style="display:inline-block;background:${RED};color:#ffffff;text-decoration:none;
      font-size:14px;font-weight:700;padding:14px 36px;border-radius:8px;
      box-shadow:0 4px 12px rgba(214,40,40,0.3);">${text}</a>
  </div>`
}
function infoBox(rows: [string, string][]) {
  const rowsHtml = rows.map(([label, value]) => `
    <tr>
      <td style="padding:8px 12px;font-size:12px;font-weight:600;color:${BLUE};width:40%;vertical-align:top;">${label}</td>
      <td style="padding:8px 12px;font-size:13px;color:#333;vertical-align:top;">${value}</td>
    </tr>`).join('')
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};border-radius:8px;border-left:4px solid ${RED};margin:20px 0;">
    <tbody>${rowsHtml}</tbody>
  </table>`
}
function signOff() {
  return `${divider()}
    <p style="margin:0;font-size:13px;color:#666;line-height:1.7;">
      Talk soon,<br>
      <strong style="color:${NAVY};">Garrett Eldredge</strong><br>
      <span style="color:${BLUE};font-size:12px;">Pescadero Music</span>
    </p>`
}


// ════════════════════════════════════════════════════════════
//  EMAIL FUNCTIONS
// ════════════════════════════════════════════════════════════

// ── 1. Welcome email (sent after account created) ─────────
export async function sendWelcomeEmail(to: string, firstName: string) {
  const html = shell(`
    ${h1(`Welcome, ${firstName}! 👋`)}
    ${p(`Thanks for creating your Pescadero Music account. You're now set up to manage your booking, review your contract, and stay connected every step of the way.`)}
    ${p(`Here's what to expect next:`)}
    <ul style="font-size:14px;color:#444;line-height:2;padding-left:20px;margin:0 0 20px;">
      <li>Garrett will review your inquiry and reach out personally</li>
      <li>Once availability is confirmed, you'll receive your service agreement</li>
      <li>You'll sign digitally and pay your deposit — all through your dashboard</li>
      <li>From there, it's smooth sailing to your event day</li>
    </ul>
    ${btn('Go to My Dashboard', 'https://pescaderomusic.com/dashboard')}
    ${p(`Questions in the meantime? Just reply to this email.`)}
    ${signOff()}
  `)

  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Welcome to Pescadero Music — Your account is ready',
    html,
  })
}

// ── 2. Inquiry received (sent to client after inquiry) ────
export async function sendInquiryConfirmation(to: string, firstName: string, eventDate: string, eventName: string) {
  const html = shell(`
    ${h1('Inquiry Received!')}
    ${p(`Hi ${firstName}, we got your inquiry and we're excited to hear about your event. Garrett will be in touch within 1–2 business days to discuss availability and details.`)}
    ${infoBox([
      ['Event', eventName],
      ['Date', eventDate],
    ])}
    ${p(`In the meantime, feel free to browse the portal — once Garrett confirms availability, your contract will appear there automatically.`)}
    ${btn('View My Dashboard', 'https://pescaderomusic.com/dashboard')}
    ${p(`We look forward to being part of your day.`)}
    ${signOff()}
  `)

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Inquiry received — ${eventName}`,
    html,
  })
}

// ── 3. Alert to Garrett — new inquiry ────────────────────
export async function sendGarrettInquiryAlert(client: {
  firstName: string, lastName: string, email: string, phone: string,
  eventName: string, eventDate: string, venue: string, budget: string,
  services: string, notes?: string
}) {
  const html = shell(`
    ${h1('New Inquiry')}
    ${p(`A new inquiry just came in through the portal.`)}
    ${infoBox([
      ['Name',     `${client.firstName} ${client.lastName}`],
      ['Email',    client.email],
      ['Phone',    client.phone],
      ['Event',    client.eventName],
      ['Date',     client.eventDate],
      ['Venue',    client.venue],
      ['Budget',   client.budget],
      ['Services', client.services],
      ['Notes',    client.notes || '—'],
    ])}
    ${btn('Review in Admin Panel', 'https://pescaderomusic.com/admin')}
  `)

  return resend.emails.send({
    from: FROM,
    to: GARRETT,
    subject: `🎵 New inquiry — ${client.firstName} ${client.lastName} · ${client.eventDate}`,
    html,
  })
}

// ── 4. Contract ready (sent to client) ───────────────────
export async function sendContractReady(to: string, firstName: string, eventName: string, eventDate: string, depositAmount: number) {
  const html = shell(`
    ${h1('Your Contract is Ready')}
    ${p(`Hi ${firstName}, great news — Garrett has confirmed availability for your event and your service agreement is ready to review and sign.`)}
    ${infoBox([
      ['Event',   eventName],
      ['Date',    eventDate],
      ['Deposit', `$${depositAmount} (non-refundable, due at signing)`],
    ])}
    ${p(`Review the agreement carefully, fill in any remaining details, and sign digitally. Your deposit is due at the same time — once that's processed, your date is officially locked in.`)}
    ${btn('Review & Sign Contract →', 'https://pescaderomusic.com/dashboard')}
    ${p(`Questions about anything in the agreement? Just reply to this email and Garrett will get back to you.`)}
    ${signOff()}
  `)

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Your Pescadero Music contract is ready — ${eventName}`,
    html,
  })
}

// ── 5. Alert to Garrett — contract signed ────────────────
export async function sendGarrettContractSigned(client: {
  firstName: string, lastName: string, email: string,
  eventName: string, eventDate: string, depositAmount: number
}) {
  const html = shell(`
    ${h1('Contract Signed + Deposit Paid')}
    ${p(`${client.firstName} ${client.lastName} has signed their contract and paid the deposit. Their booking is now confirmed.`)}
    ${infoBox([
      ['Client',  `${client.firstName} ${client.lastName}`],
      ['Email',   client.email],
      ['Event',   client.eventName],
      ['Date',    client.eventDate],
      ['Deposit', `$${client.depositAmount} received`],
    ])}
    ${btn('View in Admin Panel', 'https://pescaderomusic.com/admin')}
  `)

  return resend.emails.send({
    from: FROM,
    to: GARRETT,
    subject: `✅ Signed + paid — ${client.firstName} ${client.lastName} · ${client.eventDate}`,
    html,
  })
}

// ── 6. Deposit confirmation (sent to client) ─────────────
export async function sendDepositConfirmation(to: string, firstName: string, eventName: string, eventDate: string, depositAmount: number, finalAmount?: number) {
  const html = shell(`
    ${h1('Deposit Received — You\'re Booked!')}
    ${p(`Hi ${firstName}, your deposit has been received and your date is officially locked in. We're looking forward to being part of your event!`)}
    ${infoBox([
      ['Event',         eventName],
      ['Date',          eventDate],
      ['Deposit Paid',  `$${depositAmount}`],
      ['Balance Due',   finalAmount ? `$${finalAmount} (due before event)` : 'To be confirmed'],
    ])}
    ${p(`<strong>What's next:</strong> Garrett will reach out to schedule your playlist consultation and walk through the event timeline with you.`)}
    ${btn('View My Dashboard', 'https://pescaderomusic.com/dashboard')}
    ${p(`Keep this email for your records. A Stripe receipt was also sent to this address.`)}
    ${signOff()}
  `)

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Booking confirmed — ${eventName} on ${eventDate}`,
    html,
  })
}

// ── 7. Planning form submitted alert (to Garrett) ────────
export async function sendGarrettPlanningFormAlert(client: {
  firstName: string, lastName: string, eventName: string, eventDate: string
}) {
  const html = shell(`
    ${h1('Planning Form Submitted')}
    ${p(`${client.firstName} ${client.lastName} has submitted their event planning & timeline form.`)}
    ${infoBox([
      ['Client', `${client.firstName} ${client.lastName}`],
      ['Event',  client.eventName],
      ['Date',   client.eventDate],
    ])}
    ${btn('Review Planning Form', 'https://pescaderomusic.com/admin')}
  `)

  return resend.emails.send({
    from: FROM,
    to: GARRETT,
    subject: `📋 Planning form submitted — ${client.firstName} ${client.lastName} · ${client.eventDate}`,
    html,
  })
}

// ── 8. Final payment confirmation (to client) ────────────
export async function sendFinalPaymentConfirmation(to: string, firstName: string, eventName: string, eventDate: string, finalAmount: number) {
  const html = shell(`
    ${h1('Final Payment Received')}
    ${p(`Hi ${firstName}, your final payment of $${finalAmount} has been received. Your booking is fully confirmed and paid in full.`)}
    ${infoBox([
      ['Event',         eventName],
      ['Date',          eventDate],
      ['Final Payment', `$${finalAmount} received`],
      ['Status',        'Fully confirmed ✓'],
    ])}
    ${p(`We'll see you on event day. If anything comes up before then, don't hesitate to reach out.`)}
    ${btn('View My Dashboard', 'https://pescaderomusic.com/dashboard')}
    ${signOff()}
  `)

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Payment complete — ${eventName} on ${eventDate}`,
    html,
  })
}
