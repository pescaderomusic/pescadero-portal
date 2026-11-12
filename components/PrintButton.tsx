'use client'

export default function PrintButton({ style, children }: { style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => window.print()} style={style}>
      {children}
    </button>
  )
}
