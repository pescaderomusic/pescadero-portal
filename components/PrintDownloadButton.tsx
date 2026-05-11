'use client'

const BLUE = '#44BEC7'
const RED  = '#D62828'

interface Props {
  label?: string
  variant?: 'blue' | 'red'
}

export default function PrintDownloadButton({ label = '🖨 Print / Save as PDF', variant = 'blue' }: Props) {
  const color  = variant === 'red' ? RED : BLUE
  const border = variant === 'red' ? `1px solid ${RED}` : `1px solid rgba(68,190,199,0.35)`

  return (
    <>
      <button
        onClick={() => window.print()}
        className="no-print"
        style={{
          padding: '10px 22px',
          borderRadius: 8,
          border,
          background: 'transparent',
          color,
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'Poppins, sans-serif',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {label}
      </button>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          nav, header, footer { display: none !important; }
        }
      `}</style>
    </>
  )
}
