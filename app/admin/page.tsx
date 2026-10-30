import { redirect } from 'next/navigation'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ClientRowActions from '@/components/admin/ClientRowActions'

export const dynamic = 'force-dynamic'

const GREEN = '#4CAF50'
const GOLD = '#F5A623'
const LOCKED = '#9CA3A8'
const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const STEPS = [
  { key: 'step_inquiry',       short: 'Inquiry',   num: '01' },
  { key: 'step_consultation',  short: 'Consult',   num: '02' },
  { key: 'step_contract',      short: 'Contract',  num: '03' },
  { key: 'step_deposit',       short: 'Deposit',   num: '04' },
  { key: 'step_planning',      short: 'Planning',  num: '05' },
  { key: 'step_final_payment', short: 'Final $',   num: '06' },
  { key: 'step_event',         short: 'Event',     num: '07' },
]

function stepColor(val: string) {
  if (['complete', 'signed', 'paid', 'submitted'].includes(val)) return GREEN
  if (['pending', 'sent'].includes(val)) return GOLD
  return LOCKED
}
function stepSymbol(val: string) {
  if (['complete', 'signed', 'paid', 'submitted'].includes(val)) return '✓'
  if (['pending', 'sent'].includes(val)) return '●'
  return '○'
}

function fmtDate(d: string | null) {
  if (!d) return null
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AdminPage({ searchParams }: { searchParams: { view?: string } }) {
  const showArchived = searchParams?.view === 'archived'
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== GARRETT_ID) redirect('/dashboard')

  const admin = getAdmin()

  const [
    { data: bookings },
    { data: profiles },
    { data: authUsers },
    { data: inquiries },
    { data: contracts },
  ] = await Promise.all([
    admin.from('bookings').select('*').order('created_at', { ascending: false }),
    admin.from('profiles').select('id, full_name'),
    admin.auth.admin.listUsers(),
    admin.from('inquiry_submissions').select('*').order('submitted_at', { ascending: false }),
    admin.from('contracts').select('client_id, status, deposit_paid_at, event_type, event_date, deposit_amount, final_payment_amount, final_payment_due'),
  ])

  const profileMap  = Object.fromEntries((profiles || []).map(p => [p.id, p]))
  const emailMap    = Object.fromEntries((authUsers?.users || []).map(u => [u.id, u.email]))
  const inquiryMap  = Object.fromEntries((inquiries || []).map(i => [i.client_id, i]))
  const contractMap = Object.fromEntries((contracts || []).map(c => [c.client_id, c]))

  const activeBookings   = (bookings || []).filter(b => !b.archived_at)
  const archivedBookings = (bookings || []).filter(b => b.archived_at)
  const visibleBookings  = showArchived ? archivedBookings : activeBookings

  // Stats
  const total          = activeBookings?.length || 0
  const consultPending = activeBookings?.filter(b => b.step_consultation === 'pending').length || 0
  const depositPaid    = activeBookings?.filter(b => b.step_deposit === 'paid').length || 0
  const now            = new Date()
  const upcoming30     = activeBookings?.filter(b => {
    const d = contractMap[b.client_id]?.event_date || inquiryMap[b.client_id]?.event_date
    if (!d) return false
    const diff = Math.ceil((new Date(d + 'T12:00:00').getTime() - now.getTime()) / 86400000)
    return diff >= 0 && diff <= 30
  }).length || 0

  // Upcoming events (next 90 days) for sidebar
  const upcomingEvents = activeBookings
    .map(b => {
      const d = contractMap[b.client_id]?.event_date || inquiryMap[b.client_id]?.event_date
      const daysAway = d ? Math.ceil((new Date(d + 'T12:00:00').getTime() - now.getTime()) / 86400000) : null
      return { ...b, eventDate: d, daysAway, profile: profileMap[b.client_id], contract: contractMap[b.client_id], inquiry: inquiryMap[b.client_id] }
    })
    .filter(b => b.daysAway !== null && b.daysAway >= 0 && b.daysAway <= 90)
    .sort((a, b) => (a.daysAway ?? 999) - (b.daysAway ?? 999))
    .slice(0, 5)

  // Clients needing action
  const needsAction = activeBookings.filter(b =>
    b.step_consultation === 'pending' ||
    (b.step_consultation === 'complete' && b.step_contract === 'locked') ||
    (b.step_contract === 'signed' && b.step_deposit === 'locked')
  )

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface">
      {/* Sub-nav bar (real links — the global DashboardNav above this is untouched) */}
      <div className="bg-primary text-on-primary">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-space-xl h-14 flex items-center justify-between">
          <div className="flex items-center gap-space-lg overflow-x-auto">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary-fixed shrink-0">
              Pescadero Admin
            </span>
            <Link href="/admin/inquiries" className="font-label-sm text-label-sm uppercase tracking-wider text-on-primary-container hover:text-on-primary transition-colors shrink-0">
              Inquiries
            </Link>
            <Link href="/admin/availability" className="font-label-sm text-label-sm uppercase tracking-wider text-on-primary-container hover:text-on-primary transition-colors shrink-0">
              Availability
            </Link>
            <Link href="/admin/analytics" className="font-label-sm text-label-sm uppercase tracking-wider text-on-primary-container hover:text-on-primary transition-colors shrink-0">
              Analytics
            </Link>
            <Link href="/admin/reviews" className="font-label-sm text-label-sm uppercase tracking-wider text-on-primary-container hover:text-on-primary transition-colors shrink-0">
              Reviews
            </Link>
          </div>
          <Link
            href="/dashboard?client=true"
            className="font-label-sm text-label-sm uppercase tracking-wider text-secondary-fixed hover:text-on-primary border border-on-primary/20 px-space-sm py-1 whitespace-nowrap transition-colors"
          >
            Switch to Client View →
          </Link>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-space-xl py-space-xl">
        {/* Header banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md border-b-2 border-primary pb-space-md mb-space-xl">
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">
              {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Client Pipeline
            </h1>
          </div>
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
            Curated by Garrett
          </span>
        </div>

        {/* Stats row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl">
          {[
            { num: '01', label: 'Total Clients', value: total },
            { num: '02', label: 'Consult Needed', value: consultPending },
            { num: '03', label: 'Deposits Paid', value: depositPaid },
            { num: '04', label: 'Events in 30 Days', value: upcoming30, highlight: true },
          ].map((s) => (
            <div
              key={s.label}
              className={`p-space-md shadow-[3px_3px_0px_0px_#07111A] flex flex-col justify-between ${
                s.highlight ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface'
              }`}
            >
              <span
                className={`font-label-sm text-label-sm uppercase tracking-widest ${
                  s.highlight ? 'text-secondary-fixed' : 'text-on-surface-variant'
                }`}
              >
                {s.num} / {s.label}
              </span>
              <span className={`font-display-xl text-display-xl leading-none mt-space-sm ${s.highlight ? 'text-on-primary' : 'text-primary'}`}>
                {s.value}
              </span>
            </div>
          ))}
        </section>

        {/* Needs action */}
        {needsAction.length > 0 && (
          <section className="bg-surface-container-low p-space-md lg:p-space-lg shadow-[4px_4px_0px_0px_#07111A] mb-space-xl">
            <div className="flex items-center justify-between border-b-2 border-primary pb-space-sm mb-space-md">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary block">
                  Live Desk Bench
                </span>
                <h2 className="font-headline-sm text-headline-sm text-primary">Needs Your Action</h2>
              </div>
              <span className="font-label-md text-label-md bg-primary text-on-primary px-2 py-1 uppercase">
                {needsAction.length} Active
              </span>
            </div>
            <div className="space-y-space-sm">
              {needsAction.map((b) => {
                const profile = profileMap[b.client_id]
                const email = emailMap[b.client_id]
                const action =
                  b.step_consultation === 'pending'
                    ? 'Consultation call needed'
                    : b.step_consultation === 'complete' && b.step_contract === 'locked'
                    ? 'Ready to send contract'
                    : 'Contract signed — unlock deposit'
                return (
                  <div key={b.id} className="bg-surface p-space-sm flex items-center justify-between gap-space-sm shadow-[2px_2px_0px_0px_#07111A]">
                    <div>
                      <span className="font-label-lg text-label-lg uppercase text-primary">{profile?.full_name || email}</span>
                      <span className="font-body-sm text-body-sm text-secondary block">{action}</span>
                    </div>
                    <Link
                      href={`/admin/client/${b.client_id}`}
                      className="font-label-sm text-label-sm uppercase bg-surface-container px-space-sm py-1 hover:bg-primary hover:text-on-primary transition-colors whitespace-nowrap"
                    >
                      {b.step_consultation === 'pending' ? 'View Request →' : 'Take Action →'}
                    </Link>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Client table */}
        <section className="bg-surface-container-lowest p-space-md lg:p-space-lg shadow-[4px_4px_0px_0px_#07111A] mb-space-xl">
          <div className="flex items-center justify-between border-b border-primary/20 pb-space-md mb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
              {showArchived ? `Archived Clients (${archivedBookings.length})` : `Active Clients (${activeBookings.length})`}
            </span>
            <Link
              href={showArchived ? '/admin' : '/admin?view=archived'}
              className="font-label-sm text-label-sm uppercase tracking-wider text-secondary hover:text-primary transition-colors whitespace-nowrap"
            >
              {showArchived ? '← Active Clients' : `Archived (${archivedBookings.length})`}
            </Link>
          </div>

          {visibleBookings.length === 0 && (
            <p className="py-space-xl text-center font-body-md text-body-md text-on-surface-variant">
              {showArchived ? 'No archived clients.' : 'No clients yet.'}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              {visibleBookings.length > 0 && (
                <thead>
                  <tr className="bg-primary text-on-primary font-label-md text-label-md uppercase tracking-widest">
                    <th className="py-2.5 px-3">Client</th>
                    <th className="py-2.5 px-3">Event</th>
                    <th className="py-2.5 px-3">Progress</th>
                    <th className="py-2.5 px-3">Contract</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
              )}
              <tbody className="font-body-md text-body-md divide-y divide-primary/10">
                {visibleBookings.map((booking, i) => {
                  const profile = profileMap[booking.client_id]
                  const email = emailMap[booking.client_id]
                  const inquiry = inquiryMap[booking.client_id]
                  const contract = contractMap[booking.client_id]
                  const eventDate = contract?.event_date || inquiry?.event_date
                  const daysAway = eventDate ? Math.ceil((new Date(eventDate + 'T12:00:00').getTime() - now.getTime()) / 86400000) : null

                  return (
                    <tr key={booking.id} className={i % 2 === 0 ? 'bg-surface' : 'bg-surface-container-lowest'}>
                      <td className="py-3 px-3 align-top">
                        <div className="font-title-editorial text-title-editorial font-medium text-primary">
                          {profile?.full_name || 'Unknown'}
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">{email}</div>
                      </td>
                      <td className="py-3 px-3 align-top">
                        {eventDate ? (
                          <>
                            <div className="font-label-md text-label-md text-primary">{fmtDate(eventDate)}</div>
                            <span
                              className="inline-block mt-1 px-1.5 py-0.5 font-label-sm text-label-sm uppercase text-on-primary"
                              style={{ background: daysAway !== null && daysAway <= 14 ? '#C8202A' : daysAway !== null && daysAway <= 30 ? GOLD : '#9CA3A8' }}
                            >
                              {daysAway !== null ? `T-${daysAway}d` : ''}
                            </span>
                          </>
                        ) : (
                          <span className="font-body-sm text-body-sm text-on-surface-variant">No date set</span>
                        )}
                      </td>
                      <td className="py-3 px-3 align-top">
                        <div className="flex gap-1 flex-wrap">
                          {STEPS.map(({ key, short }) => {
                            const val = booking[key] || 'locked'
                            const color = stepColor(val)
                            const sym = stepSymbol(val)
                            return (
                              <div
                                key={key}
                                title={`${short}: ${val}`}
                                className="flex flex-col items-center gap-0.5 px-1.5 py-1 min-w-[40px] bg-surface-container"
                                style={{ borderBottom: `2px solid ${color}` }}
                              >
                                <span className="text-xs leading-none" style={{ color }}>{sym}</span>
                                <span className="font-label-sm text-[8px] uppercase tracking-wide whitespace-nowrap" style={{ color }}>{short}</span>
                              </div>
                            )
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-3 align-top">
                        {contract?.status ? (
                          <span
                            className={`font-label-sm text-label-sm px-2 py-0.5 uppercase tracking-wide inline-block ${
                              ['deposit_paid', 'fully_paid'].includes(contract.status)
                                ? 'bg-secondary-fixed text-on-secondary-fixed font-bold'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            {contract.status.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="font-body-sm text-body-sm text-on-surface-variant">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 align-top">
                        <div className="flex flex-col items-end gap-1.5">
                          <Link
                            href={`/admin/client/${booking.client_id}`}
                            className="font-label-sm text-label-sm uppercase bg-primary text-on-primary px-2 py-1 hover:bg-secondary transition-colors whitespace-nowrap"
                          >
                            Manage →
                          </Link>
                          <ClientRowActions clientId={booking.client_id} isArchived={!!booking.archived_at} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bottom panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">
          {/* Upcoming events */}
          <section className="lg:col-span-5 bg-surface-container-low p-space-md lg:p-space-lg shadow-[4px_4px_0px_0px_#07111A]">
            <div className="border-b-2 border-primary pb-space-sm mb-space-md">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary block">Score &amp; Running Order</span>
              <h2 className="font-headline-sm text-headline-sm text-primary">Upcoming Events</h2>
            </div>
            {upcomingEvents.length === 0 && (
              <p className="font-body-sm text-body-sm text-on-surface-variant">No events in the next 90 days.</p>
            )}
            <div className="space-y-space-sm">
              {upcomingEvents.map((e) => (
                <div key={e.id} className="bg-surface p-space-sm shadow-[2px_2px_0px_0px_#07111A] flex items-center justify-between gap-space-sm">
                  <div>
                    <div className="font-label-lg text-label-lg uppercase text-primary">
                      {e.profile?.full_name || emailMap[e.client_id] || 'Client'}
                    </div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant italic">
                      {e.contract?.event_type || e.inquiry?.event_name || 'Event'}
                    </div>
                  </div>
                  <span
                    className="font-label-sm text-label-sm uppercase font-bold whitespace-nowrap"
                    style={{ color: e.daysAway !== null && e.daysAway! <= 7 ? '#C8202A' : GOLD }}
                  >
                    {fmtDate(e.eventDate || null)} · {e.daysAway}d
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Quick links */}
          <section className="lg:col-span-4 bg-surface-container-low p-space-md lg:p-space-lg shadow-[4px_4px_0px_0px_#07111A]">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary block border-b-2 border-primary pb-space-sm mb-space-md">
              Quick Links
            </span>
            <div className="flex flex-col">
              {[
                { href: '/', label: 'Homepage' },
                { href: '/dashboard?client=true', label: 'Client Dashboard' },
                { href: '/inquiry', label: 'Inquiry Form' },
                { href: '/contract', label: 'Contract Viewer' },
                { href: '/contract/payment', label: 'Payment Page' },
                { href: '/planning', label: 'Planning Form' },
                { href: '/review', label: 'Review Page' },
                { href: '/admin/availability', label: 'Set Availability' },
                { href: 'mailto:garrett@pescaderomusic.com', label: 'Compose Email' },
                { href: 'https://dashboard.stripe.com', label: 'Stripe Dashboard', ext: true },
                { href: 'https://resend.com', label: 'Resend Logs', ext: true },
                { href: 'https://supabase.com/dashboard', label: 'Supabase', ext: true },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.ext ? '_blank' : undefined}
                  rel={link.ext ? 'noopener noreferrer' : undefined}
                  className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary py-1.5 border-b border-primary/10 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </section>

          {/* Legend */}
          <section className="lg:col-span-3 bg-primary text-on-primary p-space-md lg:p-space-lg shadow-[4px_4px_0px_0px_#07111A]">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary-fixed block border-b border-primary-container pb-space-sm mb-space-md">
              Legend
            </span>
            <div className="flex flex-col gap-space-sm">
              {[
                { sym: '✓', color: GREEN, label: 'Complete / Paid' },
                { sym: '●', color: GOLD, label: 'Pending / Sent' },
                { sym: '○', color: '#9CA3A8', label: 'Locked / Not started' },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-space-sm">
                  <span className="text-base w-4" style={{ color: l.color }}>{l.sym}</span>
                  <span className="font-body-sm text-body-sm text-on-primary-container">{l.label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
