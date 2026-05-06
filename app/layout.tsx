import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pescadero Music | Client Portal',
  description: 'Professional live sound for your perfect day.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
