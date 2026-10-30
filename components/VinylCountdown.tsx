'use client'

import { useState } from 'react'

/**
 * Interactive vinyl-record countdown dial. Click/tap spins the disc a notch —
 * a small nod to the litho-poster brand's record motif, not a real audio control.
 */
export default function VinylCountdown({
  days,
  caption = 'UNTIL YOUR DAY',
}: {
  days: number
  caption?: string
}) {
  const [rotation, setRotation] = useState(0)

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => setRotation((r) => r + 120)}
        aria-label="Spin the record"
        className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-[#07111A] shrink-0 cursor-pointer appearance-none border-0 p-0 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-transform duration-700 ease-out"
        style={{
          transform: `rotate(${rotation}deg)`,
          boxShadow:
            'inset 0 0 0 2px rgba(245,239,224,0.08), inset 0 0 0 9px rgba(0,0,0,0.75), inset 0 0 0 17px rgba(245,239,224,0.05), inset 0 0 0 28px rgba(0,0,0,0.85), inset 0 0 0 40px rgba(245,239,224,0.04), inset 0 0 0 52px rgba(0,0,0,0.9), 0 8px 24px rgba(0,0,0,0.45)',
        }}
      >
        {/* groove sheen */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

        {/* center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[64px] h-[64px] sm:w-[76px] sm:h-[76px] rounded-full bg-[#C8202A] flex flex-col items-center justify-center text-center shadow-inner">
            <span className="font-label-sm text-[8px] sm:text-[9px] leading-none tracking-widest uppercase text-[#F5EFE0]/80">
              SIDE A
            </span>
            <span className="font-display-xl text-2xl sm:text-3xl leading-none my-0.5 font-bold text-[#F5EFE0]">
              {days}
            </span>
            <span className="font-label-sm text-[7px] sm:text-[8px] leading-none tracking-widest uppercase text-[#F5EFE0]/90">
              DAYS
            </span>
            {/* spindle hole */}
            <div className="absolute w-2.5 h-2.5 rounded-full bg-[#F5EFE0] border-2 border-[#07111A]" />
          </div>
        </div>
      </button>
      <div className="mt-space-sm flex items-center gap-1.5 text-on-primary-container">
        <span className="material-symbols-outlined text-[14px]">touch_app</span>
        <span className="font-label-sm text-label-sm uppercase tracking-widest">{caption} • TAP TO SPIN</span>
      </div>
    </div>
  )
}
