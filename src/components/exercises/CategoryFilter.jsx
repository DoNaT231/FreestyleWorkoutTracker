/**
 * Freestyle Workout Tracker – gyakorlat szűrő (mozgásminta)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Horizontálisan görgethető chip sor – gyakorlatlista szűréséhez.
 */

import { EXERCISE_CATEGORIES } from '../../constants/exerciseMeta'

/**
 * @param {object} props
 * @param {string|null} props.value – aktív szűrő (null = mind)
 * @param {(category: string|null) => void} props.onChange
 */
export default function CategoryFilter({ value, onChange }) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label="Szűrés mozgásminta szerint"
    >
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
          value === null
            ? 'bg-emerald-500 text-slate-950'
            : 'bg-slate-800 text-slate-400 hover:text-white'
        }`}
      >
        Mind
      </button>
      {EXERCISE_CATEGORIES.map(({ value: categoryValue, label }) => (
        <button
          key={categoryValue}
          type="button"
          onClick={() => onChange(categoryValue)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            value === categoryValue
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
