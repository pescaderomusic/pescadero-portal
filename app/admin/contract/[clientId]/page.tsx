'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const NAVY  = '#0D1B2A'
const BLUE  = '#44BEC7'
const RED   = '#D62828'
const GREEN = '#4CAF50'
const GARRETT_ID = '14d81e15-efb6-4a6a-904b-91f9c48899df'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 7,
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
  color: 'white', fontSize: 13, fontFamily: 'Poppins, sans-serif',
  outline: 'none', boxSizing: 'border-box',
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 9, color: BLUE, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: 5, fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
        {label}{required && <span style={{ color: RED }}> *</span>}
      </label>
      {children}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 22px', marginBottom: 16 }}>
      <p style={{ margin: '0 0 16px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', fontFamily: 'Poppins, sans-serif' }}>{title}</p>
      {children}
    </div>
  )
}

type AdditionalCharge = { description: string; amount: string; approved_by: string }

const emptyCharge = (): AdditionalCharge => ({ description: '', amount: '', approved_by: '' })

export default function AdminContractPage() {
  const params   = useParams()
  const router   = useRouter()
  const clientId = params.clientId as string

  const [contract, setContract] = useState<any>(null)
  const [profile, setProfile]   = useState<any>(null)
  const [email, setEmail]       = useState('')
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [sending, setSending]   = useState(false)
  const [msg, setMsg]           = useState('')

  const [form, setForm] = useState({
    client_name: '', client_email: '', client_phone: '',
    event_date: '', event_type: '', event_start_time: '', event_end_time: '',
    venue_name: '', venue_address: '', venue_distance: '', expected_attendance: '',
    indoor_outdoor: '', contracted_hours: '4',
    day_of_contact_name: '', day_of_contact_phone: '',
    package: 'Basic DJ Package', package_price: '400',
    travel_fee: '0', overtime_rate: '100',
    deposit_amount: '100', deposit_due_date: '',
    final_payment_amount: '300', final_payment_due: '',
    sales_tax_rate: '0',
    special_notes: '', garrett_message: '',
  })

  const [additionalCharges, setAdditionalCharges] = useState<AdditionalCharge[]>([emptyCharge(), emptyCharge(), emptyCharge()])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const setCharge = (i: number, k: keyof AdditionalCharge, v: string) =>
    setAdditionalCharges(cs => cs.map((c, idx) => idx === i ? { ...c, [k]: v } : c))

  // Calculations
  const pkg       = Number(form.package_price) || 0
  const travel    = Number(form.travel_fee) || 0
  const addlTotal = additionalCharges.reduce((s, c) => s + (Number(c.amount) || 0), 0)
  const taxRate   = Number(form.sales_tax_rate) || 0
  const taxAmt    = Math.round(((pkg + travel + addlTotal) * taxRate / 100) * 100) / 100
  const totalDue  = pkg + travel + addlTotal + taxAmt
  const finalAmt  = totalDue - (Number(form.deposit_amount) || 0)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      try {
        const [
          { data: prof },
          { data: con },
          { data: inq },
        ] = await Promise.all([
          supabase.from('profiles').select('full_name').eq('id', clientId).single(),
          supabase.from('contracts').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(1).single(),
          supabase.from('inquiry_submissions').select('*').eq('client_id', clientId).order('submitted_at', { ascending: false }).limit(1).single(),
        ])

        // Get email from auth
        const { data: { user } } = await supabase.auth.getUser()
        // We need the client email — use profile or inquiry
        const clientEmail = inq?.email || ''

        setProfile(prof)
        setEmail(clientEmail)

        if (con) {
          setContract(con)
          setForm(f => ({
            ...f,
            client_name:          con.client_name || prof?.full_name || '',
            client_email:         con.client_email || clientEmail || '',
            client_phone:         con.client_phone || inq?.phone || '',
            event_date:           con.event_date || inq?.event_date || '',
            event_type:           con.event_type || inq?.event_name || '',
            event_start_time:     con.event_start_time || inq?.start_time || '',
            event_end_time:       con.event_end_time || inq?.end_time || '',
            venue_name:           con.venue_name || inq?.venue_name || '',
            venue_address:        con.venue_address || inq?.venue_address || '',
            expected_attendance:  con.expected_attendance || inq?.attendance || '',
            indoor_outdoor:       con.indoor_outdoor || inq?.indoor_outdoor || '',
            day_of_contact_name:  con.day_of_contact_name || '',
            day_of_contact_phone: con.day_of_contact_phone || '',
            package:              con.package || 'Basic DJ Package',
            package_price:        con.package_price?.toString() || '400',
            travel_fee:           con.travel_fee?.toString() || '0',
            overtime_rate:        con.overtime_rate?.toString() || '100',
            deposit_amount:       con.deposit_amount?.toString() || '100',
            deposit_due_date:     con.deposit_due_date || '',
            final_payment_amount: con.final_payment_amount?.toString() || '300',
            final_payment_due:    con.final_payment_due || '',
            contracted_hours:     con.contracted_hours || '4',
            sales_tax_rate:       con.sales_tax_rate?.toString() || '0',
            special_notes:        con.special_notes || '',
            garrett_message:      con.garrett_message || '',
            venue_distance:       con.venue_distance || '',
          }))
          if (con.additional_charges?.length) {
            const padded = [...con.additional_charges.map((ch: any) => ({
              description: ch.description || '',
              amount: ch.amount?.toString() || '',
              approved_by: ch.approved_by || '',
            }))]
            while (padded.length < 3) padded.push(emptyCharge())
            setAdditionalCharges(padded)
          }
        } else if (inq) {
          setForm(f => ({
            ...f,
            client_name:         prof?.full_name || '',
            client_email:        clientEmail || '',
            client_phone:        inq.phone || '',
            event_date:          inq.event_date || '',
            event_type:          inq.event_name || '',
            event_start_time:    inq.start_time || '',
            event_end_time:      inq.end_time || '',
            venue_name:          inq.venue_name || '',
            venue_address:       inq.venue_address || '',
            expected_attendance: inq.attendance || '',
            indoor_outdoor:      inq.indoor_outdoor || '',
          }))
        }
      } catch (e) {
        console.error('Contract load error:', e)
        setMsg('❌ Failed to load — check console')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [clientId])

  const buildPayload = () => ({
    ...form,
    final_payment_amount: finalAmt.toFixed(2),
  })

  const handleSave = async () => {
    setSaving(true); setMsg('')
    const res = await fetch('/api/admin/save-contract', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, ...buildPayload() }),
    })
    if (res.ok) { const d = await res.json(); setContract(d.contract); setMsg('✓ Draft saved') }
    else setMsg('❌ Save failed')
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const handleSend = async () => {
    setSending(true); setMsg('')
    await fetch('/api/admin/save-contract', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, ...buildPayload() }),
    })
    await fetch('/api/admin/update-step', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, stepKey: 'step_contract', value: 'sent' }),
    })
    await fetch('/api/admin/notify-contract-sent', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, clientName: form.client_name, email: form.client_email }),
    }).catch(() => {})
    setMsg('✓ Contract sent to client!')
    setSending(false)
    setTimeout(() => router.push(`/admin/client/${clientId}`), 2000)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Poppins, sans-serif' }}>Loading…</p>
    </div>
  )

  const isSent = ['sent','signed','deposit_paid','fully_paid'].includes(contract?.status || '')

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, fontFamily: 'Poppins, sans-serif' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,24,40,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(68,190,199,0.15)', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href={`/admin/client/${clientId}`} style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: BLUE, textDecoration: 'none' }}>← CLIENT</Link>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Contract — {profile?.full_name || email}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {!isSent && (
            <>
              <button onClick={handleSave} disabled={saving} style={{ padding: '7px 18px', borderRadius: 7, border: '1px solid rgba(68,190,199,0.3)', background: 'rgba(68,190,199,0.1)', color: BLUE, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {saving ? 'Saving…' : '💾 Save Draft'}
              </button>
              <button onClick={handleSend} disabled={sending} style={{ padding: '7px 18px', borderRadius: 7, border: 'none', background: sending ? 'rgba(214,40,40,0.5)' : RED, color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {sending ? 'Sending…' : '📤 Send to Client →'}
              </button>
            </>
          )}
          {isSent && (
            <span style={{ padding: '7px 14px', borderRadius: 7, background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.3)', color: GREEN, fontSize: 12, fontWeight: 700 }}>
              ✓ {contract?.status === 'signed' ? 'Signed by Client' : 'Sent to Client'}
            </span>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 24px 80px' }}>

        {msg && (
          <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontSize: 13, background: msg.startsWith('✓') ? 'rgba(76,175,80,0.1)' : 'rgba(214,40,40,0.1)', color: msg.startsWith('✓') ? GREEN : '#FF8A80', border: `1px solid ${msg.startsWith('✓') ? 'rgba(76,175,80,0.2)' : 'rgba(214,40,40,0.2)'}` }}>
            {msg}
          </div>
        )}

        {isSent && (
          <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 12, background: 'rgba(68,190,199,0.08)', color: BLUE, border: '1px solid rgba(68,190,199,0.2)' }}>
            ℹ️ Contract {contract?.status === 'signed' ? 'has been signed by the client' : 'has been sent — awaiting client signature'}. Editing disabled.
          </div>
        )}

        {/* Personal message */}
        <Section title="Personal Message to Client (shown at top of contract)">
          <textarea style={{ ...inputStyle, height: 70, resize: 'vertical' }} value={form.garrett_message} onChange={set('garrett_message')} disabled={isSent} placeholder="e.g. 'So excited to be part of your day! Here's your agreement — let me know if you have any questions.'" />
        </Section>

        {/* Client info */}
        <Section title="Client Information">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <Field label="Client Name" required><input style={inputStyle} value={form.client_name} onChange={set('client_name')} disabled={isSent} /></Field>
            <Field label="Phone"><input style={inputStyle} value={form.client_phone} onChange={set('client_phone')} disabled={isSent} /></Field>
            <Field label="Email"><input style={inputStyle} value={form.client_email} onChange={set('client_email')} disabled={isSent} /></Field>
          </div>
        </Section>

        {/* Event info */}
        <Section title="Event Details">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <Field label="Event Type" required><input style={inputStyle} value={form.event_type} onChange={set('event_type')} disabled={isSent} placeholder="Wedding Reception" /></Field>
            <Field label="Event Date" required><input style={inputStyle} type="date" value={form.event_date} onChange={set('event_date')} disabled={isSent} /></Field>
            <Field label="Start Time"><input style={inputStyle} type="time" value={form.event_start_time} onChange={set('event_start_time')} disabled={isSent} /></Field>
            <Field label="End Time"><input style={inputStyle} type="time" value={form.event_end_time} onChange={set('event_end_time')} disabled={isSent} /></Field>
            <Field label="Expected Attendance"><input style={inputStyle} value={form.expected_attendance} onChange={set('expected_attendance')} disabled={isSent} /></Field>

            <Field label="Indoor / Outdoor">
              <select style={inputStyle} value={form.indoor_outdoor} onChange={set('indoor_outdoor')} disabled={isSent}>
                <option value="">Select…</option><option>Indoor</option><option>Outdoor</option><option>Both</option>
              </select>
            </Field>
          </div>
          <Field label="Venue Name"><input style={inputStyle} value={form.venue_name} onChange={set('venue_name')} disabled={isSent} /></Field>
          <Field label="Venue Address"><input style={inputStyle} value={form.venue_address} onChange={set('venue_address')} disabled={isSent} /></Field>
        </Section>

        {/* Day-of contact */}
        <Section title="Designated Day-of Contact">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <Field label="Contact Name"><input style={inputStyle} value={form.day_of_contact_name} onChange={set('day_of_contact_name')} disabled={isSent} /></Field>
            <Field label="Contact Phone / Role"><input style={inputStyle} value={form.day_of_contact_phone} onChange={set('day_of_contact_phone')} disabled={isSent} /></Field>
          </div>
        </Section>

        {/* Package + travel */}
        <Section title="Investment & Travel">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
  
            <Field label="Investment ($) — Sat: $1,500 · Fri/Thu: $1,400 · Mon–Wed: $1,200"><input style={inputStyle} type="number" value={form.package_price} onChange={set('package_price')} disabled={isSent} /></Field>
            <Field label="Venue Distance from Provo">
              <select style={inputStyle} value={form.venue_distance} onChange={e => { set('venue_distance')(e); const v = e.target.value; setForm(f => ({ ...f, venue_distance: v, travel_fee: v === '0-30' ? '0' : v === '31-60' ? '75' : f.travel_fee })) }} disabled={isSent}>
                <option value="">Select distance from Provo…</option>
                <option value="0-60">Within 60 miles (Free)</option>
                <option value="61+">61+ miles (consult — enter fee below)</option>
              </select>
            </Field>
            <Field label="Travel Fee ($)"><input style={inputStyle} type="number" value={form.travel_fee} onChange={set('travel_fee')} disabled={isSent} /></Field>

          </div>
        </Section>

        {/* Payment schedule */}
        <Section title="Payment Schedule">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <Field label="Deposit Amount ($)"><input style={inputStyle} type="number" value={form.deposit_amount} onChange={set('deposit_amount')} disabled={isSent} /></Field>
            <Field label="Deposit Due Date"><input style={inputStyle} type="date" value={form.deposit_due_date} onChange={set('deposit_due_date')} disabled={isSent} /></Field>
            <Field label="Sales Tax Rate (%)"><input style={inputStyle} type="number" step="0.1" value={form.sales_tax_rate} onChange={set('sales_tax_rate')} disabled={isSent} placeholder="0" /></Field>
            <Field label="Final Payment Due Date"><input style={inputStyle} type="date" value={form.final_payment_due} onChange={set('final_payment_due')} disabled={isSent} /></Field>
          </div>
        </Section>



        {/* Total summary */}
        <div style={{ background: 'rgba(68,190,199,0.06)', border: '1px solid rgba(68,190,199,0.2)', borderRadius: 12, padding: '18px 22px', marginBottom: 16 }}>
          <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE, fontFamily: 'Poppins, sans-serif' }}>Payment Summary</p>
          {[
            ['Investment', `$${pkg.toFixed(2)}`],
            ...(travel > 0 ? [['Travel Fee', `$${travel.toFixed(2)}`]] : []),
            ...(addlTotal > 0 ? [['Additional Charges', `$${addlTotal.toFixed(2)}`]] : []),
            ...(taxAmt > 0 ? [`Sales Tax (${taxRate}%)`, `$${taxAmt.toFixed(2)}`].map(x => [x]) : []),
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{k}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{v}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(68,190,199,0.2)', paddingTop: 10, marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Total Due</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: BLUE }}>${totalDue.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Deposit (non-refundable)</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>− ${form.deposit_amount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Final Payment</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>${finalAmt.toFixed(2)}</span>
          </div>
        </div>

        {/* Special notes */}
        <Section title="Special Notes / Requests">
          <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} value={form.special_notes} onChange={set('special_notes')} disabled={isSent} placeholder="Any custom arrangements, special requests, or notes for the client's copy of the contract…" />
        </Section>

        {/* Bottom send */}
        {!isSent && (
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '13px', borderRadius: 10, border: '1px solid rgba(68,190,199,0.3)', background: 'rgba(68,190,199,0.1)', color: BLUE, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {saving ? 'Saving…' : '💾 Save Draft'}
            </button>
            <button onClick={handleSend} disabled={sending} style={{ flex: 2, padding: '13px', borderRadius: 10, border: 'none', background: sending ? 'rgba(214,40,40,0.5)' : RED, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(214,40,40,0.3)' }}>
              {sending ? 'Sending…' : '📤 Finalize & Send Contract to Client →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
