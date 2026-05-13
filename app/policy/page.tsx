import Link from 'next/link'

const NAVY  = '#0D1B2A'
const BLUE  = '#44BEC7'
const RED   = '#D62828'
const CREAM = '#F5EFE0'

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE, fontFamily: 'Poppins, sans-serif' }}>{eyebrow}</p>
      <h2 style={{ margin: '0 0 6px', fontFamily: 'Georgia, serif', fontSize: 28, color: 'white', fontWeight: 700, borderBottom: `2px solid ${RED}`, paddingBottom: 8 }}>{title}</h2>
      <div style={{ marginTop: 16, fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'rgba(232,224,213,0.8)', lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  )
}

function PolicyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ margin: '0 0 6px', fontWeight: 700, color: 'white', fontSize: 14 }}>{label}</p>
      <div style={{ color: 'rgba(232,224,213,0.75)', fontSize: 13, lineHeight: 1.8 }}>{children}</div>
    </div>
  )
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: `rgba(68,190,199,0.08)`, border: `1px solid rgba(68,190,199,0.2)`, borderLeft: `4px solid ${BLUE}`, borderRadius: 6, padding: '14px 18px', margin: '16px 0', fontStyle: 'italic', color: 'rgba(232,224,213,0.7)', fontSize: 13, lineHeight: 1.7 }}>
      {children}
    </div>
  )
}

