import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pescadero Music — Wedding Sound Inquiry',
}

export default function InquiryLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, height: '100%' }}>
        {children}
      </body>
    </html>
  )
}
