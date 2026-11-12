import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// UTC offset of America/Denver at the start of a given YYYY-MM-DD, e.g. "-06:00"
function denverOffset(date: string) {
  const probe = new Date(`${date}T07:00:00Z`) // ~midnight in Utah, right on DST switch days too
  const name = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Denver', timeZoneName: 'shortOffset' })
    .formatToParts(probe).find((p) => p.type === 'timeZoneName')?.value || 'GMT-7'
  const m = name.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/)
  if (!m) return '-07:00'
  return `${m[1]}${m[2].padStart(2, '0')}:${m[3] || '00'}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') // YYYY-MM-DD

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: 'Date required' }, { status: 400 })

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    )
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // The whole day in Utah time. The offset changes with daylight saving
    // (-07:00 in winter, -06:00 in summer); a fixed -07:00 made every summer
    // all-day booking also block the day before.
    const nextDay = new Date(Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10) + 1))
      .toISOString().slice(0, 10)
    const timeMin = new Date(`${date}T00:00:00${denverOffset(date)}`).toISOString()
    const timeMax = new Date(`${nextDay}T00:00:00${denverOffset(nextDay)}`).toISOString()

    const { data } = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      timeMin,
      timeMax,
      singleEvents: true,
    })

    const events = data.items || []

    const hasBooked  = events.some(e => e.summary?.toUpperCase().includes('BOOKED'))
    const hasPending = events.some(e => e.summary?.toUpperCase().includes('PENDING'))

    let status: 'available' | 'booked' | 'pending' = 'available'
    if (hasBooked)       status = 'booked'
    else if (hasPending) status = 'pending'

    return NextResponse.json({ status, date })
  } catch (err: any) {
    console.error('Calendar check error:', err)
    // Fail open — don't block inquiries if calendar check fails
    return NextResponse.json({ status: 'available', date, error: true })
  }
}
