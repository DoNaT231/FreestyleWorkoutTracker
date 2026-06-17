/**
 * Freestyle Workout Tracker – kategória edzésterhelés bontás
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { formatScorePoints } from '../../utils/scoring/format'

/**
 * @param {object} props
 * @param {{ category: string, label: string, sets: number, reps: number, timeSeconds: number, trainingLoadScore: number, holdScore?: number }[]} props.items
 */
export default function CategoryLoadBreakdownList({ items }) {
  if (!items?.length) return null

  return (
    <ul className="space-y-2">
      {items.map(
        ({
          category,
          label,
          sets,
          reps,
          timeSeconds,
          trainingLoadScore,
          holdScore,
        }) => (
          <li
            key={category}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-300">{label}</span>
              <span className="text-sm font-semibold tabular-nums text-emerald-400">
                {formatScorePoints(trainingLoadScore)}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {sets} szett
              {reps > 0 && ` · ${reps} ismétlés`}
              {timeSeconds > 0 && ` · ${timeSeconds} mp`}
              {(holdScore ?? 0) > 0 &&
                ` · tartás: ${formatScorePoints(holdScore)}`}
            </p>
          </li>
        ),
      )}
    </ul>
  )
}
