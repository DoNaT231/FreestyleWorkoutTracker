/**
 * Freestyle Workout Tracker – görgethető számválasztó
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Mobil stílusú picker – ismétlésszám vagy idő (mp) kiválasztásához.
 */

import { useEffect, useRef } from 'react'

const ITEM_HEIGHT = 48

/**
 * @param {object} props
 * @param {number} props.value
 * @param {(n: number) => void} props.onChange
 * @param {number} [props.min=0]
 * @param {number} [props.max=50]
 * @param {string} [props.unitLabel] – pl. „ismétlés” vagy „mp”
 */
export default function ScrollNumberPicker({
  value,
  onChange,
  min = 0,
  max = 50,
  unitLabel = 'ismétlés',
}) {
  const listRef = useRef(null)
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  // Kezdeti görgetés a kiválasztott értékhez
  useEffect(() => {
    if (!listRef.current) return
    const index = value - min
    listRef.current.scrollTop = index * ITEM_HEIGHT
  }, [value, min])

  const handleScroll = () => {
    if (!listRef.current) return
    const index = Math.round(listRef.current.scrollTop / ITEM_HEIGHT)
    const clamped = Math.min(Math.max(index, 0), numbers.length - 1)
    const next = numbers[clamped]
    if (next !== value) onChange(next)
  }

  return (
    <div className="flex flex-col items-center">
      <p className="mb-2 text-sm text-slate-400">Mennyi sikerült?</p>
      <div className="relative h-[240px] w-full max-w-xs">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-12 -translate-y-1/2 rounded-xl border border-emerald-500/50 bg-emerald-500/10" />
        <ul
          ref={listRef}
          onScroll={handleScroll}
          className="h-full snap-y snap-mandatory overflow-y-auto scroll-smooth py-[96px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollPaddingTop: 96, scrollPaddingBottom: 96 }}
        >
          {numbers.map((num) => (
            <li
              key={num}
              className={`flex h-12 snap-center items-center justify-center text-2xl font-semibold transition-colors ${
                num === value ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              {num}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-2 text-xs text-slate-500">{unitLabel}</p>
    </div>
  )
}
