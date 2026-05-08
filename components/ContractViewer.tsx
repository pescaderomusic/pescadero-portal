'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TEAL = '#4FB9AF'
const RED = '#D63031'
const NAVY = '#0F1F35'
const CREAM = '#F5F0E4'
const GOLD = '#C8A96E'

const POLICIES = [
  {
    title: 'Scope of Services',
    content: 'Pescadero Music is here to take care of everything audio — and to do it with excellence. Our services include audio setup and operation, music playback, MC announcements (if included in package), microphone support, and timeline execution based on the details provided by the client. Full wedding or event planning, vendor management, furniture moving, and guest coordination fall outside our scope.',
  },
  {
    title: 'Equipment Policy',
    content: 'All sound operations will remain under the supervision and control of the Pescadero Music technician at all times. Pescadero Music does not rent out or leave equipment unattended. Any damage or tampering by individuals other than the on-site technician will result in financial liability for the responsible parties.',
  },
  {
    title: 'Cancellations & Refunds',
    content: 'The deposit is non-refundable under all circumstances. Final payment refund schedule: 14 days to 72 hours before event — 100% refunded. 72–24 hours before — 80% refunded. Less than 24 hours before — 50% refunded. Events may be rescheduled between 14 days and 24 hours before the event with minimal fees, subject to availability.',
  },
  {
    title: 'Weather, Safety & Incidents',
    content: 'For outdoor events, the client is responsible for providing a safe, covered, weather-appropriate setup area for all audio equipment. If weather or environmental conditions create a risk to people or equipment, Pescadero Music reserves the right to pause, relocate, or take protective measures. Only our technician is authorized to operate sound systems during the event.',
  },
  {
    title: 'Payment Terms',
    content: 'Accepted payment methods: Venmo, PayPal, CashApp, or check. Cash and trades are not accepted. If payments are not received by their due dates, Pescadero Music reserves the right to apply late fees or cancel the booking without refund of the deposit.',
  },
]

interface Props {
  contract: any
}

