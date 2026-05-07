'use client'
import { useEffect } from 'react'

export default function InquiryPage() {
  useEffect(() => {
    window.location.href = '/inquiry.html'
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D1B2A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#F5EFE0',
      fontFamily: 'sans-serif',
    }}>
      Loading...
    </div>
  )
}
