'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAVY  = '#07111A'
const BLUE  = '#44BEC7'
const RED   = '#C8202A'
const GREEN    = '#4CAF50'
const CREAM    = '#F5EFE0'
const UI_FONT  = "'futura-pt-condensed', 'Barlow Condensed', sans-serif"
const BODY     = "'inter', system-ui, sans-serif"
const WORDMARK = "'RetroFloral', 'Barlow Condensed', sans-serif"

export default function ContractViewer() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSig,    setHasSig]    = useState(false)
  const [contract,   setContract]   = useState<any>(null)
  const [garrettSig, setGarrettSig] = useState<string | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [signed,     setSigned]     = useState(false)
  const [error,      setError]      = useState('')
  const [userEmail,  setUserEmail]  = useState('')
  const [profile,    setProfile]    = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      const [{ data: c }, { data: s }, { data: p }] = await Promise.all([
        supabase.from('contracts').select('*').eq('client_id', user.id).single(),
        supabase.from('admin_settings').select('value').eq('key', 'garrett_signature').single(),
        supabase.from('profiles').select('full_name, phone').eq('id', user.id).single(),
      ])
      setContract(c)
      setGarrettSig(s?.value || null)
      setProfile(p)
      setUserEmail(user.email || '')
      if (c?.status === 'signed' || c?.status === 'client_signed') setSigned(true)
      setLoading(false)
    })
  }, [router])

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const { x, y } = getPos(e, canvas)
    ctx.beginPath(); ctx.moveTo(x, y)
    setIsDrawing(true); e.preventDefault()
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const { x, y } = getPos(e, canvas)
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = NAVY
    ctx.lineTo(x, y); ctx.stroke()
    setHasSig(true); e.preventDefault()
  }

  const stopDraw = () => setIsDrawing(false)

  const clearSig = () => {
    const canvas = canvasRef.current; if (!canvas) return
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
    setHasSig(false)
  }

  const handleSign = async () => {
    if (!hasSig) { setError('Please sign above before continuing.'); return }
    const canvas = canvasRef.current; if (!canvas) return
    const sigData = canvas.toDataURL('image/png')
    setSubmitting(true); setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('contracts').update({
      client_signature: sigData,
      client_signed_at: new Date().toISOString(),
      status: 'client_signed',
    }).eq('client_id', user.id)
    await supabase.from('bookings').update({ step_contract: 'client_signed' }).eq('client_id', user.id)
    window.location.href = '/contract/payment'
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(245,239,224,0.3)', fontFamily: BODY }}>Loading your contract...</p>
    </div>
  )

  if (!contract) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BODY }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Your contract is not ready yet. Garrett will send it soon.</p>
        <button onClick={() => router.push('/dashboard')} style={{ padding: '10px 24px', borderRadius: 8, background: 'rgba(245,239,224,0.07)', color: 'rgba(245,239,224,0.4)', border: 'none', cursor: 'pointer', fontFamily: UI_FONT, letterSpacing: '1.5px', textTransform: 'uppercase' as const }}>Back to Dashboard</button>
      </div>
    </div>
  )

  const fmtDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const eventDate  = contract.event_date       ? fmtDate(contract.event_date) : null
  const signedDate = contract.client_signed_at ? new Date(contract.client_signed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null

  return (
    <div style={{ minHeight: '100vh', background: '#f0ebe3', fontFamily: BODY }}>

      <div style={{ background: NAVY, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: 'rgba(245,239,224,0.35)', fontSize: 12, fontFamily: UI_FONT, letterSpacing: '1.5px', textTransform: 'uppercase' as const, cursor: 'pointer' }}>Back to Dashboard</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="https://shxcw5yjydy1kgql.public.blob.vercel-storage.com/logo.png" alt="Pescadero Music" style={{ height: 28, width: 28, objectFit: 'contain' }} /><span style={{ fontFamily: WORDMARK, fontSize: 14, letterSpacing: '3px', color: CREAM, textTransform: 'uppercase' }}>Pescadero Music</span></div>
        <div style={{ width: 120 }} />
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 32px rgba(0,0,0,0.12)' }}>

          <div style={{ background: NAVY, padding: '32px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontFamily: WORDMARK, fontSize: 20, letterSpacing: '3px', textTransform: 'uppercase', color: CREAM }}>Pescadero Music</p>
                <p style={{ margin: 0, fontSize: 12, color: BLUE }}>Wedding Sound Service Agreement</p>
              </div>
              {signed && (
                <div style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.3)' }}>
                  <span style={{ fontSize: 12, color: GREEN, fontWeight: 700 }}>Signed and Deposited</span>
                </div>
              )}
            </div>
            {contract.garrett_message && (
              <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, borderLeft: `3px solid ${BLUE}` }}>
                <p style={{ margin: '0 0 2px', fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Message from Garrett</p>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{contract.garrett_message}</p>
              </div>
            )}
          </div>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${BLUE}, ${RED})` }} />

          <div style={{ padding: '36px 40px' }}>

            <section style={{ marginBottom: 32 }}>
              <SH>Parties</SH>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <IC title="Service Provider">
                  <p style={il}><strong>Garrett Eldredge</strong></p>
                  <p style={il}>Pescadero Music</p>
                  <p style={il}>garrett@pescaderomusic.com</p>
                  <p style={il}>(210) 727-9328</p>
                </IC>
                <IC title="Client">
                  <p style={il}><strong>{profile?.full_name || contract.client_name || 'Client'}</strong></p>
                  {contract.couple_names && <p style={il}>{contract.couple_names}</p>}
                  <p style={il}>{userEmail}</p>
                  {profile?.phone && <p style={il}>{profile.phone}</p>}
                </IC>
              </div>
            </section>

            {(contract.event_date || contract.venue_name) && (
              <section style={{ marginBottom: 32 }}>
                <SH>Event Details</SH>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  {[['Event Date', eventDate], ['Venue', contract.venue_name], ['Address', contract.venue_address], ['Attendance', contract.attendance]].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k as string}>
                      <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: '#8A9EAA', textTransform: 'uppercase', letterSpacing: '1px' }}>{k}</p>
                      <p style={{ margin: 0, fontSize: 13, color: '#1A2D3F' }}>{v}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section style={{ marginBottom: 32 }}>
              <SH>The All-Inclusive Premium Experience</SH>
              <p style={bt}>This agreement covers the complete Pescadero Music premium experience. All of the following services are included in your investment — no add-ons, no hidden fees.</p>
              <div style={{ background: '#f8f5f0', borderRadius: 10, padding: '18px 20px', marginBottom: 12 }}>
                {[
                  ['Full Day Coverage', 'Ceremony, Cocktail Hour, Dinner & Reception'],
                  ['Design Consultations', 'Collaborative sessions for custom lighting & music planning'],
                  ['Two Independent Sound Systems', 'Dedicated setups for ceremony and dance floor'],
                  ['Dual-Channel Professional Microphones', 'Handheld or lapel options for speeches and vows'],
                  ['Professional MC & Performance', 'Expert announcements and event flow management'],
                  ['Bespoke Visuals', 'Handcrafted DJ furniture + dance floor lighting'],
                ].map(([title, desc]) => (
                  <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{ color: BLUE, fontWeight: 700, fontSize: 14, flexShrink: 0, marginTop: 1 }}>&#10003;</span>
                    <div><span style={{ fontSize: 13, fontWeight: 700, color: '#1A2D3F' }}>{title}</span><span style={{ fontSize: 13, color: '#6A7E8E' }}> — {desc}</span></div>
                  </div>
                ))}
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#8A9EAA', lineHeight: 1.6 }}>Travel is included within 60 miles of Provo, UT. Any travel beyond 60 miles will be noted as a travel fee in the payment schedule below.
              <p style={{ margin: '10px 0 0', fontSize: 12, color: '#8A9EAA', lineHeight: 1.6, fontStyle: 'italic' }}>These services can be tailored to your specific event. Some celebrations may not require every element — we will work through the details together during your consultation.</p></p>
            </section>

            <section style={{ marginBottom: 32 }}>
              <SH>Rates & Payment Schedule</SH>
              <div style={{ border: '1.5px solid #EAE0CC', borderRadius: 10, overflow: 'hidden' }}>
                {[
                  ['The All-Inclusive Premium Experience', `$${Number(contract.package_price || 0).toFixed(2)}`],
                  Number(contract.travel_fee) > 0 ? ['Travel Fee', `$${Number(contract.travel_fee).toFixed(2)}`] : null,
                  Number(contract.sales_tax_rate) > 0 ? [`Sales Tax (${contract.sales_tax_rate}%)`, `$${Number(contract.sales_tax_amount || 0).toFixed(2)}`] : null,
                ].filter(Boolean).map((row, i, arr) => (
                  <div key={row![0]} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 18px', borderBottom: i < arr.length - 1 ? '1px solid #EAE0CC' : 'none' }}>
                    <span style={{ fontSize: 14, color: '#1A2D3F' }}>{row![0]}</span>
                    <span style={{ fontSize: 14, color: '#1A2D3F', fontWeight: 600 }}>{row![1]}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', background: '#f8f5f0', borderTop: '2px solid #DDD3BC' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0D1B2A' }}>Total Due</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: BLUE }}>${Number(contract.total_due || 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 18px', background: 'rgba(214,40,40,0.04)' }}>
                  <span style={{ fontSize: 13, color: '#4A5E6E' }}>Deposit (due now — non-refundable)</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: RED }}>${Number(contract.deposit_amount || 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 18px', background: 'rgba(214,40,40,0.04)', borderTop: '1px solid rgba(214,40,40,0.1)' }}>
                  <span style={{ fontSize: 13, color: '#4A5E6E' }}>Final Payment (due after planning form)</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1A2D3F' }}>${Number(contract.final_payment_amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </section>

            {Number(contract.sales_tax_rate) > 0 && (
              <section style={{ marginBottom: 32 }}>
                <SH>Sales Tax</SH>
                <p style={{ ...bt, margin: 0 }}>In accordance with applicable state and local tax regulations, sales tax may be required on services rendered by Pescadero Music. Where applicable, the tax rate is calculated based on the total service amount and itemized in the payment schedule above. Sales tax must be paid in full as part of the final payment. If you have questions about the tax rate applied to your booking, do not hesitate to ask.</p>
              </section>
            )}

            <section style={{ marginBottom: 32 }}>
              <SH>Playlist & Program Consultation</SH>
              <p style={bt}>After your booking is confirmed, Garrett will reach out to schedule a consultation to go over your playlist and the order of events. All playlists are curated in collaboration with you — your input and song selections guide everything that gets played.</p>
              <p style={{ ...bt, margin: 0 }}>As a general rule, Pescadero Music steers away from explicit content. If you have specific preferences or questions around music content, please bring them up during your consultation and we will find the right fit together.</p>
            </section>

            <section style={{ marginBottom: 32 }}>
              <SH>Final Planning Deadline</SH>
              <p style={bt}>To give your event the preparation it deserves, all major event details are due no later than 7 days before your event date, unless otherwise agreed upon in writing. This includes:</p>
              <div style={{ background: '#f8f5f0', borderRadius: 8, padding: '14px 18px', marginBottom: 12 }}>
                {['Event timeline and schedule of moments', 'Venue address(es) and ceremony/reception layout', 'Music preferences, must-plays, and do-not-plays', 'Introductions, special announcements, and dedications', 'Vendor contacts (photographer, planner, catering, etc.)', 'Any other special requests or considerations'].map(item => (
                  <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 6 }}>
                    <span style={{ color: BLUE, fontWeight: 700, flexShrink: 0, fontSize: 13 }}>—</span>
                    <span style={{ fontSize: 13, color: '#4A5E6E', lineHeight: 1.6 }}>{item}</span>
                  </div>
                ))}
              </div>
              <p style={{ ...bt, margin: 0 }}>Your event details will be submitted via the Event Planning Form, accessible through your step tracker dashboard. Last-minute changes are always welcome when timing allows — we will do our best to accommodate.</p>
            </section>

            <section style={{ marginBottom: 32 }}>
              <SH>Venue Logistics, Site Readiness & Power</SH>
              <p style={bt}>To ensure a seamless setup, the client is responsible for providing accurate venue logistics in advance, including setup location, load-in access, stair or elevator availability, indoor/outdoor placement, power outlet locations, and any venue-specific sound restrictions or requirements.</p>
              <p style={bt}>The client and/or venue agrees to provide safe, reliable, grounded electrical power reasonably near the setup area, along with timely access for setup and teardown. Any delays or performance issues resulting from unavailable power or restricted access are outside the responsibility of Pescadero Music.</p>
              <p style={{ ...bt, margin: 0 }}>If setup location has not been finalized prior to the event, or if conflicting instructions are received, Pescadero Music may use professional judgment to determine the most suitable placement based on safety, acoustics, workflow efficiency, and venue guidelines. A pre-event site walkthrough is available upon request — just ask during your planning call.</p>
            </section>

            <section style={{ marginBottom: 32 }}>
              <SH>Equipment Policy</SH>
              <p style={{ ...bt, margin: 0 }}>All sound operations will remain under the supervision and control of the Pescadero Music technician at all times. Pescadero Music does not rent out or leave equipment unattended. Any damage or tampering by individuals other than the on-site technician will result in financial liability for the responsible parties.</p>
            </section>

            <section style={{ marginBottom: 32 }}>
              <SH>Vendor Coordination</SH>
              <p style={bt}>Pescadero Music is committed to working professionally and cooperatively with all event vendors — including venue staff, photographers, videographers, planners, and caterers. We believe a great event is a team effort and we show up ready to collaborate.</p>
              <p style={{ ...bt, margin: 0 }}>Please note that while we coordinate closely with your team, Pescadero Music is not responsible for managing or supervising third-party vendors unless specifically contracted to do so. We recommend designating a coordinator or planner as the central point of contact for vendor logistics.</p>
            </section>

            <section style={{ marginBottom: 32 }}>
              <SH>Designated Day-of Contact</SH>
              <p style={{ ...bt, margin: 0 }}>The client is responsible for designating a day-of contact — a person who will be on-site and reachable during the event to coordinate with the Pescadero Music technician on logistics, setup, and any real-time decisions. This person's name, phone number, and role should be submitted via the planning form prior to the event.</p>
            </section>

            {contract.special_notes && (
              <section style={{ marginBottom: 32 }}>
                <SH>Special Notes</SH>
                <div style={{ background: '#f8f5f0', borderRadius: 8, padding: '14px 18px', borderLeft: `3px solid ${BLUE}` }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#4A5E6E', lineHeight: 1.7 }}>{contract.special_notes}</p>
                </div>
              </section>
            )}

            <section style={{ marginBottom: 32 }}>
              <SH>Terms & Conditions</SH>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 12, color: '#6A7E8E', lineHeight: 1.8 }}>
                <div><strong style={{ color: '#1A2D3F' }}>1. Deposit:</strong> The deposit is non-refundable under all circumstances and is required to secure your event date. No date is held without a paid deposit. The sole exception is in the event that Pescadero Music must cancel and is unable to fulfill the agreed service — in which case the deposit will be refunded in full and the client will be notified as soon as possible.</div>
                <div>
                  <strong style={{ color: '#1A2D3F' }}>2. Final Payment & Cancellation:</strong> The remaining balance is due after the planning form is submitted. In the event of cancellation, the following refund schedule applies to the final payment only — the deposit is never refunded:
                  <div style={{ background: '#f8f5f0', borderRadius: 8, overflow: 'hidden', marginTop: 10 }}>
                    {[['14 days – 72 hours before event', '100% refund'], ['72 – 24 hours before event', '80% refund'], ['Less than 24 hours before event', '50% refund']].map(([w, r], i) => (
                      <div key={w} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: i < 2 ? '1px solid #EAE0CC' : 'none' }}>
                        <span>{w}</span><span style={{ fontWeight: 700, color: '#1A2D3F' }}>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div><strong style={{ color: '#1A2D3F' }}>3. Rescheduling:</strong> Events may be rescheduled between 14 days and 24 hours before the event with minimal or no additional fees, subject to availability. Pescadero Music reserves the right to decline rescheduling requests based on availability, in which case the final payment is refunded in full.</div>
                <div><strong style={{ color: '#1A2D3F' }}>4. Event Changes:</strong> Any significant changes to the event scope — including venue, date, or format — must be communicated at least 14 days in advance and may be subject to an updated agreement.</div>
                <div><strong style={{ color: '#1A2D3F' }}>5. Weather, Safety & Incidents:</strong> For outdoor events, the client is responsible for providing a safe, covered, weather-appropriate setup area for all audio equipment. If weather or environmental conditions create a risk to people or equipment, Pescadero Music reserves the right to pause, relocate, or take protective measures. Pescadero Music is not responsible for injuries or damages resulting from unauthorized use of or interference with equipment. Safety concerns during the event should be directed to the on-site technician.</div>
                <div><strong style={{ color: '#1A2D3F' }}>6. Force Majeure:</strong> In the event of circumstances beyond either party's control, both parties will work together in good faith to reschedule or find a resolution.</div>
                <div><strong style={{ color: '#1A2D3F' }}>7. Governing Agreement:</strong> The full Pescadero Music Service Policy is incorporated by reference into this agreement. By signing below, you confirm you have read and agree to all terms outlined in this document. This contract becomes binding upon receipt of the signed document and deposit payment.</div>
              </div>
            </section>

            <section style={{ marginBottom: signed ? 0 : 32 }}>
              <SH>Agreement & Signatures</SH>
              <div style={{ background: '#f8f5f0', borderRadius: 8, padding: '14px 18px', marginBottom: 24, borderLeft: `3px solid ${BLUE}` }}>
                <p style={{ margin: 0, fontSize: 12, color: '#6A7E8E', lineHeight: 1.7 }}>By signing below, both parties confirm they have read and agree to all terms outlined in this agreement. This contract becomes binding upon receipt of the signed document and deposit payment. Pescadero Music is honored to be part of your event and committed to delivering an outstanding experience.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#8A9EAA', textTransform: 'uppercase', letterSpacing: '1px' }}>Garrett Eldredge</p>
                  <div style={{ height: 80, border: '1.5px solid #DDD3BC', borderRadius: 8, background: '#faf7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {garrettSig ? <img src={garrettSig} alt="Garrett signature" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} /> : <p style={{ fontSize: 12, color: '#C0B9AD', fontStyle: 'italic' }}>Garrett Eldredge</p>}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#B0A898' }}>Pescadero Music — Service Provider</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#8A9EAA', textTransform: 'uppercase', letterSpacing: '1px' }}>Client Signature</p>
                  {signed ? (
                    <div style={{ height: 80, border: '1.5px solid #DDD3BC', borderRadius: 8, background: '#faf7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {contract.client_signature ? <img src={contract.client_signature} alt="Client signature" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} /> : <span style={{ color: '#8A9EAA', fontStyle: 'italic', fontSize: 14 }}>Signed</span>}
                    </div>
                  ) : (
                    <div style={{ border: '1.5px solid #DDD3BC', borderRadius: 8, overflow: 'hidden', background: 'white', cursor: 'crosshair' }}>
                      <canvas ref={canvasRef} width={300} height={80} onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw} onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} style={{ display: 'block', width: '100%', height: 80, touchAction: 'none' }} />
                    </div>
                  )}
                  {!signed && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <p style={{ margin: 0, fontSize: 11, color: '#B0A898' }}>Draw your signature above</p>
                      <button onClick={clearSig} style={{ fontSize: 10, color: '#8A9EAA', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Clear</button>
                    </div>
                  )}
                  {signed && signedDate && <p style={{ margin: '4px 0 0', fontSize: 11, color: '#B0A898' }}>Signed {signedDate}</p>}
                </div>
              </div>
            </section>

            {!signed && (
              <div>
                {error && <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(200,32,42,0.08)', border: '1px solid rgba(200,32,42,0.2)', color: RED, fontSize: 13, marginBottom: 16 }}>{error}</div>}
                <div style={{ background: '#faf7f3', border: '1.5px solid #DDD3BC', borderRadius: 10, padding: '16px 20px', marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 12, color: '#6A7E8E', lineHeight: 1.6 }}>Upon submission of this form, you will be directed to a secure Stripe payment page to submit your <strong>${Number(contract.deposit_amount || 0).toFixed(2)} deposit</strong>, which secures your event date. This service agreement is effective as soon as your deposit is received.</p>
                </div>
                <button onClick={handleSign} disabled={submitting} style={{ width: '100%', padding: '15px', borderRadius: 10, border: 'none', background: submitting ? 'rgba(200,32,42,0.5)' : RED, color: 'white', fontSize: 14, fontFamily: UI_FONT, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: submitting ? 'none' : '0 6px 24px rgba(200,32,42,0.3)' }}>
                  {submitting ? 'Processing...' : `Sign & Pay $${Number(contract.deposit_amount || 0).toFixed(2)} Deposit`}
                </button>
              </div>
            )}

            {signed && (
              <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 20, background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.2)' }}>
                  <span style={{ color: GREEN, fontSize: 16 }}>&#10003;</span>
                  <span style={{ fontSize: 13, color: GREEN, fontWeight: 700 }}>Signed and deposit paid — your date is secured!</span>
                </div>
                <div style={{ marginTop: 16 }}>
                  <button onClick={() => router.push('/dashboard')} style={{ padding: '10px 24px', borderRadius: 9, background: 'rgba(13,27,42,0.08)', border: '1px solid rgba(13,27,42,0.12)', color: '#4A5E6E', fontSize: 12, fontFamily: UI_FONT, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer' }}>Back to Dashboard</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

const il: React.CSSProperties = { margin: '0 0 2px', fontSize: 13, color: '#1A2D3F' }
const bt: React.CSSProperties = { margin: '0 0 12px', fontSize: 13, color: '#4A5E6E', lineHeight: 1.75 }

function SH({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <h3 style={{ margin: 0, fontFamily: UI_FONT, fontSize: 13, fontWeight: 500, color: '#07111A', textTransform: 'uppercase', letterSpacing: '2px' }}>{children}</h3>
      <div style={{ flex: 1, height: 1, background: '#EAE0CC' }} />
    </div>
  )
}

function IC({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#f8f5f0', borderRadius: 8, padding: '14px 16px' }}>
      <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, color: '#8A9EAA', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</p>
      {children}
    </div>
  )
}
