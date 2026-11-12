'use client'

import { useState } from 'react'

// Opens Messages with the review text filled in. If we have the client's phone
// it's filled in too; otherwise Messages opens with an empty "To:" line.
export default function TextReviewButton({
  message,
  link,
  phone,
  compact = false,
}: {
  message: string
  link: string
  phone?: string | null
  compact?: boolean
}) {
  const [copied, setCopied] = useState(false)

  const open = () => {
    const to = (phone || '').replace(/[^\d+]/g, '')
    const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)
    // iOS/macOS read the body after "&"; Android after "?"
    window.location.href = `sms:${to}${isApple ? '&' : '?'}body=${encodeURIComponent(message)}`
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy the review link:', link)
    }
  }

  return (
    <div className={`flex items-stretch gap-1 ${compact ? '' : 'w-full'}`}>
      <button
        type="button"
        onClick={open}
        className={`inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-label-md uppercase tracking-wider min-h-[44px] px-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${compact ? '' : 'flex-1'}`}
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">sms</span>
        Text review link
      </button>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy review link"
        className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] bg-surface-container text-primary hover:bg-surface-container-highest transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{copied ? 'check' : 'content_copy'}</span>
        <span className="sr-only" aria-live="polite">{copied ? 'Copied' : ''}</span>
      </button>
    </div>
  )
}
