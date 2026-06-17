/**
 * Freestyle Workout Tracker – idősor lista (chart alternatíva)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { formatDateOnly } from '../../utils/formatDate'

/**
 * @param {object} props
 * @param {{ date: string, value: number, workoutName?: string }[]} props.points
 * @param {(value: number) => string} props.formatValue
 */
export default function TrendList({ points, formatValue }) {
  if (!points?.length) {
    return (
      <p className="text-sm text-slate-500">Nincs adat ebben az időszakban.</p>
    )
  }

  const values = points.map((p) => p.value)
  const max = Math.max(...values, 1)

  return (
    <ul className="mt-3 space-y-2">
      {points.map((point) => {
        const widthPct = (point.value / max) * 100

        return (
          <li key={`${point.date}-${point.value}`}>
            <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
              <span className="shrink-0">{formatDateOnly(point.date)}</span>
              <span className="font-medium tabular-nums text-slate-200">
                {formatValue(point.value)}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500/70"
                style={{ width: `${Math.max(widthPct, 4)}%` }}
              />
            </div>
            {point.workoutName && (
              <p className="mt-0.5 truncate text-[10px] text-slate-600">
                {point.workoutName}
              </p>
            )}
          </li>
        )
      })}
    </ul>
  )
}
