'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAVY = '#0D1B2A'
const BLUE = '#44BEC7'
const RED  = '#D62828'
const GREEN = '#4CAF50'

const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 13px', borderRadius: 8,
  border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
  color: 'white', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700,
  letterSpacing: '1.5px', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.4)', marginBottom: 6,
}

export default function ContractEditorPage({ params }: { params: { clientId: string } }) {
  const router  = useRouter()
  const [client,  setClient]  = useState<any>(null)
  const [booking, setBooking] = useState<any>(null)
  const [inquiry, setInquiry] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [sending, setSending] = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  // Contract fields
  const [packagePrice,      setPackagePrice]      = useState('')
  const [travelFee,         setTravelFee]         = useState('0')
  const [depositAmount,     setDepositAmount]      = useState('')
  const [salesTaxRate,      setSalesTaxRate]       = useState('0')
  const [specialNotes,      setSpecialNotes]       = useState('')
  const [garrettMessage,    setGarrettMessage]     = useState('')

  // Derived
  const pkg     = parseFloat(packagePrice)  || 0
  const travel  = parseFloat(travelFee)     || 0
  const taxRate = parseFloat(salesTaxRate)  || 0
  const deposit = parseFloat(depositAmount) || 0

  const subtotal       = pkg + travel
  const salesTaxAmount = subtotal * (taxRate / 100)
  const totalDue       = subtotal + salesTaxAmount
  const finalPayment   = totalDue - deposit

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || user.id !== GARRETT_ID) { router.push('/dashboard'); return }

      Promise.all([
        supabase.from('profiles').select('*').eq('id', params.clientId).single(),
        supabase.from('bookings').select('*').eq('client_id', params.clientId).single(),
        supabase.from('inquiry_submissions').select('*').eq('client_id', params.clientId).single(),
        supabase.from('contracts').select('*').eq('client_id', params.clientId).single(),
      ]).then(([pRes, bRes, iRes, cRes]) => {
        setClient(pRes.data)
        setBooking(bRes.data)
        setInquiry(iRes.data)

        if (cRes.data) {
          const c = cRes.data
          setPackagePrice(c.package_price?.toString() || '')
          setTravelFee(c.travel_fee?.toString() || '0')
          setDepositAmount(c.deposit_amount?.toString() || '')
          setSalesTaxRate(c.sales_tax_rate?.toString() || '0')
          setSpecialNotes(c.special_notes || '')
          setGarrettMessage(c.garrett_message || '')
        } else if (bRes.data?.event_date) {
          // Auto-suggest price based on day of week
          const dow = new Date(bRes.data.event_date + 'T12:00:00').getDay()
          if (dow === 6)      setPackagePrice('1500')
          else if (dow === 5 || dow === 4) setPackagePrice('1400')
          else                setPackagePrice('1200')
          setDepositAmount('500')
        }
        setLoading(false)
      })
    })
  }, [params.clientId, router])

  const save = async () => {
    if (!packagePrice) { setError('Package price is required.'); return }
    setSaving(true); setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('contracts').upsert({
      client_id:            params.clientId,
      booking_id:           booking?.id,
      package_price:        pkg,
      travel_fee:           travel,
      deposit_amount:       deposit,
      final_payment_amount: finalPayment,
      sales_tax_rate:       taxRate,
      sales_tax_amount:     salesTaxAmount,
      total_due:            totalDue,
      special_notes:        specialNotes,
      garrett_message:      garrettMessage,
      status:               'draft',
    }, { onConflict: 'client_id' })

    if (err) { setError('Save failed: ' + err.message); setSaving(false); return }
    setSaved(true); setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const sendToClient = async () => {
    await save()
    setSending(true)
    const supabase = createClient()
    await supabase.from('contracts').update({ status: 'sent' }).eq('client_id', params.clientId)
    await supabase.from('bookings').update({ step_contract: 'sent' }).eq('client_id', params.clientId)

    await fetch('/api/admin/notify-contract-sent', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: params.clientId }),
    }).catch(() => {})

    setSending(false)
    setSent(true)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Poppins, sans-serif' }}>Loading…</p>
    </div>
  )

  const eventDate = booking?.event_date
    ? new Date(booking.event_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : 'Date TBD'
  const dow = booking?.event_date
    ? new Date(booking.event_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })
    : null

  return (
    <div style={{ minHeight: '100vh', background: NAVY, fontFamily: 'Poppins, sans-serif', color: 'white' }}>

      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => router.push(`/admin/client/${params.clientId}`)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          ← {client?.full_name}
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Contract Editor</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={save} disabled={saving} style={{ padding: '8px 18px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Draft'}
          </button>
          <button onClick={sendToClient} disabled={sending || sent} style={{ padding: '8px 20px', borderRadius: 7, border: 'none', background: sent ? GREEN : RED, color: 'white', fontSize: 12, fontWeight: 700, cursor: sending || sent ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {sending ? 'Sending…' : sent ? '✓ Sent to Client' : 'Send to Client'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 840, margin: '0 auto', padding: '36px 24px' }}>

        {error && <div style={{ padding: '10px 16px', borderRadius: 8, background: 'rgba(214,40,40,0.1)', border: '1px solid rgba(214,40,40,0.25)', color: '#ff6b6b', fontSize: 13, marginBottom: 24 }}>{error}</div>}

        {/* Client & Event Info (read-only) */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 24px', marginBottom: 28 }}>
          <p style={{ margin: '0 0 12px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Client & Event</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {[
              ['Client', client?.full_name],
              ['Email', inquiry?.email || '—'],
              ['Phone', client?.phone || inquiry?.phone || '—'],
              ['Couple', inquiry?.couple_names || '—'],
              ['Event Date', eventDate],
              ['Venue', inquiry?.venue_name || '—'],
              ['Address', inquiry?.venue_address || '—'],
              ['Attendance', inquiry?.attendance || '—'],
            ].map(([label, value]) => (
              <div key={label as string}>
                <p style={{ margin: '0 0 2px', fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{value || '—'}</p>
              </div>
            ))}
          </div>
          {dow && (
            <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(68,190,199,0.08)', border: '1px solid rgba(68,190,199,0.15)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: BLUE }}>📅</span>
              <span style={{ fontSize: 12, color: BLUE, fontWeight: 600 }}>
                {dow} — Suggested rate: {dow === 'Saturday' ? '$1,500' : (dow === 'Friday' || dow === 'Thursday') ? '$1,400' : '$1,200'}
              </span>
            </div>
          )}
        </div>

        {/* Inquiry Notes (read-only) */}
        {inquiry?.additional_details && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 20px', marginBottom: 28 }}>
            <p style={{ margin: '0 0 6px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Client's Inquiry Notes</p>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{inquiry.additional_details}</p>
          </div>
        )}

        {/* Investment */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px 24px', marginBottom: 20 }}>
          <p style={{ margin: '0 0 20px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Investment</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px', marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Package Price ($) <span style={{ color: RED }}>*</span></label>
              <input style={inputStyle} type="number" value={packagePrice} onChange={e => setPackagePrice(e.target.value)} placeholder="1500" />
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>Sat $1,500 · Fri/Thu $1,400 · Mon–Wed $1,200</p>
            </div>
            <div>
              <label style={labelStyle}>Travel Fee ($)</label>
              <input style={inputStyle} type="number" value={travelFee} onChange={e => setTravelFee(e.target.value)} placeholder="0" />
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>0 if within 60mi of Provo</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px', marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Deposit Amount ($)</label>
              <input style={inputStyle} type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="500" />
            </div>
            <div>
              <label style={labelStyle}>Sales Tax Rate (%)</label>
              <input style={inputStyle} type="number" value={salesTaxRate} onChange={e => setSalesTaxRate(e.target.value)} placeholder="0" step="0.01" />
            </div>
          </div>

          {/* Totals */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
            {[
              ['Package', `$${pkg.toFixed(2)}`],
              ['Travel Fee', `$${travel.toFixed(2)}`],
              taxRate > 0 ? [`Sales Tax (${taxRate}%)`, `$${salesTaxAmount.toFixed(2)}`] : null,
              ['Total Due', `$${totalDue.toFixed(2)}`],
              ['Deposit', `−$${deposit.toFixed(2)}`],
            ].filter(Boolean).map((row, i) => {
              const isTotal    = row![0] === 'Total Due'
              const isDeposit  = row![0] === 'Deposit'
              const isLast     = row![0] === 'Deposit'
              return (
                <div key={row![0]} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: isTotal ? 14 : 13, color: isTotal ? 'white' : 'rgba(255,255,255,0.45)', fontWeight: isTotal ? 700 : 400 }}>{row![0]}</span>
                  <span style={{ fontSize: isTotal ? 14 : 13, color: isTotal ? BLUE : isDeposit ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.6)', fontWeight: isTotal ? 700 : 400 }}>{row![1]}</span>
                </div>
              )
            })}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', borderTop: '2px solid rgba(255,255,255,0.1)', marginTop: 4 }}>
              <span style={{ fontSize: 15, color: 'white', fontWeight: 700 }}>Final Payment Due</span>
              <span style={{ fontSize: 15, color: RED, fontWeight: 700 }}>${finalPayment.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Message */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px 24px', marginBottom: 28 }}>
          <p style={{ margin: '0 0 16px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Notes & Message</p>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Special Notes (visible on contract)</label>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={specialNotes} onChange={e => setSpecialNotes(e.target.value)} placeholder="Any special arrangements, exceptions, or additions to the standard service…" />
          </div>
          <div>
            <label style={labelStyle}>Message to Client (shown when they open contract)</label>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={garrettMessage} onChange={e => setGarrettMessage(e.target.value)} placeholder="Hi [Name], excited to work with you! Here's your service agreement — let me know if you have any questions before signing." />
          </div>
        </div>

        {/* What's included reminder */}
        <div style={{ background: 'rgba(68,190,199,0.05)', border: '1px solid rgba(68,190,199,0.12)', borderRadius: 10, padding: '16px 20px' }}>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '1px', textTransform: 'uppercase' }}>Included in Every Booking</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4px 16px' }}>
            {['Full Day Coverage', 'Design Consultations', 'Two Sound Systems', 'Dual-Channel Microphones', 'Professional MC', 'Bespoke Visuals'].map(item => (
              <p key={item} style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>✓ {item}</p>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
