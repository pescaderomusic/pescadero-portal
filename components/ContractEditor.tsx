'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TEAL = '#4FB9AF'
const RED = '#D63031'
const NAVY = '#0F1F35'
const GOLD = '#C8A96E'

interface Props {
  inquiry: any
  existingContract?: any
}

export default function ContractEditor({ inquiry, existingContract }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    client_name: existingContract?.client_name || `${inquiry.first_name || ''} ${inquiry.last_name || ''}`.trim(),
    client_email: existingContract?.client_email || inquiry.email || '',
    client_phone: existingContract?.client_phone || inquiry.phone || '',
    event_date: existingContract?.event_date || inquiry.event_date || '',
    event_type: existingContract?.event_type || inquiry.event_name || '',
    event_start_time: existingContract?.event_start_time || inquiry.start_time || '',
    event_end_time: existingContract?.event_end_time || inquiry.end_time || '',
    venue_name: existingContract?.venue_name || inquiry.venue_name || '',
    venue_address: existingContract?.venue_address || inquiry.venue_address || '',
    expected_attendance: existingContract?.expected_attendance || inquiry.attendance || '',
    indoor_outdoor: existingContract?.indoor_outdoor || inquiry.indoor_outdoor || '',
    day_of_contact_name: existingContract?.day_of_contact_name || '',
    day_of_contact_phone: existingContract?.day_of_contact_phone || '',
    package: existingContract?.package || 'Basic DJ Package',
    package_price: existingContract?.package_price || 400,
    travel_fee: existingContract?.travel_fee || 0,
    overtime_rate: existingContract?.overtime_rate || 75,
    deposit_amount: existingContract?.deposit_amount || 100,
    deposit_due_date: existingContract?.deposit_due_date || '',
    final_payment_amount: existingContract?.final_payment_amount || 300,
    final_payment_due: existingContract?.final_payment_due || '',
    contracted_hours: existingContract?.contracted_hours || '4 hours',
    special_notes: existingContract?.special_notes || '',
    garrett_message: existingContract?.garrett_message || '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  async function saveContract(status = 'draft') {
    setSaving(true)
    const payload = {
      ...form,
      inquiry_id: inquiry.id,
      client_id: inquiry.client_id,
      status,
      package_price: Number(form.package_price),
      travel_fee: Number(form.travel_fee),
      overtime_rate: Number(form.overtime_rate),
      deposit_amount: Number(form.deposit_amount),
      final_payment_amount: Number(form.final_payment_amount),
    }

    if (existingContract?.id) {
      await supabase.from('contracts').update(payload).eq('id', existingContract.id)
    } else {
      await supabase.from('contracts').insert(payload)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function sendToClient() {
    setSending(true)
    await saveContract('sent')

    // Update booking step
    if (inquiry.client_id) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('id')
        .eq('client_id', inquiry.client_id)
        .single()

      if (booking) {
        await supabase.from('bookings').update({ step_contract: 'sent' }).eq('id', booking.id)
      } else {
        await supabase.from('bookings').insert({
          client_id: inquiry.client_id,
          event_date: form.event_date || null,
          venue_name: form.venue_name,
          venue_address: form.venue_address,
          event_type: form.event_type,
          step_inquiry: 'complete',
          step_contract: 'sent',
          step_deposit: 'locked',
          step_planning: 'locked',
          step_consultation: 'locked',
          step_event: 'locked',
        })
      }
    }

    // Mark inquiry as contract sent
    await supabase.from('inquiry_submissions').update({ status: 'approved', contract_sent: true }).eq('id', inquiry.id)

    setSending(false)
    router.push('/admin')
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 7,
    padding: '9px 12px',
    color: '#E8E0D5',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 13,
    outline: 'none',
  }

  const labelStyle = {
    display: 'block' as const,
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: '1.5px',
    textTransform: 'uppercase' as const,
    color: TEAL,
    marginBottom: 5,
    fontFamily: 'Poppins, sans-serif',
  }

  const sectionStyle = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 10,
    padding: '20px 22px',
    marginBottom: 16,
  }

  const totalDue = Number(form.package_price) + Number(form.travel_fee)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px 80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: TEAL, fontFamily: 'Poppins, sans-serif', marginBottom: 6 }}>
            Contract Editor
          </p>
          <h1 style={{ margin: 0, fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 26, color: 'white' }}>
            {form.client_name || 'New Contract'}
          </h1>
          {form.event_date && (
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(232,224,213,0.4)', fontFamily: 'Poppins, sans-serif' }}>
              {new Date(form.event_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => saveContract('draft')} disabled={saving} style={{
            background: 'rgba(255,255,255,0.06)', color: 'rgba(232,224,213,0.7)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
            padding: '9px 18px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
          }}>
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Draft'}
          </button>
          <button onClick={sendToClient} disabled={sending || !inquiry.client_id} style={{
            background: inquiry.client_id ? RED : 'rgba(255,255,255,0.06)',
            color: 'white', border: 'none', borderRadius: 8,
            padding: '9px 20px', fontSize: 12, fontWeight: 700, cursor: inquiry.client_id ? 'pointer' : 'not-allowed',
            fontFamily: 'Poppins, sans-serif',
            boxShadow: inquiry.client_id ? '0 4px 16px rgba(214,48,49,0.35)' : 'none',
          }}>
            {sending ? 'Sending…' : inquiry.client_id ? 'Send to Client →' : 'No Account Yet'}
          </button>
        </div>
      </div>

      {/* Message to client */}
      <div style={{ ...sectionStyle, borderLeft: `3px solid ${GOLD}` }}>
        <label style={labelStyle}>Personal Message to Client (optional)</label>
        <textarea
          value={form.garrett_message}
          onChange={set('garrett_message')}
          rows={3}
          placeholder="Hi Sarah & James! So excited to be part of your day. I've reviewed your inquiry and put together your service agreement below. Feel free to reach out with any questions before signing."
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* Client Info */}
      <div style={sectionStyle}>
        <p style={{ ...labelStyle, fontSize: 10, marginBottom: 16 }}>Client Information</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={labelStyle}>Full Name</label><input style={inputStyle} value={form.client_name} onChange={set('client_name')} /></div>
          <div><label style={labelStyle}>Email</label><input style={inputStyle} value={form.client_email} onChange={set('client_email')} /></div>
          <div><label style={labelStyle}>Phone</label><input style={inputStyle} value={form.client_phone} onChange={set('client_phone')} /></div>
          <div><label style={labelStyle}>Day-of Contact Name</label><input style={inputStyle} value={form.day_of_contact_name} onChange={set('day_of_contact_name')} placeholder="Coordinator, planner, family member…" /></div>
          <div><label style={labelStyle}>Day-of Contact Phone</label><input style={inputStyle} value={form.day_of_contact_phone} onChange={set('day_of_contact_phone')} /></div>
        </div>
      </div>

      {/* Event Info */}
      <div style={sectionStyle}>
        <p style={{ ...labelStyle, fontSize: 10, marginBottom: 16 }}>Event Details</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={labelStyle}>Event Type</label><input style={inputStyle} value={form.event_type} onChange={set('event_type')} placeholder="Wedding reception, birthday…" /></div>
          <div><label style={labelStyle}>Event Date</label><input style={inputStyle} type="date" value={form.event_date} onChange={set('event_date')} /></div>
          <div><label style={labelStyle}>Start Time</label><input style={inputStyle} type="time" value={form.event_start_time} onChange={set('event_start_time')} /></div>
          <div><label style={labelStyle}>End Time</label><input style={inputStyle} type="time" value={form.event_end_time} onChange={set('event_end_time')} /></div>
          <div><label style={labelStyle}>Venue Name</label><input style={inputStyle} value={form.venue_name} onChange={set('venue_name')} /></div>
          <div><label style={labelStyle}>Venue Address</label><input style={inputStyle} value={form.venue_address} onChange={set('venue_address')} /></div>
          <div><label style={labelStyle}>Expected Attendance</label><input style={inputStyle} value={form.expected_attendance} onChange={set('expected_attendance')} /></div>
          <div><label style={labelStyle}>Indoor / Outdoor</label>
            <select style={inputStyle} value={form.indoor_outdoor} onChange={set('indoor_outdoor')}>
              <option value="">Select…</option>
              <option>Indoor</option><option>Outdoor</option><option>Both</option>
            </select>
          </div>
        </div>
      </div>

      {/* Package & Pricing */}
      <div style={sectionStyle}>
        <p style={{ ...labelStyle, fontSize: 10, marginBottom: 16 }}>Package & Pricing</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={labelStyle}>Package</label>
            <select style={inputStyle} value={form.package} onChange={set('package')}>
              <option>Basic DJ Package</option>
              <option>DJ + MC Package</option>
              <option>Full Service Package</option>
              <option>Custom</option>
            </select>
          </div>
          <div><label style={labelStyle}>Package Price ($)</label><input style={inputStyle} type="number" value={form.package_price} onChange={set('package_price')} /></div>
          <div><label style={labelStyle}>Travel Fee ($)</label><input style={inputStyle} type="number" value={form.travel_fee} onChange={set('travel_fee')} /></div>
          <div><label style={labelStyle}>Overtime Rate ($/hr)</label><input style={inputStyle} type="number" value={form.overtime_rate} onChange={set('overtime_rate')} /></div>
          <div><label style={labelStyle}>Contracted Hours</label><input style={inputStyle} value={form.contracted_hours} onChange={set('contracted_hours')} /></div>
          <div>
            <label style={labelStyle}>Total Due</label>
            <div style={{
              background: 'rgba(79,185,175,0.08)', border: '1px solid rgba(79,185,175,0.2)',
              borderRadius: 7, padding: '9px 12px',
              fontSize: 18, fontWeight: 700, color: TEAL, fontFamily: 'Lora, serif',
            }}>${totalDue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Payment Schedule */}
      <div style={sectionStyle}>
        <p style={{ ...labelStyle, fontSize: 10, marginBottom: 16 }}>Payment Schedule</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={labelStyle}>Deposit Amount ($)</label><input style={inputStyle} type="number" value={form.deposit_amount} onChange={set('deposit_amount')} /></div>
          <div><label style={labelStyle}>Deposit Due Date</label><input style={inputStyle} type="date" value={form.deposit_due_date} onChange={set('deposit_due_date')} /></div>
          <div><label style={labelStyle}>Final Payment Amount ($)</label><input style={inputStyle} type="number" value={form.final_payment_amount} onChange={set('final_payment_amount')} /></div>
          <div><label style={labelStyle}>Final Payment Due</label><input style={inputStyle} type="date" value={form.final_payment_due} onChange={set('final_payment_due')} /></div>
        </div>
      </div>

      {/* Special Notes */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Special Notes / Custom Terms</label>
        <textarea
          value={form.special_notes}
          onChange={set('special_notes')}
          rows={4}
          placeholder="Any custom terms, special accommodations, or notes for this specific event…"
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* Contract preview notice */}
      <div style={{
        background: 'rgba(79,185,175,0.05)', border: '1px solid rgba(79,185,175,0.15)',
        borderRadius: 10, padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 18 }}>📋</span>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(232,224,213,0.7)', fontFamily: 'Poppins, sans-serif' }}>
            The standard Pescadero Music service agreement (policies, cancellation terms, equipment policy, etc.) will be automatically included when you send this to the client.
          </p>
        </div>
      </div>

      {/* Bottom send button */}
      <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
        <button onClick={() => saveContract('draft')} disabled={saving} style={{
          background: 'rgba(255,255,255,0.06)', color: 'rgba(232,224,213,0.7)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
          padding: '11px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'Poppins, sans-serif',
        }}>
          {saving ? 'Saving…' : 'Save Draft'}
        </button>
        <button onClick={sendToClient} disabled={sending || !inquiry.client_id} style={{
          background: inquiry.client_id ? RED : 'rgba(255,255,255,0.06)',
          color: 'white', border: 'none', borderRadius: 8,
          padding: '11px 24px', fontSize: 13, fontWeight: 700,
          cursor: inquiry.client_id ? 'pointer' : 'not-allowed',
          fontFamily: 'Poppins, sans-serif',
          boxShadow: inquiry.client_id ? '0 4px 20px rgba(214,48,49,0.4)' : 'none',
        }}>
          {sending ? 'Sending…' : '📤 Send Contract to Client →'}
        </button>
      </div>
    </div>
  )
}
