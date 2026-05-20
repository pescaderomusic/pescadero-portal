import Link from 'next/link'

const NAVY  = '#07111A'
const BLUE     = '#44BEC7'
const CREAM    = '#F5EFE0'
const DISPLAY  = "'freight-display-pro', Georgia, serif"
const UI_FONT  = "'futura-pt-condensed', 'Barlow Condensed', sans-serif"
const BODY     = "'inter', system-ui, sans-serif"
const WORDMARK = "'RetroFloral', 'Barlow Condensed', sans-serif"
const RED   = '#C8202A'

export default function PolicyPage() {
  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0D1E2B 100%)`, fontFamily: BODY }}>

      <nav className="no-print" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(7,17,26,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(68,190,199,0.1)', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <img src="https://shxcw5yjydy1kgql.public.blob.vercel-storage.com/logo.png" alt="Pescadero Music" style={{ height: 32, width: 32, objectFit: 'contain' }} />
          <span style={{ fontFamily: WORDMARK, fontSize: 15, letterSpacing: '3px', color: CREAM, textTransform: 'uppercase' }}>Pescadero Music</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => window.print()} style={{ background: 'none', border: `1px solid rgba(68,190,199,0.3)`, borderRadius: 6, color: BLUE, fontSize: 11, fontWeight: 700, padding: '5px 14px', cursor: 'pointer', fontFamily: UI_FONT, letterSpacing: '1.5px' }}>🖨 Print / Save PDF</button>
          <Link href="/dashboard" style={{ fontSize: 11, fontFamily: UI_FONT, color: 'rgba(245,239,224,0.35)', textDecoration: 'none', letterSpacing: '1.5px', textTransform: 'uppercase' }}>← Dashboard</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ borderBottom: `1px solid rgba(68,190,199,0.12)`, padding: '52px 24px 44px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 10px', fontSize: 10, fontFamily: UI_FONT, letterSpacing: '3px', textTransform: 'uppercase', color: BLUE }}>Wedding Sound Services</p>
        <h1 style={{ margin: '0 0 10px', fontFamily: DISPLAY, fontSize: 40, fontWeight: 300, color: CREAM, lineHeight: 1.1 }}>Service Policy</h1>
        <p style={{ margin: '0 auto', fontSize: 14, fontFamily: "'cormorant-garamond', Georgia, serif", fontStyle: 'italic', color: 'rgba(245,239,224,0.55)', maxWidth: 480 }}>Professional Sound for Your Perfect Day</p>
        <p style={{ marginTop: 16, fontSize: 12, fontFamily: BODY, color: 'rgba(245,239,224,0.25)' }}>garrett@pescaderomusic.com · (210) 727-9328 · pescaderomusic.com</p>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '52px 24px 80px' }}>

        {/* The Vision */}
        <Section eyebrow="About" title="The Vision">
          <p style={{ marginTop: 0 }}>We believe your wedding shouldn't be a puzzle of "silver" or "gold" packages. We provide a single, premium service designed to eliminate the guesswork. You receive our highest level of sound, lighting, and handcrafted design regardless of the venue. If it's needed to make your day perfect, it is already included.</p>
        </Section>

        {/* Part 1 */}
        <Section eyebrow="Part 1" title="Ceremony & Dinner Excellence">
          <p style={{ marginTop: 0 }}>We prioritize clarity and elegance for the most intimate moments of your day.</p>
          <PolicyRow label='The "Anywhere" Ceremony System'>
            Our dedicated ceremony and dinner setup is completely battery-powered. Whether you are saying your vows in an open meadow or a remote mountain overlook, we provide high-fidelity audio without the need for messy extension cords or noisy generators.
          </PolicyRow>
          <PolicyRow label="Shure Professional Wireless">
            To ensure every toast and vow is heard, we utilize world-class Shure wireless systems. We provide two dedicated channels, allowing for any combination of handheld or discreet lapel microphones. While standard DJ mics often cut out in crowded rooms, our professional-grade signal stays rock-solid and interference-free.
          </PolicyRow>
        </Section>

        {/* Part 2 */}
        <Section eyebrow="Part 2" title="The High-Energy Reception">
          <p style={{ marginTop: 0 }}>When the formal moments transition into the celebration, we provide a dedicated environment built specifically for the party.</p>
          <PolicyRow label="The Pro-Grade Dance Floor System">
            Our reception setup features a powerful, high-output sound system hardwired for 100% reliability. Controlled by a professional Allen & Heath console, this system is designed to fill the dance floor with rich, punchy sound while keeping your music crisp and clear.
          </PolicyRow>
          <PolicyRow label="Tailored Dance Floor Lighting">
            We treat lighting as an essential part of the dance floor experience. During our consultation, we'll help you choose the perfect look. Whether you want a soft, warm candle-lit glow for your first dance or vibrant, custom colors that match your wedding palette, we program the lights to sync perfectly with the energy of the room.
          </PolicyRow>
        </Section>

        {/* Signature Aesthetic */}
        <Section eyebrow="Aesthetic" title="The Signature Aesthetic">
          <p style={{ marginTop: 0 }}>Our equipment is designed to look as good as it sounds, fitting seamlessly into the most elegant Utah venues.</p>
          <PolicyRow label="Handcrafted DJ Furniture">
            Most DJs use folding tables with black linens. Our setup features a custom-built white DJ table with a light-brown hardwood top, designed to complement a clean, organic, and modern wedding aesthetic.
          </PolicyRow>
          <PolicyRow label='The "Slick" Look'>
            We are obsessed with a minimalist setup. All cables are hidden and organized within our footprint, ensuring your professional photos stay focused on your celebration, not our gear.
          </PolicyRow>
        </Section>

        {/* What's Included */}
        <Section eyebrow="Package" title="What's Included in Every Celebration">
          {[
            ['Full Day Coverage', 'Ceremony, Cocktail Hour, Dinner, and Reception.'],
            ['Design Consultations', 'Collaborative sessions to plan your custom lighting and music.'],
            ['Two Independent Sound Systems', 'Dedicated setups for the ceremony and the dance floor.'],
            ['Dual-Channel Shure Microphones', 'Choice of handheld or lapel mics for speeches and vows.'],
            ['Professional MC & Performance', 'Expertly handled announcements to keep the evening on track.'],
            ['Bespoke Visuals', 'Handcrafted furniture and custom-programmed dance floor lighting.'],
          ].map(([label, desc]) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <p style={{ margin: '0 0 2px', fontFamily: DISPLAY, fontWeight: 400, color: CREAM, fontSize: 14 }}>{label}</p>
              <p style={{ margin: 0, fontSize: 13, fontFamily: BODY, color: 'rgba(245,239,224,0.65)' }}>{desc}</p>
            </div>
          ))}
        </Section>

        {/* Investment & Availability */}
        <Section eyebrow="Investment & Availability" title="Simple, Transparent Pricing">
          <p style={{ marginTop: 0 }}>We offer simple, transparent pricing based on the day of your celebration.</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', margin: '16px 0' }}>
            <thead>
              <tr style={{ background: NAVY }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontFamily: UI_FONT, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(245,239,224,0.5)' }}>Day of the Week</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Investment</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Saturdays (Prime Time)', '$1,500'],
                ['Fridays & Thursdays', '$1,400'],
                ['Monday – Wednesday', '$1,200'],
              ].map(([day, price], i) => (
                <tr key={day} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: BODY, color: 'rgba(245,239,224,0.8)' }}>{day}</td>
                  <td style={{ padding: '12px 16px', fontSize: 15, fontWeight: 700, color: BLUE, textAlign: 'right' }}>{price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Travel */}
        <Section eyebrow="Logistics" title="Travel & Service Area">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            {[
              { range: 'Within 60 miles', fee: 'Free', note: 'of Provo, UT' },
              { range: '60+ miles', fee: 'Consult', note: 'fee discussed during consultation' },
            ].map(({ range, fee, note }) => (
              <div key={range} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 18, textAlign: 'center' }}>
                <p style={{ margin: '0 0 6px', fontSize: 11, fontFamily: UI_FONT, letterSpacing: '1px', color: 'rgba(245,239,224,0.35)' }}>{range}</p>
                <p style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: BLUE }}>{fee}</p>
                <p style={{ margin: 0, fontSize: 11, fontFamily: BODY, color: 'rgba(245,239,224,0.3)', fontStyle: 'italic' }}>{note}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Payment Terms */}
        <Section eyebrow="Financials" title="Payment Terms">
          <PolicyRow label="Accepted Payment Methods">Venmo, PayPal, CashApp, or check. Cash and trade payments are not accepted.</PolicyRow>
          <PolicyRow label="Deposit">A non-refundable deposit is required to secure your date. The remaining balance is due before the event.</PolicyRow>
          <PolicyRow label="Late Payments">If payments are not received by their due dates, Pescadero Music reserves the right to apply late fees or cancel the booking without refund of the deposit.</PolicyRow>
        </Section>

        {/* Cancellations */}
        <Section eyebrow="Policies" title="Cancellations & Refunds">
          <PolicyRow label="Deposit">The deposit is non-refundable under all circumstances, except where Pescadero Music is unable to fulfill the agreed service — in which case a full refund of all payments is issued.</PolicyRow>
          <PolicyRow label="Final Payment Refund Schedule">
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
              <thead><tr style={{ background: NAVY }}><th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>Window</th><th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>Refunded</th></tr></thead>
              <tbody>
                {[['14 days – 72 hours before event','100%'],['72 – 24 hours before event','80%'],['Less than 24 hours','50%']].map(([w,r],i) => (
                  <tr key={w} style={{ background: i%2===0?'rgba(255,255,255,0.03)':'rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontFamily: BODY, color: 'rgba(245,239,224,0.75)' }}>{w}</td>
                    <td style={{ padding: '9px 12px', fontSize: 13, fontWeight: 700, color: BLUE, textAlign: 'right' }}>{r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PolicyRow>
        </Section>

        {/* Rescheduling */}
        <Section eyebrow="Policies" title="Rescheduling">
          <p style={{ marginTop: 0 }}>Events may be rescheduled between 14 days and 24 hours before the event with minimal or no additional fees, subject to availability. Pescadero Music reserves the right to decline rescheduling requests based on availability, in which case the final payment is refunded in full. The deposit is not refunded in rescheduling scenarios unless Pescadero Music is unable to accommodate the new date.</p>
        </Section>

        {/* Equipment */}
        <Section eyebrow="Policies" title="Equipment Policy">
          <p style={{ marginTop: 0 }}>All sound operations remain under the exclusive supervision and control of the Pescadero Music technician at all times. Equipment is not rented out or left unattended. Damage or tampering by anyone other than the on-site technician will result in financial liability for the responsible party.</p>
          <p>For outdoor events, the client is responsible for providing a safe, covered, weather-appropriate setup area for all audio equipment. If weather or environmental conditions create a risk to people or equipment, Pescadero Music reserves the right to pause, relocate, or take protective measures.</p>
        </Section>

        {/* Planning Deadline */}
        <Section eyebrow="Planning" title="Planning Deadline & Vendor Coordination">
          <PolicyRow label="14-Day Deadline">All major event details are due no later than 14 days before your event. This includes your timeline, music preferences, vendor contacts, introductions, and any special requests.</PolicyRow>
          <PolicyRow label="Vendor Coordination">Pescadero Music works cooperatively with all event vendors. We are not responsible for managing or supervising third-party vendors unless specifically contracted to do so.</PolicyRow>
        </Section>

        {/* Music */}
        <Section eyebrow="Music" title="Playlist & Content Policy">
          <p style={{ marginTop: 0 }}>All playlists are curated in collaboration with the hiring party — your input and song selections guide what gets played. As a general rule, Pescadero Music steers away from explicit music. If you have specific preferences or questions around content, bring them up during your consultation and we'll find the right fit together.</p>
        </Section>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(68,190,199,0.12)', paddingTop: 32, textAlign: 'center', marginTop: 16 }}>
          <p style={{ margin: '0 0 6px', fontFamily: DISPLAY, fontSize: 20, fontWeight: 300, color: CREAM }}>Thank you for choosing Pescadero Music.</p>
          <p style={{ margin: '0 0 20px', fontSize: 13, fontFamily: BODY, color: 'rgba(245,239,224,0.35)' }}>We look forward to making your event a success.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:garrett@pescaderomusic.com" style={{ fontSize: 12, color: BLUE, textDecoration: 'none' }}>garrett@pescaderomusic.com</a>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
            <a href="tel:2107279328" style={{ fontSize: 12, color: BLUE, textDecoration: 'none' }}>(210) 727-9328</a>
          </div>
          <div style={{ marginTop: 20 }} className="no-print">
            <Link href="/inquiry" style={{ display: 'inline-block', padding: '11px 28px', borderRadius: 8, background: RED, color: 'white', textDecoration: 'none', fontSize: 13, fontFamily: UI_FONT, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 500 }}>
              Ready to Book? Submit an Inquiry →
            </Link>
          </div>
        </div>
      </div>
      <style>{`@media print { .no-print { display: none !important; } nav { display: none !important; } }`}</style>
    </div>
  )
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  const BLUE = '#44BEC7'; const RED = '#C8202A'
  const CREAM = '#F5EFE0'; const DISPLAY = "'freight-display-pro', Georgia, serif"; const UI_FONT = "'futura-pt-condensed', 'Barlow Condensed', sans-serif"; const BODY = "'inter', system-ui, sans-serif"
  return (
    <div style={{ marginBottom: 44 }}>
      <p style={{ margin: '0 0 6px', fontSize: 10, fontFamily: UI_FONT, fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>{eyebrow}</p>
      <h2 style={{ margin: '0 0 16px', fontFamily: DISPLAY, fontSize: 28, color: CREAM, fontWeight: 300, borderBottom: `2px solid ${RED}`, paddingBottom: 8 }}>{title}</h2>
      <div style={{ fontSize: 13, fontFamily: BODY, color: 'rgba(245,239,224,0.7)', lineHeight: 1.8 }}>{children}</div>
    </div>
  )
}

function PolicyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ margin: '0 0 4px', fontFamily: DISPLAY, fontWeight: 400, color: CREAM, fontSize: 14 }}>{label}</p>
      <div style={{ fontSize: 13, fontFamily: BODY, color: 'rgba(245,239,224,0.65)', lineHeight: 1.7 }}>{children}</div>
    </div>
  )
}
