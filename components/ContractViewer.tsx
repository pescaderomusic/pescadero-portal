'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAVY  = '#0D1B2A'
const BLUE  = '#44BEC7'
const RED   = '#D62828'
const GREEN = '#4CAF50'
const CREAM = '#F5EFE0'

export default function ContractViewer() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSig,    setHasSig]    = useState(false)

  const [contract,     setContract]     = useState<any>(null)
  const [garrettSig,   setGarrettSig]   = useState<string | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [submitting,   setSubmitting]   = useState(false)
  const [signed,       setSigned]       = useState(false)
  const [error,        setError]        = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }

      const [{ data: c }, { data: s }] = await Promise.all([
        supabase.from('contracts').select('*').eq('client_id', user.id).single(),
        supabase.from('admin_settings').select('value').eq('key', 'garrett_signature').single(),
      ])

      setContract(c)
      setGarrettSig(s?.value || null)
      if (c?.status === 'signed' || c?.status === 'client_signed') setSigned(true)
      setLoading(false)
    })
  }, [router])

  // ── Signature pad ──────────────────────────────────────────────
  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const { x, y } = getPos(e, canvas)
    ctx.beginPath(); ctx.moveTo(x, y)
    setIsDrawing(true)
    e.preventDefault()
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const { x, y } = getPos(e, canvas)
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = NAVY
    ctx.lineTo(x, y); ctx.stroke()
    setHasSig(true)
    e.preventDefault()
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

    // Redirect to deposit payment
    const res = await fetch('/api/stripe/create-checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contractId: contract.id, type: 'deposit' }),
    })

    const { url, error: stripeErr } = await res.json()
    if (stripeErr || !url) {
      setError('Payment setup failed. Please contact Garrett.')
      setSubmitting(false)
      return
    }
    window.location.href = url
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Poppins, sans-serif' }}>Loading your contract…</p>
    </div>
  )

  if (!contract) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Your contract isn't ready yet. Garrett will send it soon.</p>
        <button onClick={() => router.push('/dashboard')} style={{ padding: '10px 24px', borderRadius: 8, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>← Dashboard</button>
      </div>
    </div>
  )

  const fmtDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const eventDate = contract.event_date ? fmtDate(contract.event_date) : null
  const signedDate = contract.client_signed_at ? new Date(contract.client_signed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null

  return (
    <div style={{ minHeight: '100vh', background: '#f0ebe3', fontFamily: 'Poppins, sans-serif' }}>

      {/* Nav */}
      <div style={{ background: NAVY, padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>← Dashboard</button>
        <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 16, color: 'white' }}>Pescadero Music</span>
        <div style={{ width: 80 }} />
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 32px rgba(0,0,0,0.12)' }}>

          {/* Contract Header */}
          <div style={{ background: NAVY, padding: '32px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 22, fontWeight: 700, color: 'white' }}>Pescadero Music</p>
                <p style={{ margin: 0, fontSize: 12, color: BLUE }}>Service Agreement</p>
              </div>
              {signed && (
                <div style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.3)' }}>
                  <span style={{ fontSize: 12, color: GREEN, fontWeight: 700 }}>✓ Signed & Deposited</span>
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

            {/* Parties */}
            <section style={{ marginBottom: 32 }}>
              <SectionHeader>Parties</SectionHeader>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <InfoCard title="Service Provider">
                  <p style={infoLine}><strong>Garrett Eldredge</strong></p>
                  <p style={infoLine}>Pescadero Music</p>
                  <p style={infoLine}>garrett@pescaderomusic.com</p>
                  <p style={infoLine}>(210) 727-9328</p>
                </InfoCard>
                <InfoCard title="Client">
                  <p style={infoLine}><strong>{contract.client_name || 'Client'}</strong></p>
                  {contract.couple_names && <p style={infoLine}>{contract.couple_names}</p>}
                  {contract.client_email && <p style={infoLine}>{contract.client_email}</p>}
                  {contract.client_phone && <p style={infoLine}>{contract.client_phone}</p>}
                </InfoCard>
              </div>
            </section>

            {/* Event Details */}
            {(contract.event_date || contract.venue_name) && (
              <section style={{ marginBottom: 32 }}>
                <SectionHeader>Event Details</SectionHeader>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  {[
                    ['Event Date', eventDate],
                    ['Venue', contract.venue_name],
                    ['Address', contract.venue_address],
                    ['Attendance', contract.attendance],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k as string}>
                      <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, color: '#8A9EAA', textTransform: 'uppercase', letterSpacing: '1px' }}>{k}</p>
                      <p style={{ margin: 0, fontSize: 13, color: '#1A2D3F' }}>{v}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* What's Included */}
            <section style={{ marginBottom: 32 }}>
              <SectionHeader>The All-Inclusive Premium Experience</SectionHeader>
              <p style={{ margin: '0 0 16px', fontSize: 13, color: '#4A5E6E', lineHeight: 1.7 }}>
                This agreement covers the complete Pescadero Music premium experience. All of the following services are included in your investment — no add-ons, no hidden fees.
              </p>
              <div style={{ background: '#f8f5f0', borderRadius: 10, padding: '18px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    ['Full Day Coverage', 'Ceremony, Cocktail Hour, Dinner & Reception'],
                    ['Design Consultations', 'Collaborative sessions for custom lighting & music planning'],
                    ['Two Independent Sound Systems', 'Dedicated setups for ceremony and dance floor'],
                    ['Dual-Channel Professional Microphones', 'Handheld or lapel options for speeches and vows'],
                    ['Professional MC & Performance', 'Expert announcements and event flow management'],
                    ['Bespoke Visuals', 'Handcrafted DJ furniture + dance floor lighting'],
                  ].map(([title, desc]) => (
                    <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ color: BLUE, fontWeight: 700, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1A2D3F' }}>{title}</span>
                        <span style={{ fontSize: 13, color: '#6A7E8E' }}> — {desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 12, color: '#8A9EAA', lineHeight: 1.6 }}>
                Travel is included within 60 miles of Provo, UT. Any travel beyond 60 miles will be noted as a travel fee below.
              </p>
            </section>

            {/* Investment */}
            <section style={{ marginBottom: 32 }}>
              <SectionHeader>Investment</SectionHeader>
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
                  <span style={{ fontSize: 13, color: '#4A5E6E' }}>Deposit (due now)</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: RED }}>${Number(contract.deposit_amount || 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 18px', background: 'rgba(214,40,40,0.04)', borderTop: '1px solid rgba(214,40,40,0.1)' }}>
                  <span style={{ fontSize: 13, color: '#4A5E6E' }}>Final Payment (due after planning form)</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1A2D3F' }}>${Number(contract.final_payment_amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </section>

            {/* Special Notes */}
            {contract.special_notes && (
              <section style={{ marginBottom: 32 }}>
                <SectionHeader>Special Notes</SectionHeader>
                <div style={{ background: '#f8f5f0', borderRadius: 8, padding: '14px 18px', borderLeft: `3px solid ${BLUE}` }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#4A5E6E', lineHeight: 1.7 }}>{contract.special_notes}</p>
                </div>
              </section>
            )}

            {/* Terms */}
            <section style={{ marginBottom: 32 }}>
              <SectionHeader>Terms & Conditions</SectionHeader>
              <div style={{ fontSize: 12, color: '#6A7E8E', lineHeight: 1.8 }}>
                <p style={{ margin: '0 0 8px' }}>1. <strong>Deposit & Cancellation:</strong> The deposit is non-refundable and secures your event date. Cancellations made less than 60 days before the event forfeit the full deposit. Cancellations made more than 60 days prior may receive a partial refund at Garrett's discretion.</p>
                <p style={{ margin: '0 0 8px' }}>2. <strong>Final Payment:</strong> The remaining balance is due in full prior to the event date. Garrett will send a final payment link after the planning form is submitted.</p>
                <p style={{ margin: '0 0 8px' }}>3. <strong>Event Changes:</strong> Any significant changes to the event scope (venue change, date change, etc.) must be communicated at least 30 days in advance and may be subject to an updated agreement.</p>
                <p style={{ margin: '0 0 8px' }}>4. <strong>Force Majeure:</strong> In the event of circumstances beyond either party's control (extreme weather, natural disaster, etc.), both parties will work together in good faith to reschedule or find a solution.</p>
                <p style={{ margin: 0 }}>5. <strong>Service Policy:</strong> The full Pescadero Music Service Policy is incorporated by reference into this agreement. By signing below, you confirm you have read and agree to the Service Policy.</p>
              </div>
            </section>

            {/* Signatures */}
            <section style={{ marginBottom: signed ? 0 : 32 }}>
              <SectionHeader>Signatures</SectionHeader>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

                {/* Garrett's signature */}
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#8A9EAA', textTransform: 'uppercase', letterSpacing: '1px' }}>Garrett Eldredge</p>
                  <div style={{ height: 80, border: '1.5px solid #DDD3BC', borderRadius: 8, background: '#faf7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {garrettSig
                      ? <img src={garrettSig} alt="Garrett's signature" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                      : <p style={{ fontSize: 12, color: '#C0B9AD', fontStyle: 'italic' }}>Garrett Eldredge</p>
                    }
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#B0A898' }}>Pescadero Music — Service Provider</p>
                </div>

                {/* Client signature */}
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#8A9EAA', textTransform: 'uppercase', letterSpacing: '1px' }}>Client Signature</p>
                  {signed ? (
                    <div style={{ height: 80, border: '1.5px solid #DDD3BC', borderRadius: 8, background: '#faf7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {contract.client_signature
                        ? <img src={contract.client_signature} alt="Client signature" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                        : <span style={{ color: '#8A9EAA', fontStyle: 'italic', fontSize: 14 }}>✓ Signed</span>
                      }
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
                  {signed && signedDate && (
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: '#B0A898' }}>Signed {signedDate}</p>
                  )}
                </div>

              </div>
            </section>

            {/* Sign & Pay CTA */}
            {!signed && (
              <div>
                {error && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(214,40,40,0.08)', border: '1px solid rgba(214,40,40,0.2)', color: RED, fontSize: 13, marginBottom: 16 }}>{error}</div>
                )}
                <div style={{ background: '#faf7f3', border: '1.5px solid #DDD3BC', borderRadius: 10, padding: '16px 20px', marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 12, color: '#6A7E8E', lineHeight: 1.6 }}>
                    By clicking below, you confirm you have read and agree to the terms of this service agreement. You will be directed to a secure payment page to submit your <strong>${Number(contract.deposit_amount || 0).toFixed(2)} deposit</strong>, which secures your event date.
                  </p>
                </div>
                <button onClick={handleSign} disabled={submitting} style={{ width: '100%', padding: '15px', borderRadius: 10, border: 'none', background: submitting ? 'rgba(214,40,40,0.5)' : RED, color: 'white', fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: submitting ? 'none' : '0 6px 24px rgba(214,40,40,0.3)' }}>
                  {submitting ? 'Processing…' : `Sign & Pay $${Number(contract.deposit_amount || 0).toFixed(2)} Deposit →`}
                </button>
              </div>
            )}

            {signed && (
              <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 20, background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.2)' }}>
                  <span style={{ color: GREEN, fontSize: 16 }}>✓</span>
                  <span style={{ fontSize: 13, color: GREEN, fontWeight: 700 }}>Signed & deposit paid — your date is secured!</span>
                </div>
                <div style={{ marginTop: 16 }}>
                  <button onClick={() => router.push('/dashboard')} style={{ padding: '10px 24px', borderRadius: 9, background: 'rgba(13,27,42,0.08)', border: '1px solid rgba(13,27,42,0.12)', color: '#4A5E6E', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

const infoLine: React.CSSProperties = { margin: '0 0 2px', fontSize: 13, color: '#1A2D3F' }

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0D1B2A', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{children}</h3>
      <div style={{ flex: 1, height: 1, background: '#EAE0CC' }} />
    </div>
  )
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#f8f5f0', borderRadius: 8, padding: '14px 16px' }}>
      <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, color: '#8A9EAA', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</p>
      {children}
    </div>
  )
}
