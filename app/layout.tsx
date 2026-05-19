import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pescadero Music | Professional Wedding Sound & DJ',
  description: 'Professional live sound for weddings, receptions, and events across Utah. Every detail of your day deserves to sound as good as it looks.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/qmr3yfz.css" />
        <style>{`
          @font-face {
            font-family: 'RetroFloral';
            src: url('/fonts/Retro Floral.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
