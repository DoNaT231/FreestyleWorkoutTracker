/**
 * Freestyle Workout Tracker – egyszerű testsúly trend (CSS oszlopok)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

/**
 * @param {object} props
 * @param {{ id: string, weightKg: number, recordedAt: string }[]} props.entries – desc sorrend
 */
export default function WeightTrendChart({ entries }) {
  const sorted = [...entries]
    .sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
    )
    .slice(-8)

  if (sorted.length < 2) return null

  const weights = sorted.map((e) => e.weightKg)
  const min = Math.min(...weights)
  const max = Math.max(...weights)
  const range = max - min || 1

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Trend (utolsó {sorted.length} mérés)
      </p>
      <div className="mt-4 flex h-28 items-end gap-1.5">
        {sorted.map((entry) => {
          const heightPct = ((entry.weightKg - min) / range) * 55 + 35

          return (
            <div
              key={entry.id}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
            >
              <span className="text-[10px] tabular-nums text-slate-400">
                {entry.weightKg}
              </span>
              <div
                className="w-full min-h-[4px] rounded-t-md bg-emerald-500/80"
                style={{ height: `${heightPct}%` }}
                title={`${entry.weightKg} kg`}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-slate-600">
        <span>{min} kg</span>
        <span>{max} kg</span>
      </div>
    </div>
  )
}
