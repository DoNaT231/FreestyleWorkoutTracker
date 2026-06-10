/**
 * Freestyle Workout Tracker – kategória edzésterhelés bontás
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { formatLoadScore } from '../../utils/trainingLoad'

/**
 * @param {object} props
 * @param {{ category: string, label: string, sets: number, reps: number, timeSeconds: number, loadScore: number }[]} props.items
 */
export default function CategoryLoadBreakdownList({ items }) {
  if (!items?.length) return null

  return (
    <ul className="space-y-2">
      {items.map(
        ({ category, label, sets, reps, timeSeconds, loadScore }) => (
          <li
            key={category}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-300">{label}</span>
              <span className="text-sm font-semibold tabular-nums text-emerald-400">
                {formatLoadScore(loadScore)}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {sets} szett
              {reps > 0 && ` · ${reps} ismétlés`}
              {timeSeconds > 0 && ` · ${timeSeconds} mp`}
            </p>
          </li>
        ),
      )}
    </ul>
  )
}
