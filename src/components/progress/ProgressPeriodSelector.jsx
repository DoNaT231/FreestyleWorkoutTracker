/**
 * Freestyle Workout Tracker – progress időszak választó
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { PROGRESS_PERIODS } from '../../utils/progress/periods'

export default function ProgressPeriodSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PROGRESS_PERIODS.map((period) => (
        <button
          key={period.id}
          type="button"
          onClick={() => onChange(period.id)}
          className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
            value === period.id
              ? 'bg-emerald-500 text-slate-950'
              : 'border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}