function Table({ rows }: { rows: [string, string][] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
      <thead>
        <tr style={{ background: NAVY }}>
          <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins, sans-serif' }}>Cancellation Window</th>
          <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins, sans-serif' }}>Final Payment Refunded</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([window, refund], i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)' }}>
            <td style={{ padding: '10px 16px', fontSize: 13, color: 'rgba(232,224,213,0.8)', fontFamily: 'Poppins, sans-serif' }}>{window}</td>
            <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700, color: BLUE, textAlign: 'right', fontFamily: 'Poppins, sans-serif' }}>{refund}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function PolicyPage() {
  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, fontFamily: 'Poppins, sans-serif' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,24,40,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(68,190,199,0.12)', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 700, color: RED }}>Pescadero</span>
          <span style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 700, letterSpacing: '4px', color: BLUE, textTransform: 'uppercase' }}>MUSIC</span>
        </div>
        <Link href="/" style={{ fontSize: 11, color: 'rgba(232,224,213,0.4)', textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase' }}>← Home</Link>
      </nav>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0A1828 100%)`, borderBottom: `1px solid rgba(68,190,199,0.15)`, padding: '56px 24px 48px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 10px', fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: BLUE }}>Wedding Sound Services</p>
        <h1 style={{ margin: '0 0 12px', fontFamily: 'Georgia, serif', fontSize: 42, fontWeight: 700, color: 'white', lineHeight: 1.1 }}>
          Service <span style={{ color: BLUE }}>Policy</span>
        </h1>
        <p style={{ margin: '0 auto', fontSize: 14, color: 'rgba(232,224,213,0.5)', fontStyle: 'italic', maxWidth: 480 }}>
          Professional Sound for Your Perfect Day
        </p>
        <div style={{ marginTop: 20, fontSize: 12, color: 'rgba(232,224,213,0.35)' }}>
          garrett@pescaderomusic.com · (210) 727-9328 · pescaderomusic.com
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '56px 24px 80px' }}>

        {/* What We Offer */}
        <Section eyebrow="About" title="What We Offer">
          <p style={{ marginTop: 0 }}>
            Pescadero Music provides professional live sound services for small to medium-sized weddings and events — indoor or outdoor, intimate or grand. Every event receives the same level of care, preparation, and on-site expertise.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 20 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '18px 20px' }}>
              <p style={{ margin: '0 0 10px', fontWeight: 700, color: 'white', fontSize: 14 }}>Standard Package Includes:</p>
              {['Professional sound system', 'Dinner & dance music consultation and playback', 'Up to 4 hours of live audio service', 'Full setup & takedown', 'Travel to venue'].map(item => (
                <p key={item} style={{ margin: '4px 0', fontSize: 13, color: 'rgba(232,224,213,0.75)' }}>• {item}</p>
              ))}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '18px 20px' }}>
              <p style={{ margin: '0 0 10px', fontWeight: 700, color: 'white', fontSize: 14 }}>Available Add-Ons:</p>
              {['MC / Emcee services', 'Ceremony & speech PA system', 'Wireless microphones', 'Dance floor lighting'].map(item => (
                <p key={item} style={{ margin: '4px 0', fontSize: 13, color: 'rgba(232,224,213,0.75)' }}>• {item}</p>
              ))}
              <p style={{ margin: '10px 0 0', fontSize: 11, color: BLUE, fontStyle: 'italic' }}>Pricing upon request</p>
            </div>
          </div>

          <Callout>"Every detail of your day deserves to sound as good as it looks."</Callout>
        </Section>

        {/* Service Duration */}
        <Section eyebrow="Service Duration & Setup" title="How We Work">
          <PolicyRow label="Service Window">
            <p style={{ margin: 0 }}>Standard service includes <strong style={{ color: 'white' }}>up to 4 hours</strong> of live audio operated by our on-site technician. Additional hours are available at an added rate, agreed upon in writing before the event.</p>
          </PolicyRow>
          <PolicyRow label="Arrival & Setup">
            <p style={{ margin: 0 }}>Pescadero Music arrives <strong style={{ color: 'white' }}>1.5 hours before event start time</strong> to set up and soundcheck. Takedown begins at the conclusion of the contracted service period.</p>
          </PolicyRow>
          <Callout>Example: For a 6:00–10:00 PM event, arrival is at 4:30 PM. Takedown begins promptly at 10:00 PM.</Callout>
          <PolicyRow label="Scope of Services">
            <p style={{ margin: 0 }}>Our services include audio setup and operation, music playback, MC announcements (if included), microphone support, and timeline execution. Outside our scope: full event planning, vendor management, furniture moving, guest coordination, or decisions requiring client approval.</p>
          </PolicyRow>
          <PolicyRow label="MC / Emcee Services">
            <p style={{ margin: 0 }}>When MC services are included, Pescadero Music handles announcements, introductions, and transitions — keeping things flowing naturally. MC services are focused on audio-driven event flow, not full event coordination. For events requiring comprehensive coordination, we recommend partnering with a dedicated planner.</p>
          </PolicyRow>
        </Section>

        {/* Travel */}
        <Section eyebrow="Travel Policy" title="Travel & Service Area">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { range: 'Within 30 miles', fee: 'Free', note: 'of Provo, UT' },
              { range: '31–60 miles', fee: '$75', note: 'travel fee applies' },
              { range: '61+ miles', fee: 'Request', note: 'fees & availability upon request' },
            ].map(({ range, fee, note }) => (
              <div key={range} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 6px', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{range}</p>
                <p style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: BLUE }}>{fee}</p>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>{note}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Equipment */}
        <Section eyebrow="Policies" title="Equipment Policy">
          <p>All sound equipment remains under the <strong style={{ color: 'white' }}>exclusive supervision and control</strong> of the Pescadero Music technician at all times. We do not rent out or leave equipment unattended.</p>
          <p>Damage or tampering by anyone other than the on-site technician will result in financial liability for the responsible party.</p>
          <p>If equipment placement has not been finalized prior to the event, or if conflicting instructions are received, Pescadero Music may use professional judgment to determine the most suitable placement based on safety, acoustics, and venue guidelines.</p>
        </Section>

        {/* Payment */}
        <Section eyebrow="Financials" title="Payment Terms">
          <p>Pricing is determined based on the specific needs of each event and outlined in your service agreement before any deposit is made. A <strong style={{ color: 'white' }}>non-refundable deposit</strong> is required to secure your date, with the remaining balance due before the event.</p>
          <PolicyRow label="Accepted Payment Methods">
            <p style={{ margin: 0 }}>Venmo, PayPal, CashApp, or check. <em>Cash and trade payments are not accepted.</em></p>
          </PolicyRow>
          <PolicyRow label="Late Payments">
            <p style={{ margin: 0 }}>If payments are not received by their due dates, Pescadero Music reserves the right to apply late fees or, in rare cases, cancel the booking without refund of the deposit.</p>
          </PolicyRow>
        </Section>

        {/* Cancellations */}
        <Section eyebrow="Policies" title="Cancellations & Refunds">
          <PolicyRow label="Deposit">
            <p style={{ margin: 0 }}>The deposit is <strong style={{ color: RED }}>non-refundable under all circumstances</strong>, except where Pescadero Music is unable to fulfill the agreed service — in which case a full refund of all payments is issued.</p>
          </PolicyRow>
          <PolicyRow label="Final Payment Refund Schedule">
            <Table rows={[
              ['14 days – 72 hours before event', '100%'],
              ['72 – 24 hours before event', '80%'],
              ['Less than 24 hours before event', '50%'],
            ]} />
          </PolicyRow>
        </Section>

        {/* Rescheduling */}
        <Section eyebrow="Policies" title="Rescheduling">
          <p>Events may be rescheduled between <strong style={{ color: 'white' }}>14 days and 24 hours before the event</strong> with minimal or no additional fees, subject to availability.</p>
          <p>Pescadero Music reserves the right to decline rescheduling requests based on availability, in which case the final payment is refunded in full. The deposit is not refunded in rescheduling scenarios unless Pescadero Music is unable to accommodate the new date.</p>
        </Section>

        {/* Planning */}
        <Section eyebrow="Planning" title="Planning Deadline & Vendor Coordination">
          <PolicyRow label="14-Day Deadline">
            <p style={{ margin: '0 0 8px' }}>All major event details are due <strong style={{ color: 'white' }}>no later than 14 days before your event</strong>, unless otherwise agreed upon in writing. This includes:</p>
            {['Event timeline and schedule of moments', 'Venue address and ceremony/reception layout', 'Music preferences, must-plays, and do-not-plays', 'Introductions, special announcements, and dedications', 'Vendor contacts (photographer, planner, catering, etc.)', 'Any other special requests or considerations'].map(item => (
              <p key={item} style={{ margin: '3px 0', fontSize: 13 }}>• {item}</p>
            ))}
          </PolicyRow>
          <Callout>Last-minute changes are always welcome when timing allows — we'll do our best to accommodate them. Submitting details early gives us the best opportunity to make everything perfect.</Callout>
          <PolicyRow label="Vendor Coordination">
            <p style={{ margin: 0 }}>Pescadero Music works cooperatively with all event vendors. We are not responsible for managing or supervising third-party vendors unless specifically contracted to do so. For questions about vendor timelines, we recommend designating a planner as the central point of contact.</p>
          </PolicyRow>
        </Section>

        {/* Overtime */}
        <Section eyebrow="Logistics" title="Timeline, Delays & Overtime">
          <p>Events have a natural rhythm, and schedules sometimes shift. Pescadero Music will do our best to adapt in real time and keep the evening flowing.</p>
          <p>Service beyond contracted hours may be available upon approval and will be billed at the overtime rate stated in your service agreement. <strong style={{ color: 'white' }}>Overtime requests should be communicated to the on-site technician as early as possible during the event.</strong></p>
        </Section>

        {/* Weather */}
        <Section eyebrow="Policies" title="Weather, Safety & Incidents">
          {[
            'For outdoor events, the client is responsible for providing a safe, covered, weather-appropriate setup area for all audio equipment.',
            'If weather or environmental conditions create a risk to people or equipment, Pescadero Music reserves the right to pause, relocate, or take protective measures.',
            'Pescadero Music is not responsible for injuries or damages resulting from unauthorized use or interference with equipment. Only our technician is authorized to operate sound systems during the event.',
            'Any safety concerns during the event should be directed to the on-site technician, who will respond according to professional discretion and best practices.',
          ].map((item, i) => (
            <p key={i} style={{ margin: '0 0 10px' }}>• {item}</p>
          ))}
        </Section>

        {/* Music & content */}
        <Section eyebrow="Music" title="Playlist & Content Policy">
          <p>All playlists are curated in collaboration with the hiring party — your input and song selections guide what gets played. Pescadero Music will schedule a consultation to go over your playlist and event flow after booking is confirmed.</p>
          <Callout>As a general rule, Pescadero Music steers away from explicit music — it's just not our vibe. If you have specific preferences or questions around content, bring them up during your consultation and we'll find the right fit together.</Callout>
        </Section>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(68,190,199,0.15)', paddingTop: 32, textAlign: 'center' }}>
          <p style={{ margin: '0 0 6px', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 18, color: 'white' }}>
            Thank you for choosing Pescadero Music.
          </p>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: 'rgba(232,224,213,0.4)' }}>
            We look forward to making your event a success.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:garrett@pescaderomusic.com" style={{ fontSize: 12, color: BLUE, textDecoration: 'none' }}>garrett@pescaderomusic.com</a>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
            <a href="tel:2107279328" style={{ fontSize: 12, color: BLUE, textDecoration: 'none' }}>(210) 727-9328</a>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>pescaderomusic.com</span>
          </div>
          <div style={{ marginTop: 20 }} className="no-print">
            <Link href="/inquiry" style={{ display: 'inline-block', padding: '11px 28px', borderRadius: 8, background: RED, color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
              Ready to Book? Submit an Inquiry →
            </Link>
          </div>
        </div>
      </div>

      <style>{`@media print { .no-print { display: none !important; } nav { display: none !important; } }`}</style>
    </div>
  )
}