export default function ContractViewer({ contract }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState(!!contract.client_signed_at)
  const [signatureName, setSignatureName] = useState(contract.client_signed_name || '')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')

  // Editable fields
  const [editableFields, setEditableFields] = useState({
    client_name: contract.client_name || '',
    client_phone: contract.client_phone || '',
    venue_name: contract.venue_name || '',
    venue_address: contract.venue_address || '',
    event_start_time: contract.event_start_time || '',
    event_end_time: contract.event_end_time || '',
    day_of_contact_name: contract.day_of_contact_name || '',
    day_of_contact_phone: contract.day_of_contact_phone || '',
  })

  const setField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setEditableFields(f => ({ ...f, [field]: e.target.value }))

  const formatDate = (d: string | null) => {
    if (!d) return 'TBD'
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  async function handleSign() {
    if (!signatureName.trim()) { setError('Please type your full name to sign.'); return }
    if (!agreed) { setError('Please check the box to confirm you agree to all terms.'); return }
    setSigning(true)
    setError('')

    // Save editable fields + signature
    await supabase.from('contracts').update({
      ...editableFields,
      client_signature: signatureName,
      client_signed_name: signatureName,
      client_signed_at: new Date().toISOString(),
      status: 'client_signed',
    }).eq('id', contract.id)

    setSigned(true)
    setSigning(false)
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(79,185,175,0.25)',
    borderRadius: 6,
    padding: '8px 11px',
    color: '#E8E0D5',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 13,
    outline: 'none',
  }

  const readOnlyStyle = {
    ...inputStyle,
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.07)',
    color: 'rgba(232,224,213,0.6)',
    cursor: 'not-allowed',
  }

  const labelStyle = {
    display: 'block' as const,
    fontSize: 9,
    fontWeight: 600 as const,
    letterSpacing: '1.5px',
    textTransform: 'uppercase' as const,
    color: TEAL,
    marginBottom: 5,
    fontFamily: 'Poppins, sans-serif',
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 24px 80px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <p style={{ margin: '0 0 8px', fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: TEAL, fontFamily: 'Poppins, sans-serif' }}>
          Live Sound Service Agreement
        </p>
        <h1 style={{ margin: '0 0 8px', fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 28, color: 'white' }}>
          Pescadero Music
        </h1>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(232,224,213,0.4)', fontFamily: 'Poppins, sans-serif' }}>
          garrett@pescaderomusic.com · (210) 727-9328 · Provo, Utah
        </p>
      </div>

      {/* Garrett's message */}
      {contract.garrett_message && (
        <div style={{
          background: `rgba(200,169,110,0.08)`, border: `1px solid rgba(200,169,110,0.2)`,
          borderLeft: `3px solid ${GOLD}`, borderRadius: 10, padding: '16px 20px', marginBottom: 24,
        }}>
          <p style={{ margin: '0 0 6px', fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: GOLD, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
            A note from Garrett
          </p>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(232,224,213,0.8)', fontFamily: 'Poppins, sans-serif', lineHeight: 1.6, fontStyle: 'italic' }}>
            {contract.garrett_message}
          </p>
        </div>
      )}

      {/* Editable info notice */}
      <div style={{
        background: 'rgba(79,185,175,0.06)', border: '1px solid rgba(79,185,175,0.15)',
        borderRadius: 8, padding: '10px 14px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 14 }}>✏️</span>
        <p style={{ margin: 0, fontSize: 11, color: 'rgba(232,224,213,0.6)', fontFamily: 'Poppins, sans-serif' }}>
          Fields highlighted in teal can be updated if anything has changed. All other fields are set by Pescadero Music.
        </p>
      </div>

      {/* Event Details */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '20px', marginBottom: 16 }}>
        <p style={{ ...labelStyle, fontSize: 10, marginBottom: 16 }}>Event Details</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>Client Name</label>
            <input style={inputStyle} value={editableFields.client_name} onChange={setField('client_name')} />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} value={editableFields.client_phone} onChange={setField('client_phone')} />
          </div>
          <div>
            <label style={labelStyle}>Event Date</label>
            <input style={readOnlyStyle} value={formatDate(contract.event_date)} readOnly />
          </div>
          <div>
            <label style={labelStyle}>Event Type</label>
            <input style={readOnlyStyle} value={contract.event_type || '—'} readOnly />
          </div>
          <div>
            <label style={labelStyle}>Start Time</label>
            <input style={inputStyle} type="time" value={editableFields.event_start_time} onChange={setField('event_start_time')} />
          </div>
          <div>
            <label style={labelStyle}>End Time</label>
            <input style={inputStyle} type="time" value={editableFields.event_end_time} onChange={setField('event_end_time')} />
          </div>
          <div>
            <label style={labelStyle}>Venue Name</label>
            <input style={inputStyle} value={editableFields.venue_name} onChange={setField('venue_name')} />
          </div>
          <div>
            <label style={labelStyle}>Venue Address</label>
            <input style={inputStyle} value={editableFields.venue_address} onChange={setField('venue_address')} />
          </div>
          <div>
            <label style={labelStyle}>Day-of Contact Name</label>
            <input style={inputStyle} value={editableFields.day_of_contact_name} onChange={setField('day_of_contact_name')} />
          </div>
          <div>
            <label style={labelStyle}>Day-of Contact Phone</label>
            <input style={inputStyle} value={editableFields.day_of_contact_phone} onChange={setField('day_of_contact_phone')} />
          </div>
        </div>
      </div>

      {/* Package & Payment */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '20px', marginBottom: 16 }}>
        <p style={{ ...labelStyle, fontSize: 10, marginBottom: 16 }}>Package & Payment Schedule</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          {[
            ['Package', contract.package],
            ['Contracted Hours', contract.contracted_hours],
            ['Package Price', `$${contract.package_price}`],
            ['Travel Fee', `$${contract.travel_fee || 0}`],
            ['Overtime Rate', `$${contract.overtime_rate}/hr`],
          ].map(([k, v]) => (
            <div key={k as string}>
              <label style={labelStyle}>{k as string}</label>
              <input style={readOnlyStyle} value={v as string} readOnly />
            </div>
          ))}
          <div>
            <label style={labelStyle}>Total Due</label>
            <div style={{
              background: 'rgba(79,185,175,0.08)', border: '1px solid rgba(79,185,175,0.2)',
              borderRadius: 7, padding: '9px 12px',
              fontSize: 16, fontWeight: 700, color: TEAL, fontFamily: 'Lora, serif',
            }}>${(Number(contract.package_price) + Number(contract.travel_fee || 0)).toLocaleString()}</div>
          </div>
        </div>

        {/* Payment table */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
          {[
            ['Deposit (Non-Refundable)', `$${contract.deposit_amount}`, contract.deposit_due_date ? formatDate(contract.deposit_due_date) : 'Upon signing'],
            ['Final Payment', `$${contract.final_payment_amount}`, contract.final_payment_due ? formatDate(contract.final_payment_due) : 'TBD'],
          ].map(([label, amount, due]) => (
            <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 12, color: 'rgba(232,224,213,0.6)', fontFamily: 'Poppins, sans-serif' }}>{label as string}</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'white', fontFamily: 'Poppins, sans-serif' }}>{amount as string}</span>
                <span style={{ fontSize: 10, color: 'rgba(232,224,213,0.35)', marginLeft: 10, fontFamily: 'Poppins, sans-serif' }}>Due: {due as string}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special notes */}
      {contract.special_notes && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '20px', marginBottom: 16 }}>
          <p style={{ ...labelStyle, fontSize: 10, marginBottom: 10 }}>Special Notes</p>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(232,224,213,0.7)', fontFamily: 'Poppins, sans-serif', lineHeight: 1.6 }}>
            {contract.special_notes}
          </p>
        </div>
      )}

      {/* Policies */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '20px', marginBottom: 16 }}>
        <p style={{ ...labelStyle, fontSize: 10, marginBottom: 16 }}>Service Policies</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {POLICIES.map(policy => (
            <div key={policy.title} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 14 }}>
              <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, color: 'white', fontFamily: 'Poppins, sans-serif' }}>{policy.title}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(232,224,213,0.55)', fontFamily: 'Poppins, sans-serif', lineHeight: 1.65 }}>{policy.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Signature block */}
      {signed ? (
        <div style={{
          background: 'rgba(79,185,175,0.08)', border: '1px solid rgba(79,185,175,0.25)',
          borderRadius: 10, padding: '24px', textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 8px', fontSize: 20 }}>✓</p>
          <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: TEAL, fontFamily: 'Lora, serif', fontStyle: 'italic' }}>
            Signed by {contract.client_signed_name}
          </p>
          <p style={{ margin: '0 0 20px', fontSize: 11, color: 'rgba(232,224,213,0.4)', fontFamily: 'Poppins, sans-serif' }}>
            {contract.client_signed_at ? new Date(contract.client_signed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''}
          </p>
          <button
            onClick={() => router.push('/contract/payment')}
            style={{
              background: RED, color: 'white', border: 'none',
              borderRadius: 8, padding: '13px 32px',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              boxShadow: '0 4px 20px rgba(214,48,49,0.4)',
            }}
          >
            Proceed to Deposit Payment →
          </button>
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '24px', marginBottom: 16 }}>
          <p style={{ ...labelStyle, fontSize: 10, marginBottom: 16 }}>Sign This Agreement</p>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: 'rgba(232,224,213,0.55)', fontFamily: 'Poppins, sans-serif', lineHeight: 1.6 }}>
            By typing your name below and checking the box, you confirm you have read and agree to all terms outlined in this agreement. This contract becomes binding upon receipt of the signed document and deposit payment.
          </p>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Type your full legal name to sign</label>
            <input
              style={{ ...inputStyle, fontSize: 16, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
              placeholder="Your full name…"
              value={signatureName}
              onChange={e => setSignatureName(e.target.value)}
            />
          </div>

          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            cursor: 'pointer', marginBottom: 16,
          }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
              style={{ marginTop: 2, accentColor: TEAL, width: 16, height: 16, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'rgba(232,224,213,0.6)', fontFamily: 'Poppins, sans-serif', lineHeight: 1.6 }}>
              I have read and agree to all terms and policies outlined in this service agreement. I understand the deposit is non-refundable and that this agreement becomes binding upon signing and payment.
            </span>
          </label>

          {error && (
            <div style={{ background: 'rgba(214,48,49,0.1)', border: '1px solid rgba(214,48,49,0.3)', borderRadius: 7, padding: '10px 14px', marginBottom: 14 }}>
              <p style={{ margin: 0, fontSize: 12, color: '#ff8585', fontFamily: 'Poppins, sans-serif' }}>{error}</p>
            </div>
          )}

          <button onClick={handleSign} disabled={signing} style={{
            background: RED, color: 'white', border: 'none', borderRadius: 8,
            padding: '12px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
            boxShadow: '0 4px 16px rgba(214,48,49,0.35)',
            width: '100%',
          }}>
            {signing ? 'Signing…' : '✍️ Sign Agreement & Proceed to Payment →'}
          </button>
        </div>
      )}
    </div>
  )
}
