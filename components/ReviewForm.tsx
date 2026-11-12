'use client'

import { useState } from 'react'

const RATING_WORDS = ['', 'Needs improvement', 'It was okay', 'Good', 'Great', 'Perfect']

function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-10 h-10">
      <path
        d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"
        fill={filled ? '#C8202A' : 'none'}
        stroke={filled ? '#C8202A' : '#44474b'}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ReviewForm({
  code,
  firstName,
  alreadySubmitted,
}: {
  code: string
  firstName: string
  alreadySubmitted: boolean
}) {
  const [rating, setRating] = useState(0)
  const [testimonial, setTestimonial] = useState('')
  const [shareOk, setShareOk] = useState(false)
  const [photoOk, setPhotoOk] = useState(false)
  const [referralName, setReferralName] = useState('')
  const [referralPhone, setReferralPhone] = useState('')
  const [feedback, setFeedback] = useState('')
  const [state, setState] = useState<'idle' | 'saving' | 'done'>(alreadySubmitted ? 'done' : 'idle')
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating) {
      setError('Please choose a star rating.')
      document.getElementById('rating-group')?.focus()
      return
    }
    setState('saving')
    setError('')
    const res = await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        rating,
        testimonial,
        use_for_advertising: shareOk,
        photo_release: photoOk,
        referral_name: referralName,
        referral_phone: referralPhone,
        additional_feedback: feedback,
      }),
    }).catch(() => null)
    const data = res ? await res.json().catch(() => ({})) : {}
    if (res?.ok) {
      setState('done')
      window.scrollTo({ top: 0 })
    } else {
      setState('idle')
      setError(data.error || 'Something went wrong. Please try again.')
    }
  }

  if (state === 'done') {
    return (
      <div className="bg-surface-container-lowest p-6 shadow-[6px_6px_0px_0px_#07111A] text-center" role="status">
        <h1 className="font-headline-lg text-headline-lg text-primary leading-tight">
          Thank you{firstName ? `, ${firstName}` : ''}!
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-3">
          Your review is in. It was an honor being part of your day.
        </p>
        <p className="font-label-md text-label-md uppercase tracking-widest text-secondary mt-6">— Garrett</p>
      </div>
    )
  }

  const inputClass =
    'w-full bg-surface-container-lowest text-on-surface font-body-md text-[16px] p-3 border-2 border-on-surface-variant focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background'
  const labelClass = 'block font-label-md text-label-md uppercase tracking-wider text-primary mb-2'

  return (
    <form onSubmit={submit} noValidate>
      <h1 className="font-headline-lg text-headline-lg text-primary leading-tight">
        How did it go{firstName ? `, ${firstName}` : ''}?
      </h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 mb-8">
        A star rating and a sentence or two is all it takes.
      </p>

      {/* Rating */}
      <fieldset className="mb-8">
        <legend className={labelClass}>Your rating</legend>
        <div
          id="rating-group"
          role="radiogroup"
          aria-label="Star rating"
          tabIndex={-1}
          className="flex gap-1 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setRating((r) => Math.min(5, r + 1)) }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setRating((r) => Math.max(1, r - 1)) }
          }}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              tabIndex={rating === n || (rating === 0 && n === 1) ? 0 : -1}
              onClick={() => { setRating(n); setError('') }}
              className="w-12 h-12 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Star filled={n <= rating} />
            </button>
          ))}
        </div>
        <p className="font-body-md text-body-md text-primary mt-2 min-h-[1.5em]" aria-live="polite">
          {rating ? `${rating} of 5 — ${RATING_WORDS[rating]}` : ''}
        </p>
      </fieldset>

      {/* Testimonial */}
      <div className="mb-8">
        <label htmlFor="testimonial" className={labelClass}>
          A few words about your experience
        </label>
        <textarea
          id="testimonial"
          rows={5}
          value={testimonial}
          onChange={(e) => setTestimonial(e.target.value)}
          className={`${inputClass} resize-y`}
        />
      </div>

      {/* Permissions */}
      <fieldset className="mb-8 space-y-3">
        <legend className={labelClass}>Permissions</legend>
        {[
          { id: 'share', checked: shareOk, set: setShareOk, label: 'Pescadero Music can share my review on the website and social media.' },
          { id: 'photos', checked: photoOk, set: setPhotoOk, label: 'Pescadero Music can use photos from my event.' },
        ].map((c) => (
          <label key={c.id} htmlFor={c.id} className="flex items-start gap-3 cursor-pointer min-h-[44px]">
            <input
              id={c.id}
              type="checkbox"
              checked={c.checked}
              onChange={(e) => c.set(e.target.checked)}
              className="mt-0.5 w-6 h-6 shrink-0 accent-[#07111A] focus-visible:ring-2 focus-visible:ring-secondary"
            />
            <span className="font-body-md text-body-md text-on-surface">{c.label}</span>
          </label>
        ))}
      </fieldset>

      {/* Optional extras */}
      <details className="mb-8 bg-surface-container p-4 group">
        <summary className="cursor-pointer font-label-md text-label-md uppercase tracking-wider text-primary min-h-[44px] flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          More (optional): referrals &amp; feedback
        </summary>
        <div className="mt-4 space-y-5">
          <div>
            <label htmlFor="referral-name" className={labelClass}>Know someone planning an event?</label>
            <input id="referral-name" value={referralName} onChange={(e) => setReferralName(e.target.value)} className={inputClass} autoComplete="off" placeholder="Their name" />
          </div>
          <div>
            <label htmlFor="referral-phone" className={labelClass}>Their phone</label>
            <input id="referral-phone" type="tel" value={referralPhone} onChange={(e) => setReferralPhone(e.target.value)} className={inputClass} autoComplete="off" />
          </div>
          <div>
            <label htmlFor="feedback" className={labelClass}>Anything I could do better?</label>
            <textarea id="feedback" rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} className={`${inputClass} resize-y`} />
          </div>
        </div>
      </details>

      {error && (
        <p role="alert" className="mb-4 p-3 bg-secondary-fixed text-on-secondary-fixed font-body-md text-body-md border-l-4 border-secondary">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'saving'}
        className="w-full min-h-[52px] bg-secondary hover:bg-secondary-container text-on-secondary font-label-lg text-label-lg uppercase tracking-wider shadow-[4px_4px_0px_0px_#07111A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#07111A] transition-all disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {state === 'saving' ? 'Sending…' : 'Send my review'}
      </button>
    </form>
  )
}
