'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const NAVY = '#0D1B2A'
const BLUE = '#44BEC7'
const RED  = '#D62828'
const GOLD = '#F5A623'
const GREEN = '#4CAF50'

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 22px' }}>
      <p style={{ margin: '0 0 16px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', fontFamily: 'Poppins, sans-serif' }}>{title}</p>
      {children}
    </div>
  )
}

function StatBox({ label, value, sub, color = 'white' }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 700, color, fontFamily: 'Poppins, sans-serif' }}>{value}</p>
      <p style={{ margin: '0 0 2px', fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'Poppins, sans-serif' }}>{label}</p>
      {sub && <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Poppins, sans-serif' }}>{sub}</p>}
    </div>
  )
}

function ProgressBar({ value, max, color = BLUE }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
    </div>
  )
}

export default function AnalyticsClient({ contracts, bookings, inquiries }: { contracts: any[]; bookings: any[]; inquiries: any[] }) {
  const [goalAmount, setGoalAmount] = useState(5000)
  const [editingGoal, setEditingGoal] = useState(false)
  const [tempGoal, setTempGoal] = useState('5000')

  // Load saved goal from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pm_annual_goal')
    if (saved) { setGoalAmount(Number(saved)); setTempGoal(saved) }
  }, [])

  const saveGoal = () => {
    const val = Number(tempGoal.replace(/[^0-9.]/g, ''))
    if (val > 0) { setGoalAmount(val); localStorage.setItem('pm_annual_goal', String(val)) }
    setEditingGoal(false)
  }

  const now     = new Date()
  const thisYear  = now.getFullYear()
  const thisMonth = now.getMonth()

  // Revenue calculations
  const depositsPaid = contracts.filter(c => c.deposit_paid_at)
  const finalsPaid   = bookings.filter(b => b.step_final_payment === 'paid')

  // Total received (deposits + finals)
  const totalDeposits = depositsPaid.reduce((s, c) => s + (c.deposit_amount || 0), 0)
  const totalFinals   = contracts
    .filter(c => finalsPaid.some(b => b.client_id === c.client_id))
    .reduce((s, c) => s + (c.final_payment_amount || 0), 0)
  const totalRevenue  = totalDeposits + totalFinals

  // This month
  const thisMonthDeposits = depositsPaid
    .filter(c => { const d = new Date(c.deposit_paid_at); return d.getFullYear() === thisYear && d.getMonth() === thisMonth })
    .reduce((s, c) => s + (c.deposit_amount || 0), 0)

  // Projected next month — upcoming final payments due
  const nextMonth = new Date(thisYear, thisMonth + 1, 1)
  const nextMonthEnd = new Date(thisYear, thisMonth + 2, 0)
  const projectedFinals = contracts
    .filter(c => {
      if (!c.final_payment_due) return false
      const due = new Date(c.final_payment_due + 'T12:00:00')
      return due >= nextMonth && due <= nextMonthEnd && c.status !== 'fully_paid'
    })
    .reduce((s, c) => s + (c.final_payment_amount || 0), 0)

  // Pipeline (contracted, not yet fully paid)
  const pipeline = contracts
    .filter(c => c.status === 'deposit_paid')
    .reduce((s, c) => s + (c.final_payment_amount || 0), 0)

  // Client stats
  const totalInquiries = inquiries.length
  const totalBookings  = bookings.length
  const conversionRate = totalInquiries > 0 ? Math.round((totalBookings / totalInquiries) * 100) : 0
  const completedEvents = bookings.filter(b => b.step_event === 'complete').length
  const activeClients   = bookings.filter(b => b.step_event !== 'complete').length

  // Monthly revenue for chart (last 6 months)
  const monthLabels: string[] = []
  const monthRevenue: number[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(thisYear, thisMonth - i, 1)
    const label = d.toLocaleDateString('en-US', { month: 'short' })
    monthLabels.push(label)
    const rev = depositsPaid
      .filter(c => { const pd = new Date(c.deposit_paid_at); return pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth() })
      .reduce((s, c) => s + (c.deposit_amount || 0), 0)
    monthRevenue.push(rev)
  }
  const maxRevMonth = Math.max(...monthRevenue, 1)

  // Annual goal progress
  const goalProgress = Math.min((totalRevenue / goalAmount) * 100, 100)
  const goalColor = goalProgress >= 100 ? GREEN : goalProgress >= 70 ? BLUE : goalProgress >= 40 ? GOLD : RED

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0A1828 100%)`, fontFamily: 'Poppins, sans-serif' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,24,40,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(68,190,199,0.15)', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/admin" style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '3px', color: BLUE, textDecoration: 'none' }}>← ADMIN</Link>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>📊 Analytics</span>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 80px' }}>

        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: '0 0 4px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BLUE }}>Business Overview</p>
          <h1 style={{ margin: 0, fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 26, color: 'white' }}>Analytics & Goals</h1>
        </div>

        {/* Annual Goal */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${goalColor}33`, borderRadius: 12, padding: '22px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>🎯 Annual Revenue Goal</p>
              {editingGoal ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20, color: 'white' }}>$</span>
                  <input value={tempGoal} onChange={e => setTempGoal(e.target.value)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(68,190,199,0.4)', borderRadius: 6, color: 'white', fontSize: 22, padding: '4px 10px', width: 140, fontFamily: 'Poppins, sans-serif' }} autoFocus onKeyDown={e => e.key === 'Enter' && saveGoal()} />
                  <button onClick={saveGoal} style={{ background: BLUE, border: 'none', borderRadius: 6, color: 'white', padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Save</button>
                  <button onClick={() => setEditingGoal(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, color: 'rgba(255,255,255,0.4)', padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: goalColor }}>${goalAmount.toLocaleString()}</p>
                  <button onClick={() => setEditingGoal(true)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'rgba(255,255,255,0.4)', padding: '4px 12px', cursor: 'pointer', fontSize: 11 }}>Edit Goal</button>
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 2px', fontSize: 32, fontWeight: 700, color: goalColor }}>{Math.round(goalProgress)}%</p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>${totalRevenue.toLocaleString()} earned</p>
            </div>
          </div>
          <ProgressBar value={totalRevenue} max={goalAmount} color={goalColor} />
          <p style={{ margin: '8px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            ${(goalAmount - totalRevenue).toLocaleString()} remaining to hit your goal
          </p>
        </div>

        {/* Revenue stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          <Card title="Total Revenue">
            <StatBox value={`$${totalRevenue.toLocaleString()}`} label="All time" color={GREEN} />
          </Card>
          <Card title="This Month">
            <StatBox value={`$${thisMonthDeposits.toLocaleString()}`} label="Deposits received" color={BLUE} />
          </Card>
          <Card title="Pipeline">
            <StatBox value={`$${pipeline.toLocaleString()}`} label="Finals pending" color={GOLD} />
          </Card>
          <Card title="Projected Next Month">
            <StatBox value={`$${projectedFinals.toLocaleString()}`} label="Finals due" color="rgba(255,255,255,0.8)" />
          </Card>
        </div>

        {/* Revenue chart + client stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

          {/* Monthly chart */}
          <Card title="Monthly Revenue (Last 6 Months)">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
              {monthRevenue.map((rev, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <p style={{ margin: 0, fontSize: 9, color: BLUE }}>{rev > 0 ? `$${rev}` : ''}</p>
                  <div style={{ width: '100%', background: rev > 0 ? BLUE : 'rgba(255,255,255,0.06)', borderRadius: '3px 3px 0 0', height: `${rev > 0 ? Math.max((rev / maxRevMonth) * 80, 8) : 4}px`, transition: 'height 0.4s ease' }} />
                  <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{monthLabels[i]}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Client stats */}
          <Card title="Client Stats">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <StatBox value={String(totalInquiries)} label="Total inquiries" color={BLUE} />
              <StatBox value={String(totalBookings)} label="Booked clients" color={GREEN} />
              <StatBox value={`${conversionRate}%`} label="Conversion rate" color={GOLD} />
              <StatBox value={String(completedEvents)} label="Events completed" color="rgba(255,255,255,0.7)" />
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Conversion rate</span>
                <span style={{ fontSize: 11, color: GOLD }}>{conversionRate}%</span>
              </div>
              <ProgressBar value={conversionRate} max={100} color={GOLD} />
            </div>
          </Card>
        </div>

        {/* Active bookings breakdown */}
        <Card title="Active Bookings — Step Breakdown">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
            {[
              { label: 'Inquiry',    key: 'step_inquiry' },
              { label: 'Consult',    key: 'step_consultation' },
              { label: 'Contract',   key: 'step_contract' },
              { label: 'Deposit',    key: 'step_deposit' },
              { label: 'Planning',   key: 'step_planning' },
              { label: 'Final $',    key: 'step_final_payment' },
              { label: 'Event',      key: 'step_event' },
            ].map(({ label, key }) => {
              const done    = bookings.filter(b => ['complete','signed','paid','submitted'].includes(b[key] || '')).length
              const pending = bookings.filter(b => ['pending','sent'].includes(b[key] || '')).length
              return (
                <div key={key} style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: done > 0 ? GREEN : 'rgba(255,255,255,0.2)' }}>{done}</p>
                  {pending > 0 && <p style={{ margin: '0 0 4px', fontSize: 11, color: GOLD }}>+{pending} pending</p>}
                  <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
                  <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${totalBookings > 0 ? (done / totalBookings) * 100 : 0}%`, height: '100%', background: GREEN, borderRadius: 2 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

      </div>
    </div>
  )
}
