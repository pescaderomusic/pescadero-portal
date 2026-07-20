import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') // YYYY-MM-DD

  if (!date) return NextResponse.json({ error: 'Date required' }, { status: 400 })

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    )
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const timeMin = new Date(date + 'T00:00:00-07:00').toISOString()
    const timeMax = new Date(date + 'T23:59:59-07:00').toISOString()

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
