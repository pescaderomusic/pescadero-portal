import Link from 'next/link'

const steps = [
  { icon: 'description', text: 'Submit and track your inquiry in real time' },
  { icon: 'draw', text: 'Review, sign, and pay your contract securely' },
  { icon: 'music_note', text: 'Submit your event planning & music form' },
  { icon: 'credit_card', text: 'Make payments and view receipts' },
  { icon: 'event', text: 'Countdown to your event day' },
]

export default function GetStartedPage() {
  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased flex items-center justify-center px-6 py-space-xl">
      <div className="w-full max-w-md">
        <div className="text-center mb-space-lg">
          <span className="font-label-lg text-label-lg uppercase tracking-widest text-primary">Pescadero Music</span>
          <span className="block font-label-sm text-label-sm uppercase tracking-widest text-secondary mt-1">
            DJ &amp; Sound • Provo, Utah
          </span>
        </div>

        <div className="bg-surface-container-low shadow-[6px_6px_0px_0px_#07111A] p-space-lg">
          <Link
            href="/"
            className="inline-flex items-center gap-1 font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant no-underline hover:text-on-surface mb-space-md"
          >
            ← Back to Home
          </Link>

          <div className="w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center mb-space-md">
            <span className="material-symbols-outlined text-2xl">music_note</span>
          </div>

          <h1 className="font-headline-md text-headline-md text-primary mb-space-sm">Let's Book Your Date</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg leading-relaxed">
            Create a free account to submit your inquiry and track every step of your booking — from your
            consultation all the way to your event day.
          </p>

          <div className="flex flex-col gap-space-sm mb-space-lg">
            {steps.map((s) => (
              <div className="flex items-center gap-space-sm" key={s.text}>
                <span className="material-symbols-outlined text-secondary text-xl shrink-0">{s.icon}</span>
                <span className="font-body-sm text-body-sm text-on-surface">{s.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-space-sm">
            <Link
              href="/auth/signup"
              className="w-full text-center py-space-md bg-secondary hover:bg-secondary-container text-on-secondary no-underline font-label-md text-label-md uppercase tracking-wider shadow-[3px_3px_0px_0px_#07111A] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              Create Account →
            </Link>
            <Link
              href="/auth/login"
              className="w-full text-center py-space-md border border-primary/20 text-on-surface-variant no-underline font-label-md text-label-md uppercase tracking-wider hover:bg-surface-container transition-all"
            >
              Already have an account? Sign In
            </Link>
          </div>
        </div>

        <p className="text-center mt-space-md font-body-sm text-body-sm text-on-surface-variant">
          Questions?{' '}
          <a href="mailto:garrett@pescaderomusic.com" className="text-secondary no-underline hover:underline">
            garrett@pescaderomusic.com
          </a>
        </p>
      </div>
    </div>
  )
}
